import { create } from 'zustand'

export const useAssetsStore = create((set, get) => ({
  // Asset storage
  textures: new Map(),
  models: new Map(),
  sounds: new Map(),
  materials: new Map(),
  animations: new Map(),
  fonts: new Map(),
  
  // Loading state
  loading: new Map(),
  loaded: new Map(),
  errors: new Map(),
  
  // Cache settings
  cache: {
    maxSize: 100 * 1024 * 1024, // 100MB
    currentSize: 0,
    enabled: true
  },
  
  // Progress tracking
  loadingProgress: {
    total: 0,
    loaded: 0,
    percentage: 0
  },
  
  // Actions
  loadTexture: async (id, url, options = {}) => {
    if (get().textures.has(id)) {
      return get().textures.get(id)
    }
    
    set(state => ({
      loading: new Map(state.loading).set(id, { type: 'texture', url, progress: 0 })
    }))
    
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      
      const texture = {
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
        size: blob.size,
        loadedAt: Date.now()
      }
      
      set(state => {
        const newLoading = new Map(state.loading)
        newLoading.delete(id)
        
        return {
          textures: new Map(state.textures).set(id, texture),
          loaded: new Map(state.loaded).set(id, texture),
          loading: newLoading,
          cache: {
            ...state.cache,
            currentSize: state.cache.currentSize + blob.size
          }
        }
      })
      
      get().updateProgress()
      return texture
      
    } catch (error) {
      set(state => {
        const newLoading = new Map(state.loading)
        newLoading.delete(id)
        
        return {
          loading: newLoading,
          errors: new Map(state.errors).set(id, error.message)
        }
      })
      
      throw error
    }
  },
  
  loadModel: async (id, url, options = {}) => {
    if (get().models.has(id)) {
      return get().models.get(id)
    }
    
    set(state => ({
      loading: new Map(state.loading).set(id, { type: 'model', url, progress: 0 })
    }))
    
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      
      const model = {
        id,
        url,
        type: 'model',
        data: arrayBuffer,
        format: options.format || url.split('.').pop().toLowerCase(),
        size: arrayBuffer.byteLength,
        loadedAt: Date.now()
      }
      
      set(state => {
        const newLoading = new Map(state.loading)
        newLoading.delete(id)
        
        return {
          models: new Map(state.models).set(id, model),
          loaded: new Map(state.loaded).set(id, model),
          loading: newLoading,
          cache: {
            ...state.cache,
            currentSize: state.cache.currentSize + arrayBuffer.byteLength
          }
        }
      })
      
      get().updateProgress()
      return model
      
    } catch (error) {
      set(state => {
        const newLoading = new Map(state.loading)
        newLoading.delete(id)
        
        return {
          loading: newLoading,
          errors: new Map(state.errors).set(id, error.message)
        }
      })
      
      throw error
    }
  },
  
  loadSound: async (id, url, options = {}) => {
    if (get().sounds.has(id)) {
      return get().sounds.get(id)
    }
    
    set(state => ({
      loading: new Map(state.loading).set(id, { type: 'sound', url, progress: 0 })
    }))
    
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      
      const sound = {
        id,
        url,
        type: 'sound',
        data: arrayBuffer,
        format: options.format || url.split('.').pop().toLowerCase(),
        volume: options.volume || 1.0,
        loop: options.loop || false,
        size: arrayBuffer.byteLength,
        loadedAt: Date.now()
      }
      
      set(state => {
        const newLoading = new Map(state.loading)
        newLoading.delete(id)
        
        return {
          sounds: new Map(state.sounds).set(id, sound),
          loaded: new Map(state.loaded).set(id, sound),
          loading: newLoading,
          cache: {
            ...state.cache,
            currentSize: state.cache.currentSize + arrayBuffer.byteLength
          }
        }
      })
      
      get().updateProgress()
      return sound
      
    } catch (error) {
      set(state => {
        const newLoading = new Map(state.loading)
        newLoading.delete(id)
        
        return {
          loading: newLoading,
          errors: new Map(state.errors).set(id, error.message)
        }
      })
      
      throw error
    }
  },
  
  // Batch loading
  loadAssets: async (assetList) => {
    const promises = assetList.map(asset => {
      switch (asset.type) {
        case 'texture':
          return get().loadTexture(asset.id, asset.url, asset.options)
        case 'model':
          return get().loadModel(asset.id, asset.url, asset.options)
        case 'sound':
          return get().loadSound(asset.id, asset.url, asset.options)
        default:
          return Promise.reject(new Error(`Unknown asset type: ${asset.type}`))
      }
    })
    
    set(state => ({
      loadingProgress: {
        ...state.loadingProgress,
        total: assetList.length
      }
    }))
    
    const results = await Promise.allSettled(promises)
    return results
  },
  
  // Asset retrieval
  getTexture: (id) => get().textures.get(id),
  getModel: (id) => get().models.get(id),
  getSound: (id) => get().sounds.get(id),
  getMaterial: (id) => get().materials.get(id),
  
  // Asset management
  unloadAsset: (id) => {
    const state = get()
    let removedSize = 0
    
    // Check all asset types
    const assetTypes = ['textures', 'models', 'sounds', 'materials', 'animations', 'fonts']
    
    assetTypes.forEach(type => {
      const asset = state[type].get(id)
      if (asset) {
        if (asset.size) removedSize += asset.size
        
        // Revoke object URLs for textures
        if (type === 'textures' && asset.url?.startsWith('blob:')) {
          URL.revokeObjectURL(asset.url)
        }
        
        set(state => ({
          [type]: new Map(state[type]).delete(id),
          loaded: new Map(state.loaded).delete(id),
          cache: {
            ...state.cache,
            currentSize: Math.max(0, state.cache.currentSize - removedSize)
          }
        }))
      }
    })
  },
  
  clearCache: () => {
    const state = get()
    
    // Revoke all texture URLs
    state.textures.forEach(texture => {
      if (texture.url?.startsWith('blob:')) {
        URL.revokeObjectURL(texture.url)
      }
    })
    
    set({
      textures: new Map(),
      models: new Map(),
      sounds: new Map(),
      materials: new Map(),
      animations: new Map(),
      fonts: new Map(),
      loaded: new Map(),
      errors: new Map(),
      cache: {
        ...state.cache,
        currentSize: 0
      }
    })
  },
  
  // Progress tracking
  updateProgress: () => {
    const state = get()
    const loadedCount = state.loaded.size
    const totalCount = loadedCount + state.loading.size
    
    set({
      loadingProgress: {
        total: totalCount,
        loaded: loadedCount,
        percentage: totalCount > 0 ? (loadedCount / totalCount) * 100 : 0
      }
    })
  },
  
  // Cache management
  checkCacheSize: () => {
    const state = get()
    if (state.cache.currentSize > state.cache.maxSize) {
      // Remove oldest assets
      const allAssets = []
      
      state.loaded.forEach((asset, id) => {
        allAssets.push({ id, asset, loadedAt: asset.loadedAt })
      })
      
      allAssets.sort((a, b) => a.loadedAt - b.loadedAt)
      
      // Remove oldest 25%
      const toRemove = Math.floor(allAssets.length * 0.25)
      for (let i = 0; i < toRemove; i++) {
        get().unloadAsset(allAssets[i].id)
      }
    }
  },
  
  // Utility
  isLoading: (id) => get().loading.has(id),
  hasError: (id) => get().errors.has(id),
  isLoaded: (id) => get().loaded.has(id)
}))