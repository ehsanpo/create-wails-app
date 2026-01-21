import { DecisionMapper } from '../src/decision-mapper';
import { GeneratorEngine } from '../src/generator-engine';
import { AllAnswers } from '../src/types';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEST_PROJECT_NAME = 'test-minimal-scenario1';
const TEST_DIR = path.resolve(PROJECT_ROOT, '..', TEST_PROJECT_NAME);

describe('Scenario 1: Minimal Setup (Wails v3, React)', () => {
    beforeAll(async () => {
        if (await fs.pathExists(TEST_DIR)) {
            console.log(`Cleaning up ${TEST_DIR}...`);
            await fs.remove(TEST_DIR);
        }
    });

    it('should generate a project correctly based on Scenario 1 requirements', async () => {
        // These answers match Scenario 1 from TESTPLAN.md
        const answers: AllAnswers = {
            projectName: TEST_PROJECT_NAME,
            outputDir: '..',
            wailsVersion: 3,
            frontend: 'react',
            frontendExtras: [],
            appFeatures: [],
            dataBackend: [],
            supabaseOptions: [],
            enableTesting: false,
            testingFrameworks: [],
            confirmed: true
        };

        console.log('Mapping answers to config...');
        const mapper = new DecisionMapper();
        const config = mapper.map(answers);

        console.log(`Generating project at ${config.projectPath}...`);
        const engine = new GeneratorEngine();
        await engine.generate(config);

        console.log('Verifying files...');
        expect(await fs.pathExists(config.projectPath)).toBe(true);

        const rootPkgJson = path.join(config.projectPath, 'package.json');
        const frontendPkgJson = path.join(config.projectPath, 'frontend', 'package.json');
        const pkgJsonExists = (await fs.pathExists(rootPkgJson)) || (await fs.pathExists(frontendPkgJson));
        expect(pkgJsonExists).toBe(true);

        expect(await fs.pathExists(path.join(config.projectPath, 'main.go'))).toBe(true);

        const mainGo = await fs.readFile(path.join(config.projectPath, 'main.go'), 'utf-8');
        expect(mainGo).toContain('github.com/wailsapp/wails/v3/pkg/application');

        expect(await fs.pathExists(path.join(config.projectPath, 'tsconfig.json'))).toBe(false);

        const appJsx = path.join(config.projectPath, 'frontend', 'src', 'App.jsx');
        expect(await fs.pathExists(appJsx)).toBe(true);
    }, 300000);
});
