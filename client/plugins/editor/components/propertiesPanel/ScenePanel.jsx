import { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '@/plugins/editor/components/Icons.jsx';
import SliderWithTooltip from '@/plugins/editor/components/ui/SliderWithTooltip.jsx';
import CollapsibleSection from '@/plugins/editor/components/ui/CollapsibleSection.jsx';
import ExportSettingsPanel from './ExportSettingsPanel.jsx';
import LayersPanel from './LayersPanel.jsx';
import AdjustmentsPanel from './AdjustmentsPanel.jsx';
import HistoryPanel from './HistoryPanel.jsx';
import ColorsPanel from './ColorsPanel.jsx';
import BrushesPanel from './BrushesPanel.jsx';
import { globalStore, actions } from "@/store.js";
import { useSnapshot } from 'valtio';

function ScenePanel({ selectedObject, onObjectSelect, isOpen, onToggle, selectedTool, onToolSelect, onContextMenu }) {
  const [expandedItems, setExpandedItems] = useState(['scene']);
  const ui = useSnapshot(globalStore.editor.ui);
  const { scenePropertiesHeight: bottomPanelHeight } = ui;
  const { setScenePropertiesHeight: setBottomPanelHeight } = actions.editor;
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
  
  const settings = useSnapshot(globalStore.editor.settings);
  const babylonScene = globalStore.editor.babylonScene;
  const { grid: gridSettings, viewport: viewportSettings } = settings;
  const { setSelectedEntity, setTransformMode, updateGridSettings, updateViewportSettings } = actions.editor;
  
  // Get selected object data from Babylon.js scene
  const selectedObjectData = useMemo(() => {
    if (!selectedObject) return null;
    
    const scene = babylonScene?.current;
    if (!scene) return null;
    
    const babylonObjects = [];
    
    // Check meshes
    if (scene.meshes) {
      scene.meshes.forEach(mesh => {
        if ((mesh.uniqueId || mesh.name) === selectedObject) {
          babylonObjects.push({
            id: mesh.uniqueId || mesh.name,
            name: mesh.name,
            type: 'mesh',
            position: mesh.position ? [mesh.position.x, mesh.position.y, mesh.position.z] : [0, 0, 0],
            rotation: mesh.rotation ? [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z] : [0, 0, 0],
            scale: mesh.scaling ? [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z] : [1, 1, 1],
            visible: mesh.isVisible !== false,
            babylonObject: mesh
          });
        }
      });
    }
    
    // Check lights
    if (scene.lights) {
      scene.lights.forEach(light => {
        if ((light.uniqueId || light.name) === selectedObject) {
          babylonObjects.push({
            id: light.uniqueId || light.name,
            name: light.name,
            type: 'light',
            lightType: light.getClassName().toLowerCase().replace('light', ''),
            position: light.position ? [light.position.x, light.position.y, light.position.z] : [0, 0, 0],
            rotation: light.rotation ? [light.rotation.x, light.rotation.y, light.rotation.z] : [0, 0, 0],
            visible: light.isEnabled(),
            intensity: light.intensity || 1,
            color: light.diffuse ? `rgb(${Math.round(light.diffuse.r * 255)}, ${Math.round(light.diffuse.g * 255)}, ${Math.round(light.diffuse.b * 255)})` : '#ffffff',
            castShadow: light.shadowEnabled || false,
            babylonObject: light
          });
        }
      });
    }
    
    // Check cameras
    if (scene.cameras) {
      scene.cameras.forEach(camera => {
        if ((camera.uniqueId || camera.name) === selectedObject) {
          babylonObjects.push({
            id: camera.uniqueId || camera.name,
            name: camera.name,
            type: 'camera',
            position: camera.position ? [camera.position.x, camera.position.y, camera.position.z] : [0, 0, 0],
            rotation: camera.rotation ? [camera.rotation.x, camera.rotation.y, camera.rotation.z] : [0, 0, 0],
            cameraType: camera.getClassName().toLowerCase().replace('camera', ''),
            fov: camera.fov ? camera.fov * 180 / Math.PI : 60,
            near: camera.minZ || 0.1,
            far: camera.maxZ || 1000,
            visible: true,
            babylonObject: camera
          });
        }
      });
    }
    
    return babylonObjects.length > 0 ? babylonObjects[0] : null;
  }, [selectedObject, babylonScene]);
  
  // Handle object deletion
  const handleDeleteObject = (objectId, e) => {
    e.stopPropagation();
    
    const scene = babylonScene?.current;
    if (!scene) return;
    
    // Find and dispose the object in Babylon.js scene
    let foundObject = null;
    
    // Check meshes
    if (scene.meshes) {
      foundObject = scene.meshes.find(mesh => (mesh.uniqueId || mesh.name) === objectId);
    }
    
    // Check lights
    if (!foundObject && scene.lights) {
      foundObject = scene.lights.find(light => (light.uniqueId || light.name) === objectId);
    }
    
    // Check cameras
    if (!foundObject && scene.cameras) {
      foundObject = scene.cameras.find(camera => (camera.uniqueId || camera.name) === objectId);
    }
    
    // Check transform nodes
    if (!foundObject && scene.transformNodes) {
      foundObject = scene.transformNodes.find(node => (node.uniqueId || node.name) === objectId);
    }
    
    if (foundObject) {
      foundObject.dispose();
    }
    
    // Clear selection if deleted object was selected
    if (selectedObject === objectId) {
      setSelectedEntity(null);
      setTransformMode('select');
    }
  };
  
  // Handle property changes for Babylon.js objects
  const handlePropertyChange = (property, axis, value) => {
    if (!selectedObjectData?.babylonObject) return;
    
    const numValue = parseFloat(value) || 0;
    const babylonObj = selectedObjectData.babylonObject;
    
    if (property === 'position' && babylonObj.position) {
      if (axis === 'x') babylonObj.position.x = numValue;
      else if (axis === 'y') babylonObj.position.y = numValue;
      else if (axis === 'z') babylonObj.position.z = numValue;
    } else if (property === 'rotation' && babylonObj.rotation) {
      if (axis === 'x') babylonObj.rotation.x = numValue;
      else if (axis === 'y') babylonObj.rotation.y = numValue;
      else if (axis === 'z') babylonObj.rotation.z = numValue;
    } else if (property === 'scale' && babylonObj.scaling) {
      if (axis === 'x') babylonObj.scaling.x = numValue;
      else if (axis === 'y') babylonObj.scaling.y = numValue;
      else if (axis === 'z') babylonObj.scaling.z = numValue;
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
  
  // Force hierarchy update with state changes
  const [sceneUpdateTrigger, setSceneUpdateTrigger] = useState(0);
  
  // Poll for scene changes since valtio refs don't trigger reactivity
  useEffect(() => {
    const interval = setInterval(() => {
      const scene = babylonScene?.current;
      if (scene && scene.meshes) {
        // Trigger update if scene has objects
        setSceneUpdateTrigger(prev => prev + 1);
      }
    }, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, [babylonScene]);

  // Convert Babylon.js scene to hierarchy format
  const hierarchyData = useMemo(() => {
    const scene = babylonScene?.current;
    if (!scene) {
      return [
        {
          id: 'scene',
          name: 'Scene',
          type: 'scene',
          visible: true,
          children: []
        }
      ];
    }

    // Extract hierarchy from Babylon.js scene
    const babylonObjects = [];
    
    // Add all meshes
    if (scene.meshes) {
      scene.meshes.forEach(mesh => {
        if (mesh.name && mesh.name !== '__root__') {
          babylonObjects.push({
            id: mesh.uniqueId || mesh.name,
            name: mesh.name,
            type: 'mesh',
            visible: mesh.isVisible !== false,
            babylonObject: mesh,
            children: []
          });
        }
      });
    }
    
    // Add all lights
    if (scene.lights) {
      scene.lights.forEach(light => {
        if (light.name && !light.name.startsWith('Default')) {
          babylonObjects.push({
            id: light.uniqueId || light.name,
            name: light.name,
            type: 'light',
            lightType: light.getClassName().toLowerCase().replace('light', ''),
            visible: light.isEnabled(),
            babylonObject: light,
            children: []
          });
        }
      });
    }
    
    // Add all cameras
    if (scene.cameras) {
      scene.cameras.forEach(camera => {
        if (camera.name && camera.name !== 'camera') {
          babylonObjects.push({
            id: camera.uniqueId || camera.name,
            name: camera.name,
            type: 'camera',
            visible: true,
            babylonObject: camera,
            children: []
          });
        }
      });
    }
    
    // Add transform nodes
    if (scene.transformNodes) {
      scene.transformNodes.forEach(node => {
        if (node.name && node.name !== '__root__') {
          babylonObjects.push({
            id: node.uniqueId || node.name,
            name: node.name,
            type: 'transform',
            visible: true,
            babylonObject: node,
            children: []
          });
        }
      });
    }

    return [
      {
        id: 'scene',
        name: 'Scene',
        type: 'scene',
        visible: true,
        children: babylonObjects
      }
    ];
  }, [babylonScene, sceneUpdateTrigger]);
  
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

    // This drag-and-drop functionality would need integration with Babylon.js
    // For now, we'll just show a console message
    console.log('Drag and drop not yet implemented for Babylon.js scene objects');
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

  

  const getIcon = (type, lightType) => {
    switch (type) {
      case 'character':
        return <Icons.Character className="w-4 h-4 text-blue-400" />;
      case 'terrain':
        return <Icons.Terrain className="w-4 h-4 text-green-400" />;
      case 'model':
        return <Icons.Cube className="w-4 h-4 text-gray-400" />;
      case 'mesh':
        return <Icons.Cube3D className="w-4 h-4 text-blue-400" />;
      case 'transform':
        return <Icons.Cube className="w-4 h-4 text-purple-400" />;
      case 'light':
        switch (lightType) {
          case 'directional':
            return <Icons.LightDirectional className="w-4 h-4 text-yellow-400" />;
          case 'point':
            return <Icons.LightPoint className="w-4 h-4 text-yellow-400" />;
          case 'spot':
            return <Icons.LightSpot className="w-4 h-4 text-yellow-400" />;
          case 'hemispheric':
            return <Icons.LightBulb className="w-4 h-4 text-yellow-400" />;
          default:
            return <Icons.LightBulb className="w-4 h-4 text-yellow-400" />;
        }
      case 'camera':
        return <Icons.CameraScene className="w-4 h-4 text-green-400" />;
      case 'folder':
        return <Icons.Folder className="w-4 h-4 text-yellow-500" />;
      case 'scene':
        return <Icons.Cube className="w-4 h-4 text-gray-300" />;
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
          
          <span className="mr-2">{getIcon(item.type, item.lightType)}</span>
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
      case 'audio-devices': return 'Audio Devices';
      case 'mixer-settings': return 'Mixer Settings';
      case 'export-settings': return 'Export Settings';
      case 'layers': return 'Layers';
      case 'adjustments': return 'Adjustments';
      case 'history': return 'History';
      case 'colors': return 'Colors';
      case 'brushes': return 'Brushes';
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
                      {/* Only show transform properties for objects that have them */}
                      {selectedObjectData && (selectedObjectData.type === 'mesh' || selectedObjectData.type === 'light' || selectedObjectData.type === 'camera') && selectedObjectData.position && (
                        <>
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
                          {/* Only show scale for mesh objects */}
                          {selectedObjectData.type === 'mesh' && selectedObjectData.scale && (
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
                          )}
                        </>
                      )}
                      
                      {/* Show object type info for non-transform objects */}
                      {selectedObjectData && selectedObjectData.type === 'folder' && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Folder Info</label>
                          <div className="text-xs text-gray-400">
                            <p>Type: Folder</p>
                            <p>Children: {selectedObjectData.children ? selectedObjectData.children.length : 0}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Show camera-specific properties */}
                      {selectedObjectData && selectedObjectData.type === 'camera' && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Camera Info</label>
                          <div className="text-xs text-gray-400">
                            <p>Type: {selectedObjectData.cameraType || 'perspective'}</p>
                            <p>FOV: {selectedObjectData.fov || 60}°</p>
                            <p>Near: {selectedObjectData.near || 0.1}</p>
                            <p>Far: {selectedObjectData.far || 1000}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Show light-specific properties */}
                      {selectedObjectData && selectedObjectData.type === 'light' && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">Light Info</label>
                          <div className="text-xs text-gray-400">
                            <p>Type: {selectedObjectData.lightType}</p>
                            <p>Color: {selectedObjectData.color}</p>
                            <p>Intensity: {selectedObjectData.intensity}</p>
                            <p>Cast Shadow: {selectedObjectData.castShadow ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      )}
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

            
            <CollapsibleSection title="Performance" defaultOpen={false} index={3}>
              <div className="space-y-4">
                {/* Stats.js Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                  <div>
                    <label className="text-xs font-medium text-gray-300">Performance Stats</label>
                    <p className="text-xs text-gray-500 mt-0.5">Show FPS, memory usage, and render statistics</p>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !settings.editor.showStats;
                      console.log('ScenePanel: Stats toggle clicked, newValue:', newValue);
                      
                      actions.editor.updateEditorSettings({ showStats: newValue });
                      
                      actions.editor.addConsoleMessage(`Performance stats ${newValue ? 'enabled' : 'disabled'}`, 'success');
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${settings.editor.showStats ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-600'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${settings.editor.showStats ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </CollapsibleSection>
            </div>
          </div>
        );


      case 'audio-devices':
        return (
          <div className="h-full overflow-y-auto bg-gray-900 p-4 space-y-4">
            <CollapsibleSection 
              title="Audio Devices" 
              icon={Icons.Audio}
              defaultOpen={true}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Input Device</label>
                  <select className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200">
                    <option>Default Input</option>
                    <option>Microphone Array</option>
                    <option>Audio Interface</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Output Device</label>
                  <select className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200">
                    <option>Default Output</option>
                    <option>Speakers</option>
                    <option>Headphones</option>
                  </select>
                </div>
                <div>
                  <SliderWithTooltip
                    label="Input Gain"
                    defaultValue={75}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <SliderWithTooltip
                    label="Output Gain"
                    defaultValue={85}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection 
              title="Monitoring" 
              icon={Icons.Monitor}
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Direct Monitoring</label>
                  <button className="w-10 h-6 rounded-full bg-gray-600">
                    <div className="w-4 h-4 rounded-full bg-white translate-x-1" />
                  </button>
                </div>
                <div>
                  <SliderWithTooltip
                    label="Monitor Mix"
                    defaultValue={50}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case 'mixer-settings':
        return (
          <div className="h-full overflow-y-auto bg-gray-900 p-4 space-y-4">
            <CollapsibleSection 
              title="Mixer Configuration" 
              icon={Icons.Mixer}
              defaultOpen={true}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Channel Layout</label>
                  <select className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200">
                    <option>Stereo</option>
                    <option>5.1 Surround</option>
                    <option>7.1 Surround</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Max Channels</label>
                  <input
                    type="number"
                    min="2"
                    max="64"
                    defaultValue="16"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Auto Gain Control</label>
                  <button className="w-10 h-6 rounded-full bg-blue-600">
                    <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Peak Limiting</label>
                  <button className="w-10 h-6 rounded-full bg-blue-600">
                    <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
                  </button>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection 
              title="Effects Send" 
              icon={Icons.Effects}
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div>
                  <SliderWithTooltip
                    label="Reverb Send"
                    defaultValue={25}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <SliderWithTooltip
                    label="Delay Send"
                    defaultValue={15}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <SliderWithTooltip
                    label="Chorus Send"
                    defaultValue={10}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case 'export-settings':
        return <ExportSettingsPanel />;
      case 'layers':
        return <LayersPanel />;
      case 'adjustments':
        return <AdjustmentsPanel />;
      case 'history':
        return <HistoryPanel />;
      case 'colors':
        return <ColorsPanel />;
      case 'brushes':
        return <BrushesPanel />;
      
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
            SCENE OBJECTS ({hierarchyData[0]?.children?.length || 0})
          </div>
        )}
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}

      
    </div>
  );
}

export default ScenePanel;