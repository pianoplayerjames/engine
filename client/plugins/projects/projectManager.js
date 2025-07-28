// Renzora Engine Project Manager
// Handles .ren file extraction and packaging

import { editorState } from '@/plugins/editor/store.js'
import { sceneState, sceneActions } from '@/plugins/scene/store.js'
import { autoSaveManager } from '@/plugins/core/AutoSaveManager.js'

const PROJECT_VERSION = '1.0.0'
const ENGINE_VERSION = '0.1.0'
const CURRENT_PROJECT_KEY = 'renzora-current-project'
const DEFAULT_PROJECT_NAME = 'UntitledProject'

class ProjectManager {
  constructor() {
    this.currentProjectPath = null
    this.currentProjectName = null
    this.initialized = false
    this.loadingCallbacks = []
    this.isCurrentlyLoading = false
    
    // Connect AutoSaveManager
    autoSaveManager.setProjectManager(this)
  }

  // Add loading progress callbacks
  addLoadingListener(callback) {
    this.loadingCallbacks.push(callback)
  }

  removeLoadingListener(callback) {
    this.loadingCallbacks = this.loadingCallbacks.filter(cb => cb !== callback)
  }

  // Emit loading progress to all listeners
  emitLoadingProgress(progress, asset = '', operation = 'loading') {
    this.loadingCallbacks.forEach(callback => {
      try {
        callback({ progress, asset, operation, isLoading: this.isCurrentlyLoading })
      } catch (error) {
        console.warn('Loading callback error:', error)
      }
    })
  }

  // Start loading state
  startLoading(operation = 'loading') {
    console.log('🚨 startLoading called with operation:', operation)
    console.trace('Loading triggered from:')
    this.isCurrentlyLoading = true
    this.emitLoadingProgress(0, '', operation)
  }

  // Update loading progress
  updateLoadingProgress(progress, asset = '') {
    this.emitLoadingProgress(progress, asset)
  }

  // Finish loading state
  finishLoading() {
    this.emitLoadingProgress(100)
    setTimeout(() => {
      this.isCurrentlyLoading = false
      this.emitLoadingProgress(0, '', '')
    }, 300)
  }

  // Extract .ren file to working directory
  async extractProject(renFile, projectName) {
    this.startLoading('importing')
    
    try {
      // Read the .ren file content
      this.updateLoadingProgress(10, 'Reading .ren file')
      const fileContent = await this.readFile(renFile)
      
      this.updateLoadingProgress(20, 'Parsing project data')
      const projectData = JSON.parse(fileContent)
      
      // Validate project data
      this.updateLoadingProgress(30, 'Validating project')
      if (!this.validateProjectData(projectData)) {
        throw new Error('Invalid .ren project file')
      }

      // Import project via server API
      this.updateLoadingProgress(40, 'Creating project structure')
      const response = await fetch('/api/projects/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: projectName,
          renData: projectData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to import project')
      }

      this.updateLoadingProgress(60, 'Extracting assets')
      const result = await response.json()
      
      // Simulate asset extraction time
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Load scene data into engine state
      this.updateLoadingProgress(80, 'Loading scene data')
      this.loadSceneData(projectData.scene)
      
      // Load editor settings
      this.updateLoadingProgress(90, 'Loading editor settings')
      if (projectData.editor) {
        this.loadEditorSettings(projectData.editor)
      }
      
      this.currentProjectPath = result.projectPath
      this.currentProjectName = projectName
      this.saveCurrentProjectToStorage()
      
      this.updateLoadingProgress(100, 'Project imported successfully')
      console.log(`Project "${projectName}" extracted successfully`)
      
      this.finishLoading()
      return result.projectPath
      
    } catch (error) {
      console.error('Failed to extract project:', error)
      this.finishLoading()
      throw error
    }
  }

  // Package working directory into .ren file
  async packageProject(projectPath, outputName) {
    this.startLoading('exporting')
    
    try {
      if (!projectPath || !outputName) {
        throw new Error('Project path and output name are required')
      }

      // Export project via server API
      this.updateLoadingProgress(20, 'Collecting project data')
      const response = await fetch(`/api/projects/${projectPath}/export`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to export project')
      }

      // Get the exported .ren content
      this.updateLoadingProgress(60, 'Packaging assets')
      const renContent = await response.text()
      
      // Simulate packaging time based on content size
      const packagingTime = Math.min(1000, renContent.length / 1000)
      await new Promise(resolve => setTimeout(resolve, packagingTime))
      
      // Download the file
      this.updateLoadingProgress(90, 'Preparing download')
      await this.downloadFile(`${outputName}.ren`, renContent)
      
      this.updateLoadingProgress(100, 'Export complete')
      console.log(`Project packaged as "${outputName}.ren"`)
      
      this.finishLoading()
      return JSON.parse(renContent)
      
    } catch (error) {
      console.error('Failed to package project:', error)
      this.finishLoading()
      throw error
    }
  }

  // Create new empty project (only if it doesn't exist)
  async createNewProject(projectName, forceNew = false) {
    this.startLoading('creating')
    
    try {
      // Check if project already exists (unless forcing new)
      if (!forceNew) {
        try {
          console.log(`Checking if project "${projectName}" already exists`)
          const checkResponse = await fetch(`/api/projects/${projectName}`)
          if (checkResponse.ok) {
            console.log(`Project "${projectName}" already exists, loading instead of creating`)
            const projectPath = await this.loadProject(projectName)
            this.finishLoading()
            return projectPath
          }
        } catch (checkError) {
          console.log(`Project doesn't exist or check failed, proceeding with creation:`, checkError.message)
        }
      }

      // Create project via server API
      this.updateLoadingProgress(20, 'Creating project structure')
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }

      this.updateLoadingProgress(50, 'Setting up directories')
      const result = await response.json()
      
      // Simulate setup time
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Only initialize with default scene if forcing new or no existing scene data
      this.updateLoadingProgress(80, 'Setting up project')  
      if (forceNew || sceneState.entities.size === 0) {
        console.log('Initializing with default scene')
        sceneActions.clear()
        const rootEntity = sceneActions.createEntity('Scene')
        sceneActions.setSceneRoot(rootEntity)
      } else {
        console.log('Preserving existing scene data')
      }
      
      this.updateLoadingProgress(90, 'Finalizing project')
      this.currentProjectPath = result.projectPath
      this.currentProjectName = projectName
      this.saveCurrentProjectToStorage()
      
      this.updateLoadingProgress(100, 'Project created successfully')
      console.log(`New project "${projectName}" created`)
      
      this.finishLoading()
      return result.projectPath
      
    } catch (error) {
      console.error('Failed to create new project:', error)
      this.finishLoading()
      throw error
    }
  }

  // Helper methods
  async createProjectStructure(projectPath) {
    // In a real implementation, you'd use Node.js fs or browser File System Access API
    // For now, we'll simulate the structure
    const directories = [
      `${projectPath}`,
      `${projectPath}/assets`,
      `${projectPath}/assets/textures`,
      `${projectPath}/assets/models`,
      `${projectPath}/assets/audio`,
      `${projectPath}/assets/scripts`,
      `${projectPath}/scenes`
    ]
    
    // Simulate directory creation
    console.log('Creating directories:', directories)
  }

  async extractAssets(assets, assetPath) {
    for (const [relativePath, content] of Object.entries(assets)) {
      const fullPath = `${assetPath}/${relativePath}`
      
      if (content.startsWith('data:')) {
        // Handle base64 encoded binary assets
        const base64Data = content.split(',')[1]
        const binaryData = atob(base64Data)
        await this.saveBinaryFile(fullPath, binaryData)
      } else {
        // Handle text assets
        await this.saveFile(fullPath, content)
      }
    }
  }

  async collectAssets() {
    // In real implementation, recursively read all files in assets directory
    // For now, return empty object
    const assets = {}
    
    // Example of how assets would be collected:
    // const files = await this.readDirectory(assetPath, { recursive: true })
    // for (const file of files) {
    //   const relativePath = file.path.replace(`${assetPath}/`, '')
    //   if (file.type === 'binary') {
    //     const base64 = btoa(file.content)
    //     assets[relativePath] = `data:${file.mimeType};base64,${base64}`
    //   } else {
    //     assets[relativePath] = file.content
    //   }
    // }
    
    return assets
  }

  loadSceneData(sceneData) {
    if (!sceneData) return
    
    // Clear current scene
    sceneActions.clear()
    
    // Load entities
    if (sceneData.entities) {
      sceneState.entityCounter = sceneData.entityCounter || 0
      
      for (const [entityId, entityData] of Object.entries(sceneData.entities)) {
        sceneState.entities.set(parseInt(entityId), entityData)
      }
    }
    
    // Load components
    if (sceneData.components) {
      for (const [componentType, componentData] of Object.entries(sceneData.components)) {
        if (sceneState.components[componentType]) {
          for (const [entityId, data] of Object.entries(componentData)) {
            sceneState.components[componentType].set(parseInt(entityId), data)
          }
        }
      }
    }
    
    // Load scene objects (legacy format)
    if (sceneData.sceneObjects) {
      editorState.sceneObjects = sceneData.sceneObjects
    }
    
    // Set scene root
    if (sceneData.sceneRoot) {
      sceneActions.setSceneRoot(sceneData.sceneRoot)
    }
  }

  collectSceneData() {
    const entities = {}
    sceneState.entities.forEach((entity, id) => {
      entities[id] = { ...entity, components: Array.from(entity.components) }
    })
    
    const components = {}
    for (const [componentType, componentMap] of Object.entries(sceneState.components)) {
      components[componentType] = {}
      componentMap.forEach((data, entityId) => {
        components[componentType][entityId] = data
      })
    }
    
    return {
      entities,
      components,
      sceneObjects: editorState.sceneObjects, // Legacy format
      entityCounter: sceneState.entityCounter,
      sceneRoot: sceneState.sceneRoot
    }
  }

  loadEditorSettings(editorData) {
    // Only load project-specific settings, not UI preferences
    // UI preferences (panel sizes, positions, etc.) should stay in localStorage
    if (editorData.settings) {
      // Only load scene-specific settings like grid configuration for this project
      if (editorData.settings.editor) {
        Object.assign(editorState.settings.editor, editorData.settings.editor)
      }
    }
    
    console.log('📋 Project settings loaded, UI preferences preserved in localStorage')
  }

  collectEditorSettings() {
    // Only save project-specific settings, not UI layout preferences
    return {
      settings: {
        editor: { ...editorState.settings.editor }
        // Don't save UI layout settings - those stay in localStorage
        // Don't save grid/viewport settings - those are user preferences
      }
    }
  }

  validateProjectData(data) {
    return data && 
           typeof data === 'object' &&
           (data.project || data.scene || data.editor)
  }

  async readProjectInfo(path) {
    try {
      const content = await this.readFile(path)
      return JSON.parse(content)
    } catch (error) {
      return {
        name: 'Untitled Project',
        version: PROJECT_VERSION,
        engineVersion: ENGINE_VERSION,
        created: new Date().toISOString()
      }
    }
  }

  // File I/O helpers (to be implemented with File System Access API or Node.js)
  async readFile(file) {
    if (file instanceof File) {
      return await file.text()
    }
    // Handle file path string - would use fs.readFile in Node.js
    throw new Error('File reading not implemented for paths')
  }

  async saveFile(path, content) {
    console.log(`Saving file: ${path}`)
    console.log(`Content length: ${content.length}`)
    // In browser: use File System Access API
    // In Node.js: use fs.writeFile
  }

  async saveBinaryFile(path, binaryData) {
    console.log(`Saving binary file: ${path}`)
    console.log(`Data length: ${binaryData.length}`)
    // Handle binary file saving
  }

  async downloadFile(filename, content) {
    // Create download in browser
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }

  // Load existing project from server
  async loadProject(projectName) {
    this.startLoading('loading')
    
    try {
      console.log(`Loading project from server: ${projectName}`)
      this.updateLoadingProgress(10, 'Connecting to server')
      const response = await fetch(`/api/projects/${projectName}`)
      
      if (!response.ok) {
        const error = await response.json()
        console.error(`Server error loading project:`, error)
        throw new Error(error.error || 'Failed to load project')
      }

      this.updateLoadingProgress(40, 'Loading project data')
      const projectData = await response.json()
      console.log(`Project data loaded:`, projectData)
      
      // Simulate loading time for larger projects
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Load all store data using AutoSaveManager
      this.updateLoadingProgress(70, 'Loading project state')
      console.log('🔄 Loading project data into stores:', projectData)
      autoSaveManager.loadFromProject(projectData)
      console.log('✅ Project data loaded into stores')
      
      this.updateLoadingProgress(95, 'Finalizing')
      this.currentProjectPath = projectData.projectPath
      this.currentProjectName = projectData.project.name
      this.saveCurrentProjectToStorage()
      
      this.updateLoadingProgress(100, 'Project loaded successfully')
      console.log(`Project "${projectName}" loaded successfully`)
      
      this.finishLoading()
      return projectData.projectPath
      
    } catch (error) {
      console.error('Failed to load project:', error)
      this.finishLoading()
      throw error
    }
  }

  // Initialize default project on first load
  async initializeDefaultProject() {
    if (this.initialized) return
    
    try {
      // Check if there's a stored current project
      const storedProject = this.getCurrentProjectFromStorage()
      
      if (storedProject && storedProject.name && storedProject.path) {
        // Try to reload the stored project
        console.log(`Reloading project: ${storedProject.name} from path: ${storedProject.path}`)
        try {
          // Extract project name from path (in case it's stored as "projects/ProjectName")
          const projectName = storedProject.path.includes('/') 
            ? storedProject.path.split('/').pop() 
            : storedProject.path
          
          await this.loadProject(projectName)
        } catch (loadError) {
          console.warn('Failed to reload stored project:', loadError)
          console.warn('Stored project data:', storedProject)
          
          // Don't create new project immediately - try to recover by loading default project
          // This prevents overwriting existing project data
          try {
            console.log('Attempting to load existing default project instead of creating new')
            await this.loadProject(DEFAULT_PROJECT_NAME)
          } catch (defaultLoadError) {
            console.warn('Default project also failed to load, creating new:', defaultLoadError)
            // Clear invalid project from storage only after all recovery attempts fail
            this.clearCurrentProjectFromStorage()
            await this.createNewProject(DEFAULT_PROJECT_NAME)
          }
        }
      } else {
        // Try to load default project first, only create if it doesn't exist
        console.log('No stored project found, attempting to load default project')
        console.log('Stored project data:', storedProject)
        try {
          await this.loadProject(DEFAULT_PROJECT_NAME)
          console.log('Default project loaded successfully')
        } catch (loadError) {
          console.log('Default project does not exist, creating new:', loadError.message)
          await this.createNewProject(DEFAULT_PROJECT_NAME)
        }
      }
      
      // UI settings are now managed through the project system via AutoSaveManager
      
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize default project:', error)
      // Fallback: create a basic in-memory project (preserve existing scene if any)
      this.currentProjectName = DEFAULT_PROJECT_NAME
      this.currentProjectPath = DEFAULT_PROJECT_NAME
      
      // Only setup default scene if no scene data exists
      if (sceneState.entities.size === 0) {
        console.log('No scene data found, setting up default scene')
        this.setupDefaultScene()
      } else {
        console.log('Preserving existing scene data in fallback')
      }
      
      this.saveCurrentProjectToStorage()
      this.initialized = true
    }
  }

  // Set up a basic default scene
  setupDefaultScene() {
    sceneActions.clear()
    const rootEntity = sceneActions.createEntity('Scene')
    sceneActions.setSceneRoot(rootEntity)
    
    // Add some default objects if sceneObjects exist (legacy format)
    if (editorState.sceneObjects && editorState.sceneObjects.length === 0) {
      editorState.sceneObjects = [
        {
          id: 'cube-1',
          name: 'Cube',
          type: 'mesh',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          geometry: 'box',
          material: { color: 'orange' },
          visible: true
        }
      ]
    }
  }

  // Save current project info to localStorage
  saveCurrentProjectToStorage() {
    try {
      const projectInfo = {
        name: this.currentProjectName,
        path: this.currentProjectPath,
        lastAccessed: new Date().toISOString()
      }
      localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(projectInfo))
    } catch (error) {
      console.warn('Failed to save current project to localStorage:', error)
    }
  }

  // Load current project info from localStorage
  getCurrentProjectFromStorage() {
    try {
      const stored = localStorage.getItem(CURRENT_PROJECT_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to load current project from localStorage:', error)
      return null
    }
  }

  // Clear current project from localStorage
  clearCurrentProjectFromStorage() {
    try {
      localStorage.removeItem(CURRENT_PROJECT_KEY)
    } catch (error) {
      console.warn('Failed to clear current project from localStorage:', error)
    }
  }

  // Auto-save current project state (completely silent, no loading indicators)
  async autoSaveCurrentProject() {
    if (!this.currentProjectName || !this.currentProjectPath) return
    
    try {
      console.log(`Auto-saving project: ${this.currentProjectName}`)
      
      // Get all current store data from AutoSaveManager
      const allStoreData = autoSaveManager.getAllStoreData()
      
      // Save to server (completely silent - no loading progress events)
      const response = await fetch(`/api/projects/${this.currentProjectPath}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allStoreData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to auto-save project')
      }
      
      // Update last accessed time (silent)
      this.saveCurrentProjectToStorage()
      console.log(`✅ Auto-saved project: ${this.currentProjectName}`)
      
    } catch (error) {
      console.warn('⚠️ Auto-save failed:', error)
      // Don't throw error for auto-save failures
    }
    // No loading progress events emitted - completely silent
  }

  // Getters
  getCurrentProject() {
    return {
      path: this.currentProjectPath,
      name: this.currentProjectName
    }
  }

  // Check if a project is currently loaded
  hasCurrentProject() {
    return !!(this.currentProjectName && this.currentProjectPath)
  }

  // Debug helper - clear all localStorage data
  clearAllStorageData() {
    console.log('Clearing all project localStorage data...')
    this.clearCurrentProjectFromStorage()
    // Also clear UI settings if needed
    localStorage.removeItem('engine-ui-settings')
    console.log('All storage data cleared')
  }
}

// Export singleton instance
export const projectManager = new ProjectManager()