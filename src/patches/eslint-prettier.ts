import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { addNpmDependencies } from './helpers.js';

export async function applyESLintPrettier(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding ESLint & Prettier...').start();
  
  try {
    const frontendPath = join(config.projectPath, 'frontend');
    
    // ESLint config (ESLint 9.x uses flat config format)
    const eslintConfigPath = join(frontendPath, 'eslint.config.js');
    const eslintConfigContent = `import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
    },
  },
];
`;

    await fse.writeFile(eslintConfigPath, eslintConfigContent);

    // Prettier config
    const prettierConfigPath = join(frontendPath, '.prettierrc.json');
    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 100,
      tabWidth: 2,
    };

    await fse.writeJson(prettierConfigPath, prettierConfig, { spaces: 2 });

    // VS Code settings at project root (works whether you open project root or frontend folder)
    const vscodeDir = join(config.projectPath, '.vscode');
    await fse.ensureDir(vscodeDir);
    
    const vscodeSettingsPath = join(vscodeDir, 'settings.json');
    const vscodeSettings = {
      'editor.formatOnSave': true,
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': 'explicit'
      },
      'eslint.workingDirectories': [
        { 'pattern': './frontend' }
      ],
      'files.eol': '\n',
      '[javascript]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
      },
      '[typescript]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
      },
      '[javascriptreact]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
      },
      '[typescriptreact]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
      },
      '[json]': {
        'editor.defaultFormatter': 'esbenp.prettier-vscode'
      }
    };

    await fse.writeJson(vscodeSettingsPath, vscodeSettings, { spaces: 2 });

    // Add dependencies
    await addNpmDependencies(config.projectPath, {
      eslint: '^9.39.2',
      prettier: '^3.7.4',
      'eslint-config-prettier': '^9.1.0',
      'eslint-plugin-prettier': '^5.2.1',
    }, true);

    spinner.succeed('ESLint & Prettier added');
  } catch (error) {
    spinner.fail('Failed to add ESLint & Prettier');
    throw error;
  }
}
