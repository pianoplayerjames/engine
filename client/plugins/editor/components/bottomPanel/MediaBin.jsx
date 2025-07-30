import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const MediaBin = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Sample media files
  const mediaFiles = [
    { id: 1, name: 'intro_video.mp4', type: 'video', duration: '00:00:15', size: '24.5 MB', thumbnail: null },
    { id: 2, name: 'background_music.mp3', type: 'audio', duration: '00:03:45', size: '8.2 MB', thumbnail: null },
    { id: 3, name: 'logo_reveal.mov', type: 'video', duration: '00:00:08', size: '15.1 MB', thumbnail: null },
    { id: 4, name: 'voiceover.wav', type: 'audio', duration: '00:01:30', size: '16.8 MB', thumbnail: null },
    { id: 5, name: 'title_card.png', type: 'image', size: '2.1 MB', thumbnail: null },
    { id: 6, name: 'b_roll_footage.mp4', type: 'video', duration: '00:02:22', size: '45.7 MB', thumbnail: null },
  ];
  
  const filterOptions = [
    { id: 'all', label: 'All Media', icon: Icons.Archive },
    { id: 'video', label: 'Video', icon: Icons.Video },
    { id: 'audio', label: 'Audio', icon: Icons.SpeakerWave },
    { id: 'image', label: 'Images', icon: Icons.Photo },
  ];
  
  const filteredMedia = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || file.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });
  
  const handleImportMedia = () => {
    console.log('Import media clicked');
  };
  
  const handleDragStart = (e, file) => {
    e.dataTransfer.setData('application/json', JSON.stringify(file));
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  const getFileIcon = (type) => {
    switch (type) {
      case 'video': return Icons.Video;
      case 'audio': return Icons.SpeakerWave;
      case 'image': return Icons.Photo;
      default: return Icons.DocumentText;
    }
  };
  
  const formatFileSize = (size) => {
    return size;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Icons.Archive className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">Media Bin</span>
        </div>
        
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Icons.MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-700 rounded overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            title="Grid View"
          >
            <Icons.Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            title="List View"
          >
            <Icons.Bars className="w-4 h-4" />
          </button>
        </div>
        
        {/* Import Button */}
        <button
          onClick={handleImportMedia}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-2"
        >
          <Icons.Plus className="w-4 h-4" />
          Import
        </button>
      </div>
      
      {/* Filter Tabs */}
      <div className="h-10 bg-slate-800/50 border-b border-slate-700 flex items-center px-4">
        <div className="flex items-center gap-1">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Media Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredMedia.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Icons.Archive className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No media files</div>
              <div className="text-gray-500 text-sm mb-4">
                {searchTerm ? 'No files match your search' : 'Import media files to get started'}
              </div>
              <button
                onClick={handleImportMedia}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Import Media
              </button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4' : 'space-y-2'}>
            {filteredMedia.map((file) => {
              const FileIcon = getFileIcon(file.type);
              
              if (viewMode === 'grid') {
                return (
                  <div
                    key={file.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file)}
                    className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer group transition-all hover:scale-105"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-slate-700 rounded-t-lg flex items-center justify-center">
                      <FileIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    
                    {/* File Info */}
                    <div className="p-3">
                      <div className="text-sm font-medium text-gray-200 truncate mb-1" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>{formatFileSize(file.size)}</span>
                        {file.duration && <span>{file.duration}</span>}
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={file.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file)}
                    className="flex items-center gap-3 p-3 bg-slate-800 rounded border border-slate-700 hover:border-slate-600 cursor-pointer group transition-colors"
                  >
                    <FileIcon className="w-8 h-8 text-gray-500 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {file.type.charAt(0).toUpperCase() + file.type.slice(1)} • {formatFileSize(file.size)}
                        {file.duration && ` • ${file.duration}`}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-slate-700 rounded transition-colors" title="Preview">
                        <Icons.Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-700 rounded transition-colors" title="Properties">
                        <Icons.InformationCircle className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaBin;