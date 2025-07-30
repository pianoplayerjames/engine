import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import CollapsibleSection from '@/plugins/editor/components/ui/CollapsibleSection.jsx';
import SliderWithTooltip from '@/plugins/editor/components/ui/SliderWithTooltip.jsx';

const TrackPropertiesPanel = () => {
  // Mock selected track data
  const [selectedTrack, setSelectedTrack] = useState({
    id: 'track-001',
    name: 'Lead Synth',
    color: '#3B82F6',
    type: 'Instrument',
    volume: 78,
    pan: 0.1,
    muted: false,
    solo: false,
    armed: true,
    frozen: false,
    input: 'Synth Input',
    output: 'Master Bus',
    sends: [
      { id: 'send-1', name: 'Reverb Bus', level: 25, enabled: true },
      { id: 'send-2', name: 'Delay Bus', level: 15, enabled: false }
    ],
    eq: {
      lowShelf: { freq: 80, gain: 0, q: 0.7, enabled: true },
      lowMid: { freq: 250, gain: -2, q: 1.0, enabled: true },
      highMid: { freq: 4000, gain: 3, q: 1.0, enabled: true },
      highShelf: { freq: 12000, gain: 1, q: 0.7, enabled: true }
    },
    compressor: {
      threshold: -15,
      ratio: 4,
      attack: 5,
      release: 80,
      knee: 2,
      makeupGain: 2,
      enabled: true
    },
    plugins: [
      { id: 'plugin-1', name: 'Serum', type: 'Instrument', enabled: true, preset: 'Lead Pluck' },
      { id: 'plugin-2', name: 'Pro-Q 3', type: 'EQ', enabled: true, preset: 'Custom EQ' },
      { id: 'plugin-3', name: 'SSL Compressor', type: 'Dynamics', enabled: false, preset: 'Default' }
    ],
    automation: [
      { parameter: 'Volume', lanes: 2, hasData: true },
      { parameter: 'Pan', lanes: 1, hasData: false },
      { parameter: 'Filter Cutoff', lanes: 1, hasData: true }
    ]
  });

  const updateTrackProperty = (property, value) => {
    setSelectedTrack(prev => ({ ...prev, [property]: value }));
  };

  const updateEQBand = (band, param, value) => {
    setSelectedTrack(prev => ({
      ...prev,
      eq: {
        ...prev.eq,
        [band]: { ...prev.eq[band], [param]: value }
      }
    }));
  };

  const updateCompressor = (param, value) => {
    setSelectedTrack(prev => ({
      ...prev,
      compressor: { ...prev.compressor, [param]: value }
    }));
  };

  const updateSend = (sendId, param, value) => {
    setSelectedTrack(prev => ({
      ...prev,
      sends: prev.sends.map(send => 
        send.id === sendId ? { ...send, [param]: value } : send
      )
    }));
  };

  const togglePlugin = (pluginId) => {
    setSelectedTrack(prev => ({
      ...prev,
      plugins: prev.plugins.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, enabled: !plugin.enabled }
          : plugin
      )
    }));
  };

  if (!selectedTrack) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-500">
          <Icons.Audio className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No track selected</p>
          <p className="text-xs mt-1">Select a track to view its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-4 space-y-4">
      {/* Track Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: selectedTrack.color }}
          />
          <input
            type="text"
            value={selectedTrack.name}
            onChange={(e) => updateTrackProperty('name', e.target.value)}
            className="flex-1 bg-transparent text-lg font-medium text-gray-200 border-none focus:outline-none focus:bg-gray-700 rounded px-2 py-1"
          />
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{selectedTrack.type}</span>
          <span>•</span>
          <span>{selectedTrack.input} → {selectedTrack.output}</span>
        </div>

        {/* Track State Indicators */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => updateTrackProperty('armed', !selectedTrack.armed)}
            className={`px-2 py-1 text-xs rounded font-bold transition-colors ${
              selectedTrack.armed
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            REC
          </button>
          <button
            onClick={() => updateTrackProperty('solo', !selectedTrack.solo)}
            className={`px-2 py-1 text-xs rounded font-bold transition-colors ${
              selectedTrack.solo
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            SOLO
          </button>
          <button
            onClick={() => updateTrackProperty('muted', !selectedTrack.muted)}
            className={`px-2 py-1 text-xs rounded font-bold transition-colors ${
              selectedTrack.muted
                ? 'bg-gray-900 text-gray-500'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            MUTE
          </button>
          <button
            onClick={() => updateTrackProperty('frozen', !selectedTrack.frozen)}
            className={`px-2 py-1 text-xs rounded font-bold transition-colors ${
              selectedTrack.frozen
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            FREEZE
          </button>
        </div>
      </div>

      {/* Track Level Controls */}
      <CollapsibleSection 
        title="Track Level"
        icon={Icons.Mixer}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <SliderWithTooltip
            label="Volume"
            value={selectedTrack.volume}
            onChange={(value) => updateTrackProperty('volume', value)}
            min={0}
            max={100}
            step={1}
          />
          <SliderWithTooltip
            label="Pan"
            value={selectedTrack.pan * 100}
            onChange={(value) => updateTrackProperty('pan', value / 100)}
            min={-100}
            max={100}
            step={1}
          />
        </div>
      </CollapsibleSection>

      {/* Track EQ */}
      <CollapsibleSection 
        title="Track EQ"
        icon={Icons.Settings}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {Object.entries(selectedTrack.eq).map(([band, settings]) => (
            <div key={band} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  {band.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button
                  onClick={() => updateEQBand(band, 'enabled', !settings.enabled)}
                  className={`w-8 h-5 rounded-full transition-colors ${
                    settings.enabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-4' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {settings.enabled && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Freq (Hz)</label>
                      <input
                        type="number"
                        value={settings.freq}
                        onChange={(e) => updateEQBand(band, 'freq', parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Q</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.q}
                        onChange={(e) => updateEQBand(band, 'q', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-200"
                      />
                    </div>
                  </div>
                  <SliderWithTooltip
                    label="Gain (dB)"
                    value={settings.gain}
                    onChange={(value) => updateEQBand(band, 'gain', value)}
                    min={-20}
                    max={20}
                    step={0.1}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Track Compressor */}
      <CollapsibleSection 
        title="Track Compressor"
        icon={Icons.Mixer}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Enable Compressor</label>
            <button
              onClick={() => updateCompressor('enabled', !selectedTrack.compressor.enabled)}
              className={`w-10 h-6 rounded-full transition-colors ${
                selectedTrack.compressor.enabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                selectedTrack.compressor.enabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {selectedTrack.compressor.enabled && (
            <div className="space-y-3">
              <SliderWithTooltip
                label="Threshold (dB)"
                value={selectedTrack.compressor.threshold}
                onChange={(value) => updateCompressor('threshold', value)}
                min={-40}
                max={0}
                step={0.1}
              />
              <SliderWithTooltip
                label="Ratio"
                value={selectedTrack.compressor.ratio}
                onChange={(value) => updateCompressor('ratio', value)}
                min={1}
                max={20}
                step={0.1}
              />
              <SliderWithTooltip
                label="Attack (ms)"
                value={selectedTrack.compressor.attack}
                onChange={(value) => updateCompressor('attack', value)}
                min={0.1}
                max={100}
                step={0.1}
              />
              <SliderWithTooltip
                label="Release (ms)"
                value={selectedTrack.compressor.release}
                onChange={(value) => updateCompressor('release', value)}
                min={10}
                max={1000}
                step={1}
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Track Plugins */}
      <CollapsibleSection 
        title="Track Plugins"
        icon={Icons.Grid}
        defaultOpen={true}
      >
        <div className="space-y-2">
          {selectedTrack.plugins.map((plugin, index) => (
            <div
              key={plugin.id}
              className={`p-3 rounded-lg border transition-colors ${
                plugin.enabled
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-850 border-gray-750 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">#{index + 1}</span>
                  <div>
                    <div className="text-sm text-gray-200">{plugin.name}</div>
                    <div className="text-xs text-gray-400">{plugin.type} • {plugin.preset}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => console.log(`Opening ${plugin.name} editor`)}
                    className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
                  >
                    <Icons.Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePlugin(plugin.id)}
                    className={`w-8 h-5 rounded-full transition-colors ${
                      plugin.enabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      plugin.enabled ? 'translate-x-4' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button className="w-full p-3 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-colors">
            <Icons.Plus className="w-4 h-4 inline mr-2" />
            Add Plugin
          </button>
        </div>
      </CollapsibleSection>

      {/* Send Controls */}
      <CollapsibleSection 
        title="Send Controls"
        icon={Icons.Effects}
        defaultOpen={false}
      >
        <div className="space-y-3">
          {selectedTrack.sends.map(send => (
            <div key={send.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{send.name}</span>
                <button
                  onClick={() => updateSend(send.id, 'enabled', !send.enabled)}
                  className={`w-8 h-5 rounded-full transition-colors ${
                    send.enabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    send.enabled ? 'translate-x-4' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {send.enabled && (
                <SliderWithTooltip
                  label="Send Level"
                  value={send.level}
                  onChange={(value) => updateSend(send.id, 'level', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Automation */}
      <CollapsibleSection 
        title="Automation"
        icon={Icons.Timeline}
        defaultOpen={false}
      >
        <div className="space-y-2">
          {selectedTrack.automation.map((param, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-800 rounded"
            >
              <div>
                <div className="text-sm text-gray-200">{param.parameter}</div>
                <div className="text-xs text-gray-400">
                  {param.lanes} lane{param.lanes !== 1 ? 's' : ''}
                  {param.hasData && ' • Has automation data'}
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  className={`p-1 rounded text-xs ${
                    param.hasData
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Icons.Play className="w-3 h-3" />
                </button>
                <button className="p-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-xs">
                  <Icons.Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          
          <button className="w-full p-2 border border-dashed border-gray-600 rounded text-xs text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-colors">
            Add Automation Lane
          </button>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default TrackPropertiesPanel;