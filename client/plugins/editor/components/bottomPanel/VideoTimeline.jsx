import React, { useState, useRef, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { Icons } from '@/plugins/editor/components/Icons';
import { editorState, editorActions } from '@/plugins/editor/store.js';

const VideoTimeline = () => {
  const { ui } = useSnapshot(editorState);
  const { videoTimeline } = ui;
  
  // Get state from global store
  const playheadPosition = videoTimeline.playheadPosition;
  const isPlaying = videoTimeline.isPlaying;
  const selectedTool = videoTimeline.selectedTool;
  const timelineZoom = videoTimeline.zoom;
  const tracks = videoTimeline.tracks;
  
  const timelineRef = useRef(null);
  const [dragState, setDragState] = useState({ dragging: false, startX: 0 });

  const tools = [
    { id: 'select', icon: Icons.CursorArrowRays, tooltip: 'Selection Tool' },
    { id: 'razor', icon: Icons.Cut, tooltip: 'Razor Tool' },
    { id: 'slip', icon: Icons.ArrowsRightLeft, tooltip: 'Slip Tool' },
    { id: 'trim', icon: Icons.Trim, tooltip: 'Trim Tool' },
  ];

  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    editorActions.setVideoPlayheadPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTrackToggle = (trackId, property) => {
    editorActions.updateVideoTrack(trackId, { [property]: !tracks.find(t => t.id === trackId)?.[property] });
  };

  const addTrack = (type) => {
    editorActions.addVideoTrack(type);
  };

  const formatTime = (percentage) => {
    const totalSeconds = (percentage / 100) * 300; // Assume 5 minute timeline
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const frames = Math.floor((totalSeconds % 1) * 30);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Timeline Controls */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4">
        {/* Transport Controls */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-slate-700 rounded transition-colors text-gray-300">
            <Icons.ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editorActions.setVideoPlaying(!isPlaying)}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-white"
          >
            {isPlaying ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4" />}
          </button>
          <button className="p-1.5 hover:bg-slate-700 rounded transition-colors text-gray-300">
            <Icons.ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1 bg-slate-700 rounded p-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => editorActions.setVideoTimelineState({ selectedTool: tool.id })}
              className={`p-1.5 rounded transition-colors ${
                selectedTool === tool.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-600'
              }`}
              title={tool.tooltip}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Time Display */}
        <div className="text-white text-sm font-mono bg-slate-900 px-3 py-1 rounded">
          {formatTime(playheadPosition)}
        </div>

        {/* Zoom Control */}
        <div className="flex items-center gap-2">
          <Icons.MagnifyingGlassPlus className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="25"
            max="400"
            value={timelineZoom}
            onChange={(e) => editorActions.setVideoTimelineState({ zoom: parseInt(e.target.value) })}
            className="w-20 h-1 bg-slate-600 rounded appearance-none slider"
          />
          <span className="text-gray-400 text-sm">{timelineZoom}%</span>
        </div>

        {/* Add Track */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => addTrack('video')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-2"
          >
            <Icons.Video className="w-4 h-4" />
            Video
          </button>
          <button
            onClick={() => addTrack('audio')}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-2"
          >
            <Icons.SpeakerWave className="w-4 h-4" />
            Audio
          </button>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-8 bg-slate-800 border-b border-slate-700 relative flex">
        <div className="w-32 bg-slate-800 border-r border-slate-700 flex items-center justify-center">
          <span className="text-xs text-gray-500">TRACKS</span>
        </div>
        
        <div ref={timelineRef} className="flex-1 relative cursor-pointer" onClick={handleTimelineClick}>
          {/* Time markers */}
          <div className="h-full flex">
            {Array.from({ length: 21 }, (_, i) => (
              <div key={i} className="flex-1 border-r border-slate-600 text-xs text-gray-400 px-1 flex items-center">
                {Math.floor(i / 4)}:{(i % 4) * 15}
              </div>
            ))}
          </div>
          
          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{ left: `${playheadPosition}%` }}
          >
            <div className="w-3 h-3 bg-red-500 transform -translate-x-1/2"></div>
          </div>
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Track Headers */}
          <div className="w-32 bg-slate-800 border-r border-slate-700">
            {tracks.map((track) => (
              <div 
                key={track.id}
                className="border-b border-slate-700 bg-slate-800 flex items-center px-2 gap-2"
                style={{ height: track.height }}
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTrackToggle(track.id, 'muted')}
                    className={`p-1 rounded transition-colors ${
                      track.muted ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                    title={track.muted ? 'Unmute' : 'Mute'}
                  >
                    {track.muted ? <Icons.SpeakerXMark className="w-3 h-3" /> : <Icons.SpeakerWave className="w-3 h-3" />}
                  </button>
                  
                  <button
                    onClick={() => handleTrackToggle(track.id, 'locked')}
                    className={`p-1 rounded transition-colors ${
                      track.locked ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                    title={track.locked ? 'Unlock' : 'Lock'}
                  >
                    {track.locked ? <Icons.LockClosed className="w-3 h-3" /> : <Icons.LockOpen className="w-3 h-3" />}
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-300 truncate">{track.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {track.type === 'video' ? (
                      <Icons.Video className="w-3 h-3 text-blue-400" />
                    ) : (
                      <Icons.SpeakerWave className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Track Content Area */}
          <div className="flex-1 relative">
            {tracks.map((track, index) => (
              <div 
                key={track.id}
                className="border-b border-slate-700 bg-slate-850 relative"
                style={{ height: track.height }}
              >
                {/* Sample clips */}
                {track.type === 'video' && index === 0 && (
                  <div className="absolute left-8 top-2 bottom-2 w-32 bg-blue-600/80 rounded border border-blue-500 flex items-center justify-center cursor-pointer">
                    <span className="text-xs text-white">Clip 1.mp4</span>
                  </div>
                )}
                
                {track.type === 'audio' && index === 1 && (
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
                )}
              </div>
            ))}
            
            {/* Playhead line extends through tracks */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
              style={{ left: `${playheadPosition}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTimeline;