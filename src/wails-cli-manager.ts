import { execa } from 'execa';
import { which } from './utils.js';

export class WailsCLIManager {
  async detect(version: 2 | 3): Promise<{ installed: boolean; version?: string; path?: string }> {
    const command = version === 3 ? 'wails3' : 'wails';
    
    try {
      const path = await which(command);
      if (!path) {
        return { installed: false };
      }

      const { stdout } = await execa(command, ['version']);
      return {
        installed: true,
        version: stdout.trim(),
        path,
      };
    } catch (error) {
      return { installed: false };
    }
  }

  async promptInstallation(version: 2 | 3): Promise<boolean> {
    const inquirer = (await import('inquirer')).default;
    
    const versionStr = version === 3 ? 'Wails v3' : 'Wails v2';
    const { shouldInstall } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldInstall',
        message: `The required ${versionStr} CLI is not installed or is the wrong version.\nDo you want to install it now?`,
        default: true,
      },
    ]);

    return shouldInstall;
  }

  async install(version: 2 | 3): Promise<{ success: boolean; error?: string }> {
    try {
      const command = this.getInstallCommand(version);
      
      console.log(`\nInstalling Wails ${version} CLI...`);
      console.log(`Running: ${command}\n`);

      await execa('go', command.split(' ').slice(1), {
        stdio: 'inherit',
      });

      // Verify installation
      const detection = await this.detect(version);
      
      if (!detection.installed) {
        return {
          success: false,
          error: 'Installation completed but CLI is still not available. You may need to add Go bin to your PATH.',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during installation',
      };
    }
  }

  private getInstallCommand(version: 2 | 3): string {
    if (version === 3) {
      return 'go install github.com/wailsapp/wails/v3/cmd/wails3@latest';
    }
    return 'go install github.com/wailsapp/wails/v2/cmd/wails@latest';
  }

  getManualInstallInstructions(version: 2 | 3): string {
    const command = this.getInstallCommand(version);
    return `
To manually install Wails ${version} CLI, run:

  ${command}

Make sure you have Go installed and GOPATH/bin is in your PATH.

For more information, visit:
  https://wails.io/docs/gettingstarted/installation
`;
  }
}
