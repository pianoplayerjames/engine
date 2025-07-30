import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const PathsPanel = () => {
  const [paths, setPaths] = useState([
    { id: '1', name: 'Work Path', type: 'work', visible: true, selected: true },
    { id: '2', name: 'Path 1', type: 'saved', visible: true, selected: false },
    { id: '3', name: 'Shape Path', type: 'shape', visible: true, selected: false },
    { id: '4', name: 'Clipping Path', type: 'clipping', visible: true, selected: false }
  ]);
  
  const [selectedPath, setSelectedPath] = useState('1');
  const [pathTolerance, setPathTolerance] = useState(2.0);
  const [showPathInfo, setShowPathInfo] = useState(true);

  const pathTypes = [
    { type: 'work', icon: Icons.BezierCurve, color: 'text-blue-400' },
    { type: 'saved', icon: Icons.Save, color: 'text-green-400' },
    { type: 'shape', icon: Icons.Shapes, color: 'text-purple-400' },
    { type: 'clipping', icon: Icons.Scissors, color: 'text-red-400' }
  ];

  const getPathIcon = (type) => {
    const pathType = pathTypes.find(pt => pt.type === type);
    return pathType ? pathType.icon : Icons.BezierCurve;
  };

  const getPathColor = (type) => {
    const pathType = pathTypes.find(pt => pt.type === type);
    return pathType ? pathType.color : 'text-gray-400';
  };

  const selectPath = (pathId) => {
    setSelectedPath(pathId);
    setPaths(paths.map(path => ({
      ...path,
      selected: path.id === pathId
    })));
  };

  const togglePathVisibility = (pathId) => {
    setPaths(paths.map(path => 
      path.id === pathId ? { ...path, visible: !path.visible } : path
    ));
  };

  const duplicatePath = () => {
    const sourcePath = paths.find(p => p.id === selectedPath);
    if (sourcePath) {
      const newPath = {
        id: Date.now().toString(),
        name: `${sourcePath.name} copy`,
        type: sourcePath.type,
        visible: true,
        selected: false
      };
      setPaths([...paths, newPath]);
    }
  };

  const deletePath = () => {
    if (paths.length > 1) {
      setPaths(paths.filter(path => path.id !== selectedPath));
      const remainingPaths = paths.filter(path => path.id !== selectedPath);
      if (remainingPaths.length > 0) {
        setSelectedPath(remainingPaths[0].id);
      }
    }
  };

  const createNewPath = () => {
    const newPath = {
      id: Date.now().toString(),
      name: `Path ${paths.length}`,
      type: 'saved',
      visible: true,
      selected: false
    };
    setPaths([...paths, newPath]);
  };

  const pathToSelection = () => {
    console.log('Convert path to selection:', selectedPath);
  };

  const selectionToPath = () => {
    const newPath = {
      id: Date.now().toString(),
      name: 'Selection Path',
      type: 'work',
      visible: true,
      selected: false
    };
    setPaths([...paths, newPath]);
  };

  const strokePath = () => {
    console.log('Stroke path:', selectedPath);
  };

  const fillPath = () => {
    console.log('Fill path:', selectedPath);
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.BezierCurve className="w-4 h-4 text-yellow-400 mr-2" />
        <span className="text-white text-sm font-medium">Paths</span>
        
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setShowPathInfo(!showPathInfo)}
            className={`p-1 rounded transition-colors ${
              showPathInfo ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
            title="Show Path Info"
          >
            <Icons.InformationCircle className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Path Tools */}
      <div className="border-b border-gray-700 p-2">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={pathToSelection}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-center"
            title="Load Path as Selection"
          >
            <Icons.Rectangle className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <div className="text-xs text-gray-400">Load</div>
          </button>
          
          <button
            onClick={selectionToPath}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-center"
            title="Make Work Path from Selection"
          >
            <Icons.BezierCurve className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <div className="text-xs text-gray-400">Work</div>
          </button>
          
          <button
            onClick={strokePath}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-center"
            title="Stroke Path"
          >
            <Icons.Pencil className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <div className="text-xs text-gray-400">Stroke</div>
          </button>
          
          <button
            onClick={fillPath}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-center"
            title="Fill Path"
          >
            <Icons.PaintBucket className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <div className="text-xs text-gray-400">Fill</div>
          </button>
        </div>
      </div>

      {/* Path Tolerance */}
      <div className="border-b border-gray-700 p-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-300">Tolerance:</label>
          <input
            type="number"
            min="0.5"
            max="10"
            step="0.1"
            value={pathTolerance}
            onChange={(e) => setPathTolerance(parseFloat(e.target.value))}
            className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
          />
          <span className="text-xs text-gray-400">pixels</span>
        </div>
      </div>

      {/* Paths List */}
      <div className="flex-1 overflow-auto">
        {paths.map((path) => {
          const IconComponent = getPathIcon(path.type);
          const iconColor = getPathColor(path.type);
          
          return (
            <div
              key={path.id}
              className={`flex items-center p-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                path.selected ? 'bg-yellow-600/20 border-yellow-500' : ''
              }`}
              onClick={() => selectPath(path.id)}
            >
              {/* Path Thumbnail */}
              <div className="w-12 h-12 bg-gray-700 border border-gray-600 rounded mr-2 flex items-center justify-center">
                <IconComponent className={`w-6 h-6 ${iconColor}`} />
              </div>

              {/* Path Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{path.name}</div>
                <div className="text-xs text-gray-400 capitalize">{path.type} path</div>
              </div>

              {/* Path Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePathVisibility(path.id);
                  }}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title={path.visible ? 'Hide Path' : 'Show Path'}
                >
                  {path.visible ? (
                    <Icons.Eye className="w-3 h-3 text-gray-300" />
                  ) : (
                    <Icons.EyeOff className="w-3 h-3 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Path Information */}
      {showPathInfo && (
        <div className="border-t border-gray-700 p-3">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Path points:</span>
              <span>24</span>
            </div>
            <div className="flex justify-between">
              <span>Subpaths:</span>
              <span>2</span>
            </div>
            <div className="flex justify-between">
              <span>Path length:</span>
              <span>1,240.5px</span>
            </div>
            <div className="flex justify-between">
              <span>Closed:</span>
              <span>Yes</span>
            </div>
          </div>
        </div>
      )}

      {/* Path Actions */}
      <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-2">
        <button
          onClick={createNewPath}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Create New Path"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>
        
        <button
          onClick={duplicatePath}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Duplicate Path"
        >
          <Icons.DocumentDuplicate className="w-4 h-4" />
        </button>
        
        <button
          onClick={deletePath}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Delete Path"
        >
          <Icons.Trash className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Export Path"
        >
          <Icons.Upload className="w-4 h-4" />
        </button>
        
        <button
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300"
          title="Import Path"
        >
          <Icons.Download className="w-4 h-4" />
        </button>
        
        <div className="ml-auto text-xs text-gray-500">
          {paths.length} paths
        </div>
      </div>
    </div>
  );
};

export default PathsPanel;