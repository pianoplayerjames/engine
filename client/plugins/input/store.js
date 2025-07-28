import { proxy, subscribe, useSnapshot } from 'valtio'

// Create the reactive input state
export const inputState = proxy({
  // Keyboard state - using Maps for fine-grained reactivity
  keyboard: {
    keys: new Map(),
    pressed: new Map(),
    released: new Map(),
    modifiers: {
      shift: false,
      ctrl: false,
      alt: false,
      meta: false
    }
  },
  
  // Mouse state
  mouse: {
    position: { x: 0, y: 0 },
    delta: { x: 0, y: 0 },
    buttons: new Map(),
    wheel: { x: 0, y: 0 },
    locked: false
  },
  
  // Gamepad state - using Maps for multiple gamepads
  gamepads: {
    connected: new Map(),
    events: {
      connected: new Map(),
      disconnected: new Map()
    }
  },
  
  // Touch state for mobile support
  touch: {
    touches: new Map(),
    gestures: {
      pinch: { scale: 1, delta: 0 },
      pan: { x: 0, y: 0, deltaX: 0, deltaY: 0 }
    }
  },
  
  // Input context for different modes
  context: {
    current: 'game', // 'game', 'editor', 'ui'
    bindings: new Map()
  }
})

// Actions that mutate the state directly
export const inputActions = {
  // Keyboard actions
  setKeyDown: (key) => {
    inputState.keyboard.keys.set(key, true)
    inputState.keyboard.pressed.set(key, true)
    
    // Update modifiers
    switch (key.toLowerCase()) {
      case 'shift':
        inputState.keyboard.modifiers.shift = true
        break
      case 'control':
        inputState.keyboard.modifiers.ctrl = true
        break
      case 'alt':
        inputState.keyboard.modifiers.alt = true
        break
      case 'meta':
        inputState.keyboard.modifiers.meta = true
        break
    }
  },
  
  setKeyUp: (key) => {
    inputState.keyboard.keys.set(key, false)
    inputState.keyboard.released.set(key, true)
    
    // Update modifiers
    switch (key.toLowerCase()) {
      case 'shift':
        inputState.keyboard.modifiers.shift = false
        break
      case 'control':
        inputState.keyboard.modifiers.ctrl = false
        break
      case 'alt':
        inputState.keyboard.modifiers.alt = false
        break
      case 'meta':
        inputState.keyboard.modifiers.meta = false
        break
    }
  },
  
  // Mouse actions
  setMousePosition: (x, y) => {
    inputState.mouse.delta.x = x - inputState.mouse.position.x
    inputState.mouse.delta.y = y - inputState.mouse.position.y
    inputState.mouse.position.x = x
    inputState.mouse.position.y = y
  },
  
  setMouseButton: (button, pressed) => {
    inputState.mouse.buttons.set(button, pressed)
  },
  
  setMouseWheel: (deltaX, deltaY) => {
    inputState.mouse.wheel.x = deltaX
    inputState.mouse.wheel.y = deltaY
  },
  
  setMouseLocked: (locked) => {
    inputState.mouse.locked = locked
  },
  
  // Touch actions
  addTouch: (id, x, y, pressure = 1) => {
    inputState.touch.touches.set(id, { x, y, pressure, startTime: Date.now() })
  },
  
  updateTouch: (id, x, y, pressure = 1) => {
    const touch = inputState.touch.touches.get(id)
    if (touch) {
      Object.assign(touch, { x, y, pressure })
    }
  },
  
  removeTouch: (id) => {
    inputState.touch.touches.delete(id)
  },
  
  // Gesture recognition
  updatePinchGesture: (scale, delta) => {
    inputState.touch.gestures.pinch.scale = scale
    inputState.touch.gestures.pinch.delta = delta
  },
  
  updatePanGesture: (x, y, deltaX, deltaY) => {
    inputState.touch.gestures.pan.x = x
    inputState.touch.gestures.pan.y = y
    inputState.touch.gestures.pan.deltaX = deltaX
    inputState.touch.gestures.pan.deltaY = deltaY
  },
  
  // Gamepad management
  updateGamepads: () => {
    if (!navigator.getGamepads) return
    
    const gamepads = navigator.getGamepads()
    
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i]
      if (gamepad) {
        inputState.gamepads.connected.set(i, {
          id: gamepad.id,
          index: gamepad.index,
          connected: gamepad.connected,
          buttons: gamepad.buttons.map(btn => ({
            pressed: btn.pressed,
            touched: btn.touched,
            value: btn.value
          })),
          axes: [...gamepad.axes],
          timestamp: gamepad.timestamp
        })
      }
    }
  },
  
  setGamepadConnected: (gamepad) => {
    inputState.gamepads.events.connected.set(gamepad.index, gamepad)
  },
  
  setGamepadDisconnected: (gamepad) => {
    inputState.gamepads.events.disconnected.set(gamepad.index, gamepad)
    inputState.gamepads.connected.delete(gamepad.index)
  },
  
  // Context management
  setInputContext: (context) => {
    inputState.context.current = context
  },
  
  addInputBinding: (key, action, context = 'game') => {
    const contextBindings = inputState.context.bindings.get(context) || new Map()
    contextBindings.set(key, action)
    inputState.context.bindings.set(context, contextBindings)
  },
  
  removeInputBinding: (key, context = 'game') => {
    const contextBindings = inputState.context.bindings.get(context)
    if (contextBindings) {
      contextBindings.delete(key)
    }
  },
  
  // Frame cleanup - called at the end of each frame
  clearFrameEvents: () => {
    inputState.keyboard.pressed.clear()
    inputState.keyboard.released.clear()
    inputState.gamepads.events.connected.clear()
    inputState.gamepads.events.disconnected.clear()
    inputState.mouse.delta.x = 0
    inputState.mouse.delta.y = 0
    inputState.mouse.wheel.x = 0
    inputState.mouse.wheel.y = 0
    inputState.touch.gestures.pinch.delta = 0
    inputState.touch.gestures.pan.deltaX = 0
    inputState.touch.gestures.pan.deltaY = 0
  },
  
  // Helper methods for querying input state
  isKeyDown: (key) => inputState.keyboard.keys.get(key) || false,
  wasKeyPressed: (key) => inputState.keyboard.pressed.get(key) || false,
  wasKeyReleased: (key) => inputState.keyboard.released.get(key) || false,
  
  isMouseButtonDown: (button) => inputState.mouse.buttons.get(button) || false,
  
  getGamepad: (index) => inputState.gamepads.connected.get(index),
  isGamepadButtonPressed: (gamepadIndex, buttonIndex) => {
    const gamepad = inputState.gamepads.connected.get(gamepadIndex)
    return gamepad?.buttons[buttonIndex]?.pressed || false
  },
  getGamepadAxis: (gamepadIndex, axisIndex) => {
    const gamepad = inputState.gamepads.connected.get(gamepadIndex)
    return gamepad?.axes[axisIndex] || 0
  },
  
  wasGamepadConnected: (index) => inputState.gamepads.events.connected.has(index),
  wasGamepadDisconnected: (index) => inputState.gamepads.events.disconnected.has(index),
  
  // Advanced input queries
  getActiveKeys: () => {
    const activeKeys = []
    inputState.keyboard.keys.forEach((pressed, key) => {
      if (pressed) activeKeys.push(key)
    })
    return activeKeys
  },
  
  getMouseMovement: () => ({
    x: inputState.mouse.delta.x,
    y: inputState.mouse.delta.y,
    magnitude: Math.sqrt(
      inputState.mouse.delta.x ** 2 + inputState.mouse.delta.y ** 2
    )
  }),
  
  // Input combination detection
  isComboPressed: (keys) => {
    return keys.every(key => inputActions.isKeyDown(key))
  }
}

// Set up automatic gamepad polling
if (typeof window !== 'undefined') {
  let lastGamepadUpdate = 0
  
  const pollGamepads = () => {
    const now = performance.now()
    if (now - lastGamepadUpdate > 16) { // ~60fps polling
      inputActions.updateGamepads()
      lastGamepadUpdate = now
    }
    requestAnimationFrame(pollGamepads)
  }
  
  requestAnimationFrame(pollGamepads)
  
  // Set up event listeners for gamepad connect/disconnect
  window.addEventListener('gamepadconnected', (e) => {
    inputActions.setGamepadConnected(e.gamepad)
  })
  
  window.addEventListener('gamepaddisconnected', (e) => {
    inputActions.setGamepadDisconnected(e.gamepad)
  })
}

// Legacy compatibility hook
// inputState and inputActions are already exported above