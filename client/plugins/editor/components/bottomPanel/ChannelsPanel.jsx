import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const ChannelsPanel = () => {
  const [channels, setChannels] = useState([
    { id: 'rgb', name: 'RGB', visible: true, locked: false, type: 'composite' },
    { id: 'red', name: 'Red', visible: true, locked: false, type: 'color' },
    { id: 'green', name: 'Green', visible: true, locked: false, type: 'color' },
    { id: 'blue', name: 'Blue', visible: true, locked: false, type: 'color' },
    { id: 'alpha', name: 'Alpha 1', visible: true, locked: false, type: 'alpha' }
  ]);
  
  const [selectedChannels, setSelectedChannels] = useState(['rgb']);
  const [channelMode, setChannelMode] = useState('rgb');
  const [showAlphaChannels, setShowAlphaChannels] = useState(true);

  const channelModes = [
    { id: 'rgb', name: 'RGB', channels: ['Red', 'Green', 'Blue'] },
    { id: 'cmyk', name: 'CMYK', channels: ['Cyan', 'Magenta', 'Yellow', 'Black'] },
    { id: 'lab', name: 'Lab', channels: ['Lightness', 'a', 'b'] },
    { id: 'grayscale', name: 'Grayscale', channels: ['Gray'] }
  ];

  const getChannelColor = (channelId) => {
    switch (channelId) {
      case 'rgb': return '#ffffff';
      case 'red': return '#ff0000';
      case 'green': return '#00ff00';
      case 'blue': return '#0000ff';
      case 'cyan': return '#00ffff';
      case 'magenta': return '#ff00ff';
      case 'yellow': return '#ffff00';
      case 'black': return '#000000';
      case 'alpha': return '#ffffff';
      default: return '#888888';
    }
  };

  const getChannelIcon = (type) => {
    switch (type) {
      case 'composite': return Icons.Layers;
      case 'color': return Icons.ColorSwatch;
      case 'alpha': return Icons.Transparency;
      case 'spot': return Icons.Circle;
      default: return Icons.Square;
    }
  };

  const toggleChannelVisibility = (channelId) => {
    setChannels(channels.map(channel => 
      channel.id === channelId ? { ...channel, visible: !channel.visible } : channel
    ));
  };

  const toggleChannelSelection = (channelId) => {
    if (selectedChannels.includes(channelId)) {
      setSelectedChannels(selectedChannels.filter(id => id !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const duplicateChannel = () => {
    if (selectedChannels.length === 1) {
      const sourceChannel = channels.find(c => c.id === selectedChannels[0]);
      if (sourceChannel) {
        const newChannel = {
          id: `${sourceChannel.id}_copy`,
          name: `${sourceChannel.name} copy`,
          visible: true,
          locked: false,
          type: 'alpha'
        };
        setChannels([...channels, newChannel]);
      }
    }
  };

  const deleteChannel = () => {
    if (selectedChannels.length > 0) {
      const filteredChannels = channels.filter(channel => 
        !selectedChannels.includes(channel.id) || channel.type === 'composite'
      );
      setChannels(filteredChannels);
      setSelectedChannels([]);
    }
  };

  const loadSelection = () => {
    // Load channel as selection
    console.log('Load selection from channels:', selectedChannels);
  };

  const saveSelection = () => {
    // Save current selection as alpha channel
    const newChannel = {
      id: `alpha_${Date.now()}`,
      name: `Alpha ${channels.filter(c => c.type === 'alpha').length + 1}`,
      visible: true,
      locked: false,
      type: 'alpha'
    };
    setChannels([...channels, newChannel]);
  };

  const changeColorMode = (mode) => {
    setChannelMode(mode);
    const modeConfig = channelModes.find(m => m.id === mode);
    if (modeConfig) {
      const baseChannels = [
        { id: mode, name: mode.toUpperCase(), visible: true, locked: false, type: 'composite' },
        ...modeConfig.channels.map((name, index) => ({
          id: name.toLowerCase(),
          name,
          visible: true,
          locked: false,
          type: 'color'
        }))
      ];
      
      // Keep alpha channels
      const alphaChannels = channels.filter(c => c.type === 'alpha');
      setChannels([...baseChannels, ...alphaChannels]);
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.Layers className="w-4 h-4 text-cyan-400 mr-2" />
        <span className="text-white text-sm font-medium">Channels</span>
        
        <div className="ml-auto flex items-center gap-1">
          <select
            value={channelMode}
            onChange={(e) => changeColorMode(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
          >
            {channelModes.map(mode => (
              <option key={mode.id} value={mode.id}>{mode.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Channel Options */}
      <div className="border-b border-gray-700 p-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showAlphaChannels}
              onChange={(e) => setShowAlphaChannels(e.target.checked)}
              className="rounded"
            />
            <span className="text-xs text-gray-300">Show Alpha</span>
          </label>
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-auto">
        {channels
          .filter(channel => showAlphaChannels || channel.type !== 'alpha')
          .map((channel) => {
            const IconComponent = getChannelIcon(channel.type);
            const isSelected = selectedChannels.includes(channel.id);
            
            return (
              <div
                key={channel.id}
                className={`flex items-center p-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                  isSelected ? 'bg-blue-600/20 border-blue-500' : ''
                }`}
                onClick={() => toggleChannelSelection(channel.id)}
              >
                {/* Channel Thumbnail */}
                <div className="w-12 h-12 bg-gray-700 border border-gray-600 rounded mr-2 flex items-center justify-center relative overflow-hidden">
                  {channel.type === 'composite' ? (
                    <div className="w-full h-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-70" />
                  ) : channel.type === 'alpha' ? (
                    <div className="w-full h-full bg-white opacity-70" />
                  ) : (
                    <div 
                      className="w-full h-full opacity-70"
                      style={{ backgroundColor: getChannelColor(channel.id) }}
                    />
                  )}
                  <IconComponent className="w-4 h-4 text-white absolute" />
                </div>

                {/* Channel Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{channel.name}</div>
                  <div className="text-xs text-gray-400">{channel.type}</div>
                </div>

                {/* Channel Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChannelVisibility(channel.id);
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title={channel.visible ? 'Hide Channel' : 'Show Channel'}
                  >
                    {channel.visible ? (
                      <Icons.Eye className="w-3 h-3 text-gray-300" />
                    ) : (
                      <Icons.EyeOff className="w-3 h-3 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Channel Statistics */}
      <div className="border-t border-gray-700 p-3">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Pixel count:</span>
            <span>8,294,400</span>
          </div>
          <div className="flex justify-between">
            <span>Mean:</span>
            <span>127.5</span>
          </div>
          <div className="flex justify-between">
            <span>Std Dev:</span>
            <span>74.2</span>
          </div>
          <div className="flex justify-between">
            <span>Median:</span>
            <span>128</span>
          </div>
        </div>
      </div>

      {/* Channel Actions */}
      <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-2">
        <button
          onClick={loadSelection}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Load Channel as Selection"
        >
          <Icons.Rectangle className="w-4 h-4" />
        </button>
        
        <button
          onClick={saveSelection}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Save Selection as Channel"
        >
          <Icons.Save className="w-4 h-4" />
        </button>
        
        <button
          onClick={duplicateChannel}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Duplicate Channel"
        >
          <Icons.DocumentDuplicate className="w-4 h-4" />
        </button>
        
        <button
          onClick={deleteChannel}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Delete Channel"
        >
          <Icons.Trash className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="New Channel"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>
        
        <div className="ml-auto text-xs text-gray-500">
          {channels.length} channels
        </div>
      </div>
    </div>
  );
};

export default ChannelsPanel;