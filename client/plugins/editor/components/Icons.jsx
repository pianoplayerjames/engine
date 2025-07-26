// plugins/editor/components/Icons.jsx
import React from 'react';

export const Icons = {
  // Your existing AssetIcon patterns - copied exactly
  Cube3D: ({ isHovered = false, ...props }) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      {/* 3D Cube Icon - flat design without shading */}
      <path
        d="M12 2L2 7v10l10 5 10-5V7l-10-5z"
        fill="#60A5FA"
        stroke={isHovered ? "#2563eb" : "#1E40AF"}
        strokeWidth={isHovered ? "2" : "1"}
        strokeLinejoin="round"
      />
      <path
        d="M2 7l10 5 10-5"
        stroke="#1E40AF"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12v10"
        stroke="#1E40AF"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  ),

  Model3D: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="model-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      {/* 3D Model Icon */}
      <path
        d="M12 3L3 8v8l9 5 9-5V8l-9-5z"
        fill="url(#model-gradient)"
        stroke="#059669"
        strokeWidth="1"
      />
      <path
        d="M3 8l9 5 9-5"
        stroke="#059669"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M12 13v8"
        stroke="#059669"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Wireframe overlay */}
      <path
        d="M12 3L8 5.5v3l4-2V3z"
        fill="none"
        stroke="#6EE7B7"
        strokeWidth="0.5"
      />
      <path
        d="M16 5.5L12 3v3.5l4 2v-3z"
        fill="none"
        stroke="#6EE7B7"
        strokeWidth="0.5"
      />
    </svg>
  ),

  Mesh: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="mesh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Mesh/Wireframe Icon */}
      <path
        d="M4 4h16v16H4z"
        fill="url(#mesh-gradient)"
        stroke="#92400E"
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Grid lines */}
      <path d="M4 8h16M4 12h16M4 16h16" stroke="#92400E" strokeWidth="1" />
      <path d="M8 4v16M12 4v16M16 4v16" stroke="#92400E" strokeWidth="1" />
      {/* Corner highlights */}
      <circle cx="4" cy="4" r="1.5" fill="#FCD34D" />
      <circle cx="20" cy="4" r="1.5" fill="#FCD34D" />
      <circle cx="4" cy="20" r="1.5" fill="#FCD34D" />
      <circle cx="20" cy="20" r="1.5" fill="#FCD34D" />
    </svg>
  ),

  TerrainMaterial: (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      {/* Terrain material icon */}
      <rect
        x="2" y="2" width="20" height="20" rx="2"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ),

  // Vertical tool menu icons (top-left menu below hamburger) - Enhanced quality
  Select: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 3L9.5 20.5L12 13L20.5 9.5L3 3Z" strokeLinejoin="round"/>
      <path d="M13 13L21 21" strokeLinecap="round"/>
    </svg>
  ),

  Camera: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="2" y="8" width="20" height="12" rx="2" strokeLinejoin="round"/>
      <path d="M7 8L9 5H15L17 8" strokeLinejoin="round"/>
      <circle cx="12" cy="14" r="3"/>
      <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
    </svg>
  ),

  Paint: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M18 3A2.5 2.5 0 0 0 15.5 5.5L7 14L2 22L10 17L18.5 8.5A2.5 2.5 0 0 0 18 3Z" strokeLinejoin="round"/>
      <path d="M15 6L18 9" strokeLinecap="round"/>
      <circle cx="8" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),

  Sculpt: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3C8 3 5 6 5 10C5 14 8 17 12 21C16 17 19 14 19 10C19 6 16 3 12 3Z" strokeLinejoin="round"/>
      <path d="M9 10C9 12 10.5 13.5 12 13.5C13.5 13.5 15 12 15 10" strokeLinecap="round"/>
      <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  ),

  Undo: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 7v6h6"/>
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
    </svg>
  ),

  Redo: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 7v6h-6"/>
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
    </svg>
  ),

  // Enhanced icons for the other menu (vertical tool menu)
  Move: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3L12 21M3 12L21 12" strokeLinecap="round"/>
      <path d="M8 7L12 3L16 7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17L12 21L8 17" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 8L3 12L7 16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 16L21 12L17 8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Rotate: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3v6l4-4-4-4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12a9 9 0 1 1-9-9" strokeLinecap="round"/>
    </svg>
  ),

  Scale: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M21 3L15 9" strokeLinecap="round"/>
      <path d="M21 3H15" strokeLinecap="round"/>
      <path d="M21 3V9" strokeLinecap="round"/>
      <path d="M3 21L9 15" strokeLinecap="round"/>
      <path d="M3 21H9" strokeLinecap="round"/>
      <path d="M3 21V15" strokeLinecap="round"/>
      <rect x="8" y="8" width="8" height="8" rx="1" fill="none" opacity="0.3"/>
    </svg>
  ),

  // Properties menu icons (right toolbar - larger, cleaner style) - Cube for scene
  Scene: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <path d="M3.29 7 12 12l8.71-5"/>
      <path d="M12 22V12"/>
    </svg>
  ),

  // Redesigned Light icon - proper lightbulb with dots and screw
  Light: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      {/* Bulb shape */}
      <path d="M15 9A6 6 0 1 1 9 9C9 10.5 9.5 12 10 13H14C14.5 12 15 10.5 15 9Z" strokeLinejoin="round"/>
      {/* Base/socket */}
      <rect x="10" y="18" width="4" height="4" rx="0.5" strokeLinejoin="round"/>
      {/* Screw threads */}
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="9" y1="19.5" x2="15" y2="19.5"/>
      <line x1="9" y1="21" x2="15" y2="21"/>
      {/* Light dots/rays inside bulb */}
      <circle cx="12" cy="8" r="0.5" fill="currentColor"/>
      <circle cx="10.5" cy="9.5" r="0.3" fill="currentColor"/>
      <circle cx="13.5" cy="9.5" r="0.3" fill="currentColor"/>
      <circle cx="12" cy="11" r="0.3" fill="currentColor"/>
    </svg>
  ),

  // Redesigned Effects icon with sparkles like screenshot
  Effects: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" strokeLinejoin="round"/>
      {/* Sparkles around the lightning */}
      <path d="M6 6L7 7L6 8L5 7L6 6Z" fill="currentColor"/>
      <path d="M19 4L20 5L19 6L18 5L19 4Z" fill="currentColor"/>
      <path d="M18 16L19 17L18 18L17 17L18 16Z" fill="currentColor"/>
      <path d="M4 15L5 16L4 17L3 16L4 15Z" fill="currentColor"/>
      <circle cx="20" cy="8" r="0.5" fill="currentColor"/>
      <circle cx="4" cy="10" r="0.5" fill="currentColor"/>
    </svg>
  ),

  UndoArrow: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M3 7V13A10 10 0 0 0 23 13"/>
      <path d="M3 7L7 3L3 7L7 11"/>
    </svg>
  ),

  // Redesigned Code icon with slash
  Code: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M16 18L22 12L16 6"/>
      <path d="M8 6L2 12L8 18"/>
      <path d="M10 20L14 4"/>
    </svg>
  ),

  FolderOpen: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M22 19A2 2 0 0 1 20 21H4A2 2 0 0 1 2 19V5A2 2 0 0 1 4 3H9L11 6H20A2 2 0 0 1 22 8Z"/>
    </svg>
  ),

  Star: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  ),

  Wifi: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M5 12.55A11 11 0 0 1 19 12.55"/>
      <path d="M1.42 9A16 16 0 0 1 22.58 9"/>
      <path d="M8.53 16.11A6 6 0 0 1 15.47 16.11"/>
      <circle cx="12" cy="20" r="1"/>
    </svg>
  ),

  Cloud: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M18 10H20A4 4 0 0 1 20 18H6A6 6 0 0 1 6 6C6 4.5 7 3.1 8.5 2.4A8 8 0 0 1 18 10Z"/>
    </svg>
  ),

  PlusCircle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12H16"/>
      <path d="M12 8V16"/>
    </svg>
  ),

  Monitor: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <path d="M8 21H16"/>
      <path d="M12 17V21"/>
    </svg>
  ),

  MenuBars: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M3 12H15"/>
      <path d="M3 6H21"/>
      <path d="M3 18H21"/>
    </svg>
  ),

  // Redesigned Settings cog
  Settings: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),

  // Redesigned Nodes icon - 2 dots connected by angled line
  Nodes: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="6" cy="6" r="3"/>
      <circle cx="18" cy="18" r="3"/>
      <path d="M9 9L15 15"/>
    </svg>
  ),

  // Navigation icons
  ChevronDown: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),

  ChevronRight: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),

  ChevronLeft: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),

  ChevronUp: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m18 15-6-6-6 6"/>
    </svg>
  ),

  Eye: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),

  EyeSlash: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <path d="m2 2 20 20"/>
    </svg>
  ),

  XMark: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m18 6-12 12"/>
      <path d="m6 6 12 12"/>
    </svg>
  ),

  // Enhanced top left menu icons
  Menu: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round"/>
      <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round"/>
      <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round"/>
    </svg>
  ),

  Plus: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 12h14" strokeLinecap="round"/>
      <path d="M12 5v14" strokeLinecap="round"/>
    </svg>
  ),

  Save: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeLinejoin="round"/>
      <path d="M17 21V13H7V21" strokeLinejoin="round"/>
      <path d="M7 3V8H15" strokeLinejoin="round"/>
    </svg>
  ),

  Upload: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,5 17,10"/>
      <line x1="12" y1="5" x2="12" y2="15"/>
    </svg>
  ),

  Download: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),

  Folder: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
    </svg>
  ),

  Cog: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),

  QuestionMark: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <point cx="12" cy="17"/>
    </svg>
  ),

  MagnifyingGlass: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),

  // Asset category icons (styled for sidebar)
  Models: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29,7 12,12 20.71,7"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  ),

  Materials: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),

  Textures: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  ),

  Scripts: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="16,18 22,12 16,6"/>
      <polyline points="8,6 2,12 8,18"/>
    </svg>
  ),

  Plugins: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="6" height="6"/>
      <rect x="15" y="3" width="6" height="6"/>
      <rect x="3" y="15" width="6" height="6"/>
      <rect x="15" y="15" width="6" height="6"/>
    </svg>
  ),

  Audio: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),

  Animations: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  ),

  Prefabs: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),

// plugins/editor/components/Icons.jsx (continued)
Character: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
),

Terrain: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 20h18L12 4 3 20z"/>
    <path d="M8 20h8"/>
  </svg>
),

Tree: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 22V12"/>
    <path d="M17 8c0-2.76-2.24-5-5-5S7 5.24 7 8c0 2.76 2.24 5 5 5s5-2.24 5-5z"/>
    <path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
  </svg>
),

// Bottom tab icons
CodeBracket: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="m16 18 6-6-6-6"/>
    <path d="m8 6-6 6 6 6"/>
  </svg>
),

// Animation icon is now a play button (redesigned)
Play: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polygon points="5,3 19,12 5,21"/>
  </svg>
),

AdjustmentsHorizontal: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M8 12H2"/>
    <path d="M22 12h-6"/>
    <path d="M12 8V2"/>
    <path d="M12 22v-6"/>
  </svg>
),

Clock: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
),

CommandLine: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="m7 8 3 3-3 3"/>
    <path d="M14 16h6"/>
    <rect x="2" y="3" width="20" height="18" rx="2"/>
  </svg>
),

// Legacy icons (kept for compatibility)
CursorArrowRays: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
  </svg>
),

HandRaised: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M18 11V6a2 2 0 0 0-4 0v5"/>
    <path d="M14 10V4a2 2 0 0 0-4 0v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
),

ArrowsPointingOut: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M16 8L8 16"/>
    <path d="M16 16L8 8"/>
    <path d="M16 8h-8v8"/>
  </svg>
),

Square3Stack3D: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
),

Sun: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
),

Bolt: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
),

ArrowUturnLeft: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M9 14L4 9l5-5"/>
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
  </svg>
),

Pencil: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
),

ViewfinderCircle: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6"/>
    <path d="M12 17v6"/>
    <path d="M1 12h6"/>
    <path d="M17 12h6"/>
  </svg>
),

Cube: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <path d="M3.29 7 12 12l8.71-5"/>
    <path d="M12 22V12"/>
  </svg>
),

Trash: (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
),
};