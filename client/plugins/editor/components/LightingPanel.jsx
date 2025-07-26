// plugins/editor/components/LightingPanel.jsx
import React, { useState } from 'react';
import { Icons } from './Icons';

const lightTypes = [
  { id: 'directional', name: 'Directional Light', icon: Icons.Sun, description: 'Sun-like infinite light' },
  { id: 'point', name: 'Point Light', icon: Icons.LightBulb, description: 'Omnidirectional light source' },
  { id: 'spot', name: 'Spot Light', icon: Icons.Flashlight, description: 'Cone-shaped light beam' },
  { id: 'area', name: 'Area Light', icon: Icons.Square, description: 'Rectangular light source' },
];

const sceneLights = [
  { id: 'sun', name: 'Main Sun', type: 'directional', intensity: 1.0, color: '#ffffff', enabled: true },
  { id: 'fill', name: 'Fill Light', type: 'directional', intensity: 0.3, color: '#87ceeb', enabled: true },
  { id: 'street1', name: 'Street Lamp 1', type: 'point', intensity: 2.0, color: '#ffaa44', enabled: true },
  { id: 'street2', name: 'Street Lamp 2', type: 'point', intensity: 2.0, color: '#ffaa44', enabled: false },
  { id: 'spotlight1', name: 'Security Light', type: 'spot', intensity: 5.0, color: '#ffffff', enabled: true },
];

function LightingPanel() {
  const [selectedLight, setSelectedLight] = useState('sun');
  const [lightingMode, setLightingMode] = useState('realtime');
  const [showEnvironment, setShowEnvironment] = useState(true);

  const currentLight = sceneLights.find(light => light.id === selectedLight);

  return (
    <div className="h-full flex bg-slate-800">
      {/* Lights List */}
      <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Scene Lights</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300">+ Add Light</button>
          </div>
          
          {/* Light Types */}
          <div className="grid grid-cols-2 gap-1 mb-3">
            {lightTypes.map((type) => (
              <button
                key={type.id}
                className="flex flex-col items-center p-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-gray-300 hover:text-white transition-colors"
                title={type.description}
              >
                <type.icon className="w-4 h-4 mb-1" />
                {type.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-1 p-2">
            {sceneLights.map((light) => (
              <div
                key={light.id}
                onClick={() => setSelectedLight(light.id)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  selectedLight === light.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`w-3 h-3 rounded border-2 ${
                  light.enabled ? 'bg-yellow-500 border-yellow-500' : 'border-gray-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{light.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{light.type}</div>
                </div>
                <div 
                  className="w-4 h-4 rounded border border-gray-600"
                  style={{ backgroundColor: light.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Light Properties */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              {currentLight ? `${currentLight.name} Properties` : 'Lighting Properties'}
            </h3>
            <div className="flex items-center gap-2">
              <select 
                value={lightingMode}
                onChange={(e) => setLightingMode(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
              >
                <option value="realtime">Realtime</option>
                <option value="baked">Baked</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          {currentLight ? (
            <div className="space-y-6">
              {/* Basic Properties */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Basic Properties</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Light Type</label>
                    <select className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded">
                      <option value="directional">Directional</option>
                      <option value="point">Point</option>
                      <option value="spot">Spot</option>
                      <option value="area">Area</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Intensity</label>
                      <span className="text-xs text-white">{currentLight.intensity}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      defaultValue={currentLight.intensity}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        defaultValue={currentLight.color}
                        className="w-8 h-8 border border-slate-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        defaultValue={currentLight.color}
                        className="flex-1 bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shadows */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Shadows</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cast-shadows" defaultChecked className="text-blue-600" />
                    <label htmlFor="cast-shadows" className="text-xs text-gray-300">Cast Shadows</label>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Shadow Resolution</label>
                    <select className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded">
                      <option>512</option>
                      <option>1024</option>
                      <option>2048</option>
                      <option>4096</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Shadow Bias</label>
                      <span className="text-xs text-white">0.001</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.01"
                      step="0.0001"
                      defaultValue="0.001"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Spot Light Specific */}
              {currentLight.type === 'spot' && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Spot Light</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Spot Angle</label>
                        <span className="text-xs text-white">30°</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="179"
                        defaultValue="30"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Inner Cone</label>
                        <span className="text-xs text-white">25°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        defaultValue="25"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-sm">Select a light to edit its properties</p>
            </div>
          )}
          
          {/* Environment Lighting */}
          <div className="mt-6 p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Environment</h4>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={showEnvironment}
                  onChange={(e) => setShowEnvironment(e.target.checked)}
                  className="text-blue-600" 
                />
                <span className="text-xs text-gray-300">Enable</span>
              </label>
            </div>
            
            {showEnvironment && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Sky Material</label>
                  <select className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded">
                    <option>Procedural Sky</option>
                    <option>HDRI Skybox</option>
                    <option>Gradient Sky</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-300">Ambient Intensity</label>
                    <span className="text-xs text-white">0.2</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    defaultValue="0.2"
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LightingPanel;