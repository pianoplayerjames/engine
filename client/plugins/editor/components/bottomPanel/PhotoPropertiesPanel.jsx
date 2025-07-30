import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const PhotoPropertiesPanel = () => {
  const [activeTab, setActiveTab] = useState('tool');
  const [toolProperties, setToolProperties] = useState({
    brushSize: 50,
    brushHardness: 100,
    brushOpacity: 100,
    brushFlow: 100,
    featherRadius: 2,
    tolerance: 32,
    contiguous: true,
    sampleAllLayers: false,
    anti_alias: true
  });

  const [imageProperties] = useState({
    filename: 'photo.jpg',
    dimensions: '3840 × 2160',
    resolution: '300 pixels/inch',
    colorMode: 'RGB Color',
    bitDepth: '8 bit',
    fileSize: '12.4 MB',
    dateCreated: '2024-01-15 10:30:00',
    dateModified: '2024-01-15 14:45:30'
  });

  const tabs = [
    { id: 'tool', name: 'Tool Options', icon: Icons.PaintBrush },
    { id: 'image', name: 'Image Info', icon: Icons.Photo },
    { id: 'document', name: 'Document', icon: Icons.DocumentText },
    { id: 'metadata', name: 'Metadata', icon: Icons.InformationCircle }
  ];

  const handlePropertyChange = (property, value) => {
    setToolProperties(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const renderToolOptions = () => {
    return (
      <div className="space-y-4">
        {/* Brush Tool Options */}
        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium text-white mb-3">Brush Options</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-300">Size</label>
                <span className="text-xs text-gray-400">{toolProperties.brushSize}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="2500"
                value={toolProperties.brushSize}
                onChange={(e) => handlePropertyChange('brushSize', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-300">Hardness</label>
                <span className="text-xs text-gray-400">{toolProperties.brushHardness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={toolProperties.brushHardness}
                onChange={(e) => handlePropertyChange('brushHardness', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-300">Opacity</label>
                <span className="text-xs text-gray-400">{toolProperties.brushOpacity}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={toolProperties.brushOpacity}
                onChange={(e) => handlePropertyChange('brushOpacity', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-300">Flow</label>
                <span className="text-xs text-gray-400">{toolProperties.brushFlow}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={toolProperties.brushFlow}
                onChange={(e) => handlePropertyChange('brushFlow', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>
          </div>
        </div>

        {/* Selection Tool Options */}
        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium text-white mb-3">Selection Options</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-300">Feather Radius</label>
                <span className="text-xs text-gray-400">{toolProperties.featherRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                value={toolProperties.featherRadius}
                onChange={(e) => handlePropertyChange('featherRadius', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-300">Tolerance</label>
                <span className="text-xs text-gray-400">{toolProperties.tolerance}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={toolProperties.tolerance}
                onChange={(e) => handlePropertyChange('tolerance', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded appearance-none slider"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={toolProperties.contiguous}
                  onChange={(e) => handlePropertyChange('contiguous', e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-gray-300">Contiguous</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={toolProperties.sampleAllLayers}
                  onChange={(e) => handlePropertyChange('sampleAllLayers', e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-gray-300">Sample All Layers</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={toolProperties.anti_alias}
                  onChange={(e) => handlePropertyChange('anti_alias', e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-gray-300">Anti-alias</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImageInfo = () => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium text-white mb-3">Image Information</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Filename:</span>
              <span className="text-xs text-gray-300">{imageProperties.filename}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Dimensions:</span>
              <span className="text-xs text-gray-300">{imageProperties.dimensions}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Resolution:</span>
              <span className="text-xs text-gray-300">{imageProperties.resolution}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Color Mode:</span>
              <span className="text-xs text-gray-300">{imageProperties.colorMode}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Bit Depth:</span>
              <span className="text-xs text-gray-300">{imageProperties.bitDepth}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">File Size:</span>
              <span className="text-xs text-gray-300">{imageProperties.fileSize}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium text-white mb-3">Dates</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Created:</span>
              <span className="text-xs text-gray-300">{imageProperties.dateCreated}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Modified:</span>
              <span className="text-xs text-gray-300">{imageProperties.dateModified}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDocumentInfo = () => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium text-white mb-3">Document Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-300 mb-1 block">Color Profile</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white">
                <option>sRGB IEC61966-2.1</option>
                <option>Adobe RGB (1998)</option>
                <option>ProPhoto RGB</option>
                <option>Display P3</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-gray-300 mb-1 block">Working Space</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white">
                <option>RGB</option>
                <option>CMYK</option>
                <option>Lab</option>
                <option>Grayscale</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-300 mb-1 block">Width</label>
                <input
                  type="number"
                  defaultValue="3840"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 mb-1 block">Height</label>
                <input
                  type="number"
                  defaultValue="2160"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 mb-1 block">Resolution</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  defaultValue="300"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                />
                <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white">
                  <option>pixels/inch</option>
                  <option>pixels/cm</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMetadata = () => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium text-white mb-3">EXIF Data</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Camera:</span>
              <span className="text-xs text-gray-300">Canon EOS R5</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Lens:</span>
              <span className="text-xs text-gray-300">RF 24-70mm f/2.8L</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Focal Length:</span>
              <span className="text-xs text-gray-300">50mm</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Aperture:</span>
              <span className="text-xs text-gray-300">f/2.8</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Shutter Speed:</span>
              <span className="text-xs text-gray-300">1/250s</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">ISO:</span>
              <span className="text-xs text-gray-300">400</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium text-white mb-3">Keywords</h4>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {['portrait', 'studio', 'professional', 'headshot'].map(keyword => (
              <span key={keyword} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                {keyword}
              </span>
            ))}
          </div>
          
          <input
            type="text"
            placeholder="Add keywords..."
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
          />
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tool':
        return renderToolOptions();
      case 'image':
        return renderImageInfo();
      case 'document':
        return renderDocumentInfo();
      case 'metadata':
        return renderMetadata();
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.Cog className="w-4 h-4 text-blue-400 mr-2" />
        <span className="text-white text-sm font-medium">Properties</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PhotoPropertiesPanel;