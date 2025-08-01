import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';
import { projectManager } from '@/plugins/projects/projectManager.js';
import { assetManager, PRIORITY } from '@/plugins/assets/OptimizedAssetManager.js';
import ModelPreview from './ModelPreview.jsx';
import ContextMenu from '@/plugins/editor/components/ui/ContextMenu.jsx';
import { useContextMenuActions } from '@/plugins/editor/components/actions/ContextMenuActions.jsx';

function AssetLibrary() {
  const [viewMode, setViewMode] = useState('folder'); // 'folder' or 'type'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' or 'list'
  const [currentPath, setCurrentPath] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('3d-models');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [assets, setAssets] = useState([]);
  const [folderTree, setFolderTree] = useState(null);
  const [assetCategories, setAssetCategories] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['']));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedAssets, setLoadedAssets] = useState(new Set());
  const [preloadingAssets, setPreloadingAssets] = useState(new Set());
  const [failedAssets, setFailedAssets] = useState(new Set());
  const [showLoadingBar, setShowLoadingBar] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const [dragOverTreeFolder, setDragOverTreeFolder] = useState(null);
  const [dragOverBreadcrumb, setDragOverBreadcrumb] = useState(null);
  const [isInternalDrag, setIsInternalDrag] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  
  // Cache for folder trees, assets by path, and categories
  const cacheRef = useRef({
    folderTree: null,
    folderTreeTimestamp: null,
    assetsByPath: new Map(), // path -> { assets, timestamp }
    categories: null,
    categoriesTimestamp: null,
    lastProjectName: null
  });
  
  const { ui } = useSnapshot(editorState);
  const { assetsLibraryWidth: treePanelWidth } = ui;
  const { setAssetsLibraryWidth: setTreePanelWidth } = editorActions;
  
  // Get context menu actions
  const { handleCreateObject } = useContextMenuActions(editorActions);

  // Cache expiry time (5 minutes)
  const CACHE_EXPIRY_MS = 5 * 60 * 1000;
  
  // Get cache statistics for debugging
  const getCacheStats = () => {
    const cache = cacheRef.current;
    return {
      folderTreeCached: !!cache.folderTree,
      categoriesCached: !!cache.categories,
      pathsCached: cache.assetsByPath.size,
      project: cache.lastProjectName
    };
  };
  
  // Clear cache when project changes
  const clearCacheIfProjectChanged = (currentProject) => {
    if (cacheRef.current.lastProjectName !== currentProject.name) {
      console.log('🗑️ Clearing cache due to project change', {
        from: cacheRef.current.lastProjectName,
        to: currentProject.name
      });
      cacheRef.current = {
        folderTree: null,
        folderTreeTimestamp: null,
        assetsByPath: new Map(),
        categories: null,
        categoriesTimestamp: null,
        lastProjectName: currentProject.name
      };
    } else {
      console.log('📊 Cache stats:', getCacheStats());
    }
  };

  // Check if cache is still valid
  const isCacheValid = (timestamp) => {
    return timestamp && (Date.now() - timestamp) < CACHE_EXPIRY_MS;
  };

  // Cached folder tree fetcher
  const fetchFolderTree = async (currentProject) => {
    if (cacheRef.current.folderTree && isCacheValid(cacheRef.current.folderTreeTimestamp)) {
      console.log('📂 Using cached folder tree');
      setFolderTree(cacheRef.current.folderTree);
      return;
    }

    try {
      console.log('📂 Fetching folder tree from server');
      const response = await fetch(`/api/projects/${currentProject.name}/assets/tree`);
      if (!response.ok) {
        throw new Error('Failed to fetch folder tree');
      }

      const data = await response.json();
      cacheRef.current.folderTree = data.tree;
      cacheRef.current.folderTreeTimestamp = Date.now();
      setFolderTree(data.tree);
    } catch (err) {
      console.error('Error fetching folder tree:', err);
      setError(err.message);
    }
  };

  // Cached asset categories fetcher
  const fetchAssetCategories = async (currentProject) => {
    if (cacheRef.current.categories && isCacheValid(cacheRef.current.categoriesTimestamp)) {
      console.log('📊 Using cached asset categories');
      setAssetCategories(cacheRef.current.categories);
      
      // Set initial assets for the selected category
      const categoryAssets = cacheRef.current.categories[selectedCategory]?.files || [];
      setAssets(categoryAssets);
      setLoading(false);
      return;
    }

    try {
      console.log('📊 Fetching asset categories from server');
      const response = await fetch(`/api/projects/${currentProject.name}/assets/categories`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Categories fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch asset categories: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      cacheRef.current.categories = data.categories;
      cacheRef.current.categoriesTimestamp = Date.now();
      setAssetCategories(data.categories);
      
      // Set initial assets for the selected category
      const categoryAssets = data.categories[selectedCategory]?.files || [];
      setAssets(categoryAssets);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching asset categories:', err);
      setError(`Failed to load asset categories: ${err.message}`);
      setLoading(false);
    }
  };

  // Cached assets fetcher by path
  const fetchAssets = async (currentProject, path = currentPath) => {
    const cachedData = cacheRef.current.assetsByPath.get(path);
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      console.log(`📁 Using cached assets for path: ${path || 'root'}`);
      setAssets(cachedData.assets);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`📁 Fetching assets from server for path: ${path || 'root'}`);
      const response = await fetch(`/api/projects/${currentProject.name}/assets?folder=${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      const newAssets = data.assets || [];
      
      // Cache the result
      cacheRef.current.assetsByPath.set(path, {
        assets: newAssets,
        timestamp: Date.now()
      });
      
      setAssets(newAssets);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err.message);
      setAssets([]);
      setLoading(false);
    }
  };

  // Fetch data based on view mode
  useEffect(() => {
    const currentProject = projectManager.getCurrentProject();
    if (!currentProject.name) {
      setError('No project loaded');
      return;
    }

    clearCacheIfProjectChanged(currentProject);

    if (viewMode === 'folder') {
      fetchFolderTree(currentProject);
      fetchAssets(currentProject);
    } else {
      // Type view - always fetch categories first
      setLoading(true);
      fetchAssetCategories(currentProject);
    }

    // Handle real-time file changes from WebSocket
    const handleFileChange = (changeData) => {
      console.log('📁 File change detected in assets:', changeData);
      
      // Intelligently invalidate cache based on what changed
      if (changeData.path.startsWith('assets/') || changeData.type === 'assets_directory_recreated') {
        console.log('🗑️ Invalidating cache due to file change:', changeData.path);
        
        // Invalidate folder tree cache
        cacheRef.current.folderTree = null;
        cacheRef.current.folderTreeTimestamp = null;
        
        // Invalidate categories cache
        cacheRef.current.categories = null;
        cacheRef.current.categoriesTimestamp = null;
        
        // Clear all cached assets by path since file structure might have changed
        cacheRef.current.assetsByPath.clear();
        
        // Refresh data based on current view mode
        console.log('🔄 Refreshing assets due to change:', changeData.path);
        if (viewMode === 'folder') {
          fetchFolderTree(currentProject);
          fetchAssets(currentProject);
        } else {
          fetchAssetCategories(currentProject);
        }
      }
    };

    // Add file change listener
    projectManager.addFileChangeListener(handleFileChange);

    // Cleanup on unmount
    return () => {
      projectManager.removeFileChangeListener(handleFileChange);
    };
  }, [currentPath, viewMode, selectedCategory, assetCategories]);

  // Handle currentPath changes for folder view
  useEffect(() => {
    const currentProject = projectManager.getCurrentProject();
    if (!currentProject.name || viewMode !== 'folder') return;

    fetchAssets(currentProject, currentPath);
  }, [currentPath]);

  // Optimized asset loading using asset manager
  const queueAssetForLoading = (asset, priority = PRIORITY.MEDIUM) => {
    // Set current project for asset manager
    const currentProject = projectManager.getCurrentProject();
    assetManager.setCurrentProject(currentProject.name);
    
    // Queue asset for loading
    assetManager.queueAsset(asset, priority);
    
    // Update UI state based on asset manager state
    const state = assetManager.getAssetState(asset.id);
    
    if (state === 'loading') {
      setPreloadingAssets(prev => new Set([...prev, asset.id]));
    } else if (state === 'loaded') {
      setLoadedAssets(prev => new Set([...prev, asset.id]));
      setPreloadingAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(asset.id);
        return newSet;
      });
    } else if (state === 'error') {
      setFailedAssets(prev => new Set([...prev, asset.id]));
      setPreloadingAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(asset.id);
        return newSet;
      });
    }
  };

  // Generate breadcrumb navigation (folder view only)
  const breadcrumbs = React.useMemo(() => {
    if (viewMode !== 'folder') return [];
    if (!currentPath) return [{ name: 'assets', path: '' }];
    
    const parts = currentPath.split('/');
    const crumbs = [{ name: 'assets', path: '' }];
    
    let currentBreadcrumbPath = '';
    for (const part of parts) {
      currentBreadcrumbPath = currentBreadcrumbPath ? `${currentBreadcrumbPath}/${part}` : part;
      crumbs.push({ name: part, path: currentBreadcrumbPath });
    }
    
    return crumbs;
  }, [currentPath, viewMode]);

  const getCategoryIcon = (categoryId) => {
    const iconMap = {
      '3d-models': Icons.Cube,
      'textures': Icons.Camera,
      'audio': Icons.Audio,
      'scripts': Icons.Code,
      'data': Icons.FolderOpen,
      'misc': Icons.Folder
    };
    return iconMap[categoryId] || Icons.Folder;
  };

  // Generate asset type categories for type view
  const categoryList = React.useMemo(() => {
    if (!assetCategories) return [];
    
    return Object.entries(assetCategories).map(([id, data]) => ({
      id,
      label: data.name,
      count: data.files.length,
      icon: getCategoryIcon(id)
    }));
  }, [assetCategories]);

  // Global search across all assets
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Perform global search when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setGlobalSearchResults([]);
      setIsSearching(false);
      return;
    }

    const performGlobalSearch = async () => {
      setIsSearching(true);
      const currentProject = projectManager.getCurrentProject();
      if (!currentProject.name) {
        setIsSearching(false);
        return;
      }

      try {
        const response = await fetch(`/api/projects/${currentProject.name}/assets/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setGlobalSearchResults(data.results || []);
        } else {
          // Fallback to client-side search if server search is not available
          console.warn('Server search not available, falling back to client-side search');
          setGlobalSearchResults([]);
        }
      } catch (error) {
        console.warn('Search API error, falling back to client-side search:', error);
        // Fallback: search through cached data
        performClientSideGlobalSearch();
      } finally {
        setIsSearching(false);
      }
    };

    const performClientSideGlobalSearch = () => {
      const searchResults = [];
      const searchLower = searchQuery.toLowerCase();
      
      // Search through cached assets by path
      cacheRef.current.assetsByPath.forEach((pathData, path) => {
        pathData.assets.forEach(asset => {
          if (asset.name.toLowerCase().includes(searchLower) || 
              asset.fileName?.toLowerCase().includes(searchLower)) {
            searchResults.push({
              ...asset,
              path: path ? `${path}/${asset.name}` : asset.name
            });
          }
        });
      });
      
      // Search through categories if available
      if (cacheRef.current.categories) {
        Object.values(cacheRef.current.categories).forEach(category => {
          category.files?.forEach(asset => {
            if (asset.name.toLowerCase().includes(searchLower) || 
                asset.fileName?.toLowerCase().includes(searchLower)) {
              // Avoid duplicates
              if (!searchResults.find(r => r.id === asset.id)) {
                searchResults.push(asset);
              }
            }
          });
        });
      }
      
      setGlobalSearchResults(searchResults);
    };

    // Debounce search to avoid too many requests
    const searchTimeout = setTimeout(performGlobalSearch, 300);
    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Filter assets by search query - use global results if searching, otherwise current directory
  const filteredAssets = React.useMemo(() => {
    if (!searchQuery) return assets;
    
    // If we have global search results, use them
    if (globalSearchResults.length > 0) {
      return globalSearchResults;
    }
    
    // Fallback to local filtering of current directory
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           asset.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [assets, searchQuery, globalSearchResults]);

  // Get current category assets when in type view
  useEffect(() => {
    if (viewMode === 'type' && assetCategories) {
      const categoryAssets = assetCategories[selectedCategory]?.files || [];
      setAssets(categoryAssets);
      setLoading(false);
    }
  }, [viewMode, selectedCategory, assetCategories]);

  // Check asset loading states (most assets should already be preloaded during engine initialization)
  useEffect(() => {
    if (assets.length === 0) return;

    // Initialize asset manager for current project if not already done
    const currentProject = projectManager.getCurrentProject();
    if (currentProject.name) {
      assetManager.setCurrentProject(currentProject.name);
    }
    
    // Update UI state for assets that were already loaded during engine initialization
    const newLoadedAssets = new Set();
    const newFailedAssets = new Set();
    const newPreloadingAssets = new Set();
    
    assets.forEach(asset => {
      if (asset.type === 'file') {
        const state = assetManager.getAssetState(asset.id);
        
        if (state === 'loaded') {
          newLoadedAssets.add(asset.id);
        } else if (state === 'error') {
          newFailedAssets.add(asset.id);
        } else if (state === 'loading') {
          newPreloadingAssets.add(asset.id);
        } else if (state === 'idle') {
          // Queue assets that weren't preloaded during engine initialization
          const isVisible = filteredAssets.includes(asset);
          const priority = isVisible ? PRIORITY.HIGH : PRIORITY.MEDIUM;
          queueAssetForLoading(asset, priority);
        }
      }
    });
    
    // Update state with preloaded assets
    setLoadedAssets(newLoadedAssets);
    setFailedAssets(newFailedAssets);
    setPreloadingAssets(newPreloadingAssets);
    
    // Set up periodic state checking to update UI
    const stateCheckInterval = setInterval(() => {
      assets.forEach(asset => {
        const state = assetManager.getAssetState(asset.id);
        
        if (state === 'loaded' && !loadedAssets.has(asset.id)) {
          setLoadedAssets(prev => new Set([...prev, asset.id]));
          setPreloadingAssets(prev => {
            const newSet = new Set(prev);
            newSet.delete(asset.id);
            return newSet;
          });
        } else if (state === 'error' && !failedAssets.has(asset.id)) {
          setFailedAssets(prev => new Set([...prev, asset.id]));
          setPreloadingAssets(prev => {
            const newSet = new Set(prev);
            newSet.delete(asset.id);
            return newSet;
          });
        } else if (state === 'loading' && !preloadingAssets.has(asset.id)) {
          setPreloadingAssets(prev => new Set([...prev, asset.id]));
        }
      });
    }, 300); // Check every 300ms (more frequent for better responsiveness)
    
    return () => clearInterval(stateCheckInterval);
  }, [assets, filteredAssets]);

  // Monitor loading completion and fade out progress bar
  useEffect(() => {
    if (filteredAssets.length === 0) return;

    const totalAssets = filteredAssets.length;
    const completedAssets = filteredAssets.filter(asset => 
      loadedAssets.has(asset.id) || failedAssets.has(asset.id)
    ).length;
    const stillLoading = preloadingAssets.size > 0;

    // If all assets are processed (loaded or failed) and nothing is currently loading
    if (completedAssets === totalAssets && !stillLoading && showLoadingBar) {
      // Wait 1 second after completion, then fade out
      const fadeTimer = setTimeout(() => {
        setShowLoadingBar(false);
      }, 1000);

      return () => clearTimeout(fadeTimer);
    }
  }, [filteredAssets, loadedAssets, failedAssets, preloadingAssets, showLoadingBar]);

  // Reset loading bar visibility when assets change - but only show if assets need loading
  useEffect(() => {
    if (filteredAssets.length > 0) {
      // Check if any assets actually need loading
      const needsLoading = filteredAssets.some(asset => {
        if (asset.type !== 'file') return false;
        const state = assetManager.getAssetState(asset.id);
        return state === 'idle' || state === 'loading';
      });
      
      // Only show loading bar if there are assets that need loading
      setShowLoadingBar(needsLoading);
    }
  }, [filteredAssets]);

  const handleResizeMouseDown = (e) => {
    setIsResizing(true);
    document.body.classList.add('dragging-horizontal');
    e.preventDefault();
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    setTreePanelWidth(Math.max(200, Math.min(400, newWidth)));
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
    document.body.classList.remove('dragging-horizontal');
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [isResizing]);

  // Handle file upload
  const uploadFiles = async (files) => {
    setIsUploading(true);
    const currentProject = projectManager.getCurrentProject();
    if (!currentProject.name) {
      console.error('No project loaded for file upload');
      setIsUploading(false);
      return;
    }

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Extract folder path from file.webkitRelativePath if it exists (for folder uploads)
        let folderPath = '';
        let category = 'misc';
        
        if (file.webkitRelativePath) {
          // This is a folder upload - preserve directory structure
          const pathParts = file.webkitRelativePath.split('/');
          if (pathParts.length > 1) {
            // Remove the filename, keep the directory structure
            folderPath = pathParts.slice(0, -1).join('/');
          }
        } else {
          // Regular file upload - determine category based on file type
          const ext = file.name.toLowerCase().split('.').pop();
          if (['glb', 'gltf', 'obj', 'fbx'].includes(ext)) {
            category = 'models';
          } else if (['jpg', 'jpeg', 'png', 'bmp', 'tga', 'webp'].includes(ext)) {
            category = 'textures';
          } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
            category = 'audio';
          } else if (['js', 'ts', 'py'].includes(ext)) {
            category = 'scripts';
          } else if (['json', 'xml'].includes(ext)) {
            category = 'data';
          }
        }
        
        const headers = {
          'X-Asset-Category': category
        };
        
        // Add folder path header if this is a folder upload
        if (folderPath) {
          headers['X-Folder-Path'] = folderPath;
        }
        
        const response = await fetch(`/api/projects/${currentProject.name}/assets/upload`, {
          method: 'POST',
          body: formData,
          headers: headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        const result = await response.json();
        console.log(`✅ Uploaded ${file.name} to ${result.path}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop events for external file uploads
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only show upload overlay for external drags (not internal asset drags)
    if (!isInternalDrag && !isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only show upload overlay for external drags (not internal asset drags)
    if (!isInternalDrag) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide drag over if we're leaving the asset grid area
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    // Only handle external file uploads, not internal asset drags
    if (!isInternalDrag) {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        uploadFiles(files);
      }
    }
  };

  // Handle context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const contextMenuItems = [
      {
        label: 'Create Object',
        action: () => {},
        icon: <Icons.PlusCircle className="w-4 h-4" />,
        submenu: [
          { label: 'Cube', action: () => handleCreateObject('cube'), icon: <Icons.Cube className="w-4 h-4" /> },
          { label: 'Sphere', action: () => handleCreateObject('sphere'), icon: <Icons.Circle className="w-4 h-4" /> },
          { label: 'Cylinder', action: () => handleCreateObject('cylinder'), icon: <Icons.Rectangle className="w-4 h-4" /> },
          { label: 'Plane', action: () => handleCreateObject('plane'), icon: <Icons.Square2Stack className="w-4 h-4" /> },
          { separator: true },
          { label: 'Light', action: () => handleCreateObject('light'), icon: <Icons.LightBulb className="w-4 h-4" /> },
          { label: 'Camera', action: () => handleCreateObject('camera'), icon: <Icons.Camera className="w-4 h-4" /> },
        ]
      },
      { separator: true },
      {
        label: 'Upload Files...',
        action: () => handleUploadClick(),
        icon: <Icons.Upload className="w-4 h-4" />,
        shortcut: 'Ctrl+U'
      },
      {
        label: 'Upload Folder...',
        action: () => handleUploadFolderClick(),
        icon: <Icons.FolderOpen className="w-4 h-4" />
      },
      { separator: true },
      {
        label: 'Camera',
        action: () => {},
        icon: <Icons.Camera className="w-4 h-4" />,
        submenu: [
          { label: 'Frame All', action: () => handleFrameAll(), icon: <Icons.ArrowsPointingOut className="w-4 h-4" />, shortcut: 'F' },
          { label: 'Frame Selected', action: () => handleFocusSelected(), icon: <Icons.MagnifyingGlass className="w-4 h-4" />, shortcut: 'Shift+F' },
          { separator: true },
          { label: 'Reset View', action: () => handleResetView(), icon: <Icons.ArrowPath className="w-4 h-4" /> },
          { separator: true },
          { label: 'Top View', action: () => handleSetView('top'), icon: <Icons.ArrowUp className="w-4 h-4" />, shortcut: 'Numpad 7' },
          { label: 'Front View', action: () => handleSetView('front'), icon: <Icons.ArrowRight className="w-4 h-4" />, shortcut: 'Numpad 1' },
          { label: 'Right View', action: () => handleSetView('right'), icon: <Icons.ArrowDown className="w-4 h-4" />, shortcut: 'Numpad 3' },
        ]
      },
      {
        label: 'Refresh',
        action: () => window.location.reload(),
        icon: <Icons.ArrowPath className="w-4 h-4" />,
        shortcut: 'F5'
      },
      { separator: true },
      {
        label: 'New Folder',
        action: () => handleCreateFolder(),
        icon: <Icons.Folder className="w-4 h-4" />
      }
    ];
    
    setContextMenu({
      items: contextMenuItems,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  // Handle file picker
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleFolderInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
    // Reset input so same folder can be selected again
    e.target.value = '';
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Handle moving folders and files
  const handleMoveItem = async (sourcePath, targetFolderPath) => {
    const currentProject = projectManager.getCurrentProject();
    if (!currentProject.name) {
      console.error('No project loaded for move operation');
      return;
    }

    const sourceFileName = sourcePath.split('/').pop();
    const targetPath = targetFolderPath ? `${targetFolderPath}/${sourceFileName}` : sourceFileName;

    try {
      const response = await fetch(`/api/projects/${currentProject.name}/assets/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourcePath,
          targetPath
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to move item');
      }

      const result = await response.json();
      console.log(`📁 Item moved: ${result.sourcePath} → ${result.targetPath}`);
      
      // The file watcher will automatically refresh the assets list
    } catch (error) {
      console.error('Error moving item:', error);
      setError(`Failed to move item: ${error.message}`);
    }
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName || !folderName.trim()) {
      return;
    }

    const currentProject = projectManager.getCurrentProject();
    if (!currentProject.name) {
      console.error('No project loaded for folder creation');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${currentProject.name}/assets/folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          folderName: folderName.trim(),
          parentPath: viewMode === 'folder' ? currentPath : ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create folder');
      }

      const result = await response.json();
      console.log(`📁 Folder created: ${result.path}`);
      
      // The file watcher will automatically refresh the assets list
    } catch (error) {
      console.error('Error creating folder:', error);
      setError(`Failed to create folder: ${error.message}`);
    }
  };

  // Handle folder navigation
  const handleFolderClick = (folderPath) => {
    setCurrentPath(folderPath);
  };

  const handleFolderToggle = (folderPath) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const handleBreadcrumbClick = (path) => {
    setCurrentPath(path);
  };

  // Handle double-click on folder items in the grid
  const handleAssetDoubleClick = (asset) => {
    if (asset.type === 'folder') {
      setCurrentPath(asset.path);
    }
  };

  // Render folder tree recursively
  const renderFolderTree = (node, depth = 0) => {
    if (!node) return null;

    const isExpanded = expandedFolders.has(node.path);
    const isSelected = currentPath === node.path;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 text-xs cursor-pointer transition-colors ${ 
            dragOverTreeFolder === node.path 
              ? 'bg-blue-600/30 border-2 border-blue-400 border-dashed rounded'
              : isSelected 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-slate-700 hover:text-white'
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          onClick={() => handleFolderClick(node.path)}
          onDragOver={(e) => {
            if (isInternalDrag && viewMode === 'folder') {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverTreeFolder(node.path);
            }
          }}
          onDragEnter={(e) => {
            if (isInternalDrag && viewMode === 'folder') {
              e.preventDefault();
              setDragOverTreeFolder(node.path);
            }
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDragOverTreeFolder(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (isInternalDrag && viewMode === 'folder') {
              setDragOverTreeFolder(null);
              
              try {
                const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
                if (dragData.type === 'asset' && dragData.path !== node.path) {
                  // Don't allow dropping a folder into itself or its children
                  if (dragData.assetType === 'folder' && node.path.startsWith(dragData.path)) {
                    console.warn('Cannot move folder into itself or its children');
                    return;
                  }
                  handleMoveItem(dragData.path, node.path);
                }
              } catch (error) {
                console.error('Error parsing drag data in tree:', error);
              }
            }
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFolderToggle(node.path);
              }}
              className="mr-1 hover:bg-blue-500 rounded"
            >
              {isExpanded ? (
                <Icons.ChevronDown className="w-3 h-3" />
              ) : (
                <Icons.ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4 mr-1" />}
          <Icons.Folder className={`w-3 h-3 mr-2 ${
            isSelected ? 'text-white' : 'text-yellow-400'
          }`} />
          <span className="truncate">{node.name}</span>
          {node.files && node.files.length > 0 && (
            <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
              isSelected 
                ? 'text-white bg-blue-500' 
                : 'text-gray-400 bg-slate-700'
            }`}>
              {node.files.length}
            </span>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderFolderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Define view action handlers
  const handleFrameAll = () => {
    console.log('Frame All');
    // TODO: Implement frame all functionality
  };

  const handleFocusSelected = () => {
    console.log('Focus Selected');
    // TODO: Implement focus selected functionality
  };

  const handleResetView = () => {
    console.log('Reset View');
    // TODO: Implement reset view functionality
  };

  const handleSetView = (view) => {
    console.log('Set View', view);
    // TODO: Implement set view functionality
  };


  return (
    <div className="h-full flex bg-slate-800 no-select">
      {/* Directory Tree Panel */}
      <div 
        className="bg-slate-900 border-r border-slate-700 flex flex-col relative"
        style={{ width: treePanelWidth }}
      >
        {/* Resize Handle */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-0.5 resize-handle cursor-col-resize ${isResizing ? 'dragging' : ''}`}
          onMouseDown={handleResizeMouseDown}
        />
        {/* Fixed Header */}
        <div className="px-2 py-2 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-300">Project Assets</div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-800 rounded overflow-hidden">
                <button
                  onClick={() => setViewMode('folder')}
                  className={`px-2 py-1 text-xs transition-colors ${
                    viewMode === 'folder'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Folder View"
                >
                  <Icons.Folder className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('type')}
                  className={`px-2 py-1 text-xs transition-colors ${
                    viewMode === 'type'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Asset Type View"
                >
                  <Icons.Cube className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <div className="relative">
            {isSearching ? (
              <div className="w-3 h-3 absolute left-2 top-1.5 animate-spin">
                <div className="w-3 h-3 border border-gray-400 border-t-blue-400 rounded-full"></div>
              </div>
            ) : (
              <Icons.MagnifyingGlass className="w-3 h-3 absolute left-2 top-1.5 text-gray-400" />
            )}
            <input
              type="text"
              placeholder={`Search all assets...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {viewMode === 'folder' ? (
            // Folder Tree View
            folderTree ? (
              <div className="py-1">
                {renderFolderTree(folderTree)}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-xs">
                Loading directory tree...
              </div>
            )
          ) : (
            // Asset Type Categories View
            categoryList.length > 0 ? (
              <div className="space-y-0.5 p-1">
                {categoryList.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-left text-xs rounded hover:bg-slate-800 transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center">
                      <category.icon className={`w-3 h-3 mr-2 ${
                        selectedCategory === category.id ? 'text-white' : 'text-gray-400'
                      }`} />
                      {category.label}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedCategory === category.id 
                        ? 'text-white bg-blue-500' 
                        : 'text-gray-400 bg-slate-700'
                    }`}>{category.count}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-xs">
                Loading asset categories...
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Asset Grid - More Compact */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-200 relative ${
          isDragOver ? 'bg-blue-900/30 border-2 border-blue-400 border-dashed' : 'bg-slate-800'
        }`}
      >
        {/* Fixed Header with controls inline with directory tree */}
        <div className="bg-slate-800 flex-shrink-0 border-b border-slate-700">
          {/* Top row with breadcrumb and controls */}
          <div className="flex items-center justify-between px-3 py-2">
            {/* Breadcrumb Navigation - Top Left */}
            <div className="flex items-center text-xs">
              {viewMode === 'folder' && breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    <button 
                      onClick={() => handleBreadcrumbClick(crumb.path)}
                      className={`px-2 py-1 rounded transition-colors ${
                        dragOverBreadcrumb === crumb.path
                          ? 'bg-blue-600/30 border border-blue-400 border-dashed text-blue-200'
                          : index === breadcrumbs.length - 1 
                            ? 'text-white font-medium hover:text-blue-400' 
                            : 'text-gray-400 hover:text-blue-400'
                      }`}
                      onDragOver={(e) => {
                        if (isInternalDrag) {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          setDragOverBreadcrumb(crumb.path);
                        }
                      }}
                      onDragEnter={(e) => {
                        if (isInternalDrag) {
                          e.preventDefault();
                          setDragOverBreadcrumb(crumb.path);
                        }
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                          setDragOverBreadcrumb(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (isInternalDrag) {
                          setDragOverBreadcrumb(null);
                          
                          try {
                            const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
                            if (dragData.type === 'asset' && dragData.path !== crumb.path) {
                              // Don't allow dropping a folder into itself or its children
                              if (dragData.assetType === 'folder' && crumb.path.startsWith(dragData.path)) {
                                console.warn('Cannot move folder into itself or its children');
                                return;
                              }
                              handleMoveItem(dragData.path, crumb.path);
                            }
                          } catch (error) {
                            console.error('Error parsing drag data in breadcrumb:', error);
                          }
                        }
                      }}
                    >
                      {crumb.name}
                    </button>
                    {index < breadcrumbs.length - 1 && (
                      <Icons.ChevronRight className="w-3 h-3 mx-1 text-gray-600" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                // Show category name when in type view mode
                <span className="text-gray-400 px-2 py-1">
                  {viewMode === 'type' && assetCategories && assetCategories[selectedCategory] 
                    ? assetCategories[selectedCategory].name 
                    : 'Assets'
                  }
                </span>
              )}
            </div>
            
            {/* Controls - Top Right */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{filteredAssets.length} items</span>
              
              {filteredAssets.length > 0 && showLoadingBar && (
                /* Loading progress bar */
                <div className="flex items-center gap-2 transition-all duration-1000 opacity-100">
                  <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300 rounded-full"
                      style={{ 
                        width: `${(filteredAssets.filter(asset => loadedAssets.has(asset.id)).length / filteredAssets.length) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {filteredAssets.filter(asset => loadedAssets.has(asset.id)).length}/{filteredAssets.length}
                  </span>
                </div>
              )}
              
              {/* Grid/List Toggle */}
              <div className="flex bg-slate-700 rounded overflow-hidden">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`px-2 py-1 text-xs transition-colors ${
                    layoutMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-600'
                  }`}
                  title="Grid View"
                >
                  <Icons.Square2Stack className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`px-2 py-1 text-xs transition-colors ${
                    layoutMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-600'
                  }`}
                  title="List View"
                >
                  <Icons.MenuBars className="w-3 h-3" />
                </button>
              </div>
              
              {/* Asset sync status indicator */}
              {filteredAssets.length > 0 && (
                <>
                  {showLoadingBar ? (
                    /* Loading state */
                    <div className="flex items-center gap-1.5 text-blue-400/80 bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-spin" />
                      <span className="text-xs font-medium">Loading...</span>
                    </div>
                  ) : (() => {
                    const fileAssets = filteredAssets.filter(asset => asset.type === 'file');
                    const loadedFiles = fileAssets.filter(asset => loadedAssets.has(asset.id));
                    return loadedFiles.length === fileAssets.length;
                  })() ? (
                    /* All loaded state */
                    <div className="flex items-center gap-1.5 text-green-400/80">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs font-medium">Synced</span>
                    </div>
                  ) : (() => {
                    /* Partial loading state */
                    const fileAssets = filteredAssets.filter(asset => asset.type === 'file');
                    const loadedFiles = fileAssets.filter(asset => loadedAssets.has(asset.id));
                    
                    if (fileAssets.length === 0) {
                      return (
                        <div className="flex items-center gap-1.5 text-green-400/80">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-xs font-medium">Synced</span>
                        </div>
                      );
                    }
                    
                    const percentage = Math.round((loadedFiles.length / fileAssets.length) * 100);
                    return (
                      <div className="flex items-center gap-1.5 text-orange-400/80">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        <span className="text-xs font-medium">{percentage}%</span>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Scrollable Content area */}
        <div 
          className="flex-1 p-3 overflow-y-auto scrollbar-thin"
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onContextMenu={handleContextMenu}
        >

        
        {loading && (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-sm">Loading assets...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-400 mt-12">
            <p className="text-sm">Error: {error}</p>
          </div>
        )}
        
        {isUploading && (
          <div className="text-center text-blue-400 mt-12">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Uploading files...</p>
            </div>
          </div>
        )}
        
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-900/20 backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-blue-400 border-dashed rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-blue-400">Drop files to upload</p>
              <p className="text-sm text-blue-300">Supports 3D models, textures, audio, and more</p>
            </div>
          </div>
        )}
        
        {!loading && !error && !isUploading && (
          <>
            {filteredAssets.length === 0 ? (
              /* Empty folder state - responsive vertical spacing */
              <div className="flex flex-col items-center justify-center min-h-[200px] h-[calc(100vh-500px)] max-h-[400px] py-4 sm:py-6 lg:py-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 border-2 border-gray-600 border-dashed rounded-xl flex items-center justify-center bg-gray-800/30">
                  <Icons.FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                </div>
                
                <h3 className="text-base sm:text-lg font-medium text-gray-300 mb-2">
                  {viewMode === 'folder' 
                    ? 'Empty folder'
                    : `No ${assetCategories?.[selectedCategory]?.name?.toLowerCase() || 'assets'} found`
                  }
                </h3>
                
                <p className="text-sm text-gray-400 mb-4 sm:mb-6 max-w-sm px-4">
                  {viewMode === 'folder' 
                    ? 'This folder is empty. Add some assets to get started.'
                    : `No ${assetCategories?.[selectedCategory]?.name?.toLowerCase() || 'assets'} in this category yet.`
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-3 sm:mb-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors min-w-[120px]"
                  >
                    <Icons.Upload className="w-4 h-4" />
                    Upload Files
                  </button>
                  
                  <button
                    onClick={() => folderInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-300 text-sm font-medium rounded-lg transition-colors min-w-[120px]"
                  >
                    <Icons.Folder className="w-4 h-4" />
                    Upload Folder
                  </button>
                </div>
                
                <p className="text-xs text-gray-500">
                  Or drag and drop files anywhere in this area
                </p>
              </div>
            ) : layoutMode === 'grid' ? (
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-3">
                {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={`group cursor-pointer transition-all duration-200 p-2 rounded hover:bg-slate-700/30 ${
                  dragOverFolder === asset.path ? 'bg-blue-600/30 border-2 border-blue-400 border-dashed' : ''
                }`}
                draggable={true}
                onMouseEnter={() => setHoveredItem(asset.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => {
                  if (asset.type === 'file') {
                    // If asset failed to load, retry on click
                    if (failedAssets.has(asset.id)) {
                      e.preventDefault();
                      console.log(`🔄 Retrying failed asset: ${asset.name}`);
                      // Remove from failed set and retry with high priority
                      setFailedAssets(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(asset.id);
                        return newSet;
                      });
                      queueAssetForLoading(asset, PRIORITY.CRITICAL);
                    }
                  }
                }}
                onDoubleClick={() => handleAssetDoubleClick(asset)}
                onDragStart={(e) => {
                  console.log('🔥 Drag start triggered for:', asset.name, asset.type);
                  
                  // Mark this as an internal drag (originating from within the page)
                  setIsInternalDrag(true);
                  
                  // Handle both files and folders
                  if (asset.type === 'file') {
                    console.log('✅ Starting drag for file:', asset.name);
                    
                    // Determine category based on file extension
                    const getAssetCategory = (extension) => {
                      const ext = extension?.toLowerCase() || '';
                      if (['.glb', '.gltf', '.obj', '.fbx'].includes(ext)) return '3d-models';
                      if (['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tga'].includes(ext)) return 'textures';
                      if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) return 'audio';
                      if (['.js', '.ts', '.py'].includes(ext)) return 'scripts';
                      return 'misc';
                    };
                    
                    const dragData = {
                      type: 'asset',
                      id: asset.id,
                      name: asset.name,
                      path: asset.path,
                      assetType: asset.type,
                      fileName: asset.fileName,
                      extension: asset.extension,
                      mimeType: asset.mimeType,
                      category: getAssetCategory(asset.extension)
                    };
                    
                    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                    e.dataTransfer.setData('text/plain', asset.name);
                    // Add a custom type to identify this as an asset drag (for viewport)
                    e.dataTransfer.setData('application/x-asset-drag', 'true');
                    
                    // Add download URL for dragging to desktop
                    const currentProject = projectManager.getCurrentProject();
                    const downloadUrl = `/api/projects/${currentProject.name}/assets/file/${encodeURIComponent(asset.path)}?download=true`;
                    e.dataTransfer.setData('text/uri-list', downloadUrl);
                    e.dataTransfer.setData('DownloadURL', `${asset.mimeType || 'application/octet-stream'}:${asset.name}:${downloadUrl}`);
                    
                    // Files can be copied to viewport or moved to folders
                    e.dataTransfer.effectAllowed = 'copyMove';
                    
                    // Create drag image for file
                    const dragImage = document.createElement('div');
                    const getFileIcon = (extension) => {
                      if (['.glb', '.gltf', '.obj', '.fbx'].includes(extension)) return '🧊';
                      if (['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(extension)) return '🖼️';
                      if (['.mp3', '.wav', '.ogg', '.m4a'].includes(extension)) return '🎵';
                      if (['.js', '.ts', '.py'].includes(extension)) return '📄';
                      return '📦';
                    };
                    const icon = getFileIcon(asset.extension || '');
                    dragImage.innerHTML = `
                      <div style="
                        background: rgba(59, 130, 246, 0.9);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 500;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        backdrop-filter: blur(8px);
                        border: 1px solid rgba(255,255,255,0.2);
                      ">
                        ${icon} ${asset.name}
                      </div>
                    `;
                    dragImage.style.position = 'absolute';
                    dragImage.style.top = '-1000px';
                    document.body.appendChild(dragImage);
                    
                    e.dataTransfer.setDragImage(dragImage, 50, 20);
                    
                    // Clean up drag image after drag ends
                    setTimeout(() => {
                      document.body.removeChild(dragImage);
                    }, 0);
                    
                  } else if (asset.type === 'folder') {
                    console.log('✅ Starting drag for folder:', asset.name);
                    
                    const dragData = {
                      type: 'asset',
                      id: asset.id,
                      name: asset.name,
                      path: asset.path,
                      assetType: asset.type
                    };
                    
                    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                    e.dataTransfer.setData('text/plain', asset.name);
                    
                    // Folders can only be moved to other folders
                    e.dataTransfer.effectAllowed = 'move';
                    
                    // Create drag image for folder
                    const dragImage = document.createElement('div');
                    dragImage.innerHTML = `
                      <div style="
                        background: rgba(251, 191, 36, 0.9);
                        color: black;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 500;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        backdrop-filter: blur(8px);
                        border: 1px solid rgba(255,255,255,0.2);
                      ">
                        📁 ${asset.name}
                      </div>
                    `;
                    dragImage.style.position = 'absolute';
                    dragImage.style.top = '-1000px';
                    document.body.appendChild(dragImage);
                    
                    e.dataTransfer.setDragImage(dragImage, 50, 20);
                    
                    // Clean up drag image after drag ends
                    setTimeout(() => {
                      document.body.removeChild(dragImage);
                    }, 0);
                  }
                  
                  console.log('📦 Drag data prepared for:', asset.type, asset.name);
                }}
                onDragEnd={() => {
                  // Reset all drag states when drag ends
                  setIsInternalDrag(false);
                  setDragOverFolder(null);
                  setDragOverTreeFolder(null);
                  setDragOverBreadcrumb(null);
                }}
                onDragOver={(e) => {
                  if (asset.type === 'folder' && viewMode === 'folder') {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOverFolder(asset.path);
                  }
                }}
                onDragLeave={(e) => {
                  if (asset.type === 'folder' && !e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverFolder(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (asset.type === 'folder' && viewMode === 'folder') {
                    setDragOverFolder(null);
                    
                    try {
                      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
                      if (dragData.type === 'asset' && dragData.path !== asset.path) {
                        // Don't allow dropping a folder into itself or its children
                        if (dragData.assetType === 'folder' && asset.path.startsWith(dragData.path)) {
                          console.warn('Cannot move folder into itself or its children');
                          return;
                        }
                        handleMoveItem(dragData.path, asset.path);
                      }
                    } catch (error) {
                      console.error('Error parsing drag data:', error);
                    }
                  }
                }}
              >
                {/* Asset Item Container */}
                <div className="relative">
                  {/* Preview or folder icon */}
                  <div className="w-full h-16 mb-2 flex items-center justify-center relative">
                    {asset.type === 'folder' ? (
                      <Icons.Folder className="w-12 h-12 text-yellow-400 group-hover:scale-110 transition-all" />
                    ) : (
                      <ModelPreview
                        asset={asset}
                        className={`w-14 h-14 transition-all group-hover:scale-110 ${
                          loadedAssets.has(asset.id) 
                            ? 'opacity-100' 
                            : failedAssets.has(asset.id) 
                              ? 'opacity-40 grayscale' 
                              : 'opacity-60'
                        }`}
                        isHovered={hoveredItem === asset.id}
                        priority={hoveredItem === asset.id ? PRIORITY.CRITICAL : PRIORITY.MEDIUM}
                      />
                    )}
                    
                    {/* Extension Badge - Top right over the cube (files only) */}
                    {asset.type === 'file' && asset.extension && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full text-center leading-none">
                        {asset.extension.replace('.', '').toUpperCase()}
                      </div>
                    )}

                    {/* Loading/Status Indicator - Bottom right (files only) */}
                    {asset.type === 'file' && (
                      <div className="absolute -bottom-1 -right-1">
                        {preloadingAssets.has(asset.id) ? (
                          // Loading spinner
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : failedAssets.has(asset.id) ? (
                          // Error cross
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center" title={`Failed to load ${asset.name}`}>
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        ) : loadedAssets.has(asset.id) ? (
                          // Success tick
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          // Not loaded indicator
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Asset Name */}
                <div className="text-xs text-gray-300 group-hover:text-white transition-colors truncate text-center" title={asset.name}>
                  {asset.name}
                </div>
              </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-0">
                {filteredAssets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className={`group cursor-pointer transition-all duration-200 p-2 flex items-center gap-3 ${
                      dragOverFolder === asset.path 
                        ? 'bg-blue-600/30 border-2 border-blue-400 border-dashed rounded' 
                        : index % 2 === 0 
                          ? 'bg-slate-800/50 hover:bg-slate-700/50' 
                          : 'bg-slate-900/30 hover:bg-slate-700/50'
                    }`}
                    draggable={true}
                    onMouseEnter={() => setHoveredItem(asset.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => {
                      if (asset.type === 'file') {
                        // If asset failed to load, retry on click
                        if (failedAssets.has(asset.id)) {
                          e.preventDefault();
                          console.log(`🔄 Retrying failed asset: ${asset.name}`);
                          // Remove from failed set and retry with high priority
                          setFailedAssets(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(asset.id);
                            return newSet;
                          });
                          queueAssetForLoading(asset, PRIORITY.CRITICAL);
                        }
                      }
                    }}
                    onDoubleClick={() => handleAssetDoubleClick(asset)}
                    onDragStart={(e) => {
                      console.log('🔥 Drag start triggered for:', asset.name, asset.type);
                      
                      // Mark this as an internal drag (originating from within the page)
                      setIsInternalDrag(true);
                      
                      // Handle both files and folders
                      if (asset.type === 'file') {
                        console.log('✅ Starting drag for file:', asset.name);
                        
                        // Determine category based on file extension
                        const getAssetCategory = (extension) => {
                          const ext = extension?.toLowerCase() || '';
                          if (['.glb', '.gltf', '.obj', '.fbx'].includes(ext)) return '3d-models';
                          if (['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tga'].includes(ext)) return 'textures';
                          if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) return 'audio';
                          if (['.js', '.ts', '.py'].includes(ext)) return 'scripts';
                          return 'misc';
                        };
                        
                        const dragData = {
                          type: 'asset',
                          id: asset.id,
                          name: asset.name,
                          path: asset.path,
                          assetType: asset.type,
                          fileName: asset.fileName,
                          extension: asset.extension,
                          mimeType: asset.mimeType,
                          category: getAssetCategory(asset.extension)
                        };
                        
                        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                        e.dataTransfer.setData('text/plain', asset.name);
                        // Add a custom type to identify this as an asset drag (for viewport)
                        e.dataTransfer.setData('application/x-asset-drag', 'true');
                        
                        // Add download URL for dragging to desktop
                        const currentProject = projectManager.getCurrentProject();
                        const downloadUrl = `/api/projects/${currentProject.name}/assets/file/${encodeURIComponent(asset.path)}?download=true`;
                        e.dataTransfer.setData('text/uri-list', downloadUrl);
                        e.dataTransfer.setData('DownloadURL', `${asset.mimeType || 'application/octet-stream'}:${asset.name}:${downloadUrl}`);
                        
                        // Files can be copied to viewport or moved to folders
                        e.dataTransfer.effectAllowed = 'copyMove';
                        
                        // Create drag image for file
                        const dragImage = document.createElement('div');
                        const getFileIcon = (extension) => {
                          if (['.glb', '.gltf', '.obj', '.fbx'].includes(extension)) return '🧊';
                          if (['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(extension)) return '🖼️';
                          if (['.mp3', '.wav', '.ogg', '.m4a'].includes(extension)) return '🎵';
                          if (['.js', '.ts', '.py'].includes(extension)) return '📄';
                          return '📦';
                        };
                        const icon = getFileIcon(asset.extension || '');
                        dragImage.innerHTML = `
                          <div style="
                            background: rgba(59, 130, 246, 0.9);
                            color: white;
                            padding: 8px 12px;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 500;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                            backdrop-filter: blur(8px);
                            border: 1px solid rgba(255,255,255,0.2);
                          ">
                            ${icon} ${asset.name}
                          </div>
                        `;
                        dragImage.style.position = 'absolute';
                        dragImage.style.top = '-1000px';
                        document.body.appendChild(dragImage);
                        
                        e.dataTransfer.setDragImage(dragImage, 50, 20);
                        
                        // Clean up drag image after drag ends
                        setTimeout(() => {
                          document.body.removeChild(dragImage);
                        }, 0);
                        
                      } else if (asset.type === 'folder') {
                        console.log('✅ Starting drag for folder:', asset.name);
                        
                        const dragData = {
                          type: 'asset',
                          id: asset.id,
                          name: asset.name,
                          path: asset.path,
                          assetType: asset.type
                        };
                        
                        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                        e.dataTransfer.setData('text/plain', asset.name);
                        
                        // Folders can only be moved to other folders
                        e.dataTransfer.effectAllowed = 'move';
                        
                        // Create drag image for folder
                        const dragImage = document.createElement('div');
                        dragImage.innerHTML = `
                          <div style="
                            background: rgba(251, 191, 36, 0.9);
                            color: black;
                            padding: 8px 12px;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 500;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                            backdrop-filter: blur(8px);
                            border: 1px solid rgba(255,255,255,0.2);
                          ">
                            📁 ${asset.name}
                          </div>
                        `;
                        dragImage.style.position = 'absolute';
                        dragImage.style.top = '-1000px';
                        document.body.appendChild(dragImage);
                        
                        e.dataTransfer.setDragImage(dragImage, 50, 20);
                        
                        // Clean up drag image after drag ends
                        setTimeout(() => {
                          document.body.removeChild(dragImage);
                        }, 0);
                      }
                      
                      console.log('📦 Drag data prepared for:', asset.type, asset.name);
                    }}
                    onDragEnd={() => {
                      // Reset all drag states when drag ends
                      setIsInternalDrag(false);
                      setDragOverFolder(null);
                      setDragOverTreeFolder(null);
                      setDragOverBreadcrumb(null);
                    }}
                    onDragOver={(e) => {
                      if (asset.type === 'folder' && viewMode === 'folder') {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setDragOverFolder(asset.path);
                      }
                    }}
                    onDragLeave={(e) => {
                      if (asset.type === 'folder' && !e.currentTarget.contains(e.relatedTarget)) {
                        setDragOverFolder(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (asset.type === 'folder' && viewMode === 'folder') {
                        setDragOverFolder(null);
                        
                        try {
                          const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
                          if (dragData.type === 'asset' && dragData.path !== asset.path) {
                            // Don't allow dropping a folder into itself or its children
                            if (dragData.assetType === 'folder' && asset.path.startsWith(dragData.path)) {
                              console.warn('Cannot move folder into itself or its children');
                              return;
                            }
                            handleMoveItem(dragData.path, asset.path);
                          }
                        } catch (error) {
                          console.error('Error parsing drag data:', error);
                        }
                      }
                    }}
                  >
                    {/* Icon/Preview */}
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative">
                      {asset.type === 'folder' ? (
                        <Icons.Folder className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <ModelPreview
                          asset={asset}
                          className={`w-6 h-6 ${
                            loadedAssets.has(asset.id) 
                              ? 'opacity-100' 
                              : failedAssets.has(asset.id) 
                                ? 'opacity-40 grayscale' 
                                : 'opacity-60'
                          }`}
                          isHovered={hoveredItem === asset.id}
                          priority={hoveredItem === asset.id ? PRIORITY.CRITICAL : PRIORITY.MEDIUM}
                        />
                      )}

                      {/* Status Indicator */}
                      {asset.type === 'file' && (
                        <div className="absolute -bottom-1 -right-1">
                          {preloadingAssets.has(asset.id) ? (
                            <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : failedAssets.has(asset.id) ? (
                            <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          ) : loadedAssets.has(asset.id) ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Asset Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                        {asset.name}
                      </div>
                      {asset.type === 'file' && (
                        <div className="text-xs text-gray-500 truncate">
                          {asset.extension?.toUpperCase()} • {asset.size ? `${Math.round(asset.size / 1024)} KB` : 'Unknown size'}
                        </div>
                      )}
                    </div>

                    {/* Extension Badge */}
                    {asset.type === 'file' && asset.extension && (
                      <div className="flex-shrink-0">
                        <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {asset.extension.replace('.', '').toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {!loading && !error && filteredAssets.length === 0 && searchQuery && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-sm">No assets found matching "{searchQuery}"</p>
            <p className="text-xs text-gray-600 mt-2">Try adjusting your search or upload new assets</p>
          </div>
        )}
        
        {/* Hidden file input for upload */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".glb,.gltf,.obj,.fbx,.jpg,.jpeg,.png,.bmp,.tga,.webp,.mp3,.wav,.ogg,.m4a,.js,.ts,.py,.json,.xml,.txt,.md"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        {/* Hidden folder input for upload */}
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          multiple
          onChange={handleFolderInputChange}
          style={{ display: 'none' }}
        />
        
        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            items={contextMenu.items}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
          />
        )}
        </div>
      </div>
    </div>
  );
}

export default AssetLibrary;