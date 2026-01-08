import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';

export async function applyTypeScript(config: GeneratorConfig): Promise<void> {
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
    const packageJsonPath = join(config.projectPath, 'package.json');
    
    if (await fse.pathExists(packageJsonPath)) {
      const packageJson = await fse.readJson(packageJsonPath);
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        typescript: '^5.3.3',
        '@types/node': '^20.10.6',
      };
      await fse.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }

    spinner.succeed('TypeScript support added');
  } catch (error) {
    spinner.fail('Failed to add TypeScript support');
    throw error;
  }
}
