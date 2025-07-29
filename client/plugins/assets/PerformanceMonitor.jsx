// Performance monitoring component for asset loading
import React, { useState, useEffect } from 'react';
import { assetManager } from './OptimizedAssetManager.js';

export function AssetPerformanceMonitor({ show = false }) {
  const [stats, setStats] = useState(null);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    if (!show) return;

    const updateStats = () => {
      setStats(assetManager.getStats());
    };

    // Update stats every second
    const interval = setInterval(updateStats, 1000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, [show]);

  if (!show || !stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-slate-800 border border-slate-600 rounded-lg shadow-lg transition-all duration-300 ${
        isMinimized ? 'w-48' : 'w-80'
      }`}>
        {/* Header */}
        <div 
          className="px-3 py-2 bg-slate-700 rounded-t-lg cursor-pointer flex items-center justify-between"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <h3 className="text-sm font-medium text-white">Asset Performance</h3>
          <button className="text-gray-400 hover:text-white">
            {isMinimized ? '▲' : '▼'}
          </button>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-3 text-xs text-gray-300 space-y-2">
            {/* Loading Stats */}
            <div>
              <div className="text-green-400 font-medium mb-1">Loading Performance</div>
              <div className="grid grid-cols-2 gap-2">
                <div>Total Requests: <span className="text-white">{stats.totalRequests}</span></div>
                <div>Cache Hits: <span className="text-green-400">{stats.cacheHits}</span></div>
                <div>Errors: <span className="text-red-400">{stats.errors}</span></div>
                <div>Hit Rate: <span className="text-blue-400">{stats.cacheHitRate.toFixed(1)}%</span></div>
              </div>
            </div>

            {/* Loading Times */}
            <div>
              <div className="text-blue-400 font-medium mb-1">Load Times</div>
              <div>Avg: <span className="text-white">{stats.avgLoadTime.toFixed(0)}ms</span></div>
            </div>

            {/* Cache Info */}
            <div>
              <div className="text-purple-400 font-medium mb-1">Cache Status</div>
              <div>Size: <span className="text-white">{(stats.cacheSize / 1024 / 1024).toFixed(1)}MB</span></div>
            </div>

            {/* Queue Status */}
            <div>
              <div className="text-yellow-400 font-medium mb-1">Queues</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>Critical: <span className="text-red-400">{stats.queueSizes[0] || 0}</span></div>
                <div>High: <span className="text-orange-400">{stats.queueSizes[1] || 0}</span></div>
                <div>Medium: <span className="text-yellow-400">{stats.queueSizes[2] || 0}</span></div>
                <div>Low: <span className="text-green-400">{stats.queueSizes[3] || 0}</span></div>
              </div>
            </div>

            {/* Controls */}
            <div className="pt-2 border-t border-slate-600">
              <button
                onClick={() => assetManager.clearCache()}
                className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
              >
                Clear Cache
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetPerformanceMonitor;