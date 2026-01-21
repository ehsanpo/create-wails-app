import fse from 'fs-extra';
import { join } from 'path';

export async function addNpmDependencies(
  projectPath: string,
  dependencies: Record<string, string>,
  isDev: boolean
): Promise<void> {
  // In Wails v3, package.json is in frontend/ directory
  // In Wails v2, package.json is in the root
  // Try frontend/ first, then fall back to root
  let packageJsonPath = join(projectPath, 'frontend', 'package.json');
  
  if (!(await fse.pathExists(packageJsonPath))) {
    packageJsonPath = join(projectPath, 'package.json');
  }
  
  if (!(await fse.pathExists(packageJsonPath))) {
    return;
  }

  const packageJson = await fse.readJson(packageJsonPath);
  const depKey = isDev ? 'devDependencies' : 'dependencies';
  
  packageJson[depKey] = {
    ...packageJson[depKey],
    ...dependencies,
  };

  await fse.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

export async function addGoComment(projectPath: string, comment: string): Promise<void> {
  const appGoPath = join(projectPath, 'app.go');
  
  if (await fse.pathExists(appGoPath)) {
    let content = await fse.readFile(appGoPath, 'utf-8');
    content += `\n${comment}`;
    await fse.writeFile(appGoPath, content);
  }
}

/**
 * Patches main.go to add code in specific locations
 * Supports both Wails v2 and v3 with intelligent insertion points
 * 
 * @param projectPath - Absolute path to the project
 * @param wailsVersion - Wails version (2 or 3)
 * @param options - Insertion options
 * @param options.afterAppCreation - Code to insert after app creation (v3 only: after application.New())
 * @param options.beforeRun - Code to insert before app.Run() (v3) or wails.Run() (v2)
 * 
 * @example
 * // Wails v3: Add system tray initialization
 * await patchMainGo(projectPath, 3, {
 *   afterAppCreation: '\t// Create system tray\n\tsystray := app.SystemTray.New()'
 * });
 * 
 * @example
 * // Wails v2: Add single instance lock
 * await patchMainGo(projectPath, 2, {
 *   beforeRun: '\t// Check single instance\n\tif err := app.initSingleInstance(); err != nil {\n\t\tos.Exit(1)\n\t}'
 * });
 */
export async function patchMainGo(
  projectPath: string,
  wailsVersion: 2 | 3,
  options: {
    afterAppCreation?: string;
    beforeRun?: string;
    addService?: string;
  }
): Promise<void> {
  const mainGoPath = join(projectPath, 'main.go');
  
  if (!(await fse.pathExists(mainGoPath))) {
    throw new Error('main.go not found');
  }

  let content = await fse.readFile(mainGoPath, 'utf-8');

  if (wailsVersion === 3) {
    // Wails v3 uses application.New()
    
    // Add service to Services array
    if (options.addService) {
      // Find Services array with proper brace matching
      const servicesStart = content.indexOf('Services: []application.Service{');
      
      if (servicesStart !== -1) {
        // Start after the opening brace
        let pos = servicesStart + 'Services: []application.Service{'.length;
        let depth = 1;
        let startPos = pos;
        
        // Find the matching closing brace
        while (pos < content.length && depth > 0) {
          if (content[pos] === '{') depth++;
          else if (content[pos] === '}') depth--;
          pos++;
        }
        
        if (depth === 0) {
          // Extract existing services content
          const existingServices = content.substring(startPos, pos - 1).trim();
          
          if (existingServices && !existingServices.includes(options.addService)) {
            // Add to existing services - preserve existing formatting
            // Remove any trailing comma to avoid double commas
            const cleanedServices = existingServices.replace(/,\s*$/, '');
            const newServices = `Services: []application.Service{${cleanedServices},\n\t\t\tapplication.NewService(${options.addService}),\n\t\t}`;
            const oldServices = content.substring(servicesStart, pos);
            content = content.replace(oldServices, newServices);
          } else if (!existingServices) {
            // First service
            const newServices = `Services: []application.Service{\n\t\t\tapplication.NewService(${options.addService}),\n\t\t}`;
            const oldServices = content.substring(servicesStart, pos);
            content = content.replace(oldServices, newServices);
          }
        }
      }
    }
    
    // Add code after app := application.New(...)
    if (options.afterAppCreation) {
      // Find the application.New() call and properly match nested braces
      const appCreationStart = content.indexOf('app := application.New(');
      
      if (appCreationStart !== -1) {
        // Start from the opening parenthesis
        let pos = appCreationStart + 'app := application.New('.length;
        let depth = 1;
        
        // Find the matching closing parenthesis
        while (pos < content.length && depth > 0) {
          if (content[pos] === '(') depth++;
          else if (content[pos] === ')') depth--;
          pos++;
        }
        
        // Insert after the closing parenthesis
        if (depth === 0) {
          content = content.slice(0, pos) + '\n\n' + options.afterAppCreation + content.slice(pos);
        }
      }
    }

    // Add code before app.Run()
    if (options.beforeRun) {
      const runPattern = /err\s*:?=\s*app\.Run\(\)/;
      const match = content.match(runPattern);
      
      if (match) {
        const insertPos = match.index!;
        content = content.slice(0, insertPos) + options.beforeRun + '\n\n\t' + content.slice(insertPos);
      }
    }
  } else {
    // Wails v2 uses wails.Run(&options.App{...})
    // Add code before wails.Run()
    if (options.beforeRun) {
      const runPattern = /err\s*:?=\s*wails\.Run\(/;
      const match = content.match(runPattern);
      
      if (match) {
        const insertPos = match.index!;
        content = content.slice(0, insertPos) + options.beforeRun + '\n\n\t' + content.slice(insertPos);
      }
    }
  }

  await fse.writeFile(mainGoPath, content);
}

/**
 * Checks if main.go already contains a specific code pattern
 * Useful for preventing duplicate patches
 * 
 * @param projectPath - Absolute path to the project
 * @param pattern - String or RegExp to search for in main.go
 * @returns true if pattern is found, false otherwise
 * 
 * @example
 * if (await mainGoContains(projectPath, 'SystemTray.New()')) {
 *   console.log('System tray already initialized');
 * }
 */
export async function mainGoContains(projectPath: string, pattern: string | RegExp): Promise<boolean> {
  const mainGoPath = join(projectPath, 'main.go');
  
  if (!(await fse.pathExists(mainGoPath))) {
    return false;
  }

  const content = await fse.readFile(mainGoPath, 'utf-8');
  
  if (typeof pattern === 'string') {
    return content.includes(pattern);
  } else {
    return pattern.test(content);
  }
}
