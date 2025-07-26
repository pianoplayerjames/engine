// plugins/editor/components/BottomTabs.jsx
import React from 'react';
import { Icons } from './Icons';

const tabs = [
  { id: 'assets', label: 'Assets', icon: Icons.Cube },
  { id: 'scripts', label: 'Scripts', icon: Icons.CodeBracket },
  { id: 'animation', label: 'Animation', icon: Icons.Play },
  { id: 'node-editor', label: 'Node Editor...', icon: Icons.AdjustmentsHorizontal },
  { id: 'timeline', label: 'Timeline', icon: Icons.Clock },
  { id: 'console', label: 'Console', icon: Icons.CommandLine },
];

function BottomTabs({ activeTab, onTabChange, isAssetPanelOpen, onToggleAssetPanel }) {
  return (
    <div className="h-10 bg-slate-900 border-t border-slate-700 border-b border-slate-700 flex items-center relative">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center px-4 py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-blue-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
            
            {/* Blue bottom border for active tab */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
        ))}
      </div>
      
      {/* Right side controls */}
      <div className="ml-auto flex items-center px-4">
        <button 
          onClick={onToggleAssetPanel}
          className="p-1.5 hover:bg-slate-800 rounded transition-colors text-gray-400 hover:text-white"
          title={isAssetPanelOpen ? 'Hide panel' : 'Show panel'}
        >
          {isAssetPanelOpen ? (
            <Icons.ChevronDown className="w-4 h-4" />
          ) : (
            <Icons.ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default BottomTabs;