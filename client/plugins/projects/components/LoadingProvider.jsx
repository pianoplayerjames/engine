import React, { useState, useEffect, createContext, useContext } from 'react'
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

  useEffect(() => {
    // Subscribe to project manager loading events
    const handleLoadingUpdate = (state) => {
      setLoadingState({
        isLoading: state.isLoading,
        progress: state.progress,
        currentAsset: state.asset,
        operation: state.operation
      })
    }

    projectManager.addLoadingListener(handleLoadingUpdate)

    return () => {
      projectManager.removeLoadingListener(handleLoadingUpdate)
    }
  }, [])

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