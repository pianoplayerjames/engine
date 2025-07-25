import { create } from 'zustand'

export const useInputStore = create((set, get) => ({
  // Keyboard state
  keys: new Map(),
  keyPressed: {},
  keyReleased: {},
  
  // Mouse state
  mouse: {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    buttons: new Map(),
    wheel: { x: 0, y: 0 }
  },
  
  // Gamepad state
  gamepads: new Map(),
  gamepadConnected: {},
  gamepadDisconnected: {},
  
  // Actions
  setKeyDown: (key) => set(state => ({
    keys: new Map(state.keys).set(key, true),
    keyPressed: { ...state.keyPressed, [key]: true }
  })),
  
  setKeyUp: (key) => set(state => ({
    keys: new Map(state.keys).set(key, false),
    keyReleased: { ...state.keyReleased, [key]: true }
  })),
  
  setMousePosition: (x, y) => set(state => ({
    mouse: {
      ...state.mouse,
      deltaX: x - state.mouse.x,
      deltaY: y - state.mouse.y,
      x,
      y
    }
  })),
  
  setMouseButton: (button, pressed) => set(state => ({
    mouse: {
      ...state.mouse,
      buttons: new Map(state.mouse.buttons).set(button, pressed)
    }
  })),
  
  setMouseWheel: (deltaX, deltaY) => set(state => ({
    mouse: {
      ...state.mouse,
      wheel: { x: deltaX, y: deltaY }
    }
  })),
  
  updateGamepads: () => {
    const gamepads = navigator.getGamepads()
    const gamepadMap = new Map()
    
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        gamepadMap.set(i, {
          id: gamepads[i].id,
          index: gamepads[i].index,
          connected: gamepads[i].connected,
          buttons: gamepads[i].buttons.map(btn => ({
            pressed: btn.pressed,
            touched: btn.touched,
            value: btn.value
          })),
          axes: [...gamepads[i].axes]
        })
      }
    }
    
    set({ gamepads: gamepadMap })
  },
  
  setGamepadConnected: (gamepad) => set(state => ({
    gamepadConnected: { ...state.gamepadConnected, [gamepad.index]: gamepad }
  })),
  
  setGamepadDisconnected: (gamepad) => set(state => ({
    gamepadDisconnected: { ...state.gamepadDisconnected, [gamepad.index]: gamepad }
  })),
  
  clearFrameEvents: () => set(state => ({
    keyPressed: {},
    keyReleased: {},
    gamepadConnected: {},
    gamepadDisconnected: {},
    mouse: {
      ...state.mouse,
      deltaX: 0,
      deltaY: 0,
      wheel: { x: 0, y: 0 }
    }
  })),
  
  // Helper methods
  isKeyDown: (key) => get().keys.get(key) || false,
  wasKeyPressed: (key) => get().keyPressed[key] || false,
  wasKeyReleased: (key) => get().keyReleased[key] || false,
  isMouseButtonDown: (button) => get().mouse.buttons.get(button) || false,
  
  // Gamepad helpers
  getGamepad: (index) => get().gamepads.get(index),
  isGamepadButtonPressed: (gamepadIndex, buttonIndex) => {
    const gamepad = get().gamepads.get(gamepadIndex)
    return gamepad?.buttons[buttonIndex]?.pressed || false
  },
  getGamepadAxis: (gamepadIndex, axisIndex) => {
    const gamepad = get().gamepads.get(gamepadIndex)
    return gamepad?.axes[axisIndex] || 0
  },
  wasGamepadConnected: (index) => get().gamepadConnected[index] !== undefined,
  wasGamepadDisconnected: (index) => get().gamepadDisconnected[index] !== undefined
}))