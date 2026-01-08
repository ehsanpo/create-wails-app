import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';

export async function applyGitHubActions(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding GitHub Actions...').start();
  
  try {
    const workflowsDir = join(config.projectPath, '.github', 'workflows');
    await fse.ensureDir(workflowsDir);

    // CI Workflow
    const ciWorkflow = generateCIWorkflow(config);
    await fse.writeFile(join(workflowsDir, 'ci.yml'), ciWorkflow);

    // Build & Release Workflow
    const releaseWorkflow = generateReleaseWorkflow(config);
    await fse.writeFile(join(workflowsDir, 'release.yml'), releaseWorkflow);

    spinner.succeed('GitHub Actions workflows added');
  } catch (error) {
    spinner.fail('Failed to add GitHub Actions');
    throw error;
  }
}

function generateCIWorkflow(config: GeneratorConfig): string {
  return `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-22.04
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Install Linux dependencies
          if: runner.os == 'Linux'
          run: |
          sudo apt update
          sudo apt install -y \
              libgtk-3-dev \
              libwebkit2gtk-4.0-dev \
              pkg-config \
              gcc
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      ${config.features.eslintPrettier ? `- name: Run ESLint
        run: npm run lint
      ` : ''}
      ${config.features.testingFrontendUnit ? `- name: Run unit tests
        run: npm run test
      ` : ''}
      ${config.features.testingBackend ? `- name: Run Go tests
        run: go test ./...
      ` : ''}
`;
}

function generateReleaseWorkflow(config: GeneratorConfig): string {
  const wailsCLI = config.wailsVersion === 3 ? 'wails3' : 'wails';
  const installCmd = config.wailsVersion === 3
    ? 'go install github.com/wailsapp/wails/v3/cmd/wails3@latest'
    : 'go install github.com/wailsapp/wails/v2/cmd/wails@latest';

  return `name: Build & Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    runs-on: \${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Install Linux dependencies
          if: runner.os == 'Linux'
          run: |
          sudo apt update
          sudo apt install -y \
              libgtk-3-dev \
              libwebkit2gtk-4.0-dev \
              pkg-config \
              gcc
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Wails
        run: ${installCmd}
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: ${wailsCLI} build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${config.projectName}-\${{ matrix.os }}
          path: build/bin/
  
  release:
    needs: build
    runs-on: ubuntu-22.04
    if: startsWith(github.ref, 'refs/tags/')
    
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            ${config.projectName}-ubuntu-22.04/*
            ${config.projectName}-macos-latest/*
            ${config.projectName}-windows-latest/*
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}
