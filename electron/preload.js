import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // File system operations
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Platform information
  platform: process.platform,
  
  // Check if running in Electron
  isElectron: true,
  
  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Expose a limited set of Node.js APIs if needed
contextBridge.exposeInMainWorld('nodeAPI', {
  // Path utilities (safe to expose)
  path: {
    join: (...args) => require('path').join(...args),
    dirname: (path) => require('path').dirname(path),
    basename: (path) => require('path').basename(path),
    extname: (path) => require('path').extname(path)
  }
});

// Window management
contextBridge.exposeInMainWorld('windowAPI', {
  // You can add window-specific APIs here if needed
  // For example: minimize, maximize, close, etc.
});

console.log('Preload script loaded successfully');