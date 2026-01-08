import fse from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the templates directory path
export const TEMPLATES_DIR = join(__dirname, '..', '..', 'templates');

/**
 * Read a template file from the templates directory
 * @param templatePath - Path relative to version directory (e.g., 'system-tray/systray.go')
 * @param wailsVersion - Wails version (2 or 3)
 * @returns Content of the template file
 */
export async function readTemplate(templatePath: string, wailsVersion: 2 | 3): Promise<string> {
  const fullPath = join(TEMPLATES_DIR, `v${wailsVersion}`, templatePath);
  return await fse.readFile(fullPath, 'utf-8');
}

/**
 * Check if a template file exists
 * @param templatePath - Path relative to version directory
 * @param wailsVersion - Wails version (2 or 3)
 * @returns True if the template exists
 */
export async function templateExists(templatePath: string, wailsVersion: 2 | 3): Promise<boolean> {
  const fullPath = join(TEMPLATES_DIR, `v${wailsVersion}`, templatePath);
  return await fse.pathExists(fullPath);
}
