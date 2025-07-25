import { create } from 'zustand'

export const usePhysicsStore = create((set, get) => ({
  // Physics world
  world: null,
  gravity: [0, -9.81, 0],
  timeStep: 1/60,
  maxSubSteps: 10,
  
  // Physics bodies
  bodies: new Map(),
  
  // Collision detection
  collisions: [],
  collisionMatrix: new Map(),
  
  // Physics settings
  settings: {
    enabled: true,
    broadphase: 'naive', // naive, sap, grid
    solver: 'gs', // gs (GaussSeidel), split
    iterations: 10,
    tolerance: 1e-7,
    allowSleep: true,
    sleepSpeedLimit: 0.1,
    sleepTimeLimit: 1
  },
  
  // Ray casting
  raycastResults: [],
  
  // Actions
  initPhysics: () => {
    // This would initialize a physics engine like Cannon.js or similar
    // For now, we'll create a simple placeholder
    const world = {
      bodies: [],
      gravity: get().gravity,
      step: (timeStep) => {
        // Simple physics step simulation
        world.bodies.forEach(body => {
          if (!body.static && body.velocity) {
            // Apply gravity
            body.velocity[1] += world.gravity[1] * timeStep
            
            // Update position
            body.position[0] += body.velocity[0] * timeStep
            body.position[1] += body.velocity[1] * timeStep
            body.position[2] += body.velocity[2] * timeStep
            
            // Simple ground collision
            if (body.position[1] < 0 && body.velocity[1] < 0) {
              body.position[1] = 0
              body.velocity[1] *= -0.8 // bounce with damping
            }
          }
        })
      }
    }
    
    set({ world })
  },
  
  setGravity: (x, y, z) => {
    set({ gravity: [x, y, z] })
    const world = get().world
    if (world) {
      world.gravity = [x, y, z]
    }
  },
  
  createRigidBody: (entityId, options = {}) => {
    const body = {
      entityId,
      position: options.position || [0, 0, 0],
      rotation: options.rotation || [0, 0, 0],
      velocity: options.velocity || [0, 0, 0],
      angularVelocity: options.angularVelocity || [0, 0, 0],
      mass: options.mass || 1,
      static: options.static || false,
      shape: options.shape || 'box',
      size: options.size || [1, 1, 1],
      material: {
        friction: options.friction || 0.4,
        restitution: options.restitution || 0.3,
        density: options.density || 1
      },
      sleeping: false,
      sleepTime: 0
    }
    
    // Add to physics world
    const world = get().world
    if (world) {
      world.bodies.push(body)
    }
    
    set(state => ({
      bodies: new Map(state.bodies).set(entityId, body)
    }))
    
    return body
  },
  
  removeRigidBody: (entityId) => {
    const body = get().bodies.get(entityId)
    if (!body) return
    
    // Remove from physics world
    const world = get().world
    if (world) {
      const index = world.bodies.findIndex(b => b.entityId === entityId)
      if (index >= 0) {
        world.bodies.splice(index, 1)
      }
    }
    
    set(state => {
      const newBodies = new Map(state.bodies)
      newBodies.delete(entityId)
      return { bodies: newBodies }
    })
  },
  
  updateRigidBody: (entityId, updates) => {
    const body = get().bodies.get(entityId)
    if (!body) return
    
    const updatedBody = { ...body, ...updates }
    
    set(state => ({
      bodies: new Map(state.bodies).set(entityId, updatedBody)
    }))
  },
  
  getRigidBody: (entityId) => get().bodies.get(entityId),
  
  applyForce: (entityId, force, point) => {
    const body = get().bodies.get(entityId)
    if (!body || body.static) return
    
    // Simple force application (F = ma, so a = F/m)
    const acceleration = [
      force[0] / body.mass,
      force[1] / body.mass,
      force[2] / body.mass
    ]
    
    body.velocity[0] += acceleration[0]
    body.velocity[1] += acceleration[1]
    body.velocity[2] += acceleration[2]
  },
  
  applyImpulse: (entityId, impulse, point) => {
    const body = get().bodies.get(entityId)
    if (!body || body.static) return
    
    // Impulse directly changes velocity (J = m*v, so v = J/m)
    body.velocity[0] += impulse[0] / body.mass
    body.velocity[1] += impulse[1] / body.mass
    body.velocity[2] += impulse[2] / body.mass
  },
  
  setVelocity: (entityId, velocity) => {
    const body = get().bodies.get(entityId)
    if (!body) return
    
    body.velocity = [...velocity]
  },
  
  setPosition: (entityId, position) => {
    const body = get().bodies.get(entityId)
    if (!body) return
    
    body.position = [...position]
  },
  
  // Physics simulation step
  step: (deltaTime) => {
    const { world, settings } = get()
    if (!world || !settings.enabled) return
    
    const timeStep = Math.min(deltaTime, get().timeStep)
    const steps = Math.ceil(deltaTime / timeStep)
    const actualSteps = Math.min(steps, get().maxSubSteps)
    
    for (let i = 0; i < actualSteps; i++) {
      world.step(timeStep)
    }
    
    // Update collision detection
    get().detectCollisions()
  },
  
  // Simple collision detection
  detectCollisions: () => {
    const bodies = Array.from(get().bodies.values())
    const collisions = []
    
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i]
        const bodyB = bodies[j]
        
        // Simple AABB collision detection
        const distance = Math.sqrt(
          Math.pow(bodyA.position[0] - bodyB.position[0], 2) +
          Math.pow(bodyA.position[1] - bodyB.position[1], 2) +
          Math.pow(bodyA.position[2] - bodyB.position[2], 2)
        )
        
        const minDistance = (bodyA.size[0] + bodyB.size[0]) / 2
        
        if (distance < minDistance) {
          collisions.push({
            bodyA: bodyA.entityId,
            bodyB: bodyB.entityId,
            distance,
            normal: [
              (bodyB.position[0] - bodyA.position[0]) / distance,
              (bodyB.position[1] - bodyA.position[1]) / distance,
              (bodyB.position[2] - bodyA.position[2]) / distance
            ]
          })
        }
      }
    }
    
    set({ collisions })
  },
  
  // Ray casting
  raycast: (from, to, options = {}) => {
    const bodies = Array.from(get().bodies.values())
    const results = []
    
    // Simple ray-box intersection
    bodies.forEach(body => {
      // This would be a proper ray-AABB intersection in a real implementation
      const center = body.position
      const halfSize = body.size.map(s => s / 2)
      
      // Simplified intersection test
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
    
    set({ raycastResults: results })
    return results
  },
  
  updateSettings: (newSettings) => set(state => ({
    settings: { ...state.settings, ...newSettings }
  }))
}))