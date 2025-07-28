import { proxy, subscribe, useSnapshot } from 'valtio'
import { loadUISettings, saveUISettings, updateUISetting, defaultUISettings } from './utils/localStorage.js'

// Always use defaults for initial render to prevent hydration mismatch
// Will be hydrated after mount
const initialUISettings = defaultUISettings;

// Create the reactive state proxy
export const editorState = proxy({
  // Editor state
  isOpen: false,
  mode: 'scene', // scene, assets, settings, console
  
  // UI Layout Settings (persisted)
  ui: {
    rightPanelWidth: initialUISettings.panels.rightPanelWidth,
    bottomPanelHeight: initialUISettings.panels.bottomPanelHeight,
    scenePropertiesHeight: initialUISettings.panels.scenePropertiesHeight,
    assetsLibraryWidth: initialUISettings.panels.assetsLibraryWidth,
    rightPropertiesMenuPosition: initialUISettings.panels.rightPropertiesMenuPosition,
    selectedTool: initialUISettings.toolbar.selectedTool,
    selectedBottomTab: initialUISettings.bottomTabs.selectedTab,
    bottomTabOrder: initialUISettings.bottomTabs.tabOrder,
    toolbarTabOrder: initialUISettings.toolbar.tabOrder,
    toolbarBottomTabOrder: initialUISettings.toolbar.bottomTabOrder,
    topLeftMenuSelected: initialUISettings.topLeftMenu.selectedItem,
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
      material: { color: 'orange' },
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
      material: { color: 'lightblue' },
      visible: true
    }
  ],
  
  // Editor settings
  settings: {
    grid: initialUISettings.settings.gridSettings,
    viewport: initialUISettings.settings.viewportSettings,
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

  // UI Layout Actions (with persistence)
  setRightPanelWidth: (width) => {
    editorState.ui.rightPanelWidth = width
    updateUISetting('panels.rightPanelWidth', width)
  },

  setBottomPanelHeight: (height) => {
    editorState.ui.bottomPanelHeight = height
    updateUISetting('panels.bottomPanelHeight', height)
  },

  setScenePropertiesHeight: (height) => {
    editorState.ui.scenePropertiesHeight = height
    updateUISetting('panels.scenePropertiesHeight', height)
  },

  setAssetsLibraryWidth: (width) => {
    editorState.ui.assetsLibraryWidth = width
    updateUISetting('panels.assetsLibraryWidth', width)
  },

  setRightPropertiesMenuPosition: (position) => {
    editorState.ui.rightPropertiesMenuPosition = position
    updateUISetting('panels.rightPropertiesMenuPosition', position)
  },

  setSelectedTool: (tool) => {
    editorState.ui.selectedTool = tool
    updateUISetting('toolbar.selectedTool', tool)
  },

  setSelectedBottomTab: (tab) => {
    editorState.ui.selectedBottomTab = tab
    updateUISetting('bottomTabs.selectedTab', tab)
  },

  setBottomTabOrder: (tabOrder) => {
    editorState.ui.bottomTabOrder = tabOrder
    updateUISetting('bottomTabs.tabOrder', tabOrder)
  },

  setToolbarTabOrder: (tabOrder) => {
    editorState.ui.toolbarTabOrder = tabOrder
    updateUISetting('toolbar.tabOrder', tabOrder)
  },

  setToolbarBottomTabOrder: (tabOrder) => {
    editorState.ui.toolbarBottomTabOrder = tabOrder
    updateUISetting('toolbar.bottomTabOrder', tabOrder)
  },

  setTopLeftMenuSelected: (item) => {
    editorState.ui.topLeftMenuSelected = item
    updateUISetting('topLeftMenu.selectedItem', item)
  },

  // Hydration action to load localStorage values on client
  hydrateFromLocalStorage: () => {
    if (typeof window !== 'undefined') {
      const storedSettings = loadUISettings()
      
      // Direct assignment to Valtio proxy
      editorState.ui.rightPanelWidth = storedSettings.panels.rightPanelWidth
      editorState.ui.bottomPanelHeight = storedSettings.panels.bottomPanelHeight
      editorState.ui.scenePropertiesHeight = storedSettings.panels.scenePropertiesHeight
      editorState.ui.assetsLibraryWidth = storedSettings.panels.assetsLibraryWidth
      editorState.ui.rightPropertiesMenuPosition = storedSettings.panels.rightPropertiesMenuPosition
      editorState.ui.selectedTool = storedSettings.toolbar.selectedTool
      editorState.ui.selectedBottomTab = storedSettings.bottomTabs.selectedTab
      editorState.ui.bottomTabOrder = storedSettings.bottomTabs.tabOrder
      editorState.ui.toolbarTabOrder = storedSettings.toolbar.tabOrder
      editorState.ui.toolbarBottomTabOrder = storedSettings.toolbar.bottomTabOrder
      editorState.ui.topLeftMenuSelected = storedSettings.topLeftMenu.selectedItem
      
      Object.assign(editorState.settings.grid, storedSettings.settings.gridSettings)
      Object.assign(editorState.settings.viewport, storedSettings.settings.viewportSettings)
      
      // Panel states don't need persistence as they're UI state
      editorState.panels.isScenePanelOpen = true
      editorState.panels.isAssetPanelOpen = true
    }
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

// Set up automatic persistence for UI changes
if (typeof window !== 'undefined') {
  try {
    // Subscribe to the entire editor state for UI persistence
    subscribe(editorState, () => {
      // Batch persistence to avoid excessive localStorage writes
      const scheduleUpdate = window.requestIdleCallback || ((fn) => setTimeout(fn, 0))
      scheduleUpdate(() => {
        try {
          saveUISettings({
            panels: {
              rightPanelWidth: editorState.ui.rightPanelWidth,
              bottomPanelHeight: editorState.ui.bottomPanelHeight,
              scenePropertiesHeight: editorState.ui.scenePropertiesHeight,
              assetsLibraryWidth: editorState.ui.assetsLibraryWidth,
              rightPropertiesMenuPosition: editorState.ui.rightPropertiesMenuPosition,
            },
            toolbar: {
              selectedTool: editorState.ui.selectedTool,
              tabOrder: editorState.ui.toolbarTabOrder,
              bottomTabOrder: editorState.ui.toolbarBottomTabOrder,
            },
            bottomTabs: {
              selectedTab: editorState.ui.selectedBottomTab,
              tabOrder: editorState.ui.bottomTabOrder,
            },
            topLeftMenu: {
              selectedItem: editorState.ui.topLeftMenuSelected,
            },
            settings: {
              gridSettings: editorState.settings.grid,
              viewportSettings: editorState.settings.viewport,
            }
          })
        } catch (error) {
          console.warn('Failed to save UI settings:', error)
        }
      })
    })
  } catch (error) {
    console.warn('Failed to set up UI persistence:', error)
  }
}

// editorState and editorActions are already exported above