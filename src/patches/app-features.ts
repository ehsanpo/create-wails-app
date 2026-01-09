import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { readTemplate } from './template-reader.js';
import { patchMainGo, mainGoContains } from './helpers.js';

export async function applySingleInstance(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding single instance lock...').start();
  
  try {
    const singleInstancePath = join(config.projectPath, 'singleinstance.go');
    const singleInstanceCode = (await readTemplate('app-features/singleinstance.go', config.wailsVersion))
      .replace(/{{PROJECT_NAME}}/g, config.projectName);
    
    await fse.writeFile(singleInstancePath, singleInstanceCode);

    // Patch main.go to initialize single instance lock
    const alreadyPatched = await mainGoContains(config.projectPath, 'initSingleInstance');
    
    if (!alreadyPatched) {
      if (config.wailsVersion === 3) {
        // First, add necessary imports to main.go
        const mainGoPath = join(config.projectPath, 'main.go');
        let content = await fse.readFile(mainGoPath, 'utf-8');
        
        // Add fmt import if not present
        if (!content.includes('"fmt"')) {
          content = content.replace(
            /import \(\s*\n/,
            'import (\n\t"fmt"\n'
          );
        }
        
        // Add os import if not present
        if (!content.includes('"os"')) {
          content = content.replace(
            /import \(\s*\n/,
            'import (\n\t"os"\n'
          );
        }
        
        await fse.writeFile(mainGoPath, content);
        
        // For v3, add before app.Run()
        await patchMainGo(config.projectPath, 3, {
          beforeRun: `\t// Initialize single instance lock
\tif err := initSingleInstance(); err != nil {
\t\tfmt.Println(err)
\t\tos.Exit(1)
\t}
\tdefer releaseSingleInstance()`,
        });
      } else {
        // For v2, add in main() before wails.Run
        await patchMainGo(config.projectPath, 2, {
          beforeRun: `\t// Initialize single instance lock
\tif err := app.initSingleInstance(); err != nil {
\t\tfmt.Println(err)
\t\tos.Exit(1)
\t}
\tdefer app.releaseSingleInstance()`,
        });
      }
    }

    spinner.succeed('Single instance lock added');
  } catch (error) {
    spinner.fail('Failed to add single instance lock');
    throw error;
  }
}

export async function applyAutoUpdate(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding auto-update support...').start();
  
  try {
    const updateGoPath = join(config.projectPath, 'autoupdate.go');
    const updateGoCode = await readTemplate('app-features/autoupdate.go', config.wailsVersion);

    await fse.writeFile(updateGoPath, updateGoCode);

    // Create frontend helper
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const updateHelperPath = join(frontendExampleDir, `update-helper.${ext}`);
    const updateHelperCode = await readTemplate(`app-features/update-helper.${ext}`, config.wailsVersion);

    await fse.writeFile(updateHelperPath, updateHelperCode);

    spinner.succeed('Auto-update support added ');
  } catch (error) {
    spinner.fail('Failed to add auto-update support');
    throw error;
  }
}

export async function applyNativeDialogs(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding native dialogs...').start();
  
  try {
    const dialogsPath = join(config.projectPath, 'dialogs.go');
    const dialogsCode = await readTemplate('app-features/dialogs.go', config.wailsVersion);

    await fse.writeFile(dialogsPath, dialogsCode);

    // Create example frontend code
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const examplePath = join(frontendExampleDir, `dialogs-example.${ext}`);
    const exampleCode = await readTemplate(`app-features/dialogs-example.${ext}`, config.wailsVersion);

    await fse.writeFile(examplePath, exampleCode);

    spinner.succeed('Native dialogs added ');
  } catch (error) {
    spinner.fail('Failed to add native dialogs');
    throw error;
  }
}

export async function applyAppConfig(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding app config/settings store...').start();
  
  try {
    const configGoPath = join(config.projectPath, 'config.go');
    const configGoCode = (await readTemplate('app-features/config.go', config.wailsVersion))
      .replace(/{{PROJECT_NAME}}/g, config.projectName);

    await fse.writeFile(configGoPath, configGoCode);

    // Create frontend helper
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const configHelperPath = join(frontendExampleDir, `config-helper.${ext}`);
    const configHelperCode = await readTemplate(`app-features/config-helper.${ext}`, config.wailsVersion);

    await fse.writeFile(configHelperPath, configHelperCode);

    spinner.succeed('App config/settings store added ');
  } catch (error) {
    spinner.fail('Failed to add app config');
    throw error;
  }
}

export async function applyDeepLinking(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding deep linking support...').start();
  
  try {
    const deeplinkGoPath = join(config.projectPath, 'deeplink.go');
    const deeplinkGoCode = (await readTemplate('app-features/deeplink.go', config.wailsVersion))
      .replace(/{{PROJECT_NAME_LOWER}}/g, config.projectName.toLowerCase());

    await fse.writeFile(deeplinkGoPath, deeplinkGoCode);

    spinner.succeed('Deep linking support added ');
  } catch (error) {
    spinner.fail('Failed to add deep linking');
    throw error;
  }
}

export async function applyStartup(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding startup/auto-launch support...').start();
  
  try {
    const startupGoPath = join(config.projectPath, 'startup.go');
    const startupGoCode = (await readTemplate('app-features/startup.go', config.wailsVersion))
      .replace(/{{PROJECT_NAME}}/g, config.projectName);

    await fse.writeFile(startupGoPath, startupGoCode);

    spinner.succeed('Startup/auto-launch support added ');
  } catch (error) {
    spinner.fail('Failed to add startup support');
    throw error;
  }
}

export async function applyClipboard(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding clipboard utilities...').start();
  
  try {
    const clipboardPath = join(config.projectPath, 'clipboard.go');
    const clipboardCode = await readTemplate('app-features/clipboard.go', config.wailsVersion);

    await fse.writeFile(clipboardPath, clipboardCode);

    // Create frontend example
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const examplePath = join(frontendExampleDir, `clipboard-example.${ext}`);
    const exampleCode = await readTemplate(`app-features/clipboard-example.${ext}`, config.wailsVersion);

    await fse.writeFile(examplePath, exampleCode);
    
    spinner.succeed('Clipboard utilities added with examples');
  } catch (error) {
    spinner.fail('Failed to add clipboard utilities');
    throw error;
  }
}

export async function applyFileWatcher(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding file system watcher...').start();
  
  try {
    const watcherGoPath = join(config.projectPath, 'filewatcher.go');
    const watcherGoCode = await readTemplate('app-features/filewatcher.go', config.wailsVersion);

    await fse.writeFile(watcherGoPath, watcherGoCode);

    // Add Go dependency note
    const goModPath = join(config.projectPath, 'go.mod');
    if (await fse.pathExists(goModPath)) {
      const goModContent = await fse.readFile(goModPath, 'utf-8');
      if (!goModContent.includes('fsnotify')) {
        const note = `\n// For production file watching, add:\n// github.com/fsnotify/fsnotify v1.7.0\n`;
        await fse.appendFile(goModPath, note);
      }
    }

    // Create frontend helper
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const watcherHelperPath = join(frontendExampleDir, `filewatcher-helper.${ext}`);
    const watcherHelperCode = await readTemplate(`app-features/filewatcher-helper.${ext}`, config.wailsVersion);

    await fse.writeFile(watcherHelperPath, watcherHelperCode);

    spinner.succeed('File system watcher added ');
  } catch (error) {
    spinner.fail('Failed to add file system watcher');
    throw error;
  }
}



