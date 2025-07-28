// plugins/editor/components/BottomTabs.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '../store.js';

const defaultTabs = [
  { id: 'assets', label: 'Assets', icon: Icons.Cube },
  { id: 'scripts', label: 'Scripts', icon: Icons.CodeBracket },
  { id: 'animation', label: 'Animation', icon: Icons.Play },
  { id: 'node-editor', label: 'Node Editor', icon: Icons.AdjustmentsHorizontal },
  { id: 'timeline', label: 'Timeline', icon: Icons.Clock },
  { id: 'console', label: 'Console', icon: Icons.CommandLine },
  { id: 'materials', label: 'Materials', icon: Icons.Materials },
  { id: 'terrain', label: 'Terrain', icon: Icons.Terrain },
  { id: 'lighting', label: 'Lighting', icon: Icons.Sun },
  { id: 'physics', label: 'Physics', icon: Icons.Cube },
  { id: 'audio', label: 'Audio', icon: Icons.Audio },
  { id: 'effects', label: 'Effects', icon: Icons.Effects },
];

function BottomTabs({ activeTab, onTabChange, isAssetPanelOpen, onToggleAssetPanel, rightPanelWidth, isScenePanelOpen }) {
  const { ui } = useSnapshot(editorState);
  const { bottomTabOrder } = ui;
  const { setBottomTabOrder, hydrateFromLocalStorage } = editorActions;
  
  // Create ordered tabs based on stored order
  const getOrderedTabs = () => {
    const tabsMap = defaultTabs.reduce((map, tab) => {
      map[tab.id] = tab;
      return map;
    }, {});
    
    return bottomTabOrder.map(id => tabsMap[id]).filter(Boolean);
  };
  
  const [allTabs, setAllTabs] = useState(getOrderedTabs());
  const [visibleTabs, setVisibleTabs] = useState(getOrderedTabs());
  const [overflowTabs, setOverflowTabs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedTab: null,
    dragOverTab: null,
    dragStartX: 0,
    dragOffsetX: 0
  });
  const [dragOverOverflowButton, setDragOverOverflowButton] = useState(false);
  const dropdownOpenTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const tabsRef = useRef(null);
  const overflowButtonRef = useRef(null);

  // Update tabs when bottomTabOrder changes (e.g., from localStorage)
  useEffect(() => {
    const orderedTabs = getOrderedTabs();
    setAllTabs(orderedTabs);
  }, [bottomTabOrder]);

  useEffect(() => {
    const calculateVisibleTabs = () => {
      if (!containerRef.current || !tabsRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const toggleButtonWidth = 40; // Panel toggle button width
      const overflowButtonWidth = 40; // Width of overflow menu button
      
      // Account for toggle button on the right
      const actualAvailableWidth = containerWidth - toggleButtonWidth;
      
      let currentWidth = 0;
      let visibleCount = 0;
      
      // First pass: see how many tabs fit without overflow button
      for (let i = 0; i < allTabs.length; i++) {
        const tabWidth = allTabs[i].label.length * 7 + 50;
        if (currentWidth + tabWidth <= actualAvailableWidth) {
          currentWidth += tabWidth;
          visibleCount++;
        } else {
          break;
        }
      }
      
      // If not all tabs fit, we need overflow button, so recalculate with its space reserved
      if (visibleCount < allTabs.length) {
        currentWidth = 0;
        visibleCount = 0;
        const availableWidthWithOverflow = actualAvailableWidth - overflowButtonWidth;
        
        for (let i = 0; i < allTabs.length; i++) {
          const tabWidth = allTabs[i].label.length * 7 + 50;
          if (currentWidth + tabWidth <= availableWidthWithOverflow) {
            currentWidth += tabWidth;
            visibleCount++;
          } else {
            break;
          }
        }
        
        setVisibleTabs(allTabs.slice(0, Math.max(1, visibleCount)));
        setOverflowTabs(allTabs.slice(Math.max(1, visibleCount)));
      } else {
        setVisibleTabs(allTabs);
        setOverflowTabs([]);
      }
    };

    calculateVisibleTabs();
    window.addEventListener('resize', calculateVisibleTabs);
    return () => window.removeEventListener('resize', calculateVisibleTabs);
  }, [allTabs, rightPanelWidth, isScenePanelOpen]);

  // Update dropdown position when window resizes or dropdown is open
  useEffect(() => {
    const updateDropdownPosition = () => {
      if (showDropdown && overflowButtonRef.current) {
        const rect = overflowButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          x: rect.right, // Align to right edge of button
          y: rect.top - 8 // 8px above the button
        });
      }
    };

    const handleClickOutside = (event) => {
      if (overflowButtonRef.current && !overflowButtonRef.current.contains(event.target)) {
        // Check if click is inside dropdown
        const dropdownElement = document.querySelector('[data-dropdown="true"]');
        if (!dropdownElement || !dropdownElement.contains(event.target)) {
          setShowDropdown(false);
        }
      }
    };

    if (showDropdown) {
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition);
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const handleTabClick = (tabId) => {
    if (!dragState.isDragging) {
      onTabChange(tabId);
      setShowDropdown(false);
    }
  };

  const toggleDropdown = () => {
    if (!showDropdown && overflowButtonRef.current) {
      const rect = overflowButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        x: rect.right, // Align to right edge of button
        y: rect.top - 8 // 8px above the button
      });
    }
    setShowDropdown(!showDropdown);
  };

  // Drag and drop handlers
  const handleDragStart = (e, tab) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ''); // Required for Firefox
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    
    setDragState({
      isDragging: true,
      draggedTab: tab,
      dragOverTab: null,
      dragStartX: e.clientX,
      dragOffsetX: offsetX
    });
  };

  const handleDragOver = (e, tab) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragState.draggedTab && dragState.draggedTab.id !== tab.id) {
      setDragState(prev => ({ ...prev, dragOverTab: tab }));
    }
  };

  const handleDragLeave = (e) => {
    // Only clear dragOverTab if we're leaving the entire tab area
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setDragState(prev => ({ ...prev, dragOverTab: null }));
    }
  };

  const handleDrop = (e, dropTab) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragState.draggedTab || dragState.draggedTab.id === dropTab.id) {
      setDragState({
        isDragging: false,
        draggedTab: null,
        dragOverTab: null,
        dragStartX: 0,
        dragOffsetX: 0
      });
      return;
    }

    const draggedIndex = allTabs.findIndex(tab => tab.id === dragState.draggedTab.id);
    const dropIndex = allTabs.findIndex(tab => tab.id === dropTab.id);
    
    if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
      const newTabs = [...allTabs];
      const [removed] = newTabs.splice(draggedIndex, 1);
      newTabs.splice(dropIndex, 0, removed);
      setAllTabs(newTabs);
      
      // Persist the new order to store
      const newOrder = newTabs.map(tab => tab.id);
      setBottomTabOrder(newOrder);
    }

    setDragState({
      isDragging: false,
      draggedTab: null,
      dragOverTab: null,
      dragStartX: 0,
      dragOffsetX: 0
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedTab: null,
      dragOverTab: null,
      dragStartX: 0,
      dragOffsetX: 0
    });
    setDragOverOverflowButton(false);
    if (dropdownOpenTimeoutRef.current) {
      clearTimeout(dropdownOpenTimeoutRef.current);
      dropdownOpenTimeoutRef.current = null;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownOpenTimeoutRef.current) {
        clearTimeout(dropdownOpenTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="h-10 bg-slate-900 border-t border-slate-700 border-b border-slate-700 flex items-center relative z-50" suppressHydrationWarning>
      <div ref={tabsRef} className="flex flex-1 overflow-hidden">
        {visibleTabs.map((tab) => {
          const isDragged = dragState.draggedTab?.id === tab.id;
          const isDragOver = dragState.dragOverTab?.id === tab.id;
          
          return (
            <button
              key={tab.id}
              draggable
              onClick={() => handleTabClick(tab.id)}
              onDragStart={(e) => handleDragStart(e, tab)}
              onDragOver={(e) => handleDragOver(e, tab)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab)}
              onDragEnd={handleDragEnd}
              className={`relative flex items-center px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap select-none ${
                isDragged 
                  ? 'opacity-50 cursor-grabbing' 
                  : 'hover:bg-slate-800 cursor-grab'
              } ${
                activeTab === tab.id 
                  ? 'text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              style={{
                transform: isDragged ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              
              {/* Blue bottom border for active tab */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" suppressHydrationWarning></div>
              )}
              
              {/* Drop indicator */}
              {isDragOver && (
                <div className="absolute inset-y-0 left-0 w-0.5 bg-blue-500 z-10"></div>
              )}
            </button>
          );
        })}
        
        {/* Drop zone for moving overflow items to visible */}
        {overflowTabs.length > 0 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (dragState.draggedTab && overflowTabs.some(tab => tab.id === dragState.draggedTab.id)) {
                e.dataTransfer.dropEffect = 'move';
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragState.draggedTab && overflowTabs.some(tab => tab.id === dragState.draggedTab.id)) {
                // Move from overflow to end of visible
                const draggedIndex = allTabs.findIndex(tab => tab.id === dragState.draggedTab.id);
                const lastVisibleIndex = visibleTabs.length - 1;
                const targetIndex = allTabs.findIndex(tab => tab.id === visibleTabs[lastVisibleIndex].id);
                
                if (draggedIndex !== -1 && targetIndex !== -1) {
                  const newTabs = [...allTabs];
                  const [removed] = newTabs.splice(draggedIndex, 1);
                  newTabs.splice(targetIndex + 1, 0, removed);
                  setAllTabs(newTabs);
                  
                  // Persist the new order to store
                  const newOrder = newTabs.map(tab => tab.id);
                  setBottomTabOrder(newOrder);
                }
                setDragState({
                  isDragging: false,
                  draggedTab: null,
                  dragOverTab: null,
                  dragStartX: 0,
                  dragOffsetX: 0
                });
              }
            }}
            className="w-4 h-full flex items-center justify-center"
          >
            {dragState.draggedTab && overflowTabs.some(tab => tab.id === dragState.draggedTab.id) && (
              <div className="w-0.5 h-6 bg-blue-500 opacity-50"></div>
            )}
          </div>
        )}
        
        {/* Overflow button */}
        {overflowTabs.length > 0 && (
          <div className="relative">
            <button
              ref={overflowButtonRef}
              onClick={toggleDropdown}
              onDragEnter={(e) => {
                e.preventDefault();
                if (dragState.draggedTab) {
                  setDragOverOverflowButton(true);
                  // Auto-open dropdown after a short delay
                  if (dropdownOpenTimeoutRef.current) {
                    clearTimeout(dropdownOpenTimeoutRef.current);
                  }
                  dropdownOpenTimeoutRef.current = setTimeout(() => {
                    if (!showDropdown) {
                      const rect = overflowButtonRef.current?.getBoundingClientRect();
                      if (rect) {
                        setDropdownPosition({
                          x: rect.right,
                          y: rect.top - 8
                        });
                        setShowDropdown(true);
                      }
                    }
                  }, 500); // 500ms delay before opening
                }
              }}
              onDragLeave={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const { clientX, clientY } = e;
                
                // Only clear if we're actually leaving the button area
                if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
                  setDragOverOverflowButton(false);
                  if (dropdownOpenTimeoutRef.current) {
                    clearTimeout(dropdownOpenTimeoutRef.current);
                    dropdownOpenTimeoutRef.current = null;
                  }
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragState.draggedTab) {
                  e.dataTransfer.dropEffect = 'move';
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverOverflowButton(false);
                if (dropdownOpenTimeoutRef.current) {
                  clearTimeout(dropdownOpenTimeoutRef.current);
                  dropdownOpenTimeoutRef.current = null;
                }
                
                if (dragState.draggedTab && visibleTabs.some(tab => tab.id === dragState.draggedTab.id)) {
                  // Move from visible to overflow (move to end)
                  const draggedIndex = allTabs.findIndex(tab => tab.id === dragState.draggedTab.id);
                  if (draggedIndex !== -1) {
                    const newTabs = [...allTabs];
                    const [removed] = newTabs.splice(draggedIndex, 1);
                    newTabs.push(removed); // Add to end
                    setAllTabs(newTabs);
                    
                    // Persist the new order to store
                    const newOrder = newTabs.map(tab => tab.id);
                    setBottomTabOrder(newOrder);
                  }
                  setDragState({
                    isDragging: false,
                    draggedTab: null,
                    dragOverTab: null,
                    dragStartX: 0,
                    dragOffsetX: 0
                  });
                }
              }}
              className={`relative flex items-center px-3 py-2.5 text-sm font-medium transition-colors ${
                dragOverOverflowButton 
                  ? 'bg-blue-600/20 border border-blue-500'
                  : 'hover:bg-slate-800'
              } ${
                overflowTabs.some(tab => tab.id === activeTab)
                  ? 'text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icons.MenuBars className="w-4 h-4" />
              
              {/* Blue bottom border if active tab is in overflow */}
              {overflowTabs.some(tab => tab.id === activeTab) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Right side controls */}
      <div className="flex items-center pr-1">
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
      
      {/* Fixed position dropdown portal */}
      {showDropdown && overflowTabs.length > 0 && (
        <div 
          className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-2xl shadow-black/50 min-w-48 pointer-events-auto"
          data-dropdown="true"
          style={{
            left: `${dropdownPosition.x}px`,
            top: `${dropdownPosition.y}px`,
            transform: 'translate(-100%, -100%)',
            zIndex: 9999
          }}
        >
          {overflowTabs.map((tab) => {
            const isDragged = dragState.draggedTab?.id === tab.id;
            const isDragOver = dragState.dragOverTab?.id === tab.id;
            
            return (
              <button
                key={tab.id}
                draggable
                onClick={() => handleTabClick(tab.id)}
                onDragStart={(e) => handleDragStart(e, tab)}
                onDragOver={(e) => handleDragOver(e, tab)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, tab)}
                onDragEnd={handleDragEnd}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium transition-all first:rounded-t-lg last:rounded-b-lg select-none ${
                  isDragged 
                    ? 'opacity-50 cursor-grabbing' 
                    : 'hover:bg-slate-700 cursor-grab'
                } ${
                  activeTab === tab.id 
                    ? 'text-blue-400 bg-slate-700/50' 
                    : 'text-gray-300 hover:text-gray-200'
                }`}
                style={{
                  transform: isDragged ? 'scale(0.95)' : 'scale(1)',
                }}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
                
                {/* Drop indicator */}
                {isDragOver && (
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-blue-500 z-10"></div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BottomTabs;