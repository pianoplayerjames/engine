// plugins/editor/components/ScenePanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import SliderWithTooltip from './SliderWithTooltip';
import CollapsibleSection from './CollapsibleSection';
import ContextMenu from './ContextMenu';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '../store.js';
import { renderState, renderActions } from '../../render/store.js';
import { HDR_ENVIRONMENTS, getHDREnvironment } from '../../render/environmentLoader.js';

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

function ScenePanel({ selectedObject, onObjectSelect, isOpen, onToggle, selectedTool, onToolSelect, onContextMenu }) {
  const [expandedItems, setExpandedItems] = useState(['scene']);
  const { ui } = useSnapshot(editorState);
  const { scenePropertiesHeight: bottomPanelHeight } = ui;
  const { setScenePropertiesHeight: setBottomPanelHeight } = editorActions;
  const [isResizing, setIsResizing] = useState(false);
  const [isTestToggleOn, setIsTestToggleOn] = useState(false);
  const [roughness, setRoughness] = useState(0.5);
  const [metalness, setMetalness] = useState(0.5);
  const [intensity, setIntensity] = useState(1);
  const [ambientOcclusion, setAmbientOcclusion] = useState(0.5);
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    dragOverItem: null,
    dropPosition: null, // 'above', 'below', 'inside'
    dragStartDepth: 0
  });
  
  const { sceneObjects, settings } = useSnapshot(editorState);
  const { grid: gridSettings, viewport: viewportSettings } = settings;
  const { removeSceneObject, setSelectedObject, setTransformMode, updateSceneObject, updateGridSettings, updateViewportSettings } = editorActions;
  
  // Get selected object data
  const selectedObjectData = sceneObjects.find(obj => obj.id === selectedObject);
  
  // Handle object deletion
  const handleDeleteObject = (objectId, e) => {
    e.stopPropagation();
    removeSceneObject(objectId);
    // Clear selection if deleted object was selected
    if (selectedObject === objectId) {
      setSelectedObject(null);
      setTransformMode('select');
    }
  };
  
  // Handle property changes
  const handlePropertyChange = (property, axis, value) => {
    if (selectedObjectData) {
      const newValue = [...selectedObjectData[property]];
      const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
      
      if (property === 'rotation') {
        // Value is already converted to radians in the onChange handler
        newValue[axisIndex] = parseFloat(value) || 0;
      } else {
        newValue[axisIndex] = parseFloat(value) || 0;
      }
      
      updateSceneObject(selectedObject, { [property]: newValue });
    }
  };

  // Handle material color changes
  const handleColorChange = (colorValue) => {
    if (selectedObjectData) {
      updateSceneObject(selectedObject, { 
        material: { 
          ...selectedObjectData.material, 
          color: colorValue 
        } 
      });
    }
  };

  // Convert HSL to Hex
  const hslToHex = (hslString) => {
    // Parse HSL string like "hsl(120, 70%, 50%)"
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '#ff0000';
    
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;
    
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert color to hex format for display
  const getColorHex = () => {
    if (!selectedObjectData?.material?.color) return '#ff0000';
    
    const color = selectedObjectData.material.color;
    
    // If it's already a hex color, return it
    if (typeof color === 'string' && color.startsWith('#')) {
      return color;
    }
    
    // If it's an HSL color, convert to hex
    if (typeof color === 'string' && color.startsWith('hsl')) {
      return hslToHex(color);
    }
    
    return color || '#ff0000';
  };
  
  // Convert scene objects to hierarchy format
  const hierarchyData = [
    {
      id: 'scene',
      name: 'Scene',
      type: 'scene',
      visible: true,
      children: sceneObjects.map(obj => ({
        id: obj.id,
        name: obj.name,
        type: obj.type,
        visible: obj.visible,
        children: []
      }))
    }
  ];
  
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsResizing(false);
    const handleMouseMoveGlobal = (e) => {
        if (isResizing) {
            const container = containerRef.current;
            const header = headerRef.current;
            if (container && header) {
                const containerBottom = container.getBoundingClientRect().bottom;
                const headerHeight = header.offsetHeight;
                let newPropertiesHeight = containerBottom - e.clientY; // Height of properties panel from bottom

                const minPropertiesHeight = 100; // Minimum height for the properties panel
                const minObjectTreeHeight = 50; // Minimum height for the object tree panel
                const maxPropertiesHeight = container.clientHeight - headerHeight - minObjectTreeHeight;

                // Clamp the newPropertiesHeight within reasonable bounds
                newPropertiesHeight = Math.max(minPropertiesHeight, newPropertiesHeight);
                newPropertiesHeight = Math.min(maxPropertiesHeight, newPropertiesHeight);

                setBottomPanelHeight(newPropertiesHeight);
            }
        }
    };

    if (isResizing) {
      document.body.style.cursor = 'row-resize';
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.body.style.cursor = 'default';
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

  // Hierarchical drag and drop handlers
  const handleDragStart = (e, item, depth) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    
    setDragState({
      isDragging: true,
      draggedItem: item,
      dragOverItem: null,
      dropPosition: null,
      dragStartDepth: depth
    });
  };

  const getDragDropPosition = (e, targetItem, targetDepth) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const thirdHeight = height / 3;
    
    // Determine drop position based on mouse position
    if (y < thirdHeight) {
      return 'above';
    } else if (y > height - thirdHeight && targetItem.children && targetItem.children.length > 0) {
      return 'inside';
    } else if (y > height - thirdHeight) {
      return 'below';
    } else {
      return 'inside'; // Middle third - nest inside
    }
  };

  const handleDragOver = (e, item, depth) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragState.draggedItem && dragState.draggedItem.id !== item.id) {
      // Don't allow dropping on descendants
      if (isDescendant(dragState.draggedItem, item)) {
        return;
      }
      
      const position = getDragDropPosition(e, item, depth);
      setDragState(prev => ({
        ...prev,
        dragOverItem: item,
        dropPosition: position
      }));
    }
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setDragState(prev => ({ ...prev, dragOverItem: null, dropPosition: null }));
    }
  };

  const isDescendant = (ancestor, potentialDescendant) => {
    if (!ancestor.children) return false;
    
    for (const child of ancestor.children) {
      if (child.id === potentialDescendant.id) return true;
      if (isDescendant(child, potentialDescendant)) return true;
    }
    return false;
  };

  const removeItemFromHierarchy = (items, itemId) => {
    return items.reduce((acc, item) => {
      if (item.id === itemId) {
        return acc; // Don't include this item
      }
      
      const newItem = { ...item };
      if (item.children) {
        newItem.children = removeItemFromHierarchy(item.children, itemId);
      }
      acc.push(newItem);
      return acc;
    }, []);
  };

  const insertItemInHierarchy = (items, targetId, draggedItem, position) => {
    return items.map(item => {
      if (item.id === targetId) {
        const newItem = { ...item };
        
        if (position === 'inside') {
          newItem.children = [...(item.children || []), draggedItem];
        }
        return newItem;
      }
      
      if (item.children) {
        const newChildren = insertItemInHierarchy(item.children, targetId, draggedItem, position);
        return { ...item, children: newChildren };
      }
      
      return item;
    });
  };

  const insertItemAtPosition = (items, targetId, draggedItem, position) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === targetId) {
        const newItems = [...items];
        const insertIndex = position === 'before' ? i : i + 1;
        newItems.splice(insertIndex, 0, draggedItem);
        return newItems;
      }
      
      if (items[i].children) {
        const newChildren = insertItemAtPosition(items[i].children, targetId, draggedItem, position);
        if (newChildren !== items[i].children) {
          const newItems = [...items];
          newItems[i] = { ...items[i], children: newChildren };
          return newItems;
        }
      }
    }
    return items;
  };

  const handleDrop = (e, dropItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragState.draggedItem || !dragState.dropPosition) {
      resetDragState();
      return;
    }

    // Don't allow dropping on self or descendants
    if (dragState.draggedItem.id === dropItem.id || isDescendant(dragState.draggedItem, dropItem)) {
      resetDragState();
      return;
    }

    // Remove item from current position
    let newHierarchy = removeItemFromHierarchy(hierarchyData, dragState.draggedItem.id);
    
    // Insert item at new position
    if (dragState.dropPosition === 'above') {
      newHierarchy = insertItemAtPosition(newHierarchy, dropItem.id, dragState.draggedItem, 'before');
    } else if (dragState.dropPosition === 'below') {
      newHierarchy = insertItemAtPosition(newHierarchy, dropItem.id, dragState.draggedItem, 'after');
    } else if (dragState.dropPosition === 'inside') {
      newHierarchy = insertItemInHierarchy(newHierarchy, dropItem.id, dragState.draggedItem, 'inside');
      // Auto-expand the parent to show the new child
      setExpandedItems(prev => [...new Set([...prev, dropItem.id])]);
    }
    
    setHierarchyData(newHierarchy);
    resetDragState();
  };

  const resetDragState = () => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOverItem: null,
      dropPosition: null,
      dragStartDepth: 0
    });
  };

  const handleDragEnd = () => {
    resetDragState();
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
      <div 
        key={item.id}
        className={`relative rounded-sm transition-all duration-100 ${
          dragState.isDragging && dragState.draggedItem?.id === item.id ? 'opacity-50' : ''
        } ${
          dragState.dragOverItem?.id === item.id && dragState.dropPosition ? 
            (dragState.dropPosition === 'above' ? 'border-t-2 border-blue-500' : 
             dragState.dropPosition === 'below' ? 'border-b-2 border-blue-500' : 
             'bg-blue-800/30') : ''
        }`}
        onContextMenu={(e) => onContextMenu(e, item)}
      >
        <div 
          draggable="true"
          onDragStart={(e) => handleDragStart(e, item, depth)}
          onDragOver={(e) => handleDragOver(e, item, depth)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item)}
          onDragEnd={handleDragEnd}
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
            onClick={(e) => handleDeleteObject(item.id, e)}
            title="Delete object"
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
          <div 
            ref={containerRef} 
            className="flex flex-col flex-1 overflow-hidden"
            onContextMenu={(e) => onContextMenu(e, null)}
          >
            <div
              className="flex-1 overflow-y-auto scrollbar-thin"
              onContextMenu={(e) => onContextMenu(e, null)}
            >
              {hierarchyData.map(item => renderSceneItem(item))}
            </div>
            {selectedObject && (
              <>
                <div
                  className={`h-1 cursor-row-resize transition-colors ${isResizing ? 'bg-blue-500/75' : 'bg-slate-700/50 hover:bg-blue-500/75'}`}
                  onMouseDown={handleMouseDown}
                />
                <div className="overflow-y-auto scrollbar-thin" style={{ height: `${bottomPanelHeight}px` }}>
                <div>
                  <CollapsibleSection title="Transform" defaultOpen={true} index={0}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Position</label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={selectedObjectData ? selectedObjectData.position[0].toFixed(2) : '0'} 
                              onChange={(e) => handlePropertyChange('position', 'x', e.target.value)}
                              className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">X</span>
                          </div>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={selectedObjectData ? selectedObjectData.position[1].toFixed(2) : '0'} 
                              onChange={(e) => handlePropertyChange('position', 'y', e.target.value)}
                              className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Y</span>
                          </div>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={selectedObjectData ? selectedObjectData.position[2].toFixed(2) : '0'} 
                              onChange={(e) => handlePropertyChange('position', 'z', e.target.value)}
                              className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Z</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Rotation</label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={selectedObjectData ? (selectedObjectData.rotation[0] * 180 / Math.PI).toFixed(1) : '0'} 
                              onChange={(e) => handlePropertyChange('rotation', 'x', (parseFloat(e.target.value) || 0) * Math.PI / 180)}
                              className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">X</span>
                          </div>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={selectedObjectData ? (selectedObjectData.rotation[1] * 180 / Math.PI).toFixed(1) : '0'} 
                              onChange={(e) => handlePropertyChange('rotation', 'y', (parseFloat(e.target.value) || 0) * Math.PI / 180)}
                              className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Y</span>
                          </div>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={selectedObjectData ? (selectedObjectData.rotation[2] * 180 / Math.PI).toFixed(1) : '0'} 
                              onChange={(e) => handlePropertyChange('rotation', 'z', (parseFloat(e.target.value) || 0) * Math.PI / 180)}
                              className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Z</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Scale</label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={selectedObjectData ? selectedObjectData.scale[0].toFixed(2) : '1'} 
                              onChange={(e) => handlePropertyChange('scale', 'x', e.target.value)}
                              className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">X</span>
                          </div>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={selectedObjectData ? selectedObjectData.scale[1].toFixed(2) : '1'} 
                              onChange={(e) => handlePropertyChange('scale', 'y', e.target.value)}
                              className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Y</span>
                          </div>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={selectedObjectData ? selectedObjectData.scale[2].toFixed(2) : '1'} 
                              onChange={(e) => handlePropertyChange('scale', 'z', e.target.value)}
                              className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Z</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                  <CollapsibleSection title="Material" defaultOpen={true} index={1}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Material Type</label>
                        <select className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer">
                          <option>Standard</option>
                          <option>Toon</option>
                          <option>Glass</option>
                          <option>Emissive</option>
                          <option>Metallic</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Base Color</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={getColorHex()} 
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-10 h-10 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer" 
                          />
                          <div className="flex-1 bg-slate-800/80 border border-slate-600 rounded-lg p-2">
                            <div className="text-xs text-gray-300">{getColorHex().toUpperCase()}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <SliderWithTooltip 
                          label="Roughness"
                          min={0}
                          max={1}
                          step={0.1}
                          defaultValue={roughness}
                          onChange={setRoughness}
                        />
                        <SliderWithTooltip 
                          label="Metalness"
                          min={0}
                          max={1}
                          step={0.1}
                          defaultValue={metalness}
                          onChange={setMetalness}
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                  <CollapsibleSection title="Scripts" index={2}>
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Attached Scripts</label>
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/80 border-2 border-dashed border-slate-600 hover:border-blue-500/50 rounded-xl p-6 text-center transition-all duration-200 group">
                        <div className="flex flex-col items-center gap-2">
                          <Icons.CodeBracket className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Drag scripts here or click to browse</p>
                          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">+ Add Script</button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                  <CollapsibleSection title="Custom Properties" index={3}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <label className="text-xs font-medium text-gray-300">Enable Features</label>
                        <button
                          onClick={() => setIsTestToggleOn(!isTestToggleOn)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${isTestToggleOn ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-600'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${isTestToggleOn ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Object Name</label>
                        <input type="text" className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="Enter object name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Description</label>
                        <textarea className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none" rows="3" placeholder="Enter description"></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Category</label>
                          <select className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer">
                            <option>Environment</option>
                            <option>Character</option>
                            <option>Prop</option>
                            <option>Effect</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Created</label>
                          <input type="date" className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
                </div>
              </>
            )}
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
              <SliderWithTooltip 
                label="Intensity"
                min={0}
                max={10}
                step={0.1}
                defaultValue={intensity}
                onChange={setIntensity}
              />
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
              <SliderWithTooltip 
                label="Ambient Occlusion"
                min={0}
                max={1}
                step={0.1}
                defaultValue={ambientOcclusion}
                onChange={setAmbientOcclusion}
              />
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div>
            <CollapsibleSection title="Grid Helper" defaultOpen={true} index={0}>
              <div className="space-y-4">
                {/* Grid Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                  <label className="text-xs font-medium text-gray-300">Enable Grid</label>
                  <button
                    onClick={() => updateGridSettings({ enabled: !gridSettings.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${gridSettings.enabled ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-600'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${gridSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                {/* Grid Settings - with slide animation */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${gridSettings.enabled ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4">
                    {/* Grid Size - only show when infinite grid is disabled */}
                    {!gridSettings.infiniteGrid && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Grid Size</label>
                        <input 
                          type="number" 
                          step="10"
                          min="10"
                          max="1000"
                          value={gridSettings.size} 
                          onChange={(e) => updateGridSettings({ size: parseInt(e.target.value) || 100 })}
                          className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                        />
                      </div>
                    )}

                    {/* Cell Size */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Cell Size</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="0.1"
                        max="10"
                        value={gridSettings.cellSize} 
                        onChange={(e) => updateGridSettings({ cellSize: parseFloat(e.target.value) || 1 })}
                        className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                      />
                    </div>

                    {/* Grid Position */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Grid Position</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.1"
                            value={gridSettings.position[0]} 
                            onChange={(e) => {
                              const newPos = [...gridSettings.position];
                              newPos[0] = parseFloat(e.target.value) || 0;
                              updateGridSettings({ position: newPos });
                            }}
                            className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">X</span>
                        </div>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.1"
                            value={gridSettings.position[1]} 
                            onChange={(e) => {
                              const newPos = [...gridSettings.position];
                              newPos[1] = parseFloat(e.target.value) || 0;
                              updateGridSettings({ position: newPos });
                            }}
                            className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Y</span>
                        </div>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.1"
                            value={gridSettings.position[2]} 
                            onChange={(e) => {
                              const newPos = [...gridSettings.position];
                              newPos[2] = parseFloat(e.target.value) || 0;
                              updateGridSettings({ position: newPos });
                            }}
                            className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Z</span>
                        </div>
                      </div>
                    </div>

                    {/* Grid Colors */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Cell Color</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={gridSettings.cellColor} 
                            onChange={(e) => updateGridSettings({ cellColor: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer" 
                          />
                          <div className="flex-1 bg-slate-800/80 border border-slate-600 rounded-lg p-2">
                            <div className="text-xs text-gray-300">{gridSettings.cellColor.toUpperCase()}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Section Color</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={gridSettings.sectionColor} 
                            onChange={(e) => updateGridSettings({ sectionColor: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer" 
                          />
                          <div className="flex-1 bg-slate-800/80 border border-slate-600 rounded-lg p-2">
                            <div className="text-xs text-gray-300">{gridSettings.sectionColor.toUpperCase()}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Section Size</label>
                        <input 
                          type="number" 
                          step="1"
                          min="1"
                          max="50"
                          value={gridSettings.sectionSize} 
                          onChange={(e) => updateGridSettings({ sectionSize: parseInt(e.target.value) || 10 })}
                          className="w-full bg-slate-800/80 border border-slate-600 text-white text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                        <label className="text-xs font-medium text-gray-300">Infinite Grid</label>
                        <button
                          onClick={() => updateGridSettings({ infiniteGrid: !gridSettings.infiniteGrid })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${gridSettings.infiniteGrid ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-600'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${gridSettings.infiniteGrid ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Viewport" defaultOpen={true} index={1}>
              <div className="space-y-4">
                {/* Background Color */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={viewportSettings.backgroundColor} 
                      onChange={(e) => updateViewportSettings({ backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer" 
                    />
                    <div className="flex-1 bg-slate-800/80 border border-slate-600 rounded-lg p-2">
                      <div className="text-xs text-gray-300">{viewportSettings.backgroundColor.toUpperCase()}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Background Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Quick Presets</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => updateViewportSettings({ backgroundColor: '#1a202c' })}
                      className="h-8 rounded-lg border border-slate-600 transition-all hover:scale-105 hover:border-blue-500"
                      style={{ backgroundColor: '#1a202c' }}
                      title="Dark Blue"
                    />
                    <button
                      onClick={() => updateViewportSettings({ backgroundColor: '#000000' })}
                      className="h-8 rounded-lg border border-slate-600 transition-all hover:scale-105 hover:border-blue-500"
                      style={{ backgroundColor: '#000000' }}
                      title="Black"
                    />
                    <button
                      onClick={() => updateViewportSettings({ backgroundColor: '#374151' })}
                      className="h-8 rounded-lg border border-slate-600 transition-all hover:scale-105 hover:border-blue-500"
                      style={{ backgroundColor: '#374151' }}
                      title="Gray"
                    />
                    <button
                      onClick={() => updateViewportSettings({ backgroundColor: '#ffffff' })}
                      className="h-8 rounded-lg border border-slate-600 transition-all hover:scale-105 hover:border-blue-500"
                      style={{ backgroundColor: '#ffffff' }}
                      title="White"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Skybox Section */}
            <CollapsibleSection title="Skybox" defaultOpen={false} index={2}>
              <div className="space-y-4">
                {/* Environment Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Environment</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateViewportSettings({ backgroundColor: '#87CEEB' })}
                      className="flex items-center p-2 bg-slate-800 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors text-left"
                    >
                      <div className="w-4 h-4 rounded mr-2" style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}></div>
                      <span className="text-xs text-slate-300">Blue Sky</span>
                    </button>
                    <button
                      onClick={() => updateViewportSettings({ backgroundColor: '#FF6B35' })}
                      className="flex items-center p-2 bg-slate-800 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors text-left"
                    >
                      <div className="w-4 h-4 rounded mr-2" style={{ background: 'linear-gradient(to bottom, #FF6B35, #FFD700)' }}></div>
                      <span className="text-xs text-slate-300">Sunset</span>
                    </button>
                    <button
                      onClick={() => updateViewportSettings({ backgroundColor: '#1a1a2e' })}
                      className="flex items-center p-2 bg-slate-800 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors text-left"
                    >
                      <div className="w-4 h-4 rounded mr-2" style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }}></div>
                      <span className="text-xs text-slate-300">Night</span>
                    </button>
                    <button
                      onClick={() => updateViewportSettings({ backgroundColor: '#FFB6C1' })}
                      className="flex items-center p-2 bg-slate-800 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors text-left"
                    >
                      <div className="w-4 h-4 rounded mr-2" style={{ background: 'linear-gradient(to bottom, #FFB6C1, #FF69B4)' }}></div>
                      <span className="text-xs text-slate-300">Dawn</span>
                    </button>
                  </div>
                </div>

                {/* HDR Environment Maps */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">HDR Environments</label>
                  <div className="space-y-1">
                    {HDR_ENVIRONMENTS.map((env) => (
                      <button
                        key={env.id}
                        onClick={() => {
                          try {
                            const environment = getHDREnvironment(env.id);
                            const { setEnvironment } = renderActions;
                            
                            if (environment.type === 'room') {
                              setEnvironment(null, 1.0, 'hdr', 'room');
                            } else if (environment.preset) {
                              setEnvironment(environment.preset, 1.0, 'hdr', 'preset');
                            }
                          } catch (error) {
                            console.error('Failed to set HDR environment:', error);
                          }
                        }}
                        className="w-full flex items-center p-2 bg-slate-800 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors text-left"
                      >
                        <Icons.Image className="w-4 h-4 mr-2 text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-300">{env.name}</span>
                          <span className="text-xs text-slate-500">{env.description}</span>
                        </div>
                      </button>
                    ))}
                    
                    {/* Clear Environment Button */}
                    <button
                      onClick={() => {
                        const { clearEnvironment } = renderActions;
                        clearEnvironment();
                        // Also reset the background color
                        updateViewportSettings({ backgroundColor: '#1a202c' });
                      }}
                      className="w-full flex items-center p-2 bg-slate-800 border border-slate-600 rounded-lg hover:border-red-500 transition-colors text-left"
                    >
                      <Icons.XMark className="w-4 h-4 mr-2 text-red-400" />
                      <span className="text-xs text-slate-300">Clear Environment</span>
                    </button>
                  </div>
                </div>

                {/* Environment Intensity */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Environment Intensity</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      defaultValue="1"
                      onChange={(e) => {
                        const intensity = parseFloat(e.target.value);
                        const { setEnvironmentIntensity } = renderActions;
                        setEnvironmentIntensity(intensity);
                        // Update the display value
                        const display = e.target.parentElement.querySelector('.intensity-display');
                        if (display) display.textContent = intensity.toFixed(1);
                      }}
                      className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none slider"
                    />
                    <span className="text-xs text-slate-400 w-8 intensity-display">1.0</span>
                  </div>
                </div>

                {/* Custom Color Fallback */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Custom Background</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={viewportSettings.backgroundColor} 
                      onChange={(e) => updateViewportSettings({ backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-600 bg-slate-800 cursor-pointer" 
                    />
                    <div className="flex-1 bg-slate-800/80 border border-slate-600 rounded-lg p-2">
                      <div className="text-xs text-gray-300">{viewportSettings.backgroundColor.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
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
      <div ref={headerRef} className="px-3 py-2 border-b border-slate-700/60">
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