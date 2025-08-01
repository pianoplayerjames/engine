import { useSnapshot } from 'valtio'
import { editorState } from '@/plugins/editor/store.js'
import { projectManager } from '../projectManager.js'

export default function ProjectIndicator() {
  const currentProject = projectManager.getCurrentProject()
  const { ui, panels } = useSnapshot(editorState)
  const { bottomPanelHeight } = ui
  const { isAssetPanelOpen } = panels

  // Early return after all hooks are called
  if (!currentProject.name) {
    return null
  }

  return (
    <div 
      className="absolute pointer-events-auto z-10 no-select"
      style={{
        left: 8,
        bottom: isAssetPanelOpen ? bottomPanelHeight + 8 : 48
      }}
    >
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded px-2 py-1">
        <span className="text-xs text-gray-400">{currentProject.name}</span>
      </div>
    </div>
  )
}