// plugins/editor/components/MaterialsPanel.jsx
import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const materialLibrary = [
  { id: 'pbr-metal', name: 'Brushed Metal', type: 'PBR', preview: 'bg-gradient-to-br from-gray-300 to-gray-600' },
  { id: 'pbr-wood', name: 'Oak Wood', type: 'PBR', preview: 'bg-gradient-to-br from-amber-700 to-amber-900' },
  { id: 'pbr-concrete', name: 'Concrete', type: 'PBR', preview: 'bg-gradient-to-br from-gray-400 to-gray-700' },
  { id: 'pbr-fabric', name: 'Canvas Fabric', type: 'PBR', preview: 'bg-gradient-to-br from-yellow-100 to-yellow-300' },
  { id: 'unlit-glow', name: 'Neon Glow', type: 'Unlit', preview: 'bg-gradient-to-br from-blue-400 to-purple-600' },
  { id: 'transparent-glass', name: 'Clear Glass', type: 'Transparent', preview: 'bg-gradient-to-br from-blue-100 to-blue-200' },
];

const materialTypes = [
  { id: 'all', label: 'All Materials', count: materialLibrary.length },
  { id: 'PBR', label: 'PBR Materials', count: materialLibrary.filter(m => m.type === 'PBR').length },
  { id: 'Unlit', label: 'Unlit Materials', count: materialLibrary.filter(m => m.type === 'Unlit').length },
  { id: 'Transparent', label: 'Transparent', count: materialLibrary.filter(m => m.type === 'Transparent').length },
];

function MaterialsPanel() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMaterials = materialLibrary.filter(material => {
    const matchesType = selectedType === 'all' || material.type === selectedType;
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="h-full flex bg-slate-800">
      {/* Material Categories */}
      <div className="w-48 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-700">
          <div className="relative">
            <Icons.MagnifyingGlass className="w-3 h-3 absolute left-2 top-1.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-1 p-2">
            {materialTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full flex items-center justify-between px-2 py-2 text-left text-xs rounded hover:bg-slate-800 transition-colors ${
                  selectedType === type.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span>{type.label}</span>
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
      
      {/* Materials Grid */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              {materialTypes.find(type => type.id === selectedType)?.label || 'Materials'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{filteredMaterials.length} materials</span>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                + Import Material
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          <div className="grid grid-cols-3 gap-3">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                onClick={() => setSelectedMaterial(material.id)}
                className={`group cursor-pointer rounded-lg overflow-hidden border transition-all ${
                  selectedMaterial === material.id
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                {/* Material Preview */}
                <div className={`h-20 ${material.preview} relative`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
                      {material.type}
                    </span>
                  </div>
                </div>
                
                {/* Material Info */}
                <div className="p-2 bg-slate-900/50">
                  <div className="text-xs font-medium text-white group-hover:text-blue-200 transition-colors">
                    {material.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredMaterials.length === 0 && searchQuery && (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-sm">No materials found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Material Properties */}
      {selectedMaterial && (
        <div className="w-64 bg-slate-900 border-l border-slate-700 flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">Material Properties</h4>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-gray-400 hover:text-white"
              >
                <Icons.XMark className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Albedo</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border border-slate-600 rounded cursor-pointer" />
                <button className="text-xs text-blue-400 hover:text-blue-300">Browse</button>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Metallic</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.5"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Roughness</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.5"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Normal Map</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-300 border border-slate-600 rounded cursor-pointer" />
                <button className="text-xs text-blue-400 hover:text-blue-300">Browse</button>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Emission</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black border border-slate-600 rounded cursor-pointer" />
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue="0"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <div className="p-3 border-t border-slate-700">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition-colors">
              Apply to Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialsPanel;