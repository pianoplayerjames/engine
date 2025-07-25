import { useEffect } from 'react'
import { useInputStore } from './store.js'

export default function InputPlugin() {
  const { 
    setKeyDown, 
    setKeyUp, 
    setMousePosition, 
    setMouseButton, 
    setMouseWheel,
    updateGamepads,
    setGamepadConnected,
    setGamepadDisconnected
  } = useInputStore()

  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('Key down:', event.code)
      event.preventDefault()
      setKeyDown(event.code)
    }

    const handleKeyUp = (event) => {
      event.preventDefault()
      setKeyUp(event.code)
    }

    const handleMouseMove = (event) => {
      setMousePosition(event.clientX, event.clientY)
    }

    const handleMouseDown = (event) => {
      setMouseButton(event.button, true)
    }

    const handleMouseUp = (event) => {
      setMouseButton(event.button, false)
    }

    const handleWheel = (event) => {
      setMouseWheel(event.deltaX, event.deltaY)
    }

    const handleGamepadConnected = (event) => {
      setGamepadConnected(event.gamepad)
    }

    const handleGamepadDisconnected = (event) => {
      setGamepadDisconnected(event.gamepad)
    }

    // Gamepad polling (required because gamepad state isn't event-driven)
    const gamepadInterval = setInterval(() => {
      updateGamepads()
    }, 16) // ~60fps

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('wheel', handleWheel)
    window.addEventListener('gamepadconnected', handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('gamepadconnected', handleGamepadConnected)
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected)
      clearInterval(gamepadInterval)
    }
  }, [setKeyDown, setKeyUp, setMousePosition, setMouseButton, setMouseWheel, updateGamepads, setGamepadConnected, setGamepadDisconnected])

  return null // This plugin doesn't render anything
}

// Export the store for other plugins to use
export { useInputStore } from './store.js'