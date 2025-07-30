import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import CollapsibleSection from '@/plugins/editor/components/ui/CollapsibleSection.jsx';
import SliderWithTooltip from '@/plugins/editor/components/ui/SliderWithTooltip.jsx';

const VSTPluginsPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState(null);

  // Mock VST plugin data
  const vstPlugins = [
    {
      id: 'serum',
      name: 'Serum',
      category: 'synth',
      manufacturer: 'Xfer Records',
      type: 'VST3',
      installed: true,
      favorite: true,
      description: 'Advanced wavetable synthesizer'
    },
    {
      id: 'fabfilter-pro-q',
      name: 'Pro-Q 3',
      category: 'eq',
      manufacturer: 'FabFilter',
      type: 'VST3',
      installed: true,
      favorite: false,
      description: 'Professional equalizer plugin'
    },
    {
      id: 'waves-ssl',
      name: 'SSL G-Master',
      category: 'compressor',
      manufacturer: 'Waves',
      type: 'VST2',
      installed: true,
      favorite: true,
      description: 'SSL console compressor'
    },
    {
      id: 'native-reverb',
      name: 'ConvolutionReverb',
      category: 'reverb',
      manufacturer: 'Native Instruments',
      type: 'VST3',
      installed: false,
      favorite: false,
      description: 'High-quality convolution reverb'
    },
    {
      id: 'izotope-ozone',
      name: 'Ozone 10',
      category: 'mastering',
      manufacturer: 'iZotope',
      type: 'VST3',
      installed: true,
      favorite: false,
      description: 'Complete mastering suite'
    },
    {
      id: 'sylenth1',
      name: 'Sylenth1',
      category: 'synth',
      manufacturer: 'LennarDigital',
      type: 'VST2',
      installed: true,
      favorite: true,
      description: 'Virtual analog synthesizer'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Plugins', icon: Icons.Grid },
    { id: 'synth', label: 'Synthesizers', icon: Icons.Audio },
    { id: 'eq', label: 'EQ', icon: Icons.Settings },
    { id: 'compressor', label: 'Dynamics', icon: Icons.Mixer },
    { id: 'reverb', label: 'Reverb', icon: Icons.Effects },
    { id: 'mastering', label: 'Mastering', icon: Icons.Star }
  ];

  const filteredPlugins = vstPlugins.filter(plugin => {
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePluginSelect = (plugin) => {
    setSelectedPlugin(selectedPlugin?.id === plugin.id ? null : plugin);
  };

  const addPluginToTrack = (plugin) => {
    console.log(`Adding ${plugin.name} to selected track`);
    // Integration with DAW logic would go here
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-4 space-y-4">
      {/* Plugin Search */}
      <div className="space-y-3">
        <div className="relative">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 placeholder-gray-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <category.icon className="w-3 h-3 inline mr-1" />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plugin List */}
      <CollapsibleSection 
        title={`Plugins (${filteredPlugins.length})`}
        icon={Icons.Grid}
        defaultOpen={true}
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredPlugins.map(plugin => (
            <div
              key={plugin.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                selectedPlugin?.id === plugin.id
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
              }`}
              onClick={() => handlePluginSelect(plugin)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-200 truncate">
                      {plugin.name}
                    </h3>
                    {plugin.favorite && (
                      <Icons.Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                    )}
                    {!plugin.installed && (
                      <span className="px-1.5 py-0.5 text-xs bg-orange-600 text-white rounded">
                        Not Installed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{plugin.manufacturer}</p>
                  <p className="text-xs text-gray-500 mt-1">{plugin.description}</p>
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-2">
                  <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-700 rounded">
                    {plugin.type}
                  </span>
                  {plugin.installed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addPluginToTrack(plugin);
                      }}
                      className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Plugin Details */}
              {selectedPlugin?.id === plugin.id && (
                <div className="mt-4 pt-3 border-t border-gray-600 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <span className="text-gray-200 ml-2 capitalize">{plugin.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="text-gray-200 ml-2">{plugin.type}</span>
                    </div>
                  </div>

                  {plugin.installed && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Quick Actions:</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => console.log(`Opening ${plugin.name} editor`)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          Open Editor
                        </button>
                        <button
                          onClick={() => console.log(`Loading ${plugin.name} preset`)}
                          className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                        >
                          Load Preset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Plugin Settings */}
      <CollapsibleSection 
        title="Plugin Settings"
        icon={Icons.Settings}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Plugin Scan Paths</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <span className="text-xs text-gray-300">/Library/Audio/Plug-Ins/VST3</span>
                <button className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <span className="text-xs text-gray-300">/Library/Audio/Plug-Ins/VST</span>
                <button className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
              <button className="w-full p-2 border border-dashed border-gray-600 rounded text-xs text-gray-400 hover:text-gray-300 hover:border-gray-500">
                Add Scan Path
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Auto-scan on startup</label>
            <button className="w-10 h-6 rounded-full bg-blue-600">
              <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Show plugin GUIs</label>
            <button className="w-10 h-6 rounded-full bg-blue-600">
              <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
            </button>
          </div>

          <button className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors">
            Rescan All Plugins
          </button>
        </div>
      </CollapsibleSection>

      {/* Favorites */}
      <CollapsibleSection 
        title="Favorites"
        icon={Icons.Star}
        defaultOpen={false}
      >
        <div className="space-y-2">
          {vstPlugins.filter(p => p.favorite).map(plugin => (
            <div
              key={plugin.id}
              className="flex items-center justify-between p-2 bg-gray-800 rounded hover:bg-gray-750 cursor-pointer"
              onClick={() => plugin.installed && addPluginToTrack(plugin)}
            >
              <div>
                <div className="text-sm text-gray-200">{plugin.name}</div>
                <div className="text-xs text-gray-400">{plugin.manufacturer}</div>
              </div>
              {plugin.installed && (
                <Icons.Plus className="w-4 h-4 text-green-500" />
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default VSTPluginsPanel;