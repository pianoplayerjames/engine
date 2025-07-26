import { create } from 'zustand'
import { loadUISettings, saveUISettings, updateUISetting, defaultUISettings } from './utils/localStorage.js'

// Always use defaults for initial render to prevent hydration mismatch
// Will be hydrated after mount
const initialUISettings = defaultUISettings;

export const useEditorStore = create((set, get) => ({
  // Editor state
  isOpen: false,
  mode: 'scene', // scene, assets, settings, console
  
  // UI Layout Settings (persisted)
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
  
  // Panel visibility
  panels: {
    hierarchy: true,
    inspector: true,
    console: false,
    assets: false
  },
  
  // Panel open states (for layout calculations)
  isScenePanelOpen: true,
  isAssetPanelOpen: true,
  
  // Resize states (for disabling transitions during resize)
  isResizingPanels: false,
  
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

  setScenePropertiesHeight: (height) => set(state => {
    updateUISetting('panels.scenePropertiesHeight', height);
    return { scenePropertiesHeight: height };
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

  // Panel state actions
  setIsScenePanelOpen: (isOpen) => set({ isScenePanelOpen: isOpen }),
  setIsAssetPanelOpen: (isOpen) => set({ isAssetPanelOpen: isOpen }),
  setIsResizingPanels: (isResizing) => set({ isResizingPanels: isResizing }),

  // Hydration action to load localStorage values on client
  hydrateFromLocalStorage: () => {
    if (typeof window !== 'undefined') {
      const storedSettings = loadUISettings();
      set({
        rightPanelWidth: storedSettings.panels.rightPanelWidth,
        bottomPanelHeight: storedSettings.panels.bottomPanelHeight,
        scenePropertiesHeight: storedSettings.panels.scenePropertiesHeight,
        assetsLibraryWidth: storedSettings.panels.assetsLibraryWidth,
        rightPropertiesMenuPosition: storedSettings.panels.rightPropertiesMenuPosition,
        selectedTool: storedSettings.toolbar.selectedTool,
        selectedBottomTab: storedSettings.bottomTabs.selectedTab,
        bottomTabOrder: storedSettings.bottomTabs.tabOrder,
        toolbarTabOrder: storedSettings.toolbar.tabOrder,
        toolbarBottomTabOrder: storedSettings.toolbar.bottomTabOrder,
        topLeftMenuSelected: storedSettings.topLeftMenu.selectedItem,
        gridSettings: storedSettings.settings.gridSettings,
        viewportSettings: storedSettings.settings.viewportSettings,
        // Panel states don't need persistence as they're UI state
        isScenePanelOpen: true,
        isAssetPanelOpen: true,
      });
    }
  },
  
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