import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import CollapsibleSection from '@/plugins/editor/components/ui/CollapsibleSection';

const ExportSettingsPanel = () => {
  const [exportSettings, setExportSettings] = useState({
    // Output Settings
    format: 'mp4',
    codec: 'h264',
    quality: 'high',
    resolution: '1920x1080',
    frameRate: 30,
    bitrate: 8000,
    
    // Audio Settings
    audioCodec: 'aac',
    audioSampleRate: 48000,
    audioBitrate: 320,
    audioChannels: 'stereo',
    
    // Advanced Settings
    profile: 'main',
    level: '4.1',
    keyframeInterval: 250,
    bFrames: 2,
    adaptiveBitrate: true,
    
    // Output
    outputPath: '/Users/Documents/Videos/',
    filename: 'video_export',
    
    // Range
    exportRange: 'all', // 'all', 'selection', 'custom'
    customStart: '00:00:00:00',
    customEnd: '00:05:30:15'
  });

  const [exportProgress, setExportProgress] = useState({
    isExporting: false,
    progress: 0,
    stage: '',
    timeRemaining: ''
  });

  const formats = [
    { id: 'mp4', name: 'MP4', extension: '.mp4', description: 'Most compatible format' },
    { id: 'mov', name: 'QuickTime', extension: '.mov', description: 'High quality, large files' },
    { id: 'avi', name: 'AVI', extension: '.avi', description: 'Legacy format' },
    { id: 'webm', name: 'WebM', extension: '.webm', description: 'Web optimized' },
    { id: 'mkv', name: 'Matroska', extension: '.mkv', description: 'Open source container' }
  ];

  const codecs = {
    mp4: [
      { id: 'h264', name: 'H.264', description: 'Best compatibility' },
      { id: 'h265', name: 'H.265/HEVC', description: 'Better compression, newer' }
    ],
    mov: [
      { id: 'prores', name: 'Apple ProRes', description: 'Professional quality' },
      { id: 'h264', name: 'H.264', description: 'Standard quality' }
    ],
    webm: [
      { id: 'vp9', name: 'VP9', description: 'Google codec' },
      { id: 'av1', name: 'AV1', description: 'Next-gen codec' }
    ]
  };

  const qualityPresets = [
    { id: 'draft', name: 'Draft', bitrate: 2000, description: 'Fast export, low quality' },
    { id: 'medium', name: 'Medium', bitrate: 5000, description: 'Balanced quality/size' },
    { id: 'high', name: 'High', bitrate: 8000, description: 'High quality' },
    { id: 'maximum', name: 'Maximum', bitrate: 15000, description: 'Best quality, large files' },
    { id: 'custom', name: 'Custom', bitrate: 8000, description: 'Manual settings' }
  ];

  const resolutions = [
    '3840x2160', '2560x1440', '1920x1080', '1280x720', '854x480', '640x360'
  ];

  const frameRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];

  const handleSettingChange = (key, value) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleQualityChange = (quality) => {
    const preset = qualityPresets.find(p => p.id === quality);
    if (preset) {
      setExportSettings(prev => ({
        ...prev,
        quality: quality,
        bitrate: preset.bitrate
      }));
    }
  };

  const startExport = () => {
    setExportProgress({
      isExporting: true,
      progress: 0,
      stage: 'Initializing...',
      timeRemaining: 'Calculating...'
    });

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        const newProgress = prev.progress + Math.random() * 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            isExporting: false,
            progress: 100,
            stage: 'Export complete!',
            timeRemaining: '00:00'
          };
        }
        return {
          ...prev,
          progress: newProgress,
          stage: newProgress < 30 ? 'Encoding video...' : 
                 newProgress < 80 ? 'Processing audio...' : 'Finalizing...',
          timeRemaining: `${Math.floor((100 - newProgress) / 10)}:${Math.floor(((100 - newProgress) % 10) * 6).toString().padStart(2, '0')}`
        };
      });
    }, 200);
  };

  const cancelExport = () => {
    setExportProgress({
      isExporting: false,
      progress: 0,
      stage: '',
      timeRemaining: ''
    });
  };

  const estimateFileSize = () => {
    const duration = 330; // 5:30 in seconds
    const videoBitrate = exportSettings.bitrate;
    const audioBitrate = exportSettings.audioBitrate;
    const totalBitrate = videoBitrate + audioBitrate;
    const sizeInMB = (totalBitrate * duration) / (8 * 1000);
    return Math.round(sizeInMB);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800/95 border-b border-slate-700 flex items-center px-4">
        <div className="flex items-center gap-2">
          <Icons.Film className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-gray-200">Export Settings</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Export Progress */}
        {exportProgress.isExporting && (
          <div className="p-4 bg-blue-950/50 border-b border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-200">Exporting Video</span>
              <button
                onClick={cancelExport}
                className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="w-full h-2 bg-blue-900 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${exportProgress.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-blue-300">
              <span>{exportProgress.stage}</span>
              <span>{Math.round(exportProgress.progress)}% - {exportProgress.timeRemaining}</span>
            </div>
          </div>
        )}

        {/* Output Format */}
        <CollapsibleSection title="Output Format" defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
              <select
                value={exportSettings.format}
                onChange={(e) => handleSettingChange('format', e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              >
                {formats.map(format => (
                  <option key={format.id} value={format.id}>
                    {format.name} ({format.extension}) - {format.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Video Codec</label>
              <select
                value={exportSettings.codec}
                onChange={(e) => handleSettingChange('codec', e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              >
                {(codecs[exportSettings.format] || codecs.mp4).map(codec => (
                  <option key={codec.id} value={codec.id}>
                    {codec.name} - {codec.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quality Preset</label>
              <div className="space-y-2">
                {qualityPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleQualityChange(preset.id)}
                    className={`w-full flex items-center justify-between p-3 rounded border transition-colors ${
                      exportSettings.quality === preset.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs opacity-75">{preset.description}</div>
                    </div>
                    <div className="text-xs">{preset.bitrate} kbps</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Video Settings */}
        <CollapsibleSection title="Video Settings" defaultOpen={true}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
                <select
                  value={exportSettings.resolution}
                  onChange={(e) => handleSettingChange('resolution', e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  {resolutions.map(res => (
                    <option key={res} value={res}>{res}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Frame Rate</label>
                <select
                  value={exportSettings.frameRate}
                  onChange={(e) => handleSettingChange('frameRate', parseFloat(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  {frameRates.map(fps => (
                    <option key={fps} value={fps}>{fps} fps</option>
                  ))}
                </select>
              </div>
            </div>

            {exportSettings.quality === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bitrate: {exportSettings.bitrate} kbps
                </label>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={exportSettings.bitrate}
                  onChange={(e) => handleSettingChange('bitrate', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5 Mbps</span>
                  <span>50 Mbps</span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Audio Settings */}
        <CollapsibleSection title="Audio Settings" defaultOpen={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Audio Codec</label>
                <select
                  value={exportSettings.audioCodec}
                  onChange={(e) => handleSettingChange('audioCodec', e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="aac">AAC</option>
                  <option value="mp3">MP3</option>
                  <option value="pcm">PCM (Uncompressed)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sample Rate</label>
                <select
                  value={exportSettings.audioSampleRate}
                  onChange={(e) => handleSettingChange('audioSampleRate', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value={44100}>44.1 kHz</option>
                  <option value={48000}>48 kHz</option>
                  <option value={96000}>96 kHz</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Audio Bitrate</label>
                <select
                  value={exportSettings.audioBitrate}
                  onChange={(e) => handleSettingChange('audioBitrate', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value={128}>128 kbps</option>
                  <option value={192}>192 kbps</option>
                  <option value={256}>256 kbps</option>
                  <option value={320}>320 kbps</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Channels</label>
                <select
                  value={exportSettings.audioChannels}
                  onChange={(e) => handleSettingChange('audioChannels', e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="mono">Mono</option>
                  <option value="stereo">Stereo</option>
                  <option value="5.1">5.1 Surround</option>
                </select>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Export Range */}
        <CollapsibleSection title="Export Range" defaultOpen={false}>
          <div className="space-y-4">
            <div className="space-y-2">
              {[
                { id: 'all', name: 'Entire Timeline', desc: 'Export the complete video' },
                { id: 'selection', name: 'Selection Only', desc: 'Export selected clips' },
                { id: 'custom', name: 'Custom Range', desc: 'Specify start and end times' }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => handleSettingChange('exportRange', option.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded border transition-colors ${
                    exportSettings.exportRange === option.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-750'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    exportSettings.exportRange === option.id ? 'border-white bg-white' : 'border-gray-500'
                  }`}>
                    {exportSettings.exportRange === option.id && <div className="w-2 h-2 bg-blue-600 rounded-full m-0.5" />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs opacity-75">{option.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {exportSettings.exportRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                  <input
                    type="text"
                    value={exportSettings.customStart}
                    onChange={(e) => handleSettingChange('customStart', e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 font-mono focus:outline-none focus:border-blue-500"
                    placeholder="HH:MM:SS:FF"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                  <input
                    type="text"
                    value={exportSettings.customEnd}
                    onChange={(e) => handleSettingChange('customEnd', e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 font-mono focus:outline-none focus:border-blue-500"
                    placeholder="HH:MM:SS:FF"
                  />
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Output Settings */}
        <CollapsibleSection title="Output" defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Output Directory</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={exportSettings.outputPath}
                  onChange={(e) => handleSettingChange('outputPath', e.target.value)}
                  className="flex-1 p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
                <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-sm text-gray-300 transition-colors">
                  Browse
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filename</label>
              <input
                type="text"
                value={exportSettings.filename}
                onChange={(e) => handleSettingChange('filename', e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                Full path: {exportSettings.outputPath}{exportSettings.filename}{formats.find(f => f.id === exportSettings.format)?.extension}
              </div>
            </div>

            {/* File Size Estimate */}
            <div className="p-3 bg-slate-800 rounded border border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Estimated file size:</span>
                <span className="text-sm font-mono text-blue-400">{estimateFileSize()} MB</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Export Button */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <button
          onClick={startExport}
          disabled={exportProgress.isExporting}
          className={`w-full py-3 rounded font-medium transition-colors ${
            exportProgress.isExporting
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {exportProgress.isExporting ? 'Exporting...' : 'Start Export'}
        </button>
      </div>
    </div>
  );
};

export default ExportSettingsPanel;