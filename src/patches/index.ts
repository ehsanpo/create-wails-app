// Export all patch functions
export { applyTypeScript } from './typescript.js';
export { applyTailwind } from './tailwind.js';
export { applyRouter } from './router.js';
export { applyESLintPrettier } from './eslint-prettier.js';
export { applyGitHubActions } from './github-actions.js';
export { applySystemTray } from './system-tray.js';
export {
  applySingleInstance,
  applyAutoUpdate,
  applyNativeDialogs,
  applyAppConfig,
  applyDeepLinking,
  applyStartup,
  applyClipboard,
  applyFileWatcher,
} from './app-features.js';
export {
  applySQLite,
  applyEncryptedStorage,
  applySupabase,
} from './data-backend.js';
export {
  applyFrontendUnitTesting,
  applyFrontendE2ETesting,
  applyBackendTesting,
} from './testing.js';
export { addNpmDependencies, addGoComment } from './helpers.js';
