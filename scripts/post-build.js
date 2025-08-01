#!/usr/bin/env node

import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, '..');
const clientDistDir = resolve(projectRoot, 'dist', 'client');
const htmlDir = resolve(clientDistDir, 'html');
const indexHtmlSrc = resolve(clientDistDir, 'index.html');
const indexHtmlDest = resolve(htmlDir, 'index.html');

console.log('🔧 Running post-build setup...');

// Create html directory if it doesn't exist
if (!existsSync(htmlDir)) {
  mkdirSync(htmlDir, { recursive: true });
  console.log('✅ Created html directory');
}

// Copy index.html to html/index.html if it doesn't exist
if (existsSync(indexHtmlSrc) && !existsSync(indexHtmlDest)) {
  copyFileSync(indexHtmlSrc, indexHtmlDest);
  console.log('✅ Copied index.html to html directory');
}

console.log('🚀 Post-build setup complete!');