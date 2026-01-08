import chalk from 'chalk';
import type { GeneratorConfig } from './types.js';
import { which } from './utils.js';

export class PostInstallUX {
  async show(config: GeneratorConfig): Promise<void> {
    console.log('\n');
    console.log(chalk.green('✨ Project created successfully!'));
    console.log('\n');
    
    this.showProjectInfo(config);
    await this.checkDependencies();
    this.showNextSteps(config);
    this.showAdditionalNotes(config);
  }

  showError(error: Error): void {
    console.log('\n');
    console.log(chalk.red('❌ Error:'), error.message);
    console.log('\n');
    
    if (error.message.includes('Wails')) {
      console.log(chalk.yellow('💡 Tip:'));
      console.log('Make sure you have the Wails CLI installed and Go is properly configured.');
      console.log('Visit https://wails.io/docs/gettingstarted/installation for help.');
    }
    
    console.log('\n');
  }

  private showProjectInfo(config: GeneratorConfig): void {
    console.log(chalk.bold('Project Details:'));
    console.log(`  Name:         ${chalk.cyan(config.projectName)}`);
    console.log(`  Location:     ${chalk.cyan(config.projectPath)}`);
    console.log(`  Wails:        ${chalk.cyan(`v${config.wailsVersion}`)}`);
    console.log(`  Frontend:     ${chalk.cyan(config.frontend)}`);
    console.log('\n');
  }

  private async checkDependencies(): Promise<void> {
    console.log(chalk.bold('Dependency Check:'));
    
    const checks = [
      { name: 'Node.js', command: 'node' },
      { name: 'npm', command: 'npm' },
      { name: 'Go', command: 'go' },
    ];

    for (const check of checks) {
      const installed = await which(check.command);
      const status = installed ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${status} ${check.name}`);
    }
    
    console.log('\n');
  }

  private showNextSteps(config: GeneratorConfig): void {
    console.log(chalk.bold('Next Steps:'));
    console.log('\n');
    console.log(`  1. Navigate to your project:`);
    console.log(chalk.cyan(`     cd ${config.projectName}`));
    console.log('\n');
    
    console.log(`  2. Start development:`);
    console.log(chalk.cyan(`     ${config.wailsCLI} dev`));
    console.log('\n');
    
    console.log(`  3. Build for production:`);
    console.log(chalk.cyan(`     ${config.wailsCLI} build`));
    console.log('\n');
  }

  private showAdditionalNotes(config: GeneratorConfig): void {
    const notes: string[] = [];

    if (config.features.supabase) {
      notes.push('📦 Supabase: Remember to set up your .env file with Supabase credentials');
    }

    if (config.features.githubActions) {
      notes.push('🔄 GitHub Actions: Workflows have been created in .github/workflows/');
      notes.push('   Note: Binary signing and notarization are NOT enabled by default');
    }

    if (config.features.testingFrontendUnit) {
      notes.push('🧪 Testing: Run unit tests with: npm run test');
    }

    if (config.features.testingFrontendE2E) {
      notes.push('🎭 E2E Tests: Install Playwright browsers with: npx playwright install');
    }

    if (config.wailsVersion === 3) {
      notes.push('⚠️  Wails v3 is experimental - expect breaking changes');
    }

    if (notes.length > 0) {
      console.log(chalk.bold('Important Notes:'));
      notes.forEach(note => console.log(`  ${note}`));
      console.log('\n');
    }

    console.log(chalk.bold('Resources:'));
    console.log(`  📚 Wails Docs:    ${chalk.cyan('https://wails.io/docs')}`);
    console.log(`  💬 Discord:       ${chalk.cyan('https://discord.gg/BrRSWTaxRK')}`);
    console.log(`  🐛 Issues:        ${chalk.cyan('https://github.com/wailsapp/wails/issues')}`);
    console.log('\n');

    console.log(chalk.green('Happy coding! 🚀'));
    console.log('\n');
  }
}
