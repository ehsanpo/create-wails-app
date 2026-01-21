import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { addGoComment, addNpmDependencies, patchMainGo, mainGoContains } from './helpers.js';
import { readTemplate } from './template-reader.js';

export async function applySQLite(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding SQLite support...').start();
  
  try {
    const sqliteGoPath = join(config.projectPath, 'database.go');
    const sqliteGoCode = (await readTemplate('data-backend/database.go', config.wailsVersion))
      .replace(/{{PROJECT_NAME}}/g, config.projectName);

    await fse.writeFile(sqliteGoPath, sqliteGoCode);

    // Create schema file
    const dbDir = join(config.projectPath, 'db');
    await fse.ensureDir(dbDir);
    
    const schemaPath = join(dbDir, 'schema.sql');
    const schema = await readTemplate('data-backend/schema.sql', config.wailsVersion);
    
    await fse.writeFile(schemaPath, schema);

    // Add frontend example files
    const frontendDir = config.wailsVersion === 3 
      ? join(config.projectPath, 'frontend', 'src')
      : join(config.projectPath, 'frontend', 'src');
    
    if (await fse.pathExists(frontendDir)) {
      // Add helper functions file
      const exampleFile = config.features.typescript ? 'database-example.ts' : 'database-example.js';
      const examplePath = join(frontendDir, exampleFile);
      const exampleCode = await readTemplate(`data-backend/${exampleFile}`, config.wailsVersion);
      await fse.writeFile(examplePath, exampleCode);
      
      // Add DatabaseDemo component (React only for now)
      if (config.frontend === 'react') {
        const componentExt = config.features.typescript ? 'tsx' : 'jsx';
        const componentPath = join(frontendDir, `DatabaseDemo.${componentExt}`);
        const componentCode = await readTemplate(`data-backend/DatabaseDemo.${componentExt}`, config.wailsVersion);
        const updatedCode = componentCode.replace(/changeme/g, config.projectName);
        await fse.writeFile(componentPath, updatedCode);
        
        // Patch App file to import and use DatabaseDemo
        await patchAppFileForDatabase(config, frontendDir, componentExt);
      }
    }

    // Add Go dependency note
    const goModPath = join(config.projectPath, 'go.mod');
    if (await fse.pathExists(goModPath)) {
      const goModContent = await fse.readFile(goModPath, 'utf-8');
      if (!goModContent.includes('go-sqlite3')) {
        const note = `\n// For SQLite support, add:\n// github.com/mattn/go-sqlite3 v1.14.18\n`;
        await fse.appendFile(goModPath, note);
      }
    }

    // Patch main.go to initialize database
    const alreadyPatched = await mainGoContains(config.projectPath, 'InitDatabase');
    
    if (!alreadyPatched) {
      if (config.wailsVersion === 3) {
        // For v3, add after app creation and register service
        await patchMainGo(config.projectPath, 3, {
          afterAppCreation: `\t// Initialize database
\tif err := InitDatabase(); err != nil {
\t\tlog.Println("Failed to initialize database:", err)
\t}`,
          addService: '&DatabaseService{}',
        });
      } else {
        // For v2, we need to add it in the startup method of app.go
        const appGoPath = join(config.projectPath, 'app.go');
        if (await fse.pathExists(appGoPath)) {
          let appContent = await fse.readFile(appGoPath, 'utf-8');
          
          // Check if startup method exists and add InitDatabase call
          if (appContent.includes('func (a *App) startup(ctx context.Context)') && !appContent.includes('InitDatabase')) {
            appContent = appContent.replace(
              /(func \(a \*App\) startup\(ctx context\.Context\) \{\s*a\.ctx = ctx)/,
              '$1\n\ta.InitDatabase()'
            );
            await fse.writeFile(appGoPath, appContent);
          }
        }
      }
    }

    spinner.succeed('SQLite support added');
  } catch (error) {
    spinner.fail('Failed to add SQLite support');
    throw error;
  }
}

export async function applyEncryptedStorage(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding encrypted local storage...').start();
  
  try {
    const storageGoPath = join(config.projectPath, 'secure_storage.go');
    const storageGoCode = (await readTemplate('data-backend/secure_storage.go', config.wailsVersion))
      .replace(/{{PROJECT_NAME}}/g, config.projectName);

    await fse.writeFile(storageGoPath, storageGoCode);

    spinner.succeed('Encrypted storage added ');
  } catch (error) {
    spinner.fail('Failed to add encrypted storage');
    throw error;
  }
}

export async function applySupabase(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding Supabase integration...').start();
  
  try {
    // Create .env.example
    const envExamplePath = join(config.projectPath, '.env.example');
    const authComment = config.features.supabaseAuth ? '# Auth enabled\n' : '';
    const dbComment = config.features.supabaseDatabase ? '# Database enabled\n' : '';
    const storageComment = config.features.supabaseStorage ? '# Storage enabled\n' : '';
    const envContent = (await readTemplate('data-backend/env.example', config.wailsVersion))
      .replace(/{{AUTH_COMMENT}}/g, authComment)
      .replace(/{{DATABASE_COMMENT}}/g, dbComment)
      .replace(/{{STORAGE_COMMENT}}/g, storageComment);
    
    await fse.writeFile(envExamplePath, envContent);

    // Add Supabase client example
    const supabaseDir = join(config.projectPath, 'src', 'lib');
    await fse.ensureDir(supabaseDir);
    
    const ext = config.features.typescript ? 'ts' : 'js';
    const supabaseClientPath = join(supabaseDir, `supabase.${ext}`);
    const supabaseClient = await readTemplate(`data-backend/supabase.${ext}`, config.wailsVersion);
    
    await fse.writeFile(supabaseClientPath, supabaseClient);

    // Add npm dependency
    await addNpmDependencies(config.projectPath, {
      '@supabase/supabase-js': '^2.38.4',
    }, false);

    spinner.succeed('Supabase integration added');
  } catch (error) {
    spinner.fail('Failed to add Supabase integration');
    throw error;
  }
}

/**
 * Patches the App component file to import and render DatabaseDemo
 */
async function patchAppFileForDatabase(
  config: GeneratorConfig,
  frontendDir: string,
  componentExt: string
): Promise<void> {
  const appFilePath = join(frontendDir, `App.${componentExt}`);
  
  if (!(await fse.pathExists(appFilePath))) {
    return; // App file doesn't exist, skip patching
  }
  
  let appContent = await fse.readFile(appFilePath, 'utf-8');
  
  // Check if already patched
  if (appContent.includes('DatabaseDemo')) {
    return;
  }
  
  // Add import statement after other imports
  const importStatement = `import DatabaseDemo from './DatabaseDemo';\n`;
  
  // Find the last import statement
  const lastImportMatch = appContent.match(/import .* from .*;\n/g);
  if (lastImportMatch) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    appContent = appContent.replace(lastImport, lastImport + importStatement);
  }
  
  // Add DatabaseDemo component before the closing div of the container
  // Look for common patterns in App files
  const patterns = [
    // Pattern 1: Before </div> that closes main container
    {
      search: /(\s*<\/div>\s*\)\s*}\s*export default App)/,
      replace: `      <DatabaseDemo />\n$1`
    },
    // Pattern 2: Before closing return statement
    {
      search: /(\s*<\/div>\s*\)\s*;?\s*}\s*function App)/,
      replace: `      <DatabaseDemo />\n$1`
    },
    // Pattern 3: Generic - before last </div> in return
    {
      search: /(\s*<\/div>\s*$)/m,
      replace: `      <DatabaseDemo />\n$1`
    }
  ];
  
  for (const pattern of patterns) {
    if (pattern.search.test(appContent)) {
      appContent = appContent.replace(pattern.search, pattern.replace);
      break;
    }
  }
  
  await fse.writeFile(appFilePath, appContent);
}



