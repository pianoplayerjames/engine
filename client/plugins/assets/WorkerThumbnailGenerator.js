// Web Worker for off-screen thumbnail generation
// This moves 3D rendering off the main thread to prevent FPS drops

import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';

class OffscreenThumbnailGenerator {
  constructor() {
    // Create canvas for worker-based rendering
    this.canvas = new OffscreenCanvas(128, 128);
    
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        canvas: this.canvas,
        alpha: true, 
        antialias: false, // Disable for performance
        preserveDrawingBuffer: true
      });
      this.renderer.setSize(128, 128);
      this.renderer.setClearColor(0x000000, 0);
    } catch (error) {
      console.error('Failed to create WebGL renderer in worker:', error);
      throw error;
    }
    
    // Create reusable scene and camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.set(2, 1.5, 2);
    this.camera.lookAt(0, 0, 0);
    
    // Add lights once
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(3, 3, 3);
    this.scene.add(directionalLight);
    
    // Cache for thumbnails
    this.cache = new Map();
    
    // Loaders
    this.loaders = {
      gltf: new GLTFLoader(),
      obj: new OBJLoader(),
      fbx: new FBXLoader()
    };
  }
  
  async generateThumbnail(url, format, assetId) {
    // Check cache first
    if (this.cache.has(assetId)) {
      return this.cache.get(assetId);
    }
    
    try {
      // Load model with timeout
      const model = await this.loadModel(url, format);
      
      // Clear previous model from scene
      const existingModel = this.scene.getObjectByName('asset-model');
      if (existingModel) {
        this.scene.remove(existingModel);
      }
      
      // Prepare and add new model
      model.name = 'asset-model';
      this.prepareModel(model);
      this.scene.add(model);
      
      // Render to get image data
      this.renderer.render(this.scene, this.camera);
      
      // Convert to ImageBitmap for efficient transfer
      const imageBitmap = await createImageBitmap(this.canvas);
      
      // Cache the result
      this.cache.set(assetId, imageBitmap);
      
      return imageBitmap;
      
    } catch (error) {
      console.warn(`Thumbnail generation failed for ${assetId}:`, error);
      throw error;
    }
  }
  
  async loadModel(url, format) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Model loading timeout'));
      }, 5000); // Reduced timeout
      
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
        undefined,
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
    
    // Use basic material properties
    material.transparent = false;
    material.alphaTest = 0;
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// Worker message handler
let generator = null;

self.onmessage = async function(e) {
  const { type, data, id } = e.data;
  
  try {
    switch (type) {
      case 'init':
        generator = new OffscreenThumbnailGenerator();
        self.postMessage({ type: 'ready', id });
        break;
        
      case 'generate':
        if (!generator) {
          throw new Error('Generator not initialized');
        }
        
        const { url, format, assetId } = data;
        const imageBitmap = await generator.generateThumbnail(url, format, assetId);
        
        // Transfer ImageBitmap efficiently
        self.postMessage({ 
          type: 'thumbnail', 
          id, 
          data: { assetId, imageBitmap } 
        }, [imageBitmap]);
        break;
        
      case 'clear-cache':
        if (generator) {
          generator.clearCache();
        }
        self.postMessage({ type: 'cache-cleared', id });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      id, 
      error: error.message 
    });
  }
};