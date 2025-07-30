import React, { useState, useRef, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { Icons } from '@/plugins/editor/components/Icons';
import { editorState, editorActions } from '@/plugins/editor/store.js';
import { projectManager } from '@/plugins/projects/projectManager.js';

const PhotoEditor = () => {
  const { ui } = useSnapshot(editorState);
  const { photoEditor, selectedTool } = ui;
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
  
  // Get current tool from the main toolbar via selectedTool or photo editor state
  const currentTool = photoEditor?.selectedTool || selectedTool || 'move';
  
  // Get image and zoom from store state
  const image = photoEditor?.image;
  const zoom = photoEditor?.zoom || 100;

  const loadImageFromFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      console.warn('Invalid file type. Please select an image file.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const imageData = {
          src: event.target.result,
          width: img.width,
          height: img.height,
          element: img
        };
        
        // Save to store instead of local state
        if (editorActions.setPhotoEditorImage) {
          editorActions.setPhotoEditorImage(imageData);
        }
        
        // Draw image on canvas with a slight delay to ensure canvas is ready
        setTimeout(() => {
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Clear canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw image
            ctx.drawImage(img, 0, 0);
          }
        }, 10);
        
        // Image data is already saved to store above
      };
      
      img.onerror = (error) => {
        console.error('Error loading image:', error);
      };
      
      img.src = event.target.result;
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    
    reader.readAsDataURL(file);
  };

  const loadImageFromAssetPath = async (assetPath, assetName) => {
    try {
      const currentProject = projectManager.getCurrentProject();
      if (!currentProject.name) {
        console.error('No project loaded');
        return;
      }
      
      const imageUrl = `/api/projects/${currentProject.name}/assets/file/${encodeURIComponent(assetPath)}`;
      console.log('Loading image from asset:', imageUrl);
      
      const img = new Image();
      img.onload = () => {
        console.log('Asset image loaded:', img.width, img.height);
        const imageData = {
          src: imageUrl,
          width: img.width,
          height: img.height,
          element: img,
          assetPath: assetPath,
          assetName: assetName
        };
        
        // Save to store instead of local state
        if (editorActions.setPhotoEditorImage) {
          editorActions.setPhotoEditorImage(imageData);
        }
        
        // Draw image on canvas with a slight delay to ensure canvas is ready
        setTimeout(() => {
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Clear canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw image
            ctx.drawImage(img, 0, 0);
          }
        }, 10);
        
        // Image data is already saved to store above
      };
      
      img.onerror = (error) => {
        console.error('Error loading asset image:', error);
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Error loading image from asset path:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      loadImageFromFile(file);
    }
  };

  // Restore canvas when component mounts with existing image
  useEffect(() => {
    if (image && image.src && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Clear canvas first
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw image
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = image.src;
    }
  }, [image?.src]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const panStep = 50;
      const zoomStep = 10;

      switch (e.key.toLowerCase()) {
        // Pan with arrow keys
        case 'arrowleft':
          e.preventDefault();
          setPanX(prev => prev + panStep);
          break;
        case 'arrowright':
          e.preventDefault();
          setPanX(prev => prev - panStep);
          break;
        case 'arrowup':
          e.preventDefault();
          setPanY(prev => prev + panStep);
          break;
        case 'arrowdown':
          e.preventDefault();
          setPanY(prev => prev - panStep);
          break;
        
        // Zoom shortcuts
        case '+':
        case '=':
          e.preventDefault();
          handleZoomChange(Math.min(500, zoom + zoomStep));
          break;
        case '-':
          e.preventDefault();
          handleZoomChange(Math.max(10, zoom - zoomStep));
          break;
        case '0':
          e.preventDefault();
          handleZoomChange(100);
          setPanX(0);
          setPanY(0);
          break;
        
        // Fit to screen
        case 'f':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            fitToScreen();
          }
          break;
        
        // Actual size
        case '1':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleZoomChange(100);
            centerImage();
          }
          break;
      }
    };

    const handleKeyUp = (e) => {
      // Stop panning when releasing space
      if (e.key === ' ') {
        setIsDragging(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [zoom, panX, panY, image]);

  // Mouse event listeners for drag panning
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Mouse wheel zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      const newZoom = Math.max(10, Math.min(500, zoom + delta));
      handleZoomChange(newZoom);
    }
  };

  // Mouse drag panning
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && (currentTool === 'hand' || e.spaceKey))) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        panX: panX,
        panY: panY
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPanX(dragStart.panX + deltaX);
      setPanY(dragStart.panY + deltaY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Utility functions
  const fitToScreen = () => {
    if (!image || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 40; // padding
    const containerHeight = container.clientHeight - 40; // padding
    
    const scaleX = containerWidth / image.width;
    const scaleY = containerHeight / image.height;
    const newZoom = Math.min(scaleX, scaleY) * 100;
    
    handleZoomChange(Math.max(10, Math.min(500, newZoom)));
    centerImage();
  };

  const centerImage = () => {
    setPanX(0);
    setPanY(0);
  };

  const handleZoomChange = (newZoom) => {
    if (editorActions.setPhotoEditorZoom) {
      editorActions.setPhotoEditorZoom(newZoom);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide drag overlay if leaving the main container
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Check if this is an asset drag from the asset library
    const isAssetDrag = e.dataTransfer.getData('application/x-asset-drag') === 'true';
    
    if (isAssetDrag) {
      try {
        const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
        console.log('Asset dropped:', dragData);
        
        // Only handle image assets
        if (dragData.category === 'textures' || 
            (dragData.extension && ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tga'].includes(dragData.extension.toLowerCase()))) {
          
          // Load image from asset path
          loadImageFromAssetPath(dragData.path, dragData.name);
        } else {
          console.warn('Only image assets can be dropped on the photo editor');
        }
      } catch (error) {
        console.error('Error parsing asset drag data:', error);
      }
    } else {
      // Handle regular file drops
      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find(file => file.type.startsWith('image/'));
      
      if (imageFile) {
        loadImageFromFile(imageFile);
      } else {
        console.warn('No valid image file found in dropped items.');
      }
    }
  };

  return (
    <div 
      className="w-full h-full bg-gray-900 flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
          <button 
            onClick={fitToScreen}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300" 
            title="Fit to Screen (F)"
          >
            <Icons.ArrowsPointingOut className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              handleZoomChange(100);
              centerImage();
            }}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300" 
            title="Actual Size (1)"
          >
            <Icons.Square className="w-4 h-4" />
          </button>
          <button 
            onClick={centerImage}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300" 
            title="Center Image"
          >
            <Icons.Target className="w-4 h-4" />
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
        <div 
          ref={containerRef}
          className={`flex-1 bg-gray-850 flex items-center justify-center overflow-hidden relative ${
            isDragging ? 'cursor-grabbing' : currentTool === 'hand' ? 'cursor-grab' : 'cursor-default'
          }`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="relative" 
            style={{ 
              transform: `translate(${panX}px, ${panY}px) scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
          >
            {image ? (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-600 bg-white block"
                  style={{ 
                    display: 'block',
                    maxWidth: 'none',
                    maxHeight: 'none'
                  }}
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
                <div className="text-gray-500 text-sm">Upload an image or drag & drop to start editing</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag & Drop Overlay - Covers entire viewport */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-600/20 border-4 border-dashed border-blue-400 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="text-center">
            <Icons.Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <div className="text-blue-400 text-xl font-semibold mb-2">Drop Image Here</div>
            <div className="text-blue-300 text-sm">Release to load image into editor</div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-8 bg-gray-800 border-t border-gray-700 flex items-center px-4 text-xs text-gray-400">
        <span>Tool: {currentTool}</span>
        {image && (
          <>
            <span className="mx-4">|</span>
            <span>Size: {image.width} × {image.height}px</span>
            <span className="mx-4">|</span>
            <span>Zoom: {zoom}%</span>
            <span className="mx-4">|</span>
            <span>Pan: {Math.round(panX)}, {Math.round(panY)}</span>
          </>
        )}
        <span className="ml-auto text-gray-500">
          Shortcuts: F(fit) • 1(actual) • 0(reset) • ±(zoom) • ↑↓←→(pan) • Middle-drag/Hand tool(pan) • Ctrl+wheel(zoom)
        </span>
      </div>
    </div>
  );
};

export default PhotoEditor;