// plugins/editor/components/AssetLibrary.jsx
import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';

const assetCategories = [
  { id: '3d-models', label: '3D Models', count: 115, icon: Icons.Models },
  { id: 'materials', label: 'Materials', count: 4, icon: Icons.Materials },
  { id: 'textures', label: 'Textures', count: 0, icon: Icons.Textures },
  { id: 'scripts', label: 'Scripts', count: 0, icon: Icons.Scripts },
  { id: 'plugins', label: 'Plugins', count: 0, icon: Icons.Plugins },
  { id: 'audio', label: 'Audio', count: 0, icon: Icons.Audio },
  { id: 'animations', label: 'Animations', count: 0, icon: Icons.Animations },
  { id: 'prefabs', label: 'Prefabs', count: 0, icon: Icons.Prefabs },
];

const models3D = [
  { id: '1994-nis', name: '1994-nissan-skyline' },
  { id: '2015-do', name: '2015-dodge-challenger' },
  { id: 'adjustabl', name: 'adjustable-wrench' },
  { id: 'air-vent', name: 'air-vent' },
  { id: 'analog-c', name: 'analog-clock' },
  { id: 'apartme', name: 'apartment-building' },
  { id: 'bar', name: 'bar' },
  { id: 'bathroom', name: 'bathroom-sink' },
  { id: 'bathro', name: 'bathroom-mirror' },
  { id: 'bench', name: 'bench' },
  { id: 'bike-war', name: 'bike-warehouse' },
  { id: 'billboard', name: 'billboard' },
];

function AssetLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('3d-models');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const { ui } = useSnapshot(editorState);
  const { assetsLibraryWidth: categoryPanelWidth } = ui;
  const { setAssetsLibraryWidth: setCategoryPanelWidth } = editorActions;

  const filteredModels = models3D.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResizeMouseDown = (e) => {
    setIsResizing(true);
    document.body.classList.add('dragging-horizontal');
    e.preventDefault();
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    setCategoryPanelWidth(Math.max(120, Math.min(300, newWidth)));
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
    document.body.classList.remove('dragging-horizontal');
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <div className="h-full flex bg-slate-800 no-select">
      {/* Asset Categories - More Compact with Fixed Header */}
      <div 
        className="bg-slate-900 border-r border-slate-700 flex flex-col relative"
        style={{ width: categoryPanelWidth }}
      >
        {/* Resize Handle */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-0.5 resize-handle cursor-col-resize ${isResizing ? 'dragging' : ''}`}
          onMouseDown={handleResizeMouseDown}
        />
        {/* Fixed Header */}
        <div className="px-2 py-2">
          <div className="relative mt-1">
            <Icons.MagnifyingGlass className="w-3 h-3 absolute left-2 top-1.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        {/* Scrollable Categories */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-0.5 p-1">
            {assetCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-left text-xs rounded hover:bg-slate-800 transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span className="flex items-center">
                  <category.icon className={`w-3 h-3 mr-2 ${
                    selectedCategory === category.id ? 'text-white' : 'text-gray-400'
                  }`} />
                  {category.label}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedCategory === category.id 
                    ? 'text-white bg-blue-500' 
                    : 'text-gray-400 bg-slate-700'
                }`}>{category.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Asset Grid - More Compact */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">{selectedCategory === '3d-models' ? '3D Models' : assetCategories.find(cat => cat.id === selectedCategory)?.label || 'Assets'}</h3>
          <span className="text-xs text-gray-400">{filteredModels.length} items</span>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-3">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="group cursor-pointer transition-all duration-200 p-2 rounded hover:bg-slate-700/30"
              draggable
              onMouseEnter={() => setHoveredItem(model.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify({
                  type: 'model',
                  id: model.id,
                  name: model.name
                }));
              }}
            >
              {/* Asset Item Container */}
              <div className="relative">
                {/* Your styled 3D cube icon */}
                <div className="w-full h-16 mb-2 flex items-center justify-center relative">
                  <Icons.Cube3D 
                    className="w-14 h-14 transition-transform group-hover:scale-110" 
                    isHovered={hoveredItem === model.id}
                  />
                  
                  {/* GLB Badge - Top right over the cube */}
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full text-center leading-none">
                    GLB
                  </div>
                </div>
              </div>
              
              {/* Asset Name */}
              <div className="text-xs text-gray-300 group-hover:text-white transition-colors truncate text-center" title={model.name}>
                {model.name}
              </div>
            </div>
          ))}
        </div>
        
        {filteredModels.length === 0 && searchQuery && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-sm">No assets found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetLibrary;