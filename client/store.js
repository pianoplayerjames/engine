import { proxy, ref } from 'valtio'
import { devtools } from 'valtio/utils'

// External Babylon.js scene reference (not in Valtio store to avoid performance issues)
export let babylonScene = { current: null }

// Helper to sync Babylon.js scene to lightweight store metadata
const syncSceneToStore = (scene) => {
  if (!scene) {
    globalStore.editor.scene.isLoaded = false
    globalStore.editor.scene.objects.meshes = []
    globalStore.editor.scene.objects.lights = []
    globalStore.editor.scene.objects.cameras = []
    globalStore.editor.scene.hierarchy = []
    return
  }

  // Extract lightweight mesh data
  const meshes = (scene.meshes || []).map(mesh => ({
    id: mesh.uniqueId || mesh.name || `mesh-${Math.random()}`,
    name: mesh.name || 'Unnamed Mesh',
    type: 'mesh',
    visible: mesh.isVisible !== undefined ? mesh.isVisible : true,
    position: mesh.position ? [mesh.position.x, mesh.position.y, mesh.position.z] : [0, 0, 0]
  }))

  // Extract lightweight light data
  const lights = (scene.lights || []).map(light => ({
    id: light.uniqueId || light.name || `light-${Math.random()}`,
    name: light.name || 'Unnamed Light',
    type: 'light',
    intensity: light.intensity !== undefined ? light.intensity : 1
  }))

  // Extract lightweight camera data
  const cameras = (scene.cameras || []).map(camera => ({
    id: camera.uniqueId || camera.name || `camera-${Math.random()}`,
    name: camera.name || 'Unnamed Camera',
    type: 'camera',
    active: scene.activeCamera === camera
  }))

  // Build hierarchy
  const hierarchy = [
    {
      id: 'scene-root',
      name: globalStore.editor.scene.name,
      type: 'scene',
      children: [
        ...meshes.map(m => m.id),
        ...lights.map(l => l.id),
        ...cameras.map(c => c.id)
      ]
    }
  ]

  // Update store
  globalStore.editor.scene.isLoaded = true
  globalStore.editor.scene.objects.meshes = meshes
  globalStore.editor.scene.objects.lights = lights
  globalStore.editor.scene.objects.cameras = cameras
  globalStore.editor.scene.hierarchy = hierarchy
}

// Create the global store
export const globalStore = proxy({
  editor: {
    isOpen: false,
    mode: 'scene',
    
    // UI settings
    ui: {
      rightPanelWidth: 304,
      bottomPanelHeight: 256,
      scenePropertiesHeight: 300,
      selectedTool: 'scene',
      selectedBottomTab: 'assets',
      // Toolbar configuration
      toolbarTabOrder: [
        'scene', 'light', 'effects', 'folder', 'star', 'wifi', 'cloud', 'monitor'
      ],
      toolbarBottomTabOrder: [
        'add', 'settings', 'fullscreen'
      ],
      // Bottom tabs configuration
      bottomTabOrder: [
        'assets'
      ]
    },
    
    // Panel state
    panels: {
      isResizingPanels: false,
      isScenePanelOpen: true,
      isAssetPanelOpen: true
    },
    
    // Selection
    selection: {
      entity: null,
      object: null,
      transformMode: 'select'
    },
    
    // Scene state - lightweight metadata for UI reactivity
    scene: {
      isLoaded: false,
      name: 'Untitled Scene',
      selectedObjectId: null,
      
      // Lightweight object lists for UI (not full Babylon.js objects)
      objects: {
        meshes: [
          // { id: 'mesh-1', name: 'Cube', type: 'mesh', visible: true, position: [0,0,0] }
        ],
        lights: [
          // { id: 'light-1', name: 'Directional Light', type: 'light', intensity: 1 }
        ],
        cameras: [
          // { id: 'camera-1', name: 'Main Camera', type: 'camera', active: true }
        ]
      },
      
      // Scene hierarchy for tree view
      hierarchy: [
        // { id: 'scene-root', name: 'Scene', type: 'scene', children: ['mesh-1', 'light-1'] }
      ]
    },
    
    // Viewport state
    viewport: {
      showGrid: true,
      gridSnapping: false,
      renderMode: 'solid',
      // Multi-tab viewport system
      tabs: [
        {
          id: 'viewport-1',
          type: '3d-viewport',
          name: 'Scene 1',
          isPinned: false,
          hasUnsavedChanges: false
        }
      ],
      activeTabId: 'viewport-1',
      suspendedTabs: []
    },
    
    // Settings
    settings: {
      viewport: {
        backgroundColor: '#1a202c'
      },
      editor: {
        showStats: false
      },
      grid: {
        enabled: true,
        size: 100,
        cellSize: 1
      }
    },
    
    // Viewport camera (editor navigation only)
    viewportCamera: {
      speed: 5,
      mouseSensitivity: 0.002,
      mode: 'orbit', // orbit, fly, fps
      position: [0, 0, 5],
      target: [0, 0, 0]
    },
    
    // Backward compatibility - points to viewportCamera
    get camera() {
      return globalStore.editor.viewportCamera
    },
    
    // Console state
    console: {
      contextMenuHandler: null,
      messages: []
    }
  }
})

// Actions
export const actions = {
  editor: {
    toggleOpen: () => {
      globalStore.editor.isOpen = !globalStore.editor.isOpen
    },
    
    setSelectedTool: (tool) => {
      globalStore.editor.ui.selectedTool = tool
    },
    
    setSelectedEntity: (entityId) => {
      globalStore.editor.selection.entity = entityId
    },
    
    updateViewportSettings: (settings) => {
      Object.assign(globalStore.editor.settings.viewport, settings)
    },
    
    setBabylonScene: (scene) => {
      // Update external reference (not in Valtio store)
      babylonScene.current = scene
      
      // Sync lightweight metadata to store for UI reactivity
      syncSceneToStore(scene)
      
      console.log('Babylon.js scene updated:', scene ? 'loaded' : 'cleared')
    },
    
    updateBabylonScene: (scene) => {
      // Same as setBabylonScene for consistency
      babylonScene.current = scene
      syncSceneToStore(scene)
    },
    
    // Panel actions
    setScenePanelOpen: (isOpen) => {
      globalStore.editor.panels.isScenePanelOpen = isOpen
    },
    
    setAssetPanelOpen: (isOpen) => {
      globalStore.editor.panels.isAssetPanelOpen = isOpen
    },
    
    setResizingPanels: (isResizing) => {
      globalStore.editor.panels.isResizingPanels = isResizing
    },
    
    // Console actions
    setContextMenuHandler: (handler) => {
      globalStore.editor.console.contextMenuHandler = handler
    },
    
    addConsoleMessage: (message, type = 'info') => {
      globalStore.editor.console.messages.push({
        message,
        type,
        timestamp: Date.now()
      })
    },
    
    // Viewport actions
    setShowGrid: (show) => {
      globalStore.editor.viewport.showGrid = show
    },
    
    setGridSnapping: (snap) => {
      globalStore.editor.viewport.gridSnapping = snap
    },
    
    setRenderMode: (mode) => {
      globalStore.editor.viewport.renderMode = mode
    },
    
    // Viewport camera actions (editor navigation)
    setCameraSpeed: (speed) => {
      globalStore.editor.viewportCamera.speed = speed
    },
    
    setCameraSensitivity: (sensitivity) => {
      globalStore.editor.viewportCamera.mouseSensitivity = sensitivity
    },
    
    setViewportCameraMode: (mode) => {
      globalStore.editor.viewportCamera.mode = mode
    },
    
    updateViewportCamera: (settings) => {
      Object.assign(globalStore.editor.viewportCamera, settings)
    },
    
    // Transform actions
    setTransformMode: (mode) => {
      globalStore.editor.selection.transformMode = mode
    },
    
    // Grid actions
    updateGridSettings: (settings) => {
      Object.assign(globalStore.editor.settings.grid, settings)
    },
    
    // Viewport tab actions
    setActiveViewportTab: (tabId) => {
      globalStore.editor.viewport.activeTabId = tabId
    },
    
    addViewportTab: (tab) => {
      globalStore.editor.viewport.tabs.push(tab)
    },
    
    removeViewportTab: (tabId) => {
      const tabs = globalStore.editor.viewport.tabs
      const index = tabs.findIndex(tab => tab.id === tabId)
      if (index !== -1) {
        tabs.splice(index, 1)
      }
    },
    
    // Toolbar actions
    setToolbarTabOrder: (order) => {
      globalStore.editor.ui.toolbarTabOrder = order
    },
    
    setToolbarBottomTabOrder: (order) => {
      globalStore.editor.ui.toolbarBottomTabOrder = order
    },
    
    // Bottom tabs actions
    setBottomTabOrder: (order) => {
      globalStore.editor.ui.bottomTabOrder = order
    },
    
    // Local storage hydration
    hydrateFromLocalStorage: () => {
      // This would load saved UI state from localStorage
      // For now, just a placeholder function
      console.log('Hydrating from localStorage...')
    },
    
    // Stats actions
    toggleStats: () => {
      globalStore.editor.settings.editor.showStats = !globalStore.editor.settings.editor.showStats
    },
    
    updateEditorSettings: (settings) => {
      Object.assign(globalStore.editor.settings.editor, settings)
    },
    
    // Scene metadata actions
    updateSceneMetadata: (metadata) => {
      Object.assign(globalStore.editor.scene, metadata)
    },
    
    setSceneName: (name) => {
      globalStore.editor.scene.name = name
    },
    
    // Scene object management actions
    selectSceneObject: (objectId) => {
      globalStore.editor.scene.selectedObjectId = objectId
    },
    
    updateSceneObjectProperty: (objectId, property, value) => {
      // Update in lightweight store
      const meshes = globalStore.editor.scene.objects.meshes
      const lights = globalStore.editor.scene.objects.lights
      const cameras = globalStore.editor.scene.objects.cameras
      
      const allObjects = [...meshes, ...lights, ...cameras]
      const object = allObjects.find(obj => obj.id === objectId)
      
      if (object && property in object) {
        object[property] = value
        
        // Also update the actual Babylon.js object if needed
        const scene = babylonScene.current
        if (scene) {
          const babylonObject = [...(scene.meshes || []), ...(scene.lights || []), ...(scene.cameras || [])]
            .find(obj => (obj.uniqueId || obj.name) === objectId)
          
          if (babylonObject && property === 'visible' && 'isVisible' in babylonObject) {
            babylonObject.isVisible = value
          }
        }
      }
    },
    
    refreshSceneData: () => {
      // Re-sync from Babylon.js scene
      syncSceneToStore(babylonScene.current)
    }
  }
}

// Setup devtools in browser
if (typeof window !== 'undefined') {
  try {
    devtools(globalStore, {
      name: 'Global Store',
      enabled: true
    })
    console.log('✅ Valtio devtools enabled')
    
    // Expose for debugging
    window.globalStore = globalStore
    window.actions = actions
    
  } catch (error) {
    console.error('Failed to setup devtools:', error)
  }
}