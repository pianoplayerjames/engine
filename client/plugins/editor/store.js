import { create } from 'zustand'

export const useEditorStore = create((set, get) => ({
  // Editor state
  isOpen: false,
  mode: 'scene', // scene, assets, settings, console
  
  // Panel visibility
  panels: {
    hierarchy: true,
    inspector: true,
    console: false,
    assets: false
  },
  
  // Selection
  selectedEntity: null,
  
  // Editor settings
  settings: {
    gridSize: 1,
    snapToGrid: false,
    showGrid: true,
    showWireframe: false,
    cameraSpeed: 1.0
  },
  
  // Console
  consoleMessages: [],
  
  // Actions
  toggle: () => set(state => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  
  setMode: (mode) => set({ mode }),
  
  togglePanel: (panel) => set(state => ({
    panels: {
      ...state.panels,
      [panel]: !state.panels[panel]
    }
  })),
  
  setSelectedEntity: (entityId) => set({ selectedEntity: entityId }),
  
  updateSettings: (newSettings) => set(state => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  addConsoleMessage: (message, type = 'info') => set(state => ({
    consoleMessages: [
      ...state.consoleMessages,
      {
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      }
    ]
  })),
  
  clearConsole: () => set({ consoleMessages: [] })
}))