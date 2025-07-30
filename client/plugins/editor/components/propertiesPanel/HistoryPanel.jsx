import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const HistoryPanel = () => {
  const [historyStates, setHistoryStates] = useState([
    { id: '1', name: 'Open', action: 'open', time: '10:32 AM', current: false },
    { id: '2', name: 'Crop', action: 'crop', time: '10:33 AM', current: false },
    { id: '3', name: 'Brightness/Contrast', action: 'adjustment', time: '10:34 AM', current: false },
    { id: '4', name: 'Brush Tool', action: 'paint', time: '10:35 AM', current: false },
    { id: '5', name: 'Gaussian Blur', action: 'filter', time: '10:36 AM', current: false },
    { id: '6', name: 'Color Balance', action: 'adjustment', time: '10:37 AM', current: true },
    { id: '7', name: 'Healing Brush', action: 'healing', time: '10:38 AM', current: false },
  ]);
  
  const [currentState, setCurrentState] = useState('6');
  const [showSnapshots, setShowSnapshots] = useState(false);

  const snapshots = [
    { id: 's1', name: 'Before Retouching', time: '10:30 AM', thumbnail: null },
    { id: 's2', name: 'After Color Correction', time: '10:35 AM', thumbnail: null },
    { id: 's3', name: 'Final Edit', time: '10:40 AM', thumbnail: null },
  ];

  const getActionIcon = (action) => {
    switch (action) {
      case 'open': return Icons.Upload;
      case 'crop': return Icons.Crop;
      case 'adjustment': return Icons.AdjustmentsHorizontal;
      case 'paint': return Icons.PaintBrush;
      case 'filter': return Icons.Filter;
      case 'healing': return Icons.Healing;
      case 'selection': return Icons.Rectangle;
      case 'text': return Icons.Type;
      case 'transform': return Icons.Move;
      default: return Icons.Photo;
    }
  };

  const goToState = (stateId) => {
    setCurrentState(stateId);
    setHistoryStates(states => 
      states.map(state => ({
        ...state,
        current: state.id === stateId
      }))
    );
  };

  const deleteState = (stateId) => {
    if (historyStates.length > 1) {
      setHistoryStates(states => states.filter(state => state.id !== stateId));
      if (currentState === stateId) {
        const remainingStates = historyStates.filter(state => state.id !== stateId);
        if (remainingStates.length > 0) {
          setCurrentState(remainingStates[remainingStates.length - 1].id);
        }
      }
    }
  };

  const clearHistory = () => {
    const currentStateData = historyStates.find(state => state.id === currentState);
    if (currentStateData) {
      setHistoryStates([currentStateData]);
    }
  };

  const createSnapshot = () => {
    const newSnapshot = {
      id: `s${Date.now()}`,
      name: `Snapshot ${snapshots.length + 1}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thumbnail: null
    };
    // In a real implementation, you would capture the current canvas state
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.Clock className="w-4 h-4 text-green-400 mr-2" />
        <span className="text-white text-sm font-medium">History</span>
        
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setShowSnapshots(!showSnapshots)}
            className={`p-1 rounded transition-colors ${
              showSnapshots ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
            title="Show Snapshots"
          >
            <Icons.Camera className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* History/Snapshots Toggle */}
      <div className="border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setShowSnapshots(false)}
            className={`flex-1 px-3 py-2 text-sm transition-colors ${
              !showSnapshots
                ? 'bg-gray-700 text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            History States
          </button>
          <button
            onClick={() => setShowSnapshots(true)}
            className={`flex-1 px-3 py-2 text-sm transition-colors ${
              showSnapshots
                ? 'bg-gray-700 text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Snapshots
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!showSnapshots ? (
          /* History States */
          <div className="p-2">
            {historyStates.map((state, index) => {
              const ActionIcon = getActionIcon(state.action);
              const isCurrent = state.id === currentState;
              const isAfterCurrent = historyStates.findIndex(s => s.id === currentState) < index;
              
              return (
                <div
                  key={state.id}
                  className={`flex items-center p-2 rounded cursor-pointer group transition-colors ${
                    isCurrent
                      ? 'bg-green-600/20 border border-green-500'
                      : isAfterCurrent
                      ? 'opacity-50 hover:opacity-75'
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => goToState(state.id)}
                >
                  {/* State Icon */}
                  <div className="w-8 h-8 bg-gray-700 border border-gray-600 rounded mr-2 flex items-center justify-center">
                    <ActionIcon className={`w-4 h-4 ${isCurrent ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>

                  {/* State Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${isCurrent ? 'text-white font-medium' : 'text-gray-300'}`}>
                      {state.name}
                    </div>
                    <div className="text-xs text-gray-500">{state.time}</div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteState(state.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all"
                    title="Delete State"
                  >
                    <Icons.XMark className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Snapshots */
          <div className="p-2">
            {snapshots.length === 0 ? (
              <div className="text-center py-8">
                <Icons.Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-500 text-sm mb-2">No snapshots created</div>
                <button
                  onClick={createSnapshot}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                >
                  Create Snapshot
                </button>
              </div>
            ) : (
              snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="flex items-center p-2 rounded hover:bg-gray-800 cursor-pointer group"
                >
                  {/* Snapshot Thumbnail */}
                  <div className="w-12 h-12 bg-gray-700 border border-gray-600 rounded mr-2 flex items-center justify-center">
                    <Icons.Photo className="w-6 h-6 text-gray-400" />
                  </div>

                  {/* Snapshot Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-300 truncate">{snapshot.name}</div>
                    <div className="text-xs text-gray-500">{snapshot.time}</div>
                  </div>

                  {/* Snapshot Actions */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Rename"
                    >
                      <Icons.Pencil className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Delete"
                    >
                      <Icons.Trash className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-2">
        {!showSnapshots ? (
          <>
            <button
              onClick={clearHistory}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
              title="Clear History"
            >
              Clear
            </button>
            
            <span className="text-xs text-gray-500 ml-auto">
              {historyStates.length} states
            </span>
          </>
        ) : (
          <>
            <button
              onClick={createSnapshot}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
              title="New Snapshot"
            >
              <Icons.Camera className="w-4 h-4" />
            </button>

            <span className="text-xs text-gray-500 ml-auto">
              {snapshots.length} snapshots
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;