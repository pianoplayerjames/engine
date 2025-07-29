// High-performance asset loading system with priority queues and intelligent caching
import { proxy } from 'valtio';
import { getThumbnailGenerator } from './SimpleThumbnailGenerator.js';

// Asset loading priorities
const PRIORITY = {
  CRITICAL: 0,    // Currently visible/selected assets
  HIGH: 1,        // Assets in viewport or recently accessed
  MEDIUM: 2,      // Assets in current category
  LOW: 3,         // Background preloading
  IDLE: 4         // When browser is idle
};

// Asset states
const ASSET_STATE = {
  UNLOADED: 'unloaded',
  QUEUED: 'queued',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
  CACHED: 'cached'
};

class OptimizedAssetManager {
  constructor() {
    // Priority queues for different asset types
    this.queues = {
      [PRIORITY.CRITICAL]: [],
      [PRIORITY.HIGH]: [],
      [PRIORITY.MEDIUM]: [],
      [PRIORITY.LOW]: [],
      [PRIORITY.IDLE]: []
    };
    
    // Asset state tracking
    this.assetStates = new Map();
    this.loadingPromises = new Map();
    
    // Performance monitoring
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      loadTimes: [],
      errors: 0
    };
    
    // Concurrency control
    this.maxConcurrentLoads = 3;
    this.currentLoads = 0;
    
    // Browser idle detection
    this.isIdle = false;
    this.idleTimeout = null;
    
    // LRU Cache with size limits
    this.cache = new Map();
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB
    this.currentCacheSize = 0;
    
    // Thumbnail worker pool
    this.thumbnailWorkers = [];
    this.workerQueue = [];
    
    // Only initialize browser-specific features if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.setupIdleDetection();
      this.startQueueProcessor();
    }
  }
  
  async initThumbnailWorkers() {
    const workerCount = Math.min(navigator.hardwareConcurrency || 2, 4);
    
    for (let i = 0; i < workerCount; i++) {
      try {
        const worker = new Worker(
          new URL('./WorkerThumbnailGenerator.js', import.meta.url),
          { type: 'module' }
        );
        
        worker.postMessage({ type: 'init', id: `init-${i}` });
        
        worker.onmessage = (e) => this.handleWorkerMessage(e, worker);
        worker.onerror = (error) => console.error('Thumbnail worker error:', error);
        
        this.thumbnailWorkers.push({
          worker,
          busy: false,
          id: i
        });
      } catch (error) {
        console.warn('Failed to create thumbnail worker:', error);
      }
    }
  }
  
  handleWorkerMessage(e, worker) {
    const { type, data, id, error } = e.data;
    
    switch (type) {
      case 'ready':
        // Worker initialized
        break;
        
      case 'thumbnail':
        const { assetId, imageBitmap } = data;
        this.handleThumbnailComplete(assetId, imageBitmap);
        
        // Mark worker as free
        const workerInfo = this.thumbnailWorkers.find(w => w.worker === worker);
        if (workerInfo) workerInfo.busy = false;
        
        // Process next queued thumbnail
        this.processWorkerQueue();
        break;
        
      case 'error':
        console.error('Thumbnail generation error:', error);
        this.handleThumbnailError(id, error);
        
        const errorWorkerInfo = this.thumbnailWorkers.find(w => w.worker === worker);
        if (errorWorkerInfo) errorWorkerInfo.busy = false;
        
        this.processWorkerQueue();
        break;
    }
  }
  
  async generateThumbnail(asset, priority = PRIORITY.MEDIUM) {
    if (typeof window === 'undefined') {
      return null; // Don't generate thumbnails during SSR
    }
    
    if (asset.category !== '3d-models') {
      return null; // Non-3D assets don't need thumbnails
    }
    
    const cacheKey = `thumb_${asset.id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    try {
      const generator = getThumbnailGenerator();
      if (!generator) {
        throw new Error('Thumbnail generator not available');
      }
      
      const url = `/api/projects/${this.currentProject}/assets/file/${asset.path}`;
      const thumbnail = await generator.generateThumbnail(url, asset.extension, asset.id);
      
      // Cache the result
      this.cache.set(cacheKey, thumbnail);
      this.updateCacheSize(cacheKey, thumbnail.length);
      this.stats.totalRequests++;
      
      return thumbnail;
      
    } catch (error) {
      console.warn(`Thumbnail generation failed for ${asset.id}:`, error);
      this.stats.errors++;
      throw error;
    }
  }
  
  processWorkerQueue() {
    if (this.workerQueue.length === 0) return;
    
    // Find available worker
    const availableWorker = this.thumbnailWorkers.find(w => !w.busy);
    if (!availableWorker) return;
    
    // Get highest priority task
    const task = this.workerQueue.shift();
    availableWorker.busy = true;
    
    // Send to worker
    const { asset } = task;
    const url = `/api/projects/${this.currentProject}/assets/file/${asset.path}`;
    
    availableWorker.worker.postMessage({
      type: 'generate',
      id: asset.id,
      data: {
        url,
        format: asset.extension,
        assetId: asset.id
      }
    });
    
    // Store promise resolvers
    this.loadingPromises.set(asset.id, task);
  }
  
  handleThumbnailComplete(assetId, imageBitmap) {
    if (typeof window === 'undefined') {
      return; // Skip during SSR
    }
    
    const task = this.loadingPromises.get(assetId);
    if (task) {
      // Convert ImageBitmap to data URL for React compatibility
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageBitmap, 0, 0);
      
      const dataURL = canvas.toDataURL('image/png');
      
      // Cache the result
      const cacheKey = `thumb_${assetId}`;
      this.cache.set(cacheKey, dataURL);
      this.updateCacheSize(cacheKey, dataURL.length);
      
      task.resolve(dataURL);
      this.loadingPromises.delete(assetId);
      
      // Clean up ImageBitmap
      imageBitmap.close();
    }
  }
  
  handleThumbnailError(assetId, error) {
    const task = this.loadingPromises.get(assetId);
    if (task) {
      task.reject(new Error(error));
      this.loadingPromises.delete(assetId);
      this.stats.errors++;
    }
  }
  
  // Queue asset for loading with priority
  queueAsset(asset, priority = PRIORITY.MEDIUM) {
    if (typeof window === 'undefined') {
      return; // Don't queue assets during SSR
    }
    
    const assetId = asset.id;
    
    // Skip if already loaded or loading
    if (this.assetStates.get(assetId) === ASSET_STATE.LOADED ||
        this.assetStates.get(assetId) === ASSET_STATE.LOADING) {
      return;
    }
    
    // Add to appropriate priority queue
    this.queues[priority].push({
      asset,
      priority,
      timestamp: Date.now()
    });
    
    this.assetStates.set(assetId, ASSET_STATE.QUEUED);
  }
  
  // Process loading queues with concurrency control
  async startQueueProcessor() {
    while (true) {
      if (this.currentLoads < this.maxConcurrentLoads) {
        const task = this.getNextTask();
        
        if (task) {
          this.currentLoads++;
          this.processAssetLoad(task).finally(() => {
            this.currentLoads--;
          });
        }
      }
      
      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  getNextTask() {
    // Process queues in priority order
    for (const priority of [PRIORITY.CRITICAL, PRIORITY.HIGH, PRIORITY.MEDIUM, PRIORITY.LOW]) {
      if (this.queues[priority].length > 0) {
        return this.queues[priority].shift();
      }
    }
    
    // Process idle queue only when browser is idle
    if (this.isIdle && this.queues[PRIORITY.IDLE].length > 0) {
      return this.queues[PRIORITY.IDLE].shift();
    }
    
    return null;
  }
  
  async processAssetLoad(task) {
    const { asset } = task;
    const assetId = asset.id;
    
    try {
      this.assetStates.set(assetId, ASSET_STATE.LOADING);
      const startTime = Date.now();
      
      // Load asset based on type
      let loadedAsset;
      switch (asset.category) {
        case 'textures':
          loadedAsset = await this.loadTexture(asset);
          break;
        case '3d-models':
          loadedAsset = await this.loadModel(asset);
          break;
        case 'audio':
          loadedAsset = await this.loadAudio(asset);
          break;
        default:
          loadedAsset = await this.loadGeneric(asset);
      }
      
      // Cache the loaded asset
      this.cache.set(assetId, loadedAsset);
      this.updateCacheSize(assetId, this.estimateAssetSize(loadedAsset));
      
      this.assetStates.set(assetId, ASSET_STATE.LOADED);
      
      // Update performance stats
      const loadTime = Date.now() - startTime;
      this.stats.loadTimes.push(loadTime);
      this.stats.totalRequests++;
      
    } catch (error) {
      console.warn(`Failed to load asset ${assetId}:`, error);
      this.assetStates.set(assetId, ASSET_STATE.ERROR);
      this.stats.errors++;
    }
  }
  
  async loadTexture(asset) {
    const url = `/api/projects/${this.currentProject}/assets/file/${asset.path}`;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => reject(new Error('Texture load timeout')), 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        
        // Create ImageBitmap for better performance
        createImageBitmap(img).then(resolve).catch(reject);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Texture load failed'));
      };
      
      img.src = url;
    });
  }
  
  async loadModel(asset) {
    const url = `/api/projects/${this.currentProject}/assets/file/${asset.path}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  }
  
  async loadAudio(asset) {
    const url = `/api/projects/${this.currentProject}/assets/file/${asset.path}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  }
  
  async loadGeneric(asset) {
    const url = `/api/projects/${this.currentProject}/assets/file/${asset.path}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // For small files, cache content
    if (asset.size < 1024 * 1024) { // < 1MB
      return await response.blob();
    }
    
    return { url, cached: false };
  }
  
  // LRU Cache management
  updateCacheSize(key, size) {
    this.currentCacheSize += size;
    
    // Evict if over limit
    if (this.currentCacheSize > this.maxCacheSize) {
      this.evictLRU();
    }
  }
  
  evictLRU() {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access time (implement LRU tracking)
    // For now, remove oldest entries
    while (this.currentCacheSize > this.maxCacheSize * 0.8 && entries.length > 0) {
      const [key, value] = entries.shift();
      
      this.cache.delete(key);
      this.currentCacheSize -= this.estimateAssetSize(value);
      
      // Clean up blob URLs
      if (value instanceof Blob && value.url?.startsWith('blob:')) {
        URL.revokeObjectURL(value.url);
      }
    }
  }
  
  estimateAssetSize(asset) {
    if (asset instanceof ArrayBuffer) {
      return asset.byteLength;
    }
    if (asset instanceof Blob) {
      return asset.size;
    }
    if (typeof asset === 'string') {
      return asset.length * 2; // Rough estimate for UTF-16
    }
    return 1024; // Default estimate
  }
  
  // Idle detection for background loading
  setupIdleDetection() {
    const resetIdleTimer = () => {
      this.isIdle = false;
      clearTimeout(this.idleTimeout);
      
      this.idleTimeout = setTimeout(() => {
        this.isIdle = true;
      }, 2000); // 2 seconds of inactivity
    };
    
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });
    
    resetIdleTimer();
  }
  
  // Public API
  setCurrentProject(projectName) {
    this.currentProject = projectName;
  }
  
  getAsset(assetId) {
    return this.cache.get(assetId);
  }
  
  getAssetState(assetId) {
    return this.assetStates.get(assetId) || ASSET_STATE.UNLOADED;
  }
  
  getStats() {
    const avgLoadTime = this.stats.loadTimes.length > 0 
      ? this.stats.loadTimes.reduce((a, b) => a + b, 0) / this.stats.loadTimes.length 
      : 0;
    
    return {
      ...this.stats,
      avgLoadTime,
      cacheHitRate: this.stats.totalRequests > 0 
        ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
        : 0,
      cacheSize: this.currentCacheSize,
      queueSizes: Object.fromEntries(
        Object.entries(this.queues).map(([priority, queue]) => [priority, queue.length])
      )
    };
  }
  
  clearCache() {
    this.cache.clear();
    this.currentCacheSize = 0;
    this.thumbnailWorkers.forEach(({ worker }) => {
      worker.postMessage({ type: 'clear-cache' });
    });
  }
  
  destroy() {
    this.thumbnailWorkers.forEach(({ worker }) => worker.terminate());
    this.clearCache();
  }
}

// Create singleton instance only in browser environment
let assetManager = null;

if (typeof window !== 'undefined') {
  assetManager = new OptimizedAssetManager();
} else {
  // Create a minimal stub for SSR
  assetManager = {
    generateThumbnail: () => Promise.resolve(null),
    queueAsset: () => {},
    getAsset: () => null,
    getAssetState: () => ASSET_STATE.UNLOADED,
    setCurrentProject: () => {},
    getStats: () => ({
      totalRequests: 0,
      cacheHits: 0,
      loadTimes: [],
      errors: 0,
      avgLoadTime: 0,
      cacheHitRate: 0,
      cacheSize: 0,
      queueSizes: {}
    }),
    clearCache: () => {},
    destroy: () => {}
  };
}

export { assetManager };

// Export constants for external use
export { PRIORITY, ASSET_STATE };