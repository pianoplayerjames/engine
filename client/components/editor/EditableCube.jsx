'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function EditableCube({ position, rotation, scale, color, animate }) {
  const meshRef = useRef()

  useFrame((state, delta) => {
    if (meshRef.current && animate) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <mesh 
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={[scale.x, scale.y, scale.z]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}