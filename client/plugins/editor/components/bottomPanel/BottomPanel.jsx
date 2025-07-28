import React from 'react';
import BottomTabs from '@/plugins/editor/components/bottomPanel/BottomTabs';
import AssetLibrary from '@/plugins/editor/components/bottomPanel/AssetLibrary';
import ScriptsPanel from '@/plugins/editor/components/bottomPanel/ScriptsPanel';
import AnimationPanel from '@/plugins/editor/components/bottomPanel/AnimationPanel';
import NodeEditor from '@/plugins/editor/components/bottomPanel/NodeEditor';
import TimelinePanel from '@/plugins/editor/components/bottomPanel/TimelinePanel';
import ConsolePanel from '@/plugins/editor/components/bottomPanel/ConsolePanel';
import MaterialsPanel from '@/plugins/editor/components/bottomPanel/MaterialsPanel';
import TerrainPanel from '@/plugins/editor/components/bottomPanel/TerrainPanel';
import LightingPanel from '@/plugins/editor/components/bottomPanel/LightingPanel';
import PhysicsPanel from '@/plugins/editor/components/bottomPanel/PhysicsPanel';
import AudioPanel from '@/plugins/editor/components/bottomPanel/AudioPanel';
import EffectsPanel from '@/plugins/editor/components/bottomPanel/EffectsPanel';

const BottomPanel = ({
  activeTab,
  isAssetPanelOpen,
  bottomPanelHeight,
  rightPanelWidth,
  isScenePanelOpen,
  onTabChange,
  onToggleAssetPanel,
  onContextMenu,
  style = {}
}) => {
  const renderPanelContent = () => {
    if (!isAssetPanelOpen) return null;

    const panelStyle = { height: bottomPanelHeight - 40 };

    switch (activeTab) {
      case 'assets':
        return <AssetLibrary onContextMenu={onContextMenu} />;
      case 'scripts':
        return <ScriptsPanel />;
      case 'animation':
        return <AnimationPanel />;
      case 'node-editor':
        return <NodeEditor />;
      case 'timeline':
        return <TimelinePanel />;
      case 'console':
        return <ConsolePanel />;
      case 'materials':
        return <MaterialsPanel />;
      case 'terrain':
        return <TerrainPanel />;
      case 'lighting':
        return <LightingPanel />;
      case 'physics':
        return <PhysicsPanel />;
      case 'audio':
        return <AudioPanel />;
      case 'effects':
        return <EffectsPanel />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="absolute bottom-0 left-0 pointer-events-auto no-select z-10"
      style={{
        right: isScenePanelOpen ? rightPanelWidth - 4 : 48,
        height: isAssetPanelOpen ? bottomPanelHeight : 40,
        ...style
      }}
      suppressHydrationWarning
    >
      <BottomTabs 
        activeTab={activeTab}
        onTabChange={(tabId) => {
          onTabChange(tabId);
          if (!isAssetPanelOpen) {
            onToggleAssetPanel(true);
          }
        }}
        isAssetPanelOpen={isAssetPanelOpen}
        onToggleAssetPanel={onToggleAssetPanel}
        rightPanelWidth={rightPanelWidth}
        isScenePanelOpen={isScenePanelOpen}
      />
      
      {isAssetPanelOpen && (
        <div className="flex-1 bg-gray-900 overflow-hidden" style={{ height: bottomPanelHeight - 40 }}>
          {renderPanelContent()}
        </div>
      )}
    </div>
  );
};

export default BottomPanel;