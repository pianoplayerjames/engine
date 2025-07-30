import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Keep a global reference of the window object
let mainWindow;
let serverProcess;

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: join(__dirname, 'preload.js'),
      webSecurity: !isDev
    },
    icon: join(__dirname, '../assets/icon.png'), // You can add an icon later
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Load the app
  const startUrl = isDev 
    ? `http://localhost:${port}` 
    : `http://localhost:${port}`;
    
  mainWindow.loadURL(startUrl);

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in default browser
    if (url.startsWith('http://') || url.startsWith('https://')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = join(__dirname, '../server.js');
    
    if (!existsSync(serverPath)) {
      reject(new Error(`Server file not found: ${serverPath}`));
      return;
    }

    console.log('Starting server process...');
    
    // Start the Fastify server process
    serverProcess = spawn('node', [serverPath], {
      cwd: join(__dirname, '..'),
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        PORT: port.toString(),
        ELECTRON_MODE: 'true'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle server output
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (isDev) {
        console.log('[Server]', output.trim());
      }
      
      // Check if server is ready
      if (output.includes('Server running')) {
        console.log('Server is ready!');
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (isDev) {
        console.error('[Server Error]', error.trim());
      }
    });

    serverProcess.on('error', (error) => {
      console.error('Server process error:', error);
      reject(error);
    });

    let hasResolved = false;
    serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code ${code}`);
      if (!hasResolved && code !== 0 && code !== null) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Backup timeout in case we don't see the ready message
    setTimeout(() => {
      if (!hasResolved) {
        // Try to check if server is responding
        checkServerHealth()
          .then(() => {
            hasResolved = true;
            resolve();
          })
          .catch(() => {
            reject(new Error('Server failed to start within timeout'));
          });
      }
    }, 10000);
    
    // Prevent multiple resolves
    const originalResolve = resolve;
    resolve = (...args) => {
      if (!hasResolved) {
        hasResolved = true;
        originalResolve(...args);
      }
    };
  });
}

async function checkServerHealth() {
  let retries = 0;
  const maxRetries = 5;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    retries++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Server health check failed');
}

function stopServer() {
  if (serverProcess) {
    console.log('Stopping server process...');
    serverProcess.kill('SIGTERM');
    
    // Force kill after 5 seconds if not stopped gracefully
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        console.log('Force killing server process...');
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
    
    serverProcess = null;
  }
}

// App event handlers
app.whenReady().then(async () => {
  try {
    // In development, the server is already running via the dev script
    // In production, we need to start our own server
    if (!isDev) {
      await startServer();
    } else {
      // In development, just wait a moment for the dev server to be ready
      console.log('Development mode - using existing dev server');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Then create the window
    createWindow();
    
    app.on('activate', () => {
      // On macOS, re-create window when dock icon is clicked
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    stopServer();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

app.on('will-quit', () => {
  stopServer();
});

// IPC handlers
ipcMain.handle('get-app-info', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    isDev
  };
});

ipcMain.handle('show-item-in-folder', (event, path) => {
  require('electron').shell.showItemInFolder(path);
});

ipcMain.handle('open-external', (event, url) => {
  require('electron').shell.openExternal(url);
});

// Security: Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== `http://localhost:${port}`) {
      navigationEvent.preventDefault();
    }
  });
});

// Handle certificate errors in development
if (isDev) {
  app.commandLine.appendSwitch('ignore-certificate-errors');
}