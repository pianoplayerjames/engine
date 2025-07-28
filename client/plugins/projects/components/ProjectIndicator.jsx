import React, { useState, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { editorState } from '@/plugins/editor/store.js'
import { projectManager } from '../projectManager.js'
import { autoSaveManager } from '@/plugins/core/AutoSaveManager.js'

export default function ProjectIndicator() {
  const currentProject = projectManager.getCurrentProject()
  const { ui, panels } = useSnapshot(editorState)
  const { bottomPanelHeight } = ui
  const { isAssetPanelOpen } = panels
  const [lastSync, setLastSync] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  
  if (!currentProject.name) {
    return null
  }

  // Get last modified time from localStorage or project data
  useEffect(() => {
    const storedProject = projectManager.getCurrentProjectFromStorage()
    if (storedProject?.lastAccessed) {
      setLastSync(new Date(storedProject.lastAccessed))
    }
  }, [])

  // Check for unsaved changes periodically
  useEffect(() => {
    const checkUnsavedChanges = () => {
      setHasUnsavedChanges(autoSaveManager.hasUnsavedChanges())
    }

    // Check immediately
    checkUnsavedChanges()

    // Check every second for changes
    const interval = setInterval(checkUnsavedChanges, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatLastSync = (date) => {
    if (!date) return 'Never synced'
    
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getStatusInfo = () => {
    if (hasUnsavedChanges) {
      return {
        color: 'bg-yellow-500',
        tooltip: 'Unsaved changes - will auto-save soon'
      }
    }
    return {
      color: 'bg-green-500',
      tooltip: `Last sync: ${formatLastSync(lastSync)}`
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div 
      className="absolute pointer-events-auto z-10 no-select"
      style={{
        left: 8,
        bottom: isAssetPanelOpen ? bottomPanelHeight + 8 : 48
      }}
    >
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded px-2 py-1">
        <div className="flex items-center gap-1.5">
          <div 
            className={`w-1.5 h-1.5 ${statusInfo.color} rounded-full cursor-pointer relative`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {showTooltip && (
              <div className="absolute bottom-full -left-2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                {statusInfo.tooltip}
                <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400">{currentProject.name}</span>
        </div>
      </div>
    </div>
  )
}