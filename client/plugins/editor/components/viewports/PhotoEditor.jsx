import React, { useState, useRef, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { Icons } from '@/plugins/editor/components/Icons';
import { editorState, editorActions } from '@/plugins/editor/store.js';

const PhotoEditor = () => {
  const { ui } = useSnapshot(editorState);
  const { photoEditor, selectedTool } = ui;
  
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(100);
  
  // Get current tool from the main toolbar via selectedTool or photo editor state
  const currentTool = photoEditor?.selectedTool || selectedTool || 'move';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage({
            src: event.target.result,
            width: img.width,
            height: img.height,
            element: img
          });
          
          // Draw image on canvas
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync zoom with photo editor state
  useEffect(() => {
    if (photoEditor?.zoom && photoEditor.zoom !== zoom) {
      setZoom(photoEditor.zoom);
    }
  }, [photoEditor?.zoom]);

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    if (editorActions.setPhotoEditorZoom) {
      editorActions.setPhotoEditorZoom(newZoom);
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Photo Editor Toolbar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
        {/* File Operations */}
        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors cursor-pointer flex items-center gap-2">
            <Icons.Upload className="w-4 h-4" />
            Open Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          
          <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-2">
            <Icons.Save className="w-4 h-4" />
            Save
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Icons.MagnifyingGlass className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="10"
            max="500"
            value={zoom}
            onChange={(e) => handleZoomChange(parseInt(e.target.value))}
            className="w-20 h-1 bg-gray-600 rounded appearance-none slider"
          />
          <span className="text-gray-400 text-sm w-12">{zoom}%</span>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300" title="Fit to Screen">
            <Icons.ArrowsPointingOut className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300" title="Actual Size">
            <Icons.Square className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300" title="Show Rulers">
            <Icons.Ruler className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300" title="Show Grid">
            <Icons.Grid className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 ml-auto">
          <button className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300" title="Undo">
            <Icons.Undo className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300" title="Redo">
            <Icons.Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 bg-gray-850 flex items-center justify-center overflow-auto">
          <div className="relative" style={{ transform: `scale(${zoom / 100})` }}>
            {image ? (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-600 bg-white"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
                
                {/* Canvas Overlay for tools */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Selection overlay, guides, etc. would go here */}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Icons.Photo className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-2">No Image Loaded</div>
                <div className="text-gray-500 text-sm">Upload an image to start editing</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-gray-800 border-t border-gray-700 flex items-center px-4 text-xs text-gray-400">
        <span>Tool: {currentTool}</span>
        {image && (
          <>
            <span className="mx-4">|</span>
            <span>Size: {image.width} × {image.height}px</span>
            <span className="mx-4">|</span>
            <span>Zoom: {zoom}%</span>
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoEditor;