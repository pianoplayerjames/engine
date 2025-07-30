import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import CollapsibleSection from '@/plugins/editor/components/ui/CollapsibleSection';

const EffectsLibraryPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [appliedEffects, setAppliedEffects] = useState([]);

  const effectCategories = [
    { id: 'all', name: 'All Effects', count: 45 },
    { id: 'color', name: 'Color', count: 12 },
    { id: 'blur', name: 'Blur & Sharpen', count: 8 },
    { id: 'distort', name: 'Distort', count: 6 },
    { id: 'stylize', name: 'Stylize', count: 9 },
    { id: 'time', name: 'Time', count: 4 },
    { id: 'audio', name: 'Audio', count: 6 },
  ];

  const videoEffects = [
    // Color Effects
    { id: 'brightness-contrast', name: 'Brightness & Contrast', category: 'color', icon: Icons.Sun },
    { id: 'hue-saturation', name: 'Hue/Saturation', category: 'color', icon: Icons.ColorSwatch },
    { id: 'color-balance', name: 'Color Balance', category: 'color', icon: Icons.AdjustmentsHorizontal },
    { id: 'curves', name: 'Curves', category: 'color', icon: Icons.ChartBar },
    { id: 'levels', name: 'Levels', category: 'color', icon: Icons.ChartLine },
    { id: 'color-correction', name: 'Color Correction', category: 'color', icon: Icons.EyeDropper },
    
    // Blur & Sharpen
    { id: 'gaussian-blur', name: 'Gaussian Blur', category: 'blur', icon: Icons.Circle },
    { id: 'motion-blur', name: 'Motion Blur', category: 'blur', icon: Icons.ArrowRight },
    { id: 'radial-blur', name: 'Radial Blur', category: 'blur', icon: Icons.ArrowPath },
    { id: 'sharpen', name: 'Sharpen', category: 'blur', icon: Icons.SparkMini },
    { id: 'unsharp-mask', name: 'Unsharp Mask', category: 'blur', icon: Icons.AdjustmentsVertical },
    
    // Distort
    { id: 'lens-distortion', name: 'Lens Distortion', category: 'distort', icon: Icons.Eye },
    { id: 'perspective', name: 'Perspective', category: 'distort', icon: Icons.Square3Stack3d },
    { id: 'warp', name: 'Warp', category: 'distort', icon: Icons.CursorArrowRipple },
    { id: 'turbulence', name: 'Turbulence', category: 'distort', icon: Icons.CloudArrowUp },
    
    // Stylize
    { id: 'glow', name: 'Glow', category: 'stylize', icon: Icons.Sun },
    { id: 'drop-shadow', name: 'Drop Shadow', category: 'stylize', icon: Icons.Square },
    { id: 'emboss', name: 'Emboss', category: 'stylize', icon: Icons.Squares2x2 },
    { id: 'edge-detect', name: 'Find Edges', category: 'stylize', icon: Icons.Outline },
    { id: 'posterize', name: 'Posterize', category: 'stylize', icon: Icons.Photo },
    
    // Time Effects
    { id: 'time-remapping', name: 'Time Remapping', category: 'time', icon: Icons.Clock },
    { id: 'frame-hold', name: 'Frame Hold', category: 'time', icon: Icons.Pause },
    { id: 'reverse', name: 'Time Reverse', category: 'time', icon: Icons.ArrowUturnLeft },
    
    // Audio Effects
    { id: 'parametric-eq', name: 'Parametric EQ', category: 'audio', icon: Icons.AdjustmentsHorizontal },
    { id: 'compressor', name: 'Compressor', category: 'audio', icon: Icons.SpeakerWave },
    { id: 'reverb', name: 'Reverb', category: 'audio', icon: Icons.SpeakerXMark },
    { id: 'noise-reduction', name: 'Noise Reduction', category: 'audio', icon: Icons.XMark },
  ];

  const filteredEffects = videoEffects.filter(effect => {
    const matchesSearch = effect.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || effect.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApplyEffect = (effect) => {
    const newEffect = {
      ...effect,
      id: `${effect.id}-${Date.now()}`,
      enabled: true,
      settings: {}
    };
    setAppliedEffects(prev => [...prev, newEffect]);
  };

  const handleRemoveEffect = (effectId) => {
    setAppliedEffects(prev => prev.filter(e => e.id !== effectId));
  };

  const handleToggleEffect = (effectId) => {
    setAppliedEffects(prev => prev.map(e => 
      e.id === effectId ? { ...e, enabled: !e.enabled } : e
    ));
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800/95 border-b border-slate-700 flex items-center px-4">
        <div className="flex items-center gap-2">
          <Icons.Effects className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">Effects</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Applied Effects */}
        <CollapsibleSection title="Applied Effects" defaultOpen={true}>
          <div className="space-y-2">
            {appliedEffects.length === 0 ? (
              <div className="text-center py-8">
                <Icons.Effects className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <div className="text-gray-500 text-sm">No effects applied</div>
              </div>
            ) : (
              appliedEffects.map((effect) => (
                <div key={effect.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded border border-slate-700">
                  <button
                    onClick={() => handleToggleEffect(effect.id)}
                    className={`w-4 h-4 rounded border-2 transition-colors ${
                      effect.enabled
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {effect.enabled && <Icons.Check className="w-3 h-3 text-white" />}
                  </button>
                  
                  <effect.icon className="w-4 h-4 text-gray-400" />
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-200">{effect.name}</div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                      <Icons.Cog6Tooth className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleRemoveEffect(effect.id)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      <Icons.Trash className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CollapsibleSection>

        {/* Effects Library */}
        <CollapsibleSection title="Effects Library" defaultOpen={true}>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Icons.MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search effects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="space-y-1">
              {effectCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs opacity-75">{category.count}</span>
                </button>
              ))}
            </div>

            {/* Effects List */}
            <div className="space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide px-1">
                {selectedCategory === 'all' ? 'All Effects' : effectCategories.find(c => c.id === selectedCategory)?.name} 
                ({filteredEffects.length})
              </div>
              
              {filteredEffects.map((effect) => (
                <div
                  key={effect.id}
                  className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 rounded border border-slate-700 hover:border-slate-600 cursor-pointer group transition-all"
                  onClick={() => handleApplyEffect(effect)}
                >
                  <effect.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-200 group-hover:text-white">
                      {effect.name}
                    </div>
                  </div>
                  
                  <Icons.Plus className="w-4 h-4 text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* Presets */}
        <CollapsibleSection title="Effect Presets" defaultOpen={false}>
          <div className="space-y-2">
            {[
              'Cinematic Look', 'Vintage Film', 'High Contrast', 'Soft Glow',
              'Black & White', 'Sepia Tone', 'Cool Blue', 'Warm Orange'
            ].map((preset) => (
              <button
                key={preset}
                className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 rounded border border-slate-700 hover:border-slate-600 cursor-pointer group transition-all text-left"
              >
                <Icons.Swatch className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                <span className="text-sm text-gray-200 group-hover:text-white">{preset}</span>
              </button>
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default EffectsLibraryPanel;