import { create } from 'zustand'

export const useRenderStore = create((set, get) => ({
  // Scene settings
  scene: null,
  renderer: null,
  
  // Camera settings
  camera: {
    position: [3, 3, 3],
    rotation: [0, 0, 0],
    fov: 60,
    near: 0.1,
    far: 1000,
    target: [0, 0, 0]
  },
  
  // Lighting
  lights: new Map(),
  ambientLight: {
    intensity: 0.5,
    color: '#ffffff'
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
  
  // Post-processing
  effects: new Map(),
  
  // Performance
  stats: {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    memory: 0
  },
  
  // Actions
  setCamera: (updates) => set(state => ({
    camera: { ...state.camera, ...updates }
  })),
  
  setCameraPosition: (x, y, z) => set(state => ({
    camera: { ...state.camera, position: [x, y, z] }
  })),
  
  setCameraRotation: (x, y, z) => set(state => ({
    camera: { ...state.camera, rotation: [x, y, z] }
  })),
  
  setCameraTarget: (x, y, z) => set(state => ({
    camera: { ...state.camera, target: [x, y, z] }
  })),
  
  addLight: (id, lightData) => set(state => ({
    lights: new Map(state.lights).set(id, lightData)
  })),
  
  removeLight: (id) => set(state => {
    const newLights = new Map(state.lights)
    newLights.delete(id)
    return { lights: newLights }
  }),
  
  updateLight: (id, updates) => set(state => {
    const light = state.lights.get(id)
    if (!light) return state
    
    return {
      lights: new Map(state.lights).set(id, { ...light, ...updates })
    }
  }),
  
  setAmbientLight: (intensity, color) => set({
    ambientLight: { intensity, color }
  }),
  
  updateSettings: (newSettings) => set(state => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  addEffect: (id, effect) => set(state => ({
    effects: new Map(state.effects).set(id, effect)
  })),
  
  removeEffect: (id) => set(state => {
    const newEffects = new Map(state.effects)
    newEffects.delete(id)
    return { effects: newEffects }
  }),
  
  updateStats: (newStats) => set(state => ({
    stats: { ...state.stats, ...newStats }
  })),
  
  // Render helpers
  resize: (width, height) => {
    const { renderer, camera } = get()
    if (renderer) {
      renderer.setSize(width, height)
    }
    
    set(state => ({
      camera: {
        ...state.camera,
        aspect: width / height
      }
    }))
  },
  
  setScene: (scene) => set({ scene }),
  setRenderer: (renderer) => set({ renderer })
}))