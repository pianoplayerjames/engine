import React, { useState, useEffect } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const AssetsMarketplace = ({ searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Asset categories
  const categories = [
    { id: 'all', name: 'All Assets', icon: Icons.Grid, count: 1247 },
    { id: 'models', name: '3D Models', icon: Icons.Cube, count: 423 },
    { id: 'textures', name: 'Textures', icon: Icons.Photo, count: 312 },
    { id: 'materials', name: 'Materials', icon: Icons.ColorSwatch, count: 189 },
    { id: 'animations', name: 'Animations', icon: Icons.Play, count: 156 },
    { id: 'sounds', name: 'Audio', icon: Icons.Audio, count: 234 },
    { id: 'scripts', name: 'Scripts', icon: Icons.CodeBracket, count: 98 },
    { id: 'environments', name: 'Environments', icon: Icons.Scene, count: 87 },
    { id: 'ui', name: 'UI Elements', icon: Icons.Square, count: 145 }
  ];

  // Mock asset data - In real app, this would come from an API
  const mockAssets = [
    {
      id: 1,
      title: 'Medieval Castle Pack',
      category: 'models',
      price: 29.99,
      rating: 4.8,
      reviews: 127,
      thumbnail: '/api/assets/thumbnails/castle.jpg',
      author: 'GameArt Studios',
      downloads: 1420,
      tags: ['medieval', 'architecture', 'fantasy'],
      description: 'Complete medieval castle with interior and exterior models',
      featured: true
    },
    {
      id: 2,
      title: 'PBR Material Collection',
      category: 'materials',
      price: 19.99,
      rating: 4.9,
      reviews: 89,
      thumbnail: '/api/assets/thumbnails/materials.jpg',
      author: 'TextureMaster',
      downloads: 2100,
      tags: ['pbr', 'realistic', 'collection'],
      description: '50 high-quality PBR materials for realistic rendering'
    },
    {
      id: 3,
      title: 'Character Animation Bundle',
      category: 'animations',
      price: 0,
      rating: 4.6,
      reviews: 203,
      thumbnail: '/api/assets/thumbnails/animations.jpg',
      author: 'AnimationPro',
      downloads: 3500,
      tags: ['character', 'humanoid', 'free'],
      description: 'Free character animation set with 25 common animations'
    },
    {
      id: 4,
      title: 'Sci-Fi Environment Kit',
      category: 'environments',
      price: 49.99,
      rating: 4.7,
      reviews: 76,
      thumbnail: '/api/assets/thumbnails/scifi.jpg',
      author: 'FutureWorlds',
      downloads: 890,
      tags: ['sci-fi', 'futuristic', 'modular'],
      description: 'Modular sci-fi environment pieces for creating futuristic scenes'
    },
    {
      id: 5,
      title: 'Nature Sound Pack',
      category: 'sounds',
      price: 15.99,
      rating: 4.5,
      reviews: 156,
      thumbnail: '/api/assets/thumbnails/nature-sounds.jpg',
      author: 'SoundScape',
      downloads: 1780,
      tags: ['nature', 'ambient', 'forest'],
      description: 'High-quality nature sounds including birds, water, wind'
    },
    {
      id: 6,
      title: 'UI Kit Modern',
      category: 'ui',
      price: 24.99,
      rating: 4.8,
      reviews: 92,
      thumbnail: '/api/assets/thumbnails/ui-kit.jpg',
      author: 'UIDesigner',
      downloads: 1250,
      tags: ['ui', 'modern', 'game-ui'],
      description: 'Complete modern UI kit with buttons, panels, and HUD elements'
    }
  ];

  // Filter and sort assets
  const filteredAssets = mockAssets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = priceFilter === 'all' || 
      (priceFilter === 'free' && asset.price === 0) ||
      (priceFilter === 'paid' && asset.price > 0);
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  return (
    <div className="w-full h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-white font-semibold mb-4">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <category.icon className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                </div>
                <span className="text-xs opacity-60">{category.count}</span>
              </button>
            ))}
          </div>

          {/* Price Filter */}
          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Price</h4>
            <div className="space-y-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'free', label: 'Free' },
                { id: 'paid', label: 'Paid' }
              ].map((filter) => (
                <label key={filter.id} className="flex items-center">
                  <input
                    type="radio"
                    name="priceFilter"
                    value={filter.id}
                    checked={priceFilter === filter.id}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-300 text-sm">{filter.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-750 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                {sortedAssets.length} assets found
              </span>
              {searchQuery && (
                <span className="text-blue-400">
                  for "{searchQuery}"
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              
              <div className="flex border border-gray-600 rounded overflow-hidden">
                <button className="px-3 py-1 bg-blue-600 text-white">
                  <Icons.Grid className="w-4 h-4" />
                </button>
                <button className="px-3 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600">
                  <Icons.Bars3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-700 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                      <Icons.Photo className="w-8 h-8 text-gray-500" />
                    </div>
                    {asset.featured && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold">
                        Featured
                      </div>
                    )}
                    {asset.price === 0 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Free
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium text-sm line-clamp-2 flex-1">
                        {asset.title}
                      </h3>
                      <span className="text-blue-400 font-semibold ml-2">
                        {asset.price === 0 ? 'Free' : `$${asset.price}`}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {asset.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Icons.Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-300">{asset.rating}</span>
                      </div>
                      <span className="text-gray-500 text-xs">•</span>
                      <span className="text-xs text-gray-400">{asset.reviews} reviews</span>
                      <span className="text-gray-500 text-xs">•</span>
                      <span className="text-xs text-gray-400">{asset.downloads} downloads</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">by {asset.author}</span>
                      <div className="flex gap-1">
                        {asset.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
                        {asset.price === 0 ? 'Download' : 'Add to Cart'}
                      </button>
                      <button className="p-2 border border-gray-600 hover:border-gray-500 rounded transition-colors">
                        <Icons.Heart className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Icons.MagnifyingGlass className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">No assets found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetsMarketplace;