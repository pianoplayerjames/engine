import { useEffect } from 'react'
import { useAudioStore } from './store.js'

export default function AudioPlugin() {
  const { initAudio, context } = useAudioStore()

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initOnInteraction = async () => {
      if (!context) {
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
  }, [initAudio, context])

  return null // This plugin doesn't render anything
}

// Export the store for other plugins to use
export { useAudioStore } from './store.js'