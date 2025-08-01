import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';
import { useSnapshot } from 'valtio';
import { editorState, editorActions } from '@/plugins/editor/store.js';

const TextEditor = () => {
  const [currentFile, setCurrentFile] = useState('script.js');
  const [content, setContent] = useState(`// Welcome to the Text Editor
// This is a sample JavaScript file

class GameController {
  constructor() {
    this.isRunning = false;
    this.gameObjects = [];
  }

  start() {
    this.isRunning = true;
    console.log('Game started!');
    this.gameLoop();
  }

  gameLoop() {
    if (!this.isRunning) return;
    
    // Update game objects
    this.gameObjects.forEach(obj => {
      obj.update();
    });
    
    // Render frame
    this.render();
    
    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
  }

  render() {
    // Rendering logic here
  }
}

export default GameController;`);

  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(14);
  const textareaRef = useRef(null);

  const openFiles = [
    { name: 'script.js', type: 'javascript', modified: true },
    { name: 'styles.css', type: 'css', modified: false },
    { name: 'index.html', type: 'html', modified: false }
  ];

  const fileTree = [
    { name: 'src', type: 'folder', expanded: true, children: [
      { name: 'components', type: 'folder', expanded: true, children: [
        { name: 'Player.js', type: 'javascript' },
        { name: 'Enemy.js', type: 'javascript' },
        { name: 'GameUI.js', type: 'javascript' }
      ]},
      { name: 'utils', type: 'folder', expanded: false, children: [
        { name: 'math.js', type: 'javascript' },
        { name: 'helpers.js', type: 'javascript' }
      ]},
      { name: 'assets', type: 'folder', expanded: false, children: [
        { name: 'textures', type: 'folder' },
        { name: 'sounds', type: 'folder' },
        { name: 'models', type: 'folder' }
      ]}
    ]},
    { name: 'public', type: 'folder', expanded: false, children: [
      { name: 'index.html', type: 'html' },
      { name: 'style.css', type: 'css' }
    ]},
    { name: 'package.json', type: 'json' },
    { name: 'README.md', type: 'markdown' }
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'javascript': return <Icons.FileText className="w-4 h-4 text-yellow-500" />;
      case 'css': return <Icons.FileText className="w-4 h-4 text-blue-500" />;
      case 'html': return <Icons.FileText className="w-4 h-4 text-orange-500" />;
      case 'json': return <Icons.FileText className="w-4 h-4 text-green-500" />;
      case 'markdown': return <Icons.FileText className="w-4 h-4 text-gray-500" />;
      case 'folder': return <Icons.Folder className="w-4 h-4 text-blue-400" />;
      default: return <Icons.FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const updateCursorPosition = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const text = textarea.value;
      const cursorPos = textarea.selectionStart;
      
      const lines = text.substr(0, cursorPos).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      
      setCursorPosition({ line, column });
    }
  };

  const FileTreeItem = ({ item, depth = 0 }) => (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-800 cursor-pointer text-sm"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (item.type !== 'folder') {
            setCurrentFile(item.name);
          }
        }}
      >
        {getFileIcon(item.type)}
        <span className="text-gray-300">{item.name}</span>
        {item.type !== 'folder' && item.modified && (
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full ml-auto" />
        )}
      </div>
      {item.children && item.expanded && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeItem key={index} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full bg-gray-900 flex">
      {/* File Explorer */}
      <div className="w-64 bg-gray-850 border-r border-gray-700 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-300">Explorer</h2>
            <button className="text-gray-500 hover:text-gray-300">
              <Icons.Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <Icons.Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-7 pr-3 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {fileTree.map((item, index) => (
            <FileTreeItem key={index} item={item} />
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div className="flex items-center bg-gray-800 border-b border-gray-700">
          {openFiles.map((file, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 px-4 py-2 border-r border-gray-700 cursor-pointer transition-colors ${
                currentFile === file.name
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
              }`}
              onClick={() => setCurrentFile(file.name)}
            >
              {getFileIcon(file.type)}
              <span className="text-sm">{file.name}</span>
              {file.modified && (
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              )}
              <button className="ml-2 text-gray-500 hover:text-gray-300">
                <Icons.X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          <button className="px-2 py-2 text-gray-500 hover:text-gray-300">
            <Icons.Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-850 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Theme:</span>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="monokai">Monokai</option>
                <option value="github">GitHub</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Font Size:</span>
              <input
                type="range"
                min="10"
                max="20"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-16 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400 w-6">{fontSize}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors">
              Save
            </button>
            <button className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors">
              Format
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative">
          {/* Line Numbers */}
          <div className="absolute left-0 top-0 w-12 h-full bg-gray-850 border-r border-gray-700 z-10">
            <div className="p-2 font-mono text-xs text-gray-500 leading-6">
              {content.split('\n').map((_, index) => (
                <div key={index} className="text-right pr-2">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            className="w-full h-full pl-14 pr-4 py-2 bg-gray-900 text-gray-200 font-mono resize-none border-none outline-none leading-6"
            style={{ fontSize: `${fontSize}px` }}
            spellCheck={false}
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-1 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
            <span>UTF-8</span>
            <span>JavaScript</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>Spaces: 2</span>
            <button className="hover:text-gray-200">Auto Save: On</button>
          </div>
        </div>
      </div>

      {/* Mini Map (Optional) */}
      <div className="w-24 bg-gray-850 border-l border-gray-700 p-2">
        <div className="text-xs text-gray-500 mb-2">Mini Map</div>
        <div className="bg-gray-800 rounded h-full relative overflow-hidden">
          <div className="absolute inset-0 p-1">
            <div className="text-xs text-gray-600 leading-none font-mono whitespace-pre-wrap break-all">
              {content.substring(0, 200)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;