import React, { useRef, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';
import { Icons } from '@/plugins/editor/components/Icons';

// Import viewport components
import ViewportTabs from '@/plugins/editor/components/ui/ViewportTabs.jsx';
import MaterialEditor from './MaterialEditor.jsx';
import NodeEditor from './NodeEditor.jsx';
import AnimationEditor from './AnimationEditor.jsx';
import TextEditor from './TextEditor.jsx';
import DAWEditor from './DAWEditor.jsx';
import VideoEditor from './VideoEditor.jsx';
import PhotoEditor from './PhotoEditor.jsx';
import ModelPreview from './ModelPreview.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';

// Import 3D viewport components
import RenderPlugin from '@/plugins/render/index.jsx';
import ModelObject from '@/components/ModelObject.jsx';
import { SimpleEdgeOutline } from '@/components/SelectionOutline.jsx';
import CameraControls from '@/plugins/editor/components/camera/CameraControls.jsx';

// Suspension-aware 3D viewport wrapper
const Suspended3DViewport = ({ tab, contextMenuHandler, showGrid }) => {
  const { viewport } = useSnapshot(editorState);
  const { suspendedTabs } = viewport;
  
  useEffect(() => {
    // Control performance monitoring based on suspension state
    const isSuspended = suspendedTabs.has(tab.id);
    if (window.renderPerformanceMonitoring) {
      if (isSuspended) {
        window.renderPerformanceMonitoring.stop();
      } else {
        window.renderPerformanceMonitoring.start();
      }
    }
    
    return () => {
      // Cleanup when component unmounts
      if (window.renderPerformanceMonitoring) {
        window.renderPerformanceMonitoring.stop();
      }
    };
  }, [suspendedTabs, tab.id]);
  
  return (
    <RenderPlugin 
      embedded={true} 
      onContextMenu={contextMenuHandler} 
      style={{ width: '100%', height: '100%' }}
    >
      {/* Camera Controls */}
      <CameraControls />
      
      {/* Immediate ambient light to prevent initial darkness */}
      <ambientLight intensity={0.4} color="#404040" />
      
      {/* Render the tab-specific scene objects */}
      <TabSceneRenderer sceneObjects={tab.data?.sceneObjects || []} />
      
      {/* Grid - only show if enabled */}
      {showGrid && (
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      )}
    </RenderPlugin>
  );
};

// 3D Scene Object Component
function SceneObject({ sceneObj, renderMode = 'solid' }) {
  const meshRef = useRef()
  const { selection } = useSnapshot(editorState)
  const { entity: selectedObject } = selection
  const { setSelectedEntity, setTransformMode } = editorActions
  
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

  // Don't render folder objects - they're only for organization
  if (sceneObj.type === 'folder') {
    return null
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
        {renderMode === 'wireframe' ? (
          <meshBasicMaterial 
            color={sceneObj.material?.color || '#orange'}
            wireframe={true}
          />
        ) : renderMode === 'solid' ? (
          <meshBasicMaterial 
            color={sceneObj.material?.color || '#orange'}
          />
        ) : (
          <meshStandardMaterial 
            color={sceneObj.material?.color || '#orange'}
            roughness={sceneObj.material?.roughness || 0.5}
            metalness={sceneObj.material?.metalness || 0}
          />
        )}
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

// Scene renderer component that uses tab-specific data
function TabSceneRenderer({ sceneObjects }) {
  const { selection, viewport } = useSnapshot(editorState);
  const { renderMode } = viewport;
  
  if (!sceneObjects || !Array.isArray(sceneObjects)) {
    return null;
  }
  
  return (
    <>
      {sceneObjects.map(obj => (
        <SceneObject key={obj.id} sceneObj={obj} renderMode={renderMode} />
      ))}
    </>
  );
}

const ViewportContainer = ({ 
  SceneRenderer, 
  onContextMenu, 
  contextMenuHandler, 
  showGrid 
}) => {
  const { viewport } = useSnapshot(editorState);
  const { tabs, activeTabId, suspendedTabs } = viewport;
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const isActiveTabSuspended = suspendedTabs.has(activeTabId);

  const renderSuspendedPlaceholder = (tab) => (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
          <Icons.Pause className="w-8 h-8 text-gray-500" />
        </div>
        <div className="text-lg text-gray-400 mb-2">Tab Suspended</div>
        <div className="text-sm text-gray-500 mb-4">"{tab.name}" is suspended to save resources</div>
        <button
          onClick={() => editorActions.resumeTab(tab.id)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Resume Tab
        </button>
      </div>
    </div>
  );

  const renderViewport = (tab) => {
    if (!tab) return null;
    
    // Show suspended placeholder if tab is suspended
    if (suspendedTabs.has(tab.id)) {
      return renderSuspendedPlaceholder(tab);
    }
    
    switch (tab.type) {
      case '3d-viewport':
        return (
          <Suspended3DViewport 
            tab={tab}
            contextMenuHandler={contextMenuHandler}
            showGrid={showGrid}
          />
        );
        
      case 'material-editor':
        return <MaterialEditor />;
        
      case 'node-editor':
        return <NodeEditor />;
        
      case 'animation-editor':
        return <AnimationEditor />;
        
      case 'text-editor':
        return <TextEditor />;
        
      case 'daw-editor':
        return <DAWEditor />;
        
      case 'video-editor':
        return <VideoEditor />;
        
      case 'photo-editor':
        return <PhotoEditor />;
        
      case 'model-preview':
        return (
          <ErrorBoundary>
            <ModelPreview />
          </ErrorBoundary>
        );
        
      default:
        return (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg text-gray-400 mb-2">Unknown Viewport</div>
              <div className="text-sm text-gray-500">Viewport type "{tab.type}" not found</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      {/* Viewport Tabs */}
      <ViewportTabs />
      
      {/* Viewport Content */}
      <div 
        className="flex-1 relative overflow-hidden"
        onContextMenu={onContextMenu}
      >
        {renderViewport(activeTab)}
      </div>
    </div>
  );
};

export default ViewportContainer;