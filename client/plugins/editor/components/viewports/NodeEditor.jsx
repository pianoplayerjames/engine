import React, { useState, useRef, useCallback } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';

const DotGrid = () => {
  return (
    <div className="absolute inset-0 bg-gray-900">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#374151" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    </div>
  );
};

const NodeSocket = ({ type, connected = false, onConnect }) => {
  const isInput = type === 'input';
  const isOutput = type === 'output';
  
  return (
    <div
      className={`w-3 h-3 rounded-full border-2 cursor-pointer transition-all ${
        connected
          ? 'bg-blue-500 border-blue-400'
          : 'bg-gray-700 border-gray-500 hover:border-gray-400'
      } ${isInput ? '-ml-1.5' : '-mr-1.5'}`}
      onClick={onConnect}
    />
  );
};

const NodePort = ({ label, type, socketType, connected, onConnect }) => {
  const isInput = type === 'input';
  
  return (
    <div className={`flex items-center gap-2 py-1 ${isInput ? 'justify-start' : 'justify-end'}`}>
      {isInput && (
        <NodeSocket type={socketType} connected={connected} onConnect={onConnect} />
      )}
      <span className="text-xs text-gray-300">{label}</span>
      {!isInput && (
        <NodeSocket type={socketType} connected={connected} onConnect={onConnect} />
      )}
    </div>
  );
};

const MaterialNode = ({ id, position, onDrag, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && onDrag) {
      onDrag(id, {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  }, [isDragging, id, onDrag]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  return (
    <div
      className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-48 select-none"
      style={{ left: position.x, top: position.y }}
    >
      {/* Node Header */}
      <div
        className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Material Output</span>
          <button
            onClick={() => onDelete(id)}
            className="text-purple-200 hover:text-white transition-colors"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3">
        {/* Input Ports */}
        <div className="space-y-1 mb-2">
          <NodePort label="Base Color" type="input" socketType="color" />
          <NodePort label="Roughness" type="input" socketType="float" />
          <NodePort label="Metallic" type="input" socketType="float" />
          <NodePort label="Normal" type="input" socketType="vector" />
          <NodePort label="Emission" type="input" socketType="color" />
        </div>

        {/* Output Ports */}
        <div className="border-t border-gray-600 pt-2">
          <NodePort label="Material" type="output" socketType="material" />
        </div>
      </div>
    </div>
  );
};

const TextureNode = ({ id, position, onDrag, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && onDrag) {
      onDrag(id, {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  }, [isDragging, id, onDrag]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  return (
    <div
      className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-48 select-none"
      style={{ left: position.x, top: position.y }}
    >
      {/* Node Header */}
      <div
        className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Image Texture</span>
          <button
            onClick={() => onDelete(id)}
            className="text-green-200 hover:text-white transition-colors"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3">
        {/* Texture Preview */}
        <div className="w-full h-20 bg-gray-700 rounded mb-2 flex items-center justify-center">
          <Icons.Image className="w-8 h-8 text-gray-500" />
        </div>

        {/* Load Texture Button */}
        <button className="w-full px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded mb-2 transition-colors">
          Load Image
        </button>

        {/* Input Ports */}
        <div className="space-y-1 mb-2">
          <NodePort label="UV" type="input" socketType="vector" />
        </div>

        {/* Output Ports */}
        <div className="border-t border-gray-600 pt-2 space-y-1">
          <NodePort label="Color" type="output" socketType="color" />
          <NodePort label="Alpha" type="output" socketType="float" />
        </div>
      </div>
    </div>
  );
};

const ColorNode = ({ id, position, onDrag, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [color, setColor] = useState('#ff6b35');
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && onDrag) {
      onDrag(id, {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  }, [isDragging, id, onDrag]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  return (
    <div
      className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-40 select-none"
      style={{ left: position.x, top: position.y }}
    >
      {/* Node Header */}
      <div
        className="px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Color</span>
          <button
            onClick={() => onDelete(id)}
            className="text-orange-200 hover:text-white transition-colors"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3">
        {/* Color Picker */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300"
          />
        </div>

        {/* Output Port */}
        <div className="border-t border-gray-600 pt-2">
          <NodePort label="Color" type="output" socketType="color" />
        </div>
      </div>
    </div>
  );
};

const NodeEditor = () => {
  const [nodes, setNodes] = useState([
    { id: 'material-1', type: 'material', position: { x: 400, y: 200 } },
    { id: 'texture-1', type: 'texture', position: { x: 100, y: 150 } },
    { id: 'color-1', type: 'color', position: { x: 100, y: 300 } }
  ]);

  const [contextMenu, setContextMenu] = useState(null);

  const handleNodeDrag = (nodeId, newPosition) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, position: newPosition } : node
    ));
  };

  const handleNodeDelete = (nodeId) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const addNode = (type) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: contextMenu.x - 200, y: contextMenu.y - 100 }
    };
    setNodes([...nodes, newNode]);
    setContextMenu(null);
  };

  const renderNode = (node) => {
    switch (node.type) {
      case 'material':
        return (
          <MaterialNode
            key={node.id}
            id={node.id}
            position={node.position}
            onDrag={handleNodeDrag}
            onDelete={handleNodeDelete}
          />
        );
      case 'texture':
        return (
          <TextureNode
            key={node.id}
            id={node.id}
            position={node.position}
            onDrag={handleNodeDrag}
            onDelete={handleNodeDelete}
          />
        );
      case 'color':
        return (
          <ColorNode
            key={node.id}
            id={node.id}
            position={node.position}
            onDrag={handleNodeDrag}
            onDelete={handleNodeDelete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <DotGrid />
      
      {/* Node Canvas */}
      <div 
        className="relative z-10 w-full h-full"
        onContextMenu={handleContextMenu}
        onClick={() => setContextMenu(null)}
      >
        {nodes.map(renderNode)}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="absolute z-50 bg-gray-900/98 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl min-w-48"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="p-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1 mb-1">
                Add Node
              </div>
              
              <button
                onClick={() => addNode('color')}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-md transition-colors"
              >
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3" />
                Color
              </button>
              
              <button
                onClick={() => addNode('texture')}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-md transition-colors"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                Image Texture
              </button>
              
              <button
                onClick={() => addNode('material')}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-md transition-colors"
              >
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3" />
                Material Output
              </button>
            </div>
          </div>
        </>
      )}

      {/* Help Text */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 z-10">
        Right-click to add nodes • Drag nodes to move • Click X to delete
      </div>
    </div>
  );
};

export default NodeEditor;