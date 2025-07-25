import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'

function Cube() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'blue'} />
    </mesh>
  )
}

export default function SSRCube() {
  const [isClient, setIsClient] = useState(false)
  const [renderTime, setRenderTime] = useState('')

  useEffect(() => {
    setIsClient(true)
    setRenderTime(new Date().toISOString())
  }, [])

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h2>SSR Test Component</h2>
        <p>Rendered at: {renderTime || 'Server rendering...'}</p>
        <p>Status: {isClient ? 'Hydrated on client' : 'Server-side rendered'}</p>
        <p>Canvas below: {isClient ? 'Active Three.js scene' : 'Will load after hydration'}</p>
      </div>
      
      {isClient ? (
        <div style={{ width: '100vw', height: '70vh' }}>
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Cube />
          </Canvas>
        </div>
      ) : (
        <div style={{ 
          width: '100vw', 
          height: '70vh', 
          background: '#333', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          <p>Three.js Canvas loading...</p>
        </div>
      )}
    </div>
  )
}