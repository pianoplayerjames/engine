import { useState, useCallback } from 'react';

export const usePanelResize = (editorActions) => {
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const {
    setBottomPanelHeight,
    setRightPanelWidth,
    setIsAssetPanelOpen,
    setIsScenePanelOpen,
    setIsResizingPanels,
    setSelectedTool: setSelectedRightTool
  } = editorActions;

  // Bottom panel resize handlers
  const handleBottomResizeStart = useCallback(() => {
    setIsResizingBottom(true);
    setIsResizingPanels(true);
    document.body.classList.add('dragging-vertical');
  }, [setIsResizingPanels]);

  const handleBottomResizeMove = useCallback((e, { isAssetPanelOpen }) => {
    if (!isResizingBottom) return;
    e.preventDefault();
    
    const newHeight = window.innerHeight - e.clientY;
    const maxHeight = window.innerHeight * 0.85; // Allow up to 85% of viewport height
    const snapThreshold = 80; // Snap to hidden when within 80px of bottom edge
    const openThreshold = 120; // Snap to open when dragged up 120px
    
    if (!isAssetPanelOpen && newHeight > openThreshold) {
      setIsAssetPanelOpen(true);
      setBottomPanelHeight(Math.max(200, newHeight));
    } else if (isAssetPanelOpen && newHeight < snapThreshold) {
      setIsAssetPanelOpen(false);
      setIsResizingBottom(false);
    } else if (isAssetPanelOpen) {
      const constrainedHeight = Math.max(40, Math.min(maxHeight, newHeight));
      setBottomPanelHeight(constrainedHeight);
    }
  }, [isResizingBottom, setIsAssetPanelOpen, setBottomPanelHeight]);

  const handleBottomResizeEnd = useCallback(() => {
    setIsResizingBottom(false);
    setIsResizingPanels(false);
    document.body.classList.remove('dragging-vertical');
  }, [setIsResizingPanels]);

  // Right panel resize handlers
  const handleRightResizeStart = useCallback(() => {
    setIsResizingRight(true);
    setIsResizingPanels(true);
    document.body.classList.add('dragging-horizontal');
  }, [setIsResizingPanels]);

  const handleRightResizeMove = useCallback((e, { isScenePanelOpen }) => {
    if (!isResizingRight) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const snapThreshold = 100; // Snap to hidden when within 100px of edge
    const openThreshold = 150; // Snap to open when dragged left 150px
    
    if (!isScenePanelOpen && newWidth > openThreshold) {
      setIsScenePanelOpen(true);
      setRightPanelWidth(Math.max(200, newWidth));
      setSelectedRightTool('scene'); // Activate scene tab when opening via resize
    } else if (isScenePanelOpen && newWidth < snapThreshold) {
      setIsScenePanelOpen(false);
      setIsResizingRight(false);
      setSelectedRightTool('select'); // Deactivate menu when closing via resize
    } else if (isScenePanelOpen) {
      setRightPanelWidth(Math.max(200, Math.min(600, newWidth)));
    }
  }, [isResizingRight, setIsScenePanelOpen, setRightPanelWidth, setSelectedRightTool]);

  const handleRightResizeEnd = useCallback(() => {
    setIsResizingRight(false);
    setIsResizingPanels(false);
    document.body.classList.remove('dragging-horizontal');
  }, [setIsResizingPanels]);

  return {
    isResizingBottom,
    isResizingRight,
    handleBottomResizeStart,
    handleBottomResizeMove,
    handleBottomResizeEnd,
    handleRightResizeStart,
    handleRightResizeMove,
    handleRightResizeEnd
  };
};