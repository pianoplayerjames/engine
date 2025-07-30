import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSnapshot } from 'valtio';
import { Icons } from '@/plugins/editor/components/Icons';
import { editorState, editorActions } from '@/plugins/editor/store.js';
import { projectManager } from '@/plugins/projects/projectManager.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const ModelPreview = () => {
  const { ui } = useSnapshot(editorState);
  const { modelPreview } = ui;
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const animationActionsRef = useRef([]);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [modelInfo, setModelInfo] = useState(null);
  const [animations, setAnimations] = useState([]);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState('solid'); // solid, wireframe, skeleton
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  
  // Camera controls state
  const [cameraDistance, setCameraDistance] = useState(5);
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Add rim lighting
    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    gridHelper.position.y = -0.99;
    scene.add(gridHelper);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update animation mixer
      if (mixerRef.current) {
        mixerRef.current.update(0.016);
      }
      
      // Auto rotate
      if (autoRotate && modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }
      
      // Update camera position based on controls
      const x = Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x) * cameraDistance;
      const y = Math.sin(cameraRotation.x) * cameraDistance + 1;
      const z = Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x) * cameraDistance;
      
      camera.position.set(x, y, z);
      camera.lookAt(0, 1, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [cameraDistance, cameraRotation, autoRotate]);

  // Load model from asset path
  const loadModelFromAssetPath = useCallback(async (assetPath, assetName) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setLoadingProgress(0);

    try {
      const currentProject = projectManager.getCurrentProject();
      if (!currentProject.name) {
        console.error('No project loaded');
        return;
      }

      const modelUrl = `/api/projects/${currentProject.name}/assets/file/${encodeURIComponent(assetPath)}`;
      console.log('Loading model from asset:', modelUrl);

      // Clear previous model
      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current);
        modelRef.current = null;
      }

      // Clear previous animations
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      animationActionsRef.current = [];
      setAnimations([]);
      setCurrentAnimation(null);
      setIsPlaying(false);

      // Determine loader based on file extension
      const extension = assetPath.toLowerCase().split('.').pop();
      let loader;

      switch (extension) {
        case 'gltf':
        case 'glb':
          loader = new GLTFLoader();
          break;
        case 'fbx':
          loader = new FBXLoader();
          break;
        case 'obj':
          loader = new OBJLoader();
          break;
        default:
          throw new Error(`Unsupported model format: ${extension}`);
      }

      // Load the model
      loader.load(
        modelUrl,
        (result) => {
          let model;
          let modelAnimations = [];

          if (extension === 'gltf' || extension === 'glb') {
            model = result.scene;
            modelAnimations = result.animations || [];
          } else {
            model = result;
          }

          // Calculate model info
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          let vertexCount = 0;
          let triangleCount = 0;

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              if (child.geometry) {
                const geometry = child.geometry;
                if (geometry.attributes.position) {
                  vertexCount += geometry.attributes.position.count;
                  if (geometry.index) {
                    triangleCount += geometry.index.count / 3;
                  } else {
                    triangleCount += geometry.attributes.position.count / 3;
                  }
                }
              }
            }
          });

          setModelInfo({
            name: assetName,
            vertices: Math.floor(vertexCount),
            triangles: Math.floor(triangleCount),
            size: {
              x: size.x.toFixed(2),
              y: size.y.toFixed(2),
              z: size.z.toFixed(2)
            },
            center: box.getCenter(new THREE.Vector3())
          });

          // Center and scale model
          const center = box.getCenter(new THREE.Vector3());
          const maxSize = Math.max(size.x, size.y, size.z);
          const scale = Math.min(2 / maxSize, 1);
          
          model.position.set(-center.x * scale, -center.y * scale + 1, -center.z * scale);
          model.scale.setScalar(scale);

          // Setup animations
          if (modelAnimations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            mixerRef.current = mixer;

            const animationOptions = modelAnimations.map((clip, index) => ({
              id: index,
              name: clip.name || `Animation ${index + 1}`,
              duration: clip.duration.toFixed(2),
              clip
            }));

            setAnimations(animationOptions);

            // Create actions for all animations
            animationActionsRef.current = modelAnimations.map(clip => mixer.clipAction(clip));
          }

          modelRef.current = model;
          sceneRef.current.add(model);

          // Apply current view mode
          applyViewMode(model, viewMode);

          setIsLoading(false);
          console.log('Model loaded successfully:', assetName);
        },
        (progress) => {
          const percentComplete = (progress.loaded / progress.total) * 100;
          setLoadingProgress(Math.min(percentComplete, 100));
        },
        (error) => {
          console.error('Error loading model:', error);
          setIsLoading(false);
        }
      );

    } catch (error) {
      console.error('Error loading model from asset path:', error);
      setIsLoading(false);
    }
  }, [viewMode]);

  // Apply view mode to model
  const applyViewMode = (model, mode) => {
    if (!model) return;

    model.traverse((child) => {
      if (child.isMesh) {
        switch (mode) {
          case 'wireframe':
            child.material = child.material.clone();
            child.material.wireframe = true;
            break;
          case 'solid':
            if (child.material.wireframe) {
              child.material.wireframe = false;
            }
            break;
          case 'skeleton':
            // Show skeleton if available
            if (child.skeleton) {
              const helper = new THREE.SkeletonHelper(model);
              sceneRef.current.add(helper);
            }
            break;
        }
      }
    });
  };

  // Animation controls
  const playAnimation = (animationIndex) => {
    if (!mixerRef.current || !animationActionsRef.current[animationIndex]) return;

    // Stop all other animations
    animationActionsRef.current.forEach(action => action.stop());

    // Play selected animation
    const action = animationActionsRef.current[animationIndex];
    action.reset();
    action.play();
    
    setCurrentAnimation(animationIndex);
    setIsPlaying(true);
  };

  const stopAnimation = () => {
    if (!mixerRef.current) return;
    animationActionsRef.current.forEach(action => action.stop());
    setIsPlaying(false);
    setCurrentAnimation(null);
  };

  // View mode changes
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (modelRef.current) {
      applyViewMode(modelRef.current, mode);
    }
  };

  // Mouse controls for camera
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCameraRotation(prev => ({
      x: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.x - deltaY * 0.01)),
      y: prev.y - deltaX * 0.01
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    setCameraDistance(prev => Math.max(1, Math.min(20, prev * delta)));
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const isAssetDrag = e.dataTransfer.getData('application/x-asset-drag') === 'true';
    
    if (isAssetDrag) {
      try {
        const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
        console.log('Model asset dropped:', dragData);
        
        // Check if it's a 3D model file
        const modelExtensions = ['.gltf', '.glb', '.fbx', '.obj'];
        if (dragData.category === 'models' || 
            (dragData.extension && modelExtensions.includes(dragData.extension.toLowerCase()))) {
          loadModelFromAssetPath(dragData.path, dragData.name);
        } else {
          console.warn('Only 3D model assets can be dropped on the model preview');
        }
      } catch (error) {
        console.error('Error parsing asset drag data:', error);
      }
    }
  };

  return (
    <div 
      className="w-full h-full bg-gray-900 flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Model Preview Toolbar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
        {/* View Mode Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewModeChange('solid')}
            className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-2 ${
              viewMode === 'solid' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Icons.Cube className="w-4 h-4" />
            Solid
          </button>
          <button
            onClick={() => handleViewModeChange('wireframe')}
            className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-2 ${
              viewMode === 'wireframe' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Icons.Grid className="w-4 h-4" />
            Wireframe
          </button>
          <button
            onClick={() => handleViewModeChange('skeleton')}
            className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-2 ${
              viewMode === 'skeleton' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Icons.Animations className="w-4 h-4" />
            Skeleton
          </button>
        </div>

        {/* Animation Controls */}
        {animations.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={currentAnimation || ''}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                if (!isNaN(index)) {
                  playAnimation(index);
                }
              }}
              className="bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600"
            >
              <option value="">Select Animation</option>
              {animations.map((anim, index) => (
                <option key={index} value={index}>
                  {anim.name} ({anim.duration}s)
                </option>
              ))}
            </select>
            
            <button
              onClick={() => currentAnimation !== null && isPlaying ? stopAnimation() : playAnimation(currentAnimation || 0)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-2"
              disabled={animations.length === 0}
            >
              {isPlaying ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4" />}
              {isPlaying ? 'Stop' : 'Play'}
            </button>
          </div>
        )}

        {/* View Options */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded transition-colors ${
              autoRotate ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
            }`}
            title="Auto Rotate"
          >
            <Icons.ArrowPath className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
            }`}
            title="Show Grid"
          >
            <Icons.Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCameraDistance(5);
              setCameraRotation({ x: 0, y: 0 });
            }}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
            title="Reset Camera"
          >
            <Icons.ArrowsPointingOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          <div
            ref={mountRef}
            className="w-full h-full cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          {/* Model Info Overlay */}
          {modelInfo && (
            <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm text-white p-3 rounded border border-gray-600 text-sm">
              <div className="font-semibold mb-2">{modelInfo.name}</div>
              <div>Vertices: {modelInfo.vertices.toLocaleString()}</div>
              <div>Triangles: {modelInfo.triangles.toLocaleString()}</div>
              <div>Size: {modelInfo.size.x} × {modelInfo.size.y} × {modelInfo.size.z}</div>
              {animations.length > 0 && (
                <div>Animations: {animations.length}</div>
              )}
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-white text-lg mb-2">Loading Model...</div>
                <div className="text-gray-400 text-sm">{Math.round(loadingProgress)}%</div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!modelInfo && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Icons.Cube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-2">No Model Loaded</div>
                <div className="text-gray-500 text-sm">Drag & drop a 3D model to preview</div>
                <div className="text-gray-600 text-xs mt-2">Supports: GLTF, GLB, FBX, OBJ</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-600/20 border-4 border-dashed border-blue-400 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="text-center">
            <Icons.Cube className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <div className="text-blue-400 text-xl font-semibold mb-2">Drop 3D Model Here</div>
            <div className="text-blue-300 text-sm">Release to load model into preview</div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-8 bg-gray-800 border-t border-gray-700 flex items-center px-4 text-xs text-gray-400">
        <span>View: {viewMode}</span>
        {modelInfo && (
          <>
            <span className="mx-4">|</span>
            <span>{modelInfo.vertices.toLocaleString()} vertices</span>
            <span className="mx-4">|</span>
            <span>{modelInfo.triangles.toLocaleString()} triangles</span>
          </>
        )}
        {animations.length > 0 && (
          <>
            <span className="mx-4">|</span>
            <span>{animations.length} animation{animations.length !== 1 ? 's' : ''}</span>
          </>
        )}
        <span className="ml-auto text-gray-500">
          Controls: Drag(rotate) • Wheel(zoom) • Auto-rotate • Grid toggle
        </span>
      </div>
    </div>
  );
};

export default ModelPreview;