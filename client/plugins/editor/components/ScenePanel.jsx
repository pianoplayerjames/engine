// plugins/editor/components/ScenePanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';

const parentNames = [
  'Urban Landscape', 'Natural Environment', 'Indoor Setting', 'Sci-Fi Outpost', 'Fantasy Kingdom',
  'Vehicle Garage', 'Character Assembly', 'Props Collection', 'Lighting Setup', 'Special Effects',
  'UI Elements', 'Audio Sources', 'Camera Rigs', 'Animation Sequences', 'Particle Systems',
  'Decal Placement', 'Water Bodies', 'Foliage Group', 'Rock Formations', 'Building Complex'
];

const childNames = [
  'Street Level', 'Skyscrapers', 'Residential Area', 'Industrial Zone', 'Park',
  'Forest', 'Mountains', 'River', 'Cave System', 'Beach',
  'Living Room', 'Kitchen', 'Bedroom', 'Office', 'Basement',
  'Corridors', 'Command Center', 'Hangar Bay', 'Living Quarters', 'Laboratory'
];

const grandchildNames = [
  'Lamp Post', 'Bench', 'Mailbox', 'Traffic Light', 'Fire Hydrant',
  'Oak Tree', 'Pine Tree', 'Boulder', 'Shrub', 'Flower Bed',
  'Sofa', 'Coffee Table', 'Television', 'Bookshelf', 'Dining Table',
  'Computer Terminal', 'Holographic Display', 'Storage Crate', 'Power Conduit', 'Specimen Tank'
];

const sceneObjects = [
  {
    id: 'world',
    name: 'World',
    type: 'terrain',
    visible: true,
    children: Array.from({ length: 20 }, (_, i) => ({
      id: `parent-${i}`,
      name: parentNames[i % parentNames.length],
      type: 'model',
      visible: true,
      children: Array.from({ length: 10 }, (_, j) => ({
        id: `child-${i}-${j}`,
        name: childNames[j % childNames.length],
        type: 'model',
        visible: true,
        children: Array.from({ length: 5 }, (_, k) => ({
          id: `grandchild-${i}-${j}-${k}`,
          name: grandchildNames[k % grandchildNames.length],
          type: 'model',
          visible: true,
          children: [],
        })),
      })),
    })),
  },
];

function ScenePanel({ selectedObject, onObjectSelect, isOpen, onToggle, selectedTool, onToolSelect }) {
  const [expandedItems, setExpandedItems] = useState(['terrain']);
  const [topPanelHeight, setTopPanelHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsResizing(false);
    const handleMouseMoveGlobal = (e) => {
        if (isResizing) {
            const container = containerRef.current;
            if (container) {
                const containerTop = container.getBoundingClientRect().top;
                const newHeight = e.clientY - containerTop;
                const minHeight = 100; // Minimum height for the top panel
                const bottomPanelMinHeight = 200; // Minimum height for the properties panel
                const maxHeight = container.clientHeight - bottomPanelMinHeight;
                if (newHeight > minHeight && newHeight < maxHeight) {
                    setTopPanelHeight(newHeight);
                }
            }
        }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isResizing]);

  const toggleExpanded = (id) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case 'character':
        return <Icons.Character className="w-4 h-4 text-blue-400" />;
      case 'terrain':
        return <Icons.Terrain className="w-4 h-4 text-green-400" />;
      case 'model':
        return <Icons.Cube className="w-4 h-4 text-gray-400" />;
      default:
        return <Icons.Cube className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderSceneItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isSelected = selectedObject === item.id;

    return (
      <div key={item.id}>
        <div 
          className={`flex items-center py-0.5 px-2 cursor-pointer transition-colors text-xs group ${
            isSelected ? 'bg-blue-800/60' : 'hover:bg-slate-700'
          }`}
          style={{ paddingLeft: `${8 + depth * 20}px` }}
          onClick={() => onObjectSelect(item.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(item.id);
              }}
              className="mr-1 p-0.5 hover:bg-slate-600 rounded transition-colors"
            >
              {isExpanded ? (
                <Icons.ChevronDown className="w-3 h-3 text-gray-300" />
              ) : (
                <Icons.ChevronRight className="w-3 h-3 text-gray-300" />
              )}
            </button>
          )}
          
          <button 
            className="mr-1 p-0.5 rounded transition-colors opacity-70 hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {item.visible ? (
              <Icons.Eye className="w-4 h-4 text-gray-300" />
            ) : (
              <Icons.EyeSlash className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          <span className="mr-2">{getIcon(item.type)}</span>
          <span className="flex-1 text-gray-200 truncate">{item.name}</span>
          
          <button 
            className="ml-2 p-0.5 rounded transition-colors opacity-0 group-hover:opacity-70 hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Icons.Trash className="w-4 h-4 text-gray-300 hover:text-red-400" />
          </button>
        </div>
        
        {hasChildren && isExpanded && item.children.map(child => 
          renderSceneItem(child, depth + 1)
        )}
      </div>
    );
  };

  if (!isOpen) {
    return null; // Toggle button is now handled by parent component
  }

  const getTabTitle = () => {
    switch (selectedTool) {
      case 'scene': return 'Scene';
      case 'light': return 'Light';
      case 'effects': return 'Effects';
      case 'folder': return 'Files';
      case 'star': return 'Favorites';
      case 'wifi': return 'Network';
      case 'cloud': return 'Cloud';
      case 'monitor': return 'Display';
      case 'settings': return 'Settings';
      default: return 'Properties';
    }
  };

  const renderTabContent = () => {
    switch (selectedTool) {
      case 'scene':
        return (
          <div ref={containerRef} className="flex flex-col h-full">
            <div
              className="overflow-y-auto scrollbar-thin"
              style={{ height: `${topPanelHeight}px` }}
            >
              {sceneObjects.map(item => renderSceneItem(item))}
            </div>
            <div
              className="h-1 cursor-row-resize bg-slate-800 hover:bg-slate-700"
              onMouseDown={handleMouseDown}
            />
            <div className="flex-1 overflow-y-auto scrollbar-thin pb-4">
              {selectedObject && (
                <div className="p-3">
                  <div className="text-xs font-medium text-gray-300 mb-2">Properties</div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Position</label>
                      <div className="grid grid-cols-3 gap-1">
                        <input type="number" defaultValue="0" className="bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded" placeholder="X" />
                        <input type="number" defaultValue="0" className="bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded" placeholder="Y" />
                        <input type="number" defaultValue="0" className="bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded" placeholder="Z" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Rotation</label>
                      <div className="grid grid-cols-3 gap-1">
                        <input type="number" defaultValue="0" className="bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded" placeholder="X" />
                        <input type="number" defaultValue="0" className="bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded" placeholder="Y" />
                        <input type="number" defaultValue="0" className="bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded" placeholder="Z" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Scale</label>
                      <div className="grid grid-cols-3 gap-1">
                        <input type="number" defaultValue="1" className="bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded" placeholder="X" />
                        <input type="number" defaultValue="1" className="bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded" placeholder="Y" />
                        <input type="number" defaultValue="1" className="bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded" placeholder="Z" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Material</label>
                      <select className="w-full bg-slate-900 border border-slate-600 text-white text-xs p-2 rounded">
                        <option>Standard</option>
                        <option>Toon</option>
                        <option>Glass</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Color</label>
                      <input type="color" defaultValue="#ff0000" className="w-full h-8 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Roughness</label>
                      <input type="range" min="0" max="1" step="0.1" defaultValue="0.5" className="w-full" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Metalness</label>
                      <input type="range" min="0" max="1" step="0.1" defaultValue="0.5" className="w-full" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Scripts</label>
                      <div className="bg-slate-900 border border-dashed border-slate-600 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500">Drag and drop scripts here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'light':
        return (
          <div className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Type</label>
              <select className="w-full bg-slate-900 border border-slate-600 text-white text-xs p-2 rounded">
                <option>Directional</option>
                <option>Point</option>
                <option>Spot</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Intensity</label>
              <input type="range" min="0" max="10" step="0.1" defaultValue="1" className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Color</label>
              <input type="color" defaultValue="#ffffff" className="w-full h-8 rounded" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Shadow</label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="text-blue-600" />
                <span className="text-xs text-gray-300">Cast Shadows</span>
              </label>
            </div>
          </div>
        );
      
      case 'effects':
        return (
          <div className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Post Processing</label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="text-blue-600" />
                <span className="text-xs text-gray-300">Bloom</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="text-blue-600" />
                <span className="text-xs text-gray-300">Motion Blur</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="text-blue-600" />
                <span className="text-xs text-gray-300">Depth of Field</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Ambient Occlusion</label>
              <input type="range" min="0" max="1" step="0.1" defaultValue="0.5" className="w-full" />
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Render Quality</label>
              <select className="w-full bg-slate-900 border border-slate-600 text-white text-xs p-2 rounded">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Ultra</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Frame Rate</label>
              <select className="w-full bg-slate-900 border border-slate-600 text-white text-xs p-2 rounded">
                <option>30 FPS</option>
                <option>60 FPS</option>
                <option>120 FPS</option>
                <option>Unlimited</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="text-blue-600" />
                <span className="text-xs text-gray-300">Auto Save</span>
              </label>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
            <div className="text-center text-gray-500 mt-8">
              <p className="text-sm">{getTabTitle()} panel</p>
              <p className="text-xs mt-1">Content coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-gradient-to-b from-slate-800/95 to-slate-900/98 backdrop-blur-md border-l border-slate-700/80 shadow-2xl shadow-black/30 flex flex-col pointer-events-auto no-select"
    >
      
      {/* Panel Header */}
      <div className="px-3 py-2 border-b border-slate-700/60">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-medium text-white">{getTabTitle()}</h2>
          <button
            onClick={() => {
              onToggle();
              onToolSelect('select'); // Reset to default tool when closing
            }}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
          >
            <Icons.ChevronRight className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        {selectedTool === 'scene' && (
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            SCENE OBJECTS (39)
          </div>
        )}
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

export default ScenePanel;