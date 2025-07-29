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
      scale: [100, 5, 100], // Much larger like Unreal's platform
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
    // Folder: Parkour Objects
    {
      id: 'folder-parkour',
      name: 'Parkour Objects',
      type: 'folder',
      expanded: true,
      visible: true,
      children: ['parkour-ramp-1', 'parkour-step-1', 'parkour-step-2', 'parkour-step-3', 'parkour-wall-1', 'parkour-pillar-1', 'parkour-platform-1']
    },
    // Parkour/Test Objects
    {
      id: 'parkour-ramp-1',
      name: 'Ramp',
      type: 'mesh',
      position: [10, 1, 0],
      rotation: [0, 0, 0.262], // 15 degree ramp
      scale: [8, 0.5, 4],
      geometry: 'box',
      material: { 
        color: '#555555',
        roughness: 0.8,
        metalness: 0.1
      },
      visible: true,
      parentId: 'folder-parkour'
    },
    {
      id: 'parkour-step-1',
      name: 'Step Block',
      type: 'mesh',
      position: [-8, 0.5, 5],
      rotation: [0, 0, 0],
      scale: [3, 1, 3],
      geometry: 'box',
      material: { 
        color: '#4a4a4a',
        roughness: 0.8,
        metalness: 0.1
      },
      visible: true,
      parentId: 'folder-parkour'
    },
    {
      id: 'parkour-step-2',
      name: 'Step Block Tall',
      type: 'mesh',
      position: [-8, 1.5, 0],
      rotation: [0, 0, 0],
      scale: [3, 3, 3],
      geometry: 'box',
      material: { 
        color: '#4a4a4a',
        roughness: 0.8,
        metalness: 0.1
      },
      visible: true,
      parentId: 'folder-parkour'
    },
    {
      id: 'parkour-step-3',
      name: 'Step Block Higher',
      type: 'mesh',
      position: [-8, 2.5, -5],
      rotation: [0, 0, 0],
      scale: [3, 5, 3],
      geometry: 'box',
      material: { 
        color: '#4a4a4a',
        roughness: 0.8,
        metalness: 0.1
      },
      visible: true,
      parentId: 'folder-parkour'
    },
    {
      id: 'parkour-wall-1',
      name: 'Wall',
      type: 'mesh',
      position: [0, 2.5, 15],
      rotation: [0, 0, 0],
      scale: [20, 5, 1],
      geometry: 'box',
      material: { 
        color: '#505050',
        roughness: 0.9,
        metalness: 0.05
      },
      visible: true,
      parentId: 'folder-parkour'
    },
    {
      id: 'parkour-pillar-1',
      name: 'Pillar',
      type: 'mesh',
      position: [15, 4, 10],
      rotation: [0, 0, 0],
      scale: [1.5, 8, 1.5],
      geometry: 'box',
      material: { 
        color: '#606060',
        roughness: 0.7,
        metalness: 0.15
      },
      visible: true,
      parentId: 'folder-parkour'
    },
    {
      id: 'parkour-platform-1',
      name: 'Floating Platform',
      type: 'mesh',
      position: [0, 5, -10],
      rotation: [0, 0, 0],
      scale: [6, 0.5, 6],
      geometry: 'box',
      material: { 
        color: '#454545',
        roughness: 0.8,
        metalness: 0.1
      },
      visible: true,
      parentId: 'folder-parkour'
    },
    // Folder: Test Objects
    {
      id: 'folder-test-objects',
      name: 'Test Objects',
      type: 'folder',
      expanded: true,
      visible: true,
      children: ['demo-sphere-1', 'demo-cylinder-1']
    },
    {
      id: 'demo-sphere-1',
      name: 'Test Sphere',
      type: 'mesh',
      position: [5, 1, 5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      geometry: 'sphere',
      material: { 
        color: '#ff6b35',
        roughness: 0.4,
        metalness: 0.6
      },
      visible: true,
      parentId: 'folder-test-objects'
    },
    {
      id: 'demo-cylinder-1',
      name: 'Test Cylinder',
      type: 'mesh',
      position: [-5, 1, -5],
      rotation: [0, 0, 0],
      scale: [1, 2, 1],
      geometry: 'cylinder',
      material: { 
        color: '#35a7ff',
        roughness: 0.3,
        metalness: 0.7
      },
      visible: true,
      parentId: 'folder-test-objects'
    },
    // Folder: Lighting
    {
      id: 'folder-lighting',
      name: 'Lighting',
      type: 'folder',
      expanded: true,
      visible: true,
      children: ['sun-light-1', 'fill-light-1', 'rim-light-1', 'point-light-1']
    },
    {
      id: 'sun-light-1',
      name: 'Sun Light',
      type: 'light',
      lightType: 'directional',
      position: [10, 10, 5],
      rotation: [-0.785, 0.524, 0], // Pointing down and slightly angled
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
    },
    {
      id: 'fill-light-1',
      name: 'Fill Light',
      type: 'light',
      lightType: 'directional',
      position: [-8, 8, 3],
      rotation: [0.524, -0.785, 0], // Angled fill lighting
      color: '#b3d9ff',
      intensity: 0.4,
      castShadow: false,
      visible: true,
      parentId: 'folder-lighting'
    },
    {
      id: 'rim-light-1',
      name: 'Rim Light',
      type: 'light',
      lightType: 'directional',
      position: [-3, 6, -8],
      rotation: [0.262, 0.785, 0], // Back lighting for rim effect
      color: '#ffdfb3',
      intensity: 0.6,
      castShadow: false,
      visible: true,
      parentId: 'folder-lighting'
    },
    {
      id: 'point-light-1',
      name: 'Point Light',
      type: 'light',
      lightType: 'point',
      position: [0, 3, 0],
      color: '#ffaa55',
      intensity: 0.8,
      distance: 20,
      decay: 2,
      castShadow: true,
      visible: true,
      shadowMapSize: [1024, 1024],
      parentId: 'folder-lighting'
    },
    // Folder: Cameras
    {
      id: 'folder-cameras',
      name: 'Cameras',
      type: 'folder',
      expanded: true,
      visible: true,
      children: ['main-camera-1']
    },
    {
      id: 'main-camera-1',
      name: 'Main Camera',
      type: 'camera',
      cameraType: 'perspective',
      position: [3, 3, 3],
      rotation: [0, 0, 0],
      fov: 60,
      near: 0.1,
      far: 1000,
      visible: true,
      isMainCamera: true,
      parentId: 'folder-cameras'
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
  },

  snapObjectToSurface: (objectId) => {
    const object = editorState.sceneObjects.find(obj => obj.id === objectId)
    if (!object) return

    console.log('🎯 Snapping object to surface:', object.name)
    
    // Get the object's current position and scale
    const currentPos = object.position || [0, 0, 0]
    const currentScale = object.scale || [1, 1, 1]
    
    // Calculate the bottom of the current object
    const currentObjectBottom = currentPos[1] - (currentScale[1] / 2)
    
    // Find the highest surface below the object's bottom
    let highestSurface = 0 // Ground level (grid)
    let foundSurface = false
    
    // Check other objects as potential surfaces
    editorState.sceneObjects.forEach(otherObject => {
      if (otherObject.id === objectId) return // Skip self
      
      const otherPos = otherObject.position || [0, 0, 0]
      const otherScale = otherObject.scale || [1, 1, 1]
      
      // Check if objects overlap horizontally (within reasonable snapping distance)
      const horizontalDistance = Math.sqrt(
        Math.pow(currentPos[0] - otherPos[0], 2) + 
        Math.pow(currentPos[2] - otherPos[2], 2)
      )
      
      // Consider objects within 3 units as potential surfaces
      if (horizontalDistance <= 3) {
        // Calculate the top surface of the other object
        const objectTop = otherPos[1] + (otherScale[1] / 2)
        
        // Only consider surfaces that are below the current object's bottom
        // and find the highest one among those
        if (objectTop < currentObjectBottom && objectTop > highestSurface) {
          highestSurface = objectTop
          foundSurface = true
        }
      }
    })
    
    // Calculate where the center of the current object should be placed
    const objectHalfHeight = currentScale[1] / 2
    const snappedY = highestSurface + objectHalfHeight + 0.01 // Small offset to prevent z-fighting
    
    const snappedPosition = [currentPos[0], snappedY, currentPos[2]]
    
    // Update the object's position
    editorActions.updateSceneObject(objectId, { position: snappedPosition })
    
    console.log('✅ Object snapped from', currentPos, 'to', snappedPosition)
    console.log('📏 Current object bottom was at Y:', currentObjectBottom)
    console.log('📏 Highest surface below found at Y:', highestSurface)
    console.log('📏 Object center placed at Y:', snappedY)
    
    if (!foundSurface) {
      console.log('📋 No surfaces found below object, snapped to ground level')
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