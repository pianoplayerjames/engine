import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const LayersPanel = () => {
  const [layers, setLayers] = useState([
    { id: '1', name: 'Background', type: 'background', visible: true, locked: false, opacity: 100 },
    { id: '2', name: 'Layer 1', type: 'normal', visible: true, locked: false, opacity: 85 },
    { id: '3', name: 'Text Layer', type: 'text', visible: true, locked: false, opacity: 100 },
    { id: '4', name: 'Adjustment Layer', type: 'adjustment', visible: false, locked: false, opacity: 75 },
  ]);
  
  const [selectedLayer, setSelectedLayer] = useState('2');
  const [blendMode, setBlendMode] = useState('normal');

  const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
    'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion'
  ];

  const getLayerIcon = (type) => {
    switch (type) {
      case 'background': return Icons.Layer;
      case 'text': return Icons.Type;
      case 'adjustment': return Icons.AdjustmentsHorizontal;
      case 'shape': return Icons.Shapes;
      case 'smart-object': return Icons.SmartObject;
      default: return Icons.Layer;
    }
  };

  const toggleLayerVisibility = (layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLayerLock = (layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const updateLayerOpacity = (layerId, opacity) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  const addNewLayer = () => {
    const newLayer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length}`,
      type: 'normal',
      visible: true,
      locked: false,
      opacity: 100
    };
    setLayers([...layers, newLayer]);
  };

  const deleteLayer = (layerId) => {
    if (layers.length > 1) {
      setLayers(layers.filter(layer => layer.id !== layerId));
      if (selectedLayer === layerId) {
        setSelectedLayer(layers.find(l => l.id !== layerId)?.id);
      }
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.Layers className="w-4 h-4 text-blue-400 mr-2" />
        <span className="text-white text-sm font-medium">Layers</span>
      </div>

      {/* Blend Mode and Opacity */}
      <div className="p-3 border-b border-gray-700">
        <div className="mb-2">
          <label className="text-xs text-gray-400 mb-1 block">Blend Mode</label>
          <select 
            value={blendMode}
            onChange={(e) => setBlendMode(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
          >
            {blendModes.map(mode => (
              <option key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Opacity</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={layers.find(l => l.id === selectedLayer)?.opacity || 100}
              onChange={(e) => updateLayerOpacity(selectedLayer, parseInt(e.target.value))}
              className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
            />
            <span className="text-xs text-gray-400 w-8">
              {layers.find(l => l.id === selectedLayer)?.opacity || 100}%
            </span>
          </div>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-auto">
        {layers.slice().reverse().map((layer) => {
          const LayerIcon = getLayerIcon(layer.type);
          return (
            <div
              key={layer.id}
              className={`flex items-center p-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                selectedLayer === layer.id ? 'bg-blue-600/20 border-blue-500' : ''
              }`}
              onClick={() => setSelectedLayer(layer.id)}
            >
              {/* Layer Thumbnail */}
              <div className="w-12 h-12 bg-gray-700 border border-gray-600 rounded mr-2 flex items-center justify-center">
                <LayerIcon className="w-6 h-6 text-gray-400" />
              </div>

              {/* Layer Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{layer.name}</div>
                <div className="text-xs text-gray-400">{layer.type}</div>
              </div>

              {/* Layer Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? (
                    <Icons.Eye className="w-3 h-3 text-gray-300" />
                  ) : (
                    <Icons.EyeOff className="w-3 h-3 text-gray-500" />
                  )}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerLock(layer.id);
                  }}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.locked ? (
                    <Icons.LockClosed className="w-3 h-3 text-yellow-400" />
                  ) : (
                    <Icons.LockOpen className="w-3 h-3 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layer Actions */}
      <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-2">
        <button
          onClick={addNewLayer}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="New Layer"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => deleteLayer(selectedLayer)}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Delete Layer"
        >
          <Icons.Trash className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Duplicate Layer"
        >
          <Icons.DocumentDuplicate className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Layer Effects"
        >
          <Icons.Effects className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Layer Mask"
        >
          <Icons.LayerMask className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LayersPanel;