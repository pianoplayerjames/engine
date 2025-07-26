import React, { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, Grid, Stats } from '@react-three/drei'
import { useRenderStore } from './store.js'
import { useEditorStore } from '../editor/store.js'
import * as THREE from 'three'

function ViewportCanvas({ children, style = {}, onContextMenu }) {
  const orbitControlsRef = useRef()
  const transformControlsRef = useRef()
  const sceneRef = useRef()
  
  const { 
    camera, 
    ambientLight, 
    settings,
    setScene,
    setRenderer,
    resize 
  } = useRenderStore()
  
  const { 
    selectedObject, 
    transformMode,
    gridSettings,
    viewportSettings 
  } = useEditorStore()
  
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
      
      if (statsPanel) {
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
    
    // Also try periodically
    const interval = setInterval(() => {
      if (repositionStats()) {
        clearInterval(interval)
      }
    }, 100)
    
    // Cleanup
    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  // Update background color when viewport settings change
  useEffect(() => {
    const state = useRenderStore.getState();
    if (state.renderer) {
      state.renderer.setClearColor(viewportSettings.backgroundColor);
    }
  }, [viewportSettings.backgroundColor]);

  const handleCreated = ({ scene, gl, camera: threeCamera }) => {
    sceneRef.current = scene
    setScene(scene)
    setRenderer(gl)
    
    // Apply render settings
    gl.shadowMap.enabled = settings.shadows
    gl.physicallyCorrectLights = settings.physicallyCorrectLights
    
    // Set background color
    gl.setClearColor(viewportSettings.backgroundColor)
  }

  return (
    <div 
      style={{ width: '100%', height: '100%', ...style }}
      onMouseEnter={() => {
        // Ensure canvas regains focus when mouse enters viewport
        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.focus();
        }
      }}
    >
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
        onCreated={handleCreated}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onContextMenu) {
            onContextMenu(e, null, 'viewport');
          }
        }}
        onPointerMissed={() => {
          // Deselect object when clicking on empty space (no objects hit)
          const { setSelectedObject } = useEditorStore.getState();
          setSelectedObject(null);
        }}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        <ambientLight 
          intensity={ambientLight.intensity} 
          color={ambientLight.color} 
        />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow={settings.shadows}
        />
        
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
                const { updateSceneObject } = useEditorStore.getState();
                updateSceneObject(selectedObject, {
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
      </Canvas>
    </div>
  )
}

export default function RenderPlugin({ children, embedded = false, style = {}, onContextMenu }) {
  if (embedded) {
    return <ViewportCanvas style={style} onContextMenu={onContextMenu}>{children}</ViewportCanvas>
  }

  return (
    <ViewportCanvas style={{ width: '100vw', height: '100vh', ...style }} onContextMenu={onContextMenu}>
      {children}
    </ViewportCanvas>
  )
}

// Export ViewportCanvas for use in editor
export { ViewportCanvas }

// Export the store for other plugins to use
export { useRenderStore } from './store.js'