import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { globalStore, actions } from "@/store.js";
import ProjectManager from '@/plugins/projects/components/ProjectManager.jsx';

function HorizontalToolbar() {
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [flashingTool, setFlashingTool] = useState(null);
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);
  const cameraRef = useRef(null);
  const { selection, ui, camera, viewport } = useSnapshot(globalStore.editor);
  const { selectedTool } = ui;
  const { transformMode } = selection;
  const { setSelectedTool, setTransformMode, setCameraSpeed, setCameraSensitivity, setRenderMode, setGridSnapping, setShowGrid } = actions.editor;
  
  // Get current active viewport type for workflow filtering
  const getCurrentWorkflow = () => {
    if (!viewport.tabs || viewport.tabs.length === 0) {
      return '3d-viewport';
    }
    const activeTabData = viewport.tabs.find(tab => tab.id === viewport.activeTabId);
    return activeTabData?.type || '3d-viewport';
  };
  
  // Camera settings
  const cameraSpeed = camera.speed || 5;
  const mouseSensitivity = camera.mouseSensitivity || 0.002;
  const renderMode = viewport.renderMode || 'solid';
  const gridSnapping = viewport.gridSnapping || false;
  const showGrid = viewport.showGrid !== false;
  
  const renderModes = [
    { id: 'wireframe', label: 'Wireframe', icon: Icons.Grid3x3 },
    { id: 'solid', label: 'Solid', icon: Icons.Cube },
    { id: 'material', label: 'Material', icon: Icons.Palette },
    { id: 'rendered', label: 'Rendered', icon: Icons.Sun }
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

  // Workflow-specific tool sets
  const workflowTools = {
    '3d-viewport': [
      // Project tools
      { id: 'new', icon: Icons.Plus, tooltip: 'New Project' },
      { id: 'open', icon: Icons.Folder, tooltip: 'Open Project' },
      { id: 'save', icon: Icons.Save, tooltip: 'Save Project' },
      
      // Transform tools
      { id: 'select', icon: Icons.MousePointer, tooltip: 'Select' },
      { id: 'move', icon: Icons.Move, tooltip: 'Move' },
      { id: 'rotate', icon: Icons.RotateCcw, tooltip: 'Rotate' },
      { id: 'scale', icon: Icons.Maximize, tooltip: 'Scale' },
      
      // Create tools
      { id: 'cube', icon: Icons.Square, tooltip: 'Add Cube' },
      { id: 'sphere', icon: Icons.Circle, tooltip: 'Add Sphere' },
      { id: 'cylinder', icon: Icons.Cylinder, tooltip: 'Add Cylinder' },
      { id: 'light', icon: Icons.Sun, tooltip: 'Add Light' },
      { id: 'camera', icon: Icons.Camera, tooltip: 'Add Camera' },
      
      // Edit tools
      { id: 'duplicate', icon: Icons.Copy, tooltip: 'Duplicate' },
      { id: 'delete', icon: Icons.Trash, tooltip: 'Delete' },
      { id: 'undo', icon: Icons.Undo, tooltip: 'Undo' },
      { id: 'redo', icon: Icons.Redo, tooltip: 'Redo' },
      
      // Paint/sculpt tools
      { id: 'paint', icon: Icons.Paintbrush2, tooltip: 'Paint' },
    ],
    
    'daw-editor': [
      // Project tools
      { id: 'new', icon: Icons.Plus, tooltip: 'New Project' },
      { id: 'open', icon: Icons.Folder, tooltip: 'Open Project' },
      { id: 'save', icon: Icons.Save, tooltip: 'Save Project' },
      
      // Transport controls
      { id: 'play', icon: Icons.Play, tooltip: 'Play' },
      { id: 'pause', icon: Icons.Pause, tooltip: 'Pause' },
      { id: 'stop', icon: Icons.Square, tooltip: 'Stop' },
      { id: 'record', icon: Icons.Circle, tooltip: 'Record' },
      
      // Track tools
      { id: 'add-track', icon: Icons.Plus, tooltip: 'Add Track' },
      { id: 'add-audio-track', icon: Icons.Audio, tooltip: 'Add Audio Track' },
      { id: 'add-midi-track', icon: Icons.Music, tooltip: 'Add MIDI Track' },
      { id: 'add-instrument', icon: Icons.Piano, tooltip: 'Add Instrument' },
      
      // Edit tools
      { id: 'cut', icon: Icons.Scissors, tooltip: 'Cut' },
      { id: 'copy', icon: Icons.Copy, tooltip: 'Copy' },
      { id: 'paste', icon: Icons.Clipboard, tooltip: 'Paste' },
      { id: 'undo', icon: Icons.Undo, tooltip: 'Undo' },
      { id: 'redo', icon: Icons.Redo, tooltip: 'Redo' },
      
      // Audio tools
      { id: 'metronome', icon: Icons.Clock, tooltip: 'Metronome' },
      { id: 'loop', icon: Icons.Repeat, tooltip: 'Loop' },
    ],
    
    'material-editor': [
      // Project tools
      { id: 'new', icon: Icons.Plus, tooltip: 'New Project' },
      { id: 'open', icon: Icons.Folder, tooltip: 'Open Project' },
      { id: 'save', icon: Icons.Save, tooltip: 'Save Project' },
      
      // Material tools
      { id: 'new-material', icon: Icons.Palette, tooltip: 'New Material' },
      { id: 'duplicate', icon: Icons.Copy, tooltip: 'Duplicate Material' },
      { id: 'apply', icon: Icons.Check, tooltip: 'Apply Material' },
      
      // Edit tools
      { id: 'undo', icon: Icons.Undo, tooltip: 'Undo' },
      { id: 'redo', icon: Icons.Redo, tooltip: 'Redo' },
    ],
    
    'node-editor': [
      // Project tools
      { id: 'new', icon: Icons.Plus, tooltip: 'New Project' },
      { id: 'open', icon: Icons.Folder, tooltip: 'Open Project' },
      { id: 'save', icon: Icons.Save, tooltip: 'Save Project' },
      
      // Node tools
      { id: 'add-node', icon: Icons.Plus, tooltip: 'Add Node' },
      { id: 'delete-node', icon: Icons.Trash, tooltip: 'Delete Node' },
      { id: 'duplicate', icon: Icons.Copy, tooltip: 'Duplicate' },
      
      // Edit tools
      { id: 'undo', icon: Icons.Undo, tooltip: 'Undo' },
      { id: 'redo', icon: Icons.Redo, tooltip: 'Redo' },
    ],
    
    'animation-editor': [
      // Project tools
      { id: 'new', icon: Icons.Plus, tooltip: 'New Project' },
      { id: 'open', icon: Icons.Folder, tooltip: 'Open Project' },
      { id: 'save', icon: Icons.Save, tooltip: 'Save Project' },
      
      // Animation tools
      { id: 'play', icon: Icons.Play, tooltip: 'Play Animation' },
      { id: 'pause', icon: Icons.Pause, tooltip: 'Pause Animation' },
      { id: 'keyframe', icon: Icons.Key, tooltip: 'Add Keyframe' },
      
      // Edit tools
      { id: 'undo', icon: Icons.Undo, tooltip: 'Undo' },
      { id: 'redo', icon: Icons.Redo, tooltip: 'Redo' },
    ],
    
    'text-editor': [
      // Project tools
      { id: 'new', icon: Icons.Plus, tooltip: 'New File' },
      { id: 'open', icon: Icons.Folder, tooltip: 'Open File' },
      { id: 'save', icon: Icons.Save, tooltip: 'Save File' },
      
      // Text tools
      { id: 'find', icon: Icons.Search, tooltip: 'Find' },
      { id: 'replace', icon: Icons.Replace, tooltip: 'Replace' },
      
      // Edit tools
      { id: 'undo', icon: Icons.Undo, tooltip: 'Undo' },
      { id: 'redo', icon: Icons.Redo, tooltip: 'Redo' },
    ],
    
    'video-editor': [
      // Project tools
      { id: 'new', icon: Icons.Plus, tooltip: 'New Project' },
      { id: 'open', icon: Icons.Folder, tooltip: 'Open Project' },
      { id: 'save', icon: Icons.Save, tooltip: 'Save Project' },
      
      // Transport controls
      { id: 'play', icon: Icons.Play, tooltip: 'Play' },
      { id: 'pause', icon: Icons.Pause, tooltip: 'Pause' },
      { id: 'stop', icon: Icons.Square, tooltip: 'Stop' },
      { id: 'record', icon: Icons.Circle, tooltip: 'Record' },
      
      // Edit tools
      { id: 'cut', icon: Icons.Cut, tooltip: 'Cut/Razr Tool' },
      { id: 'trim', icon: Icons.Trim, tooltip: 'Trim Tool' },
      { id: 'speed', icon: Icons.Speed, tooltip: 'Speed Tool' },
      { id: 'select', icon: Icons.CursorArrowRays, tooltip: 'Selection Tool' },
      
      // Media tools
      { id: 'import', icon: Icons.Archive, tooltip: 'Import Media' },
      { id: 'render', icon: Icons.Film, tooltip: 'Render Video' },
      
      // Edit actions
      { id: 'undo', icon: Icons.Undo, tooltip: 'Undo' },
      { id: 'redo', icon: Icons.Redo, tooltip: 'Redo' },
    ],
    
    'photo-editor': [
      // Project tools
      { id: 'new', icon: Icons.Plus, tooltip: 'New Image' },
      { id: 'open', icon: Icons.Folder, tooltip: 'Open Image' },
      { id: 'save', icon: Icons.Save, tooltip: 'Save Image' },
      
      // Selection tools
      { id: 'move', icon: Icons.HandRaised, tooltip: 'Move Tool' },
      { id: 'select-rectangle', icon: Icons.Rectangle, tooltip: 'Rectangular Marquee Tool' },
      { id: 'select-ellipse', icon: Icons.Circle, tooltip: 'Elliptical Marquee Tool' },
      { id: 'lasso', icon: Icons.Lasso, tooltip: 'Lasso Tool' },
      { id: 'magic-wand', icon: Icons.Sparkles, tooltip: 'Magic Wand Tool' },
      
      // Transform tools
      { id: 'crop', icon: Icons.Crop, tooltip: 'Crop Tool' },
      { id: 'eyedropper', icon: Icons.EyeDropper, tooltip: 'Eyedropper Tool' },
      
      // Paint tools
      { id: 'brush', icon: Icons.PaintBrush, tooltip: 'Brush Tool' },
      { id: 'pencil', icon: Icons.Pencil, tooltip: 'Pencil Tool' },
      { id: 'eraser', icon: Icons.Eraser, tooltip: 'Eraser Tool' },
      { id: 'gradient', icon: Icons.Gradient, tooltip: 'Gradient Tool' },
      { id: 'paint-bucket', icon: Icons.PaintBucket, tooltip: 'Paint Bucket Tool' },
      
      // Retouch tools
      { id: 'healing', icon: Icons.Healing, tooltip: 'Healing Brush Tool' },
      { id: 'clone', icon: Icons.Clone, tooltip: 'Clone Stamp Tool' },
      { id: 'blur', icon: Icons.Blur, tooltip: 'Blur Tool' },
      { id: 'sharpen', icon: Icons.Sharpen, tooltip: 'Sharpen Tool' },
      { id: 'smudge', icon: Icons.Smudge, tooltip: 'Smudge Tool' },
      { id: 'dodge', icon: Icons.Dodge, tooltip: 'Dodge Tool' },
      { id: 'burn', icon: Icons.Burn, tooltip: 'Burn Tool' },
      { id: 'sponge', icon: Icons.Sponge, tooltip: 'Sponge Tool' },
      
      // Creative tools
      { id: 'text', icon: Icons.Type, tooltip: 'Type Tool' },
      { id: 'path', icon: Icons.BezierCurve, tooltip: 'Pen Tool' },
      { id: 'shape', icon: Icons.Shapes, tooltip: 'Shape Tool' },
      
      // Navigation tools
      { id: 'zoom', icon: Icons.MagnifyingGlass, tooltip: 'Zoom Tool' },
      { id: 'hand', icon: Icons.Hand, tooltip: 'Hand Tool' },
      
      // Edit actions
      { id: 'undo', icon: Icons.Undo, tooltip: 'Undo' },
      { id: 'redo', icon: Icons.Redo, tooltip: 'Redo' },
    ]
  };
  
  // Get tools for current workflow
  const currentWorkflow = getCurrentWorkflow();
  const tools = workflowTools[currentWorkflow] || workflowTools['3d-viewport'];

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
        actions.editor.addConsoleMessage('Project saved', 'success');
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
      actions.editor.addSceneObject({
        type: 'mesh',
        geometry: toolId === 'cube' ? 'box' : toolId,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
      });
      actions.editor.addConsoleMessage(`Created ${toolId}`, 'success');
    }
    else if (toolId === 'light') {
      actions.editor.addSceneObject({
        type: 'light',
        lightType: 'directional',
        position: [5, 5, 5],
        rotation: [-Math.PI / 4, Math.PI / 4, 0],
        color: '#ffffff',
        intensity: 1,
        visible: true,
        castShadow: true,
      });
      actions.editor.addConsoleMessage('Created directional light', 'success');
    }
    else if (toolId === 'camera') {
      actions.editor.addSceneObject({
        type: 'camera',
        position: [0, 0, 5],
        rotation: [0, 0, 0],
        fov: 75,
        near: 0.1,
        far: 1000,
        visible: true,
      });
      actions.editor.addConsoleMessage('Created camera', 'success');
    }
    // Handle DAW transport controls
    else if (['play', 'pause', 'stop', 'record'].includes(toolId)) {
      setFlashingTool(toolId);
      setTimeout(() => setFlashingTool(null), 300);
      actions.editor.addConsoleMessage(`Transport: ${toolId}`, 'info');
    }
    // Handle DAW track tools
    else if (['add-track', 'add-audio-track', 'add-midi-track', 'add-instrument'].includes(toolId)) {
      actions.editor.addConsoleMessage(`Added ${toolId.replace('add-', '').replace('-', ' ')}`, 'success');
    }
    // Handle DAW audio tools
    else if (['metronome', 'loop'].includes(toolId)) {
      setFlashingTool(toolId);
      setTimeout(() => setFlashingTool(null), 200);
      actions.editor.addConsoleMessage(`${toolId} toggled`, 'info');
    }
    // Handle text editor tools
    else if (['find', 'replace'].includes(toolId)) {
      actions.editor.addConsoleMessage(`${toolId} dialog opened`, 'info');
    }
    // Handle video editor tools
    else if (['cut', 'trim', 'speed', 'select'].includes(toolId)) {
      setSelectedTool(toolId);
      actions.editor.addConsoleMessage(`Video tool: ${toolId}`, 'info');
    }
    else if (['import', 'render'].includes(toolId)) {
      setFlashingTool(toolId);
      setTimeout(() => setFlashingTool(null), 300);
      actions.editor.addConsoleMessage(`${toolId === 'import' ? 'Import media' : 'Render video'} triggered`, 'info');
    }
    // Handle material editor tools
    else if (['new-material', 'apply'].includes(toolId)) {
      actions.editor.addConsoleMessage(`Material tool: ${toolId}`, 'info');
    }
    // Handle node editor tools
    else if (['add-node', 'delete-node'].includes(toolId)) {
      actions.editor.addConsoleMessage(`Node tool: ${toolId}`, 'info');
    }
    // Handle animation tools
    else if (['keyframe'].includes(toolId)) {
      actions.editor.addConsoleMessage('Keyframe added', 'success');
    }
    // Handle photo editor tools
    else if ([
      'move', 'select-rectangle', 'select-ellipse', 'lasso', 'magic-wand', 'crop', 'eyedropper',
      'healing', 'brush', 'pencil', 'clone', 'eraser', 'gradient', 'paint-bucket',
      'blur', 'sharpen', 'smudge', 'dodge', 'burn', 'sponge', 'text', 'path', 'shape', 'zoom', 'hand'
    ].includes(toolId)) {
      setSelectedTool(toolId);
      actions.editor.setPhotoEditorTool(toolId);
      actions.editor.addConsoleMessage(`Photo tool: ${toolId}`, 'info');
    }
    // Handle action tools (undo/redo)
    else if (['undo', 'redo'].includes(toolId)) {
      setFlashingTool(toolId);
      setTimeout(() => setFlashingTool(null), 200);
      actions.editor.addConsoleMessage(`${toolId} action triggered`, 'info');
    }
    // Handle edit tools (cut/copy/paste)
    else if (['cut', 'copy', 'paste'].includes(toolId)) {
      setFlashingTool(toolId);
      setTimeout(() => setFlashingTool(null), 200);
      actions.editor.addConsoleMessage(`${toolId} action triggered`, 'info');
    }
    // Handle other tools
    else {
      actions.editor.addConsoleMessage(`Tool activated: ${toolId}`, 'info');
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
            
            // Add dividers after certain tool groups based on workflow
            let showDivider = false;
            if (currentWorkflow === '3d-viewport') {
              showDivider = 
                (index === 2) || // After save (project tools)
                (index === 6) || // After scale (transform tools)  
                (index === 12) || // After camera (create tools)
                (index === 15); // After redo (edit tools)
            } else if (currentWorkflow === 'daw-editor') {
              showDivider = 
                (index === 2) || // After save (project tools)
                (index === 6) || // After record (transport tools)
                (index === 10) || // After add-instrument (track tools)
                (index === 15); // After redo (edit tools)
            } else if (currentWorkflow === 'material-editor') {
              showDivider = 
                (index === 2) || // After save (project tools)
                (index === 5); // After apply (material tools)
            } else if (currentWorkflow === 'node-editor') {
              showDivider = 
                (index === 2) || // After save (project tools)
                (index === 5); // After duplicate (node tools)
            } else if (currentWorkflow === 'animation-editor') {
              showDivider = 
                (index === 2) || // After save (project tools)
                (index === 5); // After keyframe (animation tools)
            } else if (currentWorkflow === 'text-editor') {
              showDivider = 
                (index === 2) || // After save (project tools)
                (index === 4); // After replace (text tools)
            } else if (currentWorkflow === 'video-editor') {
              showDivider = 
                (index === 2) || // After save (project tools)
                (index === 6) || // After record (transport tools)
                (index === 10) || // After select (edit tools)
                (index === 12); // After render (media tools)
            } else if (currentWorkflow === 'photo-editor') {
              showDivider = 
                (index === 2) || // After save (project tools)
                (index === 7) || // After magic-wand (selection tools)
                (index === 9) || // After eyedropper (transform tools)
                (index === 14) || // After paint-bucket (paint tools)
                (index === 21) || // After sponge (retouch tools)
                (index === 24) || // After shape (creative tools)
                (index === 26); // After hand (navigation tools)
            }
            
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
            {/* Camera Settings Button - Only show for 3D workflows */}
            {(currentWorkflow === '3d-viewport' || currentWorkflow === 'material-editor') && (
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
            )}
            
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
                        title={mode.label}
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
            
            {/* Grid and Snap controls - Only show for 3D workflows */}
            {(currentWorkflow === '3d-viewport' || currentWorkflow === 'material-editor') && (
              <>
                <button
                  className="px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-slate-800 rounded transition-colors"
                  onClick={() => actions.editor.addConsoleMessage('Grid toggled', 'info')}
                >
                  Grid
                </button>
                <button
                  className="px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-slate-800 rounded transition-colors"
                  onClick={() => actions.editor.addConsoleMessage('Snap toggled', 'info')}
                >
                  Snap
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          onProjectLoad={(name, path) => {
            console.log(`Project loaded: ${name} at ${path}`)
            actions.editor.addConsoleMessage(`Project "${name}" loaded successfully`, 'success')
          }}
          onClose={() => setShowProjectManager(false)}
        />
      )}
    </>
  );
}

export default HorizontalToolbar;