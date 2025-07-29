// Lighting Manager - handles all scene lighting including default lights
import React, { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { renderState, renderActions } from '@/plugins/render/store.js';
import { sceneState, sceneActions } from '@/plugins/scene/store.js';

// Light Component - renders individual lights in the scene
function SceneLight({ lightData }) {
  const { type, position, rotation, color, intensity, distance, angle, penumbra, decay, castShadow, target } = lightData;

  switch (type) {
    case 'ambient':
      return (
        <ambientLight
          intensity={intensity}
          color={color}
        />
      );

    case 'directional':
      return (
        <directionalLight
          position={position}
          rotation={rotation}
          color={color}
          intensity={intensity}
          castShadow={castShadow}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
      );

    case 'point':
      return (
        <pointLight
          position={position}
          color={color}
          intensity={intensity}
          distance={distance}
          decay={decay}
          castShadow={castShadow}
          shadow-mapSize={[1024, 1024]}
        />
      );

    case 'spot':
      return (
        <spotLight
          position={position}
          target={target}
          color={color}
          intensity={intensity}
          distance={distance}
          angle={angle}
          penumbra={penumbra}
          decay={decay}
          castShadow={castShadow}
          shadow-mapSize={[1024, 1024]}
        />
      );

    case 'hemisphere':
      return (
        <hemisphereLight
          position={position}
          skyColor={color}
          groundColor={lightData.groundColor || '#444444'}
          intensity={intensity}
        />
      );

    default:
      return null;
  }
}

// Main Lighting Manager Component
function LightingManager() {
  const { lighting } = useSnapshot(renderState);
  const { entities, components } = useSnapshot(sceneState);

  // Initialize default lighting setup
  useEffect(() => {
    setupDefaultLights();
    
    // Force an immediate render update to ensure lights are visible
    setTimeout(() => {
      console.log('🌟 Lighting system initialized');
    }, 0);
    
    // Cleanup function
    return () => {
      console.log('🌟 Lighting system cleanup');
    };
  }, []);

  const setupDefaultLights = () => {
    // Clear existing lights
    renderState.lighting.lights.clear();

    // Create default lighting setup - professional 3-point lighting + ambient
    const defaultLights = [
      {
        id: 'ambient-main',
        name: 'Ambient Light',
        type: 'ambient',
        color: '#404040',
        intensity: 0.3,
        position: [0, 0, 0],
        enabled: true
      },
      {
        id: 'key-light',
        name: 'Key Light (Sun)',
        type: 'directional',
        color: '#ffffff',
        intensity: 1.2,
        position: [10, 10, 5],
        rotation: [0, 0, 0],
        castShadow: true,
        enabled: true
      },
      {
        id: 'fill-light',
        name: 'Fill Light',
        type: 'directional',
        color: '#b3d9ff',
        intensity: 0.4,
        position: [-5, 8, 3],
        rotation: [0, 0, 0],
        castShadow: false,
        enabled: true
      },
      {
        id: 'rim-light',
        name: 'Rim Light',
        type: 'directional',
        color: '#ffeeaa',
        intensity: 0.6,
        position: [-8, 5, -5],
        rotation: [0, 0, 0],
        castShadow: false,
        enabled: true
      },
      {
        id: 'ground-bounce',
        name: 'Ground Bounce',
        type: 'hemisphere',
        color: '#87ceeb',
        groundColor: '#362d1a',
        intensity: 0.5,
        position: [0, -1, 0],
        enabled: true
      }
    ];

    // Add lights to render state
    defaultLights.forEach(light => {
      renderActions.addLight(light.id, light);
    });

    // Also create light entities in the scene system for editor control
    defaultLights.forEach(light => {
      const entityId = sceneActions.createEntity(light.name);
      
      // Add transform component
      sceneActions.addComponent(entityId, 'transform', {
        position: light.position || [0, 0, 0],
        rotation: light.rotation || [0, 0, 0],
        scale: [1, 1, 1]
      });

      // Add light component
      sceneActions.addComponent(entityId, 'light', {
        type: light.type,
        color: light.color,
        intensity: light.intensity,
        distance: light.distance || 0,
        angle: light.angle || Math.PI / 3,
        penumbra: light.penumbra || 0,
        decay: light.decay || 2,
        castShadow: light.castShadow || false,
        groundColor: light.groundColor,
        enabled: light.enabled,
        renderLightId: light.id
      });
    });

    console.log('🌟 Default lighting setup complete with', defaultLights.length, 'lights');
  };

  // Update render lights when scene light components change
  useEffect(() => {
    const lightEntities = sceneActions.getEntitiesWith('light', 'transform');
    
    lightEntities.forEach(({ entity, components: comps }) => {
      const lightComp = comps.light;
      const transformComp = comps.transform;
      
      if (lightComp.enabled && lightComp.renderLightId) {
        renderActions.updateLight(lightComp.renderLightId, {
          ...lightComp,
          position: transformComp.position,
          rotation: transformComp.rotation
        });
      }
    });
  }, [components.light, components.transform]);

  // Render all active lights
  const activeLights = Array.from(lighting.lights.values()).filter(light => light.enabled);

  return (
    <group name="lighting-system">
      {activeLights.map(light => (
        <SceneLight key={light.id} lightData={light} />
      ))}
    </group>
  );
}

export default LightingManager;