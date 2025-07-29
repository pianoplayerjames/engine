import React, { useState, useEffect } from 'react'

export default function SplashLoader({ onReady }) {
  const [show, setShow] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Show splash for just a brief brand flash
    const timer = setTimeout(() => {
      setFadeOut(true)
      
      // After fade out animation, hide and trigger ready
      setTimeout(() => {
        setShow(false)
        onReady?.()
      }, 300)
    }, 600) // Much shorter splash time

    return () => clearTimeout(timer)
  }, [onReady])

  if (!show) return null

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-gray-900/10 via-blue-900/10 to-purple-900/10 backdrop-blur-[1px] flex items-center justify-center z-[100] transition-opacity duration-300 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center">
        {/* Renzora Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 animate-pulse">
            RENZORA
          </h1>
          <p className="text-xl text-gray-300 font-light tracking-wide">
            Game Engine
          </p>
        </div>

        {/* Animated loading dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>

        {/* Version info */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm text-gray-500">Version 0.1.0</p>
        </div>
      </div>
    </div>
  )
}