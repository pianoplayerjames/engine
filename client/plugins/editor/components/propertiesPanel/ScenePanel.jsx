import { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '@/plugins/editor/components/Icons.jsx';
import SliderWithTooltip from '@/plugins/editor/components/ui/SliderWithTooltip.jsx';
import CollapsibleSection from '@/plugins/editor/components/ui/CollapsibleSection.jsx';
import { globalStore, actions, babylonScene } from "@/store.js";
import { useSnapshot } from 'valtio';

function ScenePanel({ selectedObject, onObjectSelect, isOpen, onToggle, selectedTool, onToolSelect, onContextMenu }) {
  const [expandedItems, setExpandedItems] = useState(['scene-root']);
  const ui = useSnapshot(globalStore.editor.ui);
  const { scenePropertiesHeight: bottomPanelHeight } = ui;
  const { setScenePropertiesHeight: setBottomPanelHeight } = actions.editor;
  const [isResizing, setIsResizing] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [ambientOcclusion, setAmbientOcclusion] = useState(0.5);
  
  const settings = useSnapshot(globalStore.editor.settings);
  const sceneData = useSnapshot(globalStore.editor.scene);
  const { viewport: viewportSettings } = settings;
  const { setSelectedEntity, setTransformMode, updateViewportSettings } = actions.editor;
  
  // Get selected object data from Babylon.js scene using external reference
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
      
      // Update lightweight store metadata
      actions.editor.updateSceneObjectProperty(selectedObject, 'position', 
        [babylonObj.position.x, babylonObj.position.y, babylonObj.position.z]
      );
      
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

  // Generate hierarchy data from lightweight store (reactive!)
  const hierarchyData = useMemo(() => {
    if (!sceneData.isLoaded) {
      return [
        {
          id: 'scene-root',
          name: sceneData.name,
          type: 'scene',
          visible: true,
          children: []
        }
      ];
    }
    
    const { objects } = sceneData;
    const babylonObjects = [];
    
    // Add meshes from lightweight store
    objects.meshes.forEach(mesh => {
      babylonObjects.push({
        id: mesh.id,
        name: mesh.name,
        type: 'mesh',
        visible: mesh.visible,
        children: []
      });
    });
    
    // Add lights from lightweight store
    objects.lights.forEach(light => {
      babylonObjects.push({
        id: light.id,
        name: light.name,
        type: 'light',
        lightType: light.lightType || 'point',
        visible: light.visible,
        children: []
      });
    });
    
    // Add cameras from lightweight store
    objects.cameras.forEach(camera => {
      babylonObjects.push({
        id: camera.id,
        name: camera.name,
        type: 'camera',
        visible: camera.visible,
        children: []
      });
    });

    return [
      {
        id: 'scene-root',
        name: sceneData.name,
        type: 'scene',
        visible: true,
        children: babylonObjects
      }
    ];
  }, [sceneData.isLoaded, sceneData.objects.meshes, sceneData.objects.lights, sceneData.objects.cameras, sceneData.name]);
  
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
        className="relative rounded-sm transition-all duration-100"
        onContextMenu={(e) => onContextMenu(e, item)}
      >
        <div 
          className={`flex items-center py-0.5 px-2 cursor-pointer transition-colors text-xs group ${
            isSelected ? 'bg-blue-800/60' : 'hover:bg-slate-700'
          }`}
          style={{ paddingLeft: `${8 + depth * 20}px` }}
          onClick={() => {
            // Update selection in store
            actions.editor.selectSceneObject(item.id);
            // Also call parent callback
            onObjectSelect(item.id);
          }}
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
            onClick={(e) => {
              e.stopPropagation();
              // Toggle visibility in both store and Babylon.js scene
              actions.editor.updateSceneObjectProperty(item.id, 'visible', !item.visible);
            }}
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
            SCENE OBJECTS ({sceneData.objects.meshes.length + sceneData.objects.lights.length + sceneData.objects.cameras.length})
          </div>
        )}
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}

      
    </div>
  );
}

export default ScenePanel;