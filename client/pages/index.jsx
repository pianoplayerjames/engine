import { useEffect, useCallback, Suspense } from 'react'
import EditorPlugin from '@/plugins/editor/index.jsx'
import ProjectsPlugin from '@/plugins/projects/index.jsx'
import LoadingProvider from '@/plugins/projects/components/LoadingProvider.jsx'
import EngineLoader from '@/plugins/core/SimpleEngineLoader.jsx'

export default function Index() {
  useEffect(() => {
    console.log('Engine starting...')
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