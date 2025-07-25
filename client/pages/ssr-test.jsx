import { useState } from 'react'
import SSRCube from '../components/SSRCube.jsx'
import ClientCube from '../components/ClientCube.jsx'

export default function SSRTest() {
  const [activeTab, setActiveTab] = useState('ssr')

  return (
    <div>
      <div style={{ padding: '20px', background: '#f5f5f5' }}>
        <h1>SSR vs Client Rendering Test</h1>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => setActiveTab('ssr')}
            style={{ 
              padding: '10px 20px', 
              marginRight: '10px',
              background: activeTab === 'ssr' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            SSR Component
          </button>
          <button 
            onClick={() => setActiveTab('client')}
            style={{ 
              padding: '10px 20px',
              background: activeTab === 'client' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Client Component
          </button>
        </div>
      </div>

      {activeTab === 'ssr' && <SSRCube />}
      {activeTab === 'client' && <ClientCube />}
    </div>
  )
}