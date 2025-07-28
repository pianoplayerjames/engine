import React from 'react'
import { projectManager } from '../projectManager.js'

export default function ProjectIndicator() {
  const currentProject = projectManager.getCurrentProject()
  
  if (!currentProject.name) {
    return null
  }

  return (
    <div className="absolute top-4 right-4 pointer-events-auto z-30 no-select">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg shadow-2xl px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300 font-medium">{currentProject.name}</span>
        </div>
      </div>
    </div>
  )
}