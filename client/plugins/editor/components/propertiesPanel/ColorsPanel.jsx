import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const ColorsPanel = () => {
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [activeColorMode, setActiveColorMode] = useState('rgb');
  const [colorHistory, setColorHistory] = useState([
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'
  ]);

  const colorModes = ['rgb', 'hsb', 'lab', 'cmyk'];

  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [hsbValues, setHsbValues] = useState({ h: 0, s: 0, b: 0 });
  const [cmykValues, setCmykValues] = useState({ c: 0, m: 0, y: 0, k: 100 });

  const swatches = [
    ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff'],
    ['#ff0000', '#ff6600', '#ffcc00', '#66ff00', '#00ff66', '#00ffcc'],
    ['#0066ff', '#6600ff', '#cc00ff', '#ff0066', '#ff3300', '#ff9900'],
    ['#ffff00', '#ccff00', '#66ff66', '#00ffff', '#0099ff', '#3366ff'],
    ['#9933ff', '#ff33cc', '#ff6699', '#ff9966', '#ffcc33', '#ccff33']
  ];

  const handleColorChange = (color, isBackground = false) => {
    if (isBackground) {
      setBackgroundColor(color);
    } else {
      setForegroundColor(color);
      
      // Add to color history if not already present
      if (!colorHistory.includes(color)) {
        setColorHistory(prev => [color, ...prev.slice(0, 11)]);
      }
      
      // Update color mode values
      updateColorModeValues(color);
    }
  };

  const updateColorModeValues = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    setRgbValues({ r, g, b });
    
    // Convert to HSB
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = Math.round(max === 0 ? 0 : (diff / max) * 100);
    const brightness = Math.round((max / 255) * 100);
    
    setHsbValues({ h, s, b: brightness });
    
    // Convert to CMYK (simplified)
    const k = Math.round((1 - max / 255) * 100);
    const c = max === 0 ? 0 : Math.round(((1 - r / 255 - k / 100) / (1 - k / 100)) * 100);
    const m = max === 0 ? 0 : Math.round(((1 - g / 255 - k / 100) / (1 - k / 100)) * 100);
    const y = max === 0 ? 0 : Math.round(((1 - b / 255 - k / 100) / (1 - k / 100)) * 100);
    
    setCmykValues({ c: c || 0, m: m || 0, y: y || 0, k });
  };

  const swapColors = () => {
    const temp = foregroundColor;
    setForegroundColor(backgroundColor);
    setBackgroundColor(temp);
    updateColorModeValues(backgroundColor);
  };

  const resetColors = () => {
    setForegroundColor('#000000');
    setBackgroundColor('#ffffff');
    updateColorModeValues('#000000');
  };

  const renderColorModeInputs = () => {
    switch (activeColorMode) {
      case 'rgb':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400 w-4">R</span>
              <input
                type="range"
                min="0"
                max="255"
                value={rgbValues.r}
                onChange={(e) => {
                  const newR = parseInt(e.target.value);
                  setRgbValues(prev => ({ ...prev, r: newR }));
                  const hex = `#${newR.toString(16).padStart(2, '0')}${rgbValues.g.toString(16).padStart(2, '0')}${rgbValues.b.toString(16).padStart(2, '0')}`;
                  setForegroundColor(hex);
                }}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{rgbValues.r}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-400 w-4">G</span>
              <input
                type="range"
                min="0"
                max="255"
                value={rgbValues.g}
                onChange={(e) => {
                  const newG = parseInt(e.target.value);
                  setRgbValues(prev => ({ ...prev, g: newG }));
                  const hex = `#${rgbValues.r.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${rgbValues.b.toString(16).padStart(2, '0')}`;
                  setForegroundColor(hex);
                }}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{rgbValues.g}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 w-4">B</span>
              <input
                type="range"
                min="0"
                max="255"
                value={rgbValues.b}
                onChange={(e) => {
                  const newB = parseInt(e.target.value);
                  setRgbValues(prev => ({ ...prev, b: newB }));
                  const hex = `#${rgbValues.r.toString(16).padStart(2, '0')}${rgbValues.g.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
                  setForegroundColor(hex);
                }}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{rgbValues.b}</span>
            </div>
          </div>
        );
        
      case 'hsb':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-400 w-4">H</span>
              <input
                type="range"
                min="0"
                max="360"
                value={hsbValues.h}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{hsbValues.h}°</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-yellow-400 w-4">S</span>
              <input
                type="range"
                min="0"
                max="100"
                value={hsbValues.s}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{hsbValues.s}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">B</span>
              <input
                type="range"
                min="0"
                max="100"
                value={hsbValues.b}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{hsbValues.b}%</span>
            </div>
          </div>
        );
        
      case 'cmyk':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-400 w-4">C</span>
              <input
                type="range"
                min="0"
                max="100"
                value={cmykValues.c}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{cmykValues.c}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-pink-400 w-4">M</span>
              <input
                type="range"
                min="0"
                max="100"
                value={cmykValues.m}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{cmykValues.m}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-yellow-400 w-4">Y</span>
              <input
                type="range"
                min="0"
                max="100"
                value={cmykValues.y}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{cmykValues.y}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">K</span>
              <input
                type="range"
                min="0"
                max="100"
                value={cmykValues.k}
                className="flex-1 h-1 bg-gray-600 rounded appearance-none slider"
              />
              <span className="text-xs text-gray-400 w-8">{cmykValues.k}%</span>
            </div>
          </div>
        );
        
      default:
        return <div className="text-gray-500 text-sm">Mode not implemented</div>;
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.Palette className="w-4 h-4 text-pink-400 mr-2" />
        <span className="text-white text-sm font-medium">Color</span>
      </div>

      {/* Current Colors */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative w-16 h-16 mx-auto">
          {/* Background Color */}
          <div
            className="absolute bottom-0 right-0 w-12 h-12 border-2 border-gray-600 cursor-pointer"
            style={{ backgroundColor: backgroundColor }}
            onClick={() => handleColorChange(backgroundColor, true)}
          />
          
          {/* Foreground Color */}
          <div
            className="absolute top-0 left-0 w-12 h-12 border-2 border-gray-600 cursor-pointer"
            style={{ backgroundColor: foregroundColor }}
            onClick={() => handleColorChange(foregroundColor, false)}
          />
          
          {/* Swap Colors Button */}
          <button
            onClick={swapColors}
            className="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 border border-gray-600 rounded flex items-center justify-center hover:bg-gray-600 transition-colors"
            title="Swap Colors"
          >
            <Icons.ArrowsRightLeft className="w-2 h-2 text-gray-400" />
          </button>
          
          {/* Reset Colors Button */}
          <button
            onClick={resetColors}
            className="absolute -bottom-1 -left-1 w-4 h-4 bg-gray-700 border border-gray-600 rounded flex items-center justify-center hover:bg-gray-600 transition-colors"
            title="Default Colors"
          >
            <Icons.Square className="w-2 h-2 text-gray-400" />
          </button>
        </div>

        {/* Hex Input */}
        <div className="mt-4">
          <input
            type="text"
            value={foregroundColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white text-center"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Color Mode Selector */}
      <div className="border-b border-gray-700">
        <div className="flex">
          {colorModes.map(mode => (
            <button
              key={mode}
              onClick={() => setActiveColorMode(mode)}
              className={`flex-1 px-3 py-2 text-xs transition-colors ${
                activeColorMode === mode
                  ? 'bg-gray-700 text-white border-b-2 border-pink-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Color Mode Inputs */}
      <div className="p-4 border-b border-gray-700">
        {renderColorModeInputs()}
      </div>

      {/* Color Swatches */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-sm text-gray-300 mb-2">Color Swatches</h4>
            <div className="grid grid-cols-6 gap-1">
              {swatches.flat().map((color, index) => (
                <button
                  key={index}
                  className="w-6 h-6 rounded border border-gray-600 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Color History */}
          <div>
            <h4 className="text-sm text-gray-300 mb-2">Recent Colors</h4>
            <div className="grid grid-cols-6 gap-1">
              {colorHistory.map((color, index) => (
                <button
                  key={index}
                  className="w-6 h-6 rounded border border-gray-600 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-2">
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Add to Swatches"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Color Picker"
        >
          <Icons.EyeDropper className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Load Swatches"
        >
          <Icons.Upload className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Save Swatches"
        >
          <Icons.Save className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ColorsPanel;