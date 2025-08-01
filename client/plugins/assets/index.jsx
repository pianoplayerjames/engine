import { useEffect } from 'react'
import { assetsActions } from './store.js'

export default function AssetsPlugin() {
  const { checkCacheSize } = assetsActions

  useEffect(() => {
    // Periodically check cache size and clean up if needed
    const cacheCheckInterval = setInterval(() => {
      checkCacheSize()
    }, 30000) // Check every 30 seconds

    return () => {
      clearInterval(cacheCheckInterval)
    }
  }, [checkCacheSize])

  // Handle page unload to clean up resources
  useEffect(() => {
    const handleUnload = () => {
      const { clearCache } = assetsActions
      clearCache()
    }

    window.addEventListener('beforeunload', handleUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])

  return null // This plugin doesn't render anything
}

// Export the store for other plugins to use
export { assetsState, assetsActions } from './store.js'