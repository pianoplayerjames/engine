// Valtio-based engine stores
// Central store management with cross-store reactivity

import { useSnapshot } from 'valtio'

// Import all state proxies and actions
import { editorState, editorActions } from '../plugins/editor/store.js'
import { sceneState, sceneActions } from '../plugins/scene/store.js'
import { renderState, renderActions } from '../plugins/render/store.js'
import { inputState, inputActions } from '../plugins/input/store.js'
import { assetsState, assetsActions } from '../plugins/assets/store.js'
import { physicsState, physicsActions } from '../plugins/physics/store.js'
import { audioState, audioActions } from '../plugins/audio/store.js'
import { timeState, timeActions } from '@/plugins/time/store.js'

// Export all states for direct access
export {
  editorState, editorActions,
  sceneState, sceneActions,
  renderState, renderActions,
  inputState, inputActions,
  assetsState, assetsActions,
  physicsState, physicsActions,
  audioState, audioActions,
  timeState, timeActions
}

// Unified engine state object for convenience
export const engineState = {
  editor: editorState,
  scene: sceneState,
  render: renderState,
  input: inputState,
  assets: assetsState,
  physics: physicsState,
  audio: audioState,
  time: timeState
}

// Unified actions object
export const engineActions = {
  editor: editorActions,
  scene: sceneActions,
  render: renderActions,
  input: inputActions,
  assets: assetsActions,
  physics: physicsActions,
  audio: audioActions,
  time: timeActions
}

// Master engine controls
export const engineControls = {
  // Initialize all systems
  init: async () => {
    console.log('🚀 Initializing Engine Systems...')
    
    // Initialize in dependency order
    await timeActions.start()
    await audioActions.initAudio()
    await physicsActions.initPhysics()
    
    // Load editor settings from localStorage
    editorActions.hydrateFromLocalStorage()
    
    console.log('✅ Engine systems initialized')
  },
  
  // Start the main game loop
  start: () => {
    if (!timeState.loop.isRunning) {
      // Register core systems in execution order
      timeActions.registerSystem((deltaTime) => {
        // Update physics
        physicsActions.step(deltaTime)
      }, 100) // High priority
      
      timeActions.registerSystem((deltaTime) => {
        // Update render performance stats
        renderActions.updatePerformance({
          frameTime: deltaTime,
          fps: timeState.performance.fps
        })
      }, 50) // Medium priority
      
      timeActions.start()
      console.log('🎮 Engine started')
    }
  },
  
  // Stop the engine
  stop: () => {
    timeActions.stop()
    audioActions.stopAllSounds()
    console.log('⏹️ Engine stopped')
  },
  
  // Pause/resume
  pause: () => {
    timeActions.pause()
    audioActions.suspendContext()
    physicsActions.setPaused(true)
  },
  
  resume: () => {
    timeActions.resume()
    audioActions.resumeContext()
    physicsActions.setPaused(false)
  },
  
  // Reset everything
  reset: () => {
    timeActions.reset()
    sceneActions.clear()
    assetsActions.clearCache()
    renderActions.updatePerformance({ fps: 0, frameTime: 0 })
    editorActions.clearConsole()
    console.log('🔄 Engine reset')
  }
}

// Hook for accessing any engine state with reactivity
export const useEngineState = (selector) => {
  const editorSnapshot = useSnapshot(editorState)
  const sceneSnapshot = useSnapshot(sceneState)
  const renderSnapshot = useSnapshot(renderState)
  const inputSnapshot = useSnapshot(inputState)
  const assetsSnapshot = useSnapshot(assetsState)
  const physicsSnapshot = useSnapshot(physicsState)
  const audioSnapshot = useSnapshot(audioState)
  const timeSnapshot = useSnapshot(timeState)
  
  const allSnapshots = {
    editor: editorSnapshot,
    scene: sceneSnapshot,
    render: renderSnapshot,
    input: inputSnapshot,
    assets: assetsSnapshot,
    physics: physicsSnapshot,
    audio: audioSnapshot,
    time: timeSnapshot
  }
  
  if (selector) {
    return selector(allSnapshots)
  }
  
  return allSnapshots
}

// Direct Valtio access - no legacy compatibility hooks needed

// Development helpers
if (typeof window !== 'undefined') {
  // Expose engine state to window for debugging
  window.engineState = engineState
  window.engineActions = engineActions
  window.engineControls = engineControls
  
  // Auto-initialize in development
  if (import.meta.hot) {
    engineControls.init()
  }
}