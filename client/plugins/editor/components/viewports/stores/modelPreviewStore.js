import { proxy } from 'valtio'
import { devToolsManager } from '@/utils/devToolsManager.js'
import { log } from '@/utils/logger.js'

// Create the reactive model preview state
export const modelPreviewState = proxy({
  // Model data
  model: null,
  modelInfo: null,
  
  // View settings
  viewMode: 'solid', // solid, wireframe, skeleton
  showGrid: true,
  autoRotate: false,
  
  // Animation system
  animations: [],
  currentAnimation: null,
  isPlaying: false,
  animationSpeed: 1.0,
  loop: true,
  
  // Camera controls
  cameraDistance: 5,
  cameraRotation: { x: 0, y: 0 },
  cameraTarget: { x: 0, y: 0, z: 0 },
  
  // Lighting
  lighting: {
    ambientIntensity: 0.4,
    directionalIntensity: 1.0,
    directionalPosition: [10, 10, 5],
    shadowsEnabled: true
  },
  
  // Environment
  environment: {
    background: '#2d3748',
    environmentMap: null,
    environmentIntensity: 1.0
  },
  
  // Material inspection
  materials: [],
  selectedMaterial: null,
  
  // Geometry information
  geometry: {
    vertices: 0,
    faces: 0,
    boundingBox: null,
    center: [0, 0, 0]
  },
  
  // Export settings
  export: {
    format: 'gltf',
    scale: 1.0,
    includeAnimations: true,
    includeMaterials: true,
    compression: false
  }
})

// Actions that mutate the state directly
export const modelPreviewActions = {
  // Model management
  setModel: (model) => {
    modelPreviewState.model = model
  },
  
  setModelInfo: (modelInfo) => {
    modelPreviewState.modelInfo = modelInfo
  },
  
  // View controls
  setViewMode: (viewMode) => {
    modelPreviewState.viewMode = viewMode
  },
  
  setShowGrid: (showGrid) => {
    modelPreviewState.showGrid = showGrid
  },
  
  setAutoRotate: (autoRotate) => {
    modelPreviewState.autoRotate = autoRotate
  },
  
  // Animation controls
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
  
  // Camera controls
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
  
  // Lighting controls
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
  
  // Environment controls
  setBackground: (background) => {
    modelPreviewState.environment.background = background
  },
  
  setEnvironmentMap: (environmentMap) => {
    modelPreviewState.environment.environmentMap = environmentMap
  },
  
  setEnvironmentIntensity: (intensity) => {
    modelPreviewState.environment.environmentIntensity = intensity
  },
  
  // Material inspection
  setMaterials: (materials) => {
    modelPreviewState.materials = materials
  },
  
  selectMaterial: (material) => {
    modelPreviewState.selectedMaterial = material
  },
  
  // Geometry information
  setGeometryInfo: (info) => {
    Object.assign(modelPreviewState.geometry, info)
  },
  
  // Export settings
  setExportFormat: (format) => {
    modelPreviewState.export.format = format
  },
  
  setExportScale: (scale) => {
    modelPreviewState.export.scale = scale
  },
  
  setExportOptions: (options) => {
    Object.assign(modelPreviewState.export, options)
  },

  // DevTools lifecycle management
  registerDevTools: () => {
    devToolsManager.register('ModelPreviewState', modelPreviewState, {
      trace: true
    })
    log('🔧 Model Preview DevTools registered')
  },

  unregisterDevTools: () => {
    devToolsManager.unregister('ModelPreviewState')
    log('🔌 Model Preview DevTools unregistered')
  }
}