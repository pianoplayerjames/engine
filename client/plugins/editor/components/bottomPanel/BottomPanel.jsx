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
import LightingPanel from '@/plugins/editor/components/lighting/LightingPanel';
import PhysicsPanel from '@/plugins/editor/components/bottomPanel/PhysicsPanel';
import EffectsPanel from '@/plugins/editor/components/bottomPanel/EffectsPanel';
import ChannelMixer from '@/plugins/editor/components/bottomPanel/ChannelMixer';
import MediaBin from '@/plugins/editor/components/bottomPanel/MediaBin';
import VideoTimeline from '@/plugins/editor/components/bottomPanel/VideoTimeline';
import ColorGrading from '@/plugins/editor/components/bottomPanel/ColorGrading';
import AudioTracks from '@/plugins/editor/components/bottomPanel/AudioTracks';
import PhotoPropertiesPanel from '@/plugins/editor/components/bottomPanel/PhotoPropertiesPanel';
import ChannelsPanel from '@/plugins/editor/components/bottomPanel/ChannelsPanel';
import PathsPanel from '@/plugins/editor/components/bottomPanel/PathsPanel';
import ActionsPanel from '@/plugins/editor/components/bottomPanel/ActionsPanel';
import InfoPanel from '@/plugins/editor/components/bottomPanel/InfoPanel';

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
      case 'effects':
        return <EffectsPanel />;
      case 'mixer':
        return <ChannelMixer />;
      case 'media-bin':
        return <MediaBin />;
      case 'video-timeline':
        return <VideoTimeline />;
      case 'color-grading':
        return <ColorGrading />;
      case 'audio-tracks':
        return <AudioTracks />;
      case 'photo-properties':
        return <PhotoPropertiesPanel />;
      case 'channels':
        return <ChannelsPanel />;
      case 'paths':
        return <PathsPanel />;
      case 'actions':
        return <ActionsPanel />;
      case 'info':
        return <InfoPanel />;
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