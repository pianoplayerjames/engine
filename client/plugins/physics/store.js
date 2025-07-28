import { proxy, subscribe, useSnapshot } from 'valtio'

// Create the reactive physics state
export const physicsState = proxy({
  // Physics world configuration
  world: {
    instance: null,
    gravity: [0, -9.81, 0],
    timeStep: 1/60,
    maxSubSteps: 10,
    enabled: true,
    paused: false
  },
  
  // Physics bodies using Map for fine-grained reactivity
  bodies: new Map(),
  
  // Collision detection and response
  collisions: {
    current: [],
    matrix: new Map(), // collision masks/groups
    callbacks: new Map() // collision event handlers
  },
  
  // Physics settings
  settings: {
    broadphase: 'naive', // naive, sap, grid
    solver: 'gs', // gs (GaussSeidel), split
    iterations: 10,
    tolerance: 1e-7,
    allowSleep: true,
    sleepSpeedLimit: 0.1,
    sleepTimeLimit: 1,
    contactSkin: 0.05
  },
  
  // Raycasting results
  raycasting: {
    results: [],
    queries: new Map() // persistent ray queries
  },
  
  // Performance metrics
  performance: {
    stepTime: 0,
    bodyCount: 0,
    constraintCount: 0,
    collisionPairCount: 0
  }
})

// Actions that mutate the state directly
export const physicsActions = {
  // World management
  initPhysics: () => {
    // Create a simple physics world simulation
    const world = {
      bodies: [],
      gravity: physicsState.world.gravity,
      step: (timeStep) => {
        const startTime = performance.now()
        
        world.bodies.forEach(body => {
          if (!body.static && body.velocity && physicsState.world.enabled) {
            // Apply gravity
            body.velocity[1] += world.gravity[1] * timeStep
            
            // Update position
            body.position[0] += body.velocity[0] * timeStep
            body.position[1] += body.velocity[1] * timeStep
            body.position[2] += body.velocity[2] * timeStep
            
            // Simple ground collision
            if (body.position[1] < 0 && body.velocity[1] < 0) {
              body.position[1] = 0
              body.velocity[1] *= -body.material.restitution
              
              // Trigger collision callback
              physicsActions._triggerCollision(body.entityId, 'ground')
            }
            
            // Apply damping
            const damping = 0.99
            body.velocity[0] *= damping
            body.velocity[1] *= damping
            body.velocity[2] *= damping
          }
        })
        
        // Update performance metrics
        physicsState.performance.stepTime = performance.now() - startTime
        physicsState.performance.bodyCount = world.bodies.length
      }
    }
    
    physicsState.world.instance = world
  },
  
  setGravity: (x, y, z) => {
    physicsState.world.gravity[0] = x
    physicsState.world.gravity[1] = y
    physicsState.world.gravity[2] = z
    
    if (physicsState.world.instance) {
      physicsState.world.instance.gravity = [x, y, z]
    }
  },
  
  setEnabled: (enabled) => {
    physicsState.world.enabled = enabled
  },
  
  setPaused: (paused) => {
    physicsState.world.paused = paused
  },
  
  // Rigid body management
  createRigidBody: (entityId, options = {}) => {
    const body = {
      entityId,
      position: options.position ? [...options.position] : [0, 0, 0],
      rotation: options.rotation ? [...options.rotation] : [0, 0, 0],
      velocity: options.velocity ? [...options.velocity] : [0, 0, 0],
      angularVelocity: options.angularVelocity ? [...options.angularVelocity] : [0, 0, 0],
      mass: options.mass || 1,
      static: options.static || false,
      kinematic: options.kinematic || false,
      shape: {
        type: options.shape || 'box',
        size: options.size ? [...options.size] : [1, 1, 1],
        radius: options.radius || 0.5
      },
      material: {
        friction: options.friction || 0.4,
        restitution: options.restitution || 0.3,
        density: options.density || 1
      },
      collisionGroup: options.collisionGroup || 1,
      collisionMask: options.collisionMask || -1,
      sleeping: false,
      sleepTime: 0,
      forces: [],
      impulses: []
    }
    
    // Add to physics world
    if (physicsState.world.instance) {
      physicsState.world.instance.bodies.push(body)
    }
    
    physicsState.bodies.set(entityId, body)
    return body
  },
  
  removeRigidBody: (entityId) => {
    const body = physicsState.bodies.get(entityId)
    if (!body) return
    
    // Remove from physics world
    if (physicsState.world.instance) {
      const index = physicsState.world.instance.bodies.findIndex(b => b.entityId === entityId)
      if (index >= 0) {
        physicsState.world.instance.bodies.splice(index, 1)
      }
    }
    
    physicsState.bodies.delete(entityId)
  },
  
  updateRigidBody: (entityId, updates) => {
    const body = physicsState.bodies.get(entityId)
    if (!body) return
    
    // Direct mutation for Valtio reactivity
    Object.assign(body, updates)
  },
  
  getRigidBody: (entityId) => physicsState.bodies.get(entityId),
  
  // Force application
  applyForce: (entityId, force, point) => {
    const body = physicsState.bodies.get(entityId)
    if (!body || body.static) return
    
    body.forces.push({ force: [...force], point: point ? [...point] : null })
  },
  
  applyImpulse: (entityId, impulse, point) => {
    const body = physicsState.bodies.get(entityId)
    if (!body || body.static) return
    
    // Immediate velocity change
    body.velocity[0] += impulse[0] / body.mass
    body.velocity[1] += impulse[1] / body.mass
    body.velocity[2] += impulse[2] / body.mass
  },
  
  applyTorque: (entityId, torque) => {
    const body = physicsState.bodies.get(entityId)
    if (!body || body.static) return
    
    body.angularVelocity[0] += torque[0]
    body.angularVelocity[1] += torque[1]
    body.angularVelocity[2] += torque[2]
  },
  
  // Direct property setters
  setVelocity: (entityId, velocity) => {
    const body = physicsState.bodies.get(entityId)
    if (!body) return
    
    body.velocity[0] = velocity[0]
    body.velocity[1] = velocity[1]
    body.velocity[2] = velocity[2]
  },
  
  setPosition: (entityId, position) => {
    const body = physicsState.bodies.get(entityId)
    if (!body) return
    
    body.position[0] = position[0]
    body.position[1] = position[1]
    body.position[2] = position[2]
  },
  
  setRotation: (entityId, rotation) => {
    const body = physicsState.bodies.get(entityId)
    if (!body) return
    
    body.rotation[0] = rotation[0]
    body.rotation[1] = rotation[1]
    body.rotation[2] = rotation[2]
  },
  
  // Physics simulation step
  step: (deltaTime) => {
    if (!physicsState.world.instance || !physicsState.world.enabled || physicsState.world.paused) {
      return
    }
    
    const timeStep = Math.min(deltaTime, physicsState.world.timeStep)
    const steps = Math.ceil(deltaTime / timeStep)
    const actualSteps = Math.min(steps, physicsState.world.maxSubSteps)
    
    for (let i = 0; i < actualSteps; i++) {
      physicsState.world.instance.step(timeStep)
    }
    
    // Process accumulated forces and impulses
    physicsActions._processForces()
    
    // Update collision detection
    physicsActions.detectCollisions()
  },
  
  // Internal force processing
  _processForces: () => {
    physicsState.bodies.forEach(body => {
      if (body.static) return
      
      // Apply accumulated forces
      body.forces.forEach(({ force, point }) => {
        body.velocity[0] += (force[0] / body.mass) * physicsState.world.timeStep
        body.velocity[1] += (force[1] / body.mass) * physicsState.world.timeStep
        body.velocity[2] += (force[2] / body.mass) * physicsState.world.timeStep
      })
      
      // Clear forces for next frame
      body.forces.length = 0
      body.impulses.length = 0
    })
  },
  
  // Collision detection
  detectCollisions: () => {
    const bodies = Array.from(physicsState.bodies.values())
    const collisions = []
    
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i]
        const bodyB = bodies[j]
        
        // Check collision masks
        if (!(bodyA.collisionGroup & bodyB.collisionMask) || 
            !(bodyB.collisionGroup & bodyA.collisionMask)) {
          continue
        }
        
        // Simple AABB collision detection
        const distance = Math.sqrt(
          Math.pow(bodyA.position[0] - bodyB.position[0], 2) +
          Math.pow(bodyA.position[1] - bodyB.position[1], 2) +
          Math.pow(bodyA.position[2] - bodyB.position[2], 2)
        )
        
        const minDistance = (bodyA.shape.size[0] + bodyB.shape.size[0]) / 2
        
        if (distance < minDistance) {
          const collision = {
            bodyA: bodyA.entityId,
            bodyB: bodyB.entityId,
            distance,
            normal: [
              (bodyB.position[0] - bodyA.position[0]) / distance,
              (bodyB.position[1] - bodyA.position[1]) / distance,
              (bodyB.position[2] - bodyA.position[2]) / distance
            ],
            penetration: minDistance - distance
          }
          
          collisions.push(collision)
          physicsActions._triggerCollision(bodyA.entityId, bodyB.entityId, collision)
        }
      }
    }
    
    physicsState.collisions.current = collisions
    physicsState.performance.collisionPairCount = collisions.length
  },
  
  // Collision callbacks
  _triggerCollision: (entityA, entityB, collision = null) => {
    const callback = physicsState.collisions.callbacks.get(entityA)
    if (callback) {
      callback(entityA, entityB, collision)
    }
  },
  
  onCollision: (entityId, callback) => {
    physicsState.collisions.callbacks.set(entityId, callback)
  },
  
  offCollision: (entityId) => {
    physicsState.collisions.callbacks.delete(entityId)
  },
  
  // Raycasting
  raycast: (from, to, options = {}) => {
    const bodies = Array.from(physicsState.bodies.values())
    const results = []
    
    bodies.forEach(body => {
      // Simple ray-AABB intersection (placeholder)
      const center = body.position
      const hit = {
        body: body.entityId,
        point: center,
        normal: [0, 1, 0],
        distance: Math.sqrt(
          Math.pow(center[0] - from[0], 2) +
          Math.pow(center[1] - from[1], 2) +
          Math.pow(center[2] - from[2], 2)
        )
      }
      
      results.push(hit)
    })
    
    // Sort by distance
    results.sort((a, b) => a.distance - b.distance)
    
    physicsState.raycasting.results = results
    return results
  },
  
  // Persistent ray queries
  addRayQuery: (id, from, to, options = {}) => {
    physicsState.raycasting.queries.set(id, { from, to, options, results: [] })
  },
  
  removeRayQuery: (id) => {
    physicsState.raycasting.queries.delete(id)
  },
  
  updateRayQueries: () => {
    physicsState.raycasting.queries.forEach((query, id) => {
      query.results = physicsActions.raycast(query.from, query.to, query.options)
    })
  },
  
  // Settings updates
  updateSettings: (newSettings) => {
    Object.assign(physicsState.settings, newSettings)
  },
  
  // Constraint system (basic)
  createConstraint: (bodyA, bodyB, type, options = {}) => {
    // Placeholder for constraint system
    return { bodyA, bodyB, type, options }
  }
}

// Set up automatic ray query updates
if (typeof window !== 'undefined') {
  // Update ray queries periodically if there are any
  setInterval(() => {
    if (physicsState.raycasting.queries.size > 0) {
      physicsActions.updateRayQueries()
    }
  }, 16) // ~60fps
}

// Legacy compatibility hook
// physicsState and physicsActions are already exported above