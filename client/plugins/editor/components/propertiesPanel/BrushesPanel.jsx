import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const BrushesPanel = () => {
  const [selectedBrush, setSelectedBrush] = useState('1');
  const [brushSize, setBrushSize] = useState(50);
  const [brushHardness, setBrushHardness] = useState(100);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [brushFlow, setBrushFlow] = useState(100);
  const [brushSpacing, setBrushSpacing] = useState(25);
  const [activeTab, setActiveTab] = useState('brushes');

  const brushPresets = [
    { id: '1', name: 'Hard Round', type: 'round', hardness: 100, preview: '●' },
    { id: '2', name: 'Soft Round', type: 'round', hardness: 0, preview: '○' },
    { id: '3', name: 'Hard Square', type: 'square', hardness: 100, preview: '■' },
    { id: '4', name: 'Soft Square', type: 'square', hardness: 0, preview: '□' },
    { id: '5', name: 'Textured 1', type: 'texture', hardness: 80, preview: '⬢' },
    { id: '6', name: 'Textured 2', type: 'texture', hardness: 60, preview: '※' },
    { id: '7', name: 'Scattered', type: 'scatter', hardness: 90, preview: '✦' },
    { id: '8', name: 'Grunge', type: 'grunge', hardness: 70, preview: '⚹' },
    { id: '9', name: 'Watercolor', type: 'watercolor', hardness: 20, preview: '🎨' },
    { id: '10', name: 'Oil Paint', type: 'oil', hardness: 40, preview: '🖌️' },
    { id: '11', name: 'Chalk', type: 'chalk', hardness: 30, preview: '✏️' },
    { id: '12', name: 'Charcoal', type: 'charcoal', hardness: 50, preview: '🖊️' },
  ];

  const brushTips = [
    { id: 't1', name: 'Round', shape: 'round' },
    { id: 't2', name: 'Square', shape: 'square' },
    { id: 't3', name: 'Diamond', shape: 'diamond' },
    { id: 't4', name: 'Triangle', shape: 'triangle' },
    { id: 't5', name: 'Star', shape: 'star' },
    { id: 't6', name: 'Cross', shape: 'cross' },
  ];

  const dynamicsOptions = [
    { id: 'size', name: 'Size Jitter', enabled: false, value: 0 },
    { id: 'opacity', name: 'Opacity Jitter', enabled: false, value: 0 },
    { id: 'angle', name: 'Angle Jitter', enabled: false, value: 0 },
    { id: 'roundness', name: 'Roundness Jitter', enabled: false, value: 0 },
    { id: 'scatter', name: 'Scatter', enabled: false, value: 0 },
  ];

  const [dynamics, setDynamics] = useState(dynamicsOptions);

  const handleBrushSelect = (brushId) => {
    setSelectedBrush(brushId);
    const brush = brushPresets.find(b => b.id === brushId);
    if (brush) {
      setBrushHardness(brush.hardness);
    }
  };

  const toggleDynamic = (dynamicId) => {
    setDynamics(prev => prev.map(d => 
      d.id === dynamicId ? { ...d, enabled: !d.enabled } : d
    ));
  };

  const updateDynamicValue = (dynamicId, value) => {
    setDynamics(prev => prev.map(d => 
      d.id === dynamicId ? { ...d, value } : d
    ));
  };

  const getBrushSizePreview = () => {
    const size = Math.max(2, Math.min(brushSize, 100));
    return (
      <div 
        className="bg-white rounded-full border border-gray-600 mx-auto"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          opacity: brushHardness / 100
        }}
      />
    );
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.PaintBrush className="w-4 h-4 text-red-400 mr-2" />
        <span className="text-white text-sm font-medium">Brushes</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('brushes')}
            className={`flex-1 px-3 py-2 text-sm transition-colors ${
              activeTab === 'brushes'
                ? 'bg-gray-700 text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Brush Presets
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 px-3 py-2 text-sm transition-colors ${
              activeTab === 'tips'
                ? 'bg-gray-700 text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Brush Tip
          </button>
          <button
            onClick={() => setActiveTab('dynamics')}
            className={`flex-1 px-3 py-2 text-sm transition-colors ${
              activeTab === 'dynamics'
                ? 'bg-gray-700 text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Dynamics
          </button>
        </div>
      </div>

      {/* Brush Preview */}
      <div className="p-4 border-b border-gray-700 text-center">
        <div className="w-20 h-20 bg-gray-800 border border-gray-600 rounded mx-auto mb-2 flex items-center justify-center">
          {getBrushSizePreview()}
        </div>
        <div className="text-xs text-gray-400">
          {brushPresets.find(b => b.id === selectedBrush)?.name || 'Custom Brush'}
        </div>
      </div>

      {/* Main Settings */}
      <div className="p-4 border-b border-gray-700 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Size</label>
            <span className="text-xs text-gray-400">{brushSize}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="2500"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-600 rounded appearance-none slider"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Hardness</label>
            <span className="text-xs text-gray-400">{brushHardness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={brushHardness}
            onChange={(e) => setBrushHardness(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-600 rounded appearance-none slider"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Opacity</label>
            <span className="text-xs text-gray-400">{brushOpacity}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={brushOpacity}
            onChange={(e) => setBrushOpacity(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-600 rounded appearance-none slider"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-300">Flow</label>
            <span className="text-xs text-gray-400">{brushFlow}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={brushFlow}
            onChange={(e) => setBrushFlow(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-600 rounded appearance-none slider"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'brushes' && (
          <div className="p-2">
            <div className="grid grid-cols-2 gap-2">
              {brushPresets.map((brush) => (
                <button
                  key={brush.id}
                  onClick={() => handleBrushSelect(brush.id)}
                  className={`p-3 rounded border transition-colors text-center ${
                    selectedBrush === brush.id
                      ? 'bg-red-600/20 border-red-500'
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{brush.preview}</div>
                  <div className="text-xs text-gray-300 truncate">{brush.name}</div>
                  <div className="text-xs text-gray-500">{brush.type}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Brush Tip Shape</label>
              <div className="grid grid-cols-3 gap-2">
                {brushTips.map((tip) => (
                  <button
                    key={tip.id}
                    className="p-3 bg-gray-800 border border-gray-600 rounded hover:border-gray-500 transition-colors text-center"
                  >
                    <div className="text-sm text-gray-300">{tip.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">Spacing</label>
                <span className="text-xs text-gray-400">{brushSpacing}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="1000"
                value={brushSpacing}
                onChange={(e) => setBrushSpacing(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-300">Flip X</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-300">Flip Y</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'dynamics' && (
          <div className="p-4">
            <div className="space-y-3">
              {dynamics.map((dynamic) => (
                <div key={dynamic.id} className="bg-gray-800 rounded p-3">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={dynamic.enabled}
                      onChange={() => toggleDynamic(dynamic.id)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">{dynamic.name}</span>
                  </label>
                  
                  {dynamic.enabled && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">Amount</span>
                        <span className="text-xs text-gray-400">{dynamic.value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dynamic.value}
                        onChange={(e) => updateDynamicValue(dynamic.id, parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded appearance-none slider"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-2">
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="New Brush"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Delete Brush"
        >
          <Icons.Trash className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Load Brushes"
        >
          <Icons.Upload className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Save Brushes"
        >
          <Icons.Save className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BrushesPanel;