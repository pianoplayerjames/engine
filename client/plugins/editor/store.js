import { proxy, useSnapshot, ref, subscribe } from 'valtio'
import { devtools } from 'valtio/utils'
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
          // Scene-specific data for 3D viewports
          sceneObjects: [
            // Default scene objects for Scene 1
            // Folder: Environment
            {
              id: 'folder-environment',
              name: 'Environment',
              type: 'folder',
              expanded: true,
              visible: true,
              children: ['default-platform-1']
            },
            {
              id: 'default-platform-1',
              name: 'Main Platform',
              type: 'mesh',
              position: [0, -2.5, 0],
              rotation: [0, 0, 0],
              scale: [100, 5, 100],
              geometry: 'box',
              material: { 
                color: '#3a3a3a',
                roughness: 0.9,
                metalness: 0.05
              },
              visible: true,
              isDefaultPlatform: true,
              parentId: 'folder-environment'
            },
            // Default lighting
            {
              id: 'folder-lighting',
              name: 'Lighting',
              type: 'folder',
              expanded: true,
              visible: true,
              children: ['sun-light-1']
            },
            {
              id: 'sun-light-1',
              name: 'Sun Light',
              type: 'light',
              lightType: 'directional',
              position: [10, 10, 5],
              rotation: [-0.785, 0.524, 0],
              color: '#ffffff',
              intensity: 1.2,
              castShadow: true,
              visible: true,
              shadowMapSize: [2048, 2048],
              shadowCameraFar: 50,
              shadowCameraLeft: -20,
              shadowCameraRight: 20,
              shadowCameraTop: 20,
              shadowCameraBottom: -20,
              parentId: 'folder-lighting'
            }
          ],
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
  
  // Scene objects (now managed by Babylon.js - no mock data)
  sceneObjects: [],
  
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
// Create base actions without DevTools
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

  // Helper function to create default scene data
  createDefaultSceneData: () => {
    const timestamp = Date.now();
    const envFolderId = `folder-environment-${timestamp}`;
    const platformId = `default-platform-${timestamp}`;
    const lightFolderId = `folder-lighting-${timestamp}`;
    const lightId = `default-light-${timestamp}`;
    
    return {
      sceneObjects: [
        // Default environment folder
        {
          id: envFolderId,
          name: 'Environment',
          type: 'folder',
          expanded: true,
          visible: true,
          children: [platformId]
        },
        {
          id: platformId,
          name: 'Ground Plane',
          type: 'mesh',
          position: [0, -2.5, 0],
          rotation: [0, 0, 0],
          scale: [20, 1, 20],
          geometry: 'box',
          material: { 
            color: '#4a5568',
            roughness: 0.8,
            metalness: 0.1
          },
          visible: true,
          isDefaultPlatform: true,
          parentId: envFolderId
        },
        // Default lighting folder
        {
          id: lightFolderId,
          name: 'Lighting',
          type: 'folder',
          expanded: true,
          visible: true,
          children: [lightId]
        },
        {
          id: lightId,
          name: 'Main Light',
          type: 'light',
          lightType: 'directional',
          position: [5, 8, 5],
          rotation: [-0.6, 0.4, 0],
          color: '#ffffff',
          intensity: 1.0,
          castShadow: true,
          visible: true,
          shadowMapSize: [1024, 1024],
          shadowCameraFar: 30,
          shadowCameraLeft: -15,
          shadowCameraRight: 15,
          shadowCameraTop: 15,
          shadowCameraBottom: -15,
          parentId: lightFolderId
        }
      ],
      camera: {
        position: [0, 2, 8],
        target: [0, 0, 0],
        zoom: 1,
        fov: 75
      },
      selection: {
        entity: null,
        object: null,
        transformMode: 'select'
      }
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
      tabData = editorActions.createDefaultSceneData();
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

// Enable Redux DevTools integration
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  setTimeout(() => {
    // Check if Redux DevTools extension is available
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
      // Create a Redux DevTools connection
      const devToolsConnection = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
        name: 'Game Engine Editor',
        features: {
          pause: true,
          lock: true,
          persist: true,
          export: true,
          import: 'custom',
          jump: true,
          skip: true,
          reorder: true,
          dispatch: true,
          test: true
        }
      })

      // Initialize with current state
      devToolsConnection.init(editorState)

      // Track action names for better debugging
      let actionCounter = 0

      // Subscribe to all state changes
      const unsubscribe = subscribe(editorState, (ops) => {
        actionCounter++
        
        // Create a descriptive action name based on the operations
        let actionName = 'STATE_UPDATE'
        if (ops && ops.length > 0) {
          const op = ops[0]
          if (op && op.path && op.path.length > 0) {
            actionName = `UPDATE_${op.path.join('_').toUpperCase()}`
          }
        }

        // Send the action and new state to DevTools
        devToolsConnection.send({
          type: actionName,
          payload: ops
        }, editorState)
      })

      // Handle DevTools actions (like time travel)
      devToolsConnection.subscribe((message) => {
        if (message.type === 'DISPATCH' && message.state) {
          // Handle time travel debugging
          try {
            const newState = JSON.parse(message.state)
            Object.assign(editorState, newState)
          } catch (e) {
            console.warn('Failed to parse DevTools state:', e)
          }
        }
      })

      console.log('🎉 Redux DevTools connected successfully!')
      
      // Store unsubscribe function globally for cleanup if needed
      window.__VALTIO_DEVTOOLS_UNSUBSCRIBE__ = unsubscribe
    } else {
      console.warn('Redux DevTools Extension not found. Install it from: https://github.com/reduxjs/redux-devtools')
    }
  }, 500)
}

// Register editor store with AutoSaveManager (no localStorage)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    // Run migration for existing projects
    editorActions.migrateTabOrders();
    
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
        
        // Run migration after loading saved data
        editorActions.migrateTabOrders();
      }
    })
  }, 100)
}