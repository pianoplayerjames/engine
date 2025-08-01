import { useSnapshot } from 'valtio'
import { globalStore } from '@/store.js'

// Specific snapshot hooks to prevent unnecessary re-renders
// Following Valtio best practices for minimal snapshot access

// Editor-specific snapshots
export const useEditorUI = () => {
  const snap = useSnapshot(globalStore.editor.ui)
  return snap
}

export const useEditorPanels = () => {
  const snap = useSnapshot(globalStore.editor.panels)
  return snap
}

export const useEditorCamera = () => {
  const snap = useSnapshot(globalStore.editor.camera)
  return snap
}

export const useEditorViewport = () => {
  const snap = useSnapshot(globalStore.editor.viewport)
  return snap
}

export const useEditorSelection = () => {
  const snap = useSnapshot(globalStore.editor.selection)
  return snap
}

export const useEditorSettings = () => {
  const snap = useSnapshot(globalStore.editor.settings)
  return snap
}

export const useEditorConsole = () => {
  const snap = useSnapshot(globalStore.editor.console)
  return snap
}

// Scene-specific snapshots
export const useActiveScene = () => {
  const activeSceneId = useSnapshot(globalStore.scene).activeSceneId
  const scenes = useSnapshot(globalStore.scene.scenes)
  return scenes[activeSceneId]
}

export const useSceneList = () => {
  const snap = useSnapshot(globalStore.scene.scenes)
  return snap
}

export const useSceneSelection = () => {
  const snap = useSnapshot(globalStore.scene)
  return {
    selectedEntity: snap.selectedEntity,
    sceneRoot: snap.sceneRoot
  }
}

// Specific scene object hooks
export const useSceneObjects = (sceneId) => {
  const scenes = useSnapshot(globalStore.scene.scenes)
  return scenes[sceneId]?.objects || []
}

// Render-specific snapshots
export const useRenderCamera = () => {
  const snap = useSnapshot(globalStore.render.camera)
  return snap
}

export const useRenderLighting = () => {
  const snap = useSnapshot(globalStore.render.lighting)
  return snap
}

export const useRenderEnvironment = () => {
  const snap = useSnapshot(globalStore.render.environment)
  return snap
}

export const useRenderSettings = () => {
  const snap = useSnapshot(globalStore.render.settings)
  return snap
}

export const useRenderPerformance = () => {
  const snap = useSnapshot(globalStore.render.performance)
  return snap
}

// Assets-specific snapshots
export const useAssetsLoading = () => {
  const snap = useSnapshot(globalStore.assets.loading)
  return snap
}

export const useAssetsProgress = () => {
  const snap = useSnapshot(globalStore.assets.loading.progress)
  return snap
}

export const useAssetsByType = (type) => {
  const snap = useSnapshot(globalStore.assets.assets)
  return snap[`${type}s`] || {}
}

export const useAssetsMetadata = () => {
  const snap = useSnapshot(globalStore.assets.metadata)
  return snap
}

// Viewport-specific snapshots
export const useViewportTabs = () => {
  const snap = useSnapshot(globalStore.editor.viewport)
  return {
    tabs: snap.tabs,
    activeTabId: snap.activeTabId,
    nextTabId: snap.nextTabId,
    instanceCounters: snap.instanceCounters
  }
}

export const useActiveViewportTab = () => {
  const viewport = useSnapshot(globalStore.editor.viewport)
  return viewport.tabs.find(tab => tab.id === viewport.activeTabId)
}



// Toolbar and UI element snapshots
export const useToolbarState = () => {
  const snap = useSnapshot(globalStore.editor.ui)
  return {
    selectedTool: snap.selectedTool,
    toolbarTabOrder: snap.toolbarTabOrder,
    toolbarBottomTabOrder: snap.toolbarBottomTabOrder
  }
}

export const useBottomTabsState = () => {
  const snap = useSnapshot(globalStore.editor.ui)
  return {
    selectedBottomTab: snap.selectedBottomTab,
    bottomTabOrder: snap.bottomTabOrder
  }
}

export const useWorkflowState = () => {
  const snap = useSnapshot(globalStore.editor.ui.workflow)
  return snap
}

// Panel size snapshots for resize operations
export const usePanelSizes = () => {
  const snap = useSnapshot(globalStore.editor.ui)
  return {
    rightPanelWidth: snap.rightPanelWidth,
    bottomPanelHeight: snap.bottomPanelHeight,
    scenePropertiesHeight: snap.scenePropertiesHeight,
    assetsLibraryWidth: snap.assetsLibraryWidth
  }
}

// Performance-optimized hook for checking if panels are resizing
export const usePanelResizing = () => {
  const snap = useSnapshot(globalStore.editor.panels)
  return snap.isResizingPanels
}

// Global store snapshot (use sparingly)
export const useGlobalStore = () => {
  console.warn('useGlobalStore: Using full store snapshot may cause performance issues. Consider using specific hooks instead.')
  return useSnapshot(globalStore)
}

export default {
  useEditorUI,
  useEditorPanels,
  useEditorCamera,
  useEditorViewport,
  useEditorSelection,
  useEditorSettings,
  useEditorConsole,
  useActiveScene,
  useSceneList,
  useSceneSelection,
  useSceneObjects,
  useRenderCamera,
  useRenderLighting,
  useRenderEnvironment,
  useRenderSettings,
  useRenderPerformance,
  useAssetsLoading,
  useAssetsProgress,
  useAssetsByType,
  useAssetsMetadata,
  useViewportTabs,
  useActiveViewportTab,
  useToolbarState,
  useBottomTabsState,
  useWorkflowState,
  usePanelSizes,
  usePanelResizing,
  useGlobalStore
}