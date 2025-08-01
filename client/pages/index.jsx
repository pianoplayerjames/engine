import { useEffect, useCallback, Suspense } from 'react'
// AssetsPlugin removed - using Babylon.js native asset loading
import EditorPlugin from '@/plugins/editor/index.jsx'
import ProjectsPlugin from '@/plugins/projects/index.jsx'
import LoadingProvider from '@/plugins/projects/components/LoadingProvider.jsx'
import EngineLoader from '@/plugins/core/SimpleEngineLoader.jsx'
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
    <Suspense>
      <EngineLoader onLoadComplete={handleLoadComplete}>
        <LoadingProvider>
          <EditorPlugin />
          <ProjectsPlugin />
        </LoadingProvider>
      </EngineLoader>
    </Suspense>
  )
}