import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { addGoComment, addNpmDependencies } from './helpers.js';

export async function applyFrontendUnitTesting(config: GeneratorConfig): Promise<void> {
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
    await addNpmDependencies(config.projectPath, {
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

export async function applyFrontendE2ETesting(config: GeneratorConfig): Promise<void> {
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
    await addNpmDependencies(config.projectPath, {
      '@playwright/test': '^1.40.1',
    }, true);

    spinner.succeed('Playwright E2E testing added');
  } catch (error) {
    spinner.fail('Failed to add Playwright testing');
    throw error;
  }
}

export async function applyBackendTesting(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding Go backend tests...').start();
  
  try {
    const comment = `
// Go Backend Testing
// Create test files with _test.go suffix
// Use testing package: import "testing"
// Run tests with: go test ./...
`;
    
    await addGoComment(config.projectPath, comment);
    
    spinner.succeed('Go backend testing support added');
  } catch (error) {
    spinner.fail('Failed to add backend testing');
    throw error;
  }
}
