import { useEffect } from 'react'
import { sceneActions } from '@/store.js'

export default function ScenePlugin() {
  const { createEntity, addComponent, setSceneRoot } = sceneActions

  useEffect(() => {
    // Create a default scene root entity
    const rootId = createEntity('SceneRoot')
    setSceneRoot(rootId)
    
    // Add transform component to root
    addComponent(rootId, 'transform', {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    })
    
    return () => {
      // Cleanup handled by entity destruction
    }
  }, [createEntity, addComponent, setSceneRoot])

  return null // This plugin doesn't render anything
}

// Export the store for other plugins to use
export { sceneState, sceneActions } from '@/store.js'