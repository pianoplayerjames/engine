# Electron Desktop App Setup

Your Vite SSR application has been configured to run as an Electron desktop app. This setup includes both the client-side React app and the Fastify SSR server running within Electron.

## Architecture

- **Main Process** (`electron/main.js`): Manages the application window and server process
- **Preload Script** (`electron/preload.js`): Security layer for renderer-main communication
- **Server Process**: Your existing Fastify server runs as a child process
- **Renderer Process**: Your React app loaded in the Electron window

## Development

### Start Development Mode
```bash
npm run electron:dev
```

This will:
1. Start your Vite dev server with hot reload
2. Wait for the server to be ready
3. Launch Electron with the app loaded
4. Open DevTools automatically in development

### Alternative Development Commands
```bash
# Just run Electron (requires server to be running)
npm run electron

# Start server separately (if needed)
npm run dev
```

## Production Build

### Build for Current Platform
```bash
npm run electron:dist
```

### Build for Specific Platforms
```bash
# macOS (DMG and ZIP)
npm run electron:dist-mac

# Windows (NSIS installer and portable)
npm run electron:dist-win

# Linux (AppImage and DEB)
npm run electron:dist-linux
```

### Test Production Build
```bash
npm run electron:pack
```

## Configuration

### App Metadata
Edit `package.json` build section:
- `appId`: Your unique app identifier
- `productName`: Display name for the app
- `directories.output`: Where built apps are saved

### Icons
Place your app icons in the `assets/` directory:
- `icon.icns` for macOS
- `icon.ico` for Windows  
- `icon.png` for Linux

### Security
The app uses:
- **Context Isolation**: Renderer and main processes are isolated
- **No Node Integration**: Renderer can't access Node.js directly
- **Preload Script**: Secure API exposure via `contextBridge`

## Available APIs

Your renderer process can access:

```javascript
// Check if running in Electron
if (window.electronAPI) {
  // Get app information
  const appInfo = await window.electronAPI.getAppInfo();
  
  // Open external links
  window.electronAPI.openExternal('https://example.com');
  
  // Show file in folder
  window.electronAPI.showItemInFolder('/path/to/file');
  
  // Platform info
  console.log(window.electronAPI.platform); // 'darwin', 'win32', 'linux'
  
  // Version info
  console.log(window.electronAPI.versions);
}
```

## Troubleshooting

### Server Not Starting
- Check that port 3000 is available
- Look for errors in the Electron console
- Try `npm run dev` separately to test the server

### Build Errors
- Make sure you've run `npm run build` first
- Check that all dependencies are installed
- Verify icon files exist in the correct formats

### Performance
- The server runs as a separate process for better performance
- DevTools are only opened in development mode
- Production builds are optimized for size and startup time

## File Structure
```
/electron/
  ├── main.js          # Main Electron process
  ├── preload.js       # Security preload script
  └── dev.js           # Development helper

/assets/
  ├── icon.png         # Linux icon
  ├── icon.ico         # Windows icon
  └── icon.icns        # macOS icon (convert from PNG)

/dist-electron/        # Built desktop apps
```

## Next Steps

1. **Customize Icons**: Replace the placeholder icon with your app's branding
2. **App Metadata**: Update app name, description, and IDs in package.json
3. **Auto Updates**: Consider adding electron-updater for automatic updates
4. **Code Signing**: Set up code signing for distribution
5. **Native Modules**: Add any native dependencies if needed

Your SSR app is now ready to run as a desktop application! 🚀