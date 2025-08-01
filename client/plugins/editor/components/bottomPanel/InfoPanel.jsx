import { useState, useEffect } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const InfoPanel = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [colorInfo, setColorInfo] = useState({
    rgb: { r: 0, g: 0, b: 0 },
    hsb: { h: 0, s: 0, b: 0 },
    cmyk: { c: 0, m: 0, y: 0, k: 100 },
    hex: '#000000'
  });
  const [documentInfo, setDocumentInfo] = useState({
    width: 3840,
    height: 2160,
    resolution: 300,
    colorMode: 'RGB',
    bitDepth: 8
  });
  const [selectionInfo, setSelectionInfo] = useState({
    active: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [activePanel, setActivePanel] = useState('mouse');

  const panels = [
    { id: 'mouse', name: 'Mouse Info', icon: Icons.CursorArrowRays },
    { id: 'color', name: 'Color Info', icon: Icons.EyeDropper },
    { id: 'document', name: 'Document', icon: Icons.DocumentText },
    { id: 'selection', name: 'Selection', icon: Icons.Rectangle },
    { id: 'histogram', name: 'Histogram', icon: Icons.ChartBar }
  ];

  // Simulate mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Simulate color sampling (in a real app, this would sample from canvas)
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      
      // Convert RGB to other color spaces
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      
      // RGB to HSB conversion
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      
      let h = 0;
      if (diff !== 0) {
        if (max === r) h = ((g - b) / diff) % 6;
        else if (max === g) h = (b - r) / diff + 2;
        else h = (r - g) / diff + 4;
      }
      h = Math.round(h * 60);
      if (h < 0) h += 360;
      
      const s = Math.round(max === 0 ? 0 : (diff / max) * 100);
      const brightness = Math.round((max / 255) * 100);
      
      // RGB to CMYK conversion (simplified)
      const k = Math.round((1 - max / 255) * 100);
      const c = max === 0 ? 0 : Math.round(((1 - r / 255 - k / 100) / (1 - k / 100)) * 100);
      const m = max === 0 ? 0 : Math.round(((1 - g / 255 - k / 100) / (1 - k / 100)) * 100);
      const y = max === 0 ? 0 : Math.round(((1 - b / 255 - k / 100) / (1 - k / 100)) * 100);
      
      setColorInfo({
        rgb: { r, g, b },
        hsb: { h, s, b: brightness },
        cmyk: { c: c || 0, m: m || 0, y: y || 0, k },
        hex
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const renderMouseInfo = () => (
    <div className="space-y-3">
      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-sm font-medium text-white mb-2">Mouse Position</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">X:</span>
            <span className="text-white ml-2">{mousePosition.x}px</span>
          </div>
          <div>
            <span className="text-gray-400">Y:</span>
            <span className="text-white ml-2">{mousePosition.y}px</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-sm font-medium text-white mb-2">Cursor Info</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Tool:</span>
            <span className="text-white">Move Tool</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Mode:</span>
            <span className="text-white">Normal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Layer:</span>
            <span className="text-white">Background</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderColorInfo = () => (
    <div className="space-y-3">
      {/* Color Swatch */}
      <div className="bg-gray-800 rounded p-3">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 border border-gray-600 rounded"
            style={{ backgroundColor: colorInfo.hex }}
          />
          <div>
            <div className="text-sm font-medium text-white">Current Color</div>
            <div className="text-xs text-gray-400">{colorInfo.hex}</div>
          </div>
        </div>
      </div>

      {/* RGB Values */}
      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-sm font-medium text-white mb-2">RGB</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-red-400">R:</span>
            <span className="text-white ml-1">{colorInfo.rgb.r}</span>
          </div>
          <div>
            <span className="text-green-400">G:</span>
            <span className="text-white ml-1">{colorInfo.rgb.g}</span>
          </div>
          <div>
            <span className="text-blue-400">B:</span>
            <span className="text-white ml-1">{colorInfo.rgb.b}</span>
          </div>
        </div>
      </div>

      {/* HSB Values */}
      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-sm font-medium text-white mb-2">HSB</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-purple-400">H:</span>
            <span className="text-white ml-1">{colorInfo.hsb.h}°</span>
          </div>
          <div>
            <span className="text-yellow-400">S:</span>
            <span className="text-white ml-1">{colorInfo.hsb.s}%</span>
          </div>
          <div>
            <span className="text-gray-400">B:</span>
            <span className="text-white ml-1">{colorInfo.hsb.b}%</span>
          </div>
        </div>
      </div>

      {/* CMYK Values */}
      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-sm font-medium text-white mb-2">CMYK</h4>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-cyan-400">C:</span>
            <span className="text-white ml-1">{colorInfo.cmyk.c}%</span>
          </div>
          <div>
            <span className="text-pink-400">M:</span>
            <span className="text-white ml-1">{colorInfo.cmyk.m}%</span>
          </div>
          <div>
            <span className="text-yellow-400">Y:</span>
            <span className="text-white ml-1">{colorInfo.cmyk.y}%</span>
          </div>
          <div>
            <span className="text-gray-400">K:</span>
            <span className="text-white ml-1">{colorInfo.cmyk.k}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentInfo = () => (
    <div className="space-y-3">
      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-sm font-medium text-white mb-2">Document Size</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Width:</span>
            <span className="text-white">{documentInfo.width}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Height:</span>
            <span className="text-white">{documentInfo.height}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Resolution:</span>
            <span className="text-white">{documentInfo.resolution} ppi</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Color Mode:</span>
            <span className="text-white">{documentInfo.colorMode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Bit Depth:</span>
            <span className="text-white">{documentInfo.bitDepth} bit</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-sm font-medium text-white mb-2">Memory Usage</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Undo States:</span>
            <span className="text-white">45.2 MB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Image Cache:</span>
            <span className="text-white">128.7 MB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total:</span>
            <span className="text-white">173.9 MB</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSelectionInfo = () => (
    <div className="space-y-3">
      {selectionInfo.active ? (
        <>
          <div className="bg-gray-800 rounded p-3">
            <h4 className="text-sm font-medium text-white mb-2">Selection Bounds</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400">X:</span>
                <span className="text-white ml-2">{selectionInfo.x}px</span>
              </div>
              <div>
                <span className="text-gray-400">Y:</span>
                <span className="text-white ml-2">{selectionInfo.y}px</span>
              </div>
              <div>
                <span className="text-gray-400">Width:</span>
                <span className="text-white ml-2">{selectionInfo.width}px</span>
              </div>
              <div>
                <span className="text-gray-400">Height:</span>
                <span className="text-white ml-2">{selectionInfo.height}px</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded p-3">
            <h4 className="text-sm font-medium text-white mb-2">Selection Stats</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Area:</span>
                <span className="text-white">{(selectionInfo.width * selectionInfo.height).toLocaleString()}px²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Perimeter:</span>
                <span className="text-white">{(2 * (selectionInfo.width + selectionInfo.height)).toLocaleString()}px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Feather:</span>
                <span className="text-white">2px</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-800 rounded p-3 text-center">
          <Icons.Rectangle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <div className="text-sm text-gray-500">No Selection</div>
          <div className="text-xs text-gray-600 mt-1">Make a selection to see info</div>
        </div>
      )}
    </div>
  );

  const renderHistogram = () => (
    <div className="space-y-3">
      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-sm font-medium text-white mb-2">RGB Histogram</h4>
        <div className="h-32 bg-gray-900 rounded border border-gray-600 flex items-end justify-center p-2">
          {/* Simulated histogram bars */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="flex-1 mx-px bg-gradient-to-t from-red-500 via-green-500 to-blue-500 opacity-70"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded p-3">
        <h4 className="text-sm font-medium text-white mb-2">Statistics</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Mean:</span>
            <span className="text-white">127.5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Std Dev:</span>
            <span className="text-white">45.2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Median:</span>
            <span className="text-white">128</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pixels:</span>
            <span className="text-white">8,294,400</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'mouse':
        return renderMouseInfo();
      case 'color':
        return renderColorInfo();
      case 'document':
        return renderDocumentInfo();
      case 'selection':
        return renderSelectionInfo();
      case 'histogram':
        return renderHistogram();
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Panel Header */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <Icons.InformationCircle className="w-4 h-4 text-blue-400 mr-2" />
        <span className="text-white text-sm font-medium">Info</span>
      </div>

      {/* Panel Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex overflow-x-auto">
          {panels.map((panel) => {
            const IconComponent = panel.icon;
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`flex-shrink-0 px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                  activePanel === panel.id
                    ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                {panel.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-auto p-4">
        {renderPanelContent()}
      </div>
    </div>
  );
};

export default InfoPanel;