import React, { useState, useEffect } from 'react'

export default function AssetLoader({ isVisible, progress, currentAsset, onComplete }) {
  const [displayProgress, setDisplayProgress] = useState(0)
  
  // Smooth progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        const diff = progress - prev
        if (Math.abs(diff) < 0.1) {
          return progress
        }
        return prev + diff * 0.3
      })
    }, 16) // 60fps
    
    return () => clearInterval(interval)
  }, [progress])

  // Auto-hide after completion
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [progress, onComplete])

  if (!isVisible && progress === 0) return null

  return (
    <div className={`fixed inset-0 bg-black/15 backdrop-blur-[1px] flex items-center justify-center z-50 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Renzora Logo/Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Renzora Engine</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Loading Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Loading Assets</span>
            <span className="text-sm text-blue-400 font-mono">
              {Math.round(displayProgress)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${displayProgress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Current Asset */}
        {currentAsset && (
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">
              {currentAsset.includes('Engine') || currentAsset.includes('System') ? 'Initializing:' : 'Loading:'}
            </p>
            <p className="text-sm text-gray-200 truncate font-mono bg-gray-800/50 px-3 py-1 rounded">
              {currentAsset}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

// Individual loading states for different operations
export function ProjectLoadingState({ operation, progress }) {
  const getOperationText = (op) => {
    switch (op) {
      case 'creating': return 'Creating Project'
      case 'loading': return 'Loading Project'
      case 'saving': return 'Saving Project'
      case 'exporting': return 'Exporting Project'
      case 'importing': return 'Importing Project'
      default: return 'Processing'
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/90 rounded-lg border border-gray-700">
      {/* Spinner */}
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      
      {/* Text */}
      <span className="text-sm text-gray-200">{getOperationText(operation)}</span>
      
      {/* Progress if available */}
      {progress !== undefined && (
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-16 bg-gray-700 rounded-full h-1">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-blue-400 font-mono min-w-[3ch]">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}