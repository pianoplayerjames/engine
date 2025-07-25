'use client'

import { useState } from 'react'
import Render from './Render.jsx'

export default function Editor() {
  const [cubeProps, setCubeProps] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#ff6b35',
    animate: false
  })

  return <Render cubeProps={cubeProps} />
}