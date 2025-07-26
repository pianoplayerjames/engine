// plugins/editor/components/Toolbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { useEditorStore } from '../store.js';

const defaultTools = [
  { id: 'scene', icon: Icons.Scene, title: 'Scene' },
  { id: 'light', icon: Icons.Light, title: 'Light' },
  { id: 'effects', icon: Icons.Effects, title: 'Effects' },
  { id: 'folder', icon: Icons.FolderOpen, title: 'Folder' },
  { id: 'star', icon: Icons.Star, title: 'Favorites' },
  { id: 'wifi', icon: Icons.Wifi, title: 'Network' },
  { id: 'cloud', icon: Icons.Cloud, title: 'Cloud' },
  { id: 'monitor', icon: Icons.Monitor, title: 'Display' },
];

const defaultBottomTools = [
  { id: 'add', icon: Icons.PlusCircle, title: 'Add' },
  { id: 'settings', icon: Icons.Settings, title: 'Settings' },
];

function Toolbar({ selectedTool, onToolSelect, scenePanelOpen, onScenePanelToggle }) {
  const { toolbarTabOrder, toolbarBottomTabOrder, setToolbarTabOrder, setToolbarBottomTabOrder } = useEditorStore();
  
  // Create ordered tools based on stored order
  const getOrderedTools = () => {
    const toolsMap = defaultTools.reduce((map, tool) => {
      map[tool.id] = tool;
      return map;
    }, {});
    return toolbarTabOrder.map(id => toolsMap[id]).filter(Boolean);
  };
  
  const getOrderedBottomTools = () => {
    const toolsMap = defaultBottomTools.reduce((map, tool) => {
      map[tool.id] = tool;
      return map;
    }, {});
    return toolbarBottomTabOrder.map(id => toolsMap[id]).filter(Boolean);
  };
  
  const [tools, setTools] = useState(getOrderedTools());
  const [bottomTools, setBottomTools] = useState(getOrderedBottomTools());
  
  // Update tools when store order changes
  useEffect(() => {
    setTools(getOrderedTools());
  }, [toolbarTabOrder]);
  
  useEffect(() => {
    setBottomTools(getOrderedBottomTools());
  }, [toolbarBottomTabOrder]);
  
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedTool: null,
    dragOverTool: null,
    draggedFromBottom: false
  });

  // Drag and drop handlers
  const handleDragStart = (e, tool, isFromBottom = false) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    
    // Create custom drag image with background and border
    const dragElement = e.currentTarget.cloneNode(true);
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-1000px';
    dragElement.style.background = 'linear-gradient(to bottom, rgb(51 65 85 / 0.95), rgb(15 23 42 / 0.98))';
    dragElement.style.border = '1px solid rgb(148 163 184 / 0.5)';
    dragElement.style.borderRadius = '8px';
    dragElement.style.padding = '8px';
    dragElement.style.backdropFilter = 'blur(12px)';
    dragElement.style.boxShadow = '0 25px 50px -12px rgb(0 0 0 / 0.5)';
    dragElement.style.transform = 'scale(1.1)';
    dragElement.style.pointerEvents = 'none';
    
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 24, 24);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
    
    setDragState({
      isDragging: true,
      draggedTool: tool,
      dragOverTool: null,
      draggedFromBottom: isFromBottom
    });
  };

  const handleDragOver = (e, tool, isBottomArea = false) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragState.draggedTool && dragState.draggedTool.id !== tool.id) {
      setDragState(prev => ({ ...prev, dragOverTool: tool }));
    }
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setDragState(prev => ({ ...prev, dragOverTool: null }));
    }
  };

  const handleDrop = (e, dropTool, isBottomArea = false) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragState.draggedTool || dragState.draggedTool.id === dropTool.id) {
      setDragState({
        isDragging: false,
        draggedTool: null,
        dragOverTool: null,
        draggedFromBottom: false
      });
      return;
    }

    const sourceArray = dragState.draggedFromBottom ? bottomTools : tools;
    const targetArray = isBottomArea ? bottomTools : tools;
    const setSourceArray = dragState.draggedFromBottom ? setBottomTools : setTools;
    const setTargetArray = isBottomArea ? setBottomTools : setTools;

    // Handle cross-section movement (top tools <-> bottom tools)
    if (dragState.draggedFromBottom !== isBottomArea) {
      // Remove from source array
      const newSourceArray = sourceArray.filter(tool => tool.id !== dragState.draggedTool.id);
      setSourceArray(newSourceArray);
      
      // Add to target array at the dropped position
      const dropIndex = targetArray.findIndex(tool => tool.id === dropTool.id);
      const newTargetArray = [...targetArray];
      newTargetArray.splice(dropIndex, 0, dragState.draggedTool);
      setTargetArray(newTargetArray);
      
      // Persist both arrays to store
      if (dragState.draggedFromBottom) {
        // Moving from bottom to top
        setToolbarBottomTabOrder(newSourceArray.map(tool => tool.id));
        setToolbarTabOrder(newTargetArray.map(tool => tool.id));
      } else {
        // Moving from top to bottom
        setToolbarTabOrder(newSourceArray.map(tool => tool.id));
        setToolbarBottomTabOrder(newTargetArray.map(tool => tool.id));
      }
    } else {
      // Handle reordering within the same section
      const draggedIndex = sourceArray.findIndex(tool => tool.id === dragState.draggedTool.id);
      const dropIndex = sourceArray.findIndex(tool => tool.id === dropTool.id);
      
      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        const newArray = [...sourceArray];
        const [removed] = newArray.splice(draggedIndex, 1);
        newArray.splice(dropIndex, 0, removed);
        setSourceArray(newArray);
        
        // Persist to store
        const newOrder = newArray.map(tool => tool.id);
        if (dragState.draggedFromBottom === isBottomArea && isBottomArea) {
          setToolbarBottomTabOrder(newOrder);
        } else {
          setToolbarTabOrder(newOrder);
        }
      }
    }

    setDragState({
      isDragging: false,
      draggedTool: null,
      dragOverTool: null,
      draggedFromBottom: false
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedTool: null,
      dragOverTool: null,
      draggedFromBottom: false
    });
  };

  const handleToolClick = (tool) => {
    if (!dragState.isDragging) {
      if (!scenePanelOpen) {
        onScenePanelToggle();
      }
      onToolSelect(tool.id);
    }
  };

  return (
    <div className="relative w-12 h-full bg-gradient-to-b from-slate-800/95 to-slate-900/98 backdrop-blur-md border-l border-slate-700/80 shadow-2xl shadow-black/30 flex flex-col py-2 pointer-events-auto no-select">
      {/* Tools - made icons bigger */}
      <div className="flex flex-col space-y-1 px-1">
        {tools.map((tool) => {
          const isDragged = dragState.draggedTool?.id === tool.id;
          const isDragOver = dragState.dragOverTool?.id === tool.id;
          
          return (
            <button
              key={tool.id}
              draggable
              onClick={() => handleToolClick(tool)}
              onDragStart={(e) => handleDragStart(e, tool, false)}
              onDragOver={(e) => handleDragOver(e, tool, false)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tool, false)}
              onDragEnd={handleDragEnd}
              className={`p-2 rounded-lg transition-all duration-200 group relative select-none ${
                isDragged 
                  ? 'opacity-50 cursor-grabbing scale-95' 
                  : selectedTool === tool.id 
                    ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/40 scale-105 cursor-grab' 
                    : 'text-slate-400 hover:text-white hover:bg-gradient-to-b hover:from-slate-700/80 hover:to-slate-800/90 hover:shadow-md hover:shadow-black/30 hover:scale-102 cursor-grab'
              }`}
              title={tool.title}
            >
              <tool.icon className="w-6 h-6" />
              
              {/* Drop indicator */}
              {isDragOver && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500 rounded-full"></div>
              )}
              
              {/* Tooltip with border and arrow */}
              {!dragState.isDragging && (
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60] shadow-2xl">
                  {tool.title}
                  {/* Arrow pointing to the button */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-slate-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Spacer with drop zone */}
      <div 
        className="flex-1 flex items-center justify-center"
        onDragOver={(e) => {
          e.preventDefault();
          if (dragState.draggedTool) {
            e.dataTransfer.dropEffect = 'move';
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (dragState.draggedTool) {
            const sourceArray = dragState.draggedFromBottom ? bottomTools : tools;
            const setSourceArray = dragState.draggedFromBottom ? setBottomTools : setTools;
            const targetArray = dragState.draggedFromBottom ? tools : bottomTools;
            const setTargetArray = dragState.draggedFromBottom ? setTools : setBottomTools;
            
            // Remove from source and add to target
            const newSourceArray = sourceArray.filter(tool => tool.id !== dragState.draggedTool.id);
            setSourceArray(newSourceArray);
            
            const newTargetArray = [...targetArray, dragState.draggedTool];
            setTargetArray(newTargetArray);
            
            // Persist to store
            if (dragState.draggedFromBottom) {
              // Moving from bottom to top
              setToolbarBottomTabOrder(newSourceArray.map(tool => tool.id));
              setToolbarTabOrder(newTargetArray.map(tool => tool.id));
            } else {
              // Moving from top to bottom
              setToolbarTabOrder(newSourceArray.map(tool => tool.id));
              setToolbarBottomTabOrder(newTargetArray.map(tool => tool.id));
            }
            
            setDragState({
              isDragging: false,
              draggedTool: null,
              dragOverTool: null,
              draggedFromBottom: false
            });
          }
        }}
      >
        {dragState.isDragging && (
          <div className="w-8 h-0.5 bg-blue-500/50 rounded-full opacity-50 transition-opacity">
          </div>
        )}
      </div>
      
      {/* Bottom Tools */}
      <div className="flex flex-col space-y-1 px-1">
        {bottomTools.map((tool) => {
          const isDragged = dragState.draggedTool?.id === tool.id;
          const isDragOver = dragState.dragOverTool?.id === tool.id;
          
          return (
            <button
              key={tool.id}
              draggable
              onClick={() => handleToolClick(tool)}
              onDragStart={(e) => handleDragStart(e, tool, true)}
              onDragOver={(e) => handleDragOver(e, tool, true)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tool, true)}
              onDragEnd={handleDragEnd}
              className={`p-2 rounded-lg transition-all duration-200 group relative select-none ${
                isDragged 
                  ? 'opacity-50 cursor-grabbing scale-95' 
                  : selectedTool === tool.id 
                    ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/40 scale-105 cursor-grab' 
                    : 'text-slate-400 hover:text-white hover:bg-gradient-to-b hover:from-slate-700/80 hover:to-slate-800/90 hover:shadow-md hover:shadow-black/30 hover:scale-102 cursor-grab'
              }`}
              title={tool.title}
            >
              <tool.icon className="w-6 h-6" />
              
              {/* Drop indicator */}
              {isDragOver && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500 rounded-full"></div>
              )}
              
              {/* Tooltip with border and arrow */}
              {!dragState.isDragging && (
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60] shadow-2xl">
                  {tool.title}
                  {/* Arrow pointing to the button */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-slate-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Toolbar;