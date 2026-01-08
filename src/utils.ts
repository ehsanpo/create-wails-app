import { execa } from 'execa';

export async function which(command: string): Promise<string | null> {
  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      const { stdout } = await execa('where', [command]);
      return stdout.split('\n')[0].trim();
    } else {
      const { stdout } = await execa('which', [command]);
      return stdout.trim();
    }
  } catch {
    return null;
  }
}

export function parseVersion(versionString: string): string {
  // Extract version from strings like "v2.8.0" or "Wails v2.8.0"
  const match = versionString.match(/v?(\d+\.\d+\.\d+)/);
  return match ? match[1] : versionString;
}

export function isCompatibleVersion(current: string, required: string): boolean {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);

  // Major version must match
  if (currentParts[0] !== requiredParts[0]) {
    return false;
  }

  // Minor version should be >= required
  if (currentParts[1] < requiredParts[1]) {
    return false;
  }

  return true;
}
