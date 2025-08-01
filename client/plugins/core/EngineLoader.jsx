import { useState, useEffect } from 'react'
import { projectManager } from '@/plugins/projects/projectManager.js'
import { assetManager, PRIORITY } from '@/plugins/assets/OptimizedAssetManager.js'
import AssetLoader from '@/plugins/projects/components/AssetLoader.jsx'

// Only include systems that actually need async loading
const ENGINE_SYSTEMS = [
  { name: 'Project System', isAsync: true } // Only this one does real async work
]

export default function EngineLoader({ children, onLoadComplete }) {
  const [isLoading, setIsLoading] = useState(true) 
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
        
        // Initialize with default project
        try {
          await projectManager.initializeDefaultProject()
          console.log('✅ Project system initialized with default project')
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

    // Start engine initialization immediately
    const timer = setTimeout(() => initializeEngine(), 10)
    
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [onLoadComplete])

  return (
    <div data-engine-loader="true">
      {/* Always render children (main UI) in background */}
      {children}
      
      {/* Show loading screen while engine initializes */}
      <AssetLoader
        isVisible={isLoading}
        progress={progress}
        currentAsset={currentSystem}
        onComplete={() => {
          // AssetLoader handles its own hiding
        }}
      />
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