import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { physicsActions } from './store.js'
import { timeState } from '../time/store.js'

export default function PhysicsPlugin() {
  const { initPhysics, step } = physicsActions
  const { deltaTime } = useSnapshot(timeState)

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
export { physicsState, physicsActions } from './store.js'