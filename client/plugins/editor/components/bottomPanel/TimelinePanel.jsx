// plugins/editor/components/TimelinePanel.jsx
import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const timelineEvents = [
  { id: 'intro', name: 'Scene Intro', start: 0, duration: 5, type: 'camera', color: 'bg-blue-500' },
  { id: 'dialogue1', name: 'Character Dialogue', start: 3, duration: 8, type: 'audio', color: 'bg-green-500' },
  { id: 'action1', name: 'Action Sequence', start: 10, duration: 12, type: 'animation', color: 'bg-red-500' },
  { id: 'transition', name: 'Scene Transition', start: 20, duration: 3, type: 'effect', color: 'bg-purple-500' },
  { id: 'outro', name: 'Scene Outro', start: 23, duration: 7, type: 'camera', color: 'bg-blue-500' },
];

function TimelinePanel() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const maxTime = 30; // 30 seconds

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Timeline Controls */}
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
            
            <div className="text-sm text-gray-300 font-mono">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-16"
              />
              <span className="text-xs text-gray-300 w-8">{zoom.toFixed(1)}x</span>
            </div>
            
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              + Add Event
            </button>
          </div>
        </div>
      </div>
      
      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="p-3">
          {/* Time ruler */}
          <div className="relative mb-4" style={{ width: `${maxTime * zoom * 20}px` }}>
            <div className="h-6 border-b border-slate-600 relative">
              {Array.from({ length: maxTime + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex flex-col justify-between"
                  style={{ left: `${i * zoom * 20}px` }}
                >
                  <div className="w-px h-2 bg-slate-600" />
                  <span className="text-xs text-gray-400 -translate-x-1/2">{i}s</span>
                </div>
              ))}
              
              {/* Playhead */}
              <div
                className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
                style={{ left: `${currentTime * zoom * 20}px` }}
              >
                <div className="w-3 h-3 bg-red-500 -translate-x-1/2 -translate-y-1 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Timeline Tracks */}
          <div className="space-y-2">
            {['Camera', 'Audio', 'Animation', 'Effects'].map((trackName, trackIndex) => (
              <div key={trackName} className="flex items-center gap-3">
                <div className="w-20 text-xs text-gray-300 font-medium">{trackName}</div>
                
                <div 
                  className="relative h-8 bg-slate-700/30 rounded border border-slate-600/50 flex-1"
                  style={{ width: `${maxTime * zoom * 20}px` }}
                >
                  {timelineEvents
                    .filter(event => 
                      (trackName === 'Camera' && event.type === 'camera') ||
                      (trackName === 'Audio' && event.type === 'audio') ||
                      (trackName === 'Animation' && event.type === 'animation') ||
                      (trackName === 'Effects' && event.type === 'effect')
                    )
                    .map(event => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event.id)}
                        className={`absolute top-1 h-6 ${event.color} rounded text-white text-xs flex items-center px-2 cursor-pointer transition-all hover:opacity-80 ${
                          selectedEvent === event.id ? 'ring-2 ring-white' : ''
                        }`}
                        style={{
                          left: `${event.start * zoom * 20}px`,
                          width: `${event.duration * zoom * 20}px`,
                          minWidth: '40px'
                        }}
                      >
                        <span className="truncate">{event.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Event Properties */}
      {selectedEvent && (
        <div className="border-t border-slate-700 bg-slate-900/50 p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">
              {timelineEvents.find(e => e.id === selectedEvent)?.name}
            </h4>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-gray-400 hover:text-white"
            >
              <Icons.XMark className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-400">Start:</span>
              <span className="text-white ml-1">
                {timelineEvents.find(e => e.id === selectedEvent)?.start}s
              </span>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <span className="text-white ml-1">
                {timelineEvents.find(e => e.id === selectedEvent)?.duration}s
              </span>
            </div>
            <div>
              <span className="text-gray-400">Type:</span>
              <span className="text-white ml-1 capitalize">
                {timelineEvents.find(e => e.id === selectedEvent)?.type}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelinePanel;