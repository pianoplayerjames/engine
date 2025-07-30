import React, { useState, useEffect } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const TutorialsSection = ({ searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [tutorials, setTutorials] = useState([]);
  const [featuredTutorial, setFeaturedTutorial] = useState(null);

  // Tutorial categories
  const categories = [
    { id: 'all', name: 'All Tutorials', icon: Icons.BookOpen, count: 156 },
    { id: 'getting-started', name: 'Getting Started', icon: Icons.RocketLaunch, count: 24 },
    { id: '3d-modeling', name: '3D Modeling', icon: Icons.Cube, count: 32 },
    { id: 'animation', name: 'Animation', icon: Icons.Play, count: 28 },
    { id: 'scripting', name: 'Scripting', icon: Icons.CodeBracket, count: 41 },
    { id: 'lighting', name: 'Lighting', icon: Icons.Sun, count: 18 },
    { id: 'materials', name: 'Materials', icon: Icons.ColorSwatch, count: 23 },
    { id: 'physics', name: 'Physics', icon: Icons.Beaker, count: 15 },
    { id: 'ui-design', name: 'UI Design', icon: Icons.Square, count: 19 }
  ];

  // Mock tutorial data
  const mockTutorials = [
    {
      id: 1,
      title: 'Complete Game Development Course',
      category: 'getting-started',
      difficulty: 'beginner',
      format: 'video',
      duration: '8h 32m',
      lessons: 42,
      rating: 4.9,
      reviews: 1247,
      author: 'GameDev Academy',
      price: 59.99,
      thumbnail: '/api/tutorials/thumbnails/complete-course.jpg',
      description: 'Learn game development from scratch with this comprehensive course covering all aspects of creating games.',
      tags: ['game-dev', 'beginner', 'complete-course'],
      featured: true,
      enrolled: 15420
    },
    {
      id: 2,
      title: 'Advanced 3D Character Modeling',
      category: '3d-modeling',
      difficulty: 'advanced',
      format: 'video',
      duration: '6h 15m',
      lessons: 28,
      rating: 4.8,
      reviews: 892,
      author: 'ModelMaster Pro',
      price: 39.99,
      thumbnail: '/api/tutorials/thumbnails/character-modeling.jpg',
      description: 'Master advanced techniques for creating detailed 3D characters for games.',
      tags: ['3d-modeling', 'characters', 'advanced'],
      enrolled: 8720
    },
    {
      id: 3,
      title: 'Animation Fundamentals',
      category: 'animation',
      difficulty: 'intermediate',
      format: 'text',
      duration: '45m read',
      lessons: 12,
      rating: 4.7,
      reviews: 456,
      author: 'AnimationGuru',
      price: 0,
      thumbnail: '/api/tutorials/thumbnails/animation-fundamentals.jpg',
      description: 'Free comprehensive guide to animation principles and techniques.',
      tags: ['animation', 'fundamentals', 'free'],
      enrolled: 12500
    },
    {
      id: 4,
      title: 'JavaScript for Game Development',
      category: 'scripting',
      difficulty: 'intermediate',
      format: 'video',
      duration: '4h 20m',
      lessons: 35,
      rating: 4.6,
      reviews: 678,
      author: 'CodeCraft Studios',
      price: 29.99,
      thumbnail: '/api/tutorials/thumbnails/javascript-gamedev.jpg',
      description: 'Learn JavaScript programming specifically for game development with practical examples.',
      tags: ['javascript', 'programming', 'scripting'],
      enrolled: 9840
    },
    {
      id: 5,
      title: 'Realistic Lighting Techniques',
      category: 'lighting',
      difficulty: 'advanced',
      format: 'video',
      duration: '3h 45m',
      lessons: 18,
      rating: 4.9,
      reviews: 324,
      author: 'LightMaster',
      price: 34.99,
      thumbnail: '/api/tutorials/thumbnails/lighting.jpg',
      description: 'Advanced lighting techniques for creating photorealistic game environments.',
      tags: ['lighting', 'realistic', 'environments'],
      enrolled: 5680
    },
    {
      id: 6,
      title: 'PBR Material Creation Guide',
      category: 'materials',
      difficulty: 'intermediate',
      format: 'text',
      duration: '1h 30m read',
      lessons: 8,
      rating: 4.8,
      reviews: 289,
      author: 'MaterialExpert',
      price: 0,
      thumbnail: '/api/tutorials/thumbnails/pbr-materials.jpg',
      description: 'Free guide to creating physically based rendering materials.',
      tags: ['pbr', 'materials', 'texturing'],
      enrolled: 7290
    }
  ];

  // Featured tutorial (first tutorial or specific one)
  useEffect(() => {
    const featured = mockTutorials.find(t => t.featured) || mockTutorials[0];
    setFeaturedTutorial(featured);
  }, []);

  // Filter tutorials
  const filteredTutorials = mockTutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
    const matchesFormat = selectedFormat === 'all' || tutorial.format === selectedFormat;
    const matchesSearch = !searchQuery || 
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tutorial.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesFormat && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-900/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-900/30';
      case 'advanced': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'video': return Icons.Play;
      case 'text': return Icons.BookOpen;
      default: return Icons.Document;
    }
  };

  return (
    <div className="w-full h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-4">
          {/* Categories */}
          <h3 className="text-white font-semibold mb-4">Categories</h3>
          <div className="space-y-1 mb-6">
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

          {/* Difficulty Filter */}
          <div className="mb-6">
            <h4 className="text-white font-medium mb-3">Difficulty</h4>
            <div className="space-y-2">
              {[
                { id: 'all', label: 'All Levels' },
                { id: 'beginner', label: 'Beginner' },
                { id: 'intermediate', label: 'Intermediate' },
                { id: 'advanced', label: 'Advanced' }
              ].map((filter) => (
                <label key={filter.id} className="flex items-center">
                  <input
                    type="radio"
                    name="difficultyFilter"
                    value={filter.id}
                    checked={selectedDifficulty === filter.id}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-300 text-sm">{filter.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format Filter */}
          <div>
            <h4 className="text-white font-medium mb-3">Format</h4>
            <div className="space-y-2">
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'video', label: 'Video' },
                { id: 'text', label: 'Text/Article' }
              ].map((filter) => (
                <label key={filter.id} className="flex items-center">
                  <input
                    type="radio"
                    name="formatFilter"
                    value={filter.id}
                    checked={selectedFormat === filter.id}
                    onChange={(e) => setSelectedFormat(e.target.value)}
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
        {/* Featured Tutorial */}
        {featuredTutorial && !searchQuery && selectedCategory === 'all' && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 border-b border-gray-700">
            <div className="flex items-center gap-6">
              <div className="w-48 h-32 bg-black/20 rounded-lg flex items-center justify-center">
                <Icons.Play className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold">
                    Featured
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(featuredTutorial.difficulty)}`}>
                    {featuredTutorial.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{featuredTutorial.title}</h2>
                <p className="text-blue-100 mb-3">{featuredTutorial.description}</p>
                <div className="flex items-center gap-4 text-blue-100 text-sm mb-4">
                  <span>⭐ {featuredTutorial.rating} ({featuredTutorial.reviews} reviews)</span>
                  <span>👥 {featuredTutorial.enrolled.toLocaleString()} enrolled</span>
                  <span>⏱️ {featuredTutorial.duration}</span>
                  <span>📚 {featuredTutorial.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="bg-white text-purple-600 px-6 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                    {featuredTutorial.price === 0 ? 'Start Learning' : `Enroll for $${featuredTutorial.price}`}
                  </button>
                  <span className="text-blue-100">by {featuredTutorial.author}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tutorials List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Tutorials'}
            </h3>
            <span className="text-gray-400">{filteredTutorials.length} tutorials found</span>
          </div>

          {filteredTutorials.length > 0 ? (
            <div className="space-y-4">
              {filteredTutorials.map((tutorial) => {
                const FormatIcon = getFormatIcon(tutorial.format);
                return (
                  <div
                    key={tutorial.id}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-32 h-20 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FormatIcon className="w-8 h-8 text-gray-500" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                                {tutorial.difficulty}
                              </span>
                              <span className="text-gray-400 text-xs">{tutorial.format}</span>
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-1">{tutorial.title}</h4>
                            <p className="text-gray-400 text-sm">{tutorial.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-400 font-semibold text-lg">
                              {tutorial.price === 0 ? 'Free' : `$${tutorial.price}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
                          <span>⭐ {tutorial.rating} ({tutorial.reviews})</span>
                          <span>👥 {tutorial.enrolled.toLocaleString()}</span>
                          <span>⏱️ {tutorial.duration}</span>
                          <span>📚 {tutorial.lessons} lessons</span>
                          <span>by {tutorial.author}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {tutorial.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="p-2 border border-gray-600 hover:border-gray-500 rounded transition-colors">
                              <Icons.Heart className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors">
                              {tutorial.price === 0 ? 'Start Learning' : 'Enroll Now'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Icons.BookOpen className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">No tutorials found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filters to find tutorials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialsSection;