import { DecisionMapper } from '../src/decision-mapper';
import { GeneratorEngine } from '../src/generator-engine';
import { AllAnswers } from '../src/types';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEST_PROJECT_NAME = 'test-tray-v3';
const TEST_DIR = path.resolve(PROJECT_ROOT, '..', TEST_PROJECT_NAME);

describe('Scenario 4: System Tray (Wails v3)', () => {
    beforeAll(async () => {
        if (await fs.pathExists(TEST_DIR)) {
            console.log(`Cleaning up ${TEST_DIR}...`);
            await fs.remove(TEST_DIR);
        }
    });

    it('should generate a project with System Tray correctly patched for v3', async () => {
        const answers: AllAnswers = {
            projectName: TEST_PROJECT_NAME,
            outputDir: '..',
            wailsVersion: 3,
            frontend: 'react',
            frontendExtras: [],
            appFeatures: ['system-tray'],
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

        // Verifications according to TESTPLAN.md
        console.log('Verifying System Tray setup...');

        // 1. Verify main.go content for System Tray
        const mainGoPath = path.join(config.projectPath, 'main.go');
        expect(await fs.pathExists(mainGoPath)).toBe(true);
        const mainGo = await fs.readFile(mainGoPath, 'utf-8');

        expect(mainGo).toContain('systray := app.SystemTray.New()');
        expect(mainGo).toContain('setupSystemTray(app, systray, mainWindow');

        // 2. Verify systray.go existence and content
        const systrayGoPath = path.join(config.projectPath, 'systray.go');
        expect(await fs.pathExists(systrayGoPath)).toBe(true);
        const systrayGo = await fs.readFile(systrayGoPath, 'utf-8');

        expect(systrayGo).toContain('func setupSystemTray');
        expect(systrayGo).toContain('menu.Add("Show Window")');
        expect(systrayGo).toContain('app.Quit()');

        console.log('Scenario 4 verification successful!');
    }, 300000);
});
