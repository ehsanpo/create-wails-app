import type { AllAnswers, GeneratorConfig, TemplateInfo } from './types.js';
import { join } from 'path';
import { cwd } from 'process';

export class DecisionMapper {
  map(answers: AllAnswers): GeneratorConfig {
    const projectPath = this.resolveProjectPath(answers);
    const wailsCLI = answers.wailsVersion === 3 ? 'wails3' : 'wails';
    const template = this.selectTemplate(answers);

    return {
      projectName: answers.projectName,
      projectPath,
      wailsVersion: answers.wailsVersion,
      wailsCLI,
      frontend: answers.frontend,
      template,
      patches: [],
      features: {
        typescript: answers.frontendExtras?.includes('typescript') ?? false,
        tailwind: answers.frontendExtras?.includes('tailwind') ?? false,
        router: answers.frontendExtras?.includes('router') ?? false,
        eslintPrettier: answers.frontendExtras?.includes('eslint-prettier') ?? false,
        githubActions: answers.frontendExtras?.includes('github-actions') ?? false,
        singleInstance: answers.appFeatures?.includes('single-instance') ?? false,
        systemTray: answers.appFeatures?.includes('system-tray') ?? false,
        autoUpdate: answers.appFeatures?.includes('auto-update') ?? false,
        nativeDialogs: answers.appFeatures?.includes('native-dialogs') ?? false,
        appConfig: answers.appFeatures?.includes('app-config') ?? false,
        deepLinking: answers.appFeatures?.includes('deep-linking') ?? false,
        startup: answers.appFeatures?.includes('startup') ?? false,
        clipboard: answers.appFeatures?.includes('clipboard') ?? false,
        fileWatcher: answers.appFeatures?.includes('file-watcher') ?? false,
        sqlite: answers.dataBackend?.includes('sqlite') ?? false,
        encryptedStorage: answers.dataBackend?.includes('encrypted-storage') ?? false,
        supabase: answers.dataBackend?.includes('supabase') ?? false,
        supabaseAuth: answers.supabaseOptions?.includes('auth') ?? false,
        supabaseDatabase: answers.supabaseOptions?.includes('database') ?? false,
        supabaseStorage: answers.supabaseOptions?.includes('storage') ?? false,
        testingFrontendUnit: answers.testingFrameworks?.includes('frontend-unit') ?? false,
        testingFrontendE2E: answers.testingFrameworks?.includes('frontend-e2e') ?? false,
        testingBackend: answers.testingFrameworks?.includes('backend') ?? false,
      },
    };
  }

  private resolveProjectPath(answers: AllAnswers): string {
    const base = answers.outputDir?.trim() || cwd();
    return join(base, answers.projectName);
  }

  private selectTemplate(answers: AllAnswers): TemplateInfo {
    const templates = this.getTemplateMap();
    const key = `${answers.frontend}-${answers.wailsVersion}`;
    
    const template = templates.get(key);
    
    if (!template) {
      // Fallback to vanilla template
      return {
        url: answers.wailsVersion === 3 
          ? 'https://github.com/wailsapp/wails3-template-vanilla'
          : 'https://github.com/wailsapp/wails-template-vanilla',
        name: 'vanilla',
        wailsVersion: answers.wailsVersion,
        frontend: 'vanilla',
      };
    }

    return template;
  }

  private getTemplateMap(): Map<string, TemplateInfo> {
    const templates = new Map<string, TemplateInfo>();

    // React templates (Wails v2)
    templates.set('react-2', {
      url: 'https://github.com/wailsapp/wails-vite-react-ts-tailwind-template',
      name: 'react-vite-ts-tailwind',
      wailsVersion: 2,
      frontend: 'react',
      hasTypeScript: true,
    });

    // Vue templates (Wails v2)
    templates.set('vue-2', {
      url: 'https://github.com/misitebao/wails-template-vue',
      name: 'vue-ts-tailwind',
      wailsVersion: 2,
      frontend: 'vue',
      hasTypeScript: true,
    });

    // Svelte templates (Wails v2)
    templates.set('svelte-2', {
      url: 'https://github.com/BillBuilt/wails-vite-svelte-tailwind-template',
      name: 'svelte-vite-tailwind',
      wailsVersion: 2,
      frontend: 'svelte',
    });

    // Solid templates (Wails v2)
    templates.set('solid-2', {
      url: 'https://github.com/xijaja/wails-template-solid-ts',
      name: 'solid-vite-ts',
      wailsVersion: 2,
      frontend: 'solid',
      hasTypeScript: true,
    });

    // Vanilla templates
    templates.set('vanilla-2', {
      url: 'https://github.com/wailsapp/wails',
      name: 'vanilla',
      wailsVersion: 2,
      frontend: 'vanilla',
    });

    // Wails v3 templates (use default for now as v3 is experimental)
    templates.set('react-3', {
      url: 'https://github.com/wailsapp/wails',
      name: 'react',
      wailsVersion: 3,
      frontend: 'react',
    });

    templates.set('vue-3', {
      url: 'https://github.com/wailsapp/wails',
      name: 'vue',
      wailsVersion: 3,
      frontend: 'vue',
    });

    templates.set('svelte-3', {
      url: 'https://github.com/wailsapp/wails',
      name: 'svelte',
      wailsVersion: 3,
      frontend: 'svelte',
    });

    templates.set('solid-3', {
      url: 'https://github.com/wailsapp/wails',
      name: 'solid',
      wailsVersion: 3,
      frontend: 'solid',
    });

    templates.set('vanilla-3', {
      url: 'https://github.com/wailsapp/wails',
      name: 'vanilla',
      wailsVersion: 3,
      frontend: 'vanilla',
    });

    return templates;
  }
}
