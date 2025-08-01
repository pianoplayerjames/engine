import BottomTabs from '@/plugins/editor/components/bottomPanel/BottomTabs';
import AssetLibrary from '@/plugins/editor/components/bottomPanel/AssetLibrary';
import ScriptsPanel from '@/plugins/editor/components/bottomPanel/ScriptsPanel';
import NodeEditor from '@/plugins/editor/components/bottomPanel/NodeEditor';
import ConsolePanel from '@/plugins/editor/components/bottomPanel/ConsolePanel';
import TerrainPanel from '@/plugins/editor/components/bottomPanel/TerrainPanel';
import PhotoPropertiesPanel from '@/plugins/editor/components/bottomPanel/PhotoPropertiesPanel';
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
      case 'node-editor':
        return <NodeEditor />;
      case 'console':
        return <ConsolePanel />;
      case 'terrain':
        return <TerrainPanel />;
      case 'photo-properties':
        return <PhotoPropertiesPanel />;
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