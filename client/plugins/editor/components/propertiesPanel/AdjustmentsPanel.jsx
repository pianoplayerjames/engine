import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const AdjustmentsPanel = () => {
  const [activeAdjustment, setActiveAdjustment] = useState('brightness-contrast');
  
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    exposure: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    saturation: 0,
    vibrance: 0,
    hue: 0,
    temperature: 0,
    tint: 0,
    clarity: 0,
    dehaze: 0,
    vignette: 0
  });

  const adjustmentTypes = [
    { id: 'brightness-contrast', name: 'Brightness/Contrast', icon: Icons.Sun },
    { id: 'levels', name: 'Levels', icon: Icons.ChartBar },
    { id: 'curves', name: 'Curves', icon: Icons.ChartLine },
    { id: 'exposure', name: 'Exposure', icon: Icons.Camera },
    { id: 'vibrance', name: 'Vibrance', icon: Icons.ColorSwatch },
    { id: 'hue-saturation', name: 'Hue/Saturation', icon: Icons.Palette },
    { id: 'color-balance', name: 'Color Balance', icon: Icons.Scale },
    { id: 'photo-filter', name: 'Photo Filter', icon: Icons.Filter },
    { id: 'channel-mixer', name: 'Channel Mixer', icon: Icons.Mixer },
    { id: 'color-lookup', name: 'Color Lookup', icon: Icons.Table },
    { id: 'invert', name: 'Invert', icon: Icons.Invert },
    { id: 'posterize', name: 'Posterize', icon: Icons.Layers },
    { id: 'threshold', name: 'Threshold', icon: Icons.Threshold },
    { id: 'gradient-map', name: 'Gradient Map', icon: Icons.Gradient }
  ];

  const handleAdjustmentChange = (property, value) => {
    setAdjustments(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const resetAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 0,
      vibrance: 0,
      hue: 0,
      temperature: 0,
      tint: 0,
      clarity: 0,
      dehaze: 0,
      vignette: 0
    });
  };

  const renderAdjustmentControls = () => {
    switch (activeAdjustment) {
      case 'brightness-contrast':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">Brightness</label>
                <span className="text-xs text-gray-400">{adjustments.brightness}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.brightness}
                onChange={(e) => handleAdjustmentChange('brightness', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">Contrast</label>
                <span className="text-xs text-gray-400">{adjustments.contrast}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.contrast}
                onChange={(e) => handleAdjustmentChange('contrast', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>
          </div>
        );
        
      case 'exposure':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">Exposure</label>
                <span className="text-xs text-gray-400">{adjustments.exposure}</span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={adjustments.exposure}
                onChange={(e) => handleAdjustmentChange('exposure', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">Highlights</label>
                <span className="text-xs text-gray-400">{adjustments.highlights}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.highlights}
                onChange={(e) => handleAdjustmentChange('highlights', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">Shadows</label>
                <span className="text-xs text-gray-400">{adjustments.shadows}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.shadows}
                onChange={(e) => handleAdjustmentChange('shadows', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>
          </div>
        );
        
      case 'hue-saturation':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">Hue</label>
                <span className="text-xs text-gray-400">{adjustments.hue}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={adjustments.hue}
                onChange={(e) => handleAdjustmentChange('hue', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">Saturation</label>
                <span className="text-xs text-gray-400">{adjustments.saturation}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.saturation}
                onChange={(e) => handleAdjustmentChange('saturation', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">Vibrance</label>
                <span className="text-xs text-gray-400">{adjustments.vibrance}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.vibrance}
                onChange={(e) => handleAdjustmentChange('vibrance', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8">
            <Icons.AdjustmentsHorizontal className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-500 text-sm">Select an adjustment type</div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.AdjustmentsHorizontal className="w-4 h-4 text-purple-400 mr-2" />
        <span className="text-white text-sm font-medium">Adjustments</span>
      </div>

      {/* Adjustment Types */}
      <div className="border-b border-gray-700">
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {adjustmentTypes.map((adj) => {
              const IconComponent = adj.icon;
              return (
                <button
                  key={adj.id}
                  onClick={() => setActiveAdjustment(adj.id)}
                  className={`p-2 rounded text-xs flex flex-col items-center gap-1 transition-colors ${
                    activeAdjustment === adj.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs leading-tight text-center">{adj.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Adjustment Controls */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {renderAdjustmentControls()}
        </div>
      </div>

      {/* Presets and Actions */}
      <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-2">
        <button
          onClick={resetAdjustments}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
        >
          Reset
        </button>
        
        <button
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
        >
          Auto
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300 ml-auto"
          title="Save Preset"
        >
          <Icons.Save className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Load Preset"
        >
          <Icons.Upload className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdjustmentsPanel;