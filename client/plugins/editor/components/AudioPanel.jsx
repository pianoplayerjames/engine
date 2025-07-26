// plugins/editor/components/AudioPanel.jsx
import React, { useState } from 'react';
import { Icons } from './Icons';

const audioSources = [
  { id: 'bgm', name: 'Background Music', type: 'music', file: 'ambient_forest.ogg', playing: true, volume: 0.6, loop: true },
  { id: 'footsteps', name: 'Player Footsteps', type: 'sfx', file: 'footstep_grass.wav', playing: false, volume: 0.8, loop: false },
  { id: 'wind', name: 'Wind Ambience', type: 'ambient', file: 'wind_loop.ogg', playing: true, volume: 0.3, loop: true },
  { id: 'ui-click', name: 'UI Click Sound', type: 'ui', file: 'click_01.wav', playing: false, volume: 1.0, loop: false },
  { id: 'door-open', name: 'Door Opening', type: 'sfx', file: 'door_creak.wav', playing: false, volume: 0.7, loop: false },
];

const audioTypes = [
  { id: 'all', label: 'All Audio', count: audioSources.length },
  { id: 'music', label: 'Music', count: audioSources.filter(a => a.type === 'music').length },
  { id: 'sfx', label: 'Sound Effects', count: audioSources.filter(a => a.type === 'sfx').length },
  { id: 'ambient', label: 'Ambient', count: audioSources.filter(a => a.type === 'ambient').length },
  { id: 'ui', label: 'UI Sounds', count: audioSources.filter(a => a.type === 'ui').length },
];

const audioFormats = [
  { ext: 'wav', name: 'WAV (Uncompressed)', quality: 'Highest', size: 'Large' },
  { ext: 'ogg', name: 'OGG Vorbis', quality: 'High', size: 'Medium' },
  { ext: 'mp3', name: 'MP3', quality: 'Medium', size: 'Small' },
];

function AudioPanel() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAudio, setSelectedAudio] = useState('bgm');
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAudio = audioSources.filter(audio => {
    const matchesType = selectedType === 'all' || audio.type === selectedType;
    const matchesSearch = audio.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const currentAudio = audioSources.find(audio => audio.id === selectedAudio);

  return (
    <div className="h-full flex bg-slate-800">
      {/* Audio Categories */}
      <div className="w-48 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-700">
          <div className="relative mb-3">
            <Icons.MagnifyingGlass className="w-3 h-3 absolute left-2 top-1.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search audio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-300">Master Volume</label>
              <span className="text-xs text-white">{Math.round(masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-1 p-2">
            {audioTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full flex items-center justify-between px-2 py-2 text-left text-xs rounded hover:bg-slate-800 transition-colors ${
                  selectedType === type.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span>{type.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedType === type.id 
                    ? 'text-white bg-blue-500' 
                    : 'text-gray-400 bg-slate-700'
                }`}>{type.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Audio List */}
      <div className="w-80 border-r border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              {audioTypes.find(type => type.id === selectedType)?.label || 'Audio Sources'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{filteredAudio.length} files</span>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                + Import
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          <div className="space-y-2">
            {filteredAudio.map((audio) => (
              <div
                key={audio.id}
                onClick={() => setSelectedAudio(audio.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all group ${
                  selectedAudio === audio.id
                    ? 'border-blue-500 bg-blue-600/10'
                    : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      audio.playing ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium text-white">{audio.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-slate-600 rounded text-gray-400 hover:text-white">
                      <Icons.Play className="w-3 h-3" />
                    </button>
                    <button className="p-1 hover:bg-slate-600 rounded text-gray-400 hover:text-white">
                      <Icons.Pencil className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mb-2">
                  {audio.file} • {audio.type}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${audio.volume * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{Math.round(audio.volume * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredAudio.length === 0 && searchQuery && (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-sm">No audio files found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Audio Properties */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              {currentAudio ? `${currentAudio.name} Properties` : 'Audio Properties'}
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-slate-800 rounded text-gray-400 hover:text-green-400 transition-colors">
                <Icons.Play className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-800 rounded text-gray-400 hover:text-red-400 transition-colors">
                <div className="w-4 h-4 bg-current" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          {currentAudio ? (
            <div className="space-y-6">
              {/* Basic Properties */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Basic Properties</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Audio Clip</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={currentAudio.file}
                        readOnly
                        className="flex-1 bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                      />
                      <button className="text-xs text-blue-400 hover:text-blue-300">Browse</button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Volume</label>
                      <span className="text-xs text-white">{Math.round(currentAudio.volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue={currentAudio.volume}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Pitch</label>
                      <span className="text-xs text-white">1.0</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="loop" 
                      defaultChecked={currentAudio.loop} 
                      className="text-blue-600" 
                    />
                    <label htmlFor="loop" className="text-xs text-gray-300">Loop</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="play-on-awake" 
                      defaultChecked={currentAudio.playing} 
                      className="text-blue-600" 
                    />
                    <label htmlFor="play-on-awake" className="text-xs text-gray-300">Play on Awake</label>
                  </div>
                </div>
              </div>
              
              {/* 3D Sound Settings */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">3D Sound Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Spatial Blend</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue="1"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>2D</span>
                      <span>3D</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Doppler Level</label>
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
                      <label className="text-xs font-medium text-gray-300">Min Distance</label>
                      <span className="text-xs text-white">1m</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="100"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Max Distance</label>
                      <span className="text-xs text-white">500m</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="1000"
                      step="1"
                      defaultValue="500"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Volume Rolloff</label>
                    <select className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded">
                      <option>Logarithmic Rolloff</option>
                      <option>Linear Rolloff</option>
                      <option>Custom Rolloff</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Audio Effects */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Audio Effects</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">Reverb Zone</span>
                    <input type="checkbox" className="text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">Low Pass Filter</span>
                    <input type="checkbox" className="text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">High Pass Filter</span>
                    <input type="checkbox" className="text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">Distortion</span>
                    <input type="checkbox" className="text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-sm">Select an audio source to edit its properties</p>
            </div>
          )}
          
          {/* Audio Mixer */}
          <div className="mt-6 p-3 bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-3">Audio Mixer Groups</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Master</span>
                <span className="text-xs text-white">0 dB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Music</span>
                <span className="text-xs text-white">-6 dB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">SFX</span>
                <span className="text-xs text-white">-3 dB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Voice</span>
                <span className="text-xs text-white">0 dB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioPanel;