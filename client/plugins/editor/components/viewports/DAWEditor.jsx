import React, { useState, useRef, useCallback } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';

// Channel Strip Component
const ChannelStrip = ({ channel, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const stripRef = useRef(null);

  const handleFaderChange = (value) => {
    onUpdate(channel.id, { volume: value });
  };

  const handlePanChange = (value) => {
    onUpdate(channel.id, { pan: (value - 50) / 50 }); // Convert to -1 to 1
  };

  const toggleMute = () => {
    onUpdate(channel.id, { muted: !channel.muted });
  };

  const toggleSolo = () => {
    onUpdate(channel.id, { solo: !channel.solo });
  };

  const toggleRecord = () => {
    onUpdate(channel.id, { recording: !channel.recording });
  };

  return (
    <div className="w-20 bg-gray-800 border-r border-gray-700 flex flex-col h-full" ref={stripRef}>
      {/* Channel Header */}
      <div className="p-2 border-b border-gray-700">
        <div className="text-xs text-center text-gray-300 font-medium mb-1">{channel.name}</div>
        <div className="text-xs text-center text-gray-500">{channel.type}</div>
      </div>

      {/* Controls Section */}
      <div className="p-2 space-y-2 border-b border-gray-700">
        {/* Input Gain */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Gain</div>
          <input
            type="range"
            min="0"
            max="100"
            value={channel.gain || 75}
            onChange={(e) => onUpdate(channel.id, { gain: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* High EQ */}
        <div>
          <div className="text-xs text-gray-400 mb-1">High</div>
          <input
            type="range"
            min="0"
            max="100"
            value={channel.eqHigh || 50}
            onChange={(e) => onUpdate(channel.id, { eqHigh: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Mid EQ */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Mid</div>
          <input
            type="range"
            min="0"
            max="100"
            value={channel.eqMid || 50}
            onChange={(e) => onUpdate(channel.id, { eqMid: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Low EQ */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Low</div>
          <input
            type="range"
            min="0"
            max="100"
            value={channel.eqLow || 50}
            onChange={(e) => onUpdate(channel.id, { eqLow: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Send Controls */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Send A</div>
          <input
            type="range"
            min="0"
            max="100"
            value={channel.sendA || 0}
            onChange={(e) => onUpdate(channel.id, { sendA: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Pan Control */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Pan</div>
          <input
            type="range"
            min="0"
            max="100"
            value={((channel.pan || 0) * 50) + 50} // Convert from -1,1 to 0,100
            onChange={(e) => handlePanChange(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Button Controls */}
      <div className="p-2 space-y-1 border-b border-gray-700">
        <button
          onClick={toggleRecord}
          className={`w-full px-2 py-1 text-xs rounded transition-colors ${
            channel.recording
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          REC
        </button>
        <button
          onClick={toggleSolo}
          className={`w-full px-2 py-1 text-xs rounded transition-colors ${
            channel.solo
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          SOLO
        </button>
        <button
          onClick={toggleMute}
          className={`w-full px-2 py-1 text-xs rounded transition-colors ${
            channel.muted
              ? 'bg-gray-900 text-gray-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          MUTE
        </button>
      </div>

      {/* Volume Fader */}
      <div className="flex-1 flex flex-col items-center justify-end p-2">
        <div className="text-xs text-gray-400 mb-2">{Math.round(channel.volume || 75)}</div>
        <input
          type="range"
          min="0"
          max="100"
          value={channel.volume || 75}
          onChange={(e) => handleFaderChange(parseInt(e.target.value))}
          className="slider-vertical h-32 w-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          orient="vertical"
        />
      </div>

      {/* Channel Level Meters */}
      <div className="p-2 flex justify-center space-x-1">
        <div className="w-1 h-16 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all"
            style={{ height: `${Math.min(100, (channel.level || 0) * 100)}%`, transform: 'translateY(100%)' }}
          />
        </div>
        <div className="w-1 h-16 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all"
            style={{ height: `${Math.min(100, (channel.levelR || 0) * 100)}%`, transform: 'translateY(100%)' }}
          />
        </div>
      </div>
    </div>
  );
};

// Track Timeline Component
const TrackTimeline = ({ tracks, currentTime, onTimeChange }) => {
  const timelineRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleTimelineClick = (e) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * 120 * zoom; // 120 seconds max
      onTimeChange(newTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-gray-850 border-t border-gray-700">
      {/* Transport Controls */}        
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
        <button 
          onClick={() => onTimeChange(0)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <Icons.SkipBack className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
        >
          {isPlaying ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4" />}
        </button>
        <button 
          onClick={() => console.log('Stop')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <Icons.Square className="w-4 h-4" />
        </button>
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <Icons.Circle className="w-4 h-4" />
        </button>

        <div className="mx-4 text-sm text-gray-300">
          {formatTime(currentTime)}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">Zoom:</span>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-8 bg-gray-750 border-b border-gray-600 relative" ref={timelineRef} onClick={handleTimelineClick}>
        {Array.from({ length: 13 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full border-l border-gray-600"
            style={{ left: `${(i * 10) / zoom}%` }}
          >
            <div className="text-xs text-gray-400 ml-1 mt-1">{i * 10}s</div>
          </div>
        ))}
        {/* Playhead */}
        <div
          className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
          style={{ left: `${(currentTime / (120 * zoom)) * 100}%` }}
        />
      </div>

      {/* Track Areas */}
      <div className="flex-1 overflow-auto">
        {tracks.map((track, index) => (
          <div key={track.id} className="h-16 border-b border-gray-700 flex">
            {/* Track Header */}
            <div className="w-48 bg-gray-800 border-r border-gray-700 flex items-center px-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${track.color}`} />
                <span className="text-sm text-gray-300">{track.name}</span>
              </div>
              <div className="ml-auto flex gap-1">
                <button className="text-xs text-gray-500 hover:text-gray-300">M</button>
                <button className="text-xs text-gray-500 hover:text-gray-300">S</button>
                <button className="text-xs text-red-500 hover:text-red-400">●</button>
              </div>
            </div>

            {/* Track Content */}
            <div className="flex-1 bg-gray-900 relative">
              {track.clips?.map((clip, clipIndex) => (
                <div
                  key={clipIndex}
                  className="absolute h-12 mt-2 bg-blue-600/80 border border-blue-500 rounded overflow-hidden cursor-pointer hover:bg-blue-600"
                  style={{
                    left: `${(clip.start / (120 * zoom)) * 100}%`,
                    width: `${(clip.duration / (120 * zoom)) * 100}%`
                  }}
                >
                  <div className="p-1">
                    <div className="text-xs text-white font-medium truncate">{clip.name}</div>
                    <div className="text-xs text-blue-200 truncate">{clip.type}</div>
                  </div>
                  {/* Waveform representation */}
                  <div className="absolute bottom-0 left-0 right-0 h-3 opacity-30">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute bottom-0 w-0.5 bg-white"
                        style={{
                          left: `${i * 5}%`,
                          height: `${Math.random() * 100}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main DAW Editor Component - Timeline-focused interface
const DAWEditor = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [tracks] = useState([
    {
      id: 'track1',
      name: 'Drums',
      color: 'bg-red-500',
      clips: [
        { name: 'Drum Loop 1', type: 'Audio', start: 0, duration: 32 },
        { name: 'Drum Fill', type: 'Audio', start: 32, duration: 4 }
      ]
    },
    {
      id: 'track2',
      name: 'Bass',
      color: 'bg-blue-500',
      clips: [
        { name: 'Bass Line', type: 'MIDI', start: 0, duration: 64 }
      ]
    },
    {
      id: 'track3',
      name: 'Lead Synth',
      color: 'bg-green-500',
      clips: [
        { name: 'Lead Melody', type: 'MIDI', start: 16, duration: 48 },
        { name: 'Lead Solo', type: 'MIDI', start: 80, duration: 16 }
      ]
    },
    {
      id: 'track4',
      name: 'Vocals',
      color: 'bg-purple-500',
      clips: [
        { name: 'Verse 1', type: 'Audio', start: 16, duration: 16 },
        { name: 'Chorus', type: 'Audio', start: 48, duration: 16 }
      ]
    },
    {
      id: 'track5',
      name: 'Piano',
      color: 'bg-yellow-500',
      clips: [
        { name: 'Piano Intro', type: 'MIDI', start: 0, duration: 16 },
        { name: 'Piano Bridge', type: 'MIDI', start: 64, duration: 32 }
      ]
    },
    {
      id: 'track6',
      name: 'Guitar',
      color: 'bg-orange-500',
      clips: [
        { name: 'Rhythm Guitar', type: 'Audio', start: 16, duration: 80 }
      ]
    }
  ]);

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Enhanced Track Timeline - Full viewport */}
      <TrackTimeline
        tracks={tracks}
        currentTime={currentTime}
        onTimeChange={setCurrentTime}
      />
    </div>
  );
};

export default DAWEditor;