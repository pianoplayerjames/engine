import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';

const MaterialEditor = () => {
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [previewObject, setPreviewObject] = useState('sphere');
  const { sceneObjects } = useSnapshot(editorState);

  // Sample materials - in a real implementation this would come from your material system
  const sampleMaterials = [
    {
      id: 'default-material',
      name: 'Default Material',
      type: 'PBR',
      color: '#888888',
      roughness: 0.5,
      metalness: 0.0,
      preview: true
    },
    {
      id: 'metal-material',
      name: 'Brushed Metal',
      type: 'PBR',
      color: '#C0C0C0',
      roughness: 0.3,
      metalness: 0.9,
      preview: true
    },
    {
      id: 'wood-material',
      name: 'Oak Wood',
      type: 'PBR',
      color: '#8B4513',
      roughness: 0.8,
      metalness: 0.0,
      preview: true
    }
  ];

  const previewObjects = [
    { id: 'sphere', name: 'Sphere', icon: Icons.Circle },
    { id: 'cube', name: 'Cube', icon: Icons.Square },
    { id: 'cylinder', name: 'Cylinder', icon: Icons.Cylinder },
    { id: 'plane', name: 'Plane', icon: Icons.Square }
  ];

  const MaterialPreview = ({ material }) => (
    <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden relative group cursor-pointer border border-gray-700 hover:border-blue-500 transition-colors">
      {/* Material preview would be rendered here with Three.js */}
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: material.color + '40' }}
      >
        <div 
          className="w-16 h-16 rounded-full shadow-lg"
          style={{ backgroundColor: material.color }}
        />
      </div>
      
      {/* Material info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="text-xs text-white font-medium">{material.name}</div>
        <div className="text-xs text-gray-300">{material.type}</div>
      </div>
      
      {/* Selection indicator */}
      {selectedMaterial?.id === material.id && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg" />
      )}
    </div>
  );

  const MaterialProperties = ({ material }) => {
    if (!material) return null;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">{material.name} Properties</h3>
        </div>
        
        {/* Base Color */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Base Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={material.color}
              className="w-8 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
              onChange={(e) => {
                // Update material color
                console.log('Color changed:', e.target.value);
              }}
            />
            <input
              type="text"
              value={material.color}
              className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300"
              onChange={(e) => {
                console.log('Color text changed:', e.target.value);
              }}
            />
          </div>
        </div>

        {/* Roughness */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Roughness: {material.roughness.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={material.roughness}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            onChange={(e) => {
              console.log('Roughness changed:', parseFloat(e.target.value));
            }}
          />
        </div>

        {/* Metalness */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Metalness: {material.metalness.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={material.metalness}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            onChange={(e) => {
              console.log('Metalness changed:', parseFloat(e.target.value));
            }}
          />
        </div>

        {/* Additional PBR Properties */}
        <div className="border-t border-gray-700 pt-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Advanced</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Normal Map</span>
              <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                Load
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Roughness Map</span>
              <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                Load
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Metalness Map</span>
              <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                Load
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gray-900 flex">
      {/* Material Library Panel */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-300">Material Library</h2>
            <button className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors">
              <Icons.Plus className="w-3 h-3 mr-1 inline" />
              New
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Icons.Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search materials..."
              className="w-full pl-7 pr-3 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Materials Grid */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {sampleMaterials.map((material) => (
              <div
                key={material.id}
                onClick={() => setSelectedMaterial(material)}
              >
                <MaterialPreview material={material} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Preview Controls */}
        <div className="p-3 border-b border-gray-700 bg-gray-850">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Preview Object:</span>
              {previewObjects.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setPreviewObject(obj.id)}
                  className={`p-2 rounded transition-colors ${
                    previewObject === obj.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={obj.name}
                >
                  <obj.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                Reset View
              </button>
              <button className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* 3D Preview Area */}
        <div className="flex-1 flex">
          {/* Preview Viewport */}
          <div className="flex-1 bg-gray-800 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">🎨</span>
                </div>
                <div className="text-sm text-gray-400 mb-2">Material Preview</div>
                <div className="text-xs text-gray-500">
                  {selectedMaterial ? `Previewing: ${selectedMaterial.name}` : 'Select a material to preview'}
                </div>
              </div>
            </div>
            
            {/* Preview viewport would integrate with Three.js here */}
            <div className="absolute top-2 left-2 text-xs text-gray-500">
              Preview: {previewObject}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-72 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
            {selectedMaterial ? (
              <MaterialProperties material={selectedMaterial} />
            ) : (
              <div className="text-center py-8">
                <Icons.Palette className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <div className="text-sm text-gray-400 mb-2">No Material Selected</div>
                <div className="text-xs text-gray-500">
                  Select a material from the library to edit its properties
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialEditor;