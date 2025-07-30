import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';
import ProjectManager from '@/plugins/projects/components/ProjectManager.jsx';

function HorizontalToolbar() {
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [flashingTool, setFlashingTool] = useState(null);
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);
  const cameraRef = useRef(null);
  const { selection, ui, camera, viewport } = useSnapshot(editorState);
  const { selectedTool } = ui;
  const { transformMode } = selection;
  const { setSelectedTool, setTransformMode, setCameraSpeed, setCameraSensitivity, setRenderMode, setGridSnapping, setShowGrid } = editorActions;
  
  // Camera settings
  const cameraSpeed = camera.speed || 5;
  const mouseSensitivity = camera.mouseSensitivity || 0.002;
  const renderMode = viewport.renderMode || 'solid';
  const gridSnapping = viewport.gridSnapping || false;
  const showGrid = viewport.showGrid !== false;
  
  const renderModes = [
    { id: 'wireframe', label: 'Wireframe', icon: Icons.Grid3x3, shortcut: '1' },
    { id: 'solid', label: 'Solid', icon: Icons.Cube, shortcut: '2' },
    { id: 'material', label: 'Material', icon: Icons.Palette, shortcut: '3' },
    { id: 'rendered', label: 'Rendered', icon: Icons.Sun, shortcut: '4' }
  ];
  
  const speedPresets = [
    { value: 1, label: 'Slow' },
    { value: 5, label: 'Normal' },
    { value: 10, label: 'Fast' },
    { value: 20, label: 'Very Fast' }
  ];
  
  // Handle click outside to close camera panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cameraRef.current && !cameraRef.current.contains(event.target)) {
        setIsCameraExpanded(false);
      }
    };

    if (isCameraExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCameraExpanded]);

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
          {tools.map((tool, index) => {
            const effectiveSelectedTool = getEffectiveSelectedTool();
            const isActive = (effectiveSelectedTool === tool.id && !['undo', 'redo', 'new', 'open', 'save'].includes(tool.id)) || flashingTool === tool.id;
            
            // Add dividers after certain tool groups
            const showDivider = 
              (index === 2) || // After save (project tools)
              (index === 6) || // After scale (transform tools)  
              (index === 12) || // After camera (create tools)
              (index === 15); // After redo (edit tools)
            
            return (
              <React.Fragment key={tool.id}>
                <button
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
                
                {/* Divider */}
                {showDivider && (
                  <div className="w-px h-6 bg-gray-700 mx-1"></div>
                )}
              </React.Fragment>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side quick actions */}
          <div className="flex items-center gap-2 relative" ref={cameraRef}>
            {/* Camera Settings Button */}
            <button
              className={`px-2 py-1 text-xs rounded transition-colors ${
                isCameraExpanded
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800'
              }`}
              onClick={() => setIsCameraExpanded(!isCameraExpanded)}
              title="Camera Settings"
            >
              <Icons.Camera className="w-4 h-4" />
            </button>
            
            {/* Camera Settings Panel */}
            {isCameraExpanded && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl space-y-4 text-white text-xs pointer-events-auto z-50 p-4">
                {/* Camera Speed */}
                <div>
                  <label className="block font-medium text-gray-300 mb-2">
                    Camera Speed: {cameraSpeed}
                  </label>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {speedPresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setCameraSpeed(preset.value)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          cameraSpeed === preset.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="50"
                    step="0.5"
                    value={cameraSpeed}
                    onChange={(e) => setCameraSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                {/* Mouse Sensitivity */}
                <div>
                  <label className="block font-medium text-gray-300 mb-2">
                    Mouse Sensitivity: {(mouseSensitivity * 1000).toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.01"
                    step="0.0001"
                    value={mouseSensitivity}
                    onChange={(e) => setCameraSensitivity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                {/* Rendering Mode */}
                <div>
                  <label className="block font-medium text-gray-300 mb-2">
                    Render Mode
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {renderModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setRenderMode(mode.id)}
                        className={`flex items-center gap-2 px-2 py-2 text-xs rounded transition-colors ${
                          renderMode === mode.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        title={`${mode.label} (${mode.shortcut})`}
                      >
                        <mode.icon className="w-3 h-3" />
                        <span>{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Grid Controls */}
                <div>
                  <label className="block font-medium text-gray-300 mb-2">
                    Grid Settings
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors ${
                        showGrid
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Icons.Grid3x3 className="w-3 h-3" />
                      Show Grid
                    </button>
                    
                    <button
                      onClick={() => setGridSnapping(!gridSnapping)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors ${
                        gridSnapping
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Icons.Target className="w-3 h-3" />
                      Grid Snapping
                    </button>
                  </div>
                </div>
                
              </div>
            )}
            
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