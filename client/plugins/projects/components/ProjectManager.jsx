import React, { useState, useRef } from 'react'
import { projectManager } from '../projectManager.js'
import { ProjectLoadingState } from './AssetLoader.jsx'
import { useLoading } from './LoadingProvider.jsx'

export default function ProjectManager({ onProjectLoad, onClose }) {
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const { isLoading, operation, progress } = useLoading()

  const handleOpenProject = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.ren')) {
      setError('Please select a .ren project file')
      return
    }

    setError(null)

    try {
      const projectName = file.name.replace('.ren', '')
      const projectPath = await projectManager.extractProject(file, projectName)
      onProjectLoad?.(projectName, projectPath)
      onClose?.()
    } catch (err) {
      setError(`Failed to open project: ${err.message}`)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Please enter a project name')
      return
    }

    setError(null)

    try {
      const projectPath = await projectManager.createNewProject(newProjectName.trim())
      onProjectLoad?.(newProjectName.trim(), projectPath)
      onClose?.()
    } catch (err) {
      setError(`Failed to create project: ${err.message}`)
    }
  }

  const handleExportProject = async () => {
    const currentProject = projectManager.getCurrentProject()
    
    if (!currentProject.path) {
      setError('No project is currently open')
      return
    }

    setError(null)

    try {
      await projectManager.packageProject(currentProject.path, currentProject.name)
    } catch (err) {
      setError(`Failed to export project: ${err.message}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-sm mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Renzora Projects</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-4">
            <ProjectLoadingState operation={operation} progress={progress} />
          </div>
        )}

        <div className="space-y-4">
          {/* Open Project */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Open Project</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ren"
              onChange={handleOpenProject}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
            >
              {isLoading && operation === 'importing' ? 'Opening...' : 'Open .ren File'}
            </button>
          </div>

          {/* Create Project */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Create New Project</h3>
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
              >
                New Project
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateProject}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
                  >
                    {isLoading && operation === 'creating' ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewProjectName('')
                      setError(null)
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export Project */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Export Project</h3>
            <button
              onClick={handleExportProject}
              disabled={isLoading || !projectManager.getCurrentProject().path}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
            >
              {isLoading && operation === 'exporting' ? 'Exporting...' : 'Export as .ren'}
            </button>
            {!projectManager.getCurrentProject().path && (
              <p className="text-xs text-gray-400 mt-1">No project currently open</p>
            )}
          </div>
        </div>

        {/* Current Project Info */}
        {projectManager.getCurrentProject().name && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-1">Current Project</h4>
            <p className="text-sm text-gray-400">{projectManager.getCurrentProject().name}</p>
            <p className="text-xs text-gray-500 mt-1">Auto-saves every 30 seconds</p>
          </div>
        )}
        
        {!projectManager.getCurrentProject().name && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">No project loaded</p>
          </div>
        )}
      </div>
    </div>
  )
}