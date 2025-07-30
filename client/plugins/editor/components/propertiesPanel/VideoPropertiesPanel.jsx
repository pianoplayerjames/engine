import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import CollapsibleSection from '@/plugins/editor/components/ui/CollapsibleSection';

const VideoPropertiesPanel = () => {
  const [videoSettings, setVideoSettings] = useState({
    // Project Settings
    resolution: '1920x1080',
    frameRate: 30,
    duration: '00:05:30:15',
    pixelAspectRatio: '1.0',
    
    // Video Properties
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    gamma: 1.0,
    
    // Transform
    positionX: 0,
    positionY: 0,
    scaleX: 100,
    scaleY: 100,
    rotation: 0,
    opacity: 100,
    
    // Cropping
    cropTop: 0,
    cropBottom: 0,
    cropLeft: 0,
    cropRight: 0,
    
    // Motion Blur
    motionBlurEnabled: false,
    motionBlurAngle: 0,
    motionBlurDistance: 0,
  });

  const resolutionOptions = [
    '3840x2160', '2560x1440', '1920x1080', '1280x720', 
    '854x480', '640x360', '426x240'
  ];

  const frameRateOptions = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];

  const handleSettingChange = (key, value) => {
    setVideoSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    setVideoSettings({
      resolution: '1920x1080',
      frameRate: 30,
      duration: '00:05:30:15',
      pixelAspectRatio: '1.0',
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      gamma: 1.0,
      positionX: 0,
      positionY: 0,
      scaleX: 100,
      scaleY: 100,
      rotation: 0,
      opacity: 100,
      cropTop: 0,
      cropBottom: 0,
      cropLeft: 0,
      cropRight: 0,
      motionBlurEnabled: false,
      motionBlurAngle: 0,
      motionBlurDistance: 0,
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800/95 border-b border-slate-700 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Icons.Video className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">Video Properties</span>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 rounded transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Project Settings */}
        <CollapsibleSection title="Project Settings" defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
              <select
                value={videoSettings.resolution}
                onChange={(e) => handleSettingChange('resolution', e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              >
                {resolutionOptions.map(res => (
                  <option key={res} value={res}>{res}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Frame Rate</label>
              <select
                value={videoSettings.frameRate}
                onChange={(e) => handleSettingChange('frameRate', parseFloat(e.target.value))}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              >
                {frameRateOptions.map(fps => (
                  <option key={fps} value={fps}>{fps} fps</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
              <input
                type="text"
                value={videoSettings.duration}
                onChange={(e) => handleSettingChange('duration', e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 font-mono focus:outline-none focus:border-blue-500"
                placeholder="HH:MM:SS:FF"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Color Correction */}
        <CollapsibleSection title="Color Correction" defaultOpen={true}>
          <div className="space-y-4">
            {['brightness', 'contrast', 'saturation', 'hue'].map((prop) => (
              <div key={prop}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300 capitalize">{prop}</label>
                  <span className="text-xs text-gray-500 font-mono">
                    {videoSettings[prop] > 0 ? '+' : ''}{videoSettings[prop]}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={videoSettings[prop]}
                  onChange={(e) => handleSettingChange(prop, parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            ))}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">Gamma</label>
                <span className="text-xs text-gray-500 font-mono">
                  {videoSettings.gamma.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.01"
                value={videoSettings.gamma}
                onChange={(e) => handleSettingChange('gamma', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Transform */}
        <CollapsibleSection title="Transform" defaultOpen={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Position X</label>
                <input
                  type="number"
                  value={videoSettings.positionX}
                  onChange={(e) => handleSettingChange('positionX', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Position Y</label>
                <input
                  type="number"
                  value={videoSettings.positionY}
                  onChange={(e) => handleSettingChange('positionY', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scale X (%)</label>
                <input
                  type="number"
                  value={videoSettings.scaleX}
                  onChange={(e) => handleSettingChange('scaleX', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scale Y (%)</label>
                <input
                  type="number"
                  value={videoSettings.scaleY}
                  onChange={(e) => handleSettingChange('scaleY', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">Rotation</label>
                <span className="text-xs text-gray-500 font-mono">{videoSettings.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={videoSettings.rotation}
                onChange={(e) => handleSettingChange('rotation', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">Opacity</label>
                <span className="text-xs text-gray-500 font-mono">{videoSettings.opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={videoSettings.opacity}
                onChange={(e) => handleSettingChange('opacity', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Cropping */}
        <CollapsibleSection title="Cropping" defaultOpen={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Top</label>
                <input
                  type="number"
                  value={videoSettings.cropTop}
                  onChange={(e) => handleSettingChange('cropTop', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bottom</label>
                <input
                  type="number"
                  value={videoSettings.cropBottom}
                  onChange={(e) => handleSettingChange('cropBottom', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Left</label>
                <input
                  type="number"
                  value={videoSettings.cropLeft}
                  onChange={(e) => handleSettingChange('cropLeft', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Right</label>
                <input
                  type="number"
                  value={videoSettings.cropRight}
                  onChange={(e) => handleSettingChange('cropRight', parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Motion Blur */}
        <CollapsibleSection title="Motion Blur" defaultOpen={false}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Enable Motion Blur</label>
              <button
                onClick={() => handleSettingChange('motionBlurEnabled', !videoSettings.motionBlurEnabled)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  videoSettings.motionBlurEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  videoSettings.motionBlurEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {videoSettings.motionBlurEnabled && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">Angle</label>
                    <span className="text-xs text-gray-500 font-mono">{videoSettings.motionBlurAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={videoSettings.motionBlurAngle}
                    onChange={(e) => handleSettingChange('motionBlurAngle', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">Distance</label>
                    <span className="text-xs text-gray-500 font-mono">{videoSettings.motionBlurDistance}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={videoSettings.motionBlurDistance}
                    onChange={(e) => handleSettingChange('motionBlurDistance', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default VideoPropertiesPanel;