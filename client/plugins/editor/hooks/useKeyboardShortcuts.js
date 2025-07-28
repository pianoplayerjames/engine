import { useEffect } from 'react';

export const useKeyboardShortcuts = (selectedObject, editorActions) => {
  const { removeSceneObject, setSelectedObject, setTransformMode } = editorActions;

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected object when Delete key is pressed
      if (e.key === 'Delete' && selectedObject) {
        removeSceneObject(selectedObject);
        setSelectedObject(null);
        setTransformMode('select');
      }
      
      // Add more keyboard shortcuts here
      switch (e.key) {
        case 'Escape':
          // Deselect object
          if (selectedObject) {
            setSelectedObject(null);
            setTransformMode('select');
          }
          break;
        case 'g':
        case 'G':
          if (selectedObject && !e.ctrlKey && !e.metaKey) {
            setTransformMode('move');
          }
          break;
        case 'r':
        case 'R':
          if (selectedObject && !e.ctrlKey && !e.metaKey) {
            setTransformMode('rotate');
          }
          break;
        case 's':
        case 'S':
          if (selectedObject && !e.ctrlKey && !e.metaKey) {
            setTransformMode('scale');
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedObject, removeSceneObject, setSelectedObject, setTransformMode]);
};