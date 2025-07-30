import React, { useState, useRef, useCallback } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

// Circular Knob Component
const CircularKnob = ({ 
  value = 50, 
  min = 0, 
  max = 100, 
  onChange, 
  label,
  size = 'md',
  color = 'blue'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startValue, setStartValue] = useState(value);
  const knobRef = useRef(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-blue-500 bg-gradient-to-br from-blue-600 to-blue-800',
    green: 'border-green-500 bg-gradient-to-br from-green-600 to-green-800',
    orange: 'border-orange-500 bg-gradient-to-br from-orange-600 to-orange-800',
    red: 'border-red-500 bg-gradient-to-br from-red-600 to-red-800',
    gray: 'border-gray-500 bg-gradient-to-br from-gray-600 to-gray-800'
  };

  // Convert value to angle (-135 to +135 degrees)
  const valueToAngle = (val) => {
    const normalized = (val - min) / (max - min);
    return -135 + (normalized * 270);
  };

  const handleMouseDown = useCallback((e) => {
    if (!knobRef.current) return;
    
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    
    setIsDragging(true);
    setStartAngle(angle);
    setStartValue(value);
    
    e.preventDefault();
  }, [value]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !knobRef.current) return;
    
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    const angleDiff = currentAngle - startAngle;
    
    // Convert angle difference to value change
    const valueChange = (angleDiff / 270) * (max - min);
    const newValue = Math.max(min, Math.min(max, startValue + valueChange));
    
    onChange?.(Math.round(newValue));
  }, [isDragging, startAngle, startValue, min, max, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const angle = valueToAngle(value);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={knobRef}
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          rounded-full border-2 relative cursor-pointer
          shadow-lg shadow-black/50
          transition-all duration-100
          ${isDragging ? 'scale-110 shadow-xl' : 'hover:scale-105'}
        `}
        onMouseDown={handleMouseDown}
      >
        {/* Knob indicator */}
        <div
          className="absolute w-1 h-3 bg-white rounded-full shadow-sm"
          style={{
            top: '6px',
            left: '50%',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: `center ${size === 'sm' ? '10px' : size === 'md' ? '14px' : '18px'}`
          }}
        />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
        </div>
      </div>
      
      {label && (
        <div className="text-xs text-gray-400 mt-1 text-center leading-tight">
          {label}
        </div>
      )}
      
      {/* Value display */}
      <div className="text-xs text-gray-300 font-mono mt-0.5">
        {Math.round(value)}
      </div>
    </div>
  );
};

// Professional Vertical Fader Component
const VerticalFader = ({ 
  value = 75, 
  min = 0, 
  max = 100, 
  onChange,
  height = 120,
  color = 'blue'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  };

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    updateValue(e);
    e.preventDefault();
  }, []);

  const updateValue = useCallback((e) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, (rect.height - y) / rect.height));
    const newValue = min + (percentage * (max - min));
    
    onChange?.(Math.round(newValue));
  }, [min, max, onChange]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      updateValue(e);
    }
  }, [isDragging, updateValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col items-center">
      {/* Fader Track */}
      <div
        ref={trackRef}
        className="relative w-6 bg-gray-800 border border-gray-600 rounded-full shadow-inner cursor-pointer"
        style={{ height: `${height}px` }}
        onMouseDown={handleMouseDown}
      >
        {/* Track groove */}
        <div className="absolute inset-x-1 inset-y-1 bg-gray-900 rounded-full" />
        
        {/* Active track */}
        <div
          className={`absolute inset-x-1 ${colorClasses[color]} rounded-full transition-all duration-100`}
          style={{
            bottom: '4px',
            height: `${Math.max(0, percentage - 3)}%`
          }}
        />
        
        {/* Fader Handle */}
        <div
          className={`
            absolute w-8 h-4 -left-1 
            bg-gradient-to-b from-gray-300 to-gray-500
            border border-gray-400 rounded-sm shadow-lg
            transition-all duration-100
            ${isDragging ? 'scale-110 shadow-xl' : 'hover:scale-105'}
          `}
          style={{
            bottom: `${percentage}%`,
            transform: 'translateY(50%)'
          }}
        >
          {/* Handle grip lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-0.5 bg-gray-600 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Value display */}
      <div className="text-xs text-gray-300 font-mono mt-2">
        {Math.round(value)}
      </div>
    </div>
  );
};

// Professional Mixer Button Component
const MixerButton = ({ 
  active = false, 
  onClick, 
  variant = 'default',
  size = 'md',
  children,
  className = ''
}) => {
  const variants = {
    default: active 
      ? 'bg-gray-600 text-white border-gray-500' 
      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700',
    record: active 
      ? 'bg-red-600 text-white border-red-500 shadow-red-500/50' 
      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-red-900 hover:text-red-300',
    solo: active 
      ? 'bg-yellow-500 text-black border-yellow-400 shadow-yellow-500/50' 
      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-yellow-900 hover:text-yellow-300',
    mute: active 
      ? 'bg-gray-900 text-gray-500 border-gray-800' 
      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs min-w-[2rem]',
    md: 'px-3 py-1.5 text-xs min-w-[2.5rem]',
    lg: 'px-4 py-2 text-sm min-w-[3rem]'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        border rounded font-bold transition-all duration-100
        shadow-lg hover:shadow-xl
        ${active && variant !== 'mute' ? 'shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Level Meter Component
const LevelMeter = ({ level = 0, peak = 0 }) => {
  const segments = 20;
  const levelSegments = Math.floor((level * segments));
  const peakSegment = Math.floor((peak * segments));

  return (
    <div className="w-3 h-32 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden">
      <div className="h-full flex flex-col-reverse">
        {Array.from({ length: segments }, (_, i) => {
          const isLit = i < levelSegments;
          const isPeak = i === peakSegment;
          
          let segmentColor = 'bg-gray-800';
          if (isLit || isPeak) {
            if (i < segments * 0.7) segmentColor = 'bg-green-500';
            else if (i < segments * 0.9) segmentColor = 'bg-yellow-500';
            else segmentColor = 'bg-red-500';
          }
          
          return (
            <div
              key={i}
              className={`flex-1 mx-0.5 mb-0.5 rounded-sm transition-colors duration-75 ${segmentColor}`}
            />
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Channel Strip Component
const ChannelStrip = ({ channel, onUpdate }) => {
  const updateChannel = (property, value) => {
    onUpdate(channel.id, { [property]: value });
  };

  return (
    <div className="w-24 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-600 flex flex-col h-full shadow-lg">
      {/* Channel Header */}
      <div className="p-2 border-b border-gray-700 bg-gray-750">
        <input
          type="text"
          value={channel.name}
          onChange={(e) => updateChannel('name', e.target.value)}
          className="w-full text-xs text-center text-gray-200 bg-transparent border-none focus:outline-none focus:bg-gray-800 rounded px-1"
        />
        <div className="text-xs text-center text-gray-500 mt-1">{channel.type}</div>
      </div>

      {/* Gain Control */}
      <div className="p-2 border-b border-gray-700">
        <CircularKnob
          value={channel.gain || 75}
          min={0}
          max={100}
          onChange={(value) => updateChannel('gain', value)}
          label="GAIN"
          size="sm"
          color="orange"
        />
      </div>

      {/* EQ Section */}
      <div className="p-2 border-b border-gray-700">
        <div className="space-y-3">
          <CircularKnob
            value={channel.eqHigh || 50}
            min={0}
            max={100}
            onChange={(value) => updateChannel('eqHigh', value)}
            label="HIGH"
            size="sm"
            color="blue"
          />
          <CircularKnob
            value={channel.eqMid || 50}
            min={0}
            max={100}
            onChange={(value) => updateChannel('eqMid', value)}
            label="MID"
            size="sm"
            color="green"
          />
          <CircularKnob
            value={channel.eqLow || 50}
            min={0}
            max={100}
            onChange={(value) => updateChannel('eqLow', value)}
            label="LOW"
            size="sm"
            color="red"
          />
        </div>
      </div>

      {/* Send Controls */}
      <div className="p-2 border-b border-gray-700">
        <div className="space-y-2">
          <CircularKnob
            value={channel.sendA || 0}
            min={0}
            max={100}
            onChange={(value) => updateChannel('sendA', value)}
            label="AUX A"
            size="sm"
            color="gray"
          />
          <CircularKnob
            value={channel.sendB || 0}
            min={0}
            max={100}
            onChange={(value) => updateChannel('sendB', value)}
            label="AUX B"
            size="sm"
            color="gray"
          />
        </div>
      </div>

      {/* Pan Control */}
      <div className="p-2 border-b border-gray-700">
        <CircularKnob
          value={((channel.pan || 0) * 50) + 50}
          min={0}
          max={100}
          onChange={(value) => updateChannel('pan', (value - 50) / 50)}
          label="PAN"
          size="sm"
          color="blue"
        />
      </div>

      {/* Button Controls */}
      <div className="p-2 space-y-1 border-b border-gray-700">
        <MixerButton
          active={channel.recording}
          onClick={() => updateChannel('recording', !channel.recording)}
          variant="record"
          size="sm"
        >
          REC
        </MixerButton>
        <MixerButton
          active={channel.solo}
          onClick={() => updateChannel('solo', !channel.solo)}
          variant="solo"
          size="sm"
        >
          SOLO
        </MixerButton>
        <MixerButton
          active={channel.muted}
          onClick={() => updateChannel('muted', !channel.muted)}
          variant="mute"
          size="sm"
        >
          MUTE
        </MixerButton>
      </div>

      {/* Volume Fader */}
      <div className="flex-1 flex items-end justify-center p-2 pt-4">
        <VerticalFader
          value={channel.volume || 75}
          min={0}
          max={100}
          onChange={(value) => updateChannel('volume', value)}
          height={120}
          color={channel.muted ? 'gray' : 'blue'}
        />
      </div>

      {/* Level Meters */}
      <div className="p-2 flex justify-center space-x-1">
        <LevelMeter level={channel.level || 0} peak={channel.peak || 0} />
        <LevelMeter level={channel.levelR || 0} peak={channel.peakR || 0} />
      </div>
    </div>
  );
};

// Main Channel Mixer Component
const ChannelMixer = () => {
  const [channels, setChannels] = useState([
    {
      id: 'ch1',
      name: 'Kick',
      type: 'Audio',
      volume: 75,
      pan: 0,
      muted: false,
      solo: false,
      recording: false,
      gain: 75,
      eqHigh: 50,
      eqMid: 50,
      eqLow: 50,
      sendA: 0,
      sendB: 0,
      level: 0.7,
      levelR: 0.6,
      peak: 0.8,
      peakR: 0.7
    },
    {
      id: 'ch2',
      name: 'Snare',
      type: 'Audio',
      volume: 80,
      pan: 0.2,
      muted: false,
      solo: false,
      recording: false,
      gain: 80,
      eqHigh: 60,
      eqMid: 45,
      eqLow: 55,
      sendA: 20,
      sendB: 15,
      level: 0.8,
      levelR: 0.7,
      peak: 0.9,
      peakR: 0.8
    },
    {
      id: 'ch3',
      name: 'Hi-Hat',
      type: 'Audio',
      volume: 65,
      pan: -0.3,
      muted: false,
      solo: false,
      recording: false,
      gain: 70,
      eqHigh: 70,
      eqMid: 40,
      eqLow: 30,
      sendA: 15,
      sendB: 10,
      level: 0.5,
      levelR: 0.6,
      peak: 0.6,
      peakR: 0.7
    },
    {
      id: 'ch4',
      name: 'Bass',
      type: 'Inst',
      volume: 85,
      pan: 0,
      muted: false,
      solo: false,
      recording: false,
      gain: 85,
      eqHigh: 30,
      eqMid: 50,
      eqLow: 75,
      sendA: 5,
      sendB: 0,
      level: 0.9,
      levelR: 0.9,
      peak: 0.95,
      peakR: 0.95
    },
    {
      id: 'ch5',
      name: 'Lead',
      type: 'Inst',
      volume: 70,
      pan: 0.1,
      muted: false,
      solo: false,
      recording: true,
      gain: 70,
      eqHigh: 65,
      eqMid: 55,
      eqLow: 45,
      sendA: 30,
      sendB: 25,
      level: 0.6,
      levelR: 0.7,
      peak: 0.7,
      peakR: 0.8
    },
    {
      id: 'ch6',
      name: 'Vocals',
      type: 'Audio',
      volume: 78,
      pan: 0,
      muted: false,
      solo: false,
      recording: false,
      gain: 78,
      eqHigh: 55,
      eqMid: 60,
      eqLow: 40,
      sendA: 40,
      sendB: 35,
      level: 0.75,
      levelR: 0.8,
      peak: 0.85,
      peakR: 0.9
    },
    {
      id: 'master',
      name: 'Master',
      type: 'Master',
      volume: 85,
      pan: 0,
      muted: false,
      solo: false,
      recording: false,
      gain: 85,
      eqHigh: 50,
      eqMid: 50,
      eqLow: 50,
      sendA: 0,
      sendB: 0,
      level: 0.8,
      levelR: 0.8,
      peak: 0.85,
      peakR: 0.85
    }
  ]);

  const updateChannel = (channelId, updates) => {
    setChannels(channels.map(ch => 
      ch.id === channelId ? { ...ch, ...updates } : ch
    ));
  };

  const addChannel = () => {
    const newChannel = {
      id: `ch${channels.length}`,
      name: `Channel ${channels.length}`,
      type: 'Audio',
      volume: 75,
      pan: 0,
      muted: false,
      solo: false,
      recording: false,
      gain: 75,
      eqHigh: 50,
      eqMid: 50,
      eqLow: 50,
      sendA: 0,
      sendB: 0,
      level: 0,
      levelR: 0,
      peak: 0,
      peakR: 0
    };
    setChannels([...channels.slice(0, -1), newChannel, channels[channels.length - 1]]);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black flex overflow-x-auto">
      {/* Mixer Header */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 flex items-center px-4 z-10">
        <div className="text-sm font-semibold text-gray-200">Channel Mixer</div>
        <div className="ml-auto flex items-center space-x-2">
          <MixerButton size="sm" onClick={addChannel}>
            <Icons.Plus className="w-3 h-3" />
          </MixerButton>
        </div>
      </div>

      {/* Channel Strips Container */}
      <div className="flex pt-8 bg-gradient-to-b from-gray-800 to-gray-900">
        {channels.map((channel) => (
          <ChannelStrip
            key={channel.id}
            channel={channel}
            onUpdate={updateChannel}
          />
        ))}
      </div>
    </div>
  );
};

export default ChannelMixer;