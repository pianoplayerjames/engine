import { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const terrainLayers = [
  { id: 'grass', name: 'Grass', texture: 'grass_diffuse.jpg', active: true },
  { id: 'dirt', name: 'Dirt Path', texture: 'dirt_diffuse.jpg', active: true },
  { id: 'rock', name: 'Rocky Stone', texture: 'rock_diffuse.jpg', active: true },
  { id: 'sand', name: 'Beach Sand', texture: 'sand_diffuse.jpg', active: false },
];

const brushes = [
  { id: 'height', name: 'Height', icon: Icons.AdjustmentsVertical, active: true },
  { id: 'smooth', name: 'Smooth', icon: Icons.AdjustmentsHorizontal, active: false },
  { id: 'texture', name: 'Paint Texture', icon: Icons.PaintBrush, active: false },
  { id: 'details', name: 'Place Details', icon: Icons.Sparkles, active: false },
];

function TerrainPanel() {
  const [activeBrush, setActiveBrush] = useState('height');
  const [brushSize, setBrushSize] = useState(15);
  const [brushStrength, setBrushStrength] = useState(0.5);
  const [selectedLayer, setSelectedLayer] = useState('grass');

  return (
    <div className="h-full flex bg-slate-800">
      {/* Terrain Tools */}
      <div className="w-56 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-700">
          <h3 className="text-sm font-medium text-white mb-3">Terrain Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {brushes.map((brush) => (
              <button
                key={brush.id}
                onClick={() => setActiveBrush(brush.id)}
                className={`flex flex-col items-center p-2 rounded text-xs transition-colors ${
                  activeBrush === brush.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <brush.icon className="w-5 h-5 mb-1" />
                {brush.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Brush Settings */}
        <div className="p-3 border-b border-slate-700">
          <h4 className="text-xs font-medium text-gray-300 mb-2">Brush Settings</h4>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Size</label>
                <span className="text-xs text-white">{brushSize}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Strength</label>
                <span className="text-xs text-white">{(brushStrength * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={brushStrength}
                onChange={(e) => setBrushStrength(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="falloff" className="text-blue-600" />
              <label htmlFor="falloff" className="text-xs text-gray-300">Smooth Falloff</label>
            </div>
          </div>
        </div>
        
        {/* Terrain Layers */}
        {activeBrush === 'texture' && (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-300">Texture Layers</h4>
                <button className="text-xs text-blue-400 hover:text-blue-300">+ Add</button>
              </div>
              <div className="space-y-2">
                {terrainLayers.map((layer) => (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedLayer === layer.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded border-2 ${
                      layer.active ? 'bg-green-500 border-green-500' : 'border-gray-500'
                    }`} />
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-800 rounded border border-slate-600" />
                    <div className="flex-1">
                      <div className="text-xs font-medium">{layer.name}</div>
                      <div className="text-xs text-gray-400">{layer.texture}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Terrain Properties */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Terrain Properties</h3>
            <div className="flex items-center gap-2">
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Generate Terrain
              </button>
              <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                Clear All
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          <div className="grid grid-cols-2 gap-6">
            {/* Heightmap Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">Heightmap</h4>
              
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Resolution</label>
                <select className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded">
                  <option>512x512</option>
                  <option>1024x1024</option>
                  <option>2048x2048</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Height Scale</label>
                <input
                  type="number"
                  defaultValue="100"
                  className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Import Heightmap</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="heightmap-upload"
                  />
                  <label
                    htmlFor="heightmap-upload"
                    className="flex-1 bg-slate-800 border border-slate-600 text-gray-400 text-xs p-1 rounded cursor-pointer hover:border-slate-500"
                  >
                    Choose file...
                  </label>
                  <button className="text-xs text-blue-400 hover:text-blue-300">Browse</button>
                </div>
              </div>
            </div>
            
            {/* Generation Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">Procedural Generation</h4>
              
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Noise Type</label>
                <select className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded">
                  <option>Perlin Noise</option>
                  <option>Simplex Noise</option>
                  <option>Ridged Noise</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Octaves</label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  defaultValue="4"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Frequency</label>
                <input
                  type="range"
                  min="0.001"
                  max="0.1"
                  step="0.001"
                  defaultValue="0.01"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Amplitude</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  defaultValue="1"
                  className="w-full"
                />
              </div>
              
              <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded transition-colors">
                Generate Terrain
              </button>
            </div>
          </div>
          
          {/* Terrain Statistics */}
          <div className="mt-6 p-3 bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Terrain Statistics</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Vertices:</span>
                <span className="text-white ml-1">262,144</span>
              </div>
              <div>
                <span className="text-gray-400">Triangles:</span>
                <span className="text-white ml-1">524,288</span>
              </div>
              <div>
                <span className="text-gray-400">Size:</span>
                <span className="text-white ml-1">1000x1000m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TerrainPanel;