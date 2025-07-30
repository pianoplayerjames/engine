#!/usr/bin/env node

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const port = process.env.PORT || 3000;

console.log('🚀 Starting Electron development mode...');

// Start the Vite dev server
console.log('📦 Starting Vite dev server...');
const viteProcess = spawn('npm', ['run', 'dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

// Function to check if server is ready
const checkServer = async () => {
  try {
    const response = await fetch(`http://localhost:${port}`);
    return response.ok;
  } catch {
    return false;
  }
};

// Wait for server to be ready, then start Electron
const waitForServer = async () => {
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds timeout
  
  while (attempts < maxAttempts) {
    if (await checkServer()) {
      console.log('✅ Server is ready, starting Electron...');
      
      // Start Electron
      const electronProcess = spawn('electron', ['.'], {
        cwd: projectRoot,
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'development'
        }
      });
      
      electronProcess.on('close', () => {
        console.log('🔴 Electron closed, stopping dev server...');
        viteProcess.kill();
        process.exit(0);
      });
      
      return;
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (attempts % 10 === 0) {
      console.log(`⏳ Waiting for server... (${attempts}/${maxAttempts})`);
    }
  }
  
  console.error('❌ Server failed to start within timeout');
  viteProcess.kill();
  process.exit(1);
};

// Handle cleanup
process.on('SIGINT', () => {
  console.log('🔴 Stopping development servers...');
  viteProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  viteProcess.kill();
  process.exit(0);
});

// Start waiting for server
waitForServer();