

import React, { useEffect, useCallback } from 'react'
import InputPlugin from '@/plugins/input/index.jsx'
import AudioPlugin from '@/plugins/audio/index.jsx'
import TimePlugin from '@/plugins/time/index.jsx'
import ScenePlugin from '@/plugins/scene/index.jsx'
import PhysicsPlugin from '@/plugins/physics/index.jsx'
import AssetsPlugin from '@/plugins/assets/index.jsx'
import EditorPlugin from '@/plugins/editor/index.jsx'
import ProjectsPlugin from '@/plugins/projects/index.jsx'
import LoadingProvider from '@/plugins/projects/components/LoadingProvider.jsx'
import EngineLoader from '@/plugins/core/EngineLoader.jsx'
import statsManager from '@/plugins/editor/utils/statsManager.js'

export default function Index() {
  useEffect(() => {
    console.log('Engine starting...')
    
    // Initialize stats manager
    statsManager.init();
    console.log('StatsManager initialized from main index');
  }, []);

  // Memoize the callback to prevent engine restarts on every render
  const handleLoadComplete = useCallback(() => {
    console.log('🎮 Renzora Engine UI ready!')
  }, []);

  return (
    <EngineLoader
      showSplash={false} // Disable brand splash for fastest loading
      showProjectSelection={true} // Enable project selection splash
      onLoadComplete={handleLoadComplete}
    >
      <LoadingProvider>
        <InputPlugin />
        <AudioPlugin />
        <TimePlugin />
        <ScenePlugin />
        <PhysicsPlugin />
        <AssetsPlugin />
        <EditorPlugin />
        <ProjectsPlugin />
        
        {/* 3D Viewport now handled in EditorLayout */}
      </LoadingProvider>
    </EngineLoader>
  )
}