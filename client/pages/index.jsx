import { useEffect, useCallback } from 'react'
import AssetsPlugin from '@/plugins/assets/index.jsx'
import EditorPlugin from '@/plugins/editor/index.jsx'
import ProjectsPlugin from '@/plugins/projects/index.jsx'
import LoadingProvider from '@/plugins/projects/components/LoadingProvider.jsx'
import EngineLoader from '@/plugins/core/EngineLoader.jsx'
import statsManager from '@/plugins/editor/utils/statsManager.js'

export default function Index() {
  useEffect(() => {
    console.log('Engine starting...')
    statsManager.init();
    console.log('StatsManager initialized from main index');
  }, []);

  const handleLoadComplete = useCallback(() => {
    console.log('🎮 Renzora Engine UI ready!')
  }, []);

  return (
    <EngineLoader onLoadComplete={handleLoadComplete}>
      <LoadingProvider>
        <AssetsPlugin />
        <EditorPlugin />
        <ProjectsPlugin />
      </LoadingProvider>
    </EngineLoader>
  )
}