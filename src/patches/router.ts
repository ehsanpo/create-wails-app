import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { addNpmDependencies } from './helpers.js';

export async function applyRouter(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding router...').start();
  
  try {
    const routerPackages: Record<string, string> = {
      react: 'react-router-dom',
      vue: 'vue-router',
      svelte: 'svelte-routing',
    };

    const packageName = routerPackages[config.frontend];
    
    if (packageName) {
      await addNpmDependencies(config.projectPath, {
        [packageName]: 'latest',
      }, false);
    }

    spinner.succeed('Router added');
  } catch (error) {
    spinner.fail('Failed to add router');
    throw error;
  }
}
