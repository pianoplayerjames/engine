import Toolbar from '@/plugins/editor/components/ui/Toolbar';
import ScenePanel from '@/plugins/editor/components/propertiesPanel/ScenePanel';

const RightPanel = ({
  isScenePanelOpen,
  rightPanelWidth,
  bottomPanelHeight,
  isAssetPanelOpen,
  selectedRightTool,
  selectedObject,
  onToolSelect,
  onScenePanelToggle,
  onObjectSelect,
  onContextMenu,
  style = {}
}) => {
  return (
    <div 
      className="absolute right-0 top-0 bottom-0 pointer-events-auto no-select z-20"
      style={{ 
        width: isScenePanelOpen ? rightPanelWidth : 48,
        paddingBottom: isAssetPanelOpen ? bottomPanelHeight : 40,
        ...style
      }}
      suppressHydrationWarning
    >
      <div 
        className={`absolute top-0 bottom-0 w-12 ${isScenePanelOpen ? 'left-1' : 'left-0'}`}
      >
        <Toolbar 
          selectedTool={selectedRightTool}
          onToolSelect={onToolSelect}
          scenePanelOpen={isScenePanelOpen}
          onScenePanelToggle={onScenePanelToggle}
        />
      </div>
      
      {isScenePanelOpen && (
        <div className="absolute left-13 right-0 top-0 bottom-0">
          <ScenePanel 
            selectedObject={selectedObject}
            onObjectSelect={onObjectSelect}
            isOpen={isScenePanelOpen}
            onToggle={onScenePanelToggle}
            selectedTool={selectedRightTool}
            onToolSelect={onToolSelect}
            onContextMenu={onContextMenu}
          />
        </div>
      )}
    </div>
  );
};

export default RightPanel;