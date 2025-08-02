import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '@/plugins/editor/components/Icons.jsx';
import SliderWithTooltip from '@/plugins/editor/components/ui/SliderWithTooltip.jsx';
import { CollapsibleSection, Field, Toggle, ColorPicker, Button } from '@/plugins/ui';
import { globalStore, actions, babylonScene } from "@/store.js";
import { useSnapshot } from 'valtio';

const SceneTab = ({ selectedObject, onObjectSelect, onContextMenu }) => {
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
    dropPosition: null,
    dragStartDepth: 0
  });
  
  const settings = useSnapshot(globalStore.editor.settings);
  const sceneData = useSnapshot(globalStore.editor.scene);
  // Use external babylonScene reference for full Babylon.js objects when needed
  const { setSelectedEntity, setTransformMode, updateViewportSettings } = actions.editor;
  const containerRef = useRef(null);
  
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
            scaling: mesh.scaling ? [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z] : [1, 1, 1],
            material: mesh.material ? {
              name: mesh.material.name,
              diffuseColor: mesh.material.diffuseColor || mesh.material.baseColor || { r: 1, g: 1, b: 1 },
              emissiveColor: mesh.material.emissiveColor || { r: 0, g: 0, b: 0 },
              specularColor: mesh.material.specularColor || { r: 1, g: 1, b: 1 },
              roughness: mesh.material.roughness || 0.5,
              metallic: mesh.material.metallic || 0
            } : null,
            boundingInfo: mesh.getBoundingInfo ? mesh.getBoundingInfo() : null,
            visible: mesh.isVisible !== undefined ? mesh.isVisible : true,
            pickable: mesh.isPickable !== undefined ? mesh.isPickable : true,
            castShadow: mesh.receiveShadow !== undefined ? mesh.receiveShadow : false
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
            position: light.position ? [light.position.x, light.position.y, light.position.z] : [0, 0, 0],
            intensity: light.intensity !== undefined ? light.intensity : 1,
            diffuse: light.diffuse || { r: 1, g: 1, b: 1 },
            specular: light.specular || { r: 1, g: 1, b: 1 },
            lightType: light.getClassName ? light.getClassName() : 'Unknown'
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
            target: camera.getTarget && camera.getTarget() ? camera.getTarget() : null,
            fov: camera.fov || 0.8,
            nearPlane: camera.minZ || 0.1,
            farPlane: camera.maxZ || 1000
          });
        }
      });
    }
    
    return babylonObjects[0] || null;
  }, [selectedObject]);

  // Generate hierarchy data from lightweight store (reactive!)
  const hierarchyData = useMemo(() => {
    if (!sceneData.isLoaded) {
      console.log('SceneTab: No scene loaded');
      return [];
    }
    
    const { objects } = sceneData;
    const totalObjects = objects.meshes.length + objects.lights.length + objects.cameras.length;
    console.log('SceneTab: Scene loaded with', objects.meshes.length, 'meshes,', objects.lights.length, 'lights,', objects.cameras.length, 'cameras');
    
    const items = [];
    
    // Add scene root
    items.push({
      id: 'scene-root',
      name: sceneData.name,
      type: 'scene',
      depth: 0,
      children: []
    });
    
    // Add meshes from lightweight store
    objects.meshes.forEach(mesh => {
      items.push({
        id: mesh.id,
        name: mesh.name,
        type: 'mesh',
        depth: 1,
        children: [],
        visible: mesh.visible
      });
    });
    
    // Add lights from lightweight store
    objects.lights.forEach(light => {
      items.push({
        id: light.id,
        name: light.name,
        type: 'light',
        depth: 1,
        children: [],
        intensity: light.intensity
      });
    });
    
    // Add cameras from lightweight store
    objects.cameras.forEach(camera => {
      items.push({
        id: camera.id,
        name: camera.name,
        type: 'camera',
        depth: 1,
        children: [],
        active: camera.active
      });
    });
    
    return items;
  }, [sceneData.isLoaded, sceneData.objects.meshes.length, sceneData.objects.lights.length, sceneData.objects.cameras.length, sceneData.name]);

  // Mouse event handlers for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const newHeight = containerRect.bottom - e.clientY;
          const clampedHeight = Math.max(200, Math.min(500, newHeight));
          setBottomPanelHeight(clampedHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setBottomPanelHeight]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemSelect = (item) => {
    console.log('SceneTab: Item selected:', item);
    if (item.type === 'scene') return;
    
    // Update selection in store (reactive)
    actions.editor.selectSceneObject(item.id);
    
    // Also call parent callbacks
    onObjectSelect(item.id);
    setSelectedEntity(item.id);
    console.log('SceneTab: Selection updated to:', item.id);
  };

  const getItemIcon = (item) => {
    switch (item.type) {
      case 'scene': return Icons.Scene;
      case 'mesh': return Icons.Cube;
      case 'light': return Icons.LightBulb;
      case 'camera': return Icons.Camera;
      case 'folder': return Icons.Folder;
      default: return Icons.Cube;
    }
  };

  const renderSceneItem = (item, index = 0) => {
    const isSelected = selectedObject === item.id;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const IconComponent = getItemIcon(item);
    const indentLevel = Math.max(0, item.depth || 0);
    
    return (
      <div key={item.id || index}>
        <div
          className={`
            flex items-center px-2 py-1 text-xs cursor-pointer transition-all duration-150 group
            ${isSelected 
              ? 'bg-blue-600/30 text-blue-200 border-l-2 border-blue-500 shadow-sm' 
              : 'text-gray-300 hover:bg-slate-700/50 hover:text-gray-200 border-l-2 border-transparent hover:border-slate-500'
            }
          `}
          style={{ paddingLeft: `${8 + indentLevel * 16}px` }}
          onClick={() => handleItemSelect(item)}
          onContextMenu={(e) => onContextMenu(e, item)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(item.id);
              }}
              className="mr-1 p-0.5 hover:bg-slate-600 rounded transition-colors"
            >
              <Icons.ChevronRight 
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              />
            </button>
          )}
          
          {!hasChildren && <div className="w-4 mr-1" />}
          
          <IconComponent className="w-3 h-3 mr-2 flex-shrink-0" />
          
          <span className="flex-1 truncate group-hover:text-gray-100">
            {item.name}
          </span>
          
          {item.visible === false && (
            <Icons.EyeSlash className="w-3 h-3 ml-1 text-gray-500" />
          )}
        </div>
        
        {hasChildren && isExpanded && item.children.map((child, childIndex) => 
          renderSceneItem(child, childIndex)
        )}
      </div>
    );
  };

  // Color helper functions
  const getColorHex = () => {
    if (!selectedObjectData?.material?.diffuseColor) return '#ffffff';
    const color = selectedObjectData.material.diffuseColor;
    const toHex = (val) => Math.round(Math.max(0, Math.min(255, val * 255))).toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  };

  const handleColorChange = (hexColor) => {
    // This would typically update the material color in Babylon.js
    console.log('Color changed to:', hexColor);
  };

  const handleToggleVisibility = (itemId) => {
    // Update visibility in both store and Babylon.js scene
    actions.editor.updateSceneObjectProperty(itemId, 'visible', 
      !hierarchyData.find(item => item.id === itemId)?.visible
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Scene Hierarchy */}
      <CollapsibleSection 
        title="Scene" 
        defaultOpen={true}
        className="border-none rounded-none bg-slate-800/30"
        titleClassName="bg-slate-700/50"
        contentClassName="p-0 bg-slate-900"
        rightElement={
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <Icons.Plus className="w-3 h-3" />
          </Button>
        }
      >
        <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
          {hierarchyData.length > 0 ? (
            <div className="space-y-0">
              {hierarchyData.map(item => (
                <div
                  key={item.id}
                  className={`
                    flex items-center px-3 py-1.5 text-sm cursor-pointer transition-all group
                    ${selectedObject === item.id 
                      ? 'bg-blue-600/30 text-blue-200 border-l-2 border-blue-500' 
                      : 'text-gray-300 hover:bg-slate-700/50 border-l-2 border-transparent hover:border-slate-500'
                    }
                  `}
                  style={{ paddingLeft: `${8 + (item.depth || 0) * 16}px` }}
                  onClick={() => handleItemSelect(item)}
                  onContextMenu={(e) => onContextMenu(e, item)}
                  draggable={item.type !== 'scene'}
                  onDragStart={(e) => {
                    if (item.type !== 'scene') {
                      setDragState({
                        ...dragState,
                        isDragging: true,
                        draggedItem: item,
                        dragStartDepth: item.depth || 0
                      });
                    }
                  }}
                  onDragOver={(e) => {
                    if (dragState.isDragging && dragState.draggedItem?.id !== item.id) {
                      e.preventDefault();
                      setDragState({
                        ...dragState,
                        dragOverItem: item,
                        dropPosition: e.clientY < e.currentTarget.getBoundingClientRect().top + e.currentTarget.offsetHeight / 2 ? 'above' : 'below'
                      });
                    }
                  }}
                  onDragEnd={() => {
                    setDragState({
                      isDragging: false,
                      draggedItem: null,
                      dragOverItem: null,
                      dropPosition: null,
                      dragStartDepth: 0
                    });
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    // Handle drop logic here
                    console.log('Dropped', dragState.draggedItem?.name, dragState.dropPosition, item.name);
                    setDragState({
                      isDragging: false,
                      draggedItem: null,
                      dragOverItem: null,
                      dropPosition: null,
                      dragStartDepth: 0
                    });
                  }}
                >
                  {/* Chevron for expandable items */}
                  {item.children && item.children.length > 0 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(item.id);
                      }}
                      className="mr-1 p-0.5 hover:bg-slate-600 rounded"
                    >
                      <Icons.ChevronRight 
                        className={`w-3 h-3 transition-transform ${expandedItems.includes(item.id) ? 'rotate-90' : ''}`} 
                      />
                    </button>
                  ) : (
                    <div className="w-4 mr-1" />
                  )}
                  
                  {/* Icon */}
                  {React.createElement(getItemIcon(item), { className: "w-4 h-4 mr-2 flex-shrink-0" })}
                  
                  {/* Name */}
                  <span className="flex-1 truncate select-none">
                    {item.name}
                  </span>
                  
                  {/* Eye button for visibility toggle */}
                  {item.type !== 'scene' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(item.id);
                      }}
                      className="ml-1 p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-600 rounded transition-all"
                    >
                      {item.visible !== false ? (
                        <Icons.Eye className="w-3 h-3 text-gray-400 hover:text-white" />
                      ) : (
                        <Icons.EyeSlash className="w-3 h-3 text-gray-500 hover:text-gray-300" />
                      )}
                    </button>
                  )}
                  
                  {/* Drop indicator */}
                  {dragState.dragOverItem?.id === item.id && (
                    <div 
                      className={`absolute left-0 right-0 h-0.5 bg-blue-500 ${
                        dragState.dropPosition === 'above' ? 'top-0' : 'bottom-0'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Icons.Scene className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No objects in scene</p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Properties Panel */}
      {selectedObject && selectedObjectData && (
        <>
          {/* Resizer */}
          <div
            className={`h-1 cursor-row-resize transition-colors ${
              isResizing ? 'bg-blue-500' : 'bg-slate-700 hover:bg-blue-500/75'
            }`}
            onMouseDown={handleMouseDown}
          />
          
          <div 
            className="overflow-y-auto bg-slate-900" 
            style={{ height: `${bottomPanelHeight}px` }}
          >
            {/* Transform Properties */}
            <CollapsibleSection 
              title="Transform" 
              defaultOpen={true}
              className="border-none rounded-none"
            >
              {selectedObjectData.position && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Position</label>
                    <div className="space-y-1">
                      <input 
                        type="number" 
                        step="0.1" 
                        defaultValue={selectedObjectData.position[0].toFixed(2)}
                        className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-2 rounded focus:border-blue-500" 
                        placeholder="X" 
                      />
                      <input 
                        type="number" 
                        step="0.1" 
                        defaultValue={selectedObjectData.position[1].toFixed(2)}
                        className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-2 rounded focus:border-blue-500" 
                        placeholder="Y" 
                      />
                      <input 
                        type="number" 
                        step="0.1" 
                        defaultValue={selectedObjectData.position[2].toFixed(2)}
                        className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-2 rounded focus:border-blue-500" 
                        placeholder="Z" 
                      />
                    </div>
                  </div>
                  
                  {selectedObjectData.rotation && (
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Rotation</label>
                      <div className="space-y-1">
                        <input 
                          type="number" 
                          step="0.1" 
                          defaultValue={(selectedObjectData.rotation[0] * 180 / Math.PI).toFixed(1)}
                          className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-2 rounded focus:border-blue-500" 
                          placeholder="X°" 
                        />
                        <input 
                          type="number" 
                          step="0.1" 
                          defaultValue={(selectedObjectData.rotation[1] * 180 / Math.PI).toFixed(1)}
                          className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-2 rounded focus:border-blue-500" 
                          placeholder="Y°" 
                        />
                        <input 
                          type="number" 
                          step="0.1" 
                          defaultValue={(selectedObjectData.rotation[2] * 180 / Math.PI).toFixed(1)}
                          className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-2 rounded focus:border-blue-500" 
                          placeholder="Z°" 
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedObjectData.scaling && (
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Scale</label>
                      <div className="space-y-1">
                        <input 
                          type="number" 
                          step="0.1" 
                          defaultValue={selectedObjectData.scaling[0].toFixed(2)}
                          className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-2 rounded focus:border-blue-500" 
                          placeholder="X" 
                        />
                        <input 
                          type="number" 
                          step="0.1" 
                          defaultValue={selectedObjectData.scaling[1].toFixed(2)}
                          className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-2 rounded focus:border-blue-500" 
                          placeholder="Y" 
                        />
                        <input 
                          type="number" 
                          step="0.1" 
                          defaultValue={selectedObjectData.scaling[2].toFixed(2)}
                          className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-2 rounded focus:border-blue-500" 
                          placeholder="Z" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CollapsibleSection>

            {/* Material Properties */}
            {selectedObjectData.type === 'mesh' && (
              <CollapsibleSection title="Material" defaultOpen={false}>
                <div className="space-y-3">
                  <Field 
                    label="Base Color"
                    type="color"
                    value={getColorHex()}
                    onChange={handleColorChange}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field 
                      label="Roughness" 
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={roughness}
                      onChange={(e) => setRoughness(parseFloat(e.target.value))}
                    />
                    <Field 
                      label="Metalness" 
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={metalness}
                      onChange={(e) => setMetalness(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {/* Light Properties */}
            {selectedObjectData.type === 'light' && (
              <CollapsibleSection title="Light" defaultOpen={false}>
                <div className="space-y-3">
                  <Field 
                    label="Intensity" 
                    type="number"
                    min="0"
                    step="0.1"
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  />
                  <Field 
                    label="Color"
                    type="color"
                    value="#ffffff"
                  />
                </div>
              </CollapsibleSection>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SceneTab;