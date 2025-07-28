// plugins/editor/components/ScriptsPanel.jsx
import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const scriptTypes = [
  { id: 'behavior', label: 'Behavior Scripts', count: 8, icon: Icons.Scripts },
  { id: 'ui', label: 'UI Scripts', count: 3, icon: Icons.Code },
  { id: 'system', label: 'System Scripts', count: 12, icon: Icons.Cog },
  { id: 'custom', label: 'Custom Scripts', count: 5, icon: Icons.CodeBracket },
];

const sampleScripts = [
  { id: 'player-controller', name: 'PlayerController.js', type: 'behavior', size: '2.4 KB' },
  { id: 'camera-follow', name: 'CameraFollow.js', type: 'behavior', size: '1.8 KB' },
  { id: 'inventory-ui', name: 'InventoryUI.js', type: 'ui', size: '3.2 KB' },
  { id: 'health-system', name: 'HealthSystem.js', type: 'system', size: '4.1 KB' },
  { id: 'lighting-controller', name: 'LightingController.js', type: 'system', size: '2.7 KB' },
  { id: 'menu-handler', name: 'MenuHandler.js', type: 'ui', size: '1.9 KB' },
];

function ScriptsPanel() {
  const [selectedType, setSelectedType] = useState('behavior');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScripts = sampleScripts.filter(script =>
    script.type === selectedType &&
    script.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex bg-slate-800">
      {/* Script Categories */}
      <div className="w-48 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-700">
          <div className="relative">
            <Icons.MagnifyingGlass className="w-3 h-3 absolute left-2 top-1.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-1 p-2">
            {scriptTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full flex items-center justify-between px-2 py-2 text-left text-xs rounded hover:bg-slate-800 transition-colors ${
                  selectedType === type.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span className="flex items-center">
                  <type.icon className={`w-3 h-3 mr-2 ${
                    selectedType === type.id ? 'text-white' : 'text-gray-400'
                  }`} />
                  {type.label}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedType === type.id 
                    ? 'text-white bg-blue-500' 
                    : 'text-gray-400 bg-slate-700'
                }`}>{type.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scripts List */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">
            {scriptTypes.find(type => type.id === selectedType)?.label || 'Scripts'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{filteredScripts.length} scripts</span>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              + New Script
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              className="flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Icons.CodeBracket className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">
                    {script.name}
                  </div>
                  <div className="text-xs text-gray-400">{script.size}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 hover:bg-slate-600 rounded text-gray-400 hover:text-white">
                  <Icons.Pencil className="w-3 h-3" />
                </button>
                <button className="p-1 hover:bg-slate-600 rounded text-gray-400 hover:text-red-400">
                  <Icons.Trash className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredScripts.length === 0 && searchQuery && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-sm">No scripts found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScriptsPanel;