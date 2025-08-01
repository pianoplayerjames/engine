import { proxy, ref } from 'valtio'
import { devtools } from 'valtio/utils'
import { autoSaveManager } from '@/plugins/core/AutoSaveManager.js'
import { updateUISetting } from '@/plugins/editor/utils/localStorage.js'

// Default UI settings
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
      'assets'
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
      shading: { panels: ['scene', 'properties', 'assets'] },
      lighting: { panels: ['scene', 'properties', 'assets'] },
      physics: { panels: ['scene', 'properties', 'assets'] }
    }
  }
}

// Unified Global Store
export const globalStore = proxy({
  // ===== EDITOR STATE =====
  editor: {
    isOpen: false,
    mode: 'scene', // scene, assets, settings, console
    
    // UI Layout Settings
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
      workflow: defaultUISettings.workflow
    },

    // Camera state
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
      instanceCounters: {
        '3d-viewport': 1
      },
      suspendedTabs: [],
      suspensionDelay: 5000
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
      object: null,
      transformMode: 'select',
    },
    
    // Babylon.js scene reference
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
    }
  },

  // ===== SCENE STATE =====
  scene: {
    // Multi-scene support (one scene per viewport) - using object instead of Map for better reactivity
    scenes: {},
    activeSceneId: null,
    
    // Legacy ECS system (kept for compatibility)
    entities: {},
    entityCounter: 0,
    
    // Scene hierarchy
    sceneRoot: null,
    selectedEntity: null,
    
    // Spatial queries - using object instead of Map
    spatialIndex: {},
    
    // Component systems - using objects instead of Maps for better Valtio performance
    components: {
      transform: {},
      mesh: {},
      light: {},
      camera: {},
      script: {},
      physics: {},
      audio: {}
    },
    
    // Query cache for performance - using object instead of Map
    queryCache: {},
    cacheVersion: 0
  },

  // ===== RENDER STATE =====
  render: {
    // Environment settings
    environment: {
      preset: null,
      intensity: 1.0,
      type: 'color',
      environmentType: null
    },
    
    // Camera settings
    camera: {
      position: [3, 3, 3],
      rotation: [0, 0, 0],
      fov: 60,
      near: 0.1,
      far: 1000,
      target: [0, 0, 0],
      aspect: 16/9
    },
    
    // Lighting system
    lighting: {
      ambient: {
        intensity: 0.5,
        color: '#ffffff'
      },
      lights: {},
      shadowsEnabled: true
    },
    
    // Render settings
    settings: {
      shadows: true,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      physicallyCorrectLights: true,
      outputEncoding: 'sRGB',
      toneMapping: 'ACES',
      toneMappingExposure: 1.0
    },
    
    // Post-processing effects
    effects: {},
    
    // Performance monitoring
    performance: {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      memory: 0,
      lastUpdate: 0
    }
  },

  // ===== ASSETS STATE =====
  assets: {
    // Asset storage using objects for better Valtio performance
    assets: {
      textures: {},
      models: {},
      sounds: {},
      materials: {},
      animations: {},
      fonts: {},
    },
    
    // Loading state tracking
    loading: {
      active: {},
      queue: [],
      progress: {
        total: 0,
        loaded: 0,
        percentage: 0
      }
    },
    
    // Asset metadata and caching
    metadata: {
      loaded: {},
      errors: {},
      dependencies: {},
    },
    
    // Cache management
    cache: {
      maxSize: 100 * 1024 * 1024, // 100MB
      currentSize: 0,
      enabled: true,
      strategy: 'lru'
    }
  }
})

// Non-serializable render references (stored outside proxy)
let renderRefs = {
  scene: null,
  engine: null,
  camera: null
}

// ===== UNIFIED ACTIONS =====
export const actions = {
  // ===== EDITOR ACTIONS =====
  editor: {
    toggle: () => {
      globalStore.editor.isOpen = !globalStore.editor.isOpen
    },
    
    open: () => {
      globalStore.editor.isOpen = true
    },
    
    close: () => {
      globalStore.editor.isOpen = false
    },
    
    setMode: (mode) => {
      globalStore.editor.mode = mode
    },
    
    // Panel management
    togglePanel: (panel) => {
      globalStore.editor.panels[panel] = !globalStore.editor.panels[panel]
    },
    
    setIsScenePanelOpen: (isOpen) => {
      globalStore.editor.panels.isScenePanelOpen = isOpen
    },
    
    setIsAssetPanelOpen: (isOpen) => {
      globalStore.editor.panels.isAssetPanelOpen = isOpen
    },
    
    setIsResizingPanels: (isResizing) => {
      globalStore.editor.panels.isResizingPanels = isResizing
    },
    
    // Selection
    setSelectedEntity: (entityId) => {
      globalStore.editor.selection.entity = entityId
    },
    
    setSelectedObject: (object) => {
      globalStore.editor.selection.object = object
    },
    
    setTransformMode: (mode) => {
      globalStore.editor.selection.transformMode = mode
    },
    
    // Settings updates
    updateEditorSettings: (newSettings) => {
      Object.assign(globalStore.editor.settings.editor, newSettings)
    },

    updateGridSettings: (newGridSettings) => {
      Object.assign(globalStore.editor.settings.grid, newGridSettings)
      updateUISetting('settings.gridSettings', globalStore.editor.settings.grid)
    },

    updateViewportSettings: (newViewportSettings) => {
      Object.assign(globalStore.editor.settings.viewport, newViewportSettings)
      updateUISetting('settings.viewportSettings', globalStore.editor.settings.viewport)
    },

    // UI Layout Actions
    setRightPanelWidth: (width) => {
      globalStore.editor.ui.rightPanelWidth = width
    },

    setBottomPanelHeight: (height) => {
      globalStore.editor.ui.bottomPanelHeight = height
    },

    setScenePropertiesHeight: (height) => {
      globalStore.editor.ui.scenePropertiesHeight = height
    },

    setAssetsLibraryWidth: (width) => {
      globalStore.editor.ui.assetsLibraryWidth = width
    },

    setRightPropertiesMenuPosition: (position) => {
      globalStore.editor.ui.rightPropertiesMenuPosition = position
    },

    setSelectedTool: (tool) => {
      globalStore.editor.ui.selectedTool = tool
    },

    setSelectedBottomTab: (tab) => {
      globalStore.editor.ui.selectedBottomTab = tab
    },

    setBottomTabOrder: (tabOrder) => {
      globalStore.editor.ui.bottomTabOrder = tabOrder
    },

    // Migration function to ensure all default tabs are present
    migrateTabOrders: () => {
      const allDefaultBottomTabs = [
        'assets'
      ];
      
      const allDefaultToolbarTabs = [
        'scene', 'light', 'effects', 'folder', 'star', 'wifi', 'cloud', 'monitor',
        'daw-properties', 'audio-devices', 'mixer-settings', 'vst-plugins', 'master-channels', 'track-properties'
      ];

      // Migrate bottom tabs
      const currentBottomTabs = globalStore.editor.ui.bottomTabOrder || [];
      const missingBottomTabs = allDefaultBottomTabs.filter(tab => !currentBottomTabs.includes(tab));
      if (missingBottomTabs.length > 0) {
        globalStore.editor.ui.bottomTabOrder = [...currentBottomTabs, ...missingBottomTabs];
      }

      // Migrate toolbar tabs
      const currentToolbarTabs = globalStore.editor.ui.toolbarTabOrder || [];
      const missingToolbarTabs = allDefaultToolbarTabs.filter(tab => !currentToolbarTabs.includes(tab));
      if (missingToolbarTabs.length > 0) {
        globalStore.editor.ui.toolbarTabOrder = [...currentToolbarTabs, ...missingToolbarTabs];
      }
    },

    setToolbarTabOrder: (tabOrder) => {
      globalStore.editor.ui.toolbarTabOrder = tabOrder
    },

    setToolbarBottomTabOrder: (tabOrder) => {
      globalStore.editor.ui.toolbarBottomTabOrder = tabOrder
    },

    setTopLeftMenuSelected: (item) => {
      globalStore.editor.ui.topLeftMenuSelected = item
    },

    // Workflow actions
    setWorkflowMode: (workflowId) => {
      globalStore.editor.ui.workflow.activeWorkflow = workflowId
      updateUISetting('workflow.activeWorkflow', workflowId)
      autoSaveManager.markDirty()
    },

    // Camera actions
    setCameraPosition: (position) => {
      globalStore.editor.camera.position = position
    },

    setCameraTarget: (target) => {
      globalStore.editor.camera.target = target
    },

    setCameraZoom: (zoom) => {
      globalStore.editor.camera.zoom = zoom
    },

    setCameraFOV: (fov) => {
      globalStore.editor.camera.fov = fov
    },

    setCameraSpeed: (speed) => {
      globalStore.editor.camera.speed = speed
    },

    setCameraSensitivity: (sensitivity) => {
      globalStore.editor.camera.mouseSensitivity = sensitivity
    },

    // Viewport actions
    setRenderMode: (mode) => {
      globalStore.editor.viewport.renderMode = mode
    },

    setShowGrid: (show) => {
      globalStore.editor.viewport.showGrid = show
    },

    setGridSnapping: (snap) => {
      globalStore.editor.viewport.gridSnapping = snap
    },

    // Helper function to create default scene data
    createDefaultSceneData: (sceneId) => {
      const sceneData = actions.scene.createScene(sceneId)
      return {
        sceneId: sceneId,
        camera: sceneData.camera,
        selection: sceneData.selection
      };
    },

    // Multi-tab viewport actions
    addViewportTab: (type, customName = null, data = {}) => {
      // Increment instance counter for this type
      globalStore.editor.viewport.instanceCounters[type]++;
      const instanceNumber = globalStore.editor.viewport.instanceCounters[type];
      
      // Generate appropriate name based on type
      let name;
      if (customName) {
        name = customName;
      } else {
        if (type === '3d-viewport') {
          name = `Scene ${instanceNumber}`;
        } else {
          // Only 3D viewports supported
          console.warn(`Unsupported viewport type: ${type}. Only 3d-viewport is supported.`);
          return null;
        }
      }
      
      // Prepare tab-specific data based on type
      let tabData = { ...data };
      if (type === '3d-viewport') {
        // Create new scene data for 3D viewports
        const sceneId = `viewport-${globalStore.editor.viewport.nextTabId}`;
        tabData = actions.editor.createDefaultSceneData(sceneId);
      }

      const newTab = {
        id: `viewport-${globalStore.editor.viewport.nextTabId}`,
        type,
        name,
        isPinned: false,
        hasUnsavedChanges: false,
        instance: instanceNumber,
        data: tabData
      };
      globalStore.editor.viewport.tabs.push(newTab);
      globalStore.editor.viewport.activeTabId = newTab.id;
      globalStore.editor.viewport.nextTabId++;
      return newTab.id;
    },

    setActiveViewportTab: (tabId) => {
      const tab = globalStore.editor.viewport.tabs.find(t => t.id === tabId);
      if (tab) {
        const previousActiveTab = globalStore.editor.viewport.activeTabId;
        globalStore.editor.viewport.activeTabId = tabId;
        
        // Set active scene if it's a 3D viewport
        if (tab.type === '3d-viewport' && tab.data?.sceneId) {
          actions.scene.setActiveScene(tab.data.sceneId);
        }
        
        // Resume the newly active tab immediately
        actions.editor.resumeTab(tabId);
        
        // Schedule suspension of the previously active tab after delay
        if (previousActiveTab && previousActiveTab !== tabId) {
          setTimeout(() => {
            // Only suspend if it's still not the active tab
            if (globalStore.editor.viewport.activeTabId !== previousActiveTab) {
              actions.editor.suspendTab(previousActiveTab);
            }
          }, globalStore.editor.viewport.suspensionDelay);
        }
      }
    },

    closeViewportTab: (tabId) => {
      const tabIndex = globalStore.editor.viewport.tabs.findIndex(t => t.id === tabId);
      if (tabIndex === -1) return;

      // Don't close if it's the only tab
      if (globalStore.editor.viewport.tabs.length === 1) return;

      const tab = globalStore.editor.viewport.tabs[tabIndex];

      // Clean up scene data if it's a 3D viewport
      if (tab.type === '3d-viewport' && tab.data?.sceneId) {
        actions.scene.deleteScene(tab.data.sceneId);
      }

      // If closing the active tab, switch to another tab
      if (globalStore.editor.viewport.activeTabId === tabId) {
        const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : tabIndex + 1;
        globalStore.editor.viewport.activeTabId = globalStore.editor.viewport.tabs[newActiveIndex].id;
      }

      // Clean up suspended tabs array
      const index = globalStore.editor.viewport.suspendedTabs.indexOf(tabId);
      if (index > -1) globalStore.editor.viewport.suspendedTabs.splice(index, 1);
      
      // Remove the tab
      globalStore.editor.viewport.tabs.splice(tabIndex, 1);
    },

    updateViewportTab: (tabId, updates) => {
      const tab = globalStore.editor.viewport.tabs.find(t => t.id === tabId);
      if (tab) {
        Object.assign(tab, updates);
      }
    },

    renameViewportTab: (tabId, newName) => {
      const tab = globalStore.editor.viewport.tabs.find(t => t.id === tabId);
      if (tab) {
        tab.name = newName;
      }
    },

    // Tab suspension management
    suspendTab: (tabId) => {
      if (!globalStore.editor.viewport.suspendedTabs.includes(tabId)) {
        globalStore.editor.viewport.suspendedTabs.push(tabId);
      }
      // Tab suspended
    },

    resumeTab: (tabId) => {
      const index = globalStore.editor.viewport.suspendedTabs.indexOf(tabId);
      if (index > -1) globalStore.editor.viewport.suspendedTabs.splice(index, 1);
      // Tab resumed
    },

    isTabSuspended: (tabId) => {
      return globalStore.editor.viewport.suspendedTabs.includes(tabId);
    },

    pinViewportTab: (tabId) => {
      const tab = globalStore.editor.viewport.tabs.find(t => t.id === tabId);
      if (tab) {
        tab.isPinned = !tab.isPinned;
      }
    },

    duplicateViewportTab: (tabId) => {
      const tab = globalStore.editor.viewport.tabs.find(t => t.id === tabId);
      if (tab) {
        const newTab = {
          id: `viewport-${globalStore.editor.viewport.nextTabId}`,
          type: tab.type,
          name: `${tab.name} (Copy)`,
          isPinned: false,
          hasUnsavedChanges: false,
          data: { ...tab.data }
        };
        globalStore.editor.viewport.tabs.push(newTab);
        globalStore.editor.viewport.activeTabId = newTab.id;
        globalStore.editor.viewport.nextTabId++;
        return newTab.id;
      }
    },
    
    // Console management
    addConsoleMessage: (message, type = 'info') => {
      globalStore.editor.console.messages.push({
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      })
    },
    
    clearConsole: () => {
      globalStore.editor.console.messages.length = 0
    },
    
    setContextMenuHandler: (handler) => {
      globalStore.editor.console.handler = handler
    },
    
    // Babylon.js scene management
    updateBabylonScene: (scene) => {
      globalStore.editor.babylonScene.current = scene;
    },
    
  },

  // ===== SCENE ACTIONS =====
  scene: {
    // Scene management
    createScene: (sceneId, initialData = null) => {
      const defaultSceneData = {
        id: sceneId,
        name: `Scene ${sceneId}`,
        objects: [
          // Default environment folder
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
          // Default lighting folder
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
      
      const sceneData = initialData || defaultSceneData
      globalStore.scene.scenes[sceneId] = sceneData
      return sceneData
    },

    deleteScene: (sceneId) => {
      delete globalStore.scene.scenes[sceneId]
      if (globalStore.scene.activeSceneId === sceneId) {
        globalStore.scene.activeSceneId = null
      }
    },

    setActiveScene: (sceneId) => {
      if (globalStore.scene.scenes[sceneId]) {
        globalStore.scene.activeSceneId = sceneId
      }
    },

    getActiveScene: () => {
      return globalStore.scene.scenes[globalStore.scene.activeSceneId]
    },

    getScene: (sceneId) => {
      return globalStore.scene.scenes[sceneId]
    },

    // Scene object management
    addSceneObject: (sceneId, object) => {
      const scene = globalStore.scene.scenes[sceneId]
      if (scene) {
        scene.objects.push(object)
      }
    },

    removeSceneObject: (sceneId, objectId) => {
      const scene = globalStore.scene.scenes[sceneId]
      if (scene) {
        const objectIndex = scene.objects.findIndex(obj => obj.id === objectId)
        if (objectIndex !== -1) {
          scene.objects.splice(objectIndex, 1)
        }
      }
    },

    updateSceneObject: (sceneId, objectId, updates) => {
      const scene = globalStore.scene.scenes[sceneId]
      if (scene) {
        const objectIndex = scene.objects.findIndex(obj => obj.id === objectId)
        if (objectIndex !== -1) {
          Object.assign(scene.objects[objectIndex], updates)
        }
      }
    },

    getSceneObject: (sceneId, objectId) => {
      const scene = globalStore.scene.scenes[sceneId]
      if (scene) {
        return scene.objects.find(obj => obj.id === objectId)
      }
      return null
    },

    // Scene selection
    setSceneSelection: (sceneId, entityId, object = null) => {
      const scene = globalStore.scene.scenes[sceneId]
      if (scene) {
        scene.selection.entity = entityId
        scene.selection.object = object
      }
    },

    // Scene camera
    setSceneCamera: (sceneId, cameraData) => {
      const scene = globalStore.scene.scenes[sceneId]
      if (scene) {
        Object.assign(scene.camera, cameraData)
      }
    },

    // Legacy ECS system methods (kept for compatibility)
    createEntity: (name = 'Entity') => {
      const id = globalStore.scene.entityCounter + 1
      const entity = {
        id,
        name: `${name}_${id}`,
        active: true,
        parent: null,
        children: [],
        components: []
      }
      
      globalStore.scene.entities[id] = entity
      globalStore.scene.entityCounter = id
      actions.scene.invalidateQueryCache()
      
      return id
    },
    
    destroyEntity: (entityId) => {
      const entity = globalStore.scene.entities[entityId]
      if (!entity) return
      
      // Remove all components
      entity.components.forEach(componentType => {
        actions.scene.removeComponent(entityId, componentType)
      })
      
      // Remove from hierarchy
      if (entity.parent) {
        actions.scene.removeChild(entity.parent, entityId)
      }
      
      // Destroy children recursively
      entity.children.forEach(childId => {
        actions.scene.destroyEntity(childId)
      })
      
      // Remove from entities map
      delete globalStore.scene.entities[entityId]
      actions.scene.invalidateQueryCache()
    },
    
    getEntity: (entityId) => globalStore.scene.entities[entityId],
    
    setEntityActive: (entityId, active) => {
      const entity = globalStore.scene.entities[entityId]
      if (!entity) return
      
      entity.active = active
      actions.scene.invalidateQueryCache()
    },
    
    // Hierarchy management
    addChild: (parentId, childId) => {
      const parent = globalStore.scene.entities[parentId]
      const child = globalStore.scene.entities[childId]
      
      if (!parent || !child) return
      
      // Remove from old parent if exists
      if (child.parent) {
        actions.scene.removeChild(child.parent, childId)
      }
      
      // Update parent and child
      parent.children.push(childId)
      child.parent = parentId
    },
    
    removeChild: (parentId, childId) => {
      const parent = globalStore.scene.entities[parentId]
      const child = globalStore.scene.entities[childId]
      
      if (!parent || !child) return
      
      const childIndex = parent.children.indexOf(childId)
      if (childIndex >= 0) {
        parent.children.splice(childIndex, 1)
      }
      child.parent = null
    },
    
    // Component management with fine-grained reactivity
    addComponent: (entityId, componentType, componentData = {}) => {
      const entity = globalStore.scene.entities[entityId]
      if (!entity) return
      
      // Add component data to the appropriate object
      globalStore.scene.components[componentType][entityId] = componentData
      
      // Add component type to entity's component array
      if (!entity.components.includes(componentType)) {
        entity.components.push(componentType)
      }
      
      actions.scene.invalidateQueryCache()
    },
    
    removeComponent: (entityId, componentType) => {
      const entity = globalStore.scene.entities[entityId]
      if (!entity) return
      
      // Remove component data
      delete globalStore.scene.components[componentType][entityId]
      
      // Remove from entity's component array
      const index = entity.components.indexOf(componentType)
      if (index > -1) entity.components.splice(index, 1)
      
      actions.scene.invalidateQueryCache()
    },
    
    getComponent: (entityId, componentType) => {
      return globalStore.scene.components[componentType]?.[entityId]
    },
    
    updateComponent: (entityId, componentType, updates) => {
      const currentComponent = globalStore.scene.components[componentType]?.[entityId]
      if (!currentComponent) return
      
      // Direct mutation for Valtio reactivity
      Object.assign(currentComponent, updates)
    },
    
    hasComponent: (entityId, componentType) => {
      return globalStore.scene.components[componentType]?.[entityId] !== undefined || false
    },
    
    // Enhanced query system with caching
    getEntitiesWith: (...componentTypes) => {
      const cacheKey = componentTypes.sort().join(',')
      const cached = globalStore.scene.queryCache[cacheKey]
      
      if (cached && cached.version === globalStore.scene.cacheVersion) {
        return cached.result
      }
      
      const entities = []
      
      Object.entries(globalStore.scene.entities).forEach(([entityId, entity]) => {
        // Ensure components is an array (handle restoration edge cases)
        if (!Array.isArray(entity.components)) {
          entity.components = []
        }
        
        const hasAllComponents = componentTypes.every(type => 
          entity.components.includes(type)
        )
        
        if (hasAllComponents && entity.active) {
          entities.push({
            id: entityId,
            entity,
            components: componentTypes.reduce((acc, type) => {
              acc[type] = globalStore.scene.components[type][entityId]
              return acc
            }, {})
          })
        }
      })
      
      // Cache the result
      globalStore.scene.queryCache[cacheKey] = {
        result: entities,
        version: globalStore.scene.cacheVersion
      }
      
      return entities
    },
    
    // Selection
    selectEntity: (entityId) => {
      globalStore.scene.selectedEntity = entityId
    },
    
    // Utility
    setSceneRoot: (entityId) => {
      globalStore.scene.sceneRoot = entityId
    },
    
    clear: () => {
      Object.keys(globalStore.scene.entities).forEach(key => delete globalStore.scene.entities[key])
      globalStore.scene.entityCounter = 0
      globalStore.scene.selectedEntity = null
      globalStore.scene.sceneRoot = null
      
      // Clear all component objects
      Object.values(globalStore.scene.components).forEach(componentObj => {
        Object.keys(componentObj).forEach(key => delete componentObj[key])
      })
      
      Object.keys(globalStore.scene.queryCache).forEach(key => delete globalStore.scene.queryCache[key])
      globalStore.scene.cacheVersion = 0
    },
    
    // Cache management
    invalidateQueryCache: () => {
      globalStore.scene.cacheVersion++
    }
  },

  // ===== RENDER ACTIONS =====
  render: {
    // Camera controls
    setCamera: (updates) => {
      Object.assign(globalStore.render.camera, updates)
    },
    
    setCameraPosition: (x, y, z) => {
      globalStore.render.camera.position[0] = x
      globalStore.render.camera.position[1] = y
      globalStore.render.camera.position[2] = z
    },
    
    setCameraRotation: (x, y, z) => {
      globalStore.render.camera.rotation[0] = x
      globalStore.render.camera.rotation[1] = y
      globalStore.render.camera.rotation[2] = z
    },
    
    setCameraTarget: (x, y, z) => {
      globalStore.render.camera.target[0] = x
      globalStore.render.camera.target[1] = y
      globalStore.render.camera.target[2] = z
    },
    
    // Light management
    addLight: (id, lightData) => {
      globalStore.render.lighting.lights[id] = lightData
    },
    
    removeLight: (id) => {
      delete globalStore.render.lighting.lights[id]
    },
    
    updateLight: (id, updates) => {
      const light = globalStore.render.lighting.lights[id]
      if (light) {
        Object.assign(light, updates)
      }
    },
    
    setAmbientLight: (intensity, color) => {
      globalStore.render.lighting.ambient.intensity = intensity
      globalStore.render.lighting.ambient.color = color
    },
    
    // Render settings
    updateSettings: (newSettings) => {
      Object.assign(globalStore.render.settings, newSettings)
    },
    
    // Environment management
    setEnvironment: (preset, intensity = 1.0, type = 'hdr', environmentType = 'preset') => {
      globalStore.render.environment.preset = preset
      globalStore.render.environment.intensity = intensity
      globalStore.render.environment.type = type
      globalStore.render.environment.environmentType = environmentType
    },
    
    setEnvironmentIntensity: (intensity) => {
      globalStore.render.environment.intensity = intensity
    },
    
    clearEnvironment: () => {
      globalStore.render.environment.preset = null
      globalStore.render.environment.intensity = 1.0
      globalStore.render.environment.type = 'color'
      globalStore.render.environment.environmentType = null
    },
    
    // Post-processing effects
    addEffect: (id, effect) => {
      globalStore.render.effects[id] = effect
    },
    
    removeEffect: (id) => {
      delete globalStore.render.effects[id]
    },
    
    updateEffect: (id, updates) => {
      const effect = globalStore.render.effects[id]
      if (effect) {
        Object.assign(effect, updates)
      }
    },
    
    // Performance monitoring
    updatePerformance: (newStats) => {
      Object.assign(globalStore.render.performance, {
        ...newStats,
        lastUpdate: performance.now()
      })
    },
    
    // Render system management
    resize: (width, height) => {
      if (renderRefs.engine) {
        renderRefs.engine.resize()
      }
      
      globalStore.render.camera.aspect = width / height
    },
    
    setScene: (scene) => {
      renderRefs.scene = scene
    },
    
    setEngine: (engine) => {
      renderRefs.engine = engine
    },
    
    setCameraRef: (camera) => {
      renderRefs.camera = camera
    },
    
    // Getters for non-serializable objects
    getScene: () => renderRefs.scene,
    getEngine: () => renderRefs.engine,
    getCamera: () => renderRefs.camera,
    
    // Advanced lighting controls
    setShadowsEnabled: (enabled) => {
      globalStore.render.lighting.shadowsEnabled = enabled
      globalStore.render.settings.shadows = enabled
    }
  },

  // ===== ASSETS ACTIONS =====
  assets: {
    // Generic asset loading
    loadAsset: async (id, url, type, options = {}) => {
      if (actions.assets.isLoaded(id)) {
        return actions.assets.getAsset(id, type)
      }
      
      globalStore.assets.loading.active[id] = { 
        type, 
        url, 
        progress: 0,
        startTime: Date.now()
      }
      
      try {
        let asset
        switch (type) {
          case 'texture':
            asset = await actions.assets._loadTexture(id, url, options)
            break
          case 'model':
            asset = await actions.assets._loadModel(id, url, options)
            break
          case 'sound':
            asset = await actions.assets._loadSound(id, url, options)
            break
          default:
            throw new Error(`Unsupported asset type: ${type}`)
        }
        
        // Store the loaded asset
        globalStore.assets.assets[`${type}s`][id] = asset
        globalStore.assets.metadata.loaded[id] = {
          ...asset,
          loadedAt: Date.now(),
          accessCount: 0,
          lastAccessed: Date.now()
        }
        
        // Update cache size
        if (asset.size) {
          globalStore.assets.cache.currentSize += asset.size
        }
        
        // Clean up loading state
        delete globalStore.assets.loading.active[id]
        actions.assets.updateProgress()
        
        return asset
        
      } catch (error) {
        globalStore.assets.metadata.errors[id] = error.message
        delete globalStore.assets.loading.active[id]
        actions.assets.updateProgress()
        throw error
      }
    },
    
    // Specific loaders
    _loadTexture: async (id, url, options = {}) => {
      const response = await fetch(url)
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      
      return {
        id,
        url: imageUrl,
        originalUrl: url,
        type: 'texture',
        format: options.format || 'auto',
        flipY: options.flipY !== false,
        wrapS: options.wrapS || 'repeat',
        wrapT: options.wrapT || 'repeat',
        minFilter: options.minFilter || 'linear',
        magFilter: options.magFilter || 'linear',
        size: blob.size
      }
    },
    
    _loadModel: async (id, url, options = {}) => {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      
      return {
        id,
        url,
        type: 'model',
        data: arrayBuffer,
        format: options.format || url.split('.').pop().toLowerCase(),
        size: arrayBuffer.byteLength
      }
    },
    
    _loadSound: async (id, url, options = {}) => {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      
      return {
        id,
        url,
        type: 'sound',
        data: arrayBuffer,
        format: options.format || url.split('.').pop().toLowerCase(),
        volume: options.volume || 1.0,
        loop: options.loop || false,
        size: arrayBuffer.byteLength
      }
    },
    
    // Asset retrieval with access tracking
    getAsset: (id, type) => {
      const asset = globalStore.assets.assets[`${type}s`][id]
      if (asset) {
        // Update access metadata for cache management
        const metadata = globalStore.assets.metadata.loaded[id]
        if (metadata) {
          metadata.accessCount++
          metadata.lastAccessed = Date.now()
        }
      }
      return asset
    },
    
    // Convenience getters
    getTexture: (id) => actions.assets.getAsset(id, 'texture'),
    getModel: (id) => actions.assets.getAsset(id, 'model'),
    getSound: (id) => actions.assets.getAsset(id, 'sound'),
    getMaterial: (id) => actions.assets.getAsset(id, 'material'),
    
    // Asset management
    unloadAsset: (id) => {
      let removedSize = 0
      
      // Find and remove from all asset types
      Object.entries(globalStore.assets.assets).forEach(([type, assetObj]) => {
        const asset = assetObj[id]
        if (asset) {
          if (asset.size) removedSize += asset.size
          
          // Clean up blob URLs for textures
          if (type === 'textures' && asset.url?.startsWith('blob:')) {
            URL.revokeObjectURL(asset.url)
          }
          
          delete assetObj[id]
        }
      })
      
      // Clean up metadata
      delete globalStore.assets.metadata.loaded[id]
      delete globalStore.assets.metadata.errors[id]
      
      // Update cache size
      globalStore.assets.cache.currentSize = Math.max(0, globalStore.assets.cache.currentSize - removedSize)
    },
    
    // Progress tracking
    updateProgress: () => {
      const loadedCount = globalStore.assets.metadata.loaded.size
      const totalCount = loadedCount + globalStore.assets.loading.active.size
      
      globalStore.assets.loading.progress.loaded = loadedCount
      globalStore.assets.loading.progress.total = Math.max(totalCount, globalStore.assets.loading.progress.total)
      globalStore.assets.loading.progress.percentage = globalStore.assets.loading.progress.total > 0 
        ? (loadedCount / globalStore.assets.loading.progress.total) * 100 
        : 0
    },
    
    // Utility functions
    isLoading: (id) => globalStore.assets.loading.active[id] !== undefined,
    hasError: (id) => globalStore.assets.metadata.errors[id] !== undefined,
    isLoaded: (id) => globalStore.assets.metadata.loaded[id] !== undefined,
    
    // Cache management
    clearCache: () => {
      // Revoke all blob URLs
      Object.values(globalStore.assets.assets.textures).forEach(texture => {
        if (texture.url?.startsWith('blob:')) {
          URL.revokeObjectURL(texture.url)
        }
      })
      
      // Clear all objects
      Object.values(globalStore.assets.assets).forEach(assetObj => {
        Object.keys(assetObj).forEach(key => delete assetObj[key])
      })
      Object.keys(globalStore.assets.metadata.loaded).forEach(key => delete globalStore.assets.metadata.loaded[key])
      Object.keys(globalStore.assets.metadata.errors).forEach(key => delete globalStore.assets.metadata.errors[key])
      globalStore.assets.cache.currentSize = 0
    }
  }
}

// Setup Redux DevTools for debugging (TEMPORARILY DISABLED)
// Store.js loading...

if (typeof window !== 'undefined') {
  // Window available, setting up debug tools
  
  // Temporarily disable devtools to isolate the circular reference issue
  // DevTools temporarily disabled to debug circular references
  
  // Expose store globally for debugging with safe wrappers
  try {
    window.globalStore = globalStore
    // globalStore exposed
    
    window.storeActions = actions
    // storeActions exposed
    
    // Create a safe toggle function to test
    window.testToggle = () => {
      try {
        // Testing toggle...
        globalStore.editor.isOpen = !globalStore.editor.isOpen
        // Toggle successful!
        return 'SUCCESS'
      } catch (error) {
        console.error('Toggle failed:', error)
        return 'FAILED: ' + error.message
      }
    }
    // testToggle function created
    
  } catch (error) {
    console.error('❌ Failed to expose debug tools:', error)
  }
  
  // Store exposed globally for debugging
} else {
  // Window not available (server-side)
}

// Initialize default scene and setup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    // Initialize default scene for viewport-1
    actions.scene.createScene('viewport-1');
    actions.scene.setActiveScene('viewport-1');
    
    // Run migration for existing projects
    actions.editor.migrateTabOrders();
    
    // Register global store with AutoSaveManager
    autoSaveManager.registerStore('global', globalStore, {
      extractSaveData: () => ({
        editor: {
          ui: { ...globalStore.editor.ui },
          camera: { ...globalStore.editor.camera },
          settings: { ...globalStore.editor.settings },
          panels: { ...globalStore.editor.panels }
        },
        scene: {
          scenes: Object.entries(globalStore.scene.scenes),
          activeSceneId: globalStore.scene.activeSceneId,
          entities: Object.entries(globalStore.scene.entities).map(([id, entity]) => [
            id,
            {
              ...entity,
              components: Array.from(entity.components)
            }
          ]),
          entityCounter: globalStore.scene.entityCounter,
          sceneRoot: globalStore.scene.sceneRoot,
          selectedEntity: globalStore.scene.selectedEntity,
          components: Object.fromEntries(
            Object.entries(globalStore.scene.components).map(([key, componentObj]) => [
              key,
              Object.entries(componentObj)
            ])
          )
        },
        render: {
          camera: { ...globalStore.render.camera },
          environment: { ...globalStore.render.environment },
          lighting: {
            ambient: { ...globalStore.render.lighting.ambient },
            shadowsEnabled: globalStore.render.lighting.shadowsEnabled
          },
          settings: { ...globalStore.render.settings }
        }
      }),
      restoreData: (data) => {
        // Restore editor data
        if (data.editor) {
          if (data.editor.ui) Object.assign(globalStore.editor.ui, data.editor.ui)
          if (data.editor.camera) Object.assign(globalStore.editor.camera, data.editor.camera)
          if (data.editor.settings) Object.assign(globalStore.editor.settings, data.editor.settings)
          if (data.editor.panels) Object.assign(globalStore.editor.panels, data.editor.panels)
        }
        
        // Restore scene data
        if (data.scene) {
          if (data.scene.scenes) {
            globalStore.scene.scenes = Object.fromEntries(data.scene.scenes)
          }
          if (data.scene.activeSceneId !== undefined) {
            globalStore.scene.activeSceneId = data.scene.activeSceneId
          }
          if (data.scene.entities) {
            globalStore.scene.entities = Object.fromEntries(data.scene.entities.map(([id, entity]) => [
              id,
              {
                ...entity,
                components: Array.from(entity.components || [])
              }
            ]))
          }
          if (data.scene.entityCounter !== undefined) {
            globalStore.scene.entityCounter = data.scene.entityCounter
          }
          if (data.scene.sceneRoot !== undefined) {
            globalStore.scene.sceneRoot = data.scene.sceneRoot
          }
          if (data.scene.selectedEntity !== undefined) {
            globalStore.scene.selectedEntity = data.scene.selectedEntity
          }
          if (data.scene.components) {
            Object.entries(data.scene.components).forEach(([componentType, componentData]) => {
              if (globalStore.scene.components[componentType]) {
                globalStore.scene.components[componentType] = Object.fromEntries(componentData)
              }
            })
          }
        }
        
        // Restore render data
        if (data.render) {
          if (data.render.camera) Object.assign(globalStore.render.camera, data.render.camera)
          if (data.render.environment) Object.assign(globalStore.render.environment, data.render.environment)
          if (data.render.lighting) {
            if (data.render.lighting.ambient) Object.assign(globalStore.render.lighting.ambient, data.render.lighting.ambient)
            if (data.render.lighting.shadowsEnabled !== undefined) globalStore.render.lighting.shadowsEnabled = data.render.lighting.shadowsEnabled
          }
          if (data.render.settings) Object.assign(globalStore.render.settings, data.render.settings)
        }
        
        // Run migration after loading saved data
        actions.editor.migrateTabOrders();
      }
    })
  }, 100)
}

// The globalStore and actions are already exported above where they're defined

// Photo editor store factory for backward compatibility
export const createPhotoEditorStore = () => {
  const state = proxy({
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
    currentHistoryIndex: 0,
    activeAdjustment: 'brightness-contrast',
    adjustments: {
      brightness: 0,
      contrast: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 0,
      vibrance: 0,
      hue: 0,
      temperature: 0,
      tint: 0,
      clarity: 0,
      dehaze: 0,
      vignette: 0
    }
  });

  const storeActions = {
    setTool: (tool) => {
      state.selectedTool = tool;
    },
    setZoom: (zoom) => {
      state.zoom = zoom;
    },
    setImage: (image) => {
      state.image = image;
    },
    addLayer: (layer) => {
      state.layers.push(layer);
    },
    updateLayer: (layerId, updates) => {
      const layerIndex = state.layers.findIndex(l => l.id === layerId);
      if (layerIndex !== -1) {
        Object.assign(state.layers[layerIndex], updates);
      }
    },
    removeLayer: (layerId) => {
      const layerIndex = state.layers.findIndex(l => l.id === layerId);
      if (layerIndex !== -1) {
        state.layers.splice(layerIndex, 1);
      }
    },
    setSelectedLayer: (layerId) => {
      state.selectedLayer = layerId;
    },
    setBlendMode: (blendMode) => {
      state.blendMode = blendMode;
    },
    setColors: (foreground, background) => {
      if (foreground !== undefined) state.foregroundColor = foreground;
      if (background !== undefined) state.backgroundColor = background;
    },
    updateBrushSettings: (settings) => {
      Object.assign(state.brushSettings, settings);
    },
    addHistoryState: (action) => {
      const history = state.history;
      const newState = {
        id: Date.now().toString(),
        name: action.name,
        action: action.type,
        time: new Date().toLocaleTimeString()
      };
      history.splice(state.currentHistoryIndex + 1);
      history.push(newState);
      state.currentHistoryIndex = history.length - 1;
    },
    setHistoryIndex: (index) => {
      const maxIndex = state.history.length - 1;
      state.currentHistoryIndex = Math.max(0, Math.min(index, maxIndex));
    },
    setActiveAdjustment: (adjustment) => {
      state.activeAdjustment = adjustment;
    },
    setAdjustment: (property, value) => {
      state.adjustments[property] = value;
    },
    resetAdjustments: () => {
      state.adjustments = {
        brightness: 0,
        contrast: 0,
        exposure: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0,
        saturation: 0,
        vibrance: 0,
        hue: 0,
        temperature: 0,
        tint: 0,
        clarity: 0,
        dehaze: 0,
        vignette: 0
      };
    }
  };

  // Setup Redux DevTools for debugging
  if (typeof window !== 'undefined') {
    devtools(state, {
      name: 'Photo Editor Store Instance',
      enabled: process.env.NODE_ENV === 'development'
    });
  }

  return { state, actions: storeActions };
};

// Model preview store for backward compatibility
export const modelPreviewState = proxy({
  model: null,
  modelInfo: null,
  viewMode: 'solid',
  showGrid: true,
  autoRotate: false,
  animations: [],
  currentAnimation: null,
  isPlaying: false,
  animationSpeed: 1.0,
  loop: true,
  cameraDistance: 5,
  cameraRotation: { x: 0, y: 0 },
  cameraTarget: { x: 0, y: 0, z: 0 },
  lighting: {
    ambientIntensity: 0.4,
    directionalIntensity: 1.0,
    directionalPosition: [10, 10, 5],
    shadowsEnabled: true
  },
  environment: {
    background: '#2d3748',
    environmentMap: null,
    environmentIntensity: 1.0
  },
  materials: [],
  selectedMaterial: null,
  geometry: {
    vertices: 0,
    faces: 0,
    boundingBox: null,
    center: [0, 0, 0]
  },
  export: {
    format: 'gltf',
    scale: 1.0,
    includeAnimations: true,
    includeMaterials: true,
    compression: false
  }
})

export const modelPreviewActions = {
  setModel: (model) => {
    modelPreviewState.model = model
  },
  setModelInfo: (modelInfo) => {
    modelPreviewState.modelInfo = modelInfo
  },
  setViewMode: (viewMode) => {
    modelPreviewState.viewMode = viewMode
  },
  setShowGrid: (showGrid) => {
    modelPreviewState.showGrid = showGrid
  },
  setAutoRotate: (autoRotate) => {
    modelPreviewState.autoRotate = autoRotate
  },
  setAnimations: (animations) => {
    modelPreviewState.animations = animations
  },
  setCurrentAnimation: (animationIndex) => {
    modelPreviewState.currentAnimation = animationIndex
  },
  setPlaying: (isPlaying) => {
    modelPreviewState.isPlaying = isPlaying
  },
  setAnimationSpeed: (speed) => {
    modelPreviewState.animationSpeed = speed
  },
  setLoop: (loop) => {
    modelPreviewState.loop = loop
  },
  setCameraDistance: (distance) => {
    modelPreviewState.cameraDistance = distance
  },
  setCameraRotation: (rotation) => {
    Object.assign(modelPreviewState.cameraRotation, rotation)
  },
  setCameraTarget: (target) => {
    Object.assign(modelPreviewState.cameraTarget, target)
  },
  resetCamera: () => {
    modelPreviewState.cameraDistance = 5
    modelPreviewState.cameraRotation = { x: 0, y: 0 }
    modelPreviewState.cameraTarget = { x: 0, y: 0, z: 0 }
  },
  setAmbientIntensity: (intensity) => {
    modelPreviewState.lighting.ambientIntensity = intensity
  },
  setDirectionalIntensity: (intensity) => {
    modelPreviewState.lighting.directionalIntensity = intensity
  },
  setDirectionalPosition: (position) => {
    modelPreviewState.lighting.directionalPosition = position
  },
  setShadowsEnabled: (enabled) => {
    modelPreviewState.lighting.shadowsEnabled = enabled
  },
  setBackground: (background) => {
    modelPreviewState.environment.background = background
  },
  setEnvironmentMap: (environmentMap) => {
    modelPreviewState.environment.environmentMap = environmentMap
  },
  setEnvironmentIntensity: (intensity) => {
    modelPreviewState.environment.environmentIntensity = intensity
  },
  setMaterials: (materials) => {
    modelPreviewState.materials = materials
  },
  selectMaterial: (material) => {
    modelPreviewState.selectedMaterial = material
  },
  setGeometryInfo: (info) => {
    Object.assign(modelPreviewState.geometry, info)
  },
  setExportFormat: (format) => {
    modelPreviewState.export.format = format
  },
  setExportScale: (scale) => {
    modelPreviewState.export.scale = scale
  },
  setExportOptions: (options) => {
    Object.assign(modelPreviewState.export, options)
  }
}

// Setup Redux DevTools for model preview store
if (typeof window !== 'undefined') {
  devtools(modelPreviewState, {
    name: 'Model Preview Store (Legacy)',
    enabled: process.env.NODE_ENV === 'development'
  })
}