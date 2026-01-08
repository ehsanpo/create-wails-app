import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { addNpmDependencies } from './helpers.js';

export async function applyTailwind(config: GeneratorConfig): Promise<void> {
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
    await addNpmDependencies(config.projectPath, {
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
