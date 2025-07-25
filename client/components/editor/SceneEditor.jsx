'use client'

import { useState } from 'react'

export default function SceneEditor({ cubeProps, onCubePropsChange }) {
  const handleChange = (property, value) => {
    onCubePropsChange({
      ...cubeProps,
      [property]: value
    })
  }

  const handleVectorChange = (property, axis, value) => {
    const newVector = { ...cubeProps[property] }
    newVector[axis] = parseFloat(value) || 0
    onCubePropsChange({
      ...cubeProps,
      [property]: newVector
    })
  }

  return (
    <div style={{ 
      position: 'fixed', 
      right: 0, 
      top: 0, 
      width: '300px', 
      height: '100vh', 
      background: '#2a2a2a', 
      color: 'white', 
      padding: '20px',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      <h3>Scene Editor</h3>
      
      {/* Position Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Position</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
          <div>
            <label>X</label>
            <input
              type="number"
              step="0.1"
              value={cubeProps.position.x}
              onChange={(e) => handleVectorChange('position', 'x', e.target.value)}
              style={{ width: '100%', padding: '5px', background: '#444', color: 'white', border: 'none' }}
            />
          </div>
          <div>
            <label>Y</label>
            <input
              type="number"
              step="0.1"
              value={cubeProps.position.y}
              onChange={(e) => handleVectorChange('position', 'y', e.target.value)}
              style={{ width: '100%', padding: '5px', background: '#444', color: 'white', border: 'none' }}
            />
          </div>
          <div>
            <label>Z</label>
            <input
              type="number"
              step="0.1"
              value={cubeProps.position.z}
              onChange={(e) => handleVectorChange('position', 'z', e.target.value)}
              style={{ width: '100%', padding: '5px', background: '#444', color: 'white', border: 'none' }}
            />
          </div>
        </div>    
      </div>

      {/* Rotation Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Rotation</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
          <div>
            <label>X</label>
            <input
              type="number"
              step="0.1"
              value={cubeProps.rotation.x}
              onChange={(e) => handleVectorChange('rotation', 'x', e.target.value)}
              style={{ width: '100%', padding: '5px', background: '#444', color: 'white', border: 'none' }}
            />
          </div>
          <div>
            <label>Y</label>
            <input
              type="number"
              step="0.1"
              value={cubeProps.rotation.y}
              onChange={(e) => handleVectorChange('rotation', 'y', e.target.value)}
              style={{ width: '100%', padding: '5px', background: '#444', color: 'white', border: 'none' }}
            />
          </div>
          <div>
            <label>Z</label>
            <input
              type="number"
              step="0.1"
              value={cubeProps.rotation.z}
              onChange={(e) => handleVectorChange('rotation', 'z', e.target.value)}
              style={{ width: '100%', padding: '5px', background: '#444', color: 'white', border: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Scale Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Scale</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
          <div>
            <label>X</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={cubeProps.scale.x}
              onChange={(e) => handleVectorChange('scale', 'x', e.target.value)}
              style={{ width: '100%', padding: '5px', background: '#444', color: 'white', border: 'none' }}
            />
          </div>
          <div>
            <label>Y</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={cubeProps.scale.y}
              onChange={(e) => handleVectorChange('scale', 'y', e.target.value)}
              style={{ width: '100%', padding: '5px', background: '#444', color: 'white', border: 'none' }}
            />
          </div>
          <div>
            <label>Z</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={cubeProps.scale.z}
              onChange={(e) => handleVectorChange('scale', 'z', e.target.value)}
              style={{ width: '100%', padding: '5px', background: '#444', color: 'white', border: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Material Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Material</h4>
        <div>
          <label>Color</label>
          <input
            type="color"
            value={cubeProps.color}
            onChange={(e) => handleChange('color', e.target.value)}
            style={{ width: '100%', height: '40px', background: '#444', border: 'none', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Animation Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Animation</h4>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={cubeProps.animate}
            onChange={(e) => handleChange('animate', e.target.checked)}
          />
          Auto Rotate
        </label>
      </div>

      {/* Preset Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Presets</h4>
        <button
          onClick={() => onCubePropsChange({
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            color: '#ff6b35',
            animate: false
          })}
          style={{ 
            width: '100%', 
            padding: '10px', 
            marginBottom: '10px',
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          Reset
        </button>
        <button
          onClick={() => onCubePropsChange({
            ...cubeProps,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0.5, y: 0.5, z: 0 },
            scale: { x: 1.5, y: 1.5, z: 1.5 },
            color: '#00ff88',
            animate: true
          })}
          style={{ 
            width: '100%', 
            padding: '10px',
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          Animated Large
        </button>
      </div>
    </div>
  )
}