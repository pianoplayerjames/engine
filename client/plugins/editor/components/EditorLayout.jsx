import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '../store.js';

// 3D Viewport components
import RenderPlugin from '@/plugins/render/index.jsx';
import ModelObject from '@/components/ModelObject.jsx';
import { SimpleEdgeOutline } from '@/components/SelectionOutline.jsx';
import CameraControls from '@/plugins/editor/components/camera/CameraControls.jsx';

// Layout components
import { PanelResizer } from '@/plugins/editor/components/layout';
import RightPanel from '@/plugins/editor/components/propertiesPanel/RightPanel';
import BottomPanel from '@/plugins/editor/components/bottomPanel/BottomPanel';
import { PanelToggleButton, ContextMenu } from '@/plugins/editor/components/ui';

// Menu components
import TopBarMenu from '@/plugins/editor/components/menus/TopBarMenu.jsx';
import HorizontalToolbar from '@/plugins/editor/components/ui/HorizontalToolbar.jsx';

// Hooks
import { usePanelResize, useKeyboardShortcuts } from '../hooks';
import { useContextMenuActions } from '@/plugins/editor/components/actions/ContextMenuActions';

// 3D Scene Components
function SceneObject({ sceneObj, renderMode = 'solid' }) {
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

function SceneRenderer() {
  const { sceneObjects, viewport } = useSnapshot(editorState)
  const { renderMode } = viewport
  
  return (
    <>
      {sceneObjects.map(obj => (
        <SceneObject key={obj.id} sceneObj={obj} renderMode={renderMode} />
      ))}
    </>
  )
}

const EditorLayout = () => {
  const [contextMenu, setContextMenu] = useState(null);
  
  const { selection, ui, panels, console: consoleState } = useSnapshot(editorState);
  const { entity: selectedObject } = selection;
  const { selectedTool: selectedRightTool, selectedBottomTab: activeTab, rightPanelWidth, bottomPanelHeight } = ui;
  const { isScenePanelOpen, isAssetPanelOpen } = panels;
  const { contextMenuHandler } = consoleState;

  // Calculate viewport bounds for the 3D scene
  const viewportBounds = useMemo(() => ({
    top: 0, // Top navigation is now in separate flex container, so viewport starts at 0
    left: 0,
    right: isScenePanelOpen ? rightPanelWidth - 4 : 0,
    bottom: isAssetPanelOpen ? bottomPanelHeight - 1 : 40
  }), [isScenePanelOpen, rightPanelWidth, isAssetPanelOpen, bottomPanelHeight]);

  // Get all editor actions
  const {
    setSelectedEntity, setContextMenuHandler, setTransformMode,
    setSelectedTool: setSelectedRightTool, setSelectedBottomTab: setActiveTab,
    setIsScenePanelOpen, setIsAssetPanelOpen
  } = editorActions;

  // Custom hooks
  const panelResize = usePanelResize(editorActions);
  const contextMenuActions = useContextMenuActions(editorActions);
  
  // Keyboard shortcuts
  useKeyboardShortcuts(selectedObject, editorActions);

  // State is now automatically restored by AutoSaveManager
  // No manual hydration needed

  // Handle object selection with automatic move gizmo
  const handleObjectSelect = (objectId) => {
    setSelectedEntity(objectId);
    if (objectId) {
      setTransformMode('move');
    }
  };

  const handleContextMenu = (e, item, context = 'scene') => {
    e.preventDefault();
    e.stopPropagation();

    const { clientX: x, clientY: y } = e;
    const menuItems = contextMenuActions.getContextMenuItems(item, context);

    setContextMenu({
      position: { x, y },
      items: menuItems,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Register context menu handler in store
  useEffect(() => {
    setContextMenuHandler(handleContextMenu);
  }, [setContextMenuHandler]);

  // Panel resize handlers with current state
  const handleBottomResize = (e) => {
    panelResize.handleBottomResizeMove(e, { isAssetPanelOpen });
  };

  const handleRightResize = (e) => {
    panelResize.handleRightResizeMove(e, { isScenePanelOpen });
  };

  const handleRightPanelToggle = () => {
    setIsScenePanelOpen(!isScenePanelOpen);
    if (isScenePanelOpen) {
      setSelectedRightTool('select'); // Reset to default tool when closing
    }
  };

  const transitionClass = panelResize.isResizingRight || panelResize.isResizingBottom 
    ? '' 
    : 'transition-all duration-300 ease-in-out';

  return (
    <div className="fixed inset-0 flex flex-col pointer-events-none z-10" onContextMenu={(e) => handleContextMenu(e, null, 'viewport')}>
      {/* Top Navigation Area - Fixed height */}
      <div className="flex-shrink-0 pointer-events-auto z-50">
        {/* Top Bar Menu */}
        <TopBarMenu />
        
        {/* Horizontal Toolbar */}
        <HorizontalToolbar />
      </div>
      
      {/* Main Content Area - Takes remaining space */}
      <div className="flex-1 relative overflow-hidden pointer-events-auto">
        {/* 3D Viewport - Constrained to avoid panels */}
        <div 
          className="absolute pointer-events-auto"
          style={{
            top: 0,
            left: 0,
            right: isScenePanelOpen ? rightPanelWidth - 4 : 0, // No left spacing needed
            bottom: isAssetPanelOpen ? bottomPanelHeight - 1 : 40 // Account for bottom panel tabs
          }}
        >
          <RenderPlugin 
            embedded={true} 
            onContextMenu={contextMenuHandler} 
            style={{ width: '100%', height: '100%' }}
          >
            {/* Camera Controls */}
            <CameraControls />
            
            {/* Immediate ambient light to prevent initial darkness */}
            <ambientLight intensity={0.4} color="#404040" />
            
            <SceneRenderer />
            
            {/* Grid - only show if enabled */}
            {editorState.viewport.showGrid && (
              <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
            )}
          </RenderPlugin>
        </div>
        
        
        {/* Right Panel Container */}
        <RightPanel
        isScenePanelOpen={isScenePanelOpen}
        rightPanelWidth={rightPanelWidth}
        bottomPanelHeight={bottomPanelHeight}
        isAssetPanelOpen={isAssetPanelOpen}
        selectedRightTool={selectedRightTool}
        selectedObject={selectedObject}
        onToolSelect={setSelectedRightTool}
        onScenePanelToggle={handleRightPanelToggle}
        onObjectSelect={handleObjectSelect}
        onContextMenu={handleContextMenu}
        style={{ className: transitionClass }}
      />

      {/* Right Panel Resize Handle */}
      <PanelResizer
        type="right"
        isResizing={panelResize.isResizingRight}
        onResizeStart={panelResize.handleRightResizeStart}
        onResizeEnd={panelResize.handleRightResizeEnd}
        onResize={handleRightResize}
        position={{
          right: isScenePanelOpen ? rightPanelWidth - 4 : 0,
          top: 0,
          bottom: isAssetPanelOpen ? bottomPanelHeight : '40px',
          zIndex: 30
        }}
        className="resize-handle"
      />
      
      {/* Toggle button when scene panel is closed */}
      {!isScenePanelOpen && (
        <PanelToggleButton
          onClick={() => setIsScenePanelOpen(true)}
          position={{ right: 0 }}
        />
      )}
      
      {/* Bottom Panel Resize Handle */}
      <PanelResizer
        type="bottom"
        isResizing={panelResize.isResizingBottom}
        onResizeStart={panelResize.handleBottomResizeStart}
        onResizeEnd={panelResize.handleBottomResizeEnd}
        onResize={handleBottomResize}
        position={{
          left: 0,
          right: isScenePanelOpen ? rightPanelWidth - 4 : 0,
          bottom: isAssetPanelOpen ? bottomPanelHeight : 40
        }}
      />

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            items={contextMenu.items}
            position={contextMenu.position}
            onClose={closeContextMenu}
          />
        )}
      </div>
      
      {/* Bottom Panel - Outside main content area to position relative to viewport */}
      <BottomPanel
        activeTab={activeTab}
        isAssetPanelOpen={isAssetPanelOpen}
        bottomPanelHeight={bottomPanelHeight}
        rightPanelWidth={rightPanelWidth}
        isScenePanelOpen={isScenePanelOpen}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          if (!isAssetPanelOpen) {
            setIsAssetPanelOpen(true);
          }
        }}
        onToggleAssetPanel={() => setIsAssetPanelOpen(!isAssetPanelOpen)}
        onContextMenu={handleContextMenu}
        style={{ className: transitionClass }}
      />
    </div>
  );
};

export default EditorLayout;