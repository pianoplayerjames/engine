// plugins/editor/components/VerticalToolMenu.jsx
import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';

const tools = [
  { id: 'select', icon: Icons.Select, title: 'Select' },
  { id: 'camera', icon: Icons.Camera, title: 'Camera' },
  { id: 'paint', icon: Icons.Paint, title: 'Paint' },
  { id: 'sculpt', icon: Icons.Sculpt, title: 'Sculpt' },
  { id: 'move', icon: Icons.Move, title: 'Move' },
  { id: 'rotate', icon: Icons.Rotate, title: 'Rotate' },
  { id: 'scale', icon: Icons.Scale, title: 'Scale' },
  { id: 'undo', icon: Icons.Undo, title: 'Undo' },
  { id: 'redo', icon: Icons.Redo, title: 'Redo' },
];

function VerticalToolMenu({ selectedTool, onToolSelect }) {
  const [tooltipState, setTooltipState] = useState({ visible: false, text: '', x: 0, y: 0 });
  const [flashingTool, setFlashingTool] = useState(null);
  
  const { selection } = useSnapshot(editorState);
  const { transformMode } = selection;
  const { setTransformMode } = editorActions;
  
  // Use transformMode from store instead of selectedTool prop for transform tools
  const getEffectiveSelectedTool = () => {
    if (['select', 'move', 'rotate', 'scale'].includes(transformMode)) {
      return transformMode;
    }
    return selectedTool;
  };

  const showTooltip = (e, title) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipState({
      visible: true,
      text: title,
      x: rect.right + 12, // 12px to the right of the button
      y: rect.top + rect.height / 2 // Vertically centered
    });
  };

  const hideTooltip = () => {
    setTooltipState({ visible: false, text: '', x: 0, y: 0 });
  };

  return (
    <>
      <div className="absolute top-16 left-4 w-10 bg-gradient-to-b from-slate-800/95 to-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl shadow-black/50 flex flex-col pointer-events-auto overflow-visible no-select">
        {tools.map((tool, index) => {
          const effectiveSelectedTool = getEffectiveSelectedTool();
          const isSelected = effectiveSelectedTool === tool.id;
          const isFirstGroup = index <= 3; // Select, Camera, Paint, Sculpt
          const isSecondGroup = index >= 4 && index <= 6; // Move, Rotate, Scale  
          const isThirdGroup = index >= 7; // Undo, Redo
          
          return (
            <div key={tool.id}>
              {/* Add separator between groups */}
              {(index === 4 || index === 7) && (
                <div className="mx-2 my-1 h-px bg-slate-700/60"></div>
              )}
              <button
                onClick={() => {
                  if (tool.id === 'undo' || tool.id === 'redo') {
                    // Flash effect for action buttons
                    setFlashingTool(tool.id);
                    setTimeout(() => setFlashingTool(null), 200);
                    console.log(`${tool.id} action triggered`);
                  } else {
                    onToolSelect(tool.id);
                    // Update transform mode in store
                    setTransformMode(tool.id);
                  }
                }}
                className={`w-full h-8 flex items-center justify-center transition-all duration-200 relative group ${
                  (isSelected && tool.id !== 'undo' && tool.id !== 'redo') || flashingTool === tool.id
                    ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/40' 
                    : 'text-slate-400 hover:text-white hover:bg-gradient-to-b hover:from-slate-700/80 hover:to-slate-800/90 hover:shadow-md hover:shadow-black/30'
                } ${
                  index === 0 ? 'rounded-t-xl' : ''
                } ${
                  index === tools.length - 1 ? 'rounded-b-xl' : ''
                } ${
                  (isSelected && tool.id !== 'undo' && tool.id !== 'redo') || flashingTool === tool.id ? 'scale-105' : 'hover:scale-102'
                }`}
                onMouseEnter={(e) => showTooltip(e, tool.title)}
                onMouseLeave={hideTooltip}
              >
                {/* Selected indicator */}
                {isSelected && tool.id !== 'undo' && tool.id !== 'redo' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full"></div>
                )}
                <tool.icon className={`transition-all duration-200 ${
                  (isSelected && tool.id !== 'undo' && tool.id !== 'redo') || flashingTool === tool.id ? 'w-5 h-5' : 'w-4 h-4 group-hover:w-5 group-hover:h-5'
                }`} />
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Position-based tooltip matching properties panel style */}
      {tooltipState.visible && (
        <div 
          className="fixed bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap shadow-2xl"
          style={{ 
            left: tooltipState.x,
            top: tooltipState.y,
            transform: 'translateY(-50%)',
            zIndex: 9999
          }}
        >
          {/* Arrow pointing left */}
          <div 
            className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"
            style={{ borderRightColor: '#0f172a' }}
          />
          {tooltipState.text}
        </div>
      )}
    </>
  );
}

export default VerticalToolMenu;