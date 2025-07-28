import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { audioState, audioActions } from './store.js'

export default function AudioPlugin() {
  const { initAudio, getContext } = audioActions

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initOnInteraction = async () => {
      if (!getContext()) {
        await initAudio()
        document.removeEventListener('click', initOnInteraction)
        document.removeEventListener('keydown', initOnInteraction)
      }
    }

    // Modern browsers require user interaction before audio context can start
    document.addEventListener('click', initOnInteraction)
    document.addEventListener('keydown', initOnInteraction)

    return () => {
      document.removeEventListener('click', initOnInteraction)
      document.removeEventListener('keydown', initOnInteraction)
    }
  }, [initAudio, getContext])

  return null // This plugin doesn't render anything
}

// Export the store for other plugins to use
export { audioState, audioActions } from './store.js'