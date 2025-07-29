import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';
import statsManager from '@/plugins/editor/utils/statsManager.js';

export default function SettingsPanel({ onClose }) {
  const { settings } = useSnapshot(editorState);
  const [showStats, setShowStats] = useState(settings.editor?.showStats || false);
  
  const handleStatsToggle = (enabled) => {
    console.log('SettingsPanel: Stats toggle clicked, enabled:', enabled);
    
    setShowStats(enabled);
    editorActions.updateEditorSettings({ showStats: enabled });
    
    editorActions.addConsoleMessage(`Performance stats ${enabled ? 'enabled' : 'disabled'}`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Icons.Cog className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
          
          {/* Performance Section */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Icons.Zap className="w-4 h-4" />
              Performance
            </h3>
            
            <div className="space-y-4">
              {/* Stats.js Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div>
                  <label className="text-sm font-medium text-white">Performance Stats</label>
                  <p className="text-xs text-gray-400 mt-1">
                    Show FPS, memory usage, and render statistics
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => handleStatsToggle(!showStats)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    showStats ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showStats ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Viewport Section */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Icons.Monitor className="w-4 h-4" />
              Viewport
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">
                  More viewport settings coming soon...
                </p>
              </div>
            </div>
          </div>

          {/* Interface Section */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Icons.Grid3x3 className="w-4 h-4" />
              Interface
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">
                  Interface customization options coming soon...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              editorActions.addConsoleMessage('Settings saved', 'success');
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}