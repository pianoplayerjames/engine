// plugins/editor/components/AnimationPanel.jsx
import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const animationClips = [
  { id: 'idle', name: 'Idle', duration: '2.5s', frames: 60, status: 'active' },
  { id: 'walk', name: 'Walk Cycle', duration: '1.2s', frames: 30, status: 'active' },
  { id: 'run', name: 'Run Cycle', duration: '0.8s', frames: 24, status: 'active' },
  { id: 'jump', name: 'Jump', duration: '1.8s', frames: 45, status: 'inactive' },
  { id: 'attack', name: 'Attack Combo', duration: '2.1s', frames: 52, status: 'inactive' },
];

function AnimationPanel() {
  const [selectedClip, setSelectedClip] = useState('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(15);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  return (
    <div className="h-full flex bg-slate-800">
      {/* Animation Clips List */}
      <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Animation Clips</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300">+ New</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-1 p-2">
            {animationClips.map((clip) => (
              <div
                key={clip.id}
                onClick={() => setSelectedClip(clip.id)}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedClip === clip.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icons.Play className="w-3 h-3" />
                    <span className="text-sm font-medium">{clip.name}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    clip.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
                  }`} />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {clip.duration} • {clip.frames} frames
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Animation Timeline & Controls */}
      <div className="flex-1 flex flex-col">
        {/* Controls */}
        <div className="p-3 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                {isPlaying ? (
                  <div className="w-2 h-2 bg-white" />
                ) : (
                  <Icons.Play className="w-4 h-4 text-white ml-0.5" />
                )}
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Icons.ArrowUturnLeft className="w-4 h-4" />
              </button>
              <div className="text-sm text-gray-300">
                Frame: <span className="text-white font-mono">{currentFrame}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Speed:</span>
                <select 
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                >
                  <option value={0.25}>0.25x</option>
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex-1 p-3">
          <div className="bg-slate-900/50 rounded-lg p-3 h-full">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">
                {animationClips.find(clip => clip.id === selectedClip)?.name}
              </h4>
              <div className="text-xs text-gray-400">
                Duration: {animationClips.find(clip => clip.id === selectedClip)?.duration}
              </div>
            </div>
            
            {/* Timeline Track */}
            <div className="relative">
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(currentFrame / 60) * 100}%` }}
                />
              </div>
              
              {/* Frame markers */}
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>0</span>
                <span>15</span>
                <span>30</span>
                <span>45</span>
                <span>60</span>
              </div>
            </div>
            
            {/* Keyframes */}
            <div className="mt-6">
              <h5 className="text-xs font-medium text-gray-300 mb-2">Keyframes</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="text-xs text-gray-300">Transform</span>
                  <span className="text-xs text-gray-500 ml-auto">Frame 0, 30, 60</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-gray-300">Rotation</span>
                  <span className="text-xs text-gray-500 ml-auto">Frame 15, 45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimationPanel;