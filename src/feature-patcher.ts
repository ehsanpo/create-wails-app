import type { GeneratorConfig } from './types.js';
import * as patches from './patches/index.js';

/**
 * FeaturePatcher applies individual feature modifications to generated projects.
 * This class delegates to specialized patch modules for clean separation of concerns.
 */
export class FeaturePatcher {
  async applyTypeScript(config: GeneratorConfig): Promise<void> {
    return patches.applyTypeScript(config);
  }

  async applyTailwind(config: GeneratorConfig): Promise<void> {
    return patches.applyTailwind(config);
  }

  async applyRouter(config: GeneratorConfig): Promise<void> {
    return patches.applyRouter(config);
  }

  async applyESLintPrettier(config: GeneratorConfig): Promise<void> {
    return patches.applyESLintPrettier(config);
  }

  async applyGitHubActions(config: GeneratorConfig): Promise<void> {
    return patches.applyGitHubActions(config);
  }

  async applySystemTray(config: GeneratorConfig): Promise<void> {
    return patches.applySystemTray(config);
  }

  async applySingleInstance(config: GeneratorConfig): Promise<void> {
    return patches.applySingleInstance(config);
  }

  async applyAutoUpdate(config: GeneratorConfig): Promise<void> {
    return patches.applyAutoUpdate(config);
  }

  async applyNativeDialogs(config: GeneratorConfig): Promise<void> {
    return patches.applyNativeDialogs(config);
  }

  async applyAppConfig(config: GeneratorConfig): Promise<void> {
    return patches.applyAppConfig(config);
  }

  async applyDeepLinking(config: GeneratorConfig): Promise<void> {
    return patches.applyDeepLinking(config);
  }

  async applyStartup(config: GeneratorConfig): Promise<void> {
    return patches.applyStartup(config);
  }

  async applyClipboard(config: GeneratorConfig): Promise<void> {
    return patches.applyClipboard(config);
  }

  async applyFileWatcher(config: GeneratorConfig): Promise<void> {
    return patches.applyFileWatcher(config);
  }

  async applySQLite(config: GeneratorConfig): Promise<void> {
    return patches.applySQLite(config);
  }

  async applyEncryptedStorage(config: GeneratorConfig): Promise<void> {
    return patches.applyEncryptedStorage(config);
  }

  async applySupabase(config: GeneratorConfig): Promise<void> {
    return patches.applySupabase(config);
  }

  async applyFrontendUnitTesting(config: GeneratorConfig): Promise<void> {
    return patches.applyFrontendUnitTesting(config);
  }

  async applyFrontendE2ETesting(config: GeneratorConfig): Promise<void> {
    return patches.applyFrontendE2ETesting(config);
  }

  async applyBackendTesting(config: GeneratorConfig): Promise<void> {
    return patches.applyBackendTesting(config);
  }
}
