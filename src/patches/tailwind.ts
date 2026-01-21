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
    // Vite-based projects need @tailwindcss/vite plugin
    await addNpmDependencies(config.projectPath, {
      tailwindcss: '^4.1.18',
      '@tailwindcss/vite': '^4.1.18',
    }, true);

    // Update vite.config to add Tailwind plugin
    await updateViteConfig(config);

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

/**
 * Update vite.config to add Tailwind CSS plugin
 */
async function updateViteConfig(config: GeneratorConfig): Promise<void> {
  const viteConfigPath = join(config.projectPath, 'frontend', 'vite.config.js');
  
  if (!await fse.pathExists(viteConfigPath)) {
    return; // No vite.config.js found
  }

  let content = await fse.readFile(viteConfigPath, 'utf-8');
  
  // Check if tailwindcss is already imported
  if (content.includes('@tailwindcss/vite')) {
    return; // Already configured
  }

  // Add import statement
  const lines = content.split('\n');
  let lastImportIndex = 0;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  // Insert tailwindcss import after the last import
  lines.splice(lastImportIndex + 1, 0, 'import tailwindcss from \'@tailwindcss/vite\'');
  
  // Update plugins array to include tailwindcss()
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('plugins:') && lines[i].includes('[')) {
      // Find the framework plugin (vue(), react(), svelte(), etc.)
      const pluginsLine = lines[i];
      
      // Check if it's a single-line plugins array
      if (pluginsLine.includes(']')) {
        // Single line format: plugins: [vue(), wails("./bindings")]
        lines[i] = pluginsLine.replace(/\[(.*?)\]/, (match, plugins) => {
          // Split plugins and insert tailwindcss() after the first plugin
          const pluginsList = plugins.split(',').map((p: string) => p.trim());
          
          // Insert tailwindcss() after the framework plugin (first one)
          if (pluginsList.length > 0) {
            pluginsList.splice(1, 0, 'tailwindcss()');
          }
          
          return `[${pluginsList.join(', ')}]`;
        });
        break;
      }
    }
  }
  
  content = lines.join('\n');
  await fse.writeFile(viteConfigPath, content);
}
