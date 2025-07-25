import { useEffect } from 'react'
import { useEditorStore } from './store.js'
import { useInputStore } from '../input/store.js'
import { useSceneStore } from '../scene/store.js'
import { ViewportCanvas } from '../render/index.jsx'

function HierarchyPanel() {
  const entities = useSceneStore(state => state.entities)
  const { selectedEntity, setSelectedEntity } = useEditorStore()

  return (
    <div style={{
      width: '250px',
      background: '#2a2a2a',
      border: '1px solid #444',
      borderRadius: '4px',
      padding: '8px'
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '14px' }}>Hierarchy</h3>
      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
        {Array.from(entities.entries()).map(([id, entity]) => (
          <div
            key={id}
            onClick={() => setSelectedEntity(id)}
            style={{
              padding: '4px 8px',
              cursor: 'pointer',
              background: selectedEntity === id ? '#4a4a4a' : 'transparent',
              color: '#fff',
              fontSize: '12px',
              borderRadius: '2px',
              marginBottom: '2px'
            }}
          >
            {entity.name}
          </div>
        ))}
      </div>
    </div>
  )
}

function InspectorPanel() {
  const { selectedEntity } = useEditorStore()
  const getEntity = useSceneStore(state => state.getEntity)
  const getComponent = useSceneStore(state => state.getComponent)

  const entity = selectedEntity ? getEntity(selectedEntity) : null
  const transform = selectedEntity ? getComponent(selectedEntity, 'transform') : null

  if (!entity) {
    return (
      <div style={{
        width: '250px',
        background: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '4px',
        padding: '8px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '14px' }}>Inspector</h3>
        <p style={{ color: '#999', fontSize: '12px' }}>No entity selected</p>
      </div>
    )
  }

  return (
    <div style={{
      width: '250px',
      background: '#2a2a2a',
      border: '1px solid #444',
      borderRadius: '4px',
      padding: '8px'
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '14px' }}>Inspector</h3>
      <div style={{ color: '#fff', fontSize: '12px' }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Name:</strong> {entity.name}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>ID:</strong> {entity.id}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Active:</strong> {entity.active ? 'Yes' : 'No'}
        </div>
        {transform && (
          <div>
            <strong>Transform:</strong>
            <div style={{ marginLeft: '8px', marginTop: '4px' }}>
              <div>Position: {transform.position?.join(', ')}</div>
              <div>Rotation: {transform.rotation?.join(', ')}</div>
              <div>Scale: {transform.scale?.join(', ')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EditorPlugin() {
  const { isOpen, toggle, panels } = useEditorStore()
  const keyPressed = useInputStore(state => state.keyPressed)

  useEffect(() => {
    // Check for Tab key press each frame
    if (keyPressed['Tab']) {
      console.log('Tab key detected, toggling editor')
      toggle()
    }
  }, [keyPressed, toggle])
  
  // Debug logging
  useEffect(() => {
    console.log('Editor plugin mounted, isOpen:', isOpen)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'transparent',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      {/* Editor Header */}
      <div style={{
        height: '40px',
        background: '#1a1a1a',
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        justifyContent: 'space-between',
        pointerEvents: 'auto'
      }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Engine Editor</h2>
        <button
          onClick={toggle}
          style={{
            background: '#444',
            border: 'none',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Close (Tab)
        </button>
      </div>

      {/* Editor Content */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 40px)'
      }}>
        {/* Left Panels */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '8px',
          background: '#333',
          pointerEvents: 'auto'
        }}>
          {panels.hierarchy && <HierarchyPanel />}
        </div>

        {/* Main Content Area - 3D Viewport */}
        <div style={{
          flex: 1,
          background: 'transparent',
          pointerEvents: 'none'
        }}>
        </div>

        {/* Right Panels */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '8px',
          background: '#333',
          pointerEvents: 'auto'
        }}>
          {panels.inspector && <InspectorPanel />}
        </div>
      </div>
    </div>
  )
}

// Export the store for other plugins to use
export { useEditorStore } from './store.js'