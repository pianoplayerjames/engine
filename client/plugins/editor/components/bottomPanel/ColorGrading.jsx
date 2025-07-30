import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const ColorGrading = () => {
  const [activeTab, setActiveTab] = useState('primary');
  const [primaryControls, setPrimaryControls] = useState({
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    saturation: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0
  });
  
  const [curves, setCurves] = useState({
    master: { points: [] },
    red: { points: [] },
    green: { points: [] },
    blue: { points: [] }
  });
  
  const [wheels, setWheels] = useState({
    shadows: { x: 0, y: 0, brightness: 0 },
    midtones: { x: 0, y: 0, brightness: 0 },
    highlights: { x: 0, y: 0, brightness: 0 }
  });

  const tabs = [
    { id: 'primary', label: 'Primary', icon: Icons.AdjustmentsHorizontal },
    { id: 'curves', label: 'Curves', icon: Icons.ChartBar },
    { id: 'wheels', label: 'Color Wheels', icon: Icons.ColorSwatch },
    { id: 'scopes', label: 'Scopes', icon: Icons.ChartPie }
  ];

  const handlePrimaryControlChange = (control, value) => {
    setPrimaryControls(prev => ({
      ...prev,
      [control]: value
    }));
  };

  const resetPrimaryControls = () => {
    setPrimaryControls({
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 0,
      vibrance: 0,
      temperature: 0,
      tint: 0
    });
  };

  const renderPrimaryControls = () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      {Object.entries(primaryControls).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300 capitalize">
              {key === 'temperature' ? 'Temp' : key === 'vibrance' ? 'Vibrance' : key}
            </label>
            <span className="text-xs text-gray-500 font-mono w-8 text-right">
              {value > 0 ? '+' : ''}{value}
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="-100"
              max="100"
              value={value}
              onChange={(e) => handlePrimaryControlChange(key, parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-gray-500 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCurves = () => (
    <div className="p-4 space-y-4">
      {/* Curve Channel Selector */}
      <div className="flex gap-2">
        {['master', 'red', 'green', 'blue'].map((channel) => (
          <button
            key={channel}
            className={`px-3 py-1.5 text-sm rounded transition-colors capitalize ${
              channel === 'master' 
                ? 'bg-gray-600 text-white' 
                : `bg-${channel === 'red' ? 'red' : channel === 'green' ? 'green' : 'blue'}-600/20 text-${channel === 'red' ? 'red' : channel === 'green' ? 'green' : 'blue'}-400 hover:bg-${channel === 'red' ? 'red' : channel === 'green' ? 'green' : 'blue'}-600/30`
            }`}
          >
            {channel}
          </button>
        ))}
      </div>
      
      {/* Curve Editor */}
      <div className="bg-slate-800 rounded-lg border border-slate-600 p-4">
        <div className="aspect-square bg-slate-900 rounded relative border border-slate-600">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="grid" width="25%" height="25%" patternUnits="objectBoundingBox">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#4B5563" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Diagonal line */}
            <line x1="0" y1="100%" x2="100%" y2="0" stroke="#6B7280" strokeWidth="2" />
          </svg>
          
          {/* Curve interaction area */}
          <div className="absolute inset-0 cursor-crosshair flex items-center justify-center">
            <span className="text-gray-500 text-sm">Click to add points</span>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Shadows</span>
          <span>Highlights</span>
        </div>
      </div>
    </div>
  );

  const renderColorWheels = () => (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-4">
        {['shadows', 'midtones', 'highlights'].map((range) => (
          <div key={range} className="text-center space-y-3">
            <h4 className="text-sm font-medium text-gray-300 capitalize">{range}</h4>
            
            {/* Color Wheel */}
            <div className="relative mx-auto w-24 h-24">
              <div className="w-full h-full rounded-full bg-gradient-conic from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 border-2 border-slate-600">
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full border-2 border-slate-800 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"></div>
              </div>
            </div>
            
            {/* Brightness slider */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Brightness</div>
              <input
                type="range"
                min="-100"
                max="100"
                value={wheels[range].brightness}
                onChange={(e) => setWheels(prev => ({
                  ...prev,
                  [range]: { ...prev[range], brightness: parseInt(e.target.value) }
                }))}
                className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-gray-500 text-center">
                {wheels[range].brightness > 0 ? '+' : ''}{wheels[range].brightness}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderScopes = () => (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Waveform */}
        <div className="bg-slate-800 rounded-lg border border-slate-600 p-3">
          <div className="text-sm font-medium text-gray-300 mb-2">Waveform</div>
          <div className="aspect-video bg-slate-900 rounded border border-slate-700 flex items-center justify-center">
            <div className="text-gray-500 text-xs">No signal</div>
          </div>
        </div>
        
        {/* RGB Parade */}
        <div className="bg-slate-800 rounded-lg border border-slate-600 p-3">
          <div className="text-sm font-medium text-gray-300 mb-2">RGB Parade</div>
          <div className="aspect-video bg-slate-900 rounded border border-slate-700 flex items-center justify-center">
            <div className="text-gray-500 text-xs">No signal</div>
          </div>
        </div>
        
        {/* Histogram */}
        <div className="bg-slate-800 rounded-lg border border-slate-600 p-3">
          <div className="text-sm font-medium text-gray-300 mb-2">Histogram</div>
          <div className="aspect-video bg-slate-900 rounded border border-slate-700 flex items-center justify-center">
            <div className="text-gray-500 text-xs">No signal</div>
          </div>
        </div>
        
        {/* Vectorscope */}
        <div className="bg-slate-800 rounded-lg border border-slate-600 p-3">
          <div className="text-sm font-medium text-gray-300 mb-2">Vectorscope</div>
          <div className="aspect-square bg-slate-900 rounded border border-slate-700 flex items-center justify-center">
            <div className="text-gray-500 text-xs">No signal</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Icons.ColorSwatch className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">Color Grading</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={resetPrimaryControls}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded transition-colors"
          >
            Reset
          </button>
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
            Apply LUT
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="h-10 bg-slate-800/50 border-b border-slate-700 flex items-center px-4">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'primary' && renderPrimaryControls()}
        {activeTab === 'curves' && renderCurves()}
        {activeTab === 'wheels' && renderColorWheels()}
        {activeTab === 'scopes' && renderScopes()}
      </div>
    </div>
  );
};

export default ColorGrading;