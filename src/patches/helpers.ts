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
  }
): Promise<void> {
  const mainGoPath = join(projectPath, 'main.go');
  
  if (!(await fse.pathExists(mainGoPath))) {
    throw new Error('main.go not found');
  }

  let content = await fse.readFile(mainGoPath, 'utf-8');

  if (wailsVersion === 3) {
    // Wails v3 uses application.New()
    // Add code after app := application.New(...)
    if (options.afterAppCreation) {
      const appCreationPattern = /app\s*:=\s*application\.New\([^)]*\{[^}]*\}\s*\)/s;
      const match = content.match(appCreationPattern);
      
      if (match) {
        const insertPos = match.index! + match[0].length;
        content = content.slice(0, insertPos) + '\n\n' + options.afterAppCreation + content.slice(insertPos);
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
