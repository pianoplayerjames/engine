import { useState, useEffect, useMemo, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { globalStore, actions } from '@/store.js';
import StatsMonitor from '@/plugins/core/components/Stats.jsx';
import PanelResizer from '@/plugins/editor/components/ui/PanelResizer.jsx';
import RightPanel from '@/plugins/editor/components/propertiesPanel/RightPanel';
import BottomPanel from '@/plugins/editor/components/bottomPanel/BottomPanel';
import { PanelToggleButton, ContextMenu } from '@/plugins/editor/components/ui';
import TopBarMenu from '@/plugins/editor/components/ui/TopBarMenu.jsx';
import HorizontalToolbar from '@/plugins/editor/components/ui/HorizontalToolbar.jsx';
import ViewportContainer from '@/plugins/editor/components/viewports/ViewportContainer.jsx';
import { usePanelResize } from '@/plugins/editor/hooks/usePanelResize.js';
import { useContextMenuActions } from '@/plugins/editor/components/actions/ContextMenuActions';

const EditorPlugin = () => {
  const [contextMenu, setContextMenu] = useState(null);
  
  const { selection, ui, panels, console: consoleState } = useSnapshot(globalStore.editor);
  const { entity: selectedObject } = selection;
  const { selectedTool: selectedRightTool, selectedBottomTab: activeTab, rightPanelWidth, bottomPanelHeight } = ui;
  const { isScenePanelOpen, isAssetPanelOpen } = panels;
  const { contextMenuHandler } = consoleState;

  const viewportBounds = useMemo(() => ({
    top: 0,
    left: 0,
    right: isScenePanelOpen ? rightPanelWidth - 4 : 0,
    bottom: isAssetPanelOpen ? bottomPanelHeight - 1 : 40
  }), [isScenePanelOpen, rightPanelWidth, isAssetPanelOpen, bottomPanelHeight]);

  const {
    setSelectedEntity, setContextMenuHandler, setTransformMode,
    setSelectedTool: setSelectedRightTool, setSelectedBottomTab: setActiveTab,
    setIsScenePanelOpen, setIsAssetPanelOpen
  } = actions.editor;

  const panelResize = usePanelResize(actions.editor);
  const contextMenuActions = useContextMenuActions(actions.editor);

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

  useEffect(() => {
    setContextMenuHandler(handleContextMenu);
  }, [setContextMenuHandler]);

  const handleBottomResize = (e) => {
    panelResize.handleBottomResizeMove(e, { isAssetPanelOpen });
  };

  const handleRightResize = (e) => {
    panelResize.handleRightResizeMove(e, { isScenePanelOpen });
  };

  const handleRightPanelToggle = () => {
    setIsScenePanelOpen(!isScenePanelOpen);
    if (isScenePanelOpen) {
      setSelectedRightTool('select');
    }
  };

  const transitionClass = panelResize.isResizingRight || panelResize.isResizingBottom 
    ? '' 
    : 'transition-all duration-300 ease-in-out';

  return (
    <div className="fixed inset-0 flex flex-col pointer-events-none z-10" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex-shrink-0 pointer-events-auto z-50">
        <TopBarMenu />
        <HorizontalToolbar />
      </div>
      
      <div className="flex-1 relative overflow-hidden pointer-events-auto">
        <div 
          className="absolute pointer-events-auto"
          style={{
            top: 0,
            left: 0,
            right: isScenePanelOpen ? rightPanelWidth - 4 : 0,
            bottom: isAssetPanelOpen ? bottomPanelHeight - 1 : 40
          }}
        >
          <ViewportContainer 
            onContextMenu={(e) => e.preventDefault()}
            contextMenuHandler={contextMenuHandler}
            showGrid={globalStore.editor.viewport.showGrid}
          />
        </div>
        
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
      
      {!isScenePanelOpen && (
        <PanelToggleButton
          onClick={() => setIsScenePanelOpen(true)}
          position={{ right: rightPanelWidth }}
        />
      )}
      
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

        {contextMenu && (
          <ContextMenu
            items={contextMenu.items}
            position={contextMenu.position}
            onClose={closeContextMenu}
          />
        )}
      </div>
      
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
      
      {/* Stats.js FPS monitor */}
      <StatsMonitor />
    </div>
  );
};

export default EditorPlugin;