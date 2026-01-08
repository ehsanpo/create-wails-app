import fse from 'fs-extra';
import { join } from 'path';

export async function addNpmDependencies(
  projectPath: string,
  dependencies: Record<string, string>,
  isDev: boolean
): Promise<void> {
  const packageJsonPath = join(projectPath, 'package.json');
  
  if (!(await fse.pathExists(packageJsonPath))) {
    return;
  }

  const packageJson = await fse.readJson(packageJsonPath);
  const depKey = isDev ? 'devDependencies' : 'dependencies';
  
  packageJson[depKey] = {
    ...packageJson[depKey],
    ...dependencies,
  };

  await fse.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

export async function addGoComment(projectPath: string, comment: string): Promise<void> {
  const appGoPath = join(projectPath, 'app.go');
  
  if (await fse.pathExists(appGoPath)) {
    let content = await fse.readFile(appGoPath, 'utf-8');
    content += `\n${comment}`;
    await fse.writeFile(appGoPath, content);
  }
}
