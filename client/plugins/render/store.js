import { proxy, subscribe, useSnapshot } from 'valtio'
import { autoSaveManager } from '@/plugins/core/AutoSaveManager.js'

// Non-serializable objects stored outside proxy
let renderRefs = {
  scene: null,
  renderer: null
}

// Create the reactive render state (without non-serializable objects)
export const renderState = proxy({
  
  // Environment settings grouped for better reactivity
  environment: {
    preset: null,
    intensity: 1.0,
    type: 'color', // 'color', 'hdr'
    environmentType: null // 'room', 'preset'
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
    lights: new Map(),
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
  effects: new Map(),
  
  // Performance monitoring
  performance: {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    memory: 0,
    lastUpdate: 0
  }
})

// Actions that mutate the state directly
export const renderActions = {
  // Camera controls
  setCamera: (updates) => {
    Object.assign(renderState.camera, updates)
  },
  
  setCameraPosition: (x, y, z) => {
    renderState.camera.position[0] = x
    renderState.camera.position[1] = y
    renderState.camera.position[2] = z
  },
  
  setCameraRotation: (x, y, z) => {
    renderState.camera.rotation[0] = x
    renderState.camera.rotation[1] = y
    renderState.camera.rotation[2] = z
  },
  
  setCameraTarget: (x, y, z) => {
    renderState.camera.target[0] = x
    renderState.camera.target[1] = y
    renderState.camera.target[2] = z
  },
  
  // Light management
  addLight: (id, lightData) => {
    renderState.lighting.lights.set(id, lightData)
  },
  
  removeLight: (id) => {
    renderState.lighting.lights.delete(id)
  },
  
  updateLight: (id, updates) => {
    const light = renderState.lighting.lights.get(id)
    if (light) {
      Object.assign(light, updates)
    }
  },
  
  setAmbientLight: (intensity, color) => {
    renderState.lighting.ambient.intensity = intensity
    renderState.lighting.ambient.color = color
  },
  
  // Render settings
  updateSettings: (newSettings) => {
    Object.assign(renderState.settings, newSettings)
  },
  
  // Environment management
  setEnvironment: (preset, intensity = 1.0, type = 'hdr', environmentType = 'preset') => {
    renderState.environment.preset = preset
    renderState.environment.intensity = intensity
    renderState.environment.type = type
    renderState.environment.environmentType = environmentType
  },
  
  setEnvironmentIntensity: (intensity) => {
    renderState.environment.intensity = intensity
  },
  
  clearEnvironment: () => {
    renderState.environment.preset = null
    renderState.environment.intensity = 1.0
    renderState.environment.type = 'color'
    renderState.environment.environmentType = null
  },
  
  // Post-processing effects
  addEffect: (id, effect) => {
    renderState.effects.set(id, effect)
  },
  
  removeEffect: (id) => {
    renderState.effects.delete(id)
  },
  
  updateEffect: (id, updates) => {
    const effect = renderState.effects.get(id)
    if (effect) {
      Object.assign(effect, updates)
    }
  },
  
  // Performance monitoring
  updatePerformance: (newStats) => {
    Object.assign(renderState.performance, {
      ...newStats,
      lastUpdate: performance.now()
    })
  },
  
  // Render system management
  resize: (width, height) => {
    if (renderRefs.renderer) {
      renderRefs.renderer.setSize(width, height)
    }
    
    renderState.camera.aspect = width / height
  },
  
  setScene: (scene) => {
    renderRefs.scene = scene
  },
  
  setRenderer: (renderer) => {
    renderRefs.renderer = renderer
  },
  
  // Getters for non-serializable objects
  getScene: () => renderRefs.scene,
  getRenderer: () => renderRefs.renderer,
  
  // Advanced lighting controls
  setShadowsEnabled: (enabled) => {
    renderState.lighting.shadowsEnabled = enabled
    renderState.settings.shadows = enabled
  },
  
  // Batch light updates for performance
  batchUpdateLights: (lightUpdates) => {
    lightUpdates.forEach(({ id, updates }) => {
      renderActions.updateLight(id, updates)
    })
  },
  
  // Environment presets
  applyEnvironmentPreset: (presetName) => {
    const presets = {
      'sunset': {
        preset: 'sunset',
        intensity: 1.2,
        type: 'hdr',
        environmentType: 'preset'
      },
      'studio': {
        preset: null,
        intensity: 1.0,
        type: 'color',
        environmentType: 'room'
      },
      'forest': {
        preset: 'forest',
        intensity: 0.8,
        type: 'hdr',
        environmentType: 'preset'
      }
    }
    
    const preset = presets[presetName]
    if (preset) {
      Object.assign(renderState.environment, preset)
    }
  }
}

// Set up automatic performance monitoring
if (typeof window !== 'undefined') {
  let frameStartTime = 0
  let frameCount = 0
  
  // Performance monitoring state
  let performanceMonitoringActive = true
  
  // Monitor rendering performance conditionally
  const updatePerformanceStats = () => {
    if (!performanceMonitoringActive) return
    
    const now = performance.now()
    const deltaTime = now - frameStartTime
    frameStartTime = now
    frameCount++
    
    if (frameCount % 60 === 0) { // Update every 60 frames
      renderActions.updatePerformance({
        fps: Math.round(1000 / deltaTime),
        frameTime: deltaTime,
        // These would be populated by the actual renderer
        drawCalls: 0,
        triangles: 0,
        memory: 0
      })
    }
    
    requestAnimationFrame(updatePerformanceStats)
  }
  
  // Export performance monitoring controls
  window.renderPerformanceMonitoring = {
    start: () => {
      performanceMonitoringActive = true
      console.log('🚀 Render performance monitoring started')
    },
    stop: () => {
      performanceMonitoringActive = false
      console.log('⏸️ Render performance monitoring stopped')
    }
  }
  
  requestAnimationFrame(updatePerformanceStats)
}

// Register render store with AutoSaveManager (no localStorage)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    autoSaveManager.registerStore('render', renderState, {
      extractSaveData: () => ({
        camera: { ...renderState.camera },
        environment: { ...renderState.environment },
        lighting: {
          ambient: { ...renderState.lighting.ambient },
          shadowsEnabled: renderState.lighting.shadowsEnabled
        },
        settings: { ...renderState.settings }
      }),
      restoreData: (data) => {
        if (data.camera) Object.assign(renderState.camera, data.camera)
        if (data.environment) Object.assign(renderState.environment, data.environment)
        if (data.lighting) {
          if (data.lighting.ambient) Object.assign(renderState.lighting.ambient, data.lighting.ambient)
          if (data.lighting.shadowsEnabled !== undefined) renderState.lighting.shadowsEnabled = data.lighting.shadowsEnabled
        }
        if (data.settings) Object.assign(renderState.settings, data.settings)
      }
    })
  }, 100)
}