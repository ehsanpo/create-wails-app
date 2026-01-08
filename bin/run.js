#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the CLI
const cliPath = join(__dirname, '..', 'dist', 'index.js');
const cliURL = pathToFileURL(cliPath).href;

import(cliURL).catch((error) => {
  console.error('Failed to load CLI:', error);
  process.exit(1);
});
