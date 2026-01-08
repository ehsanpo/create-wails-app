import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { readTemplate } from './template-reader.js';

export async function applySystemTray(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding system tray support...').start();
  
  try {
    // Create system tray Go file
    const trayGoPath = join(config.projectPath, 'systray.go');
    const trayGoContent = await readTemplate('system-tray/systray.go', config.wailsVersion);
    await fse.writeFile(trayGoPath, trayGoContent);

    spinner.succeed('System tray support added - check systray.go for usage');
  } catch (error) {
    spinner.fail('Failed to add system tray support');
    throw error;
  }
}
