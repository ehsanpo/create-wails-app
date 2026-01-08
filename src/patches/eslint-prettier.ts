import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { addNpmDependencies } from './helpers.js';

export async function applyESLintPrettier(config: GeneratorConfig): Promise<void> {
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
    await addNpmDependencies(config.projectPath, {
      eslint: '^8.56.0',
      prettier: '^3.1.1',
    }, true);

    spinner.succeed('ESLint & Prettier added');
  } catch (error) {
    spinner.fail('Failed to add ESLint & Prettier');
    throw error;
  }
}
