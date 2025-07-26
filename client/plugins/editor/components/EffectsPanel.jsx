// plugins/editor/components/EffectsPanel.jsx
import React, { useState } from 'react';
import { Icons } from './Icons';

const effectTypes = [
  { id: 'particle', name: 'Particle System', icon: Icons.Sparkles, description: 'Fire, smoke, magic effects' },
  { id: 'post-processing', name: 'Post Processing', icon: Icons.AdjustmentsHorizontal, description: 'Color grading, bloom, etc.' },
  { id: 'lighting', name: 'Lighting Effects', icon: Icons.LightBulb, description: 'Volumetric fog, god rays' },
  { id: 'water', name: 'Water Effects', icon: Icons.Water, description: 'Rivers, oceans, waterfalls' },
];

const sceneEffects = [
  { id: 'fire1', name: 'Campfire', type: 'particle', enabled: true, intensity: 0.8 },
  { id: 'smoke1', name: 'Chimney Smoke', type: 'particle', enabled: true, intensity: 0.6 },
  { id: 'bloom', name: 'Screen Bloom', type: 'post-processing', enabled: true, intensity: 0.4 },
  { id: 'fog', name: 'Volumetric Fog', type: 'lighting', enabled: false, intensity: 0.3 },
  { id: 'water1', name: 'Lake Surface', type: 'water', enabled: true, intensity: 0.7 },
  { id: 'rain', name: 'Rain Particles', type: 'particle', enabled: false, intensity: 1.0 },
];

const particlePresets = [
  { id: 'fire', name: 'Fire', color: '#ff4400', icon: '🔥' },
  { id: 'smoke', name: 'Smoke', color: '#666666', icon: '💨' },
  { id: 'sparks', name: 'Sparks', color: '#ffaa00', icon: '✨' },
  { id: 'snow', name: 'Snow', color: '#ffffff', icon: '❄️' },
  { id: 'magic', name: 'Magic', color: '#aa44ff', icon: '🪄' },
  { id: 'explosion', name: 'Explosion', color: '#ff6600', icon: '💥' },
];

function EffectsPanel() {
  const [selectedEffect, setSelectedEffect] = useState('fire1');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);

  const currentEffect = sceneEffects.find(effect => effect.id === selectedEffect);
  
  const filteredEffects = sceneEffects.filter(effect => 
    selectedCategory === 'all' || effect.type === selectedCategory
  );

  return (
    <div className="h-full flex bg-slate-800">
      {/* Effects Categories */}
      <div className="w-56 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-700">
          <h3 className="text-sm font-medium text-white mb-3">Effect Types</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              All Effects
            </button>
            {effectTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedCategory(type.id)}
                className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                  selectedCategory === type.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={type.description}
              >
                <type.icon className="w-3 h-3" />
                {type.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Particle Presets */}
        {selectedCategory === 'particle' && (
          <div className="p-3 border-b border-slate-700">
            <h4 className="text-xs font-medium text-gray-300 mb-2">Quick Presets</h4>
            <div className="grid grid-cols-2 gap-1">
              {particlePresets.map((preset) => (
                <button
                  key={preset.id}
                  className="flex flex-col items-center p-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-gray-300 hover:text-white transition-colors"
                  title={preset.name}
                >
                  <span className="text-base mb-1">{preset.icon}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-1 p-2">
            {filteredEffects.map((effect) => (
              <div
                key={effect.id}
                onClick={() => setSelectedEffect(effect.id)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  selectedEffect === effect.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`w-3 h-3 rounded border-2 ${
                  effect.enabled ? 'bg-green-500 border-green-500' : 'border-gray-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{effect.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{effect.type}</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  effect.type === 'particle' ? 'bg-orange-400' :
                  effect.type === 'post-processing' ? 'bg-purple-400' :
                  effect.type === 'lighting' ? 'bg-yellow-400' : 'bg-blue-400'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Effects Properties */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              {currentEffect ? `${currentEffect.name} Properties` : 'Effects Properties'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  isPlaying
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <div className="w-2 h-2 bg-white" />
                    Stop
                  </>
                ) : (
                  <>
                    <Icons.Play className="w-3 h-3" />
                    Play
                  </>
                )}
              </button>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                + Add Effect
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          {currentEffect ? (
            <div className="space-y-6">
              {/* Basic Properties */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Basic Properties</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="enabled" 
                      defaultChecked={currentEffect.enabled} 
                      className="text-blue-600" 
                    />
                    <label htmlFor="enabled" className="text-xs text-gray-300">Enabled</label>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Intensity</label>
                      <span className="text-xs text-white">{(currentEffect.intensity * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue={currentEffect.intensity}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Type-specific properties */}
              {currentEffect.type === 'particle' && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Particle System</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">Max Particles</label>
                      <input
                        type="number"
                        defaultValue="1000"
                        min="1"
                        max="10000"
                        className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Emission Rate</label>
                        <span className="text-xs text-white">50/sec</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="500"
                        defaultValue="50"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Lifetime</label>
                        <span className="text-xs text-white">5.0s</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="20"
                        step="0.1"
                        defaultValue="5"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">Start Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          defaultValue="#ff4400"
                          className="w-8 h-8 border border-slate-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue="#ff4400"
                          className="flex-1 bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">End Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          defaultValue="#ff0000"
                          className="w-8 h-8 border border-slate-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue="#ff0000"
                          className="flex-1 bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Size</label>
                        <span className="text-xs text-white">1.0</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        defaultValue="1"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Speed</label>
                        <span className="text-xs text-white">2.0</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.1"
                        defaultValue="2"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="looping" defaultChecked className="text-blue-600" />
                      <label htmlFor="looping" className="text-xs text-gray-300">Looping</label>
                    </div>
                  </div>
                </div>
              )}
              
              {currentEffect.type === 'post-processing' && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Post Processing</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Bloom Threshold</label>
                        <span className="text-xs text-white">1.0</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        defaultValue="1"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Bloom Intensity</label>
                        <span className="text-xs text-white">0.5</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        defaultValue="0.5"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Contrast</label>
                        <span className="text-xs text-white">1.0</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        defaultValue="1"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Saturation</label>
                        <span className="text-xs text-white">1.0</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        defaultValue="1"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="vignette" className="text-blue-600" />
                      <label htmlFor="vignette" className="text-xs text-gray-300">Vignette</label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="chromatic-aberration" className="text-blue-600" />
                      <label htmlFor="chromatic-aberration" className="text-xs text-gray-300">Chromatic Aberration</label>
                    </div>
                  </div>
                </div>
              )}
              
              {currentEffect.type === 'lighting' && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Lighting Effects</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">Effect Type</label>
                      <select className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded">
                        <option>Volumetric Fog</option>
                        <option>God Rays</option>
                        <option>Light Shafts</option>
                        <option>Atmospheric Scattering</option>
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Density</label>
                        <span className="text-xs text-white">0.3</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        defaultValue="0.3"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          defaultValue="#87ceeb"
                          className="w-8 h-8 border border-slate-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          defaultValue="#87ceeb"
                          className="flex-1 bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentEffect.type === 'water' && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Water Effects</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Wave Height</label>
                        <span className="text-xs text-white">0.5</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        defaultValue="0.5"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Wave Speed</label>
                        <span className="text-xs text-white">1.0</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        defaultValue="1"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-300">Transparency</label>
                        <span className="text-xs text-white">0.8</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        defaultValue="0.8"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="foam" defaultChecked className="text-blue-600" />
                      <label htmlFor="foam" className="text-xs text-gray-300">Foam</label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="reflections" defaultChecked className="text-blue-600" />
                      <label htmlFor="reflections" className="text-xs text-gray-300">Reflections</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-sm">Select an effect to edit its properties</p>
            </div>
          )}
          
          {/* Performance Info */}
          <div className="mt-6 p-3 bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Performance</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Active Effects:</span>
                <span className="text-white ml-1">{sceneEffects.filter(e => e.enabled).length}</span>
              </div>
              <div>
                <span className="text-gray-400">GPU Usage:</span>
                <span className="text-white ml-1">45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EffectsPanel;