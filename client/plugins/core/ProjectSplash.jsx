import { useState, useEffect } from 'react'
import { Icons } from '@/plugins/editor/components/Icons'

export default function ProjectSplash({ onProjectSelected }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  
  const templates = [
    {
      id: 'blank',
      name: 'Blank Project',
      description: 'Start with an empty scene',
      icon: '🎯'
    },
    {
      id: 'first-person',
      name: 'First Person',
      description: 'First person character controller',
      icon: '🚶'
    },
    {
      id: 'third-person',
      name: 'Third Person',
      description: 'Third person character controller',
      icon: '🏃'
    },
    {
      id: 'platformer',
      name: '2D Platformer',
      description: 'Side-scrolling platformer setup',
      icon: '🎮'
    }
  ]

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      } else {
        console.warn('Failed to fetch projects')
        setProjects([])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    
    try {
      setCreating(true)
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName: newProjectName.trim(),
          template: selectedTemplate
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        onProjectSelected(newProjectName.trim())
      } else {
        const error = await response.json()
        alert(`Failed to create project: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleProjectSelect = (projectName) => {
    onProjectSelected(projectName)
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  const getProjectDisplayName = (project) => {
    return project.displayName || project.name
  }

  return (
    <div className="fixed inset-0 bg-slate-900/15 backdrop-blur-[1px] flex items-center justify-center z-[100]">
      {/* Centered Project Manager Container */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-[900px] h-[600px] flex overflow-hidden">
        {/* Left Sidebar - mimics the engine's left panel */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-semibold text-white mb-1">RENZORA</h1>
          <p className="text-xs text-gray-400">Project Manager</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
                !showCreateForm 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icons.Folder className="w-4 h-4" />
              Recent Projects
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
                showCreateForm 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icons.Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-gray-500">Version 0.1.0</p>
        </div>
      </div>

      {/* Main Content - mimics the engine's main area */}
      <div className="flex-1 bg-slate-800 flex flex-col">
        {/* Top bar */}
        <div className="h-12 bg-slate-900 border-b border-slate-700 flex items-center px-4">
          <h2 className="text-sm font-medium text-white">
            {showCreateForm ? 'Create New Project' : 'Open Project'}
          </h2>
        </div>

        {/* Content area with custom scrollbar */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
            {showCreateForm ? (
              /* Create Project Form */
              <div className="max-w-2xl">
                <div className="space-y-6">
                  {/* Project Details */}
                  <div className="bg-slate-900 p-4 rounded border border-slate-700">
                    <h3 className="text-sm font-medium text-white mb-4">Project Details</h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="My Awesome Game"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Templates */}
                  <div className="bg-slate-900 p-4 rounded border border-slate-700">
                    <h3 className="text-sm font-medium text-white mb-4">Choose Template</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p-4 rounded text-center transition-all border ${
                              selectedTemplate === template.id
                                ? 'border-blue-500 bg-blue-500/20 text-white'
                                : 'border-slate-600 bg-slate-700 hover:bg-slate-600 text-gray-300'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-2xl">{template.icon}</span>
                              <div>
                                <h4 className="text-sm font-medium">{template.name}</h4>
                                <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Project List */
              <div>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading projects...</span>
                    </div>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <button
                        key={project.name}
                        onClick={() => handleProjectSelect(project.name)}
                        className="group w-full p-3 bg-slate-900 hover:bg-slate-700 rounded border border-slate-700 hover:border-slate-600 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-sm font-semibold text-white">
                            {project.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{getProjectDisplayName(project)}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                              <span>Modified: {formatDate(project.lastModified)}</span>
                              <span>Created: {formatDate(project.created)}</span>
                            </div>
                          </div>
                          <Icons.ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <Icons.Folder className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-white mb-2">No projects found</h4>
                    <p className="text-xs text-gray-400 mb-6">Create your first project to get started</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors mx-auto"
                    >
                      <Icons.Plus className="w-4 h-4" />
                      Create Project
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fixed Actions Bar - only show when creating */}
          {showCreateForm && (
            <div className="flex-shrink-0 p-4 border-t border-slate-700 bg-slate-800">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || creating}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  {creating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Icons.Plus className="w-3 h-3" />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}