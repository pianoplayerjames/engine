

import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import RenderPlugin from '@/plugins/render/index.jsx'
import InputPlugin from '@/plugins/input/index.jsx'
import AudioPlugin from '@/plugins/audio/index.jsx'
import TimePlugin from '@/plugins/time/index.jsx'
import ScenePlugin from '@/plugins/scene/index.jsx'
import PhysicsPlugin from '@/plugins/physics/index.jsx'
import AssetsPlugin from '@/plugins/assets/index.jsx'
import EditorPlugin from '@/plugins/editor/index.jsx'
import ProjectsPlugin from '@/plugins/projects/index.jsx'
import LoadingProvider from '@/plugins/projects/components/LoadingProvider.jsx'
import EngineLoader from '@/plugins/core/EngineLoader.jsx'
import { useSnapshot } from 'valtio'
import { editorState, editorActions } from '@/plugins/editor/store.js'

function SceneObject({ sceneObj }) {
  const meshRef = useRef()
  const { selection, sceneObjects } = useSnapshot(editorState)
  const { entity: selectedObject } = selection
  const { setSelectedEntity, setTransformMode, updateSceneObject } = editorActions
  
  const isSelected = selectedObject === sceneObj.id
  
  useEffect(() => {
    if (meshRef.current && sceneObj.id) {
      meshRef.current.userData.sceneObjectId = sceneObj.id;
    }
  }, [sceneObj.id]);
  
  const handleClick = (e) => {
    e.stopPropagation()
    setSelectedEntity(sceneObj.id)
    setTransformMode('move')
  }
  
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
  const { sceneObjects } = useSnapshot(editorState)
  
  return (
    <>
      {sceneObjects.map(obj => (
        <SceneObject key={obj.id} sceneObj={obj} />
      ))}
    </>
  )
}

export default function Index() {
  const { console: consoleState, ui, panels } = useSnapshot(editorState);
  const { contextMenuHandler } = consoleState;
  const { rightPanelWidth, bottomPanelHeight } = ui;
  const { isScenePanelOpen, isAssetPanelOpen } = panels;
  
  useEffect(() => {
    console.log('Engine starting...')
  }, []);

  const viewportBounds = useMemo(() => ({
    top: 0,
    left: 0,
    right: isScenePanelOpen ? rightPanelWidth - 4 : 47,
    bottom: isAssetPanelOpen ? bottomPanelHeight - 1 : 40
  }), [isScenePanelOpen, rightPanelWidth, isAssetPanelOpen, bottomPanelHeight]);

  // Memoize the callback to prevent engine restarts on every render
  const handleLoadComplete = useCallback(() => {
    console.log('🎮 Renzora Engine UI ready!')
  }, []);

  return (
    <EngineLoader
      showSplash={false} // Disable splash for fastest loading
      onLoadComplete={handleLoadComplete}
    >
      <LoadingProvider>
        <InputPlugin />
        <AudioPlugin />
        <TimePlugin />
        <ScenePlugin />
        <PhysicsPlugin />
        <AssetsPlugin />
        <EditorPlugin />
        <ProjectsPlugin />
        
        <RenderPlugin onContextMenu={contextMenuHandler} viewportBounds={viewportBounds}>
          <SceneRenderer />
          
          <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        </RenderPlugin>
      </LoadingProvider>
    </EngineLoader>
  )
}