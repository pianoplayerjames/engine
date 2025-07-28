import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '../store.js';

// Layout components
import { PanelResizer } from '@/plugins/editor/components/layout';
import RightPanel from '@/plugins/editor/components/propertiesPanel/RightPanel';
import BottomPanel from '@/plugins/editor/components/bottomPanel/BottomPanel';
import { PanelToggleButton, ContextMenu } from '@/plugins/editor/components/ui';

// Menu components
import { TopLeftMenu, VerticalToolMenu } from '@/plugins/editor/components/menus';

// Hooks
import { usePanelResize, useKeyboardShortcuts } from '../hooks';
import { useContextMenuActions } from '@/plugins/editor/components/actions/ContextMenuActions';

const EditorLayout = () => {
  const [selectedTool, setSelectedTool] = useState('select');
  const [contextMenu, setContextMenu] = useState(null);
  
  const { selection, ui, panels } = useSnapshot(editorState);
  const { selectedObject } = selection;
  const { selectedTool: selectedRightTool, selectedBottomTab: activeTab, rightPanelWidth, bottomPanelHeight } = ui;
  const { isScenePanelOpen, isAssetPanelOpen } = panels;

  // Get all editor actions
  const {
    setSelectedObject, setContextMenuHandler, setTransformMode,
    setSelectedTool: setSelectedRightTool, setSelectedBottomTab: setActiveTab,
    setIsScenePanelOpen, setIsAssetPanelOpen,
    hydrateFromLocalStorage
  } = editorActions;

  // Custom hooks
  const panelResize = usePanelResize(editorActions);
  const contextMenuActions = useContextMenuActions(editorActions);
  
  // Keyboard shortcuts
  useKeyboardShortcuts(selectedObject, editorActions);

  // Hydrate localStorage values on client mount (after SSR)
  useEffect(() => {
    hydrateFromLocalStorage();
  }, [hydrateFromLocalStorage]);

  // Handle object selection with automatic move gizmo
  const handleObjectSelect = (objectId) => {
    setSelectedObject(objectId);
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
    <div className="fixed inset-0 pointer-events-none z-10" onContextMenu={(e) => handleContextMenu(e, null, 'viewport')}>
      {/* Top Left Menu */}
      <TopLeftMenu />
      
      {/* Vertical Tool Menu (below hamburger menu) */}
      <VerticalToolMenu 
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
      />
      
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
          left: isScenePanelOpen ? '0px' : '-4px',
          top: 0,
          bottom: isAssetPanelOpen ? bottomPanelHeight : '40px',
          right: isScenePanelOpen ? rightPanelWidth - 1 : 47,
          zIndex: isScenePanelOpen ? 5 : 1
        }}
        className="resize-handle"
      />
      
      {/* Toggle button when scene panel is closed */}
      {!isScenePanelOpen && (
        <PanelToggleButton
          onClick={() => setIsScenePanelOpen(true)}
          position={{ right: 47 }}
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
          right: isScenePanelOpen ? rightPanelWidth - 4 : 48,
          bottom: isAssetPanelOpen ? bottomPanelHeight : 40
        }}
      />

      {/* Bottom Panel */}
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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

export default EditorLayout;