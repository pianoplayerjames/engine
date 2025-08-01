import { useState, useEffect } from 'react'
import { projectManager } from '@/plugins/projects/projectManager.js'
import AssetLoader from '@/plugins/projects/components/AssetLoader.jsx'

export default function EngineLoader({ children, onLoadComplete }) {
  const [isLoading, setIsLoading] = useState(true) 
  const [progress, setProgress] = useState(0)
  const [currentSystem, setCurrentSystem] = useState('')

  useEffect(() => {
    let isMounted = true
    
    const initializeEngine = async () => {
      try {
        console.log('🚀 Renzora Engine starting...')
        setIsLoading(true)
        setCurrentSystem('Initializing Project System')
        setProgress(20)
        
        // Initialize with default project
        try {
          await projectManager.initializeDefaultProject()
          console.log('✅ Project system initialized')
        } catch (error) {
          console.warn('⚠️ Project system initialization failed:', error)
        }
        
        if (!isMounted) return
        
        setProgress(60)
        setCurrentSystem('Loading Asset Registry')
        
        // Simple asset registry - just get the list, don't preload
        try {
          const currentProject = projectManager.getCurrentProject()
          if (currentProject.name) {
            // Get simple asset list for the registry (fast)
            const response = await fetch(`/api/projects/${currentProject.name}/assets/categories`)
            if (response.ok) {
              const categoryData = await response.json()
              // Store in global registry for on-demand loading
              window.assetRegistry = categoryData
              console.log('📦 Asset registry loaded')
            }
          }
        } catch (error) {
          console.warn('⚠️ Asset registry loading failed:', error)
        }
        
        if (!isMounted) return
        
        setProgress(90)
        setCurrentSystem('Engine Ready!')
        
        console.log('🎉 Renzora Engine loaded successfully!')
        
        // Quick completion
        setTimeout(() => {
          if (isMounted) {
            setProgress(100)
            onLoadComplete?.()
            
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
          setTimeout(() => {
            if (isMounted) {
              setIsLoading(false)
              onLoadComplete?.()
            }
          }, 2000)
        }
      }
    }

    const timer = setTimeout(() => initializeEngine(), 10)
    
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [onLoadComplete])

  return (
    <div data-engine-loader="true">
      {children}
      
      <AssetLoader
        isVisible={isLoading}
        progress={progress}
        currentAsset={currentSystem}
        onComplete={() => {}}
      />
    </div>
  )
}

// Simple asset loading utility using Babylon.js native loading
export const loadAsset = async (assetPath) => {
  // Use Babylon.js ImportMesh or AssetContainer for on-demand loading
  // This is much simpler and faster than the complex OptimizedAssetManager
  console.log('📦 Loading asset on-demand:', assetPath)
  
  // TODO: Implement actual Babylon.js asset loading here
  // Example: 
  // const result = await BABYLON.SceneLoader.ImportMeshAsync("", assetPath, "")
  // return result
}