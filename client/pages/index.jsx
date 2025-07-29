

import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import RenderPlugin from '@/plugins/render/index.jsx'
import ModelObject from '@/components/ModelObject.jsx'
import { SimpleEdgeOutline } from '@/components/SelectionOutline.jsx'
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
  
  // Handle different object types
  if (sceneObj.type === 'model' && sceneObj.assetPath) {
    return (
      <ModelObject
        sceneObj={sceneObj}
        isSelected={isSelected}
        onClick={handleClick}
      />
    )
  }

  // Handle light objects
  if (sceneObj.type === 'light') {
    const getLightComponent = () => {
      switch (sceneObj.lightType) {
        case 'directional':
          return (
            <directionalLight
              position={sceneObj.position}
              rotation={sceneObj.rotation}
              color={sceneObj.color}
              intensity={sceneObj.intensity}
              castShadow={sceneObj.castShadow}
              shadow-mapSize={sceneObj.shadowMapSize || [1024, 1024]}
              shadow-camera-far={sceneObj.shadowCameraFar || 50}
              shadow-camera-left={sceneObj.shadowCameraLeft || -10}
              shadow-camera-right={sceneObj.shadowCameraRight || 10}
              shadow-camera-top={sceneObj.shadowCameraTop || 10}
              shadow-camera-bottom={sceneObj.shadowCameraBottom || -10}
            />
          )
        case 'point':
          return (
            <pointLight
              position={sceneObj.position}
              color={sceneObj.color}
              intensity={sceneObj.intensity}
              distance={sceneObj.distance || 0}
              decay={sceneObj.decay || 1}
              castShadow={sceneObj.castShadow}
              shadow-mapSize={sceneObj.shadowMapSize || [1024, 1024]}
            />
          )
        case 'spot':
          return (
            <spotLight
              position={sceneObj.position}
              rotation={sceneObj.rotation}
              color={sceneObj.color}
              intensity={sceneObj.intensity}
              distance={sceneObj.distance || 0}
              angle={sceneObj.angle || Math.PI / 3}
              penumbra={sceneObj.penumbra || 0}
              decay={sceneObj.decay || 1}
              castShadow={sceneObj.castShadow}
              shadow-mapSize={sceneObj.shadowMapSize || [1024, 1024]}
            />
          )
        default:
          return null
      }
    }

    if (!sceneObj.visible) return null

    return (
      <group>
        {getLightComponent()}
        {/* Light helper visualization when selected */}
        {isSelected && (
          <mesh position={sceneObj.position} onClick={handleClick} userData={{ sceneObjectId: sceneObj.id }}>
            <sphereGeometry args={[0.3]} />
            <meshBasicMaterial color={sceneObj.color} transparent opacity={0.6} />
          </mesh>
        )}
        {/* Always visible light helper (smaller) */}
        <mesh position={sceneObj.position} onClick={handleClick} userData={{ sceneObjectId: sceneObj.id }}>
          <sphereGeometry args={[0.15]} />
          <meshBasicMaterial color={sceneObj.color} />
        </mesh>
      </group>
    )
  }

  // Handle camera objects
  if (sceneObj.type === 'camera') {
    if (!sceneObj.visible) return null

    return (
      <group>
        {/* Camera helper visualization */}
        <mesh 
          ref={meshRef}
          position={sceneObj.position} 
          rotation={sceneObj.rotation}
          onClick={handleClick}
          userData={{ sceneObjectId: sceneObj.id }}
        >
          <boxGeometry args={[0.5, 0.3, 0.8]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        {/* Camera outline when selected */}
        {isSelected && meshRef.current && (
          <SimpleEdgeOutline 
            object={meshRef.current} 
            isSelected={true} 
          />
        )}
      </group>
    )
  }
  
  // Handle mesh objects
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
    <group>
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
          color={sceneObj.material?.color || '#orange'}
          roughness={sceneObj.material?.roughness || 0.5}
          metalness={sceneObj.material?.metalness || 0}
        />
      </mesh>
      {/* Render outline when selected */}
      {isSelected && meshRef.current && (
        <SimpleEdgeOutline 
          object={meshRef.current} 
          isSelected={true} 
        />
      )}
    </group>
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
      showSplash={false} // Disable brand splash for fastest loading
      showProjectSelection={true} // Enable project selection splash
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
          {/* Immediate ambient light to prevent initial darkness */}
          <ambientLight intensity={0.4} color="#404040" />
          
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