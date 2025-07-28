import { proxy, subscribe } from 'valtio'
import { subscribeKey } from 'valtio/utils'

// Single unified state for the entire application
export const appState = proxy({
  // Project data
  project: {
    name: 'UntitledProject',
    path: null,
    lastSaved: null,
    isModified: false
  },

  // Scene data (currently in sceneState)
  scene: {
    entities: new Map(),
    entityCounter: 0,
    sceneRoot: null,
    selectedEntity: null,
    sceneObjects: [] // Legacy format
  },

  // UI state (currently split between localStorage and editorState)
  ui: {
    // Panel dimensions
    rightPanelWidth: 304,
    bottomPanelHeight: 256,
    scenePropertiesHeight: 300,
    assetsLibraryWidth: 250,
    
    // Panel visibility
    isScenePanelOpen: true,
    isAssetPanelOpen: true,
    isResizingPanels: false,
    
    // Tool selections
    selectedTool: 'scene',
    selectedBottomTab: 'assets',
    topLeftMenuSelected: null,
    
    // Tab orders
    bottomTabOrder: ['assets', 'scripts', 'animation', 'node-editor', 'timeline', 'console'],
    toolbarTabOrder: ['scene', 'light', 'effects', 'folder', 'star', 'wifi', 'cloud', 'monitor'],
    toolbarBottomTabOrder: ['add', 'settings', 'fullscreen']
  },

  // Viewport state (currently not persisted)
  viewport: {
    camera: {
      position: [0, 0, 5],
      target: [0, 0, 0],
      zoom: 1
    },
    grid: {
      enabled: true,
      size: 100,
      cellSize: 1,
      color: '#6B7280'
    },
    backgroundColor: '#1a202c',
    showWireframe: false,
    showStats: false
  },

  // Editor settings
  editor: {
    snapToGrid: false,
    gridSize: 1,
    cameraSpeed: 1.0,
    autoSave: true,
    autoSaveInterval: 30000
  }
})

// Actions for the unified state
export const appActions = {
  // Project actions
  setProject: (projectData) => {
    Object.assign(appState.project, projectData)
    appState.project.isModified = true
  },

  markSaved: () => {
    appState.project.lastSaved = new Date().toISOString()
    appState.project.isModified = false
  },

  // UI actions
  setRightPanelWidth: (width) => {
    appState.ui.rightPanelWidth = width
  },

  setBottomPanelHeight: (height) => {
    appState.ui.bottomPanelHeight = height
  },

  setSelectedTool: (tool) => {
    appState.ui.selectedTool = tool
  },

  toggleScenePanel: () => {
    appState.ui.isScenePanelOpen = !appState.ui.isScenePanelOpen
  },

  // Viewport actions
  setCameraPosition: (position) => {
    appState.viewport.camera.position = position
  },

  setCameraTarget: (target) => {
    appState.viewport.camera.target = target
  },

  setGridEnabled: (enabled) => {
    appState.viewport.grid.enabled = enabled
  },

  // Scene actions
  addSceneObject: (object) => {
    const objectWithId = { 
      id: `${object.type}-${Date.now()}`, 
      ...object 
    }
    appState.scene.sceneObjects.push(objectWithId)
    appState.project.isModified = true
    return objectWithId
  },

  removeSceneObject: (id) => {
    const index = appState.scene.sceneObjects.findIndex(obj => obj.id === id)
    if (index >= 0) {
      appState.scene.sceneObjects.splice(index, 1)
      appState.project.isModified = true
    }
  },

  updateSceneObject: (id, updates) => {
    const object = appState.scene.sceneObjects.find(obj => obj.id === id)
    if (object) {
      Object.assign(object, updates)
      appState.project.isModified = true
    }
  }
}

// Single auto-save system for complete application state
export class UnifiedAutoSave {
  constructor() {
    this.saveTimeout = null
    this.isEnabled = true
  }

  start() {
    if (typeof window === 'undefined') return

    // Subscribe to entire app state
    subscribe(appState, () => {
      if (!this.isEnabled) return
      
      // Debounce saves
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout)
      }
      
      this.saveTimeout = setTimeout(() => {
        this.saveSnapshot()
      }, 1000) // Debounce 1 second
    })

    console.log('🔄 Unified auto-save system started')
  }

  async saveSnapshot() {
    try {
      const snapshot = {
        timestamp: new Date().toISOString(),
        project: { ...appState.project },
        scene: {
          ...appState.scene,
          entities: Array.from(appState.scene.entities.entries()) // Convert Map to Array
        },
        ui: { ...appState.ui },
        viewport: { ...appState.viewport },
        editor: { ...appState.editor }
      }

      // Save to localStorage (local backup)
      localStorage.setItem('renzora-app-snapshot', JSON.stringify(snapshot))
      
      // Save project data to server (if project exists)
      if (appState.project.name && appState.project.path) {
        await this.saveToServer(snapshot)
      }

      appActions.markSaved()
      console.log('📸 App snapshot saved')

    } catch (error) {
      console.warn('Failed to save app snapshot:', error)
    }
  }

  async saveToServer(snapshot) {
    const response = await fetch(`/api/projects/${appState.project.path}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scene: snapshot.scene,
        editor: {
          viewport: snapshot.viewport,
          settings: snapshot.editor
        }
      })
    })

    if (!response.ok) {
      throw new Error('Server save failed')
    }
  }

  loadSnapshot() {
    try {
      const saved = localStorage.getItem('renzora-app-snapshot')
      if (!saved) return false

      const snapshot = JSON.parse(saved)
      
      // Restore state
      Object.assign(appState.project, snapshot.project)
      Object.assign(appState.scene, {
        ...snapshot.scene,
        entities: new Map(snapshot.scene.entities) // Convert Array back to Map
      })
      Object.assign(appState.ui, snapshot.ui)
      Object.assign(appState.viewport, snapshot.viewport)
      Object.assign(appState.editor, snapshot.editor)

      console.log('📸 App snapshot restored from localStorage')
      return true

    } catch (error) {
      console.warn('Failed to load app snapshot:', error)
      return false
    }
  }

  disable() {
    this.isEnabled = false
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
  }

  enable() {
    this.isEnabled = true
  }
}

// Create global auto-save instance
export const autoSave = new UnifiedAutoSave()

// Start auto-save when module loads
if (typeof window !== 'undefined') {
  autoSave.start()
  
  // Try to restore from localStorage on startup
  setTimeout(() => {
    autoSave.loadSnapshot()
  }, 100)
}