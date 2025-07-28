import React from 'react';

const PanelToggleButton = ({ onClick, position, className = '' }) => {
  return (
    <div 
      className={`absolute top-1 w-6 pointer-events-auto z-50 ${className}`}
      style={position}
    >
      <button
        onClick={onClick}
        className="w-6 h-8 text-gray-400 hover:text-blue-400 transition-colors flex items-center justify-center"
        style={{ 
          backgroundColor: '#1e293b',
          borderLeft: '1px solid #475569',
          borderTop: '1px solid #475569',
          borderBottom: '1px solid #475569',
          borderTopLeftRadius: '6px',
          borderBottomLeftRadius: '6px'
        }}
      >
        <div className="w-3 h-3 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </div>
      </button>
    </div>
  );
};

export default PanelToggleButton;