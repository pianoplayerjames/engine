import { proxy, useSnapshot } from 'valtio'
import { autoSaveManager } from '@/plugins/core/AutoSaveManager.js'
import { updateUISetting } from '@/plugins/editor/utils/localStorage.js'

// Default UI settings (no longer from localStorage)
const defaultUISettings = {
  panels: {
    rightPanelWidth: 304,
    bottomPanelHeight: 256,
    scenePropertiesHeight: 300,
    assetsLibraryWidth: 250,
    rightPropertiesMenuPosition: 'right',
  },
  settings: {
    gridSettings: {
      enabled: true,
      size: 100,
      cellSize: 1,
      cellThickness: 1.0,
      cellColor: '#6B7280',
      sectionSize: 10,
      sectionThickness: 2.0,
      sectionColor: '#9CA3AF',
      position: [0, -1, 0],
      fadeDistance: 50,
      fadeStrength: 0.5,
      infiniteGrid: true
    },
    viewportSettings: {
      backgroundColor: '#1a202c'
    }
  },
  bottomTabs: {
    selectedTab: 'assets',
    tabOrder: [
      'assets', 'scripts', 'animation', 'node-editor', 'timeline', 'console',
      'materials', 'terrain', 'lighting', 'physics', 'audio', 'effects'
    ]
  },
  toolbar: {
    selectedTool: 'scene',
    tabOrder: [
      'scene', 'light', 'effects', 'folder', 'star', 'wifi', 'cloud', 'monitor'
    ],
    bottomTabOrder: [
      'add', 'settings', 'fullscreen'
    ]
  },
  topLeftMenu: {
    selectedItem: null
  }
}

// Create the reactive state proxy
export const editorState = proxy({
  // Editor state
  isOpen: false,
  mode: 'scene', // scene, assets, settings, console
  
  // UI Layout Settings (now auto-saved via AutoSaveManager)
  ui: {
    rightPanelWidth: defaultUISettings.panels.rightPanelWidth,
    bottomPanelHeight: defaultUISettings.panels.bottomPanelHeight,
    scenePropertiesHeight: defaultUISettings.panels.scenePropertiesHeight,
    assetsLibraryWidth: defaultUISettings.panels.assetsLibraryWidth,
    rightPropertiesMenuPosition: defaultUISettings.panels.rightPropertiesMenuPosition,
    selectedTool: defaultUISettings.toolbar.selectedTool,
    selectedBottomTab: defaultUISettings.bottomTabs.selectedTab,
    bottomTabOrder: defaultUISettings.bottomTabs.tabOrder,
    toolbarTabOrder: defaultUISettings.toolbar.tabOrder,
    toolbarBottomTabOrder: defaultUISettings.toolbar.bottomTabOrder,
    topLeftMenuSelected: defaultUISettings.topLeftMenu.selectedItem,
  },

  // Camera state (now persisted!)
  camera: {
    position: [0, 0, 5],
    target: [0, 0, 0],
    zoom: 1,
    fov: 75
  },
  
  // Panel visibility
  panels: {
    hierarchy: true,
    inspector: true,
    console: false,
    assets: false,
    isScenePanelOpen: true,
    isAssetPanelOpen: true,
    isResizingPanels: false,
  },
  
  // Selection
  selection: {
    entity: null,
    object: null, // 3D object reference for transform controls
    transformMode: 'select', // 'select', 'move', 'rotate', 'scale'
  },
  
  // Scene objects (3D objects in the viewport)
  sceneObjects: [
    {
      id: 'cube-1',
      name: 'Cube',
      type: 'mesh',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      geometry: 'box',
      material: { color: '#FFA500' },
      visible: true
    },
    {
      id: 'sphere-1', 
      name: 'Sphere',
      type: 'mesh',
      position: [2, 0, 0],
      rotation: [0, 0, 0], 
      scale: [1, 1, 1],
      geometry: 'sphere',
      material: { color: '#ADD8E6' },
      visible: true
    }
  ],
  
  // Editor settings
  settings: {
    grid: defaultUISettings.settings.gridSettings,
    viewport: defaultUISettings.settings.viewportSettings,
    editor: {
      gridSize: 1,
      snapToGrid: false,
      showGrid: true,
      showWireframe: false,
      cameraSpeed: 1.0
    }
  },
  
  // Console
  console: {
    messages: [],
    handler: null,
  },
})

// Actions that mutate the state directly
export const editorActions = {
  // Basic editor actions
  toggle: () => {
    editorState.isOpen = !editorState.isOpen
  },
  
  open: () => {
    editorState.isOpen = true
  },
  
  close: () => {
    editorState.isOpen = false
  },
  
  setMode: (mode) => {
    editorState.mode = mode
  },
  
  // Panel management
  togglePanel: (panel) => {
    editorState.panels[panel] = !editorState.panels[panel]
  },
  
  setIsScenePanelOpen: (isOpen) => {
    editorState.panels.isScenePanelOpen = isOpen
  },
  
  setIsAssetPanelOpen: (isOpen) => {
    editorState.panels.isAssetPanelOpen = isOpen
  },
  
  setIsResizingPanels: (isResizing) => {
    editorState.panels.isResizingPanels = isResizing
  },
  
  // Selection
  setSelectedEntity: (entityId) => {
    editorState.selection.entity = entityId
  },
  
  setSelectedObject: (object) => {
    editorState.selection.object = object
  },
  
  setTransformMode: (mode) => {
    editorState.selection.transformMode = mode
  },
  
  // Settings updates
  updateEditorSettings: (newSettings) => {
    Object.assign(editorState.settings.editor, newSettings)
  },

  updateGridSettings: (newGridSettings) => {
    Object.assign(editorState.settings.grid, newGridSettings)
    updateUISetting('settings.gridSettings', editorState.settings.grid)
  },

  updateViewportSettings: (newViewportSettings) => {
    Object.assign(editorState.settings.viewport, newViewportSettings)
    updateUISetting('settings.viewportSettings', editorState.settings.viewport)
  },

  // UI Layout Actions (auto-saved via AutoSaveManager)
  setRightPanelWidth: (width) => {
    editorState.ui.rightPanelWidth = width
  },

  setBottomPanelHeight: (height) => {
    editorState.ui.bottomPanelHeight = height
  },

  setScenePropertiesHeight: (height) => {
    editorState.ui.scenePropertiesHeight = height
  },

  setAssetsLibraryWidth: (width) => {
    editorState.ui.assetsLibraryWidth = width
  },

  setRightPropertiesMenuPosition: (position) => {
    editorState.ui.rightPropertiesMenuPosition = position
  },

  setSelectedTool: (tool) => {
    editorState.ui.selectedTool = tool
  },

  setSelectedBottomTab: (tab) => {
    editorState.ui.selectedBottomTab = tab
  },

  setBottomTabOrder: (tabOrder) => {
    editorState.ui.bottomTabOrder = tabOrder
  },

  setToolbarTabOrder: (tabOrder) => {
    editorState.ui.toolbarTabOrder = tabOrder
  },

  setToolbarBottomTabOrder: (tabOrder) => {
    editorState.ui.toolbarBottomTabOrder = tabOrder
  },

  setTopLeftMenuSelected: (item) => {
    editorState.ui.topLeftMenuSelected = item
  },

  // Camera actions (now persisted!)
  setCameraPosition: (position) => {
    editorState.camera.position = position
  },

  setCameraTarget: (target) => {
    editorState.camera.target = target
  },

  setCameraZoom: (zoom) => {
    editorState.camera.zoom = zoom
  },

  setCameraFOV: (fov) => {
    editorState.camera.fov = fov
  },
  
  // Console management
  addConsoleMessage: (message, type = 'info') => {
    editorState.console.messages.push({
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    })
  },
  
  clearConsole: () => {
    editorState.console.messages.length = 0
  },
  
  setContextMenuHandler: (handler) => {
    editorState.console.handler = handler
  },
  
  // Scene object management
  addSceneObject: (object) => {
    const objectWithId = { 
      id: `${object.type}-${Date.now()}`, 
      ...object 
    }
    editorState.sceneObjects.push(objectWithId)
    return objectWithId
  },
  
  removeSceneObject: (id) => {
    const index = editorState.sceneObjects.findIndex(obj => obj.id === id)
    if (index >= 0) {
      editorState.sceneObjects.splice(index, 1)
    }
  },
  
  updateSceneObject: (id, updates) => {
    const object = editorState.sceneObjects.find(obj => obj.id === id)
    if (object) {
      Object.assign(object, updates)
    }
  }
}

// Register editor store with AutoSaveManager (no localStorage)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    autoSaveManager.registerStore('editor', editorState, {
      extractSaveData: () => ({
        ui: { ...editorState.ui },
        camera: { ...editorState.camera },
        settings: { ...editorState.settings },
        panels: { ...editorState.panels },
        sceneObjects: [...editorState.sceneObjects]
        // Don't save console messages, or selection state
      }),
      restoreData: (data) => {
        if (data.ui) Object.assign(editorState.ui, data.ui)
        if (data.camera) Object.assign(editorState.camera, data.camera)
        if (data.settings) Object.assign(editorState.settings, data.settings)
        if (data.panels) Object.assign(editorState.panels, data.panels)
        if (data.sceneObjects) editorState.sceneObjects = data.sceneObjects
      }
    })
  }, 100)
}