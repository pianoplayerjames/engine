// Central auto-save coordinator that works with the project system
import { subscribe } from 'valtio'

class AutoSaveManager {
  constructor() {
    this.pluginStores = new Map()
    this.saveTimeout = null
    this.isEnabled = true
    this.debounceTime = 1000 // 1 second debounce
    this.projectManager = null
  }

  // Set the project manager instance for saving
  setProjectManager(projectManager) {
    this.projectManager = projectManager
    console.log('🔗 AutoSaveManager connected to ProjectManager')
  }

  // Register a plugin store for auto-saving
  registerStore(pluginName, store, options = {}) {
    const config = {
      store,
      // Function to extract data that should be saved
      extractSaveData: options.extractSaveData || (() => ({ ...store })),
      // Function to restore data from project
      restoreData: options.restoreData || ((data) => Object.assign(store, data)),
      ...options
    }

    this.pluginStores.set(pluginName, config)

    // Subscribe to store changes for auto-save
    subscribe(store, () => {
      if (!this.isEnabled) return
      this.scheduleAutoSave()
    })

    console.log(`🔌 Registered ${pluginName} store for auto-save`)
    return config
  }

  // Remove a plugin store
  unregisterStore(pluginName) {
    this.pluginStores.delete(pluginName)
    console.log(`🔌 Unregistered ${pluginName} store`)
  }

  // Schedule an auto-save (debounced)
  scheduleAutoSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    this.saveTimeout = setTimeout(() => {
      this.performAutoSave()
    }, this.debounceTime)
  }

  // Perform auto-save using project system
  async performAutoSave() {
    if (!this.isEnabled || !this.projectManager) return

    try {
      // Use the project manager's existing auto-save functionality
      await this.projectManager.autoSaveCurrentProject()
      console.log('💾 Auto-save completed via project system')
    } catch (error) {
      console.warn('Auto-save failed:', error)
    }
  }

  // Load data from project into all registered stores
  loadFromProject(projectData) {
    console.log('🔄 AutoSaveManager loadFromProject called with:', projectData)
    console.log('🔌 Registered stores:', Array.from(this.pluginStores.keys()))
    
    if (!projectData) {
      console.warn('❌ No project data provided to loadFromProject')
      return
    }

    for (const [pluginName, config] of this.pluginStores) {
      try {
        // Look for plugin data in the project
        let pluginData = null
        
        // Check different possible locations for plugin data
        if (projectData[pluginName]) {
          pluginData = projectData[pluginName]
          console.log(`📂 Found ${pluginName} data directly:`, pluginData)
        } else if (pluginName === 'scene' && projectData.scene) {
          pluginData = projectData.scene
          console.log(`📂 Found scene data:`, pluginData)
        } else if (pluginName === 'editor' && projectData.editor) {
          pluginData = projectData.editor
          console.log(`📂 Found editor data:`, pluginData)
        } else if (pluginName === 'render' && projectData.render) {
          pluginData = projectData.render
          console.log(`📂 Found render data:`, pluginData)
        } else {
          console.log(`❌ No data found for ${pluginName} plugin`)
        }

        if (pluginData) {
          console.log(`🔄 Restoring ${pluginName} state with:`, pluginData)
          config.restoreData(pluginData)
          console.log(`✅ ${pluginName} state loaded from project`)
        }
      } catch (error) {
        console.warn(`❌ Failed to load ${pluginName} state from project:`, error)
      }
    }
  }

  // Get current state from all stores (used by project manager)
  getAllStoreData() {
    const storeData = {}
    
    for (const [pluginName, config] of this.pluginStores) {
      try {
        storeData[pluginName] = config.extractSaveData()
      } catch (error) {
        console.warn(`Failed to extract ${pluginName} data:`, error)
      }
    }
    
    return storeData
  }

  // Manual save trigger
  async saveNow() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
    await this.performAutoSave()
  }

  // Enable/disable auto-save
  enable() {
    this.isEnabled = true
    console.log('✅ Auto-save enabled')
  }

  disable() {
    this.isEnabled = false
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
    console.log('❌ Auto-save disabled')
  }

  // Get save status
  getSaveStatus() {
    return {
      isEnabled: this.isEnabled,
      hasProjectManager: !!this.projectManager,
      registeredStores: Array.from(this.pluginStores.keys()),
      pendingSave: !!this.saveTimeout
    }
  }
}

// Create global auto-save manager instance
export const autoSaveManager = new AutoSaveManager()

// Expose globally for debugging
if (typeof window !== 'undefined') {
  window.autoSaveManager = autoSaveManager
  console.log('AutoSaveManager exposed globally: window.autoSaveManager')
}