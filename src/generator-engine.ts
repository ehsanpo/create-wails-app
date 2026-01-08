import { execa } from 'execa';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from './types.js';
import { FeaturePatcher } from './feature-patcher.js';
import ora from 'ora';

export class GeneratorEngine {
  private patcher: FeaturePatcher;

  constructor() {
    this.patcher = new FeaturePatcher();
  }

  async generate(config: GeneratorConfig): Promise<void> {
    // Step 1: Check if directory exists
    await this.checkDirectory(config.projectPath);

    // Step 2: Initialize with Wails CLI
    await this.initializeWailsProject(config);

    // Step 3: Apply feature patches
    await this.applyFeatures(config);

    // Step 4: Install dependencies
    await this.installDependencies(config);
  }

  private async checkDirectory(path: string): Promise<void> {
    if (existsSync(path)) {
      throw new Error(
        `Directory ${path} already exists. Please choose a different project name or remove the existing directory.`
      );
    }
  }

  private async initializeWailsProject(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Initializing Wails project...').start();

    try {
      const args = [
        'init',
        '-n', config.projectName,
        '-t', this.getTemplateArg(config),
      ];

      // Create parent directory if needed
      const parentDir = join(config.projectPath, '..');
      await fse.ensureDir(parentDir);

      await execa(config.wailsCLI, args, {
        cwd: parentDir,
        stdio: 'inherit',
      });

      spinner.succeed('Wails project initialized');
    } catch (error) {
      spinner.fail('Failed to initialize Wails project');
      throw error;
    }
  }

  private getTemplateArg(config: GeneratorConfig): string {
    // For Wails v2, use template URL if available
    // For Wails v3, use built-in templates
    if (config.wailsVersion === 3) {
      return config.frontend;
    }

    // For Wails v2, if template is "default", don't specify template (use built-in)
    if (config.template.url === 'default') {
      return config.frontend;
    }

    return config.template.url;
  }

  private async applyFeatures(config: GeneratorConfig): Promise<void> {
    const features = config.features;

    // TypeScript
    if (features.typescript && !config.template.hasTypeScript) {
      await this.patcher.applyTypeScript(config);
    }

    // Tailwind CSS
    if (features.tailwind) {
      await this.patcher.applyTailwind(config);
    }

    // Router
    if (features.router) {
      await this.patcher.applyRouter(config);
    }

    // ESLint + Prettier
    if (features.eslintPrettier) {
      await this.patcher.applyESLintPrettier(config);
    }

    // GitHub Actions
    if (features.githubActions) {
      await this.patcher.applyGitHubActions(config);
    }

    // App Features
    if (features.systemTray) {
      await this.patcher.applySystemTray(config);
    }

    if (features.singleInstance) {
      await this.patcher.applySingleInstance(config);
    }

    if (features.autoUpdate) {
      await this.patcher.applyAutoUpdate(config);
    }

    if (features.nativeDialogs) {
      await this.patcher.applyNativeDialogs(config);
    }

    if (features.appConfig) {
      await this.patcher.applyAppConfig(config);
    }

    if (features.deepLinking) {
      await this.patcher.applyDeepLinking(config);
    }

    if (features.startup) {
      await this.patcher.applyStartup(config);
    }

    if (features.clipboard) {
      await this.patcher.applyClipboard(config);
    }

    if (features.fileWatcher) {
      await this.patcher.applyFileWatcher(config);
    }

    // Data & Backend
    if (features.sqlite) {
      await this.patcher.applySQLite(config);
    }

    if (features.encryptedStorage) {
      await this.patcher.applyEncryptedStorage(config);
    }

    if (features.supabase) {
      await this.patcher.applySupabase(config);
    }

    // Testing
    if (features.testingFrontendUnit) {
      await this.patcher.applyFrontendUnitTesting(config);
    }

    if (features.testingFrontendE2E) {
      await this.patcher.applyFrontendE2ETesting(config);
    }

    if (features.testingBackend) {
      await this.patcher.applyBackendTesting(config);
    }
  }

  private async installDependencies(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Installing dependencies...').start();

    try {
      // Check if package.json exists (frontend dependencies)
      const packageJsonPath = join(config.projectPath, 'package.json');
      
      if (existsSync(packageJsonPath)) {
        spinner.text = 'Installing frontend dependencies...';
        await execa('npm', ['install'], {
          cwd: config.projectPath,
          stdio: 'inherit',
        });
      }

      // Go dependencies are handled by Wails build
      spinner.succeed('Dependencies installed');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      throw error;
    }
  }
}
