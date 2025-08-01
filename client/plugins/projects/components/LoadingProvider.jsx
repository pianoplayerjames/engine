import { useState, useEffect, createContext, useContext } from 'react'
import { useSnapshot } from 'valtio'
import { editorState } from '@/plugins/editor/store.js'
import { projectManager } from '../projectManager.js'
import AssetLoader from './AssetLoader.jsx'

// Create loading context
const LoadingContext = createContext()

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

export default function LoadingProvider({ children }) {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    progress: 0,
    currentAsset: '',
    operation: ''
  })
  
  // Get editor state to check for panel resizing
  const { panels } = useSnapshot(editorState)

  useEffect(() => {
    // Subscribe to project manager loading events
    const handleLoadingUpdate = (state) => {
      // Debug logging for all loading events
      console.log('🔄 LoadingProvider received event:', {
        isLoading: state.isLoading,
        operation: state.operation,
        progress: state.progress,
        asset: state.asset,
        panelsResizing: panels.isResizingPanels
      })
      
      // Auto-save operations should never emit loading events, but if they do, ignore them
      const shouldShowLoading = state.isLoading && state.operation !== 'auto-saving'
      
      if (state.isLoading && !shouldShowLoading) {
        console.log('🚫 Suppressing loading screen for operation:', state.operation)
      }
      
      if (shouldShowLoading) {
        console.log('✅ Showing loading screen for operation:', state.operation)
      }
      
      setLoadingState({
        isLoading: shouldShowLoading,
        progress: state.progress,
        currentAsset: state.asset,
        operation: state.operation
      })
    }

    projectManager.addLoadingListener(handleLoadingUpdate)

    return () => {
      projectManager.removeLoadingListener(handleLoadingUpdate)
    }
  }, [panels.isResizingPanels])

  const contextValue = {
    ...loadingState,
    startLoading: (operation) => projectManager.startLoading(operation),
    updateProgress: (progress, asset) => projectManager.updateLoadingProgress(progress, asset),
    finishLoading: () => projectManager.finishLoading()
  }

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      
      {/* Global Asset Loader */}
      <AssetLoader
        isVisible={loadingState.isLoading}
        progress={loadingState.progress}
        currentAsset={loadingState.currentAsset}
        operation={loadingState.operation}
        onComplete={() => {
          // Loading completed, could add additional cleanup here
        }}
      />
    </LoadingContext.Provider>
  )
}