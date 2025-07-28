import { useState, useCallback, useRef } from 'react'

export function useAssetLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentAsset, setCurrentAsset] = useState('')
  const [operation, setOperation] = useState('')
  const [loadedAssets, setLoadedAssets] = useState([])
  const [totalAssets, setTotalAssets] = useState(0)
  const progressRef = useRef(0)

  const startLoading = useCallback((operationType = 'loading', assets = []) => {
    setIsLoading(true)
    setProgress(0)
    setCurrentAsset('')
    setOperation(operationType)
    setLoadedAssets([])
    setTotalAssets(Array.isArray(assets) ? assets.length : 0)
    progressRef.current = 0
  }, [])

  const updateProgress = useCallback((newProgress, asset = '') => {
    progressRef.current = Math.min(100, Math.max(0, newProgress))
    setProgress(progressRef.current)
    if (asset) {
      setCurrentAsset(asset)
    }
  }, [])

  const incrementProgress = useCallback((amount = 1, asset = '') => {
    progressRef.current = Math.min(100, progressRef.current + amount)
    setProgress(progressRef.current)
    if (asset) {
      setCurrentAsset(asset)
      setLoadedAssets(prev => [...prev, asset])
    }
  }, [])

  const finishLoading = useCallback(() => {
    setProgress(100)
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
      setCurrentAsset('')
      setOperation('')
      setLoadedAssets([])
      setTotalAssets(0)
      progressRef.current = 0
    }, 300)
  }, [])

  const setError = useCallback((error) => {
    console.error('Asset loading error:', error)
    setCurrentAsset(`Error: ${error}`)
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
      setCurrentAsset('')
      setOperation('')
    }, 2000)
  }, [])

  // Simulate asset loading with realistic timing
  const simulateAssetLoading = useCallback(async (assets, operationType = 'loading') => {
    if (!Array.isArray(assets) || assets.length === 0) {
      assets = ['Project metadata', 'Scene data', 'Editor settings']
    }

    startLoading(operationType, assets)
    
    const progressStep = 100 / assets.length
    
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i]
      const loadTime = Math.random() * 300 + 100 // 100-400ms per asset
      
      setCurrentAsset(asset)
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, loadTime))
      
      incrementProgress(progressStep, asset)
    }
    
    // Small delay before finishing
    await new Promise(resolve => setTimeout(resolve, 200))
    finishLoading()
  }, [startLoading, incrementProgress, finishLoading])

  return {
    // State
    isLoading,
    progress,
    currentAsset,
    operation,
    loadedAssets,
    totalAssets,
    
    // Actions
    startLoading,
    updateProgress,
    incrementProgress,
    finishLoading,
    setError,
    simulateAssetLoading
  }
}

// Hook for tracking multiple loading operations
export function useMultipleLoaders() {
  const [loaders, setLoaders] = useState(new Map())
  
  const createLoader = useCallback((id) => {
    const loader = {
      isLoading: false,
      progress: 0,
      currentAsset: '',
      operation: ''
    }
    
    setLoaders(prev => new Map(prev).set(id, loader))
    return id
  }, [])
  
  const updateLoader = useCallback((id, updates) => {
    setLoaders(prev => {
      const newMap = new Map(prev)
      const loader = newMap.get(id)
      if (loader) {
        newMap.set(id, { ...loader, ...updates })
      }
      return newMap
    })
  }, [])
  
  const removeLoader = useCallback((id) => {
    setLoaders(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
  }, [])
  
  const getLoader = useCallback((id) => {
    return loaders.get(id)
  }, [loaders])
  
  const hasActiveLoaders = Array.from(loaders.values()).some(loader => loader.isLoading)
  
  return {
    loaders: Array.from(loaders.entries()),
    createLoader,
    updateLoader,
    removeLoader,
    getLoader,
    hasActiveLoaders
  }
}