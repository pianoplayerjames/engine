// client/plugins/editor/components/NodeEditor.jsx
import React from 'react';

const DotGrid = () => {
  return (
    <div className="absolute inset-0 bg-gray-900">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#2D3748" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    </div>
  );
};

const NodeEditor = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <DotGrid />
      <div className="relative z-10 p-4 text-gray-400">
        Node editor content will go here.
      </div>
    </div>
  );
};

export default NodeEditor;
