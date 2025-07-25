import { create } from 'zustand'

export const useAudioStore = create((set, get) => ({
  // Audio context
  context: null,
  masterVolume: 1.0,
  
  // Audio sources
  sounds: new Map(),
  music: new Map(),
  
  // 3D Audio
  listener: {
    position: [0, 0, 0],
    orientation: [0, 0, -1, 0, 1, 0]
  },
  
  // Actions
  initAudio: async () => {
    if (!get().context) {
      const context = new (window.AudioContext || window.webkitAudioContext)()
      set({ context })
      
      // Resume context if suspended (required by some browsers)
      if (context.state === 'suspended') {
        await context.resume()
      }
      
      return context
    }
    return get().context
  },
  
  loadSound: async (id, url) => {
    const context = get().context
    if (!context) return null
    
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await context.decodeAudioData(arrayBuffer)
      
      set(state => ({
        sounds: new Map(state.sounds).set(id, audioBuffer)
      }))
      
      return audioBuffer
    } catch (error) {
      console.error('Failed to load sound:', error)
      return null
    }
  },
  
  playSound: (id, options = {}) => {
    const context = get().context
    const sound = get().sounds.get(id)
    
    if (!context || !sound) return null
    
    const source = context.createBufferSource()
    const gainNode = context.createGain()
    
    source.buffer = sound
    source.connect(gainNode)
    
    // Apply options
    if (options.loop) source.loop = true
    if (options.volume !== undefined) gainNode.gain.value = options.volume
    if (options.rate) source.playbackRate.value = options.rate
    
    // 3D positioning
    if (options.position) {
      const panner = context.createPanner()
      panner.setPosition(...options.position)
      gainNode.connect(panner)
      panner.connect(context.destination)
    } else {
      gainNode.connect(context.destination)
    }
    
    source.start(options.when || 0)
    return source
  },
  
  setMasterVolume: (volume) => set({ masterVolume: Math.max(0, Math.min(1, volume)) }),
  
  setListenerPosition: (x, y, z) => set(state => ({
    listener: {
      ...state.listener,
      position: [x, y, z]
    }
  })),
  
  setListenerOrientation: (fx, fy, fz, ux, uy, uz) => set(state => ({
    listener: {
      ...state.listener,
      orientation: [fx, fy, fz, ux, uy, uz]
    }
  })),
  
  stopAllSounds: () => {
    // This would require tracking active sources
    // Implementation depends on how you want to manage active audio
  }
}))