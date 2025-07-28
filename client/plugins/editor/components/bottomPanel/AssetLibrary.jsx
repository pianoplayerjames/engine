// plugins/editor/components/AssetLibrary.jsx
import React, { useState, useEffect } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';
import { projectManager } from '@/plugins/projects/projectManager.js';

function AssetLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('3d-models');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { ui } = useSnapshot(editorState);
  const { assetsLibraryWidth: categoryPanelWidth } = ui;
  const { setAssetsLibraryWidth: setCategoryPanelWidth } = editorActions;

  // Fetch assets with optimized polling for real-time updates
  useEffect(() => {
    const currentProject = projectManager.getCurrentProject();
    if (!currentProject.name) {
      setError('No project loaded');
      return;
    }

    let intervalId;
    let lastModified = null;

    async function fetchAssets() {
      try {
        if (!lastModified) setLoading(true); // Only show loading on first fetch
        setError(null);

        const response = await fetch(`/api/projects/${currentProject.name}/assets`);
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }

        const data = await response.json();
        const newAssets = data.assets || [];
        
        // Check if assets have changed by comparing count, names, and modification times
        const currentModified = newAssets.reduce((latest, asset) => {
          const assetTime = new Date(asset.lastModified).getTime();
          return assetTime > latest ? assetTime : latest;
        }, 0);

        const assetSignature = JSON.stringify(newAssets.map(asset => ({
          name: asset.name,
          path: asset.path,
          size: asset.size
        })).sort((a, b) => a.path.localeCompare(b.path)));

        // Check if this is the first load, files were modified, count changed, or files were added/removed
        const currentAssetSignature = assetSignature;
        const assetsChanged = lastModified === null || 
                             currentModified > lastModified || 
                             currentAssetSignature !== window.lastAssetSignature;

        if (assetsChanged) {
          console.log('📁 Assets updated:', newAssets.length, 'items');
          setAssets(newAssets);
          lastModified = currentModified;
          window.lastAssetSignature = currentAssetSignature;
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching assets:', err);
        setError(err.message);
        setAssets([]);
        setLoading(false);
      }
    }

    // Initial fetch
    fetchAssets();

    // Poll for changes every 1 second for better responsiveness
    intervalId = setInterval(fetchAssets, 1000);

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Calculate categories and counts dynamically
  const assetCategories = React.useMemo(() => {
    const categoryCounts = assets.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: '3d-models', label: '3D Models', count: categoryCounts['3d-models'] || 0, icon: Icons.Models },
      { id: 'textures', label: 'Textures', count: categoryCounts['textures'] || 0, icon: Icons.Textures },
      { id: 'audio', label: 'Audio', count: categoryCounts['audio'] || 0, icon: Icons.Audio },
      { id: 'scripts', label: 'Scripts', count: categoryCounts['scripts'] || 0, icon: Icons.Scripts },
      { id: 'data', label: 'Data', count: categoryCounts['data'] || 0, icon: Icons.Scripts },
      { id: 'misc', label: 'Misc', count: categoryCounts['misc'] || 0, icon: Icons.Prefabs },
    ];
  }, [assets]);

  // Filter assets by category and search query
  const filteredAssets = React.useMemo(() => {
    return assets.filter(asset => {
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           asset.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [assets, selectedCategory, searchQuery]);

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
          <span className="text-xs text-gray-400">{filteredAssets.length} items</span>
        </div>
        
        {loading && (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-sm">Loading assets...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-400 mt-12">
            <p className="text-sm">Error: {error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group cursor-pointer transition-all duration-200 p-2 rounded hover:bg-slate-700/30"
                draggable
                onMouseEnter={() => setHoveredItem(asset.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({
                    type: 'asset',
                    id: asset.id,
                    name: asset.name,
                    path: asset.path,
                    category: asset.category
                  }));
                }}
              >
                {/* Asset Item Container */}
                <div className="relative">
                  {/* Your styled 3D cube icon */}
                  <div className="w-full h-16 mb-2 flex items-center justify-center relative">
                    <Icons.Cube3D 
                      className="w-14 h-14 transition-transform group-hover:scale-110" 
                      isHovered={hoveredItem === asset.id}
                    />
                    
                    {/* Extension Badge - Top right over the cube */}
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full text-center leading-none">
                      {asset.extension.replace('.', '').toUpperCase()}
                    </div>
                  </div>
                </div>
                
                {/* Asset Name */}
                <div className="text-xs text-gray-300 group-hover:text-white transition-colors truncate text-center" title={asset.name}>
                  {asset.name}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && !error && filteredAssets.length === 0 && searchQuery && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-sm">No assets found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetLibrary;