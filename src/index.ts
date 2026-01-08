#!/usr/bin/env node

import { PromptEngine } from './prompt-engine.js';
import { DecisionMapper } from './decision-mapper.js';
import { WailsCLIManager } from './wails-cli-manager.js';
import { GeneratorEngine } from './generator-engine.js';
import { PostInstallUX } from './post-install-ux.js';
import chalk from 'chalk';

async function main() {
  console.log('\n');
  console.log(chalk.bold.cyan('🎨 create-wails-app'));
  console.log(chalk.gray('Interactive CLI for scaffolding Wails desktop applications'));
  console.log('\n');

  try {
    // Layer 1: Prompt Engine - Collect user answers
    const promptEngine = new PromptEngine();
    const answers = await promptEngine.collect();

    if (!answers.confirmed) {
      console.log(chalk.yellow('\n❌ Cancelled by user\n'));
      process.exit(0);
    }

    // Layer 2: Decision Mapper - Convert answers to config
    const mapper = new DecisionMapper();
    const config = mapper.map(answers);

    // Check and install Wails CLI if needed
    const cliManager = new WailsCLIManager();
    const detection = await cliManager.detect(config.wailsVersion);

    if (!detection.installed) {
      console.log(chalk.yellow(`\n⚠️  Wails v${config.wailsVersion} CLI not found\n`));
      
      const shouldInstall = await cliManager.promptInstallation(config.wailsVersion);
      
      if (shouldInstall) {
        const installResult = await cliManager.install(config.wailsVersion);
        
        if (!installResult.success) {
          console.log(chalk.red('\n❌ Installation failed\n'));
          console.log(installResult.error);
          console.log(cliManager.getManualInstallInstructions(config.wailsVersion));
          process.exit(1);
        }
        
        console.log(chalk.green('\n✅ Wails CLI installed successfully\n'));
      } else {
        console.log(chalk.yellow('\n❌ Cannot proceed without Wails CLI\n'));
        console.log(cliManager.getManualInstallInstructions(config.wailsVersion));
        process.exit(1);
      }
    } else {
      console.log(chalk.green(`\n✅ Wails v${config.wailsVersion} CLI found: ${detection.version}\n`));
    }

    // Layer 3: Generator Engine - Execute scaffolding
    const generator = new GeneratorEngine();
    await generator.generate(config);

    // Layer 4: Post-Install UX - Show next steps
    const postInstall = new PostInstallUX();
    await postInstall.show(config);

  } catch (error) {
    const postInstall = new PostInstallUX();
    postInstall.showError(error instanceof Error ? error : new Error('Unknown error'));
    process.exit(1);
  }
}

main();
