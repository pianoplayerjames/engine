import { useEffect } from 'react'
import { useTimeStore } from './store.js'
import { useInputStore } from '../input/store.js'

export default function TimePlugin() {
  const { start, stop } = useTimeStore()

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
    const clearFrameEvents = useInputStore.getState().clearFrameEvents
    
    const unsubscribe = useTimeStore.subscribe((state) => {
      if (state.deltaTime > 0) {
        clearFrameEvents()
      }
    })
    
    return unsubscribe
  }, [])

  // Handle visibility change to pause/resume
  useEffect(() => {
    const handleVisibilityChange = () => {
      const { pause, resume, isPaused, isRunning } = useTimeStore.getState()
      
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
export { useTimeStore } from './store.js'