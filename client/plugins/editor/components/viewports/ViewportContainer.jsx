import { useRef, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { globalStore, actions } from "@/store.js";
import { Icons } from '@/plugins/editor/components/Icons';

// Import viewport components
import ViewportTabs from '@/plugins/editor/components/ui/ViewportTabs.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';

// Import 3D viewport components
import RenderPlugin from '@/plugins/render/index.jsx';

// Suspension-aware 3D viewport wrapper
const Suspended3DViewport = ({ tab, contextMenuHandler, showGrid }) => {
  const { viewport } = useSnapshot(globalStore.editor);
  const { suspendedTabs } = viewport;
  
  useEffect(() => {
    // Control performance monitoring based on suspension state
    const isSuspended = (suspendedTabs || []).includes(tab.id);
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
    />
  );
};


const ViewportContainer = ({ 
  onContextMenu, 
  contextMenuHandler, 
  showGrid 
}) => {
  const { viewport } = useSnapshot(globalStore.editor);
  const { tabs, activeTabId, suspendedTabs } = viewport;
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const isActiveTabSuspended = (suspendedTabs || []).includes(activeTabId);

  const renderSuspendedPlaceholder = (tab) => (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
          <Icons.Pause className="w-8 h-8 text-gray-500" />
        </div>
        <div className="text-lg text-gray-400 mb-2">Tab Suspended</div>
        <div className="text-sm text-gray-500 mb-4">"{tab.name}" is suspended to save resources</div>
        <button
          onClick={() => actions.editor.resumeTab(tab.id)}
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
    if ((suspendedTabs || []).includes(tab.id)) {
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
        onContextMenu={(e) => e.preventDefault()}
      >
        {renderViewport(activeTab)}
      </div>
    </div>
  );
};

export default ViewportContainer;