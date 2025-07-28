// plugins/editor/components/TopLeftMenu.jsx
import React, { useState, useEffect } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';
import ProjectManager from '@/plugins/projects/components/ProjectManager.jsx';
import { autoSaveManager } from '@/plugins/core/AutoSaveManager.js';

function TopLeftMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { ui } = useSnapshot(editorState);
  const { topLeftMenuSelected } = ui;
  const { setTopLeftMenuSelected } = editorActions;

  // Manual save function
  const handleSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      console.log('💾 Manual save triggered');
      await autoSaveManager.saveNow();
      editorActions.addConsoleMessage('Project saved successfully', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      editorActions.addConsoleMessage('Failed to save project', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSaving]);

  const menuItems = [
    { id: 'new-project', label: 'New Project', icon: Icons.Plus, shortcut: 'Ctrl+N' },
    { id: 'open-project', label: 'Open Project', icon: Icons.Folder, shortcut: 'Ctrl+O' },
    { id: 'save-project', label: 'Save Project', icon: Icons.Save, shortcut: 'Ctrl+S' },
    { id: 'export-project', label: 'Export Project', icon: Icons.Download, shortcut: 'Ctrl+E' },
    { divider: true },
    { id: 'import', label: 'Import Model', icon: Icons.Upload, shortcut: 'Ctrl+I' },
    { divider: true },
    { id: 'settings', label: 'Settings', icon: Icons.Cog },
    { id: 'help', label: 'Help', icon: Icons.QuestionMark },
  ];

  return (
    <>
      <div className="absolute top-4 left-4 pointer-events-auto z-30 no-select">
        <div className="relative">
          {/* Menu Button - matching your established style */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-10 h-10 bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg shadow-2xl hover:bg-gray-700/50 transition-colors flex items-center justify-center ${
              isOpen ? 'bg-gray-700/50' : ''
            }`}
          >
            <Icons.Menu className="w-5 h-5 text-gray-300" />
          </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Panel with improved styling */}
            <div className="absolute top-full left-0 mt-1 w-56 bg-gradient-to-br from-gray-900/98 to-gray-950/98 backdrop-blur-sm rounded-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),0_10px_10px_-5px_rgba(0,0,0,0.04)] overflow-hidden z-20 border border-gray-700/50">
              <div className="p-1.5">
                {menuItems.map((item, index) => (
                  item.divider ? (
                    <div key={index} className="border-t border-gray-700/50 my-2 mx-2" />
                  ) : (
                    <button
                      key={item.id}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gradient-to-r hover:from-blue-600/90 hover:to-blue-500/90 hover:text-white flex items-center justify-between transition-all duration-150 group relative rounded-md hover:shadow-lg"
                      onClick={() => {
                        setIsOpen(false);
                        setTopLeftMenuSelected(item.id);
                        
                        // Handle project-related menu items
                        if (['new-project', 'open-project', 'export-project'].includes(item.id)) {
                          setShowProjectManager(true);
                        } else if (item.id === 'save-project') {
                          handleSave();
                        } else {
                          console.log('Menu item clicked:', item.id);
                        }
                      }}
                      title={item.label}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white">
                          {item.id === 'save-project' && isSaving ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <item.icon className="w-4.5 h-4.5" />
                          )}
                        </span>
                        <span className="font-normal">
                          {item.id === 'save-project' && isSaving ? 'Saving...' : item.label}
                        </span>
                      </div>
                      {item.shortcut && (
                        <span className="text-xs text-gray-500">{item.shortcut}</span>
                      )}
                    </button>
                  )
                ))}
              </div>
            </div>
          </>
        )}
        </div>
      </div>
      
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

export default TopLeftMenu;