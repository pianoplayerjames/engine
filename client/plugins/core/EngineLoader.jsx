import React, { useState, useEffect } from 'react'
import { projectManager } from '@/plugins/projects/projectManager.js'
import AssetLoader from '@/plugins/projects/components/AssetLoader.jsx'
import SplashLoader from './SplashLoader.jsx'

// Only include systems that actually need async loading
const ENGINE_SYSTEMS = [
  { name: 'Project System', isAsync: true } // Only this one does real async work
]

export default function EngineLoader({ children, onLoadComplete, showSplash: enableSplash = false }) {
  const [showSplash, setShowSplash] = useState(enableSplash)
  const [isLoading, setIsLoading] = useState(!enableSplash) // Start loading immediately if no splash
  const [progress, setProgress] = useState(0)
  const [currentSystem, setCurrentSystem] = useState('')
  const [engineReady, setEngineReady] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const initializeEngine = async () => {
      try {
        console.log('🚀 Renzora Engine starting...')
        setIsLoading(true)
        setCurrentSystem('Initializing Project System')
        setProgress(10)
        
        // Only do the actual async work - project initialization
        try {
          await projectManager.initializeDefaultProject()
          console.log('✅ Project system initialized with default project')
        } catch (error) {
          console.warn('⚠️ Project system initialization failed:', error)
          // Continue anyway with fallback
        }
        
        if (!isMounted) return
        
        setProgress(95)
        setCurrentSystem('Engine Ready!')
        
        console.log('🎉 Renzora Engine loaded successfully!')
        
        // Minimal delay to show completion, then show UI immediately
        setTimeout(() => {
          if (isMounted) {
            setProgress(100)
            setEngineReady(true)
            onLoadComplete?.()
            
            // Hide loader quickly
            setTimeout(() => {
              if (isMounted) {
                setIsLoading(false)
              }
            }, 200)
          }
        }, 100)
        
      } catch (error) {
        console.error('❌ Engine initialization failed:', error)
        
        if (isMounted) {
          setCurrentSystem(`Error: ${error.message}`)
          
          // Still show the UI after error, but with a delay
          setTimeout(() => {
            if (isMounted) {
              setIsLoading(false)
              onLoadComplete?.()
            }
          }, 2000)
        }
      }
    }

    // Start immediately if no splash, otherwise wait for splash callback
    if (!enableSplash) {
      const timer = setTimeout(initializeEngine, 10) // Almost immediate
      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    } else {
      // Expose initializeEngine for splash screen callback
      window._initializeEngine = initializeEngine
      
      return () => {
        isMounted = false
        delete window._initializeEngine
      }
    }
  }, [onLoadComplete])

  return (
    <div data-engine-loader="true">
      {/* Show splash screen first (if enabled) */}
      {showSplash && enableSplash && (
        <SplashLoader 
          onReady={() => {
            setShowSplash(false)
            setIsLoading(true)
            // Start engine initialization after splash
            if (window._initializeEngine) {
              window._initializeEngine()
            }
          }}
        />
      )}
      
      {/* Show loading screen while engine initializes */}
      <AssetLoader
        isVisible={isLoading && !showSplash}
        progress={progress}
        currentAsset={currentSystem}
        onComplete={() => {
          // AssetLoader handles its own hiding
        }}
      />
      
      {/* Only render children (main UI) after engine is ready */}
      {engineReady && children}
    </div>
  )
}

// Hook to check if engine is ready (useful for other components)
export function useEngineReady() {
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    // Check if engine is already ready (in case component mounts after engine loads)
    const checkEngineStatus = () => {
      // You could add more sophisticated checks here
      setIsReady(projectManager.initialized)
    }
    
    checkEngineStatus()
    
    // Set up a simple polling mechanism or event listener
    const interval = setInterval(checkEngineStatus, 100)
    
    return () => clearInterval(interval)
  }, [])
  
  return isReady
}