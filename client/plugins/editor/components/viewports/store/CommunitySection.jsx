import React, { useState, useEffect } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const CommunitySection = ({ searchQuery }) => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [showcases, setShowcases] = useState([]);

  // Community tabs
  const communityTabs = [
    { id: 'discussions', label: 'Discussions', icon: Icons.ChatBubbleLeftRight },
    { id: 'showcase', label: 'Showcase', icon: Icons.Photo },
    { id: 'help', label: 'Help & Support', icon: Icons.QuestionMarkCircle },
    { id: 'events', label: 'Events', icon: Icons.Calendar }
  ];

  // Discussion categories
  const categories = [
    { id: 'all', name: 'All Topics', count: 1247 },
    { id: 'general', name: 'General Discussion', count: 423 },
    { id: 'showcase', name: 'Show Your Work', count: 312 },
    { id: 'help', name: 'Help & Support', count: 189 },
    { id: 'feedback', name: 'Feedback', count: 156 },
    { id: 'tutorials', name: 'Tutorials & Tips', count: 98 },
    { id: 'jobs', name: 'Jobs & Collaboration', count: 69 }
  ];

  // Mock discussion posts
  const mockPosts = [
    {
      id: 1,
      title: 'How to optimize large 3D scenes for better performance?',
      author: 'GameDevPro',
      avatar: '/avatars/gamedevpro.jpg',
      category: 'help',
      replies: 23,
      views: 1420,
      lastActivity: '2 hours ago',
      isPinned: true,
      tags: ['performance', '3d', 'optimization'],
      content: 'I\'m working on a large open-world game and running into performance issues. What are the best practices for optimizing large 3D scenes?',
      upvotes: 15
    },
    {
      id: 2,
      title: 'Completed my first game using this engine!',
      author: 'IndieCreator',
      avatar: '/avatars/indiecreator.jpg',
      category: 'showcase',
      replies: 45,
      views: 2100,
      lastActivity: '4 hours ago',
      tags: ['showcase', 'indie', 'completed'],
      content: 'After 6 months of development, I finally finished my first game! Thanks to this amazing community for all the help.',
      upvotes: 32,
      hasImage: true
    },
    {
      id: 3,
      title: 'New lighting system features - feedback wanted',
      author: 'EngineTeam',
      avatar: '/avatars/engineteam.jpg',
      category: 'feedback',
      replies: 67,
      views: 3500,
      lastActivity: '1 day ago',
      isOfficial: true,
      tags: ['feedback', 'lighting', 'features'],
      content: 'We\'re working on improvements to the lighting system. Check out the preview and let us know what you think!',
      upvotes: 89
    },
    {
      id: 4,
      title: 'Weekly Game Jam - Medieval Theme',
      author: 'CommunityMod',
      avatar: '/avatars/mod.jpg',
      category: 'events',
      replies: 12,
      views: 890,
      lastActivity: '6 hours ago',
      isModerator: true,
      tags: ['game-jam', 'medieval', 'competition'],
      content: 'Join our weekly game jam! This week\'s theme is Medieval. Submit your games by Sunday!',
      upvotes: 24
    },
    {
      id: 5,
      title: 'Best practices for mobile game development?',
      author: 'MobileDev',
      avatar: '/avatars/mobiledev.jpg',
      category: 'general',
      replies: 18,
      views: 1200,
      lastActivity: '8 hours ago',
      tags: ['mobile', 'best-practices', 'development'],
      content: 'What are the key considerations when developing games for mobile platforms?',
      upvotes: 11
    }
  ];

  // Mock showcase projects
  const mockShowcases = [
    {
      id: 1,
      title: 'Cyberpunk Racing Game',
      author: 'FutureRacer',
      thumbnail: '/showcases/cyberpunk-racing.jpg',
      likes: 156,
      comments: 23,
      category: 'Racing',
      description: 'High-speed cyberpunk racing through neon-lit cities',
      tags: ['cyberpunk', 'racing', '3d']
    },
    {
      id: 2,
      title: 'Medieval Village Simulator',
      author: 'VillageBuilder',
      thumbnail: '/showcases/medieval-village.jpg',
      likes: 89,
      comments: 15,
      category: 'Simulation',
      description: 'Build and manage your own medieval village',
      tags: ['medieval', 'simulation', 'strategy']
    },
    {
      id: 3,
      title: 'Space Exploration Adventure',
      author: 'CosmicExplorer',
      thumbnail: '/showcases/space-adventure.jpg',
      likes: 234,
      comments: 41,
      category: 'Adventure',
      description: 'Explore vast galaxies and discover alien worlds',
      tags: ['space', 'exploration', 'adventure']
    }
  ];

  // Filter posts based on search and category
  const filteredPosts = mockPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getUserBadge = (post) => {
    if (post.isOfficial) return { text: 'TEAM', color: 'bg-blue-600' };
    if (post.isModerator) return { text: 'MOD', color: 'bg-green-600' };
    return null;
  };

  const formatTimeAgo = (timeString) => {
    return timeString; // In real app, would use a proper time formatting library
  };

  const renderDiscussions = () => (
    <div className="flex h-full">
      {/* Categories Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-white font-semibold mb-4">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{category.name}</span>
                <span className="text-xs opacity-60">{category.count}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors">
              New Discussion
            </button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              {selectedCategory === 'all' ? 'All Discussions' : categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            <div className="flex items-center gap-2">
              <select className="bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded text-sm">
                <option>Latest Activity</option>
                <option>Most Replies</option>
                <option>Most Views</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const badge = getUserBadge(post);
              return (
                <div
                  key={post.id}
                  className={`bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer ${
                    post.isPinned ? 'border-yellow-600 bg-yellow-900/10' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icons.User className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.isPinned && (
                            <Icons.Pin className="w-4 h-4 text-yellow-500" />
                          )}
                          <h4 className="text-white font-medium">{post.title}</h4>
                          {badge && (
                            <span className={`${badge.color} text-white px-2 py-1 rounded text-xs font-semibold`}>
                              {badge.text}
                            </span>
                          )}
                        </div>
                        <button className="text-gray-400 hover:text-white p-1">
                          <Icons.EllipsisHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>

                      <div className="flex items-center gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>by {post.author}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(post.lastActivity)}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Icons.ArrowUp className="w-4 h-4" />
                            <span>{post.upvotes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.ChatBubbleLeftRight className="w-4 h-4" />
                            <span>{post.replies}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderShowcase = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Community Showcase</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
          Share Your Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockShowcases.map((project) => (
          <div
            key={project.id}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all cursor-pointer group"
          >
            <div className="aspect-video bg-gray-700 relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                <Icons.Play className="w-12 h-12 text-gray-500" />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="bg-white text-black px-4 py-2 rounded-md font-medium">
                  View Project
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{project.title}</h4>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                  {project.category}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-3">{project.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                <span>by {project.author}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Icons.Heart className="w-4 h-4" />
                    <span>{project.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icons.ChatBubbleLeftRight className="w-4 h-4" />
                    <span>{project.comments}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1 flex-wrap">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'discussions':
        return renderDiscussions();
      case 'showcase':
        return renderShowcase();
      case 'help':
        return (
          <div className="p-6 text-center">
            <Icons.QuestionMarkCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">Help & Support</h3>
            <p className="text-gray-500">Get help from the community and support team.</p>
          </div>
        );
      case 'events':
        return (
          <div className="p-6 text-center">
            <Icons.Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">Community Events</h3>
            <p className="text-gray-500">Join game jams, competitions, and community meetups.</p>
          </div>
        );
      default:
        return renderDiscussions();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center px-6">
          {communityTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all font-medium ${
                  isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default CommunitySection;