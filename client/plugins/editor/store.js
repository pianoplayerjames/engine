import { create } from 'zustand'
import { loadUISettings, saveUISettings, updateUISetting } from './utils/localStorage.js'

// Load initial UI settings from localStorage
const initialUISettings = loadUISettings()

export const useEditorStore = create((set, get) => ({
  // Editor state
  isOpen: false,
  mode: 'scene', // scene, assets, settings, console
  
  // UI Layout Settings (persisted)
  rightPanelWidth: initialUISettings.panels.rightPanelWidth,
  bottomPanelHeight: initialUISettings.panels.bottomPanelHeight,
  assetsLibraryWidth: initialUISettings.panels.assetsLibraryWidth,
  rightPropertiesMenuPosition: initialUISettings.panels.rightPropertiesMenuPosition,
  selectedTool: initialUISettings.toolbar.selectedTool,
  selectedBottomTab: initialUISettings.bottomTabs.selectedTab,
  bottomTabOrder: initialUISettings.bottomTabs.tabOrder,
  toolbarTabOrder: initialUISettings.toolbar.tabOrder,
  toolbarBottomTabOrder: initialUISettings.toolbar.bottomTabOrder,
  topLeftMenuSelected: initialUISettings.topLeftMenu.selectedItem,
  
  // Panel visibility
  panels: {
    hierarchy: true,
    inspector: true,
    console: false,
    assets: false
  },
  
  // Selection
  selectedEntity: null,
  selectedObject: null, // 3D object reference for transform controls
  
  // Transform controls
  transformMode: 'select', // 'select', 'move', 'rotate', 'scale'
  
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
    gridSize: 1,
    snapToGrid: false,
    showGrid: true,
    showWireframe: false,
    cameraSpeed: 1.0
  },

  // Grid settings (persisted)
  gridSettings: initialUISettings.settings.gridSettings,

  // Viewport settings (persisted)
  viewportSettings: initialUISettings.settings.viewportSettings,
  
  // Console
  consoleMessages: [],
  
  // Context menu
  contextMenuHandler: null,
  
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
  setSelectedObject: (object) => set({ selectedObject: object }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  
  updateSettings: (newSettings) => set(state => ({
    settings: { ...state.settings, ...newSettings }
  })),

  updateGridSettings: (newGridSettings) => set(state => {
    const updatedGridSettings = { ...state.gridSettings, ...newGridSettings };
    // Persist to localStorage
    updateUISetting('settings.gridSettings', updatedGridSettings);
    return { gridSettings: updatedGridSettings };
  }),

  updateViewportSettings: (newViewportSettings) => set(state => {
    const updatedViewportSettings = { ...state.viewportSettings, ...newViewportSettings };
    // Persist to localStorage
    updateUISetting('settings.viewportSettings', updatedViewportSettings);
    return { viewportSettings: updatedViewportSettings };
  }),

  // UI Layout Actions (with persistence)
  setRightPanelWidth: (width) => set(state => {
    updateUISetting('panels.rightPanelWidth', width);
    return { rightPanelWidth: width };
  }),

  setBottomPanelHeight: (height) => set(state => {
    updateUISetting('panels.bottomPanelHeight', height);
    return { bottomPanelHeight: height };
  }),

  setAssetsLibraryWidth: (width) => set(state => {
    updateUISetting('panels.assetsLibraryWidth', width);
    return { assetsLibraryWidth: width };
  }),

  setRightPropertiesMenuPosition: (position) => set(state => {
    updateUISetting('panels.rightPropertiesMenuPosition', position);
    return { rightPropertiesMenuPosition: position };
  }),

  setSelectedTool: (tool) => set(state => {
    updateUISetting('toolbar.selectedTool', tool);
    return { selectedTool: tool };
  }),

  setSelectedBottomTab: (tab) => set(state => {
    updateUISetting('bottomTabs.selectedTab', tab);
    return { selectedBottomTab: tab };
  }),

  setBottomTabOrder: (tabOrder) => set(state => {
    updateUISetting('bottomTabs.tabOrder', tabOrder);
    return { bottomTabOrder: tabOrder };
  }),

  setToolbarTabOrder: (tabOrder) => set(state => {
    updateUISetting('toolbar.tabOrder', tabOrder);
    return { toolbarTabOrder: tabOrder };
  }),

  setToolbarBottomTabOrder: (tabOrder) => set(state => {
    updateUISetting('toolbar.bottomTabOrder', tabOrder);
    return { toolbarBottomTabOrder: tabOrder };
  }),

  setTopLeftMenuSelected: (item) => set(state => {
    updateUISetting('topLeftMenu.selectedItem', item);
    return { topLeftMenuSelected: item };
  }),
  
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
  
  clearConsole: () => set({ consoleMessages: [] }),
  
  setContextMenuHandler: (handler) => set({ contextMenuHandler: handler }),
  
  // Scene object management
  addSceneObject: (object) => {
    const objectWithId = { 
      id: `${object.type}-${Date.now()}`, 
      ...object 
    };
    set(state => ({
      sceneObjects: [...state.sceneObjects, objectWithId]
    }));
    return objectWithId;
  },
  
  removeSceneObject: (id) => set(state => ({
    sceneObjects: state.sceneObjects.filter(obj => obj.id !== id)
  })),
  
  updateSceneObject: (id, updates) => set(state => ({
    sceneObjects: state.sceneObjects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    )
  }))
}))