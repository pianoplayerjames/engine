import React, { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls, Grid, Stats, Environment, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { renderState, renderActions } from './store.js'
import { editorState, editorActions } from '@/plugins/editor/store.js'
import LightingManager from '@/components/LightingManager.jsx'
import * as THREE from 'three'

// Component to manage scene background and environment using drei's Environment
const EnvironmentBackground = React.memo(() => {
  const { environment } = useSnapshot(renderState)
  const [currentPreset, setCurrentPreset] = useState(null)
  
  // Debounce preset changes to reduce flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPreset(environment.preset && environment.type === 'hdr' ? environment.preset : null)
    }, 50) // Small delay to batch rapid changes
    
    return () => clearTimeout(timer)
  }, [environment.preset, environment.type])
  
  // Only render Environment component when we have a valid preset
  // This prevents the cube map loading errors when preset is null
  if (!currentPreset) {
    return null
  }
  
  return (
    <Environment 
      preset={currentPreset}
      background
      environmentIntensity={environment.intensity}
      resolution={256} // Lower resolution for faster loading
    />
  )
})

function ViewportCanvas({ children, style = {}, onContextMenu }) {
  const orbitControlsRef = useRef()
  const transformControlsRef = useRef()
  const sceneRef = useRef()
  const canvasRef = useRef()
  const [isDragOver, setIsDragOver] = useState(false)
  
  const { camera, lighting, settings, environment } = useSnapshot(renderState)
  const { selection, settings: editorSettings } = useSnapshot(editorState)
  
  const { entity: selectedObject, transformMode } = selection
  const { grid: gridSettings, viewport: viewportSettings } = editorSettings
  const { ambient: ambientLight } = lighting

  // Helper function to sync camera position to render store
  const syncCameraPosition = () => {
    const camera = orbitControlsRef.current?.object
    if (camera) {
      renderActions.setCameraPosition(camera.position.x, camera.position.y, camera.position.z)
      renderActions.setCameraTarget(
        orbitControlsRef.current.target.x,
        orbitControlsRef.current.target.y,
        orbitControlsRef.current.target.z
      )
      console.log('📷 Camera position synced:', {
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [orbitControlsRef.current.target.x, orbitControlsRef.current.target.y, orbitControlsRef.current.target.z]
      })
    }
  }
  
  // Find mesh object by scene object ID
  const findMeshByObjectId = (objectId) => {
    if (!sceneRef.current || !objectId) return null;
    
    const findInScene = (object) => {
      if (object.userData?.sceneObjectId === objectId) {
        return object;
      }
      for (const child of object.children) {
        const found = findInScene(child);
        if (found) return found;
      }
      return null;
    };
    
    return findInScene(sceneRef.current);
  };
  
  const [selectedMesh, setSelectedMesh] = useState(null);
  
  // Update selectedMesh when selectedObject changes or scene updates
  useEffect(() => {
    if (!selectedObject) {
      setSelectedMesh(null);
      return;
    }
    
    const findMesh = () => {
      const mesh = findMeshByObjectId(selectedObject);
      if (mesh) {
        setSelectedMesh(mesh);
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (!findMesh()) {
      // If not found, retry with a small delay
      const timeout = setTimeout(() => {
        findMesh();
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [selectedObject, sceneRef.current]);
  

  // Reposition stats panel to center
  useEffect(() => {
    const repositionStats = () => {
      // Try multiple selectors to find the stats panel
      const selectors = [
        'div[style*="position:absolute"][style*="top:0px"][style*="left:0px"]',
        'div[style*="position: absolute"][style*="top: 0px"][style*="left: 0px"]',
        'div[style*="z-index"][style*="position"][style*="top"]',
        '.stats-panel'
      ]
      
      let statsPanel = null
      for (const selector of selectors) {
        statsPanel = document.querySelector(selector)
        if (statsPanel && (statsPanel.textContent.includes('FPS') || statsPanel.children.length > 0)) {
          break
        }
      }
      
      if (statsPanel && statsPanel.style.position !== 'fixed') {
        statsPanel.style.position = 'fixed'
        statsPanel.style.top = '10px'
        statsPanel.style.left = '50%'
        statsPanel.style.transform = 'translateX(-50%)'
        statsPanel.style.zIndex = '100'
        return true
      }
      return false
    }
    
    // Use MutationObserver to catch when stats panel is added
    const observer = new MutationObserver(() => {
      if (repositionStats()) {
        observer.disconnect()
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [])

  // Update background color when viewport settings change
  useEffect(() => {
    const renderer = renderActions.getRenderer();
    if (renderer) {
      renderer.setClearColor(viewportSettings.backgroundColor);
    }
  }, [viewportSettings.backgroundColor]);

  // Handle asset drops from the asset library
  const handleDrop = (e) => {
    console.log('🎯 Drop event triggered on viewport');
    e.preventDefault()
    setIsDragOver(false) // Hide drag indicator
    
    try {
      const rawData = e.dataTransfer.getData('application/json');
      console.log('📦 Raw drop data:', rawData);
      
      const assetData = JSON.parse(rawData);
      console.log('🔍 Parsed asset data:', assetData);
      console.log('✅ Asset type:', assetData.type, 'Category:', assetData.category);
      
      if (assetData.type === 'asset' && assetData.category === '3d-models') {
        console.log('🎉 Valid 3D model drop detected!');
        // Get mouse position in viewport coordinates
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        
        // Cast ray to find drop position
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2(x, y)
        
        if (orbitControlsRef.current?.object) {
          raycaster.setFromCamera(mouse, orbitControlsRef.current.object)
          
          // Try to intersect with the grid/ground plane
          const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1) // Y=1 plane
          const dropPosition = new THREE.Vector3()
          raycaster.ray.intersectPlane(groundPlane, dropPosition)
          
          // Create a new scene object
          const newObject = {
            name: assetData.name || 'Model',
            type: 'model',
            position: [dropPosition.x, dropPosition.y, dropPosition.z],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            assetPath: assetData.path,
            assetId: assetData.id,
            visible: true
          }
          
          // Add to scene
          const createdObject = editorActions.addSceneObject(newObject)
          console.log(`🎯 Dropped ${assetData.name} at position:`, dropPosition.toArray())
          
          // Select the newly created object
          editorActions.setSelectedEntity(createdObject.id)
        }
      }
    } catch (error) {
      console.warn('Failed to handle asset drop:', error)
    }
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    
    // Check if it's a valid asset being dragged (from asset library)
    const types = e.dataTransfer.types
    if (types.includes('application/x-asset-drag')) {
      setIsDragOver(true)
    }
  }
  
  const handleDragEnter = (e) => {
    e.preventDefault()
    const types = e.dataTransfer.types
    if (types.includes('application/x-asset-drag')) {
      setIsDragOver(true)
    }
  }
  
  const handleDragLeave = (e) => {
    e.preventDefault()
    // Only hide if we're leaving the viewport container
    if (!canvasRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleCreated = ({ scene, gl, camera: threeCamera }) => {
    sceneRef.current = scene
    renderActions.setScene(scene)
    renderActions.setRenderer(gl)
    
    // Apply render settings
    gl.shadowMap.enabled = settings.shadows
    gl.physicallyCorrectLights = settings.physicallyCorrectLights
    
    // Set background color
    gl.setClearColor(viewportSettings.backgroundColor)
  }

  return (
    <div 
      ref={canvasRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: viewportSettings.backgroundColor, // Prevent white flash
        transition: 'none', // Ensure no CSS transitions interfere with resize
        ...style 
      }}
      onClick={() => {
        // Ensure canvas regains focus when clicked on viewport
        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.focus();
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {/* Drag overlay indicator */}
      {isDragOver && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '2px dashed rgba(59, 130, 246, 0.5)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
        </div>
      )}
      <Canvas
        camera={{
          position: camera.position,
          fov: camera.fov,
          near: camera.near,
          far: camera.far
        }}
        gl={{
          antialias: settings.antialias,
          alpha: settings.alpha,
          powerPreference: settings.powerPreference
        }}
        shadows={settings.shadows}
        dpr={[1, 2]} // Use device pixel ratio up to 2x for crisp rendering
        flat // Use flat shading for better performance with grid lines
        resize={{ scroll: false, debounce: 0 }} // Immediate resize without debouncing
        onCreated={handleCreated}
        style={{ backgroundColor: viewportSettings.backgroundColor, outline: 'none' }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onContextMenu) {
            onContextMenu(e, null, 'viewport');
          }
        }}
        onPointerMissed={() => {
          // Deselect object when clicking on empty space (no objects hit)
          editorActions.setSelectedEntity(null);
        }}
        tabIndex={0}
      >
        {/* Advanced Lighting System */}
        <LightingManager />
        
        {/* Environment and Background Management */}
        <Suspense fallback={null}>
          <EnvironmentBackground />
        </Suspense>
        
        {/* Dynamic Grid */}
        {gridSettings.enabled && (
          <Grid
            position={gridSettings.position}
            args={[gridSettings.size, gridSettings.size]}
            cellSize={gridSettings.cellSize}
            cellThickness={gridSettings.cellThickness}
            cellColor={gridSettings.cellColor}
            sectionSize={gridSettings.sectionSize}
            sectionThickness={gridSettings.sectionThickness}
            sectionColor={gridSettings.sectionColor}
            fadeDistance={gridSettings.fadeDistance}
            fadeStrength={gridSettings.fadeStrength}
            followCamera={false}
            infiniteGrid={gridSettings.infiniteGrid}
          />
        )}
        
        {children}
        
        <OrbitControls 
          ref={orbitControlsRef}
          target={camera.target}
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,   // Left button for rotation
            MIDDLE: THREE.MOUSE.DOLLY,  // Middle button for zoom  
            RIGHT: null                 // Disable right button
          }}
          enabled={true}
          onChange={syncCameraPosition}
          onEnd={syncCameraPosition}
        />
        
        {selectedMesh && transformMode !== 'select' && (
          <TransformControls
            ref={transformControlsRef}
            object={selectedMesh}
            mode={transformMode === 'move' ? 'translate' : transformMode === 'rotate' ? 'rotate' : 'scale'}
            size={1}
            showX={true}
            showY={true}
            showZ={true}
            onMouseDown={() => orbitControlsRef.current && (orbitControlsRef.current.enabled = false)}
            onMouseUp={() => orbitControlsRef.current && (orbitControlsRef.current.enabled = true)}
            onChange={() => {
              // Update store when object is transformed
              if (selectedMesh && selectedObject) {
                editorActions.updateSceneObject(selectedObject, {
                  position: selectedMesh.position.toArray(),
                  rotation: selectedMesh.rotation.toArray(),
                  scale: selectedMesh.scale.toArray()
                });
              }
            }}
          />
        )}
        
        {/* Performance Stats */}
        <Stats showPanel={0} />
        
        {/* Viewport Gizmo */}
        <GizmoHelper
          alignment="bottom-right"
          margin={[80, 80]}
        >
          <GizmoViewport 
            axisColors={['#ff4757', '#2ed573', '#3742fa']} // Red, Green, Blue
            labelColor="white"
            hideNegativeAxes={false}
            hideAxisHeads={false}
          />
        </GizmoHelper>
      </Canvas>
    </div>
  )
}

export default function RenderPlugin({ children, embedded = false, style = {}, onContextMenu, viewportBounds }) {
  if (embedded) {
    return <ViewportCanvas style={style} onContextMenu={onContextMenu}>{children}</ViewportCanvas>
  }

  // Use custom viewport bounds if provided, otherwise default to full screen
  const defaultStyle = viewportBounds ? {
    position: 'fixed',
    top: viewportBounds.top || 0,
    left: viewportBounds.left || 0,
    right: viewportBounds.right || 0,
    bottom: viewportBounds.bottom || 0,
    width: 'auto',
    height: 'auto'
    // No transitions - viewport should resize immediately
  } : { width: '100vw', height: '100vh' };

  return (
    <ViewportCanvas style={{ ...defaultStyle, ...style }} onContextMenu={onContextMenu}>
      {children}
    </ViewportCanvas>
  )
}

// Export ViewportCanvas for use in editor
export { ViewportCanvas }

// Export the state and actions for other plugins to use
export { renderState, renderActions } from './store.js'