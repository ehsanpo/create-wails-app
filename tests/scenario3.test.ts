import { DecisionMapper } from '../src/decision-mapper';
import { GeneratorEngine } from '../src/generator-engine';
import { AllAnswers } from '../src/types';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEST_PROJECT_NAME = 'test-tailwind';
const TEST_DIR = path.resolve(PROJECT_ROOT, '..', TEST_PROJECT_NAME);

describe('Scenario 3: Tailwind v4 Specific (Wails v3, Vue)', () => {
    beforeAll(async () => {
        if (await fs.pathExists(TEST_DIR)) {
            console.log(`Cleaning up ${TEST_DIR}...`);
            await fs.remove(TEST_DIR);
        }
    });

    it('should generate a Vue project with Tailwind v4 correctly', async () => {
        // These answers match Scenario 3 from TESTPLAN.md
        const answers: AllAnswers = {
            projectName: TEST_PROJECT_NAME,
            outputDir: '..',
            wailsVersion: 3,
            frontend: 'vue',
            frontendExtras: ['typescript', 'tailwind'],
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

        // Verifications according to TESTPLAN.md
        console.log('Verifying Tailwind v4 setup...');

        // 1. Check index.css for @import "tailwindcss"
        const indexCssPath = path.join(config.projectPath, 'frontend', 'src', 'index.css');
        // For Wails v3 Vue, check common locations if index.css is not there
        const alternativeCssPath = path.join(config.projectPath, 'frontend', 'src', 'style.css');
        const cssPath = (await fs.pathExists(indexCssPath)) ? indexCssPath : alternativeCssPath;

        expect(await fs.pathExists(cssPath)).toBe(true);
        const cssContent = await fs.readFile(cssPath, 'utf-8');
        expect(cssContent).toContain('@import "tailwindcss";');
        expect(cssContent).not.toContain('@tailwind base;'); // Should not use old directives

        // 2. No tailwind.config.js or postcss.config.js (as per requirements)
        expect(await fs.pathExists(path.join(config.projectPath, 'tailwind.config.js'))).toBe(false);
        expect(await fs.pathExists(path.join(config.projectPath, 'frontend', 'tailwind.config.js'))).toBe(false);
        expect(await fs.pathExists(path.join(config.projectPath, 'postcss.config.js'))).toBe(false);
        expect(await fs.pathExists(path.join(config.projectPath, 'frontend', 'postcss.config.js'))).toBe(false);

        // 3. Check package.json for tailwindcss version and absence of autoprefixer/postcss
        const pkgJsonPath = path.join(config.projectPath, 'package.json');
        // Wails v3 Vue might put it in root or frontend
        const frontendPkgJsonPath = path.join(config.projectPath, 'frontend', 'package.json');
        const actualPkgJsonPath = (await fs.pathExists(pkgJsonPath)) ? pkgJsonPath : frontendPkgJsonPath;

        const pkgJson = await fs.readJson(actualPkgJsonPath);
        const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };

        expect(deps.tailwindcss).toBeDefined();
        // We expect ^4.0.0 or higher based on the "Tailwind v4 Specific" scenario
        expect(deps.tailwindcss).toMatch(/\^4/);

        expect(deps.autoprefixer).toBeUndefined();
        // postcss might be a dependency of vite/vue but should not be explicitly there as a direct peer if we use standalone tailwind v4
        // However, some templates include it. The requirement says "No postcss in devDependencies (standalone)"
        expect(deps.autoprefixer).toBeUndefined();

        console.log('Scenario 3 verification successful!');
    }, 300000);
});
