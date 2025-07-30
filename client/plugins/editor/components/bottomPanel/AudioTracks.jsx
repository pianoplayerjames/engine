import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const AudioTracks = () => {
  const [tracks, setTracks] = useState([
    {
      id: 1,
      name: 'Master',
      type: 'master',
      volume: 0,
      pan: 0,
      muted: false,
      solo: false,
      armed: false,
      level: { left: -12, right: -15 }
    },
    {
      id: 2,
      name: 'Dialog',
      type: 'audio',
      volume: -6,
      pan: 0,
      muted: false,
      solo: false,
      armed: false,
      level: { left: -18, right: -20 }
    },
    {
      id: 3,
      name: 'Music',
      type: 'audio',
      volume: -12,
      pan: 0,
      muted: false,
      solo: false,
      armed: false,
      level: { left: -25, right: -22 }
    },
    {
      id: 4,
      name: 'SFX',
      type: 'audio',
      volume: -8,
      pan: 0.3,
      muted: false,
      solo: false,
      armed: false,
      level: { left: -30, right: -35 }
    }
  ]);

  const [selectedTrack, setSelectedTrack] = useState(null);

  const handleVolumeChange = (trackId, volume) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, volume: parseFloat(volume) } : track
    ));
  };

  const handlePanChange = (trackId, pan) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, pan: parseFloat(pan) } : track
    ));
  };

  const handleToggle = (trackId, property) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, [property]: !track[property] } : track
    ));
  };

  const getLevelColor = (level) => {
    if (level > -6) return 'bg-red-500';
    if (level > -12) return 'bg-yellow-500';
    if (level > -24) return 'bg-green-500';
    return 'bg-gray-600';
  };

  const formatDb = (value) => {
    if (value === -Infinity) return '-∞';
    return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
  };

  const addTrack = () => {
    const newTrack = {
      id: Date.now(),
      name: `Audio ${tracks.filter(t => t.type === 'audio').length}`,
      type: 'audio',
      volume: 0,
      pan: 0,
      muted: false,
      solo: false,
      armed: false,
      level: { left: -60, right: -60 }
    };
    setTracks(prev => [...prev, newTrack]);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Icons.SpeakerWave className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-gray-200">Audio Tracks</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={addTrack}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-2"
          >
            <Icons.Plus className="w-4 h-4" />
            Add Track
          </button>
        </div>
      </div>

      {/* Track Mixer */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-4 min-w-max">
          {tracks.map((track) => (
            <div 
              key={track.id}
              className={`w-20 bg-slate-800 rounded-lg border ${
                selectedTrack === track.id ? 'border-blue-500' : 'border-slate-700'
              } p-3 flex flex-col gap-3 cursor-pointer transition-colors`}
              onClick={() => setSelectedTrack(track.id)}
            >
              {/* Track Name */}
              <div className="text-center">
                <div className="text-xs font-medium text-gray-300 truncate" title={track.name}>
                  {track.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {track.type === 'master' ? 'MASTER' : 'AUDIO'}
                </div>
              </div>

              {/* Level Meters */}
              <div className="flex gap-1 justify-center h-32">
                <div className="w-2 bg-slate-700 rounded-full relative overflow-hidden">
                  <div 
                    className={`absolute bottom-0 w-full transition-all duration-100 ${getLevelColor(track.level.left)}`}
                    style={{ height: `${Math.max(0, (track.level.left + 60) / 60 * 100)}%` }}
                  />
                </div>
                <div className="w-2 bg-slate-700 rounded-full relative overflow-hidden">
                  <div 
                    className={`absolute bottom-0 w-full transition-all duration-100 ${getLevelColor(track.level.right)}`}
                    style={{ height: `${Math.max(0, (track.level.right + 60) / 60 * 100)}%` }}
                  />
                </div>
              </div>

              {/* Pan Control */}
              <div className="space-y-1">
                <div className="text-xs text-gray-500 text-center">PAN</div>
                <div className="relative">
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={track.pan}
                    onChange={(e) => handlePanChange(track.id, e.target.value)}
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer slider"
                  />
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-gray-500 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {track.pan === 0 ? 'C' : track.pan > 0 ? `R${Math.round(track.pan * 100)}` : `L${Math.round(Math.abs(track.pan) * 100)}`}
                </div>
              </div>

              {/* Volume Fader */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="text-xs text-gray-500 text-center mb-2">VOL</div>
                <div className="h-24 relative">
                  <input
                    type="range"
                    min="-60"
                    max="12"
                    step="0.1"
                    value={track.volume}
                    onChange={(e) => handleVolumeChange(track.id, e.target.value)}
                    className="h-full w-1 bg-slate-700 rounded appearance-none cursor-pointer slider vertical-slider"
                    style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-center mt-2 font-mono">
                  {formatDb(track.volume)}dB
                </div>
              </div>

              {/* Control Buttons */}
              <div className="space-y-2">
                {track.type !== 'master' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(track.id, 'armed');
                    }}
                    className={`w-full py-1 text-xs rounded transition-colors ${
                      track.armed
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    }`}
                  >
                    REC
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(track.id, 'solo');
                  }}
                  className={`w-full py-1 text-xs rounded transition-colors ${
                    track.solo
                      ? 'bg-yellow-600 text-white'
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                  }`}
                >
                  SOLO
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(track.id, 'muted');
                  }}
                  className={`w-full py-1 text-xs rounded transition-colors ${
                    track.muted
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                  }`}
                >
                  MUTE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transport and Master Controls */}
      <div className="h-16 bg-slate-800 border-t border-slate-700 flex items-center px-4 gap-6">
        {/* Transport */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded transition-colors text-gray-300">
            <Icons.ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded transition-colors text-white">
            <Icons.Play className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded transition-colors text-gray-300">
            <Icons.ChevronRight className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded transition-colors text-red-400">
            <Icons.Circle className="w-5 h-5" />
          </button>
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Master</span>
          <div className="flex items-center gap-1">
            <Icons.SpeakerWave className="w-4 h-4 text-gray-500" />
            <div className="w-24 h-2 bg-slate-700 rounded">
              <div 
                className="h-full bg-green-500 rounded transition-all"
                style={{ width: `${Math.max(0, (tracks[0]?.volume + 60) / 72 * 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-mono w-12">
              {formatDb(tracks[0]?.volume || 0)}dB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioTracks;