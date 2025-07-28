import { proxy, subscribe, useSnapshot } from 'valtio'

// Non-serializable objects stored outside proxy
let audioRefs = {
  context: null
}

// Create the reactive audio state (without non-serializable objects)
export const audioState = proxy({
  // Audio context and settings (keeping serializable properties)
  context: {
    masterVolume: 1.0,
    enabled: true,
    suspended: false
  },
  
  // Audio assets and sources
  assets: {
    sounds: new Map(),
    music: new Map(),
    buffers: new Map() // decoded audio buffers
  },
  
  // Active audio sources
  sources: {
    active: new Map(), // currently playing sources
    pool: [], // reusable source nodes
    maxSources: 32
  },
  
  // 3D Audio system
  spatial: {
    listener: {
      position: [0, 0, 0],
      orientation: [0, 0, -1, 0, 1, 0], // forward + up vectors
      velocity: [0, 0, 0]
    },
    sources: new Map() // 3D positioned sources
  },
  
  // Audio groups for mixing
  groups: {
    master: { gain: 1.0, muted: false },
    sfx: { gain: 1.0, muted: false },
    music: { gain: 0.7, muted: false },
    voice: { gain: 1.0, muted: false },
    ambient: { gain: 0.8, muted: false }
  },
  
  // Real-time audio analysis
  analysis: {
    enabled: false,
    frequency: new Uint8Array(256),
    waveform: new Float32Array(256),
    volume: 0,
    peak: 0
  }
})

// Actions that mutate the state directly
export const audioActions = {
  // Audio context management
  initAudio: async () => {
    if (audioRefs.context) {
      return audioRefs.context
    }
    
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)()
      audioRefs.context = context
      
      // Resume context if suspended (required by some browsers)
      if (context.state === 'suspended') {
        await context.resume()
        audioState.context.suspended = false
      }
      
      // Set up master gain node
      audioActions._setupMasterGain()
      
      
      return context
      
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      audioState.context.enabled = false
      return null
    }
  },
  
  _setupMasterGain: () => {
    const context = audioRefs.context
    if (!context) return
    
    // Create master gain node if it doesn't exist
    if (!context.masterGain) {
      context.masterGain = context.createGain()
      context.masterGain.connect(context.destination)
      context.masterGain.gain.value = audioState.context.masterVolume
    }
  },
  
  resumeContext: async () => {
    const context = audioRefs.context
    if (context && context.state === 'suspended') {
      await context.resume()
      audioState.context.suspended = false
    }
  },
  
  suspendContext: async () => {
    const context = audioRefs.context
    if (context && context.state === 'running') {
      await context.suspend()
      audioState.context.suspended = true
    }
  },
  
  // Asset loading
  loadSound: async (id, url, group = 'sfx') => {
    const context = audioRefs.context
    if (!context) {
      await audioActions.initAudio()
    }
    
    if (audioState.assets.sounds.has(id)) {
      return audioState.assets.sounds.get(id)
    }
    
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await context.decodeAudioData(arrayBuffer)
      
      const soundAsset = {
        id,
        url,
        buffer: audioBuffer,
        group,
        duration: audioBuffer.duration,
        channels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate,
        loadedAt: Date.now()
      }
      
      audioState.assets.sounds.set(id, soundAsset)
      audioState.assets.buffers.set(id, audioBuffer)
      
      return soundAsset
      
    } catch (error) {
      console.error(`Failed to load sound ${id}:`, error)
      throw error
    }
  },
  
  // Sound playback
  playSound: (id, options = {}) => {
    const context = audioRefs.context
    const sound = audioState.assets.sounds.get(id)
    const buffer = audioState.assets.buffers.get(id)
    
    if (!context || !sound || !buffer) {
      console.warn(`Sound ${id} not found or context not initialized`)
      return null
    }
    
    // Get or create source node
    const source = audioActions._createSourceNode()
    source.buffer = buffer
    
    // Create gain node for this source
    const gainNode = context.createGain()
    source.connect(gainNode)
    
    // Apply volume
    const volume = options.volume !== undefined ? options.volume : 1.0
    const groupGain = audioState.groups[sound.group]?.gain || 1.0
    gainNode.gain.value = volume * groupGain * audioState.context.masterVolume
    
    // Apply other options
    if (options.loop) source.loop = true
    if (options.loopStart) source.loopStart = options.loopStart
    if (options.loopEnd) source.loopEnd = options.loopEnd
    if (options.playbackRate) source.playbackRate.value = options.playbackRate
    
    // 3D positioning
    if (options.position && options.position.length === 3) {
      const panner = audioActions._create3DSource(source, options.position, options)
      panner.connect(context.masterGain || context.destination)
    } else {
      gainNode.connect(context.masterGain || context.destination)
    }
    
    // Set up cleanup when sound ends
    const cleanup = () => {
      audioState.sources.active.delete(source)
      if (options.position) {
        audioState.spatial.sources.delete(source)
      }
    }
    
    source.onended = cleanup
    
    // Start playing
    const when = options.when || 0
    const offset = options.offset || 0
    const duration = options.duration
    
    if (duration) {
      source.start(when, offset, duration)
    } else {
      source.start(when, offset)
    }
    
    // Track active source
    audioState.sources.active.set(source, {
      id,
      startTime: context.currentTime + when,
      group: sound.group,
      gainNode,
      options
    })
    
    return source
  },
  
  _createSourceNode: () => {
    const context = audioRefs.context
    
    // Try to reuse from pool
    if (audioState.sources.pool.length > 0) {
      return audioState.sources.pool.pop()
    }
    
    // Create new source
    return context.createBufferSource()
  },
  
  _create3DSource: (source, position, options = {}) => {
    const context = audioRefs.context
    const panner = context.createPanner()
    
    // Set 3D properties
    panner.panningModel = options.panningModel || 'HRTF'
    panner.distanceModel = options.distanceModel || 'inverse'
    panner.refDistance = options.refDistance || 1
    panner.maxDistance = options.maxDistance || 10000
    panner.rolloffFactor = options.rolloffFactor || 1
    panner.coneInnerAngle = options.coneInnerAngle || 360
    panner.coneOuterAngle = options.coneOuterAngle || 0
    panner.coneOuterGain = options.coneOuterGain || 0
    
    // Set position
    panner.positionX.value = position[0]
    panner.positionY.value = position[1]
    panner.positionZ.value = position[2]
    
    // Set orientation if provided
    if (options.orientation) {
      panner.orientationX.value = options.orientation[0]
      panner.orientationY.value = options.orientation[1]
      panner.orientationZ.value = options.orientation[2]
    }
    
    // Connect source to panner
    source.connect(panner)
    
    // Track spatial source
    audioState.spatial.sources.set(source, {
      panner,
      position: [...position],
      options
    })
    
    return panner
  },
  
  // Stop sounds
  stopSound: (sourceOrId) => {
    if (typeof sourceOrId === 'string') {
      // Stop all instances of this sound ID
      audioState.sources.active.forEach((info, source) => {
        if (info.id === sourceOrId) {
          source.stop()
        }
      })
    } else {
      // Stop specific source
      sourceOrId.stop()
    }
  },
  
  stopAllSounds: (group = null) => {
    audioState.sources.active.forEach((info, source) => {
      if (!group || info.group === group) {
        source.stop()
      }
    })
  },
  
  // Volume controls
  setMasterVolume: (volume) => {
    audioState.context.masterVolume = Math.max(0, Math.min(1, volume))
    
    const context = audioRefs.context
    if (context && context.masterGain) {
      context.masterGain.gain.value = audioState.context.masterVolume
    }
  },
  
  setGroupVolume: (group, volume) => {
    if (audioState.groups[group]) {
      audioState.groups[group].gain = Math.max(0, Math.min(1, volume))
      
      // Update all active sources in this group
      audioState.sources.active.forEach((info) => {
        if (info.group === group && info.gainNode) {
          const options = info.options
          const sourceVolume = options.volume !== undefined ? options.volume : 1.0
          info.gainNode.gain.value = sourceVolume * volume * audioState.context.masterVolume
        }
      })
    }
  },
  
  muteGroup: (group, muted = true) => {
    if (audioState.groups[group]) {
      audioState.groups[group].muted = muted
      audioActions.setGroupVolume(group, muted ? 0 : audioState.groups[group].gain)
    }
  },
  
  // 3D Audio listener
  setListenerPosition: (x, y, z) => {
    audioState.spatial.listener.position[0] = x
    audioState.spatial.listener.position[1] = y
    audioState.spatial.listener.position[2] = z
    
    const context = audioRefs.context
    if (context && context.listener) {
      if (context.listener.positionX) {
        // Modern browsers
        context.listener.positionX.value = x
        context.listener.positionY.value = y
        context.listener.positionZ.value = z
      } else {
        // Legacy browsers
        context.listener.setPosition(x, y, z)
      }
    }
  },
  
  setListenerOrientation: (fx, fy, fz, ux, uy, uz) => {
    audioState.spatial.listener.orientation[0] = fx
    audioState.spatial.listener.orientation[1] = fy
    audioState.spatial.listener.orientation[2] = fz
    audioState.spatial.listener.orientation[3] = ux
    audioState.spatial.listener.orientation[4] = uy
    audioState.spatial.listener.orientation[5] = uz
    
    const context = audioRefs.context
    if (context && context.listener) {
      if (context.listener.forwardX) {
        // Modern browsers
        context.listener.forwardX.value = fx
        context.listener.forwardY.value = fy
        context.listener.forwardZ.value = fz
        context.listener.upX.value = ux
        context.listener.upY.value = uy
        context.listener.upZ.value = uz
      } else {
        // Legacy browsers
        context.listener.setOrientation(fx, fy, fz, ux, uy, uz)
      }
    }
  },
  
  // Update 3D source position
  updateSourcePosition: (source, position) => {
    const spatialInfo = audioState.spatial.sources.get(source)
    if (spatialInfo) {
      spatialInfo.position[0] = position[0]
      spatialInfo.position[1] = position[1]
      spatialInfo.position[2] = position[2]
      
      spatialInfo.panner.positionX.value = position[0]
      spatialInfo.panner.positionY.value = position[1]
      spatialInfo.panner.positionZ.value = position[2]
    }
  },
  
  // Audio analysis
  enableAnalysis: () => {
    const context = audioRefs.context
    if (!context) return
    
    if (!context.analyser) {
      context.analyser = context.createAnalyser()
      context.analyser.fftSize = 512
      context.analyser.smoothingTimeConstant = 0.8
      
      // Connect to master gain
      if (context.masterGain) {
        context.masterGain.connect(context.analyser)
      }
    }
    
    audioState.analysis.enabled = true
    audioActions._startAnalysis()
  },
  
  disableAnalysis: () => {
    audioState.analysis.enabled = false
  },
  
  _startAnalysis: () => {
    const context = audioRefs.context
    if (!context || !context.analyser || !audioState.analysis.enabled) return
    
    const analyser = context.analyser
    const updateAnalysis = () => {
      if (!audioState.analysis.enabled) return
      
      // Get frequency data
      analyser.getByteFrequencyData(audioState.analysis.frequency)
      
      // Get waveform data
      analyser.getFloatTimeDomainData(audioState.analysis.waveform)
      
      // Calculate volume and peak
      let sum = 0
      let peak = 0
      for (let i = 0; i < audioState.analysis.waveform.length; i++) {
        const sample = Math.abs(audioState.analysis.waveform[i])
        sum += sample
        peak = Math.max(peak, sample)
      }
      
      audioState.analysis.volume = sum / audioState.analysis.waveform.length
      audioState.analysis.peak = peak
      
      requestAnimationFrame(updateAnalysis)
    }
    
    requestAnimationFrame(updateAnalysis)
  },
  
  // Utility functions
  isPlaying: (id) => {
    for (const [source, info] of audioState.sources.active) {
      if (info.id === id) return true
    }
    return false
  },
  
  getActiveSourceCount: () => audioState.sources.active.size,
  
  preloadSounds: async (soundList) => {
    const promises = soundList.map(({ id, url, group }) => 
      audioActions.loadSound(id, url, group)
    )
    return Promise.allSettled(promises)
  },

  // Getter for non-serializable objects
  getContext: () => audioRefs.context
}

// Set up automatic cleanup of finished sources
if (typeof window !== 'undefined') {
  setInterval(() => {
    const context = audioRefs.context
    if (!context) return
    
    // Clean up finished sources
    audioState.sources.active.forEach((info, source) => {
      // Check if source has finished playing
      if (source.playbackState === source.FINISHED_STATE || 
          (info.startTime + (source.buffer?.duration || 0) < context.currentTime)) {
        audioState.sources.active.delete(source)
        audioState.spatial.sources.delete(source)
        
        // Return to pool if not too many
        if (audioState.sources.pool.length < audioState.sources.maxSources / 2) {
          audioState.sources.pool.push(source)
        }
      }
    })
  }, 1000) // Check every second
}

// Legacy compatibility hook
// audioState and audioActions are already exported above