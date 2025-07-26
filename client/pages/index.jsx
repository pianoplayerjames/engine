

import React, { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import RenderPlugin from '../plugins/render/index.jsx'
import InputPlugin from '../plugins/input/index.jsx'
import AudioPlugin from '../plugins/audio/index.jsx'
import TimePlugin from '../plugins/time/index.jsx'
import ScenePlugin from '../plugins/scene/index.jsx'
import PhysicsPlugin from '../plugins/physics/index.jsx'
import AssetsPlugin from '../plugins/assets/index.jsx'
import EditorPlugin from '../plugins/editor/index.jsx'
import { useEditorStore } from '../plugins/editor/store.js'

function SceneObject({ sceneObj }) {
  const meshRef = useRef()
  const { selectedObject, setSelectedObject, setTransformMode, updateSceneObject } = useEditorStore()
  
  const isSelected = selectedObject === sceneObj.id
  
  // Store mesh reference for transform controls
  useEffect(() => {
    if (meshRef.current && sceneObj.id) {
      meshRef.current.userData.sceneObjectId = sceneObj.id;
    }
  }, [sceneObj.id]);
  
  const handleClick = (e) => {
    e.stopPropagation()
    setSelectedObject(sceneObj.id)
    setTransformMode('move')
  }
  
  // Create appropriate geometry based on type
  const getGeometry = () => {
    switch (sceneObj.geometry) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
      case 'plane':
        return <planeGeometry args={[1, 1]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }
  
  if (!sceneObj.visible) return null
  
  return (
    <mesh
      ref={meshRef}
      position={sceneObj.position}
      rotation={sceneObj.rotation}
      scale={sceneObj.scale}
      onClick={handleClick}
      userData={{ sceneObjectId: sceneObj.id }}
    >
      {getGeometry()}
      <meshStandardMaterial 
        color={isSelected ? '#4FC3F7' : sceneObj.material.color} 
        emissive={isSelected ? '#1E88E5' : '#000000'}
        emissiveIntensity={isSelected ? 0.2 : 0}
      />
    </mesh>
  )
}

function SceneRenderer() {
  const { sceneObjects } = useEditorStore()
  
  return (
    <>
      {sceneObjects.map(obj => (
        <SceneObject key={obj.id} sceneObj={obj} />
      ))}
    </>
  )
}

export default function Index() {
  const { contextMenuHandler } = useEditorStore();
  
  // Log only once on mount
  useEffect(() => {
    console.log('Engine starting...')
  }, []);

  return (
    <>
      {/* Core Engine Plugins */}
      <InputPlugin />
      <AudioPlugin />
      <TimePlugin />
      <ScenePlugin />
      <PhysicsPlugin />
      <AssetsPlugin />
      <EditorPlugin />
      
      {/* Render Plugin with Scene Content */}
      <RenderPlugin onContextMenu={contextMenuHandler}>
        {/* Dynamic scene objects */}
        <SceneRenderer />
        
        {/* Ground plane - not selectable */}
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      </RenderPlugin>
    </>
  )
}