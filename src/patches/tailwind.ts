import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { addNpmDependencies } from './helpers.js';
import { readTemplate } from './template-reader.js';

export async function applyTailwind(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding Tailwind CSS v4...').start();
  
  try {
    // Tailwind v4 no longer needs tailwind.config.js or postcss.config.js
    // Configuration is done via CSS or via @config directive

    // Add CSS file with v4 import syntax
    const cssPath = join(config.projectPath, 'src', 'index.css');
    const cssContent = await readTemplate('tailwind/index.css', config.wailsVersion);
    await fse.ensureDir(join(config.projectPath, 'src'));
    await fse.writeFile(cssPath, cssContent);

    // Add npm dependencies (v4 has PostCSS and Autoprefixer built-in)
    await addNpmDependencies(config.projectPath, {
      tailwindcss: '^4.1.18',
    }, true);

    spinner.succeed('Tailwind CSS v4 added');
  } catch (error) {
    spinner.fail('Failed to add Tailwind CSS v4');
    throw error;
  }
}
