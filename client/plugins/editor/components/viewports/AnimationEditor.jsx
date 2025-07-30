import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';

const AnimationEditor = () => {
  const [selectedTrack, setSelectedTrack] = useState('transform');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameRate, setFrameRate] = useState(24);
  const [timelineZoom, setTimelineZoom] = useState(1);

  const animationTracks = [
    { id: 'transform', name: 'Transform', type: 'transform', color: '#3B82F6' },
    { id: 'rotation', name: 'Rotation', type: 'rotation', color: '#10B981' },
    { id: 'scale', name: 'Scale', type: 'scale', color: '#F59E0B' },
    { id: 'material', name: 'Material', type: 'material', color: '#8B5CF6' },
    { id: 'visibility', name: 'Visibility', type: 'boolean', color: '#EF4444' }
  ];

  const keyframes = [
    { frame: 0, value: [0, 0, 0], track: 'transform' },
    { frame: 24, value: [5, 0, 0], track: 'transform' },
    { frame: 48, value: [5, 5, 0], track: 'transform' },
    { frame: 72, value: [0, 5, 0], track: 'transform' },
    { frame: 96, value: [0, 0, 0], track: 'transform' },
  ];

  const totalFrames = 120;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const Timeline = () => (
    <div className="flex-1 bg-gray-800 overflow-x-auto">
      {/* Timeline Header */}
      <div className="sticky top-0 bg-gray-750 border-b border-gray-600 p-2">
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-400">Frame: {currentFrame}/{totalFrames}</div>
          <div className="text-xs text-gray-400">Time: {(currentFrame / frameRate).toFixed(2)}s</div>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="bg-gray-750 border-b border-gray-600 p-2">
        <div className="relative h-6" style={{ width: `${totalFrames * 20 * timelineZoom}px` }}>
          {/* Frame markers */}
          {Array.from({ length: Math.ceil(totalFrames / 5) }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 text-xs text-gray-400"
              style={{ left: `${i * 5 * 20 * timelineZoom}px` }}
            >
              <div className="w-px h-4 bg-gray-500" />
              <div className="mt-1">{i * 5}</div>
            </div>
          ))}
          
          {/* Current frame indicator */}
          <div
            className="absolute top-0 w-px h-full bg-red-500 z-10"
            style={{ left: `${currentFrame * 20 * timelineZoom}px` }}
          />
        </div>
      </div>

      {/* Animation Tracks */}
      <div className="min-h-64">
        {animationTracks.map((track) => (
          <div
            key={track.id}
            className={`border-b border-gray-700 transition-colors ${
              selectedTrack === track.id ? 'bg-gray-750' : 'bg-gray-800'
            }`}
          >
            <div className="flex">
              {/* Track Label */}
              <div className="w-48 p-3 border-r border-gray-700 flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-sm text-gray-300">{track.name}</span>
                <button className="ml-auto text-gray-500 hover:text-gray-300">
                  <Icons.EyeOff className="w-4 h-4" />
                </button>
              </div>

              {/* Track Timeline */}
              <div 
                className="flex-1 relative h-12 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newFrame = Math.round(clickX / (20 * timelineZoom));
                  setCurrentFrame(Math.max(0, Math.min(totalFrames, newFrame)));
                }}
                style={{ width: `${totalFrames * 20 * timelineZoom}px` }}
              >
                {/* Keyframes for this track */}
                {keyframes
                  .filter(kf => kf.track === track.id)
                  .map((keyframe, index) => (
                    <div
                      key={index}
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded border-2 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `${keyframe.frame * 20 * timelineZoom - 6}px`,
                        backgroundColor: track.color,
                        borderColor: track.color
                      }}
                      title={`Frame ${keyframe.frame}: ${JSON.stringify(keyframe.value)}`}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Animation Controls */}
      <div className="bg-gray-850 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentFrame(0)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Go to Start"
            >
              <Icons.SkipBack className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Previous Frame"
            >
              <Icons.ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setCurrentFrame(Math.min(totalFrames, currentFrame + 1))}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Next Frame"
            >
              <Icons.ChevronRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentFrame(totalFrames)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Go to End"
            >
              <Icons.SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Frame Rate and Timeline Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">FPS:</label>
              <select
                value={frameRate}
                onChange={(e) => setFrameRate(parseInt(e.target.value))}
                className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">Zoom:</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={timelineZoom}
                onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
                className="w-16 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <button className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors">
              Add Keyframe
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* 3D Preview */}
        <div className="flex-1 bg-gray-800 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Icons.Play className="w-12 h-12 text-white" />
              </div>
              <div className="text-sm text-gray-400 mb-2">Animation Preview</div>
              <div className="text-xs text-gray-500">
                Frame {currentFrame} of {totalFrames}
              </div>
            </div>
          </div>
          
          {/* Preview controls overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button className="p-2 bg-gray-900/80 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-colors">
              <Icons.RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-2 bg-gray-900/80 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-colors">
              <Icons.Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-72 bg-gray-900 border-l border-gray-700 flex flex-col">
          {/* Keyframe Properties */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Keyframe Properties</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Frame</label>
                <input
                  type="number"
                  value={currentFrame}
                  onChange={(e) => setCurrentFrame(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Interpolation</label>
                <select className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300">
                  <option>Linear</option>
                  <option>Bezier</option>
                  <option>Constant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Easing</label>
                <select className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300">
                  <option>Ease In Out</option>
                  <option>Ease In</option>
                  <option>Ease Out</option>
                  <option>Linear</option>
                </select>
              </div>
            </div>
          </div>

          {/* Animation Layers */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Animation Layers</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <span className="text-xs text-gray-300">Base Layer</span>
                <div className="flex items-center gap-1">
                  <button className="text-gray-500 hover:text-gray-300">
                    <Icons.Eye className="w-3 h-3" />
                  </button>
                  <button className="text-gray-500 hover:text-gray-300">
                    <Icons.Lock className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h3>
            
            <div className="space-y-2">
              <button className="w-full px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-left">
                Duplicate Animation
              </button>
              <button className="w-full px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-left">
                Reverse Animation
              </button>
              <button className="w-full px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-left">
                Export Animation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Panel */}
      <div className="h-80 border-t border-gray-700 bg-gray-850">
        <Timeline />
      </div>
    </div>
  );
};

export default AnimationEditor;