import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import CollapsibleSection from '@/plugins/editor/components/ui/CollapsibleSection.jsx';
import SliderWithTooltip from '@/plugins/editor/components/ui/SliderWithTooltip.jsx';

const MasterChannelsPanel = () => {
  const [masterSettings, setMasterSettings] = useState({
    volume: 85,
    pan: 0,
    muted: false,
    solo: false
  });

  const [masterEQ, setMasterEQ] = useState({
    lowShelf: { freq: 80, gain: 0, q: 0.7 },
    lowMid: { freq: 250, gain: 0, q: 1.0 },
    highMid: { freq: 4000, gain: 0, q: 1.0 },
    highShelf: { freq: 12000, gain: 0, q: 0.7 }
  });

  const [masterCompressor, setMasterCompressor] = useState({
    threshold: -12,
    ratio: 3,
    attack: 10,
    release: 100,
    knee: 2,
    makeupGain: 0,
    enabled: false
  });

  const [masterLimiter, setMasterLimiter] = useState({
    ceiling: -0.1,
    release: 50,
    enabled: true
  });

  const [analysisData, setAnalysisData] = useState({
    rmsLeft: -18,
    rmsRight: -17,
    peakLeft: -3,
    peakRight: -2,
    lufs: -14.2,
    dynamicRange: 8.5
  });

  const updateMasterSetting = (key, value) => {
    setMasterSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateEQBand = (band, param, value) => {
    setMasterEQ(prev => ({
      ...prev,
      [band]: { ...prev[band], [param]: value }
    }));
  };

  const updateCompressor = (key, value) => {
    setMasterCompressor(prev => ({ ...prev, [key]: value }));
  };

  const updateLimiter = (key, value) => {
    setMasterLimiter(prev => ({ ...prev, [key]: value }));
  };

  // Spectrum analyzer visualization (mock data)
  const generateSpectrumData = () => {
    return Array.from({ length: 32 }, (_, i) => ({
      frequency: Math.pow(2, i / 4) * 20,
      magnitude: Math.random() * 60 - 60
    }));
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-4 space-y-4">
      {/* Master Level Control */}
      <CollapsibleSection 
        title="Master Level"
        icon={Icons.Mixer}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Master Volume */}
          <div>
            <SliderWithTooltip
              label="Master Volume"
              value={masterSettings.volume}
              onChange={(value) => updateMasterSetting('volume', value)}
              min={0}
              max={100}
              step={1}
            />
          </div>

          {/* Master Pan */}
          <div>
            <SliderWithTooltip
              label="Master Pan"
              value={masterSettings.pan}
              onChange={(value) => updateMasterSetting('pan', value)}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          {/* Master Mute/Solo */}
          <div className="flex gap-2">
            <button
              onClick={() => updateMasterSetting('muted', !masterSettings.muted)}
              className={`flex-1 px-3 py-2 rounded font-bold text-sm transition-colors ${
                masterSettings.muted
                  ? 'bg-gray-900 text-gray-500 border border-gray-800'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              MUTE
            </button>
            <button
              onClick={() => updateMasterSetting('solo', !masterSettings.solo)}
              className={`flex-1 px-3 py-2 rounded font-bold text-sm transition-colors ${
                masterSettings.solo
                  ? 'bg-yellow-500 text-black border border-yellow-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              SOLO
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Master EQ */}
      <CollapsibleSection 
        title="Master EQ"
        icon={Icons.Settings}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* EQ Bands */}
          {Object.entries(masterEQ).map(([band, settings]) => (
            <div key={band} className="space-y-2">
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                {band.replace(/([A-Z])/g, ' $1').trim()}
              </div>
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
              <div>
                <SliderWithTooltip
                  label="Gain (dB)"
                  value={settings.gain}
                  onChange={(value) => updateEQBand(band, 'gain', value)}
                  min={-20}
                  max={20}
                  step={0.1}
                />
              </div>
            </div>
          ))}

          {/* EQ Visualization */}
          <div className="h-32 bg-gray-800 rounded border border-gray-700 p-2">
            <div className="text-xs text-gray-400 mb-2">EQ Curve</div>
            <div className="h-24 bg-gray-900 rounded relative overflow-hidden">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <linearGradient id="eqGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <g stroke="#374151" strokeWidth="1" opacity="0.3">
                  <line x1="25%" y1="0" x2="25%" y2="100%" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" />
                  <line x1="75%" y1="0" x2="75%" y2="100%" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" />
                </g>
                {/* EQ curve */}
                <path
                  d="M0,50 Q25,45 50,50 T100,48"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="url(#eqGradient)"
                />
              </svg>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Master Compressor */}
      <CollapsibleSection 
        title="Master Compressor"
        icon={Icons.Mixer}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Enable Compressor</label>
            <button
              onClick={() => updateCompressor('enabled', !masterCompressor.enabled)}
              className={`w-10 h-6 rounded-full transition-colors ${
                masterCompressor.enabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                masterCompressor.enabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {masterCompressor.enabled && (
            <div className="space-y-3">
              <SliderWithTooltip
                label="Threshold (dB)"
                value={masterCompressor.threshold}
                onChange={(value) => updateCompressor('threshold', value)}
                min={-40}
                max={0}
                step={0.1}
              />
              <SliderWithTooltip
                label="Ratio"
                value={masterCompressor.ratio}
                onChange={(value) => updateCompressor('ratio', value)}
                min={1}
                max={20}
                step={0.1}
              />
              <SliderWithTooltip
                label="Attack (ms)"
                value={masterCompressor.attack}
                onChange={(value) => updateCompressor('attack', value)}
                min={0.1}
                max={100}
                step={0.1}
              />
              <SliderWithTooltip
                label="Release (ms)"
                value={masterCompressor.release}
                onChange={(value) => updateCompressor('release', value)}
                min={10}
                max={1000}
                step={1}
              />
              <SliderWithTooltip
                label="Makeup Gain (dB)"
                value={masterCompressor.makeupGain}
                onChange={(value) => updateCompressor('makeupGain', value)}
                min={0}
                max={20}
                step={0.1}
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Master Limiter */}
      <CollapsibleSection 
        title="Master Limiter"
        icon={Icons.Settings}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Enable Limiter</label>
            <button
              onClick={() => updateLimiter('enabled', !masterLimiter.enabled)}
              className={`w-10 h-6 rounded-full transition-colors ${
                masterLimiter.enabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                masterLimiter.enabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {masterLimiter.enabled && (
            <div className="space-y-3">
              <SliderWithTooltip
                label="Ceiling (dB)"
                value={masterLimiter.ceiling}
                onChange={(value) => updateLimiter('ceiling', value)}
                min={-3}
                max={0}
                step={0.1}
              />
              <SliderWithTooltip
                label="Release (ms)"
                value={masterLimiter.release}
                onChange={(value) => updateLimiter('release', value)}
                min={1}
                max={100}
                step={1}
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Master Analysis */}
      <CollapsibleSection 
        title="Master Analysis"
        icon={Icons.Monitor}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {/* Level Meters */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Output Levels</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">RMS L/R</div>
                <div className="text-gray-200">{analysisData.rmsLeft} / {analysisData.rmsRight} dB</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">Peak L/R</div>
                <div className="text-gray-200">{analysisData.peakLeft} / {analysisData.peakRight} dB</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">LUFS</div>
                <div className="text-gray-200">{analysisData.lufs}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-gray-400">Dynamic Range</div>
                <div className="text-gray-200">{analysisData.dynamicRange} LU</div>
              </div>
            </div>
          </div>

          {/* Spectrum Analyzer */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Spectrum Analyzer</div>
            <div className="h-32 bg-gray-800 rounded border border-gray-700 p-2">
              <div className="h-full bg-gray-900 rounded relative overflow-hidden">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <defs>
                    <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/>
                      <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0.4"/>
                    </linearGradient>
                  </defs>
                  {/* Spectrum bars */}
                  {Array.from({ length: 32 }, (_, i) => (
                    <rect
                      key={i}
                      x={`${(i / 32) * 100}%`}
                      y={`${Math.random() * 80 + 10}%`}
                      width={`${100 / 32 - 1}%`}
                      height={`${Math.random() * 60 + 20}%`}
                      fill="url(#spectrumGradient)"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Analysis Controls */}
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
              Reset Peaks
            </button>
            <button className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors">
              Export Analysis
            </button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default MasterChannelsPanel;