import { useEffect } from 'react'
import { subscribe } from 'valtio'
import { timeState, timeActions } from './store.js'
import { inputActions } from '../input/store.js'

export default function TimePlugin() {
  const { start, stop } = timeActions

  useEffect(() => {
    // Auto-start the game loop when component mounts
    start()

    // Cleanup on unmount
    return () => {
      stop()
    }
  }, []) // Remove dependencies to prevent re-running
  
  // Clear input events each frame using the time store
  useEffect(() => {
    const clearFrameEvents = inputActions.clearFrameEvents
    
    const unsubscribe = subscribe(timeState, () => {
      if (timeState.deltaTime > 0) {
        clearFrameEvents()
      }
    })
    
    return unsubscribe
  }, [])

  // Handle visibility change to pause/resume
  useEffect(() => {
    const handleVisibilityChange = () => {
      const { pause, resume } = timeActions
      const { isPaused, isRunning } = timeState.loop
      
      if (document.hidden && isRunning && !isPaused) {
        pause()
      } else if (!document.hidden && isRunning && isPaused) {
        resume()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return null // This plugin doesn't render anything
}

// Export the store for other plugins to use
export { timeState, timeActions } from '@/plugins/time/store.js'