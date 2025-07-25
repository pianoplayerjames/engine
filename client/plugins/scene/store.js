import { create } from 'zustand'

export const useSceneStore = create((set, get) => ({
  // Entity management
  entities: new Map(),
  entityCounter: 0,
  
  // Scene hierarchy
  sceneRoot: null,
  selectedEntity: null,
  
  // Spatial queries
  spatialIndex: new Map(), // For performance optimization
  
  // Component systems
  components: {
    transform: new Map(),
    mesh: new Map(),
    light: new Map(),
    camera: new Map(),
    script: new Map(),
    physics: new Map(),
    audio: new Map()
  },
  
  // Actions
  createEntity: (name = 'Entity') => {
    const id = get().entityCounter + 1
    const entity = {
      id,
      name: `${name}_${id}`,
      active: true,
      parent: null,
      children: [],
      components: new Set()
    }
    
    set(state => ({
      entities: new Map(state.entities).set(id, entity),
      entityCounter: id
    }))
    
    return id
  },
  
  destroyEntity: (entityId) => {
    const entity = get().entities.get(entityId)
    if (!entity) return
    
    // Remove all components
    entity.components.forEach(componentType => {
      get().removeComponent(entityId, componentType)
    })
    
    // Remove from hierarchy
    if (entity.parent) {
      get().removeChild(entity.parent, entityId)
    }
    
    // Destroy children
    entity.children.forEach(childId => {
      get().destroyEntity(childId)
    })
    
    // Remove from entities map
    set(state => {
      const newEntities = new Map(state.entities)
      newEntities.delete(entityId)
      return { entities: newEntities }
    })
  },
  
  getEntity: (entityId) => get().entities.get(entityId),
  
  setEntityActive: (entityId, active) => {
    const entity = get().entities.get(entityId)
    if (!entity) return
    
    set(state => ({
      entities: new Map(state.entities).set(entityId, { ...entity, active })
    }))
  },
  
  // Hierarchy management
  addChild: (parentId, childId) => {
    const parent = get().entities.get(parentId)
    const child = get().entities.get(childId)
    
    if (!parent || !child) return
    
    // Remove from old parent if exists
    if (child.parent) {
      get().removeChild(child.parent, childId)
    }
    
    // Update parent
    set(state => ({
      entities: new Map(state.entities).set(parentId, {
        ...parent,
        children: [...parent.children, childId]
      }).set(childId, {
        ...child,
        parent: parentId
      })
    }))
  },
  
  removeChild: (parentId, childId) => {
    const parent = get().entities.get(parentId)
    const child = get().entities.get(childId)
    
    if (!parent || !child) return
    
    set(state => ({
      entities: new Map(state.entities).set(parentId, {
        ...parent,
        children: parent.children.filter(id => id !== childId)
      }).set(childId, {
        ...child,
        parent: null
      })
    }))
  },
  
  // Component management
  addComponent: (entityId, componentType, componentData = {}) => {
    const entity = get().entities.get(entityId)
    if (!entity) return
    
    // Add component data
    set(state => ({
      components: {
        ...state.components,
        [componentType]: new Map(state.components[componentType]).set(entityId, componentData)
      },
      entities: new Map(state.entities).set(entityId, {
        ...entity,
        components: new Set([...entity.components, componentType])
      })
    }))
  },
  
  removeComponent: (entityId, componentType) => {
    const entity = get().entities.get(entityId)
    if (!entity) return
    
    const newComponents = new Set(entity.components)
    newComponents.delete(componentType)
    
    set(state => {
      const newComponentMap = new Map(state.components[componentType])
      newComponentMap.delete(entityId)
      
      return {
        components: {
          ...state.components,
          [componentType]: newComponentMap
        },
        entities: new Map(state.entities).set(entityId, {
          ...entity,
          components: newComponents
        })
      }
    })
  },
  
  getComponent: (entityId, componentType) => {
    return get().components[componentType]?.get(entityId)
  },
  
  updateComponent: (entityId, componentType, updates) => {
    const currentComponent = get().components[componentType]?.get(entityId)
    if (!currentComponent) return
    
    set(state => ({
      components: {
        ...state.components,
        [componentType]: new Map(state.components[componentType]).set(entityId, {
          ...currentComponent,
          ...updates
        })
      }
    }))
  },
  
  hasComponent: (entityId, componentType) => {
    return get().components[componentType]?.has(entityId) || false
  },
  
  // Query system
  getEntitiesWith: (...componentTypes) => {
    const entities = []
    const entityMap = get().entities
    
    entityMap.forEach((entity, entityId) => {
      const hasAllComponents = componentTypes.every(type => 
        entity.components.has(type)
      )
      
      if (hasAllComponents) {
        entities.push({
          id: entityId,
          entity,
          components: componentTypes.reduce((acc, type) => {
            acc[type] = get().components[type].get(entityId)
            return acc
          }, {})
        })
      }
    })
    
    return entities
  },
  
  // Selection
  selectEntity: (entityId) => set({ selectedEntity: entityId }),
  
  // Utility
  setSceneRoot: (entityId) => set({ sceneRoot: entityId }),
  
  clear: () => set({
    entities: new Map(),
    entityCounter: 0,
    selectedEntity: null,
    components: {
      transform: new Map(),
      mesh: new Map(),
      light: new Map(),
      camera: new Map(),
      script: new Map(),
      physics: new Map(),
      audio: new Map()
    }
  })
}))