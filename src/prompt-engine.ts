import inquirer from 'inquirer';
import type { AllAnswers } from './types.js';

export class PromptEngine {
  async collect(): Promise<AllAnswers> {
    const projectAnswers = await this.promptProjectBasics();
    const wailsVersion = await this.promptWailsVersion();
    const frontend = await this.promptFrontend(wailsVersion.wailsVersion);
    const frontendExtras = await this.promptFrontendExtras();
    const appFeatures = await this.promptAppFeatures(wailsVersion.wailsVersion);
    const dataBackend = await this.promptDataBackend();
    const testing = await this.promptTesting();

    // Show summary and confirm
    const confirmed = await this.promptConfirmation({
      ...projectAnswers,
      ...wailsVersion,
      ...frontend,
      ...frontendExtras,
      ...appFeatures,
      ...dataBackend,
      ...testing,
    });

    return {
      ...projectAnswers,
      ...wailsVersion,
      ...frontend,
      ...frontendExtras,
      ...appFeatures,
      ...dataBackend,
      ...testing,
      confirmed,
    };
  }

  private async promptProjectBasics() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        default: 'my-wails-app',
        validate: (input: string) => {
          if (!input || input.trim() === '') {
            return 'Project name cannot be empty';
          }
          if (!/^[a-z0-9-_]+$/i.test(input)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'outputDir',
        message: 'Output directory (leave empty for current directory):',
        default: '',
      },
    ]);
  }

  private async promptWailsVersion() {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'wailsVersion',
        message: 'Which Wails version do you want to use?',
        choices: [
          { name: 'Wails 2 (stable)', value: 2 },
          { name: 'Wails 3 (experimental)', value: 3 },
        ],
        default: 2,
      },
    ]);
  }

  private async promptFrontend(wailsVersion: 2 | 3) {
    const choices = [
      { name: 'React', value: 'react' },
      { name: 'Vue', value: 'vue' },
      { name: 'Svelte', value: 'svelte' },
      { name: 'Solid', value: 'solid' },
      { name: 'Vanilla', value: 'vanilla' },
    ];

    return inquirer.prompt([
      {
        type: 'list',
        name: 'frontend',
        message: 'Choose your frontend framework:',
        choices,
        default: 'react',
      },
    ]);
  }

  private async promptFrontendExtras() {
    return inquirer.prompt([
      {
        type: 'checkbox',
        name: 'frontendExtras',
        message: 'Select frontend extras:',
        choices: [
          { name: 'TypeScript', value: 'typescript', checked: true },
          { name: 'Tailwind CSS', value: 'tailwind' },
          { name: 'Router', value: 'router' },
          { name: 'ESLint + Prettier', value: 'eslint-prettier' },
          { name: 'GitHub Actions (CI)', value: 'github-actions' },
        ],
      },
    ]);
  }

  private async promptAppFeatures(wailsVersion: 2 | 3) {
    const choices = [
      { name: 'Single instance lock', value: 'single-instance' },
      { name: 'Auto update (GitHub Releases)', value: 'auto-update' },
      { name: 'Native dialogs', value: 'native-dialogs' },
      { name: 'App config / settings store', value: 'app-config' },
      { name: 'Deep linking (custom protocol)', value: 'deep-linking' },
      { name: 'Startup / auto-launch', value: 'startup' },
      { name: 'Clipboard utilities', value: 'clipboard' },
      { name: 'File system watcher', value: 'file-watcher' },
    ];

    // System tray is only available in Wails v3
    if (wailsVersion === 3) {
      choices.splice(1, 0, { name: 'System tray', value: 'system-tray' });
    }

    return inquirer.prompt([
      {
        type: 'checkbox',
        name: 'appFeatures',
        message: 'Select app features:',
        choices,
      },
    ]);
  }

  private async promptDataBackend() {
    const { dataBackend } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'dataBackend',
        message: 'Select data & backend options:',
        choices: [
          { name: 'SQLite (local-first)', value: 'sqlite' },
          { name: 'Encrypted local storage', value: 'encrypted-storage' },
          { name: 'Supabase integration', value: 'supabase' },
        ],
      },
    ]);

    let supabaseOptions: ('auth' | 'database' | 'storage')[] | undefined;

    if (dataBackend.includes('supabase')) {
      const supabaseAnswer = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'supabaseOptions',
          message: 'Select Supabase features:',
          choices: [
            { name: 'Auth', value: 'auth', checked: true },
            { name: 'Database', value: 'database' },
            { name: 'Storage', value: 'storage' },
          ],
        },
      ]);
      supabaseOptions = supabaseAnswer.supabaseOptions;
    }

    return { dataBackend, supabaseOptions };
  }

  private async promptTesting() {
    const { enableTesting } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enableTesting',
        message: 'Do you want testing set up?',
        default: false,
      },
    ]);

    let testingFrameworks: string[] | undefined;

    if (enableTesting) {
      const testAnswer = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'testingFrameworks',
          message: 'Select testing options:',
          choices: [
            { name: 'Frontend unit testing (Vitest)', value: 'frontend-unit' },
            { name: 'Frontend E2E testing (Playwright)', value: 'frontend-e2e' },
            { name: 'Go backend tests', value: 'backend' },
          ],
        },
      ]);
      testingFrameworks = testAnswer.testingFrameworks;
    }

    return { enableTesting, testingFrameworks };
  }

  private async promptConfirmation(answers: Partial<AllAnswers>) {
    console.log('\n📋 Summary of your selections:\n');
    console.log(`Project Name: ${answers.projectName}`);
    console.log(`Wails Version: ${answers.wailsVersion}`);
    console.log(`Frontend: ${answers.frontend}`);
    
    if (answers.frontendExtras && answers.frontendExtras.length > 0) {
      console.log(`Frontend Extras: ${answers.frontendExtras.join(', ')}`);
    }
    
    if (answers.appFeatures && answers.appFeatures.length > 0) {
      console.log(`App Features: ${answers.appFeatures.join(', ')}`);
    }
    
    if (answers.dataBackend && answers.dataBackend.length > 0) {
      console.log(`Data & Backend: ${answers.dataBackend.join(', ')}`);
      if (answers.supabaseOptions && answers.supabaseOptions.length > 0) {
        console.log(`  └─ Supabase: ${answers.supabaseOptions.join(', ')}`);
      }
    }
    
    if (answers.enableTesting && answers.testingFrameworks && answers.testingFrameworks.length > 0) {
      console.log(`Testing: ${answers.testingFrameworks.join(', ')}`);
    }

    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: '\nProceed with these settings?',
        default: true,
      },
    ]);

    return confirmed;
  }
}
