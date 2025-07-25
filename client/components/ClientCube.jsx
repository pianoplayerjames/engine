'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function RotatingCube() {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'red'} />
    </mesh>
  )
}

export default function ClientCube() {
  return (
    <div>
      <div style={{ padding: '20px', background: '#e0f0ff', marginBottom: '20px' }}>
        <h2>Client-Only Component</h2>
        <p>This component only renders on the client</p>
        <p>Features: Animated rotating cube</p>
      </div>
      
      <div style={{ width: '100vw', height: '70vh' }}>
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <RotatingCube />
        </Canvas>
      </div>
    </div>
  )
}