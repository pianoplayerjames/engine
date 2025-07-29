// Lighting control panel for the editor
import React, { useState } from 'react';
import { useSnapshot } from 'valtio';
import { renderState, renderActions } from '@/plugins/render/store.js';
import { sceneState, sceneActions } from '@/plugins/scene/store.js';
import { Icons } from '@/plugins/editor/components/Icons';

function LightControlItem({ light, entity, onUpdate, onToggle, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const lightComp = entity?.components?.light;
  const transformComp = entity?.components?.transform;

  if (!lightComp) return null;

  const handlePropertyChange = (property, value) => {
    // Update the light component in the scene
    sceneActions.updateComponent(entity.id, 'light', { [property]: value });
    
    // Also update the render light
    if (lightComp.renderLightId) {
      renderActions.updateLight(lightComp.renderLightId, { [property]: value });
    }
  };

  const handleTransformChange = (property, value) => {
    sceneActions.updateComponent(entity.id, 'transform', { [property]: value });
  };

  const getLightIcon = (type) => {
    switch (type) {
      case 'directional': return '☀️';
      case 'point': return '💡';
      case 'spot': return '🔦';
      case 'ambient': return '🌐';
      case 'hemisphere': return '🌅';
      default: return '💡';
    }
  };

  return (
    <div className="border border-slate-600 rounded-lg mb-2 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-slate-700 cursor-pointer hover:bg-slate-650 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getLightIcon(lightComp.type)}</span>
          <span className="text-sm font-medium text-white">{entity.name}</span>
          <span className="text-xs text-gray-400 capitalize">({lightComp.type})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`w-8 h-4 rounded-full transition-colors ${
              lightComp.enabled ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
              lightComp.enabled ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="p-3 bg-slate-800 space-y-3">
          {/* Basic Properties */}
          <div className="grid grid-cols-2 gap-3">
            {/* Intensity */}
            <div>
              <label className="block text-xs text-gray-300 mb-1">Intensity</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={lightComp.intensity}
                onChange={(e) => handlePropertyChange('intensity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400">{lightComp.intensity.toFixed(1)}</span>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs text-gray-300 mb-1">Color</label>
              <input
                type="color"
                value={lightComp.color}
                onChange={(e) => handlePropertyChange('color', e.target.value)}
                className="w-full h-8 rounded border border-gray-600 bg-transparent"
              />
            </div>
          </div>

          {/* Position Controls */}
          {lightComp.type !== 'ambient' && transformComp && (
            <div>
              <label className="block text-xs text-gray-300 mb-2">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {['x', 'y', 'z'].map((axis, index) => (
                  <div key={axis}>
                    <label className="block text-xs text-gray-400 mb-1">{axis.toUpperCase()}</label>
                    <input
                      type="number"
                      step="0.5"
                      value={transformComp.position[index]}
                      onChange={(e) => {
                        const newPos = [...transformComp.position];
                        newPos[index] = parseFloat(e.target.value) || 0;
                        handleTransformChange('position', newPos);
                      }}
                      className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type-specific Controls */}
          {lightComp.type === 'point' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Distance</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={lightComp.distance || 0}
                  onChange={(e) => handlePropertyChange('distance', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400">{lightComp.distance || 0}</span>
              </div>
              
              <div>
                <label className="block text-xs text-gray-300 mb-1">Decay</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={lightComp.decay || 2}
                  onChange={(e) => handlePropertyChange('decay', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400">{(lightComp.decay || 2).toFixed(1)}</span>
              </div>
            </div>
          )}

          {lightComp.type === 'spot' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Angle</label>
                <input
                  type="range"
                  min="0"
                  max={Math.PI}
                  step="0.1"
                  value={lightComp.angle || Math.PI / 3}
                  onChange={(e) => handlePropertyChange('angle', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400">{((lightComp.angle || Math.PI / 3) * 180 / Math.PI).toFixed(0)}°</span>
              </div>
              
              <div>
                <label className="block text-xs text-gray-300 mb-1">Penumbra</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={lightComp.penumbra || 0}
                  onChange={(e) => handlePropertyChange('penumbra', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400">{(lightComp.penumbra || 0).toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Distance</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={lightComp.distance || 0}
                  onChange={(e) => handlePropertyChange('distance', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400">{lightComp.distance || 0}</span>
              </div>
            </div>
          )}

          {lightComp.type === 'hemisphere' && (
            <div>
              <label className="block text-xs text-gray-300 mb-1">Ground Color</label>
              <input
                type="color"
                value={lightComp.groundColor || '#444444'}
                onChange={(e) => handlePropertyChange('groundColor', e.target.value)}
                className="w-full h-8 rounded border border-gray-600 bg-transparent"
              />
            </div>
          )}

          {/* Shadow Controls */}
          {['directional', 'point', 'spot'].includes(lightComp.type) && (
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-300">Cast Shadows</label>
              <button
                onClick={() => handlePropertyChange('castShadow', !lightComp.castShadow)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  lightComp.castShadow ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  lightComp.castShadow ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete()}
            className="w-full mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
          >
            Delete Light
          </button>
        </div>
      )}
    </div>
  );
}

function LightingPanel() {
  const { lighting } = useSnapshot(renderState);
  const { entities, components } = useSnapshot(sceneState);
  
  // Get all light entities
  const lightEntities = sceneActions.getEntitiesWith('light');

  const handleToggleLight = (entityId) => {
    const lightComp = sceneActions.getComponent(entityId, 'light');
    if (lightComp) {
      const newEnabled = !lightComp.enabled;
      sceneActions.updateComponent(entityId, 'light', { enabled: newEnabled });
      
      if (lightComp.renderLightId) {
        renderActions.updateLight(lightComp.renderLightId, { enabled: newEnabled });
      }
    }
  };

  const handleDeleteLight = (entityId) => {
    const lightComp = sceneActions.getComponent(entityId, 'light');
    if (lightComp?.renderLightId) {
      renderActions.removeLight(lightComp.renderLightId);
    }
    sceneActions.destroyEntity(entityId);
  };

  const addNewLight = (type) => {
    const lightId = `${type}-${Date.now()}`;
    const entityId = sceneActions.createEntity(`${type} Light`);
    
    // Add transform component
    sceneActions.addComponent(entityId, 'transform', {
      position: [0, 5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    });

    // Add light component
    const lightData = {
      type,
      color: '#ffffff',
      intensity: 1.0,
      distance: type === 'point' || type === 'spot' ? 10 : 0,
      angle: type === 'spot' ? Math.PI / 4 : Math.PI / 3,
      penumbra: 0,
      decay: 2,
      castShadow: type !== 'ambient',
      enabled: true,
      renderLightId: lightId
    };

    sceneActions.addComponent(entityId, 'light', lightData);
    
    // Add to render system
    renderActions.addLight(lightId, {
      id: lightId,
      name: `${type} Light`,
      ...lightData,
      position: [0, 5, 0],
      rotation: [0, 0, 0]
    });
  };

  return (
    <div className="h-full bg-slate-800 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-sm font-medium text-white">Scene Lighting</h3>
        <p className="text-xs text-gray-400 mt-1">
          {lightEntities.length} light{lightEntities.length !== 1 ? 's' : ''} in scene
        </p>
      </div>

      {/* Add Light Buttons */}
      <div className="p-3 border-b border-slate-700">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addNewLight('directional')}
            className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          >
            <span>☀️</span> Directional
          </button>
          <button
            onClick={() => addNewLight('point')}
            className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          >
            <span>💡</span> Point
          </button>
          <button
            onClick={() => addNewLight('spot')}
            className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          >
            <span>🔦</span> Spot
          </button>
          <button
            onClick={() => addNewLight('hemisphere')}
            className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          >
            <span>🌅</span> Hemisphere
          </button>
        </div>
      </div>

      {/* Light List */}
      <div className="flex-1 overflow-y-auto p-3">
        {lightEntities.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">No lights in scene</p>
            <p className="text-xs mt-1">Add lights using the buttons above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lightEntities.map(({ id, entity, components: comps }) => (
              <LightControlItem
                key={id}
                light={lighting.lights.get(comps.light?.renderLightId)}
                entity={{ id, ...entity, components: comps }}
                onToggle={() => handleToggleLight(id)}
                onDelete={() => handleDeleteLight(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Global Lighting Controls */}
      <div className="p-3 border-t border-slate-700 bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-300">Global Shadows</span>
          <button
            onClick={() => renderActions.setShadowsEnabled(!lighting.shadowsEnabled)}
            className={`w-8 h-4 rounded-full transition-colors ${
              lighting.shadowsEnabled ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
              lighting.shadowsEnabled ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LightingPanel;