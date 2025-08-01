import { proxy, useSnapshot } from 'valtio'
import { devtools } from 'valtio/utils'
import { autoSaveManager } from '@/plugins/core/AutoSaveManager.js'

// Create the reactive scene state
export const sceneState = proxy({
  // Multi-scene support (one scene per viewport)
  scenes: new Map(), // viewportId -> scene data
  activeSceneId: null,
  
  // Legacy ECS system (kept for compatibility)
  entities: new Map(),
  entityCounter: 0,
  
  // Scene hierarchy
  sceneRoot: null,
  selectedEntity: null,
  
  // Spatial queries (reactive Map for auto-updates)
  spatialIndex: new Map(),
  
  // Component systems - using reactive Maps for fine-grained updates
  components: {
    transform: new Map(),
    mesh: new Map(),
    light: new Map(),
    camera: new Map(),
    script: new Map(),
    physics: new Map(),
    audio: new Map()
  },
  
  // Query cache for performance
  queryCache: new Map(),
  cacheVersion: 0
})

// Actions that mutate the state directly
export const sceneActions = {
  // Scene management
  createScene: (sceneId, initialData = null) => {
    const defaultSceneData = {
      id: sceneId,
      name: `Scene ${sceneId}`,
      objects: [
        // Default environment folder
        {
          id: 'folder-environment',
          name: 'Environment',
          type: 'folder',
          expanded: true,
          visible: true,
          children: ['default-platform-1']
        },
        {
          id: 'default-platform-1',
          name: 'Main Platform',
          type: 'mesh',
          position: [0, -2.5, 0],
          rotation: [0, 0, 0],
          scale: [100, 5, 100],
          geometry: 'box',
          material: { 
            color: '#3a3a3a',
            roughness: 0.9,
            metalness: 0.05
          },
          visible: true,
          isDefaultPlatform: true,
          parentId: 'folder-environment'
        },
        // Default lighting folder
        {
          id: 'folder-lighting',
          name: 'Lighting',
          type: 'folder',
          expanded: true,
          visible: true,
          children: ['sun-light-1']
        },
        {
          id: 'sun-light-1',
          name: 'Sun Light',
          type: 'light',
          lightType: 'directional',
          position: [10, 10, 5],
          rotation: [-0.785, 0.524, 0],
          color: '#ffffff',
          intensity: 1.2,
          castShadow: true,
          visible: true,
          shadowMapSize: [2048, 2048],
          shadowCameraFar: 50,
          shadowCameraLeft: -20,
          shadowCameraRight: 20,
          shadowCameraTop: 20,
          shadowCameraBottom: -20,
          parentId: 'folder-lighting'
        }
      ],
      camera: {
        position: [0, 0, 5],
        target: [0, 0, 0],
        zoom: 1,
        fov: 75
      },
      selection: {
        entity: null,
        object: null,
        transformMode: 'select'
      }
    }
    
    const sceneData = initialData || defaultSceneData
    sceneState.scenes.set(sceneId, sceneData)
    return sceneData
  },

  deleteScene: (sceneId) => {
    sceneState.scenes.delete(sceneId)
    if (sceneState.activeSceneId === sceneId) {
      sceneState.activeSceneId = null
    }
  },

  setActiveScene: (sceneId) => {
    if (sceneState.scenes.has(sceneId)) {
      sceneState.activeSceneId = sceneId
    }
  },

  getActiveScene: () => {
    return sceneState.scenes.get(sceneState.activeSceneId)
  },

  getScene: (sceneId) => {
    return sceneState.scenes.get(sceneId)
  },

  // Scene object management
  addSceneObject: (sceneId, object) => {
    const scene = sceneState.scenes.get(sceneId)
    if (scene) {
      scene.objects.push(object)
    }
  },

  removeSceneObject: (sceneId, objectId) => {
    const scene = sceneState.scenes.get(sceneId)
    if (scene) {
      scene.objects = scene.objects.filter(obj => obj.id !== objectId)
    }
  },

  updateSceneObject: (sceneId, objectId, updates) => {
    const scene = sceneState.scenes.get(sceneId)
    if (scene) {
      const objectIndex = scene.objects.findIndex(obj => obj.id === objectId)
      if (objectIndex !== -1) {
        Object.assign(scene.objects[objectIndex], updates)
      }
    }
  },

  getSceneObject: (sceneId, objectId) => {
    const scene = sceneState.scenes.get(sceneId)
    if (scene) {
      return scene.objects.find(obj => obj.id === objectId)
    }
    return null
  },

  // Scene selection
  setSceneSelection: (sceneId, entityId, object = null) => {
    const scene = sceneState.scenes.get(sceneId)
    if (scene) {
      scene.selection.entity = entityId
      scene.selection.object = object
    }
  },

  // Scene camera
  setSceneCamera: (sceneId, cameraData) => {
    const scene = sceneState.scenes.get(sceneId)
    if (scene) {
      Object.assign(scene.camera, cameraData)
    }
  },

  // Legacy ECS system methods (kept for compatibility)
  createEntity: (name = 'Entity') => {
    const id = sceneState.entityCounter + 1
    const entity = {
      id,
      name: `${name}_${id}`,
      active: true,
      parent: null,
      children: [],
      components: new Set()
    }
    
    sceneState.entities.set(id, entity)
    sceneState.entityCounter = id
    sceneActions.invalidateQueryCache()
    
    return id
  },
  
  destroyEntity: (entityId) => {
    const entity = sceneState.entities.get(entityId)
    if (!entity) return
    
    // Remove all components
    entity.components.forEach(componentType => {
      sceneActions.removeComponent(entityId, componentType)
    })
    
    // Remove from hierarchy
    if (entity.parent) {
      sceneActions.removeChild(entity.parent, entityId)
    }
    
    // Destroy children recursively
    entity.children.forEach(childId => {
      sceneActions.destroyEntity(childId)
    })
    
    // Remove from entities map
    sceneState.entities.delete(entityId)
    sceneActions.invalidateQueryCache()
  },
  
  getEntity: (entityId) => sceneState.entities.get(entityId),
  
  setEntityActive: (entityId, active) => {
    const entity = sceneState.entities.get(entityId)
    if (!entity) return
    
    entity.active = active
    sceneActions.invalidateQueryCache()
  },
  
  // Hierarchy management
  addChild: (parentId, childId) => {
    const parent = sceneState.entities.get(parentId)
    const child = sceneState.entities.get(childId)
    
    if (!parent || !child) return
    
    // Remove from old parent if exists
    if (child.parent) {
      sceneActions.removeChild(child.parent, childId)
    }
    
    // Update parent and child
    parent.children.push(childId)
    child.parent = parentId
  },
  
  removeChild: (parentId, childId) => {
    const parent = sceneState.entities.get(parentId)
    const child = sceneState.entities.get(childId)
    
    if (!parent || !child) return
    
    const childIndex = parent.children.indexOf(childId)
    if (childIndex >= 0) {
      parent.children.splice(childIndex, 1)
    }
    child.parent = null
  },
  
  // Component management with fine-grained reactivity
  addComponent: (entityId, componentType, componentData = {}) => {
    const entity = sceneState.entities.get(entityId)
    if (!entity) return
    
    // Add component data to the appropriate Map
    sceneState.components[componentType].set(entityId, componentData)
    
    // Add component type to entity's component set
    entity.components.add(componentType)
    
    sceneActions.invalidateQueryCache()
  },
  
  removeComponent: (entityId, componentType) => {
    const entity = sceneState.entities.get(entityId)
    if (!entity) return
    
    // Remove component data
    sceneState.components[componentType].delete(entityId)
    
    // Remove from entity's component set
    entity.components.delete(componentType)
    
    sceneActions.invalidateQueryCache()
  },
  
  getComponent: (entityId, componentType) => {
    return sceneState.components[componentType]?.get(entityId)
  },
  
  updateComponent: (entityId, componentType, updates) => {
    const currentComponent = sceneState.components[componentType]?.get(entityId)
    if (!currentComponent) return
    
    // Direct mutation for Valtio reactivity
    Object.assign(currentComponent, updates)
  },
  
  hasComponent: (entityId, componentType) => {
    return sceneState.components[componentType]?.has(entityId) || false
  },
  
  // Enhanced query system with caching
  getEntitiesWith: (...componentTypes) => {
    const cacheKey = componentTypes.sort().join(',')
    const cached = sceneState.queryCache.get(cacheKey)
    
    if (cached && cached.version === sceneState.cacheVersion) {
      return cached.result
    }
    
    const entities = []
    
    sceneState.entities.forEach((entity, entityId) => {
      // Ensure components is a Set (handle restoration edge cases)
      if (!entity.components || typeof entity.components.has !== 'function') {
        entity.components = new Set(entity.components || [])
      }
      
      const hasAllComponents = componentTypes.every(type => 
        entity.components.has(type)
      )
      
      if (hasAllComponents && entity.active) {
        entities.push({
          id: entityId,
          entity,
          components: componentTypes.reduce((acc, type) => {
            acc[type] = sceneState.components[type].get(entityId)
            return acc
          }, {})
        })
      }
    })
    
    // Cache the result
    sceneState.queryCache.set(cacheKey, {
      result: entities,
      version: sceneState.cacheVersion
    })
    
    return entities
  },
  
  // New: Get entities with any of the specified components
  getEntitiesWithAny: (...componentTypes) => {
    const entities = []
    
    sceneState.entities.forEach((entity, entityId) => {
      const hasAnyComponent = componentTypes.some(type => 
        entity.components.has(type)
      )
      
      if (hasAnyComponent && entity.active) {
        const availableComponents = componentTypes.reduce((acc, type) => {
          if (entity.components.has(type)) {
            acc[type] = sceneState.components[type].get(entityId)
          }
          return acc
        }, {})
        
        entities.push({
          id: entityId,
          entity,
          components: availableComponents
        })
      }
    })
    
    return entities
  },
  
  // Selection
  selectEntity: (entityId) => {
    sceneState.selectedEntity = entityId
  },
  
  // Utility
  setSceneRoot: (entityId) => {
    sceneState.sceneRoot = entityId
  },
  
  clear: () => {
    sceneState.entities.clear()
    sceneState.entityCounter = 0
    sceneState.selectedEntity = null
    sceneState.sceneRoot = null
    
    // Clear all component maps
    Object.values(sceneState.components).forEach(componentMap => {
      componentMap.clear()
    })
    
    sceneState.queryCache.clear()
    sceneState.cacheVersion = 0
  },
  
  // Cache management
  invalidateQueryCache: () => {
    sceneState.cacheVersion++
    // Don't clear the cache immediately - let it be lazily updated
  },
  
  // Batch operations for performance
  batchUpdate: (operations) => {
    operations.forEach(op => {
      switch (op.type) {
        case 'createEntity':
          sceneActions.createEntity(op.name)
          break
        case 'addComponent':
          sceneActions.addComponent(op.entityId, op.componentType, op.data)
          break
        case 'updateComponent':
          sceneActions.updateComponent(op.entityId, op.componentType, op.updates)
          break
        // Add more batch operations as needed
      }
    })
  },
  
  // Spatial indexing helpers
  updateSpatialIndex: (entityId, bounds) => {
    sceneState.spatialIndex.set(entityId, bounds)
  },
  
  removeSpatialIndex: (entityId) => {
    sceneState.spatialIndex.delete(entityId)
  },
  
  // Get entities in spatial region
  getEntitiesInRegion: (bounds) => {
    const entities = []
    
    sceneState.spatialIndex.forEach((entityBounds, entityId) => {
      if (boundsIntersect(bounds, entityBounds)) {
        const entity = sceneState.entities.get(entityId)
        if (entity && entity.active) {
          entities.push(entityId)
        }
      }
    })
    
    return entities
  }
}

// Helper function for spatial queries
function boundsIntersect(a, b) {
  return !(a.max.x < b.min.x || a.min.x > b.max.x ||
           a.max.y < b.min.y || a.min.y > b.max.y ||
           a.max.z < b.min.z || a.min.z > b.max.z)
}

// Setup Redux DevTools for debugging
if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  devtools(sceneState, {
    name: 'Scene Store',
    enabled: process.env.NODE_ENV === 'development'
  })
}

// Register scene store with AutoSaveManager (no localStorage)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    autoSaveManager.registerStore('scene', sceneState, {
      extractSaveData: () => ({
        // New scene system
        scenes: Array.from(sceneState.scenes.entries()),
        activeSceneId: sceneState.activeSceneId,
        
        // Legacy ECS system
        entities: Array.from(sceneState.entities.entries()).map(([id, entity]) => [
          id,
          {
            ...entity,
            components: Array.from(entity.components) // Convert Set to Array for serialization
          }
        ]),
        entityCounter: sceneState.entityCounter,
        sceneRoot: sceneState.sceneRoot,
        selectedEntity: sceneState.selectedEntity,
        components: Object.fromEntries(
          Object.entries(sceneState.components).map(([key, componentMap]) => [
            key,
            Array.from(componentMap.entries())
          ])
        )
      }),
      restoreData: (data) => {
        // Restore new scene system
        if (data.scenes) {
          sceneState.scenes = new Map(data.scenes)
        }
        if (data.activeSceneId !== undefined) {
          sceneState.activeSceneId = data.activeSceneId
        }
        
        // Restore legacy ECS system
        if (data.entities) {
          sceneState.entities = new Map(data.entities.map(([id, entity]) => [
            id,
            {
              ...entity,
              components: new Set(entity.components) // Ensure components is always a Set
            }
          ]))
        }
        if (data.entityCounter !== undefined) {
          sceneState.entityCounter = data.entityCounter
        }
        if (data.sceneRoot !== undefined) {
          sceneState.sceneRoot = data.sceneRoot
        }
        if (data.selectedEntity !== undefined) {
          sceneState.selectedEntity = data.selectedEntity
        }
        if (data.components) {
          Object.entries(data.components).forEach(([componentType, componentData]) => {
            if (sceneState.components[componentType]) {
              sceneState.components[componentType] = new Map(componentData)
            }
          })
        }
      }
    })
  }, 100)
}