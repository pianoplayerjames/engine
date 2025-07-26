// plugins/editor/index.jsx
import React, { useState, useEffect } from 'react';
import TopLeftMenu from './components/TopLeftMenu';
import VerticalToolMenu from './components/VerticalToolMenu';
import Toolbar from './components/Toolbar';
import ScenePanel from './components/ScenePanel';
import AssetLibrary from './components/AssetLibrary';
import BottomTabs from './components/BottomTabs';
import NodeEditor from './components/NodeEditor';

function EditorPlugin() {
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedRightTool, setSelectedRightTool] = useState('scene');
  const [selectedObject, setSelectedObject] = useState(null);
  const [activeTab, setActiveTab] = useState('assets');
  const [isAssetPanelOpen, setIsAssetPanelOpen] = useState(true);
  const [isScenePanelOpen, setIsScenePanelOpen] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(256); // Default height
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(304); // 256 + 48 for toolbar
  const [isResizingRight, setIsResizingRight] = useState(false);

  const handleBottomResizeMouseDown = (e) => {
    setIsResizingBottom(true);
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
      const constrainedHeight = Math.max(100, Math.min(maxHeight, newHeight));
      setBottomPanelHeight(constrainedHeight);
    }
  };

  const handleBottomResizeMouseUp = () => {
    setIsResizingBottom(false);
    document.body.classList.remove('dragging-vertical');
  };

  const handleRightResizeMouseDown = (e) => {
    setIsResizingRight(true);
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
    <div className="fixed inset-0 pointer-events-none z-10">
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
          isResizingRight ? '' : 'transition-all duration-200'
        }`}
        style={{ 
          width: isScenePanelOpen ? rightPanelWidth : 48,
          height: '100vh'
        }}
      >
        {/* Resize Handle - always visible */}
        <div
          className={`absolute top-0 w-0.5 resize-handle ${isResizingRight ? 'dragging' : ''}`}
          style={{ 
            left: isScenePanelOpen ? '2px' : '-2px',
            bottom: isAssetPanelOpen ? bottomPanelHeight : '40px',
            zIndex: isScenePanelOpen ? 5 : 1
          }}
          onMouseDown={handleRightResizeMouseDown}
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
              onObjectSelect={setSelectedObject}
              isOpen={isScenePanelOpen}
              onToggle={() => {
                setIsScenePanelOpen(!isScenePanelOpen);
                if (isScenePanelOpen) {
                  setSelectedRightTool('select'); // Reset to default tool when closing
                }
              }}
              selectedTool={selectedRightTool}
              onToolSelect={setSelectedRightTool}
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
      
      {/* Bottom Panel with Resizing */}
      <div 
        className={`absolute bottom-0 left-0 pointer-events-auto no-select z-10 ${
          isResizingRight || isResizingBottom ? '' : 'transition-all duration-200'
        }`}
        style={{ 
          right: isScenePanelOpen ? rightPanelWidth - 3 : 48, // Extend 1px more to eliminate gap
          height: isAssetPanelOpen ? bottomPanelHeight : 'auto' 
        }}
      >
        {/* Resize Handle - always visible */}
        <div
          className={`absolute top-0 left-0 right-0 h-0.5 resize-handle-vertical z-50 ${isResizingBottom ? 'dragging' : ''}`}
          onMouseDown={handleBottomResizeMouseDown}
        />
        
        <BottomTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAssetPanelOpen={isAssetPanelOpen}
          onToggleAssetPanel={() => setIsAssetPanelOpen(!isAssetPanelOpen)}
        />
        
        {isAssetPanelOpen && (
          <div className="flex-1 bg-gray-900 overflow-hidden" style={{ height: bottomPanelHeight - 40 }}>
            {activeTab === 'assets' && <AssetLibrary />}
            {activeTab === 'scripts' && <div className="p-4 text-gray-400 scrollbar-thin overflow-y-auto h-full">Scripts panel coming soon...</div>}
            {activeTab === 'animation' && <div className="p-4 text-gray-400 scrollbar-thin overflow-y-auto h-full">Animation panel coming soon...</div>}
            {activeTab === 'node-editor' && <NodeEditor />}
            {activeTab === 'timeline' && <div className="p-4 text-gray-400 scrollbar-thin overflow-y-auto h-full">Timeline coming soon...</div>}
            {activeTab === 'console' && <div className="p-4 text-gray-400 scrollbar-thin overflow-y-auto h-full">Console coming soon...</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorPlugin;