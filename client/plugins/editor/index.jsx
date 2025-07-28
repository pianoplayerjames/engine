// plugins/editor/index.jsx
import React, { useState, useEffect } from 'react';
import TopLeftMenu from './components/TopLeftMenu';
import VerticalToolMenu from './components/VerticalToolMenu';
import Toolbar from './components/Toolbar';
import ScenePanel from './components/ScenePanel';
import AssetLibrary from './components/AssetLibrary';
import BottomTabs from './components/BottomTabs';
import NodeEditor from './components/NodeEditor';
import ScriptsPanel from './components/ScriptsPanel';
import AnimationPanel from './components/AnimationPanel';
import TimelinePanel from './components/TimelinePanel';
import ConsolePanel from './components/ConsolePanel';
import MaterialsPanel from './components/MaterialsPanel';
import TerrainPanel from './components/TerrainPanel';
import LightingPanel from './components/LightingPanel';
import PhysicsPanel from './components/PhysicsPanel';
import AudioPanel from './components/AudioPanel';
import EffectsPanel from './components/EffectsPanel';
import ContextMenu from './components/ContextMenu';
import { Icons } from './components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from './store.js';

function EditorPlugin() {
  const [selectedTool, setSelectedTool] = useState('select');
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  
  const { selection, ui, panels } = useSnapshot(editorState);
  const { selectedObject } = selection;
  const { selectedTool: selectedRightTool, selectedBottomTab: activeTab, rightPanelWidth, bottomPanelHeight } = ui;
  const { isScenePanelOpen, isAssetPanelOpen } = panels;
  
  const {
    setSelectedObject, setContextMenuHandler, addSceneObject, removeSceneObject, setTransformMode,
    setSelectedTool: setSelectedRightTool, setSelectedBottomTab: setActiveTab,
    setRightPanelWidth, setBottomPanelHeight,
    setIsScenePanelOpen, setIsAssetPanelOpen, setIsResizingPanels,
    hydrateFromLocalStorage
  } = editorActions;

  // Hydrate localStorage values on client mount (after SSR)
  useEffect(() => {
    hydrateFromLocalStorage();
  }, [hydrateFromLocalStorage]);

  // Register context menu handler in store (after all functions are defined)
  useEffect(() => {
    setContextMenuHandler(handleContextMenu);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected object when Delete key is pressed
      if (e.key === 'Delete' && selectedObject) {
        removeSceneObject(selectedObject);
        setSelectedObject(null);
        setTransformMode('select');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedObject]);

  // Handle object selection with automatic move gizmo
  const handleObjectSelect = (objectId) => {
    setSelectedObject(objectId);
    if (objectId) {
      setTransformMode('move');
    }
  };

  const getContextMenuItems = (item, context) => {
    if (item) {
      // Scene object context menu - different items based on object type
      const baseItems = [
        { label: 'Rename', action: () => handleRename(item.id), icon: <Icons.Pencil className="w-4 h-4" />, shortcut: 'F2' },
        { separator: true },
        { label: 'Copy', action: () => handleCopy(item.id), icon: <Icons.Copy className="w-4 h-4" />, shortcut: 'Ctrl+C' },
        { label: 'Duplicate', action: () => handleDuplicate(item.id), icon: <Icons.DocumentDuplicate className="w-4 h-4" />, shortcut: 'Ctrl+D' },
        { label: 'Delete', action: () => handleDelete(item.id), icon: <Icons.Trash className="w-4 h-4" />, shortcut: 'Del' },
        { separator: true },
      ];

      // Type-specific menu items
      const typeSpecificItems = [];
      
      if (item.type === 'model' || item.type === 'mesh') {
        typeSpecificItems.push(
          { label: 'Add Material', action: () => handleAddMaterial(item.id), icon: <Icons.Cube className="w-4 h-4" /> },
          { label: 'Add Script', action: () => handleAddScript(item.id), icon: <Icons.CodeBracket className="w-4 h-4" /> },
          { label: 'Add Physics', action: () => handleAddPhysics(item.id), icon: <Icons.Lightning className="w-4 h-4" /> },
        );
      }

      if (item.type === 'terrain') {
        typeSpecificItems.push(
          { label: 'Edit Terrain', action: () => handleEditTerrain(item.id), icon: <Icons.Mountain className="w-4 h-4" /> },
          { label: 'Paint Texture', action: () => handlePaintTexture(item.id), icon: <Icons.PaintBrush className="w-4 h-4" /> },
        );
      }

      const colorItems = [
        { separator: true },
        { label: 'Color Code', action: () => {}, icon: <Icons.ColorSwatch className="w-4 h-4" />, submenu: [
          { label: 'Red', action: () => handleColorCode(item.id, 'red'), color: '#ef4444' },
          { label: 'Orange', action: () => handleColorCode(item.id, 'orange'), color: '#f97316' },
          { label: 'Yellow', action: () => handleColorCode(item.id, 'yellow'), color: '#eab308' },
          { label: 'Green', action: () => handleColorCode(item.id, 'green'), color: '#22c55e' },
          { label: 'Blue', action: () => handleColorCode(item.id, 'blue'), color: '#3b82f6' },
          { label: 'Purple', action: () => handleColorCode(item.id, 'purple'), color: '#a855f7' },
          { label: 'Clear', action: () => handleColorCode(item.id, null), icon: <Icons.XMark className="w-3 h-3" /> },
        ]},
      ];

      return [...baseItems, ...typeSpecificItems, ...colorItems];
    } else {
      // General context menu for empty space
      const baseGeneralItems = [
        { label: 'Create Object', action: () => {}, icon: <Icons.PlusCircle className="w-4 h-4" />, submenu: [
          { label: 'Cube', action: () => handleCreateObject('cube'), icon: <Icons.Cube className="w-4 h-4" /> },
          { label: 'Sphere', action: () => handleCreateObject('sphere'), icon: <Icons.Circle className="w-4 h-4" /> },
          { label: 'Cylinder', action: () => handleCreateObject('cylinder'), icon: <Icons.Rectangle className="w-4 h-4" /> },
          { label: 'Plane', action: () => handleCreateObject('plane'), icon: <Icons.Square2Stack className="w-4 h-4" /> },
          { separator: true },
          { label: 'Light', action: () => handleCreateObject('light'), icon: <Icons.LightBulb className="w-4 h-4" /> },
          { label: 'Camera', action: () => handleCreateObject('camera'), icon: <Icons.Camera className="w-4 h-4" /> },
        ]},
        { separator: true },
        { label: 'Paste', action: () => handlePaste(), icon: <Icons.Clipboard className="w-4 h-4" />, shortcut: 'Ctrl+V' },
        { separator: true },
        { label: 'Undo', action: () => handleUndo(), icon: <Icons.Undo className="w-4 h-4" />, shortcut: 'Ctrl+Z' },
        { label: 'Redo', action: () => handleRedo(), icon: <Icons.Redo className="w-4 h-4" />, shortcut: 'Ctrl+Y' },
      ];

      if (context === 'viewport') {
        // Viewport-specific context menu
        return [
          ...baseGeneralItems,
          { separator: true },
          { label: 'Frame All', action: () => handleFrameAll(), icon: <Icons.ArrowsPointingOut className="w-4 h-4" />, shortcut: 'F' },
          { label: 'Frame Selected', action: () => handleFocusSelected(), icon: <Icons.MagnifyingGlass className="w-4 h-4" />, shortcut: 'Shift+F' },
          { separator: true },
          { label: 'Reset View', action: () => handleResetView(), icon: <Icons.ArrowPath className="w-4 h-4" /> },
          { label: 'Top View', action: () => handleSetView('top'), icon: <Icons.ArrowUp className="w-4 h-4" />, shortcut: 'Numpad 7' },
          { label: 'Front View', action: () => handleSetView('front'), icon: <Icons.ArrowRight className="w-4 h-4" />, shortcut: 'Numpad 1' },
          { label: 'Right View', action: () => handleSetView('right'), icon: <Icons.ArrowDown className="w-4 h-4" />, shortcut: 'Numpad 3' },
        ];
      } else {
        // Scene panel context menu
        return [
          ...baseGeneralItems,
          { separator: true },
          { label: 'Select All', action: () => handleSelectAll(), icon: <Icons.CursorArrowRays className="w-4 h-4" />, shortcut: 'Ctrl+A' },
          { label: 'Expand All', action: () => handleExpandAll(), icon: <Icons.PlusCircle className="w-4 h-4" /> },
          { label: 'Collapse All', action: () => handleCollapseAll(), icon: <Icons.MinusCircle className="w-4 h-4" /> },
        ];
      }
    }
  };

  // Action handlers
  const handleRename = (itemId) => {
    console.log('Rename', itemId);
    // TODO: Implement rename functionality
  };

  const handleCopy = (itemId) => {
    console.log('Copy', itemId);
    // TODO: Implement copy functionality
  };

  const handleDuplicate = (itemId) => {
    console.log('Duplicate', itemId);
    // TODO: Implement duplicate functionality
  };

  const handleDelete = (itemId) => {
    console.log('Delete', itemId);
    removeSceneObject(itemId);
  };

  const handleAddMaterial = (itemId) => {
    console.log('Add Material', itemId);
    setSelectedRightTool('materials');
  };

  const handleAddScript = (itemId) => {
    console.log('Add Script', itemId);
    setActiveTab('scripts');
  };

  const handleAddPhysics = (itemId) => {
    console.log('Add Physics', itemId);
    setSelectedRightTool('physics');
  };

  const handleEditTerrain = (itemId) => {
    console.log('Edit Terrain', itemId);
    setSelectedRightTool('terrain');
  };

  const handlePaintTexture = (itemId) => {
    console.log('Paint Texture', itemId);
    setSelectedTool('paint');
  };

  const handleColorCode = (itemId, color) => {
    console.log('Color Code', itemId, color);
    // TODO: Implement color coding functionality
  };

  const handleCreateObject = (type) => {
    const newObject = {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type: 'mesh',
      position: [Math.random() * 4 - 2, 0, Math.random() * 4 - 2], // Random position
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      geometry: type === 'cube' ? 'box' : type,
      material: { 
        color: `hsl(${Math.random() * 360}, 70%, 50%)` // Random color
      },
      visible: true
    };
    
    const objectWithId = addSceneObject(newObject);
    // Select the newly created object and show move gizmo
    setSelectedObject(objectWithId.id);
    setTransformMode('move');
    
    // Restore focus to canvas after object creation
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.focus();
      }
    }, 100);
  };

  const handlePaste = () => {
    console.log('Paste');
    // TODO: Implement paste functionality
  };

  const handleUndo = () => {
    console.log('Undo');
    // TODO: Implement undo functionality
  };

  const handleRedo = () => {
    console.log('Redo');
    // TODO: Implement redo functionality
  };

  const handleSelectAll = () => {
    console.log('Select All');
    // TODO: Implement select all functionality
  };

  const handleFocusSelected = () => {
    console.log('Focus Selected');
    // TODO: Implement focus selected functionality
  };

  const handleFrameAll = () => {
    console.log('Frame All');
    // TODO: Implement frame all functionality
  };

  const handleResetView = () => {
    console.log('Reset View');
    // TODO: Implement reset view functionality
  };

  const handleSetView = (view) => {
    console.log('Set View', view);
    // TODO: Implement set view functionality
  };

  const handleExpandAll = () => {
    console.log('Expand All');
    // TODO: Implement expand all functionality
  };

  const handleCollapseAll = () => {
    console.log('Collapse All');
    // TODO: Implement collapse all functionality
  };

  const handleContextMenu = (e, item, context = 'scene') => {
    e.preventDefault();
    e.stopPropagation();

    const { clientX: x, clientY: y } = e;
    const menuItems = getContextMenuItems(item, context);

    setContextMenu({
      position: { x, y },
      items: menuItems,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleBottomResizeMouseDown = (e) => {
    setIsResizingBottom(true);
    setIsResizingPanels(true);
    document.body.classList.add('dragging-vertical');
    e.preventDefault();
  };

  const handleBottomResizeMouseMove = (e) => {
    if (!isResizingBottom) return;
    e.preventDefault();
    const newHeight = window.innerHeight - e.clientY;
    const maxHeight = window.innerHeight * 0.85; // Allow up to 85% of viewport height
    const snapThreshold = 80; // Snap to hidden when within 80px of bottom edge
    const openThreshold = 120; // Snap to open when dragged up 120px
    
    if (!isAssetPanelOpen && newHeight > openThreshold) {
      setIsAssetPanelOpen(true);
      setBottomPanelHeight(Math.max(200, newHeight));
    } else if (isAssetPanelOpen && newHeight < snapThreshold) {
      setIsAssetPanelOpen(false);
      setIsResizingBottom(false);
    } else if (isAssetPanelOpen) {
      const constrainedHeight = Math.max(40, Math.min(maxHeight, newHeight));
      setBottomPanelHeight(constrainedHeight);
    }
  };

  const handleBottomResizeMouseUp = () => {
    setIsResizingBottom(false);
    setIsResizingPanels(false);
    document.body.classList.remove('dragging-vertical');
  };

  const handleRightResizeMouseDown = (e) => {
    setIsResizingRight(true);
    setIsResizingPanels(true);
    document.body.classList.add('dragging-horizontal');
    e.preventDefault();
  };

  const handleRightResizeMouseMove = (e) => {
    if (!isResizingRight) return;
    const newWidth = window.innerWidth - e.clientX;
    const snapThreshold = 100; // Snap to hidden when within 100px of edge
    const openThreshold = 150; // Snap to open when dragged left 150px
    
    if (!isScenePanelOpen && newWidth > openThreshold) {
      setIsScenePanelOpen(true);
      setRightPanelWidth(Math.max(200, newWidth));
      setSelectedRightTool('scene'); // Activate scene tab when opening via resize
    } else if (isScenePanelOpen && newWidth < snapThreshold) {
      setIsScenePanelOpen(false);
      setIsResizingRight(false);
      setSelectedRightTool('select'); // Deactivate menu when closing via resize
    } else if (isScenePanelOpen) {
      setRightPanelWidth(Math.max(200, Math.min(600, newWidth)));
    }
  };

  const handleRightResizeMouseUp = () => {
    setIsResizingRight(false);
    setIsResizingPanels(false);
    document.body.classList.remove('dragging-horizontal');
  };

  useEffect(() => {
    if (isResizingBottom) {
      document.addEventListener('mousemove', handleBottomResizeMouseMove);
      document.addEventListener('mouseup', handleBottomResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleBottomResizeMouseMove);
        document.removeEventListener('mouseup', handleBottomResizeMouseUp);
      };
    }
  }, [isResizingBottom]);

  useEffect(() => {
    if (isResizingRight) {
      document.addEventListener('mousemove', handleRightResizeMouseMove);
      document.addEventListener('mouseup', handleRightResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleRightResizeMouseMove);
        document.removeEventListener('mouseup', handleRightResizeMouseUp);
      };
    }
  }, [isResizingRight]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10" onContextMenu={(e) => handleContextMenu(e, null, 'viewport')}>
      {/* Top Left Menu */}
      <TopLeftMenu />
      
      {/* Vertical Tool Menu (below hamburger menu) */}
      <VerticalToolMenu 
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
      />
      
      {/* Right Panels Container with Resize Handle */}
      <div 
        className={`absolute right-0 top-0 bottom-0 pointer-events-auto no-select z-20 ${
          isResizingRight ? '' : 'transition-all duration-300 ease-in-out'
        }`}
        style={{ 
          width: isScenePanelOpen ? rightPanelWidth : 48,
          height: '100vh'
        }}
        suppressHydrationWarning
      >
        {/* Resize Handle - shows on hover */}
        <div
          className={`absolute top-0 w-1 resize-handle cursor-col-resize transition-all duration-200 ${
            isResizingRight ? 'bg-blue-500/75 opacity-100' : 'bg-slate-700/50 opacity-0 hover:opacity-100 hover:bg-blue-500/75'
          }`}
          style={{ 
            left: isScenePanelOpen ? '0px' : '-4px',
            bottom: isAssetPanelOpen ? bottomPanelHeight : '40px',
            zIndex: isScenePanelOpen ? 5 : 1
          }}
          onMouseDown={handleRightResizeMouseDown}
          suppressHydrationWarning
        />
        
        {/* Right Toolbar - positioned within container */}
        <div 
          className={`absolute top-0 bottom-0 w-12 ${isScenePanelOpen ? 'left-1' : 'left-0'}`}
        >
          <Toolbar 
            selectedTool={selectedRightTool}
            onToolSelect={setSelectedRightTool}
            scenePanelOpen={isScenePanelOpen}
            onScenePanelToggle={() => {
              setIsScenePanelOpen(!isScenePanelOpen);
              if (isScenePanelOpen) {
                setSelectedRightTool('select'); // Reset to default tool when closing
              }
            }}
          />
        </div>
        
        {/* Right Scene Panel - positioned within container */}
        {isScenePanelOpen && (
          <div 
            className="absolute left-13 right-0 top-0 bottom-0"
          >
            <ScenePanel 
              selectedObject={selectedObject}
              onObjectSelect={handleObjectSelect}
              isOpen={isScenePanelOpen}
              onToggle={() => {
                setIsScenePanelOpen(!isScenePanelOpen);
                if (isScenePanelOpen) {
                  setSelectedRightTool('select'); // Reset to default tool when closing
                }
              }}
              selectedTool={selectedRightTool}
              onToolSelect={setSelectedRightTool}
              onContextMenu={handleContextMenu}
            />
          </div>
        )}
      </div>
      
      {/* Toggle button when scene panel is closed - positioned outside container */}
      {!isScenePanelOpen && (
        <div 
          className="absolute top-1 w-6 pointer-events-auto z-50"
          style={{ right: 47 }}
        >
          <button
            onClick={() => setIsScenePanelOpen(true)}
            className="w-6 h-8 text-gray-400 hover:text-blue-400 transition-colors flex items-center justify-center"
            style={{ 
              backgroundColor: '#1e293b',
              borderLeft: '1px solid #475569',
              borderTop: '1px solid #475569',
              borderBottom: '1px solid #475569',
              borderTopLeftRadius: '6px',
              borderBottomLeftRadius: '6px'
            }}
          >
            <div className="w-3 h-3 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </div>
          </button>
        </div>
      )}
      
      {/* Bottom Panel Resize Handle - positioned above the tabs */}
      <div
        className={`absolute left-0 pointer-events-auto h-1 z-50 cursor-row-resize ${
          isResizingBottom 
            ? 'bg-blue-500/75 opacity-100 transition-none' 
            : 'bg-slate-700/50 opacity-0 hover:opacity-100 hover:bg-blue-500/75 transition-all duration-200'
        }`}
        style={{ 
          right: isScenePanelOpen ? rightPanelWidth - 4 : 48,
          bottom: isAssetPanelOpen ? bottomPanelHeight : 40
        }}
        onMouseDown={handleBottomResizeMouseDown}
        suppressHydrationWarning
      />

      {/* Bottom Panel with Resizing */}
      <div 
        className={`absolute bottom-0 left-0 pointer-events-auto no-select z-10 ${
          isResizingRight || isResizingBottom ? '' : 'transition-all duration-300 ease-in-out'
        }`}
        style={{ 
          right: isScenePanelOpen ? rightPanelWidth - 4 : 48, // Extend to eliminate gap
          height: isAssetPanelOpen ? bottomPanelHeight : 40
        }}
        suppressHydrationWarning
      >
        <BottomTabs 
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            if (!isAssetPanelOpen) {
              setIsAssetPanelOpen(true);
            }
          }}
          isAssetPanelOpen={isAssetPanelOpen}
          onToggleAssetPanel={() => setIsAssetPanelOpen(!isAssetPanelOpen)}
          rightPanelWidth={rightPanelWidth}
          isScenePanelOpen={isScenePanelOpen}
        />
        
        {isAssetPanelOpen && (
          <div className="flex-1 bg-gray-900 overflow-hidden" style={{ height: bottomPanelHeight - 40 }}>
            {activeTab === 'assets' && <AssetLibrary onContextMenu={handleContextMenu} />}
            {activeTab === 'scripts' && <ScriptsPanel />}
            {activeTab === 'animation' && <AnimationPanel />}
            {activeTab === 'node-editor' && <NodeEditor />}
            {activeTab === 'timeline' && <TimelinePanel />}
            {activeTab === 'console' && <ConsolePanel />}
            {activeTab === 'materials' && <MaterialsPanel />}
            {activeTab === 'terrain' && <TerrainPanel />}
            {activeTab === 'lighting' && <LightingPanel />}
            {activeTab === 'physics' && <PhysicsPanel />}
            {activeTab === 'audio' && <AudioPanel />}
            {activeTab === 'effects' && <EffectsPanel />}
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}

export default EditorPlugin;