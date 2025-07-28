import React, { useEffect } from 'react'
import { projectManager } from './projectManager.js'

export default function ProjectsPlugin() {
  useEffect(() => {
    console.log('Projects plugin initialized')
    
    // Expose project manager globally for debugging
    if (typeof window !== 'undefined') {
      window.projectManager = projectManager
      console.log('Project manager exposed globally: window.projectManager')
      console.log('Debug commands:')
      console.log('- window.projectManager.clearAllStorageData() - Clear localStorage')
      console.log('- window.projectManager.getCurrentProjectFromStorage() - Check stored project')
    }
    
    // Check if EngineLoader is handling initialization
    const isEngineLoaderPresent = document.querySelector('[data-engine-loader]') !== null
    
    // Only auto-initialize if EngineLoader is not present (backwards compatibility)
    let timer = null
    if (!isEngineLoaderPresent) {
      const initializeProject = async () => {
        try {
          await projectManager.initializeDefaultProject()
          console.log('Default project initialized successfully')
        } catch (error) {
          console.error('Failed to initialize default project:', error)
        }
      }
      
      // Initialize after a short delay to let other plugins load
      timer = setTimeout(initializeProject, 500)
    }
    
    // Set up keyboard shortcuts for project management
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 's':
            event.preventDefault()
            handleSaveProject()
            break
          case 'o':
            event.preventDefault()
            // This would trigger the project manager modal
            document.dispatchEvent(new CustomEvent('open-project-manager'))
            break
          case 'n':
            event.preventDefault()
            // This would trigger new project creation
            document.dispatchEvent(new CustomEvent('new-project'))
            break
          case 'e':
            if (event.shiftKey) {
              event.preventDefault()
              handleExportProject()
            }
            break
        }
      }
    }

    const handleSaveProject = async () => {
      const currentProject = projectManager.getCurrentProject()
      if (currentProject.path) {
        try {
          // Auto-save current state to project directory
          console.log('Auto-saving project...')
          // In a real implementation, this would save the current scene/editor state
          // to the project directory without packaging into .ren
        } catch (error) {
          console.error('Failed to save project:', error)
        }
      }
    }

    const handleExportProject = async () => {
      const currentProject = projectManager.getCurrentProject()
      if (currentProject.path) {
        try {
          await projectManager.packageProject(currentProject.path, currentProject.name)
        } catch (error) {
          console.error('Failed to export project:', error)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    // Set up auto-save interval (every 30 seconds)
    const autoSaveInterval = setInterval(() => {
      // Use AutoSaveManager instead of direct ProjectManager call
      // This respects panel resize states and other conditions
      import('@/plugins/core/AutoSaveManager.js').then(({ autoSaveManager }) => {
        autoSaveManager.performAutoSave()
      })
    }, 30000)
    
    return () => {
      if (timer) clearTimeout(timer)
      clearInterval(autoSaveInterval)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // This plugin doesn't render anything, it just provides functionality
  return null
}

// Export the project manager for use by other components
export { projectManager } from './projectManager.js'
export { default as ProjectManager } from './components/ProjectManager.jsx'