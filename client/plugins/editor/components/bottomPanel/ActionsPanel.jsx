import { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const ActionsPanel = () => {
  const [actionSets, setActionSets] = useState([
    { 
      id: '1', 
      name: 'Default Actions', 
      actions: [
        { id: 'a1', name: 'Vignette', steps: 5, recorded: true },
        { id: 'a2', name: 'Wood Frame', steps: 8, recorded: true },
        { id: 'a3', name: 'Cast Shadow', steps: 12, recorded: true },
        { id: 'a4', name: 'Water Reflection', steps: 15, recorded: true }
      ],
      expanded: true
    },
    {
      id: '2',
      name: 'My Actions',
      actions: [
        { id: 'a5', name: 'Portrait Enhancement', steps: 10, recorded: true },
        { id: 'a6', name: 'Film Look', steps: 7, recorded: true },
        { id: 'a7', name: 'HDR Effect', steps: 9, recorded: false }
      ],
      expanded: false
    }
  ]);
  
  const [selectedAction, setSelectedAction] = useState('a1');
  const [recording, setRecording] = useState(false);
  const [playback, setPlayback] = useState({ playing: false, actionId: null, step: 0 });
  const [currentRecording, setCurrentRecording] = useState({
    steps: [],
    name: 'New Action'
  });

  const toggleActionSet = (setId) => {
    setActionSets(sets => sets.map(set => 
      set.id === setId ? { ...set, expanded: !set.expanded } : set
    ));
  };

  const selectAction = (actionId) => {
    setSelectedAction(actionId);
  };

  const startRecording = () => {
    setRecording(true);
    setCurrentRecording({
      steps: [],
      name: `Action ${Date.now()}`
    });
  };

  const stopRecording = () => {
    setRecording(false);
    if (currentRecording.steps.length > 0) {
      // Add the recorded action to the first action set
      const newAction = {
        id: `a${Date.now()}`,
        name: currentRecording.name,
        steps: currentRecording.steps.length,
        recorded: true
      };
      
      setActionSets(sets => sets.map(set => 
        set.id === '2' ? { ...set, actions: [...set.actions, newAction] } : set
      ));
    }
    setCurrentRecording({ steps: [], name: 'New Action' });
  };

  const playAction = (actionId) => {
    setPlayback({ playing: true, actionId, step: 0 });
    
    // Simulate action playback
    const action = actionSets
      .flatMap(set => set.actions)
      .find(a => a.id === actionId);
      
    if (action) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setPlayback(prev => ({ ...prev, step }));
        
        if (step >= action.steps) {
          clearInterval(interval);
          setPlayback({ playing: false, actionId: null, step: 0 });
        }
      }, 500);
    }
  };

  const deleteAction = (actionId) => {
    setActionSets(sets => sets.map(set => ({
      ...set,
      actions: set.actions.filter(action => action.id !== actionId)
    })));
    
    if (selectedAction === actionId) {
      const allActions = actionSets.flatMap(set => set.actions);
      const remainingActions = allActions.filter(a => a.id !== actionId);
      setSelectedAction(remainingActions.length > 0 ? remainingActions[0].id : null);
    }
  };

  const duplicateAction = (actionId) => {
    const action = actionSets
      .flatMap(set => set.actions)
      .find(a => a.id === actionId);
      
    if (action) {
      const newAction = {
        ...action,
        id: `a${Date.now()}`,
        name: `${action.name} copy`
      };
      
      setActionSets(sets => sets.map(set => 
        set.actions.some(a => a.id === actionId) 
          ? { ...set, actions: [...set.actions, newAction] }
          : set
      ));
    }
  };

  const createNewActionSet = () => {
    const newSet = {
      id: Date.now().toString(),
      name: `Action Set ${actionSets.length + 1}`,
      actions: [],
      expanded: true
    };
    setActionSets([...actionSets, newSet]);
  };

  const renameAction = (actionId, newName) => {
    setActionSets(sets => sets.map(set => ({
      ...set,
      actions: set.actions.map(action => 
        action.id === actionId ? { ...action, name: newName } : action
      )
    })));
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.Play className="w-4 h-4 text-green-400 mr-2" />
        <span className="text-white text-sm font-medium">Actions</span>
        
        <div className="ml-auto flex items-center gap-1">
          {recording && (
            <div className="flex items-center gap-2 mr-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-red-400">Recording</span>
            </div>
          )}
          
          {playback.playing && (
            <div className="flex items-center gap-2 mr-2">
              <Icons.Play className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">
                Step {playback.step}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="border-b border-gray-700 p-2">
        <div className="flex items-center gap-2">
          {!recording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
            >
              <Icons.Circle className="w-3 h-3" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
            >
              <Icons.Square className="w-3 h-3" />
              Stop Recording
            </button>
          )}
          
          <button
            onClick={() => selectedAction && playAction(selectedAction)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            disabled={!selectedAction || playback.playing}
          >
            <Icons.Play className="w-3 h-3" />
            Play
          </button>
        </div>
        
        {recording && (
          <div className="mt-2">
            <input
              type="text"
              value={currentRecording.name}
              onChange={(e) => setCurrentRecording(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Action name..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
            />
          </div>
        )}
      </div>

      {/* Action Sets */}
      <div className="flex-1 overflow-auto">
        {actionSets.map((set) => (
          <div key={set.id} className="border-b border-gray-700">
            {/* Action Set Header */}
            <div
              className="flex items-center p-2 bg-gray-800 cursor-pointer hover:bg-gray-750"
              onClick={() => toggleActionSet(set.id)}
            >
              <Icons.ChevronRight 
                className={`w-3 h-3 text-gray-400 mr-2 transition-transform ${
                  set.expanded ? 'rotate-90' : ''
                }`}
              />
              <Icons.Folder className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm text-white flex-1">{set.name}</span>
              <span className="text-xs text-gray-500">{set.actions.length}</span>
            </div>

            {/* Actions */}
            {set.expanded && (
              <div className="bg-gray-850">
                {set.actions.map((action) => (
                  <div
                    key={action.id}
                    className={`flex items-center p-2 pl-8 cursor-pointer hover:bg-gray-800 group ${
                      selectedAction === action.id ? 'bg-green-600/20 border-l-2 border-green-500' : ''
                    }`}
                    onClick={() => selectAction(action.id)}
                  >
                    {/* Action Icon */}
                    <div className="w-6 h-6 bg-gray-700 border border-gray-600 rounded mr-2 flex items-center justify-center">
                      <Icons.Play className="w-3 h-3 text-green-400" />
                    </div>

                    {/* Action Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{action.name}</div>
                      <div className="text-xs text-gray-400">{action.steps} steps</div>
                    </div>

                    {/* Action Status */}
                    <div className="flex items-center gap-1">
                      {!action.recorded && (
                        <Icons.Clock className="w-3 h-3 text-yellow-400" title="In Progress" />
                      )}
                      
                      {playback.playing && playback.actionId === action.id && (
                        <div className="flex items-center gap-1">
                          <Icons.Play className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-green-400">{playback.step}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Menu */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAction(action.id);
                        }}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Play Action"
                      >
                        <Icons.Play className="w-3 h-3 text-gray-400" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateAction(action.id);
                        }}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Duplicate Action"
                      >
                        <Icons.DocumentDuplicate className="w-3 h-3 text-gray-400" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAction(action.id);
                        }}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Delete Action"
                      >
                        <Icons.Trash className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Details */}
      {selectedAction && (
        <div className="border-t border-gray-700 p-3">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Selected:</span>
              <span>{actionSets.flatMap(s => s.actions).find(a => a.id === selectedAction)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Steps:</span>
              <span>{actionSets.flatMap(s => s.actions).find(a => a.id === selectedAction)?.steps}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span>
                {actionSets.flatMap(s => s.actions).find(a => a.id === selectedAction)?.recorded 
                  ? 'Recorded' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-2">
        <button
          onClick={createNewActionSet}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="New Action Set"
        >
          <Icons.FolderOpen className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Load Actions"
        >
          <Icons.Upload className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Save Actions"
        >
          <Icons.Save className="w-4 h-4" />
        </button>
        
        <div className="ml-auto text-xs text-gray-500">
          {actionSets.reduce((total, set) => total + set.actions.length, 0)} actions
        </div>
      </div>
    </div>
  );
};

export default ActionsPanel;