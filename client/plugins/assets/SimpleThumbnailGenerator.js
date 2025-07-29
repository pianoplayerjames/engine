// Simplified thumbnail generator that works without workers
// More efficient than the original but still on main thread
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';

class SimpleThumbnailGenerator {
  constructor() {
    // Create a small, reusable renderer
    this.canvas = document.createElement('canvas');
    this.canvas.width = 128;
    this.canvas.height = 128;
    this.canvas.style.display = 'none'; // Hide from DOM
    
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      alpha: true, 
      antialias: false, // Disable for performance
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(128, 128);
    this.renderer.setClearColor(0x000000, 0);
    
    // Create reusable scene and camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.set(2, 1.5, 2);
    this.camera.lookAt(0, 0, 0);
    
    // Add optimized lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(3, 3, 3);
    this.scene.add(directionalLight);
    
    // Cache for thumbnails
    this.cache = new Map();
    
    // Loaders - reuse instances
    this.loaders = {
      gltf: new GLTFLoader(),
      obj: new OBJLoader(),
      fbx: new FBXLoader()
    };
    
    // Track loading state to prevent multiple loads
    this.loadingPromises = new Map();
  }
  
  async generateThumbnail(url, format, assetId) {
    // Check cache first
    if (this.cache.has(assetId)) {
      return this.cache.get(assetId);
    }
    
    // Check if already loading
    if (this.loadingPromises.has(assetId)) {
      return this.loadingPromises.get(assetId);
    }
    
    const promise = this._generateThumbnailInternal(url, format, assetId);
    this.loadingPromises.set(assetId, promise);
    
    try {
      const result = await promise;
      this.loadingPromises.delete(assetId);
      return result;
    } catch (error) {
      this.loadingPromises.delete(assetId);
      throw error;
    }
  }
  
  async _generateThumbnailInternal(url, format, assetId) {
    try {
      // Load model with shorter timeout
      const model = await this.loadModel(url, format);
      
      // Clear previous model from scene
      const existingModel = this.scene.getObjectByName('asset-model');
      if (existingModel) {
        this.scene.remove(existingModel);
        this.disposeObject(existingModel);
      }
      
      // Prepare and add new model
      model.name = 'asset-model';
      this.prepareModel(model);
      this.scene.add(model);
      
      // Render in next frame to avoid blocking
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Render to get image data
      this.renderer.render(this.scene, this.camera);
      
      // Convert to data URL
      const dataURL = this.canvas.toDataURL('image/png', 0.8); // Reduced quality for speed
      
      // Cache the result
      this.cache.set(assetId, dataURL);
      
      // Clean up model to free memory
      this.scene.remove(model);
      this.disposeObject(model);
      
      return dataURL;
      
    } catch (error) {
      console.warn(`Thumbnail generation failed for ${assetId}:`, error);
      throw error;
    }
  }
  
  async loadModel(url, format) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Model loading timeout'));
      }, 3000); // Reduced timeout from 5s to 3s
      
      let loader;
      const lowerFormat = format.toLowerCase();
      
      if (lowerFormat === '.gltf' || lowerFormat === '.glb') {
        loader = this.loaders.gltf;
      } else if (lowerFormat === '.obj') {
        loader = this.loaders.obj;
      } else if (lowerFormat === '.fbx') {
        loader = this.loaders.fbx;
      } else {
        reject(new Error(`Unsupported format: ${format}`));
        return;
      }
      
      loader.load(
        url,
        (result) => {
          clearTimeout(timeout);
          const model = result.scene || result;
          resolve(model);
        },
        undefined, // onProgress
        (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      );
    });
  }
  
  prepareModel(model) {
    // Calculate bounding box and center model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Scale to fit
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 1 / maxDim : 1;
    
    model.scale.setScalar(scale * 0.8);
    model.position.sub(center.multiplyScalar(scale));
    
    // Optimize materials for thumbnail
    model.traverse((child) => {
      if (child.isMesh) {
        // Simplify materials for faster rendering
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => this.optimizeMaterial(mat));
          } else {
            this.optimizeMaterial(child.material);
          }
        }
      }
    });
  }
  
  optimizeMaterial(material) {
    // Disable expensive material features for thumbnails
    if (material.normalMap) material.normalMap = null;
    if (material.roughnessMap) material.roughnessMap = null;
    if (material.metalnessMap) material.metalnessMap = null;
    if (material.aoMap) material.aoMap = null;
    if (material.displacementMap) material.displacementMap = null;
    
    // Use basic material properties
    material.transparent = false;
    material.alphaTest = 0;
    
    // Force update
    material.needsUpdate = true;
  }
  
  disposeObject(object) {
    // Recursively dispose of geometries and materials to free memory
    object.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => {
            this.disposeMaterial(material);
          });
        } else {
          this.disposeMaterial(child.material);
        }
      }
    });
  }
  
  disposeMaterial(material) {
    // Dispose of textures
    Object.values(material).forEach((value) => {
      if (value && typeof value.dispose === 'function') {
        value.dispose();
      }
    });
    
    material.dispose();
  }
  
  clearCache() {
    this.cache.clear();
  }
  
  destroy() {
    // Clean up renderer and canvas
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Clear cache
    this.clearCache();
    
    // Remove any models from scene
    const existingModel = this.scene.getObjectByName('asset-model');
    if (existingModel) {
      this.scene.remove(existingModel);
      this.disposeObject(existingModel);
    }
  }
}

// Export singleton instance
let thumbnailGenerator = null;

export function getThumbnailGenerator() {
  if (!thumbnailGenerator && typeof window !== 'undefined') {
    thumbnailGenerator = new SimpleThumbnailGenerator();
  }
  return thumbnailGenerator;
}

export default SimpleThumbnailGenerator;