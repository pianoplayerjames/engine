import { useEffect } from 'react'
import { usePhysicsStore } from './store.js'
import { useTimeStore } from '../time/store.js'

export default function PhysicsPlugin() {
  const { initPhysics, step } = usePhysicsStore()
  const deltaTime = useTimeStore(state => state.deltaTime)

  useEffect(() => {
    // Initialize physics world
    initPhysics()
  }, [initPhysics])

  useEffect(() => {
    // Step physics simulation each frame
    if (deltaTime > 0) {
      step(deltaTime / 1000) // Convert to seconds
    }
  }, [deltaTime, step])

  return null // This plugin doesn't render anything
}

// Export the store for other plugins to use
export { usePhysicsStore } from './store.js'