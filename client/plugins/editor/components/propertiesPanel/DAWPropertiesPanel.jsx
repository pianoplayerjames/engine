import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import CollapsibleSection from '@/plugins/editor/components/ui/CollapsibleSection.jsx';
import SliderWithTooltip from '@/plugins/editor/components/ui/SliderWithTooltip.jsx';

const DAWPropertiesPanel = () => {
  // DAW Settings State
  const [dawSettings, setDAWSettings] = useState({
    sampleRate: 44100,
    bufferSize: 512,
    bitDepth: 24,
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    masterVolume: 85,
    metronomeEnabled: false,
    metronomeVolume: 75,
    quantization: '1/16',
    recordingMode: 'punch',
    playbackMode: 'loop',
    autoSave: true,
    autoSaveInterval: 5
  });

  // Audio Device Settings
  const [audioSettings, setAudioSettings] = useState({
    inputDevice: 'Default Input',
    outputDevice: 'Default Output',
    inputChannels: 2,
    outputChannels: 2,
    inputGain: 75,
    outputGain: 85,
    latencyCompensation: 10
  });

  // Transport Settings
  const [transportSettings, setTransportSettings] = useState({
    preRoll: 2,
    postRoll: 2,
    clickTrack: true,
    clickTrackVolume: 70,
    punchIn: false,
    punchOut: false,
    loop: false,
    loopStart: 0,
    loopEnd: 16
  });

  const updateDAWSetting = (key, value) => {
    setDAWSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateAudioSetting = (key, value) => {
    setAudioSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateTransportSetting = (key, value) => {
    setTransportSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-4 space-y-4">
      {/* DAW Configuration */}
      <CollapsibleSection 
        title="DAW Configuration" 
        icon={Icons.Settings}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Sample Rate */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Sample Rate</label>
            <select
              value={dawSettings.sampleRate}
              onChange={(e) => updateDAWSetting('sampleRate', parseInt(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
            >
              <option value={44100}>44.1 kHz</option>
              <option value={48000}>48 kHz</option>
              <option value={88200}>88.2 kHz</option>
              <option value={96000}>96 kHz</option>
            </select>
          </div>

          {/* Buffer Size */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Buffer Size</label>
            <select
              value={dawSettings.bufferSize}
              onChange={(e) => updateDAWSetting('bufferSize', parseInt(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
            >
              <option value={128}>128 samples</option>
              <option value={256}>256 samples</option>
              <option value={512}>512 samples</option>
              <option value={1024}>1024 samples</option>
            </select>
          </div>

          {/* Bit Depth */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Bit Depth</label>
            <select
              value={dawSettings.bitDepth}
              onChange={(e) => updateDAWSetting('bitDepth', parseInt(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
            >
              <option value={16}>16-bit</option>
              <option value={24}>24-bit</option>
              <option value={32}>32-bit</option>
            </select>
          </div>

          {/* Tempo */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Tempo (BPM)</label>
            <input
              type="number"
              min="60"
              max="200"
              value={dawSettings.tempo}
              onChange={(e) => updateDAWSetting('tempo', parseInt(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
            />
          </div>

          {/* Time Signature */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Time Signature</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="16"
                value={dawSettings.timeSignature.numerator}
                onChange={(e) => updateDAWSetting('timeSignature', {
                  ...dawSettings.timeSignature,
                  numerator: parseInt(e.target.value)
                })}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
              />
              <span className="text-gray-400 self-center">/</span>
              <select
                value={dawSettings.timeSignature.denominator}
                onChange={(e) => updateDAWSetting('timeSignature', {
                  ...dawSettings.timeSignature,
                  denominator: parseInt(e.target.value)
                })}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={16}>16</option>
              </select>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Audio Devices */}
      <CollapsibleSection 
        title="Audio Devices" 
        icon={Icons.Audio}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Input Device */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Input Device</label>
            <select
              value={audioSettings.inputDevice}
              onChange={(e) => updateAudioSetting('inputDevice', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
            >
              <option value="Default Input">Default Input</option>
              <option value="Microphone Array">Microphone Array</option>
              <option value="Audio Interface">Audio Interface</option>
              <option value="USB Microphone">USB Microphone</option>
            </select>
          </div>

          {/* Output Device */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Output Device</label>
            <select
              value={audioSettings.outputDevice}
              onChange={(e) => updateAudioSetting('outputDevice', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
            >
              <option value="Default Output">Default Output</option>
              <option value="Speakers">Speakers</option>
              <option value="Headphones">Headphones</option>
              <option value="Audio Interface">Audio Interface</option>
            </select>
          </div>

          {/* Input Gain */}
          <div>
            <SliderWithTooltip
              label="Input Gain"
              value={audioSettings.inputGain}
              onChange={(value) => updateAudioSetting('inputGain', value)}
              min={0}
              max={100}
              step={1}
            />
          </div>

          {/* Output Gain */}
          <div>
            <SliderWithTooltip
              label="Output Gain"
              value={audioSettings.outputGain}
              onChange={(value) => updateAudioSetting('outputGain', value)}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Transport Settings */}
      <CollapsibleSection 
        title="Transport & Recording" 
        icon={Icons.Play}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {/* Metronome */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Metronome</label>
            <button
              onClick={() => updateDAWSetting('metronomeEnabled', !dawSettings.metronomeEnabled)}
              className={`w-10 h-6 rounded-full transition-colors ${
                dawSettings.metronomeEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                dawSettings.metronomeEnabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Metronome Volume */}
          {dawSettings.metronomeEnabled && (
            <div>
              <SliderWithTooltip
                label="Metronome Volume"
                value={dawSettings.metronomeVolume}
                onChange={(value) => updateDAWSetting('metronomeVolume', value)}
                min={0}
                max={100}
                step={1}
              />
            </div>
          )}

          {/* Quantization */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Quantization</label>
            <select
              value={dawSettings.quantization}
              onChange={(e) => updateDAWSetting('quantization', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
            >
              <option value="off">Off</option>
              <option value="1/32">1/32 Note</option>
              <option value="1/16">1/16 Note</option>
              <option value="1/8">1/8 Note</option>
              <option value="1/4">1/4 Note</option>
            </select>
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Auto Save</label>
            <button
              onClick={() => updateDAWSetting('autoSave', !dawSettings.autoSave)}
              className={`w-10 h-6 rounded-full transition-colors ${
                dawSettings.autoSave ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                dawSettings.autoSave ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Auto Save Interval */}
          {dawSettings.autoSave && (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Auto Save Interval (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={dawSettings.autoSaveInterval}
                onChange={(e) => updateDAWSetting('autoSaveInterval', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Master Section */}
      <CollapsibleSection 
        title="Master Section" 
        icon={Icons.Mixer}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {/* Master Volume */}
          <div>
            <SliderWithTooltip
              label="Master Volume"
              value={dawSettings.masterVolume}
              onChange={(value) => updateDAWSetting('masterVolume', value)}
              min={0}
              max={100}
              step={1}
            />
          </div>

          {/* Performance Stats */}
          <div className="bg-gray-800 rounded p-3 space-y-2">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Performance</div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">CPU Usage</span>
              <span className="text-gray-200">12%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Memory Usage</span>
              <span className="text-gray-200">245 MB</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Audio Latency</span>
              <span className="text-gray-200">10.7 ms</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Active Tracks</span>
              <span className="text-gray-200">6</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default DAWPropertiesPanel;