import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from './types.js';
import ora from 'ora';

export class FeaturePatcher {
  async applyTypeScript(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding TypeScript support...').start();
    
    try {
      const tsconfigPath = join(config.projectPath, 'tsconfig.json');
      
      const tsconfig = {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: config.frontend === 'react' ? 'react-jsx' : 'preserve',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
      };

      await fse.writeJson(tsconfigPath, tsconfig, { spaces: 2 });
      
      // Update package.json to add TypeScript
      await this.addNpmDependencies(config.projectPath, {
        typescript: '^5.3.3',
        '@types/node': '^20.10.6',
      }, true);

      spinner.succeed('TypeScript support added');
    } catch (error) {
      spinner.fail('Failed to add TypeScript support');
      throw error;
    }
  }

  async applyTailwind(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding Tailwind CSS...').start();
    
    try {
      // Add Tailwind config
      const tailwindConfigPath = join(config.projectPath, 'tailwind.config.js');
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

      await fse.writeFile(tailwindConfigPath, tailwindConfig);

      // Add PostCSS config
      const postcssConfigPath = join(config.projectPath, 'postcss.config.js');
      const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

      await fse.writeFile(postcssConfigPath, postcssConfig);

      // Add CSS file
      const cssPath = join(config.projectPath, 'src', 'index.css');
      const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

      await fse.ensureDir(join(config.projectPath, 'src'));
      await fse.writeFile(cssPath, cssContent);

      // Add npm dependencies
      await this.addNpmDependencies(config.projectPath, {
        tailwindcss: '^3.4.0',
        autoprefixer: '^10.4.16',
        postcss: '^8.4.32',
      }, true);

      spinner.succeed('Tailwind CSS added');
    } catch (error) {
      spinner.fail('Failed to add Tailwind CSS');
      throw error;
    }
  }

  async applyRouter(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding router...').start();
    
    try {
      const routerPackages: Record<string, string> = {
        react: 'react-router-dom',
        vue: 'vue-router',
        svelte: 'svelte-routing',
      };

      const packageName = routerPackages[config.frontend];
      
      if (packageName) {
        await this.addNpmDependencies(config.projectPath, {
          [packageName]: 'latest',
        }, false);
      }

      spinner.succeed('Router added');
    } catch (error) {
      spinner.fail('Failed to add router');
      throw error;
    }
  }

  async applyESLintPrettier(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding ESLint & Prettier...').start();
    
    try {
      // ESLint config
      const eslintConfigPath = join(config.projectPath, '.eslintrc.json');
      const eslintConfig = {
        extends: ['eslint:recommended'],
        env: {
          browser: true,
          es2021: true,
          node: true,
        },
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      };

      await fse.writeJson(eslintConfigPath, eslintConfig, { spaces: 2 });

      // Prettier config
      const prettierConfigPath = join(config.projectPath, '.prettierrc.json');
      const prettierConfig = {
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 100,
        tabWidth: 2,
      };

      await fse.writeJson(prettierConfigPath, prettierConfig, { spaces: 2 });

      // Add dependencies
      await this.addNpmDependencies(config.projectPath, {
        eslint: '^8.56.0',
        prettier: '^3.1.1',
      }, true);

      spinner.succeed('ESLint & Prettier added');
    } catch (error) {
      spinner.fail('Failed to add ESLint & Prettier');
      throw error;
    }
  }

  async applyGitHubActions(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding GitHub Actions...').start();
    
    try {
      const workflowsDir = join(config.projectPath, '.github', 'workflows');
      await fse.ensureDir(workflowsDir);

      // CI Workflow
      const ciWorkflow = this.generateCIWorkflow(config);
      await fse.writeFile(join(workflowsDir, 'ci.yml'), ciWorkflow);

      // Build & Release Workflow
      const releaseWorkflow = this.generateReleaseWorkflow(config);
      await fse.writeFile(join(workflowsDir, 'release.yml'), releaseWorkflow);

      spinner.succeed('GitHub Actions workflows added');
    } catch (error) {
      spinner.fail('Failed to add GitHub Actions');
      throw error;
    }
  }

  async applySystemTray(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding system tray support...').start();
    
    try {
      // Add Go code for system tray
      const appGoPath = join(config.projectPath, 'app.go');
      
      if (await fse.pathExists(appGoPath)) {
        let content = await fse.readFile(appGoPath, 'utf-8');
        
        // Add system tray initialization comment
        const comment = `
// System Tray Feature
// Implement system tray functionality here
// See: https://wails.io/docs/guides/systray
`;
        
        if (!content.includes('System Tray Feature')) {
          content += comment;
          await fse.writeFile(appGoPath, content);
        }
      }

      spinner.succeed('System tray support added (requires manual implementation)');
    } catch (error) {
      spinner.fail('Failed to add system tray support');
      throw error;
    }
  }

  async applySingleInstance(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding single instance lock...').start();
    
    try {
      // Add example single instance implementation
      const comment = `
// Single Instance Lock
// Implement single instance functionality to prevent multiple app instances
// Consider using: github.com/allan-simon/go-singleinstance
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('Single instance lock support added (requires manual implementation)');
    } catch (error) {
      spinner.fail('Failed to add single instance lock');
      throw error;
    }
  }

  async applyAutoUpdate(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding auto-update support...').start();
    
    try {
      const comment = `
// Auto Update Feature
// Implement auto-update functionality using GitHub Releases
// Consider using: github.com/inconshreveable/go-update
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('Auto-update support added (requires manual implementation)');
    } catch (error) {
      spinner.fail('Failed to add auto-update support');
      throw error;
    }
  }

  async applyNativeDialogs(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding native dialogs...').start();
    
    try {
      const comment = `
// Native Dialogs
// Use Wails runtime for native dialogs:
// - runtime.OpenFileDialog()
// - runtime.SaveFileDialog()
// - runtime.MessageDialog()
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('Native dialogs support added');
    } catch (error) {
      spinner.fail('Failed to add native dialogs');
      throw error;
    }
  }

  async applyAppConfig(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding app config/settings store...').start();
    
    try {
      const comment = `
// App Config / Settings Store
// Implement persistent settings storage
// Consider using: github.com/spf13/viper
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('App config support added (requires manual implementation)');
    } catch (error) {
      spinner.fail('Failed to add app config');
      throw error;
    }
  }

  async applyDeepLinking(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding deep linking support...').start();
    
    try {
      const comment = `
// Deep Linking (Custom Protocol)
// Register custom URL protocol for deep linking
// Platform-specific implementation required
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('Deep linking support added (requires manual implementation)');
    } catch (error) {
      spinner.fail('Failed to add deep linking');
      throw error;
    }
  }

  async applyStartup(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding startup/auto-launch support...').start();
    
    try {
      const comment = `
// Startup / Auto-launch
// Configure app to start on system boot
// Platform-specific implementation required
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('Startup support added (requires manual implementation)');
    } catch (error) {
      spinner.fail('Failed to add startup support');
      throw error;
    }
  }

  async applyClipboard(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding clipboard utilities...').start();
    
    try {
      const comment = `
// Clipboard Utilities
// Use runtime.ClipboardGetText() and runtime.ClipboardSetText()
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('Clipboard utilities added');
    } catch (error) {
      spinner.fail('Failed to add clipboard utilities');
      throw error;
    }
  }

  async applyFileWatcher(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding file system watcher...').start();
    
    try {
      const comment = `
// File System Watcher
// Implement file watching functionality
// Consider using: github.com/fsnotify/fsnotify
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('File system watcher support added (requires manual implementation)');
    } catch (error) {
      spinner.fail('Failed to add file system watcher');
      throw error;
    }
  }

  async applySQLite(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding SQLite support...').start();
    
    try {
      const comment = `
// SQLite Database
// Local-first database support
// Consider using: github.com/mattn/go-sqlite3 or modernc.org/sqlite
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      // Create example SQL schema
      const dbDir = join(config.projectPath, 'db');
      await fse.ensureDir(dbDir);
      
      const schemaPath = join(dbDir, 'schema.sql');
      const schema = `-- Example SQLite Schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
      
      await fse.writeFile(schemaPath, schema);
      
      spinner.succeed('SQLite support added (requires manual implementation)');
    } catch (error) {
      spinner.fail('Failed to add SQLite support');
      throw error;
    }
  }

  async applyEncryptedStorage(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding encrypted local storage...').start();
    
    try {
      const comment = `
// Encrypted Local Storage
// Implement encrypted storage for sensitive data
// Consider using: github.com/99designs/keyring
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('Encrypted storage support added (requires manual implementation)');
    } catch (error) {
      spinner.fail('Failed to add encrypted storage');
      throw error;
    }
  }

  async applySupabase(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding Supabase integration...').start();
    
    try {
      // Create .env.example
      const envExamplePath = join(config.projectPath, '.env.example');
      const envContent = `# Supabase Configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
${config.features.supabaseAuth ? '# Auth enabled\n' : ''}${config.features.supabaseDatabase ? '# Database enabled\n' : ''}${config.features.supabaseStorage ? '# Storage enabled\n' : ''}`;
      
      await fse.writeFile(envExamplePath, envContent);

      // Add Supabase client example
      const supabaseDir = join(config.projectPath, 'src', 'lib');
      await fse.ensureDir(supabaseDir);
      
      const ext = config.features.typescript ? 'ts' : 'js';
      const supabaseClientPath = join(supabaseDir, `supabase.${ext}`);
      const supabaseClient = `// Supabase Client Configuration
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`;
      
      await fse.writeFile(supabaseClientPath, supabaseClient);

      // Add npm dependency
      await this.addNpmDependencies(config.projectPath, {
        '@supabase/supabase-js': '^2.38.4',
      }, false);

      spinner.succeed('Supabase integration added');
    } catch (error) {
      spinner.fail('Failed to add Supabase integration');
      throw error;
    }
  }

  async applyFrontendUnitTesting(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding frontend unit testing (Vitest)...').start();
    
    try {
      // Vitest config
      const vitestConfigPath = join(config.projectPath, 'vitest.config.ts');
      const vitestConfig = `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
`;
      
      await fse.writeFile(vitestConfigPath, vitestConfig);

      // Add dependencies
      await this.addNpmDependencies(config.projectPath, {
        vitest: '^1.1.0',
        '@vitest/ui': '^1.1.0',
        jsdom: '^23.0.1',
      }, true);

      spinner.succeed('Vitest testing added');
    } catch (error) {
      spinner.fail('Failed to add Vitest testing');
      throw error;
    }
  }

  async applyFrontendE2ETesting(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding frontend E2E testing (Playwright)...').start();
    
    try {
      // Playwright config
      const playwrightConfigPath = join(config.projectPath, 'playwright.config.ts');
      const playwrightConfig = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
`;
      
      await fse.writeFile(playwrightConfigPath, playwrightConfig);

      // Create e2e directory
      const e2eDir = join(config.projectPath, 'e2e');
      await fse.ensureDir(e2eDir);

      // Add dependencies
      await this.addNpmDependencies(config.projectPath, {
        '@playwright/test': '^1.40.1',
      }, true);

      spinner.succeed('Playwright E2E testing added');
    } catch (error) {
      spinner.fail('Failed to add Playwright testing');
      throw error;
    }
  }

  async applyBackendTesting(config: GeneratorConfig): Promise<void> {
    const spinner = ora('Adding Go backend tests...').start();
    
    try {
      const comment = `
// Go Backend Testing
// Create test files with _test.go suffix
// Use testing package: import "testing"
// Run tests with: go test ./...
`;
      
      await this.addGoComment(config.projectPath, comment);
      
      spinner.succeed('Go backend testing support added');
    } catch (error) {
      spinner.fail('Failed to add backend testing');
      throw error;
    }
  }

  // Helper methods

  private async addNpmDependencies(
    projectPath: string,
    dependencies: Record<string, string>,
    isDev: boolean
  ): Promise<void> {
    const packageJsonPath = join(projectPath, 'package.json');
    
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

  private async addGoComment(projectPath: string, comment: string): Promise<void> {
    const appGoPath = join(projectPath, 'app.go');
    
    if (await fse.pathExists(appGoPath)) {
      let content = await fse.readFile(appGoPath, 'utf-8');
      content += `\n${comment}`;
      await fse.writeFile(appGoPath, content);
    }
  }

  private generateCIWorkflow(config: GeneratorConfig): string {
    return `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      ${config.features.eslintPrettier ? `- name: Run ESLint
        run: npm run lint
      ` : ''}
      ${config.features.testingFrontendUnit ? `- name: Run unit tests
        run: npm run test
      ` : ''}
      ${config.features.testingBackend ? `- name: Run Go tests
        run: go test ./...
      ` : ''}
`;
  }

  private generateReleaseWorkflow(config: GeneratorConfig): string {
    const wailsCLI = config.wailsVersion === 3 ? 'wails3' : 'wails';
    const installCmd = config.wailsVersion === 3
      ? 'go install github.com/wailsapp/wails/v3/cmd/wails3@latest'
      : 'go install github.com/wailsapp/wails/v2/cmd/wails@latest';

    return `name: Build & Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    runs-on: \${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Wails
        run: ${installCmd}
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: ${wailsCLI} build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${config.projectName}-\${{ matrix.os }}
          path: build/bin/
  
  release:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            ${config.projectName}-ubuntu-latest/*
            ${config.projectName}-macos-latest/*
            ${config.projectName}-windows-latest/*
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
  }
}
