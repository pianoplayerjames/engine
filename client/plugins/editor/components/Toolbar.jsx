// plugins/editor/components/Toolbar.jsx
import React from 'react';
import { Icons } from './Icons';

const tools = [
  { id: 'scene', icon: Icons.Scene, title: 'Scene' },
  { id: 'light', icon: Icons.Light, title: 'Light' },
  { id: 'effects', icon: Icons.Effects, title: 'Effects' },
  { id: 'folder', icon: Icons.FolderOpen, title: 'Folder' },
  { id: 'star', icon: Icons.Star, title: 'Favorites' },
  { id: 'wifi', icon: Icons.Wifi, title: 'Network' },
  { id: 'cloud', icon: Icons.Cloud, title: 'Cloud' },
  { id: 'monitor', icon: Icons.Monitor, title: 'Display' },
  { id: 'settings', icon: Icons.Settings, title: 'Settings' },
];

const bottomTools = [
  { id: 'add', icon: Icons.PlusCircle, title: 'Add' },
];

function Toolbar({ selectedTool, onToolSelect, scenePanelOpen, onScenePanelToggle }) {
  return (
    <div className="relative w-12 h-full bg-gradient-to-b from-slate-800/95 to-slate-900/98 backdrop-blur-md border-l border-slate-700/80 shadow-2xl shadow-black/30 flex flex-col py-2 pointer-events-auto no-select">
      {/* Tools - made icons bigger */}
      <div className="flex flex-col space-y-1 px-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              if (!scenePanelOpen) {
                onScenePanelToggle();
              }
              onToolSelect(tool.id);
            }}
            className={`p-2 rounded-lg transition-all duration-200 group relative ${
              selectedTool === tool.id 
                ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/40 scale-105' 
                : 'text-slate-400 hover:text-white hover:bg-gradient-to-b hover:from-slate-700/80 hover:to-slate-800/90 hover:shadow-md hover:shadow-black/30 hover:scale-102'
            }`}
            title={tool.title}
          >
            <tool.icon className="w-6 h-6" />
            
            {/* Tooltip with border */}
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60] shadow-2xl">
              {tool.title}
            </div>
          </button>
        ))}
      </div>
      
      {/* Spacer */}
      <div className="flex-1"></div>
      
      {/* Bottom Tools */}
      <div className="flex flex-col space-y-1 px-1">
        {bottomTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className={`p-2 rounded-lg transition-all duration-200 group relative ${
              selectedTool === tool.id 
                ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/40 scale-105' 
                : 'text-slate-400 hover:text-white hover:bg-gradient-to-b hover:from-slate-700/80 hover:to-slate-800/90 hover:shadow-md hover:shadow-black/30 hover:scale-102'
            }`}
            title={tool.title}
          >
            <tool.icon className="w-6 h-6" />
            
            {/* Tooltip with border */}
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60] shadow-2xl">
              {tool.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Toolbar;