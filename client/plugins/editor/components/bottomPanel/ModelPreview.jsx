import { useEffect, useState } from 'react';
import { assetManager, PRIORITY } from '@/plugins/assets/OptimizedAssetManager.js';
import { projectManager } from '@/plugins/projects/projectManager.js';
import { Icons } from '@/plugins/editor/components/Icons';

// Optimized preview component using asset manager
function ModelPreview({ asset, className, isHovered, priority = PRIORITY.MEDIUM }) {
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [loadingState, setLoadingState] = useState('idle'); // 'idle', 'loading', 'loaded', 'error'

  useEffect(() => {
    if (asset.category === '3d-models') {
      generateThumbnail();
    }
  }, [asset.id]);

  const generateThumbnail = async () => {
    // Set current project for asset manager
    const currentProject = projectManager.getCurrentProject();
    assetManager.setCurrentProject(currentProject.name);
    
    setLoadingState('loading');
    
    try {
      // Use priority based on hover state
      const thumbnailPriority = isHovered ? PRIORITY.HIGH : priority;
      const thumbnailDataURL = await assetManager.generateThumbnail(asset, thumbnailPriority);
      
      if (thumbnailDataURL) {
        setThumbnailImage(thumbnailDataURL);
        setLoadingState('loaded');
      } else {
        setLoadingState('error');
      }
    } catch (error) {
      console.warn(`Failed to generate thumbnail for ${asset.name}:`, error);
      setLoadingState('error');
    }
  };

  // For non-3D models, show appropriate icons
  if (asset.category !== '3d-models') {
    let IconComponent = Icons.Cube3D;
    
    switch (asset.category) {
      case 'textures':
        IconComponent = Icons.Textures;
        break;
      case 'audio':
        IconComponent = Icons.Audio;
        break;
      case 'scripts':
        IconComponent = Icons.Scripts;
        break;
      default:
        IconComponent = Icons.Cube3D;
    }

    return (
      <IconComponent 
        className={className}
        isHovered={isHovered}
      />
    );
  }

  // For 3D models, show thumbnail image or fallback
  if (loadingState === 'error' || !thumbnailImage) {
    return (
      <div className={`${className} relative`}>
        <Icons.Cube3D 
          className={className}
          isHovered={isHovered}
        />
        {loadingState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-700 bg-opacity-75 rounded">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden rounded bg-slate-700`}>
      <img
        src={thumbnailImage}
        alt={`Preview of ${asset.name}`}
        className="w-full h-full object-cover"
        style={{ 
          imageRendering: 'crisp-edges',
          filter: 'contrast(1.1) brightness(1.1)'
        }}
      />
      {loadingState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700 bg-opacity-75 rounded">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default ModelPreview;