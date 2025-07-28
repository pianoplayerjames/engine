import { proxy, subscribe, useSnapshot } from 'valtio'

// Create the reactive scene state
export const sceneState = proxy({
  // Entity management
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

// Set up automatic spatial index maintenance
if (typeof window !== 'undefined') {
  // Subscribe to the entire scene state to catch transform component changes
  subscribe(sceneState, () => {
    // Update spatial indices when transforms change
    sceneState.components.transform.forEach((transform, entityId) => {
      if (transform && transform.position && transform.scale) {
        const bounds = {
          min: {
            x: transform.position[0] - transform.scale[0] / 2,
            y: transform.position[1] - transform.scale[1] / 2,
            z: transform.position[2] - transform.scale[2] / 2
          },
          max: {
            x: transform.position[0] + transform.scale[0] / 2,
            y: transform.position[1] + transform.scale[1] / 2,
            z: transform.position[2] + transform.scale[2] / 2
          }
        }
        sceneActions.updateSpatialIndex(entityId, bounds)
      }
    })
  })
}

// sceneState and sceneActions are already exported above