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

    // Add CSS file with v4 import syntax in frontend/src
    const cssPath = join(config.projectPath, 'frontend', 'src', 'index.css');
    const cssContent = await readTemplate('tailwind/index.css', config.wailsVersion);
    await fse.ensureDir(join(config.projectPath, 'frontend', 'src'));
    await fse.writeFile(cssPath, cssContent);

    // Import CSS in the appropriate entry point based on framework
    await importCSSInEntryPoint(config);

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

/**
 * Import index.css in the appropriate entry point for each framework
 */
async function importCSSInEntryPoint(config: GeneratorConfig): Promise<void> {
  const frontendPath = join(config.projectPath, 'frontend', 'src');
  
  // Determine entry point based on framework
  let entryFile: string;
  let importStatement: string;
  
  if (config.frontend === 'react') {
    // React uses main.jsx or main.tsx
    const tsEntry = join(frontendPath, 'main.tsx');
    const jsEntry = join(frontendPath, 'main.jsx');
    entryFile = await fse.pathExists(tsEntry) ? tsEntry : jsEntry;
    importStatement = "import './index.css';\n";
  } else if (config.frontend === 'vue') {
    // Vue uses main.js or main.ts
    const tsEntry = join(frontendPath, 'main.ts');
    const jsEntry = join(frontendPath, 'main.js');
    entryFile = await fse.pathExists(tsEntry) ? tsEntry : jsEntry;
    importStatement = "import './index.css';\n";
  } else if (config.frontend === 'svelte') {
    // Svelte uses main.js or main.ts
    const tsEntry = join(frontendPath, 'main.ts');
    const jsEntry = join(frontendPath, 'main.js');
    entryFile = await fse.pathExists(tsEntry) ? tsEntry : jsEntry;
    importStatement = "import './index.css';\n";
  } else {
    // Vanilla JS uses main.js or main.ts
    const tsEntry = join(frontendPath, 'main.ts');
    const jsEntry = join(frontendPath, 'main.js');
    entryFile = await fse.pathExists(tsEntry) ? tsEntry : jsEntry;
    importStatement = "import './index.css';\n";
  }

  // Read the entry file
  let content = await fse.readFile(entryFile, 'utf-8');
  
  // Check if CSS is already imported
  if (content.includes("import './index.css'") || content.includes('import "./index.css"')) {
    return; // Already imported
  }

  // Add import at the top of the file (after any existing imports)
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertIndex = i + 1;
    }
  }
  
  // Insert the CSS import
  lines.splice(insertIndex, 0, importStatement);
  content = lines.join('\n');
  
  // Write back to file
  await fse.writeFile(entryFile, content);
}
