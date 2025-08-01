import { useRef, useEffect } from 'react'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/core/Cameras/arcRotateCamera'
import { editorActions } from '@/store.js'

function Viewport({ children, style = {}, onContextMenu }) {
  const canvasRef = useRef()

  useEffect(() => {
    if (!canvasRef.current) return

    // Create Babylon.js engine
    const engine = new BABYLON.Engine(canvasRef.current, true)

    // Create scene
    const scene = new BABYLON.Scene(engine)
    
    // Set background color
    scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.2)
    
    // Create camera with controls
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      BABYLON.Vector3.Zero(),
      scene
    )
    
    // Enable camera controls
    camera.setTarget(BABYLON.Vector3.Zero())
    scene.activeCamera = camera

    // Create basic lighting
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 0.7

    // Add a simple cube to see in the scene
    const box = BABYLON.MeshBuilder.CreateBox('box', { size: 2 }, scene)
    box.position.y = 1

    // Attach camera controls after scene is set up
    try {
      camera.attachControl(canvasRef.current, true)
    } catch (error) {
      console.warn('Camera controls not available:', error)
    }

    // Notify editor that scene is ready
    editorActions.updateBabylonScene(scene)

    // Start render loop
    engine.runRenderLoop(() => {
      scene.render()
    })

    // Handle resize
    const handleResize = () => {
      engine.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      editorActions.updateBabylonScene(null)
      scene.dispose()
      engine.dispose()
    }
  }, [])

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#333333',
        position: 'relative',
        ...style 
      }}
      onClick={() => {
        canvasRef.current?.focus()
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        // Context menu disabled for 3D viewport
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%',
          outline: 'none',
          display: 'block'
        }}
        tabIndex={0}
      />
      
      {children}
    </div>
  )
}

export default function RenderPlugin({ children, embedded = false, style = {}, onContextMenu, viewportBounds }) {
  if (embedded) {
    return <Viewport style={style} onContextMenu={onContextMenu}>{children}</Viewport>
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
  } : { width: '100vw', height: '100vh' }

  return (
    <Viewport style={{ ...defaultStyle, ...style }} onContextMenu={onContextMenu}>
      {children}
    </Viewport>
  )
}

export { Viewport as ViewportCanvas }

// Export the render store for other plugins to use
export { renderState, renderActions } from '@/store.js'