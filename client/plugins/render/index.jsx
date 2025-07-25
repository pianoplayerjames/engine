import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRenderStore } from './store.js'

function ViewportCanvas({ children, style = {} }) {
  const { 
    camera, 
    ambientLight, 
    settings,
    setScene,
    setRenderer,
    resize 
  } = useRenderStore()

  const handleCreated = ({ scene, gl, camera: threeCamera }) => {
    setScene(scene)
    setRenderer(gl)
    
    // Apply render settings
    gl.shadowMap.enabled = settings.shadows
    gl.physicallyCorrectLights = settings.physicallyCorrectLights
  }

  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
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
        
        {children}
        
        <OrbitControls 
          target={camera.target}
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true} 
        />
      </Canvas>
    </div>
  )
}

export default function RenderPlugin({ children, embedded = false, style = {} }) {
  if (embedded) {
    return <ViewportCanvas style={style}>{children}</ViewportCanvas>
  }

  return (
    <ViewportCanvas style={{ width: '100vw', height: '100vh', ...style }}>
      {children}
    </ViewportCanvas>
  )
}

// Export ViewportCanvas for use in editor
export { ViewportCanvas }

// Export the store for other plugins to use
export { useRenderStore } from './store.js'