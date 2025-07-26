// Environment loader utility for HDR environments

// HDR environment presets using real Three.js environments and react-three/drei presets
export const HDR_ENVIRONMENTS = [
  {
    id: 'apartment',
    name: 'Apartment',
    description: 'Indoor apartment lighting',
    preset: 'apartment'
  },
  {
    id: 'city',
    name: 'City Environment',
    description: 'Urban setting with street lighting',
    preset: 'city'
  },
  {
    id: 'dawn',
    name: 'Dawn',
    description: 'Early morning natural lighting',
    preset: 'dawn'
  },
  {
    id: 'forest',
    name: 'Forest Environment',
    description: 'Natural outdoor forest setting',
    preset: 'forest'
  },
  {
    id: 'lobby',
    name: 'Lobby',
    description: 'Indoor lobby environment',
    preset: 'lobby'
  },
  {
    id: 'night',
    name: 'Night',
    description: 'Nighttime outdoor environment',
    preset: 'night'
  },
  {
    id: 'park',
    name: 'Park',
    description: 'Natural park environment',
    preset: 'park'
  },
  {
    id: 'studio',
    name: 'Studio Environment', 
    description: 'Neutral studio lighting setup',
    preset: 'studio'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm evening lighting',
    preset: 'sunset'
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    description: 'Industrial warehouse lighting',
    preset: 'warehouse'
  },
  {
    id: 'room',
    name: 'Room Environment',
    description: 'Procedural room with realistic lighting',
    type: 'room'
  }
];


// Get HDR environment info by ID (no longer loads textures, just returns config)
export function getHDREnvironment(environmentId) {
  const environment = HDR_ENVIRONMENTS.find(env => env.id === environmentId);
  
  if (!environment) {
    throw new Error(`Environment ${environmentId} not found`);
  }
  
  return environment;
}

