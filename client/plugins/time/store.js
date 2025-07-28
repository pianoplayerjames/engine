import { proxy, subscribe, useSnapshot } from 'valtio'

// Create the reactive time state
export const timeState = proxy({
  // Core time values
  time: {
    current: 0,
    delta: 0,
    lastFrame: 0,
    scale: 1.0,
    paused: false,
    startTime: 0
  },
  
  // Performance metrics
  performance: {
    frameCount: 0,
    fps: 0,
    avgFrameTime: 0,
    maxFrameTime: 0,
    minFrameTime: Infinity,
    last60Frames: [] // for accurate FPS calculation
  },
  
  // Timer system using Maps for fine-grained reactivity
  timers: {
    oneShot: new Map(), // setTimeout equivalents
    recurring: new Map(), // setInterval equivalents
    frame: new Map() // frame-based timers
  },
  
  // Animation frame management
  loop: {
    animationFrameId: null,
    isRunning: false,
    callbacks: new Map(), // registered update callbacks
    systems: [] // ordered system updates
  },
  
  // Time zones and scheduling
  scheduling: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    realTime: Date.now(),
    gameTime: 0, // separate game time that can be manipulated
    events: new Map() // scheduled events
  }
})

// Actions that mutate the state directly
export const timeActions = {
  // Main loop control
  start: () => {
    if (timeState.loop.isRunning) return
    
    timeState.loop.isRunning = true
    timeState.time.lastFrame = performance.now()
    timeState.time.startTime = timeState.time.lastFrame
    
    const gameLoop = (timestamp) => {
      if (!timeState.loop.isRunning) return
      
      // Calculate delta time
      const rawDelta = timestamp - timeState.time.lastFrame
      const scaledDelta = rawDelta * timeState.time.scale
      const deltaTime = timeState.time.paused ? 0 : scaledDelta
      
      // Update time values
      timeState.time.delta = deltaTime
      timeState.time.current += deltaTime
      timeState.time.lastFrame = timestamp
      
      // Update performance metrics
      timeActions._updatePerformance(rawDelta, timestamp)
      
      // Process timers
      timeActions._updateTimers(deltaTime, timestamp)
      
      // Execute system callbacks in order
      timeState.loop.systems.forEach(callback => {
        try {
          callback(deltaTime, timeState.time.current, timestamp)
        } catch (error) {
          console.error('System update error:', error)
        }
      })
      
      // Execute registered callbacks
      timeState.loop.callbacks.forEach(callback => {
        try {
          callback(deltaTime, timeState.time.current, timestamp)
        } catch (error) {
          console.error('Loop callback error:', error)
        }
      })
      
      // Clear input frame events (if input system exists)
      if (typeof window !== 'undefined' && window.inputActions) {
        window.inputActions.clearFrameEvents()
      }
      
      // Continue loop
      timeState.loop.animationFrameId = requestAnimationFrame(gameLoop)
    }
    
    timeState.loop.animationFrameId = requestAnimationFrame(gameLoop)
  },
  
  stop: () => {
    if (timeState.loop.animationFrameId) {
      cancelAnimationFrame(timeState.loop.animationFrameId)
      timeState.loop.animationFrameId = null
    }
    timeState.loop.isRunning = false
  },
  
  pause: () => {
    timeState.time.paused = true
  },
  
  resume: () => {
    timeState.time.paused = false
    // Reset lastFrame to prevent large delta spike
    timeState.time.lastFrame = performance.now()
  },
  
  togglePause: () => {
    if (timeState.time.paused) {
      timeActions.resume()
    } else {
      timeActions.pause()
    }
  },
  
  setTimeScale: (scale) => {
    timeState.time.scale = Math.max(0, scale)
  },
  
  reset: () => {
    timeState.time.current = 0
    timeState.time.delta = 0
    timeState.performance.frameCount = 0
    timeState.performance.fps = 0
    timeState.performance.avgFrameTime = 0
    timeState.performance.maxFrameTime = 0
    timeState.performance.minFrameTime = Infinity
    timeState.performance.last60Frames.length = 0
    timeState.time.startTime = performance.now()
  },
  
  // Performance tracking
  _updatePerformance: (frameTime, timestamp) => {
    timeState.performance.frameCount++
    
    // Update frame time statistics
    timeState.performance.maxFrameTime = Math.max(timeState.performance.maxFrameTime, frameTime)
    timeState.performance.minFrameTime = Math.min(timeState.performance.minFrameTime, frameTime)
    
    // Calculate average frame time
    const count = timeState.performance.frameCount
    timeState.performance.avgFrameTime = 
      (timeState.performance.avgFrameTime * (count - 1) + frameTime) / count
    
    // Track last 60 frames for accurate FPS
    timeState.performance.last60Frames.push(timestamp)
    if (timeState.performance.last60Frames.length > 60) {
      timeState.performance.last60Frames.shift()
    }
    
    // Calculate FPS based on last 60 frames
    if (timeState.performance.last60Frames.length >= 2) {
      const timeSpan = timestamp - timeState.performance.last60Frames[0]
      timeState.performance.fps = Math.round(
        (timeState.performance.last60Frames.length - 1) * 1000 / timeSpan
      )
    }
  },
  
  // Timer management
  setTimeout: (id, callback, delay) => {
    const timer = {
      callback,
      delay,
      startTime: timeState.time.current,
      triggered: false
    }
    
    timeState.timers.oneShot.set(id, timer)
    return id
  },
  
  setInterval: (id, callback, interval) => {
    const timer = {
      callback,
      interval,
      lastTrigger: timeState.time.current,
      active: true
    }
    
    timeState.timers.recurring.set(id, timer)
    return id
  },
  
  // Frame-based timer (triggers every N frames)
  setFrameTimer: (id, callback, frameInterval) => {
    const timer = {
      callback,
      frameInterval,
      lastFrame: timeState.performance.frameCount,
      active: true
    }
    
    timeState.timers.frame.set(id, timer)
    return id
  },
  
  clearTimer: (id) => {
    timeState.timers.oneShot.delete(id)
    timeState.timers.recurring.delete(id)
    timeState.timers.frame.delete(id)
  },
  
  // Timer processing
  _updateTimers: (deltaTime, timestamp) => {
    const currentTime = timeState.time.current
    const currentFrame = timeState.performance.frameCount
    
    // Process one-shot timers
    const expiredOneShot = []
    timeState.timers.oneShot.forEach((timer, id) => {
      if (!timer.triggered && currentTime - timer.startTime >= timer.delay) {
        timer.triggered = true
        timer.callback(currentTime, deltaTime)
        expiredOneShot.push(id)
      }
    })
    
    // Remove expired one-shot timers
    expiredOneShot.forEach(id => {
      timeState.timers.oneShot.delete(id)
    })
    
    // Process recurring timers
    timeState.timers.recurring.forEach((timer, id) => {
      if (timer.active && currentTime - timer.lastTrigger >= timer.interval) {
        timer.callback(currentTime, deltaTime)
        timer.lastTrigger = currentTime
      }
    })
    
    // Process frame-based timers
    timeState.timers.frame.forEach((timer, id) => {
      if (timer.active && currentFrame - timer.lastFrame >= timer.frameInterval) {
        timer.callback(currentFrame, deltaTime)
        timer.lastFrame = currentFrame
      }
    })
  },
  
  // System registration
  registerSystem: (callback, priority = 0) => {
    // Insert system callback in priority order
    const insertion = { callback, priority }
    const index = timeState.loop.systems.findIndex(sys => sys.priority > priority)
    
    if (index === -1) {
      timeState.loop.systems.push(insertion)
    } else {
      timeState.loop.systems.splice(index, 0, insertion)
    }
    
    return () => {
      const idx = timeState.loop.systems.indexOf(insertion)
      if (idx >= 0) {
        timeState.loop.systems.splice(idx, 1)
      }
    }
  },
  
  // Callback registration for non-system updates
  registerCallback: (id, callback) => {
    timeState.loop.callbacks.set(id, callback)
    
    return () => {
      timeState.loop.callbacks.delete(id)
    }
  },
  
  unregisterCallback: (id) => {
    timeState.loop.callbacks.delete(id)
  },
  
  // Real-time utilities
  updateRealTime: () => {
    timeState.scheduling.realTime = Date.now()
  },
  
  // Game time can be independent of real time
  setGameTime: (gameTime) => {
    timeState.scheduling.gameTime = gameTime
  },
  
  advanceGameTime: (amount) => {
    timeState.scheduling.gameTime += amount
  },
  
  // Event scheduling
  scheduleEvent: (id, callback, triggerTime, useGameTime = false) => {
    const event = {
      callback,
      triggerTime,
      useGameTime,
      triggered: false
    }
    
    timeState.scheduling.events.set(id, event)
  },
  
  cancelEvent: (id) => {
    timeState.scheduling.events.delete(id)
  },
  
  // Process scheduled events
  _processScheduledEvents: () => {
    const expiredEvents = []
    
    timeState.scheduling.events.forEach((event, id) => {
      if (event.triggered) return
      
      const currentTime = event.useGameTime ? 
        timeState.scheduling.gameTime : 
        timeState.scheduling.realTime
      
      if (currentTime >= event.triggerTime) {
        event.triggered = true
        event.callback(currentTime)
        expiredEvents.push(id)
      }
    })
    
    // Remove triggered events
    expiredEvents.forEach(id => {
      timeState.scheduling.events.delete(id)
    })
  },
  
  // Utility functions
  now: () => timeState.time.current,
  dt: () => timeState.time.delta,
  since: (timestamp) => timeState.time.current - timestamp,
  realTime: () => timeState.scheduling.realTime,
  gameTime: () => timeState.scheduling.gameTime,
  
  // Time formatting utilities
  formatTime: (milliseconds, format = 'mm:ss') => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const ms = Math.floor(milliseconds % 1000)
    
    switch (format) {
      case 'mm:ss':
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      case 'mm:ss.ms':
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
      case 'seconds':
        return (milliseconds / 1000).toFixed(2)
      default:
        return milliseconds.toString()
    }
  },
  
  // Interpolation helpers
  lerp: (a, b, t) => a + (b - a) * t,
  
  smoothstep: (edge0, edge1, x) => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
  },
  
  // Easing functions
  easeInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Set up automatic real-time updates and event processing
if (typeof window !== 'undefined') {
  // Update real time every second
  setInterval(() => {
    timeActions.updateRealTime()
    timeActions._processScheduledEvents()
  }, 1000)
  
  // Handle visibility change to pause/resume
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      timeActions.pause()
    } else {
      timeActions.resume()
    }
  })
}

// Legacy compatibility hook
// timeState and timeActions are already exported above