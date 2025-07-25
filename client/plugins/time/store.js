import { create } from 'zustand'

export const useTimeStore = create((set, get) => ({
  // Time state
  currentTime: 0,
  deltaTime: 0,
  lastFrameTime: 0,
  timeScale: 1.0,
  isPaused: false,
  
  // Performance tracking
  frameCount: 0,
  fps: 0,
  avgFrameTime: 0,
  maxFrameTime: 0,
  minFrameTime: Infinity,
  
  // Timers
  timers: new Map(),
  intervals: new Map(),
  
  // RAF management
  animationFrameId: null,
  isRunning: false,
  
  // Actions
  start: () => {
    const state = get()
    if (state.isRunning) return
    
    set({ 
      isRunning: true,
      lastFrameTime: performance.now()
    })
    
    const gameLoop = (timestamp) => {
      const state = get()
      if (!state.isRunning) return
      
      const deltaTime = (timestamp - state.lastFrameTime) * state.timeScale
      const currentTime = state.currentTime + deltaTime
      
      // Update performance stats
      const frameTime = deltaTime
      const newFrameCount = state.frameCount + 1
      const fps = newFrameCount > 0 ? 1000 / frameTime : 0
      
      set({
        currentTime: state.isPaused ? state.currentTime : currentTime,
        deltaTime: state.isPaused ? 0 : deltaTime,
        lastFrameTime: timestamp,
        frameCount: newFrameCount,
        fps: fps,
        avgFrameTime: (state.avgFrameTime * (newFrameCount - 1) + frameTime) / newFrameCount,
        maxFrameTime: Math.max(state.maxFrameTime, frameTime),
        minFrameTime: Math.min(state.minFrameTime, frameTime)
      })
      
      // Process timers
      get().updateTimers(deltaTime)
      
      // Clear input frame events at the end of the frame
      if (typeof window !== 'undefined' && window.useInputStore) {
        window.useInputStore.getState().clearFrameEvents()
      }
      
      // Continue loop
      const newAnimationFrameId = requestAnimationFrame(gameLoop)
      set({ animationFrameId: newAnimationFrameId })
    }
    
    const initialId = requestAnimationFrame(gameLoop)
    set({ animationFrameId: initialId })
  },
  
  stop: () => {
    const state = get()
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId)
    }
    set({ 
      isRunning: false,
      animationFrameId: null
    })
  },
  
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  
  setTimeScale: (scale) => set({ timeScale: Math.max(0, scale) }),
  
  reset: () => set({
    currentTime: 0,
    deltaTime: 0,
    frameCount: 0,
    fps: 0,
    avgFrameTime: 0,
    maxFrameTime: 0,
    minFrameTime: Infinity
  }),
  
  // Timer management
  setTimeout: (id, callback, delay) => {
    const timer = {
      callback,
      delay,
      startTime: get().currentTime,
      isInterval: false,
      active: true
    }
    
    set(state => ({
      timers: new Map(state.timers).set(id, timer)
    }))
  },
  
  setInterval: (id, callback, interval) => {
    const timer = {
      callback,
      delay: interval,
      interval,
      startTime: get().currentTime,
      lastTrigger: get().currentTime,
      isInterval: true,
      active: true
    }
    
    set(state => ({
      timers: new Map(state.timers).set(id, timer)
    }))
  },
  
  clearTimer: (id) => {
    set(state => {
      const newTimers = new Map(state.timers)
      newTimers.delete(id)
      return { timers: newTimers }
    })
  },
  
  updateTimers: (deltaTime) => {
    const state = get()
    const currentTime = state.currentTime
    const expiredTimers = []
    
    state.timers.forEach((timer, id) => {
      if (!timer.active) return
      
      if (timer.isInterval) {
        if (currentTime - timer.lastTrigger >= timer.interval) {
          timer.callback(currentTime, deltaTime)
          timer.lastTrigger = currentTime
        }
      } else {
        if (currentTime - timer.startTime >= timer.delay) {
          timer.callback(currentTime, deltaTime)
          expiredTimers.push(id)
        }
      }
    })
    
    // Remove expired one-time timers
    if (expiredTimers.length > 0) {
      set(state => {
        const newTimers = new Map(state.timers)
        expiredTimers.forEach(id => newTimers.delete(id))
        return { timers: newTimers }
      })
    }
  },
  
  // Utility functions
  now: () => get().currentTime,
  dt: () => get().deltaTime,
  since: (timestamp) => get().currentTime - timestamp
}))