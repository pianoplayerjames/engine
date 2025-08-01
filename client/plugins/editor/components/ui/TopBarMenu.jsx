import React, { useState, useEffect } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from "@/store.js";
import { autoSaveManager } from '@/plugins/core/AutoSaveManager.js';
import { projectManager } from '@/plugins/projects/projectManager.js';
import ProjectManager from '@/plugins/projects/components/ProjectManager.jsx';

function TopBarMenu() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSyncTooltip, setShowSyncTooltip] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [selectedTool, setSelectedTool] = useState('select');
  const [flashingTool, setFlashingTool] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const { ui, selection } = useSnapshot(editorState);
  const { transformMode } = selection;
  const { setTransformMode } = editorActions;
  const currentProject = projectManager.getCurrentProject();

  const handleSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      await autoSaveManager.saveNow();
      editorActions.addConsoleMessage('Project saved successfully', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      editorActions.addConsoleMessage('Failed to save project', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Project sync status logic (moved from ProjectIndicator)
  useEffect(() => {
    const storedProject = projectManager.getCurrentProjectFromStorage()
    if (storedProject?.lastAccessed) {
      setLastSync(new Date(storedProject.lastAccessed))
    }
  }, []);

  useEffect(() => {
    const checkUnsavedChanges = () => {
      setHasUnsavedChanges(autoSaveManager.hasUnsavedChanges())
    }

    checkUnsavedChanges()
    const interval = setInterval(checkUnsavedChanges, 1000)
    return () => clearInterval(interval)
  }, []);

  const formatLastSync = (date) => {
    if (!date) return 'Never synced'
    
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getSyncStatusInfo = () => {
    if (hasUnsavedChanges) {
      return {
        color: 'bg-yellow-500',
        tooltip: 'Unsaved changes - will auto-save soon'
      }
    }
    return {
      color: 'bg-green-500',
      tooltip: `Last sync: ${formatLastSync(lastSync)}`
    }
  }

  // Tool definitions from the old vertical toolbar
  const tools = [
    { id: 'select', icon: Icons.MousePointer || Icons.Select, title: 'Select' },
    { id: 'move', icon: Icons.Move, title: 'Move' },
    { id: 'rotate', icon: Icons.RotateCcw, title: 'Rotate' },
    { id: 'scale', icon: Icons.Maximize, title: 'Scale' },
    { divider: true },
    { id: 'camera', icon: Icons.Camera, title: 'Camera' },
    { id: 'paint', icon: Icons.Paintbrush2 || Icons.Paint, title: 'Paint' },
    { divider: true },
    { id: 'undo', icon: Icons.Undo, title: 'Undo' },
    { id: 'redo', icon: Icons.Redo, title: 'Redo' },
  ];

  // Get effective selected tool (matches the old logic)
  const getEffectiveSelectedTool = () => {
    if (['select', 'move', 'rotate', 'scale'].includes(transformMode)) {
      return transformMode;
    }
    return selectedTool;
  };

  const handleToolSelect = (toolId) => {
    if (toolId === 'undo' || toolId === 'redo') {
      // Flash effect for action buttons
      setFlashingTool(toolId);
      setTimeout(() => setFlashingTool(null), 200);
      console.log(`${toolId} action triggered`);
    } else {
      setSelectedTool(toolId);
      setTransformMode(toolId);
    }
  };

  const menuStructure = {
    File: [
      { id: 'new', label: 'New Project', icon: Icons.Plus },
      { id: 'open', label: 'Open Project', icon: Icons.Folder },
      { id: 'save', label: 'Save Project', icon: Icons.Save, action: handleSave },
      { id: 'save-as', label: 'Save As...', icon: Icons.Save },
      { divider: true },
      { id: 'import', label: 'Import', icon: Icons.Upload },
      { id: 'export', label: 'Export', icon: Icons.Download },
      { divider: true },
      { id: 'recent', label: 'Recent Projects', icon: Icons.Clock },
    ],
    Edit: [
      { id: 'undo', label: 'Undo', icon: Icons.Undo },
      { id: 'redo', label: 'Redo', icon: Icons.Redo },
      { divider: true },
      { id: 'cut', label: 'Cut', icon: Icons.Scissors },
      { id: 'copy', label: 'Copy', icon: Icons.Copy },
      { id: 'paste', label: 'Paste', icon: Icons.Clipboard },
      { id: 'duplicate', label: 'Duplicate', icon: Icons.Copy },
      { id: 'delete', label: 'Delete', icon: Icons.Trash },
      { divider: true },
      { id: 'select-all', label: 'Select All' },
    ],
    View: [
      { id: 'wireframe', label: 'Wireframe Mode' },
      { id: 'solid', label: 'Solid Mode' },
      { id: 'material', label: 'Material Preview' },
      { id: 'rendered', label: 'Rendered Mode' },
      { divider: true },
      { id: 'grid', label: 'Show Grid' },
      { id: 'axes', label: 'Show Axes' },
      { id: 'statistics', label: 'Show Statistics' },
      { divider: true },
      { id: 'fullscreen', label: 'Fullscreen' },
    ],
    Tools: [
      { id: 'select', label: 'Select Tool', icon: Icons.MousePointer },
      { id: 'move', label: 'Move Tool', icon: Icons.Move },
      { id: 'rotate', label: 'Rotate Tool', icon: Icons.RotateCcw },
      { id: 'scale', label: 'Scale Tool', icon: Icons.Maximize },
      { divider: true },
      { id: 'subdivision', label: 'Subdivision Surface', icon: Icons.Grid3x3 },
      { id: 'mirror', label: 'Mirror Modifier', icon: Icons.Copy },
      { divider: true },
      { id: 'camera', label: 'Camera Tool', icon: Icons.Camera },
      { id: 'light', label: 'Light Tool', icon: Icons.Sun },
      { id: 'mesh', label: 'Add Mesh', icon: Icons.Square },
    ],
    Window: [
      { id: 'scene-panel', label: 'Scene Panel' },
      { id: 'properties-panel', label: 'Properties Panel' },
      { id: 'assets-panel', label: 'Assets Panel' },
      { id: 'console-panel', label: 'Console Panel' },
      { divider: true },
      { id: 'settings', label: 'Settings', icon: Icons.Cog },
      { id: 'reset-layout', label: 'Reset Layout' },
    ],
  };

  const handleMenuClick = (menuName, event) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
      setMenuPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        left: rect.left,
        top: rect.bottom + 1
      });
      setActiveMenu(menuName);
    }
  };

  const handleItemClick = (item) => {
    setActiveMenu(null);
    setMenuPosition(null);
    if (item.action) {
      item.action();
    } else if (['new', 'open', 'export'].includes(item.id)) {
      setShowProjectManager(true);
    } else if (item.id === 'subdivision') {
      // Handle subdivision surface
      editorActions.addConsoleMessage('Subdivision Surface applied to selected object', 'success');
    } else if (item.id === 'mirror') {
      // Handle mirror modifier
      editorActions.addConsoleMessage('Mirror Modifier applied to selected object', 'success');
    } else if (item.id === 'settings') {
      // Handle settings
      editorActions.addConsoleMessage('Settings functionality removed', 'info');
    } else {
      console.log('Menu item clicked:', item.id);
      editorActions.addConsoleMessage(`Menu action: ${item.label}`, 'info');
    }
  };


  return (
    <>
      {/* Top Bar Menu */}
      <div className="relative w-full h-8 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 flex items-center px-2">
        {Object.entries(menuStructure).map(([menuName, items]) => (
          <div key={menuName} className="relative">
            <button
              onClick={(e) => handleMenuClick(menuName, e)}
              onMouseEnter={(e) => {
                console.log('Hovering over:', menuName, 'Active menu:', activeMenu);
                // If any menu is open, switch to this menu on hover
                if (activeMenu && activeMenu !== menuName) {
                  console.log('Switching menu from', activeMenu, 'to', menuName);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuPosition({
                    left: rect.left,
                    top: rect.bottom + 1
                  });
                  setActiveMenu(menuName);
                }
              }}
              className={`px-3 py-1 text-sm text-gray-300 hover:bg-gray-700/50 rounded transition-colors ${
                activeMenu === menuName ? 'bg-gray-700/50' : ''
              }`}
            >
              {menuName}
            </button>

          </div>
        ))}
        
        {/* Right side info */}
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {/* Project sync status */}
          {currentProject.name && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">{currentProject.name}</span>
              <div 
                className={`w-1.5 h-1.5 ${getSyncStatusInfo().color} rounded-full cursor-pointer relative`}
                onMouseEnter={() => setShowSyncTooltip(true)}
                onMouseLeave={() => setShowSyncTooltip(false)}
              >
                {showSyncTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900/95 text-white text-xs rounded whitespace-nowrap z-[120]">
                    {getSyncStatusInfo().tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Engine version */}
          <div>
            Renzora Engine v1.0.0
          </div>
        </div>
      </div>
      
      {/* Fixed Position Dropdown - Outside container hierarchy */}
      {activeMenu && menuPosition && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[100]"
            onClick={() => {
              setActiveMenu(null);
              setMenuPosition(null);
            }}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Menu Panel */}
          <div 
            className="fixed w-64 bg-gradient-to-br from-gray-900/98 to-gray-950/98 backdrop-blur-sm rounded-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4)] overflow-hidden z-[110] border border-gray-700/50"
            style={{
              left: menuPosition.left,
              top: menuPosition.top
            }}
          >
            <div className="p-1.5">
              {menuStructure[activeMenu]?.map((item, index) => (
                item.divider ? (
                  <div key={index} className="border-t border-gray-700/50 my-2 mx-2" />
                ) : (
                  <button
                    key={item.id}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gradient-to-r hover:from-blue-600/90 hover:to-blue-500/90 hover:text-white flex items-center justify-between transition-all duration-150 group relative rounded-md hover:shadow-lg"
                    onClick={() => handleItemClick(item)}
                    title={item.label}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <span className="w-5 h-5 flex items-center justify-center text-gray-400 group-hover:text-white">
                          {item.id === 'save' && isSaving ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <item.icon className="w-4.5 h-4.5" />
                          )}
                        </span>
                      )}
                      <span className="font-normal">
                        {item.id === 'save' && isSaving ? 'Saving...' : item.label}
                      </span>
                    </div>
                  </button>
                )
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          onProjectLoad={(name, path) => {
            console.log(`Project loaded: ${name} at ${path}`)
            editorActions.addConsoleMessage(`Project "${name}" loaded successfully`, 'success')
          }}
          onClose={() => setShowProjectManager(false)}
        />
      )}
      
    </>
  );
}

export default TopBarMenu;