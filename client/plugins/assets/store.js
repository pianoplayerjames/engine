import { proxy, subscribe, useSnapshot } from 'valtio'
import { devtools } from 'valtio/utils'

// Create the reactive assets state
export const assetsState = proxy({
  // Asset storage using Maps for fine-grained reactivity
  assets: {
    textures: new Map(),
    models: new Map(),
    sounds: new Map(),
    materials: new Map(),
    animations: new Map(),
    fonts: new Map(),
  },
  
  // Loading state tracking
  loading: {
    active: new Map(), // id -> loading info
    queue: [], // pending loads
    progress: {
      total: 0,
      loaded: 0,
      percentage: 0
    }
  },
  
  // Asset metadata and caching
  metadata: {
    loaded: new Map(), // id -> asset metadata
    errors: new Map(), // id -> error message
    dependencies: new Map(), // id -> [dependent asset ids]
  },
  
  // Cache management
  cache: {
    maxSize: 100 * 1024 * 1024, // 100MB
    currentSize: 0,
    enabled: true,
    strategy: 'lru' // 'lru', 'lfu', 'fifo'
  }
})

// Actions that mutate the state directly
export const assetsActions = {
  // Generic asset loading
  loadAsset: async (id, url, type, options = {}) => {
    if (assetsActions.isLoaded(id)) {
      return assetsActions.getAsset(id, type)
    }
    
    assetsState.loading.active.set(id, { 
      type, 
      url, 
      progress: 0,
      startTime: Date.now()
    })
    
    try {
      let asset
      switch (type) {
        case 'texture':
          asset = await assetsActions._loadTexture(id, url, options)
          break
        case 'model':
          asset = await assetsActions._loadModel(id, url, options)
          break
        case 'sound':
          asset = await assetsActions._loadSound(id, url, options)
          break
        default:
          throw new Error(`Unsupported asset type: ${type}`)
      }
      
      // Store the loaded asset
      assetsState.assets[`${type}s`].set(id, asset)
      assetsState.metadata.loaded.set(id, {
        ...asset,
        loadedAt: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now()
      })
      
      // Update cache size
      if (asset.size) {
        assetsState.cache.currentSize += asset.size
      }
      
      // Clean up loading state
      assetsState.loading.active.delete(id)
      assetsActions.updateProgress()
      
      return asset
      
    } catch (error) {
      assetsState.metadata.errors.set(id, error.message)
      assetsState.loading.active.delete(id)
      assetsActions.updateProgress()
      throw error
    }
  },
  
  // Specific loaders
  _loadTexture: async (id, url, options = {}) => {
    const response = await fetch(url)
    const blob = await response.blob()
    const imageUrl = URL.createObjectURL(blob)
    
    return {
      id,
      url: imageUrl,
      originalUrl: url,
      type: 'texture',
      format: options.format || 'auto',
      flipY: options.flipY !== false,
      wrapS: options.wrapS || 'repeat',
      wrapT: options.wrapT || 'repeat',
      minFilter: options.minFilter || 'linear',
      magFilter: options.magFilter || 'linear',
      size: blob.size
    }
  },
  
  _loadModel: async (id, url, options = {}) => {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    
    return {
      id,
      url,
      type: 'model',
      data: arrayBuffer,
      format: options.format || url.split('.').pop().toLowerCase(),
      size: arrayBuffer.byteLength
    }
  },
  
  _loadSound: async (id, url, options = {}) => {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    
    return {
      id,
      url,
      type: 'sound',
      data: arrayBuffer,
      format: options.format || url.split('.').pop().toLowerCase(),
      volume: options.volume || 1.0,
      loop: options.loop || false,
      size: arrayBuffer.byteLength
    }
  },
  
  // Batch loading with dependency resolution
  loadAssets: async (assetList) => {
    // Build dependency graph
    const dependencies = new Map()
    assetList.forEach(asset => {
      if (asset.dependencies) {
        dependencies.set(asset.id, asset.dependencies)
      }
    })
    
    // Topological sort for loading order
    const sorted = assetsActions._topologicalSort(assetList, dependencies)
    
    // Set total progress
    assetsState.loading.progress.total = sorted.length
    assetsState.loading.progress.loaded = 0
    
    const results = []
    for (const asset of sorted) {
      try {
        const result = await assetsActions.loadAsset(
          asset.id, 
          asset.url, 
          asset.type, 
          asset.options
        )
        results.push({ status: 'fulfilled', value: result })
        assetsState.loading.progress.loaded++
      } catch (error) {
        results.push({ status: 'rejected', reason: error })
      }
    }
    
    return results
  },
  
  // Asset retrieval with access tracking
  getAsset: (id, type) => {
    const asset = assetsState.assets[`${type}s`].get(id)
    if (asset) {
      // Update access metadata for cache management
      const metadata = assetsState.metadata.loaded.get(id)
      if (metadata) {
        metadata.accessCount++
        metadata.lastAccessed = Date.now()
      }
    }
    return asset
  },
  
  // Convenience getters
  getTexture: (id) => assetsActions.getAsset(id, 'texture'),
  getModel: (id) => assetsActions.getAsset(id, 'model'),
  getSound: (id) => assetsActions.getAsset(id, 'sound'),
  getMaterial: (id) => assetsActions.getAsset(id, 'material'),
  
  // Asset management
  unloadAsset: (id) => {
    let removedSize = 0
    
    // Find and remove from all asset types
    Object.entries(assetsState.assets).forEach(([type, assetMap]) => {
      const asset = assetMap.get(id)
      if (asset) {
        if (asset.size) removedSize += asset.size
        
        // Clean up blob URLs for textures
        if (type === 'textures' && asset.url?.startsWith('blob:')) {
          URL.revokeObjectURL(asset.url)
        }
        
        assetMap.delete(id)
      }
    })
    
    // Clean up metadata
    assetsState.metadata.loaded.delete(id)
    assetsState.metadata.errors.delete(id)
    
    // Update cache size
    assetsState.cache.currentSize = Math.max(0, assetsState.cache.currentSize - removedSize)
  },
  
  // Cache management
  clearCache: () => {
    // Revoke all blob URLs
    assetsState.assets.textures.forEach(texture => {
      if (texture.url?.startsWith('blob:')) {
        URL.revokeObjectURL(texture.url)
      }
    })
    
    // Clear all maps
    Object.values(assetsState.assets).forEach(assetMap => {
      assetMap.clear()
    })
    assetsState.metadata.loaded.clear()
    assetsState.metadata.errors.clear()
    assetsState.cache.currentSize = 0
  },
  
  // Intelligent cache eviction
  evictAssets: (targetSize) => {
    const assetsToEvict = []
    
    // Get all loaded assets with metadata
    assetsState.metadata.loaded.forEach((metadata, id) => {
      assetsToEvict.push({ id, ...metadata })
    })
    
    // Sort by cache strategy
    switch (assetsState.cache.strategy) {
      case 'lru':
        assetsToEvict.sort((a, b) => a.lastAccessed - b.lastAccessed)
        break
      case 'lfu':
        assetsToEvict.sort((a, b) => a.accessCount - b.accessCount)
        break
      case 'fifo':
        assetsToEvict.sort((a, b) => a.loadedAt - b.loadedAt)
        break
    }
    
    // Evict until we reach target size
    let freedSize = 0
    for (const asset of assetsToEvict) {
      if (freedSize >= targetSize) break
      
      freedSize += asset.size || 0
      assetsActions.unloadAsset(asset.id)
    }
  },
  
  // Check and maintain cache size
  checkCacheSize: () => {
    if (assetsState.cache.currentSize > assetsState.cache.maxSize) {
      const targetReduction = assetsState.cache.currentSize - assetsState.cache.maxSize
      assetsActions.evictAssets(targetReduction)
    }
  },
  
  // Progress tracking
  updateProgress: () => {
    const loadedCount = assetsState.metadata.loaded.size
    const totalCount = loadedCount + assetsState.loading.active.size
    
    assetsState.loading.progress.loaded = loadedCount
    assetsState.loading.progress.total = Math.max(totalCount, assetsState.loading.progress.total)
    assetsState.loading.progress.percentage = assetsState.loading.progress.total > 0 
      ? (loadedCount / assetsState.loading.progress.total) * 100 
      : 0
  },
  
  // Utility functions
  isLoading: (id) => assetsState.loading.active.has(id),
  hasError: (id) => assetsState.metadata.errors.has(id),
  isLoaded: (id) => assetsState.metadata.loaded.has(id),
  
  // Dependency resolution helper
  _topologicalSort: (assets, dependencies) => {
    const visited = new Set()
    const result = []
    const visiting = new Set()
    
    const visit = (asset) => {
      if (visiting.has(asset.id)) {
        throw new Error(`Circular dependency detected: ${asset.id}`)
      }
      
      if (visited.has(asset.id)) return
      
      visiting.add(asset.id)
      
      const deps = dependencies.get(asset.id) || []
      for (const depId of deps) {
        const depAsset = assets.find(a => a.id === depId)
        if (depAsset) {
          visit(depAsset)
        }
      }
      
      visiting.delete(asset.id)
      visited.add(asset.id)
      result.push(asset)
    }
    
    assets.forEach(visit)
    return result
  }
}

// Setup Redux DevTools for debugging
if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  devtools(assetsState, {
    name: 'Assets Store',
    enabled: process.env.NODE_ENV === 'development'
  })
}

// Set up automatic cache management
if (typeof window !== 'undefined') {
  // Periodic cache size checking
  setInterval(() => {
    if (assetsState.cache.enabled) {
      assetsActions.checkCacheSize()
    }
  }, 30000) // Check every 30 seconds
}

// Legacy compatibility hook
// assetsState and assetsActions are already exported above