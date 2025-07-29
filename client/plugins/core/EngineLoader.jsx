import React, { useState, useEffect } from 'react'
import { projectManager } from '@/plugins/projects/projectManager.js'
import { assetManager, PRIORITY } from '@/plugins/assets/OptimizedAssetManager.js'
import AssetLoader from '@/plugins/projects/components/AssetLoader.jsx'
import SplashLoader from './SplashLoader.jsx'
import ProjectSplash from './ProjectSplash.jsx'

// Only include systems that actually need async loading
const ENGINE_SYSTEMS = [
  { name: 'Project System', isAsync: true } // Only this one does real async work
]

export default function EngineLoader({ children, onLoadComplete, showSplash: enableSplash = false, showProjectSelection = true }) {
  const [showProjectSplash, setShowProjectSplash] = useState(showProjectSelection)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showSplash, setShowSplash] = useState(enableSplash)
  const [isLoading, setIsLoading] = useState(false) 
  const [progress, setProgress] = useState(0)
  const [currentSystem, setCurrentSystem] = useState('')
  const [engineReady, setEngineReady] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const initializeEngine = async (projectName) => {
      try {
        console.log('🚀 Renzora Engine starting...')
        setIsLoading(true)
        setCurrentSystem('Initializing Project System')
        setProgress(10)
        
        // Initialize with selected project or default
        try {
          if (projectName) {
            await projectManager.loadProject(projectName)
            console.log(`✅ Project system initialized with project: ${projectName}`)
          } else {
            await projectManager.initializeDefaultProject()
            console.log('✅ Project system initialized with default project')
          }
        } catch (error) {
          console.warn('⚠️ Project system initialization failed:', error)
          // Continue anyway with fallback
        }
        
        if (!isMounted) return
        
        setProgress(30)
        setCurrentSystem('Loading Asset Metadata')
        
        // Initialize asset manager and load project assets
        try {
          const currentProject = projectManager.getCurrentProject()
          if (currentProject.name) {
            console.log('📦 Starting asset preloading...')
            setCurrentSystem('Scanning Project Assets')
            assetManager.setCurrentProject(currentProject.name)
            
            setProgress(50)
            
            // Get folder tree and asset categories to collect all assets
            const [folderTreeResponse, categoriesResponse] = await Promise.all([
              fetch(`/api/projects/${currentProject.name}/assets/tree`),
              fetch(`/api/projects/${currentProject.name}/assets/categories`)
            ])
            
            if (!isMounted) return
            
            setProgress(60)
            setCurrentSystem('Processing Asset Structure')
            
            if (folderTreeResponse.ok && categoriesResponse.ok) {
              const [folderData, categoryData] = await Promise.all([
                folderTreeResponse.json(),
                categoriesResponse.json()
              ])
              
              if (!isMounted) return
              
              setProgress(70)
              setCurrentSystem('Preloading Critical Assets')
              
              // Collect all assets from categories (which includes all files)
              const allAssets = []
              if (categoryData.categories) {
                Object.values(categoryData.categories).forEach(category => {
                  if (category.files) {
                    allAssets.push(...category.files)
                  }
                })
              }
              
              console.log(`📦 Found ${allAssets.length} assets to preload`)
              
              // Queue high-priority assets (textures, models) for immediate loading
              const highPriorityAssets = allAssets.filter(asset => {
                const ext = asset.extension?.toLowerCase()
                return ['.jpg', '.jpeg', '.png', '.webp', '.glb', '.gltf'].includes(ext)
              })
              
              const batchSize = 5 // Load in small batches to show progress
              let loadedCount = 0
              
              for (let i = 0; i < highPriorityAssets.length; i += batchSize) {
                if (!isMounted) return
                
                const batch = highPriorityAssets.slice(i, i + batchSize)
                const loadPromises = batch.map(asset => {
                  assetManager.queueAsset(asset, PRIORITY.HIGH)
                  return new Promise(resolve => {
                    const checkLoaded = () => {
                      const state = assetManager.getAssetState(asset.id)
                      if (state === 'loaded' || state === 'error') {
                        resolve()
                      } else {
                        setTimeout(checkLoaded, 50)
                      }
                    }
                    checkLoaded()
                  })
                })
                
                await Promise.all(loadPromises)
                loadedCount += batch.length
                
                const progressPercent = 70 + (loadedCount / highPriorityAssets.length) * 20
                setProgress(progressPercent)
                setCurrentSystem(`Loaded ${loadedCount}/${highPriorityAssets.length} critical assets`)
              }
              
              // Queue remaining assets with lower priority (background loading)
              const remainingAssets = allAssets.filter(asset => !highPriorityAssets.includes(asset))
              remainingAssets.forEach(asset => {
                assetManager.queueAsset(asset, PRIORITY.IDLE)
              })
              
              console.log(`📦 Preloaded ${highPriorityAssets.length} critical assets, ${remainingAssets.length} queued for background loading`)
            }
          }
        } catch (error) {
          console.warn('⚠️ Asset preloading failed:', error)
          // Continue with engine initialization even if asset loading fails
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

    // Store initializeEngine for various callbacks
    window._initializeEngine = initializeEngine
    
    // Start immediately if no splash and no project selection
    if (!enableSplash && !showProjectSelection) {
      const timer = setTimeout(() => initializeEngine(), 10)
      return () => {
        isMounted = false
        clearTimeout(timer)
        delete window._initializeEngine
      }
    }
    
    return () => {
      isMounted = false
      delete window._initializeEngine
    }
  }, [onLoadComplete, showProjectSelection])

  const handleProjectSelected = (projectName) => {
    setSelectedProject(projectName)
    setShowProjectSplash(false)
    
    if (enableSplash) {
      setShowSplash(true)
    } else {
      setIsLoading(true)
      if (window._initializeEngine) {
        window._initializeEngine(projectName)
      }
    }
  }

  return (
    <div data-engine-loader="true">
      {/* Show project selection splash first */}
      {showProjectSplash && (
        <ProjectSplash onProjectSelected={handleProjectSelected} />
      )}
      
      {/* Show brand splash screen (if enabled) */}
      {showSplash && enableSplash && !showProjectSplash && (
        <SplashLoader 
          onReady={() => {
            setShowSplash(false)
            setIsLoading(true)
            // Start engine initialization after splash
            if (window._initializeEngine) {
              window._initializeEngine(selectedProject)
            }
          }}
        />
      )}
      
      {/* Show loading screen while engine initializes */}
      <AssetLoader
        isVisible={isLoading && !showSplash && !showProjectSplash}
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