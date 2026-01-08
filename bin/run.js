#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Import and run the CLI
const cliPath = join(__dirname, '..', 'dist', 'index.js');

import(cliPath).catch((error) => {
  console.error('Failed to load CLI:', error);
  process.exit(1);
});
