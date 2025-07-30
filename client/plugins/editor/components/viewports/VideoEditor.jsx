import React, { useState, useRef, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { Icons } from '@/plugins/editor/components/Icons';
import { editorState, editorActions } from '@/plugins/editor/store.js';

const VideoEditor = () => {
  const { ui } = useSnapshot(editorState);
  const { videoTimeline } = ui;
  
  const [currentTime, setCurrentTime] = useState('00:00:00:00');
  const [duration] = useState('00:05:30:15');
  const [zoom, setZoom] = useState(100);
  const videoCanvasRef = useRef(null);
  
  // Get timeline state from global store
  const playheadPosition = videoTimeline?.playheadPosition || 0;
  const isPlaying = videoTimeline?.isPlaying || false;
  
  // Timeline controls
  const handlePlay = () => {
    editorActions.setVideoTimelineState({
      isPlaying: !isPlaying
    });
  };
  
  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    editorActions.setVideoTimelineState({
      playheadPosition: percentage * 100
    });
  };
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Video Preview Area */}
      <div className="flex-1 bg-black relative border-b border-gray-700">
        <canvas 
          ref={videoCanvasRef}
          className="w-full h-full object-contain"
          style={{ maxHeight: '100%', maxWidth: '100%' }}
        />
        
        {/* Video Preview Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Icons.Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-lg">Video Preview</div>
            <div className="text-gray-500 text-sm">Import media to begin editing</div>
          </div>
        </div>
        
        {/* Preview Controls Overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
          <button
            onClick={handlePlay}
            className="p-2 hover:bg-gray-700 rounded transition-colors text-white"
          >
            {isPlaying ? (
              <Icons.Pause className="w-5 h-5" />
            ) : (
              <Icons.Play className="w-5 h-5" />
            )}
          </button>
          
          <div className="text-white text-sm font-mono">
            {currentTime} / {duration}
          </div>
          
          <div className="flex items-center gap-2">
            <Icons.Speaker className="w-4 h-4 text-gray-400" />
            <div className="w-16 h-1 bg-gray-600 rounded">
              <div className="w-3/4 h-full bg-blue-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline Controls */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
        {/* Transport Controls */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300">
            <Icons.ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handlePlay}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-white"
          >
            {isPlaying ? (
              <Icons.Pause className="w-4 h-4" />
            ) : (
              <Icons.Play className="w-4 h-4" />
            )}
          </button>
          <button className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300">
            <Icons.ChevronRight className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300">
            <Icons.ArrowPath className="w-4 h-4" />
          </button>
        </div>
        
        {/* Time Display */}
        <div className="text-white text-sm font-mono bg-gray-900 px-3 py-1 rounded">
          {currentTime}
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Icons.MagnifyingGlassPlus className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="25"
            max="400"
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
            className="w-20 h-1 bg-gray-600 rounded appearance-none slider"
          />
          <span className="text-gray-400 text-sm">{zoom}%</span>
        </div>
        
        {/* Timeline Tools */}
        <div className="flex items-center gap-2 ml-auto">
          <button 
            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
            title="Razor Tool"
          >
            <Icons.Cut className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
            title="Selection Tool"
          >
            <Icons.CursorArrowRays className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
            title="Trim Tool"
          >
            <Icons.Trim className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Timeline Ruler */}
      <div className="h-8 bg-gray-850 border-b border-gray-700 relative">
        <div className="flex h-full">
          {/* Time markers */}
          {Array.from({ length: 21 }, (_, i) => (
            <div key={i} className="flex-1 border-r border-gray-600 text-xs text-gray-400 px-1">
              {i}:00
            </div>
          ))}
        </div>
        
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
          style={{ left: `${playheadPosition}%` }}
        >
          <div className="w-3 h-3 bg-red-500 transform -translate-x-1/2 -translate-y-1"></div>
        </div>
      </div>
      
      {/* Video Timeline */}
      <div className="flex-1 bg-gray-850 overflow-auto">
        <div className="min-h-full">
          {/* Video Tracks */}
          <div className="flex">
            {/* Track Headers */}
            <div className="w-32 bg-gray-800 border-r border-gray-700">
              <div className="h-16 border-b border-gray-700 flex items-center px-3">
                <div className="flex items-center gap-2">
                  <Icons.Video className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Video 1</span>
                </div>
              </div>
              <div className="h-12 border-b border-gray-700 flex items-center px-3">
                <div className="flex items-center gap-2">
                  <Icons.SpeakerWave className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Audio 1</span>
                </div>
              </div>
            </div>
            
            {/* Timeline Area */}
            <div className="flex-1 relative" onClick={handleTimelineClick}>
              {/* Video Track */}
              <div className="h-16 border-b border-gray-700 bg-gray-800 relative">
                {/* Sample video clip */}
                <div className="absolute left-8 top-2 bottom-2 w-32 bg-blue-600/80 rounded border border-blue-500 flex items-center justify-center">
                  <span className="text-xs text-white">Clip 1.mp4</span>
                </div>
              </div>
              
              {/* Audio Track */}
              <div className="h-12 border-b border-gray-700 bg-gray-800 relative">
                {/* Sample audio waveform */}
                <div className="absolute left-8 top-1 bottom-1 w-32 bg-green-600/60 rounded border border-green-500 flex items-center px-2">
                  <div className="flex-1 h-full flex items-center gap-px">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-green-400" 
                        style={{ height: `${Math.random() * 60 + 20}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;