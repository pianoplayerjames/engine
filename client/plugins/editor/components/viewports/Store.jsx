import React, { useState, useRef, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { Icons } from '@/plugins/editor/components/Icons';
import { editorState, editorActions } from '@/plugins/editor/store.js';

// Import store sections
import AssetsMarketplace from './store/AssetsMarketplace.jsx';
import TutorialsSection from './store/TutorialsSection.jsx';
import CommunitySection from './store/CommunitySection.jsx';
import ProfileSection from './store/ProfileSection.jsx';

const Store = () => {
  const { ui } = useSnapshot(editorState);
  const { store } = ui;
  
  const [activeSection, setActiveSection] = useState(store?.activeSection || 'assets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Store sections configuration
  const storeSections = [
    {
      id: 'assets',
      label: 'Assets',
      icon: Icons.Cube,
      description: 'Browse and download 3D models, textures, materials, and more'
    },
    {
      id: 'tutorials',
      label: 'Tutorials',
      icon: Icons.Play,
      description: 'Learn game development with video tutorials and guides'
    },
    {
      id: 'community',
      label: 'Community',
      icon: Icons.Users,
      description: 'Connect with other developers, share projects, get help'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Icons.User,
      description: 'Manage your account, purchases, and created content'
    }
  ];

  // Update store state when section changes
  useEffect(() => {
    if (editorActions.setStoreSection) {
      editorActions.setStoreSection(activeSection);
    }
  }, [activeSection]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setSearchQuery(''); // Clear search when switching sections
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'assets':
        return <AssetsMarketplace searchQuery={searchQuery} />;
      case 'tutorials':
        return <TutorialsSection searchQuery={searchQuery} />;
      case 'community':
        return <CommunitySection searchQuery={searchQuery} />;
      case 'profile':
        return <ProfileSection searchQuery={searchQuery} />;
      default:
        return <AssetsMarketplace searchQuery={searchQuery} />;
    }
  };

  const currentSection = storeSections.find(s => s.id === activeSection);

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Game Engine Store</h1>
            <p className="text-blue-100 text-sm">{currentSection?.description}</p>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Icons.MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${currentSection?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30 w-80"
              />
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                <Icons.Bell className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                <Icons.ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center px-6">
          {storeSections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all font-medium ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-gray-700/50'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            );
          })}
          
          {/* Tab indicator line */}
          <div className="flex-1 border-b border-gray-700"></div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-400">Loading {currentSection?.label}...</div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            {renderActiveSection()}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>© 2025 Game Engine Store</span>
            <a href="#" className="hover:text-gray-200 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-200 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-200 transition-colors">Support</a>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;