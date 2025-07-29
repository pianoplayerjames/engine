import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';
import ProjectManager from '@/plugins/projects/components/ProjectManager.jsx';

function HorizontalToolbar() {
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [flashingTool, setFlashingTool] = useState(null);
  const { selection, ui } = useSnapshot(editorState);
  const { selectedTool } = ui;
  const { transformMode } = selection;
  const { setSelectedTool, setTransformMode } = editorActions;

  // All tools in one flat array - no categories
  const tools = [
    // Project tools
    { id: 'new', icon: Icons.Plus, tooltip: 'New Project', shortcut: 'Ctrl+N' },
    { id: 'open', icon: Icons.Folder, tooltip: 'Open Project', shortcut: 'Ctrl+O' },
    { id: 'save', icon: Icons.Save, tooltip: 'Save Project', shortcut: 'Ctrl+S' },
    
    // Transform tools
    { id: 'select', icon: Icons.MousePointer, tooltip: 'Select', shortcut: 'V' },
    { id: 'move', icon: Icons.Move, tooltip: 'Move', shortcut: 'G' },
    { id: 'rotate', icon: Icons.RotateCcw, tooltip: 'Rotate', shortcut: 'R' },
    { id: 'scale', icon: Icons.Maximize, tooltip: 'Scale', shortcut: 'S' },
    
    // Create tools
    { id: 'cube', icon: Icons.Square, tooltip: 'Add Cube' },
    { id: 'sphere', icon: Icons.Circle, tooltip: 'Add Sphere' },
    { id: 'cylinder', icon: Icons.Cylinder, tooltip: 'Add Cylinder' },
    { id: 'light', icon: Icons.Sun, tooltip: 'Add Light' },
    { id: 'camera', icon: Icons.Camera, tooltip: 'Add Camera' },
    
    // Edit tools
    { id: 'duplicate', icon: Icons.Copy, tooltip: 'Duplicate', shortcut: 'Ctrl+D' },
    { id: 'delete', icon: Icons.Trash, tooltip: 'Delete', shortcut: 'Del' },
    { id: 'undo', icon: Icons.Undo, tooltip: 'Undo', shortcut: 'Ctrl+Z' },
    { id: 'redo', icon: Icons.Redo, tooltip: 'Redo', shortcut: 'Ctrl+Y' },
    
    // Paint/sculpt tools
    { id: 'paint', icon: Icons.Paintbrush2, tooltip: 'Paint' },
  ];

  // Get effective selected tool (matches the old logic)
  const getEffectiveSelectedTool = () => {
    if (['select', 'move', 'rotate', 'scale'].includes(transformMode)) {
      return transformMode;
    }
    return selectedTool;
  };

  const handleToolClick = (toolId) => {
    console.log('Tool clicked:', toolId);
    
    // Handle project tools
    if (['new', 'open', 'save'].includes(toolId)) {
      if (toolId === 'save') {
        // Handle save directly
        editorActions.addConsoleMessage('Project saved', 'success');
      } else {
        setShowProjectManager(true);
      }
    }
    // Handle transform tools
    else if (['select', 'move', 'rotate', 'scale'].includes(toolId)) {
      setTransformMode(toolId);
      setSelectedTool(toolId);
    }
    // Handle create tools
    else if (['cube', 'sphere', 'cylinder'].includes(toolId)) {
      editorActions.addSceneObject({
        type: 'mesh',
        geometry: toolId === 'cube' ? 'box' : toolId,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
      });
      editorActions.addConsoleMessage(`Created ${toolId}`, 'success');
    }
    else if (toolId === 'light') {
      editorActions.addSceneObject({
        type: 'light',
        lightType: 'directional',
        position: [5, 5, 5],
        rotation: [-Math.PI / 4, Math.PI / 4, 0],
        color: '#ffffff',
        intensity: 1,
        visible: true,
        castShadow: true,
      });
      editorActions.addConsoleMessage('Created directional light', 'success');
    }
    else if (toolId === 'camera') {
      editorActions.addSceneObject({
        type: 'camera',
        position: [0, 0, 5],
        rotation: [0, 0, 0],
        fov: 75,
        near: 0.1,
        far: 1000,
        visible: true,
      });
      editorActions.addConsoleMessage('Created camera', 'success');
    }
    // Handle action tools (undo/redo)
    else if (['undo', 'redo'].includes(toolId)) {
      setFlashingTool(toolId);
      setTimeout(() => setFlashingTool(null), 200);
      editorActions.addConsoleMessage(`${toolId} action triggered`, 'info');
    }
    // Handle other tools
    else {
      editorActions.addConsoleMessage(`Tool activated: ${toolId}`, 'info');
    }
  };

  return (
    <>
      <div className="relative w-full h-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 flex items-center">
        <div className="flex items-center h-full w-full px-4 gap-1">
          
          {/* All Tools in One Line */}
          {tools.map((tool) => {
            const effectiveSelectedTool = getEffectiveSelectedTool();
            const isActive = (effectiveSelectedTool === tool.id && !['undo', 'redo', 'new', 'open', 'save'].includes(tool.id)) || flashingTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-all relative group ${
                  isActive
                    ? 'bg-blue-600/90 text-white' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800'
                }`}
                title={tool.tooltip}
              >
                <tool.icon className="w-4 h-4" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {tool.tooltip}
                  {tool.shortcut && (
                    <span className="ml-2 text-gray-400">({tool.shortcut})</span>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
                </div>
              </button>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side quick actions */}
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-slate-800 rounded transition-colors"
              onClick={() => editorActions.addConsoleMessage('Grid toggled', 'info')}
            >
              Grid
            </button>
            <button
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-slate-800 rounded transition-colors"
              onClick={() => editorActions.addConsoleMessage('Snap toggled', 'info')}
            >
              Snap
            </button>
          </div>
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

export default HorizontalToolbar;