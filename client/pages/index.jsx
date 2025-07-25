

import RenderPlugin from '../plugins/render/index.jsx'
import InputPlugin from '../plugins/input/index.jsx'
import AudioPlugin from '../plugins/audio/index.jsx'
import TimePlugin from '../plugins/time/index.jsx'
import ScenePlugin from '../plugins/scene/index.jsx'
import PhysicsPlugin from '../plugins/physics/index.jsx'
import AssetsPlugin from '../plugins/assets/index.jsx'
import EditorPlugin from '../plugins/editor/index.jsx'
import { useEditorStore } from '../plugins/editor/store.js'

export default function Index() {
  console.log('Engine starting...')

  return (
    <>
      {/* Core Engine Plugins */}
      <InputPlugin />
      <AudioPlugin />
      <TimePlugin />
      <ScenePlugin />
      <PhysicsPlugin />
      <AssetsPlugin />
      <EditorPlugin />
      
      {/* Render Plugin with Scene Content */}
      <RenderPlugin>
        {/* Basic test cube */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        
        {/* Ground plane */}
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      </RenderPlugin>
    </>
  )
}