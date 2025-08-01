import { proxy, useSnapshot, ref } from 'valtio'
import { devtools } from 'valtio/utils'
import { autoSaveManager } from '@/plugins/core/AutoSaveManager.js'
import { updateUISetting } from '@/plugins/editor/utils/localStorage.js'
import { sceneActions } from '@/plugins/scene/store.js'

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
      position: [0, 0, 0],
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
      'materials', 'terrain', 'lighting', 'physics', 'effects', 'mixer'
    ]
  },
  toolbar: {
    selectedTool: 'scene',
    tabOrder: [
      'scene', 'light', 'effects', 'folder', 'star', 'wifi', 'cloud', 'monitor',
      'daw-properties', 'audio-devices', 'mixer-settings', 'vst-plugins', 'master-channels', 'track-properties'
    ],
    bottomTabOrder: [
      'add', 'settings', 'fullscreen'
    ]
  },
  topLeftMenu: {
    selectedItem: null
  },
  workflow: {
    activeWorkflow: 'modeling',
    workflowSettings: {
      modeling: { panels: ['scene', 'properties', 'assets'] },
      sculpting: { panels: ['scene', 'properties', 'brushes'] },
      shading: { panels: ['scene', 'shader-editor', 'assets'] },
      animation: { panels: ['scene', 'timeline', 'dope-sheet'] },
      rendering: { panels: ['scene', 'render-properties', 'compositor'] },
      physics: { panels: ['scene', 'physics-properties', 'cache'] }
    }
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
    workflow: defaultUISettings.workflow,
    
    
    // Photo editor state
    photoEditor: {
      selectedTool: 'move',
      zoom: 100,
      image: null,
      layers: [
        { id: '1', name: 'Background', type: 'background', visible: true, locked: false, opacity: 100 }
      ],
      selectedLayer: '1',
      blendMode: 'normal',
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      brushSettings: {
        size: 50,
        hardness: 100,
        opacity: 100,
        flow: 100
      },
      history: [
        { id: '1', name: 'Open', action: 'open', time: new Date().toLocaleTimeString() }
      ],
      currentHistoryIndex: 0
    },
    
    // Model preview state
    modelPreview: {
      model: null,
      modelInfo: null,
      viewMode: 'solid', // solid, wireframe, skeleton
      showGrid: true,
      autoRotate: false,
      animations: [],
      currentAnimation: null,
      isPlaying: false,
      cameraDistance: 5,
      cameraRotation: { x: 0, y: 0 }
    }
  },

  // Camera state (now persisted!)
  camera: {
    position: [0, 0, 5],
    target: [0, 0, 0],
    zoom: 1,
    fov: 75,
    speed: 5,
    mouseSensitivity: 0.002
  },

  // Viewport state
  viewport: {
    renderMode: 'solid', // wireframe, solid, material, rendered
    showGrid: true,
    gridSnapping: false,
    // Multi-tab viewport system
    tabs: [
      {
        id: 'viewport-1',
        type: '3d-viewport',
        name: 'Scene 1',
        isPinned: false,
        hasUnsavedChanges: false,
        instance: 1,
        data: {
          // Scene ID for linking to scene store
          sceneId: 'viewport-1',
          camera: {
            position: [0, 0, 5],
            target: [0, 0, 0],
            zoom: 1,
            fov: 75
          },
          selection: {
            entity: null,
            object: null,
            transformMode: 'select'
          }
        }
      }
    ],
    activeTabId: 'viewport-1',
    nextTabId: 2,
    // Instance counters for each viewport type
    instanceCounters: {
      '3d-viewport': 1,
      'node-editor': 0,
      'text-editor': 0
    },
    // Tab suspension for performance optimization
    suspendedTabs: new Set(),
    suspensionDelay: 5000 // 5 seconds before suspending inactive tabs
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
  
  // Babylon.js scene reference (wrapped in ref() to prevent reactivity)
  babylonScene: ref({ current: null }),
  
  // Editor settings
  settings: {
    grid: defaultUISettings.settings.gridSettings,
    viewport: defaultUISettings.settings.viewportSettings,
    editor: {
      gridSize: 1,
      snapToGrid: false,
      showGrid: true,
      showWireframe: false,
      cameraSpeed: 1.0,
      showStats: false
    }
  },
  
  // Console
  console: {
    messages: [],
    handler: null,
  },
})

// Actions that mutate the state directly
const baseEditorActions = {
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

  // Migration function to ensure all default tabs are present
  migrateTabOrders: () => {
    const allDefaultBottomTabs = [
      'assets', 'scripts', 'animation', 'node-editor', 'timeline', 'console',
      'materials', 'terrain', 'lighting', 'physics', 'effects', 'mixer'
    ];
    
    const allDefaultToolbarTabs = [
      'scene', 'light', 'effects', 'folder', 'star', 'wifi', 'cloud', 'monitor',
      'daw-properties', 'audio-devices', 'mixer-settings', 'vst-plugins', 'master-channels', 'track-properties'
    ];

    // Migrate bottom tabs
    const currentBottomTabs = editorState.ui.bottomTabOrder || [];
    const missingBottomTabs = allDefaultBottomTabs.filter(tab => !currentBottomTabs.includes(tab));
    if (missingBottomTabs.length > 0) {
      editorState.ui.bottomTabOrder = [...currentBottomTabs, ...missingBottomTabs];
    }

    // Migrate toolbar tabs
    const currentToolbarTabs = editorState.ui.toolbarTabOrder || [];
    const missingToolbarTabs = allDefaultToolbarTabs.filter(tab => !currentToolbarTabs.includes(tab));
    if (missingToolbarTabs.length > 0) {
      editorState.ui.toolbarTabOrder = [...currentToolbarTabs, ...missingToolbarTabs];
    }
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
  // Workflow actions
  setWorkflowMode: (workflowId) => {
    editorState.ui.workflow.activeWorkflow = workflowId
    updateUISetting('workflow.activeWorkflow', workflowId)
    autoSaveManager.markDirty()
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

  setCameraSpeed: (speed) => {
    editorState.camera.speed = speed
  },

  setCameraSensitivity: (sensitivity) => {
    editorState.camera.mouseSensitivity = sensitivity
  },

  // Viewport actions
  setRenderMode: (mode) => {
    editorState.viewport.renderMode = mode
  },

  setShowGrid: (show) => {
    editorState.viewport.showGrid = show
  },

  setGridSnapping: (snap) => {
    editorState.viewport.gridSnapping = snap
  },

  setViewportActiveTab: (tab) => {
    editorState.viewport.activeTab = tab
  },

  // Helper function to create default scene data (now uses scene store)
  createDefaultSceneData: (sceneId) => {
    const sceneData = sceneActions.createScene(sceneId)
    return {
      sceneId: sceneId,
      camera: sceneData.camera,
      selection: sceneData.selection
    };
  },

  // Multi-tab viewport actions
  addViewportTab: (type, customName = null, data = {}) => {
    // Increment instance counter for this type
    editorState.viewport.instanceCounters[type]++;
    const instanceNumber = editorState.viewport.instanceCounters[type];
    
    // Generate appropriate name based on type
    let name;
    if (customName) {
      name = customName;
    } else {
      switch (type) {
        case '3d-viewport':
          name = `Scene ${instanceNumber}`;
          break;
        case 'node-editor':
          name = `Nodes ${instanceNumber}`;
          break;
        case 'text-editor':
          name = `Script ${instanceNumber}`;
          break;
        default:
          name = `${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} ${instanceNumber}`;
      }
    }
    
    // Prepare tab-specific data based on type
    let tabData = { ...data };
    if (type === '3d-viewport') {
      // Create new scene data for 3D viewports
      const sceneId = `viewport-${editorState.viewport.nextTabId}`;
      tabData = editorActions.createDefaultSceneData(sceneId);
    }

    const newTab = {
      id: `viewport-${editorState.viewport.nextTabId}`,
      type,
      name,
      isPinned: false,
      hasUnsavedChanges: false,
      instance: instanceNumber,
      data: tabData
    };
    editorState.viewport.tabs.push(newTab);
    editorState.viewport.activeTabId = newTab.id;
    editorState.viewport.nextTabId++;
    return newTab.id;
  },

  setActiveViewportTab: (tabId) => {
    const tab = editorState.viewport.tabs.find(t => t.id === tabId);
    if (tab) {
      const previousActiveTab = editorState.viewport.activeTabId;
      editorState.viewport.activeTabId = tabId;
      
      // Set active scene if it's a 3D viewport
      if (tab.type === '3d-viewport' && tab.data?.sceneId) {
        sceneActions.setActiveScene(tab.data.sceneId);
      }
      
      // Resume the newly active tab immediately
      editorActions.resumeTab(tabId);
      
      // Schedule suspension of the previously active tab after delay
      if (previousActiveTab && previousActiveTab !== tabId) {
        setTimeout(() => {
          // Only suspend if it's still not the active tab
          if (editorState.viewport.activeTabId !== previousActiveTab) {
            editorActions.suspendTab(previousActiveTab);
          }
        }, editorState.viewport.suspensionDelay);
      }
    }
  },

  closeViewportTab: (tabId) => {
    const tabIndex = editorState.viewport.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    // Don't close if it's the only tab
    if (editorState.viewport.tabs.length === 1) return;

    const tab = editorState.viewport.tabs[tabIndex];

    // Clean up scene data if it's a 3D viewport
    if (tab.type === '3d-viewport' && tab.data?.sceneId) {
      sceneActions.deleteScene(tab.data.sceneId);
    }

    // If closing the active tab, switch to another tab
    if (editorState.viewport.activeTabId === tabId) {
      const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : tabIndex + 1;
      editorState.viewport.activeTabId = editorState.viewport.tabs[newActiveIndex].id;
    }

    // Clean up suspended tabs set
    editorState.viewport.suspendedTabs.delete(tabId);
    
    // Remove the tab
    editorState.viewport.tabs.splice(tabIndex, 1);
    
    // Note: We don't decrement instance counters to avoid name conflicts
    // This ensures that new tabs always get unique names
  },

  updateViewportTab: (tabId, updates) => {
    const tab = editorState.viewport.tabs.find(t => t.id === tabId);
    if (tab) {
      Object.assign(tab, updates);
    }
  },

  renameViewportTab: (tabId, newName) => {
    const tab = editorState.viewport.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.name = newName;
    }
  },

  // Tab suspension management
  suspendTab: (tabId) => {
    editorState.viewport.suspendedTabs.add(tabId);
    console.log(`🔌 Tab suspended: ${tabId}`);
  },

  resumeTab: (tabId) => {
    editorState.viewport.suspendedTabs.delete(tabId);
    console.log(`⚡ Tab resumed: ${tabId}`);
  },

  isTabSuspended: (tabId) => {
    return editorState.viewport.suspendedTabs.has(tabId);
  },

  pinViewportTab: (tabId) => {
    const tab = editorState.viewport.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.isPinned = !tab.isPinned;
    }
  },

  duplicateViewportTab: (tabId) => {
    const tab = editorState.viewport.tabs.find(t => t.id === tabId);
    if (tab) {
      const newTab = {
        id: `viewport-${editorState.viewport.nextTabId}`,
        type: tab.type,
        name: `${tab.name} (Copy)`,
        isPinned: false,
        hasUnsavedChanges: false,
        data: { ...tab.data }
      };
      editorState.viewport.tabs.push(newTab);
      editorState.viewport.activeTabId = newTab.id;
      editorState.viewport.nextTabId++;
      return newTab.id;
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
  
  
  // Babylon.js scene management
  updateBabylonScene: (scene) => {
    editorState.babylonScene.current = scene;
  },


  
  // Photo editor actions
  setPhotoEditorTool: (tool) => {
    editorState.ui.photoEditor.selectedTool = tool
  },
  setPhotoEditorZoom: (zoom) => {
    editorState.ui.photoEditor.zoom = zoom
  },
  setPhotoEditorImage: (image) => {
    editorState.ui.photoEditor.image = image
  },
  addPhotoLayer: (layer) => {
    editorState.ui.photoEditor.layers.push(layer)
  },
  updatePhotoLayer: (layerId, updates) => {
    const layerIndex = editorState.ui.photoEditor.layers.findIndex(l => l.id === layerId)
    if (layerIndex !== -1) {
      Object.assign(editorState.ui.photoEditor.layers[layerIndex], updates)
    }
  },
  removePhotoLayer: (layerId) => {
    editorState.ui.photoEditor.layers = editorState.ui.photoEditor.layers.filter(l => l.id !== layerId)
  },
  setSelectedPhotoLayer: (layerId) => {
    editorState.ui.photoEditor.selectedLayer = layerId
  },
  setPhotoBlendMode: (blendMode) => {
    editorState.ui.photoEditor.blendMode = blendMode
  },
  setPhotoColors: (foreground, background) => {
    if (foreground !== undefined) editorState.ui.photoEditor.foregroundColor = foreground
    if (background !== undefined) editorState.ui.photoEditor.backgroundColor = background
  },
  updatePhotoBrushSettings: (settings) => {
    Object.assign(editorState.ui.photoEditor.brushSettings, settings)
  },

  // Model preview actions
  setModelPreviewModel: (model) => {
    editorState.ui.modelPreview.model = model
  },
  setModelPreviewInfo: (modelInfo) => {
    editorState.ui.modelPreview.modelInfo = modelInfo
  },
  setModelPreviewViewMode: (viewMode) => {
    editorState.ui.modelPreview.viewMode = viewMode
  },
  setModelPreviewGrid: (showGrid) => {
    editorState.ui.modelPreview.showGrid = showGrid
  },
  setModelPreviewAutoRotate: (autoRotate) => {
    editorState.ui.modelPreview.autoRotate = autoRotate
  },
  setModelPreviewAnimations: (animations) => {
    editorState.ui.modelPreview.animations = animations
  },
  setModelPreviewCurrentAnimation: (animationIndex) => {
    editorState.ui.modelPreview.currentAnimation = animationIndex
  },
  setModelPreviewPlaying: (isPlaying) => {
    editorState.ui.modelPreview.isPlaying = isPlaying
  },
  setModelPreviewCamera: (cameraState) => {
    if (cameraState.distance !== undefined) {
      editorState.ui.modelPreview.cameraDistance = cameraState.distance
    }
    if (cameraState.rotation !== undefined) {
      Object.assign(editorState.ui.modelPreview.cameraRotation, cameraState.rotation)
    }
  },
  addPhotoHistoryState: (action) => {
    const history = editorState.ui.photoEditor.history
    const newState = {
      id: Date.now().toString(),
      name: action.name,
      action: action.type,
      time: new Date().toLocaleTimeString()
    }
    
    // Remove any states after current index (when new action is performed after undo)
    history.splice(editorState.ui.photoEditor.currentHistoryIndex + 1)
    history.push(newState)
    editorState.ui.photoEditor.currentHistoryIndex = history.length - 1
  },
  setPhotoHistoryIndex: (index) => {
    const maxIndex = editorState.ui.photoEditor.history.length - 1
    editorState.ui.photoEditor.currentHistoryIndex = Math.max(0, Math.min(index, maxIndex))
  }
}

// Export the actions directly
export const editorActions = baseEditorActions


// Setup Redux DevTools for debugging
let devtoolsUnsubscribe = null
if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  devtoolsUnsubscribe = devtools(editorState, {
    name: 'Editor Store',
    enabled: process.env.NODE_ENV === 'development'
  })
}

// Register editor store with AutoSaveManager (no localStorage)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    // Initialize default scene for viewport-1
    sceneActions.createScene('viewport-1');
    sceneActions.setActiveScene('viewport-1');
    
    // Run migration for existing projects
    editorActions.migrateTabOrders();
    
    autoSaveManager.registerStore('editor', editorState, {
      extractSaveData: () => ({
        ui: { ...editorState.ui },
        camera: { ...editorState.camera },
        settings: { ...editorState.settings },
        panels: { ...editorState.panels }
        // Don't save console messages, selection state, or scene objects (now in scene store)
      }),
      restoreData: (data) => {
        if (data.ui) Object.assign(editorState.ui, data.ui)
        if (data.camera) Object.assign(editorState.camera, data.camera)
        if (data.settings) Object.assign(editorState.settings, data.settings)
        if (data.panels) Object.assign(editorState.panels, data.panels)
        // sceneObjects are now managed by the scene store
        
        // Run migration after loading saved data
        editorActions.migrateTabOrders();
      }
    })
  }, 100)
}

// Export devtools unsubscribe function for cleanup
export { devtoolsUnsubscribe }