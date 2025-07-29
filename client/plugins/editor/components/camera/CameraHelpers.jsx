import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';

export default function CameraHelpers() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { camera, viewport } = useSnapshot(editorState);
  const { setCameraSpeed, setCameraSensitivity, setRenderMode, setGridSnapping, setShowGrid } = editorActions;
  
  const cameraSpeed = camera.speed || 5;
  const mouseSensitivity = camera.mouseSensitivity || 0.002;
  const renderMode = viewport.renderMode || 'solid';
  const gridSnapping = viewport.gridSnapping || false;
  const showGrid = viewport.showGrid !== false; // default true
  
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
  
  return (
    <div className="absolute top-16 right-4 z-40 pointer-events-auto">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-10 h-10 bg-gray-900/90 hover:bg-gray-800/90 border border-gray-700 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-colors mb-2"
        title="Camera Controls"
      >
        <Icons.Camera className="w-5 h-5" />
      </button>
      
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl p-4 w-64 space-y-4">
          {/* Camera Speed */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
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
            <label className="block text-xs font-medium text-gray-300 mb-2">
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
            <label className="block text-xs font-medium text-gray-300 mb-2">
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
            <label className="block text-xs font-medium text-gray-300 mb-2">
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
          
          {/* Instructions */}
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Controls:</p>
            <div className="text-xs text-gray-500 space-y-0.5">
              <div>Right Mouse: Look around</div>
              <div>WASD: Move horizontally</div>
              <div>Q/E: Move up/down</div>
              <div>Shift: Speed boost</div>
              <div>Alt: Slow movement</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}