// plugins/editor/components/ConsolePanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';

const consoleLogs = [
  { id: 1, type: 'info', timestamp: '14:32:01', message: 'Engine initialized successfully', source: 'Core' },
  { id: 2, type: 'info', timestamp: '14:32:02', message: 'Scene loaded: MainScene.unity', source: 'SceneManager' },
  { id: 3, type: 'warning', timestamp: '14:32:05', message: 'Texture compression quality reduced for mobile', source: 'Renderer' },
  { id: 4, type: 'info', timestamp: '14:32:08', message: 'Player spawned at position (0, 0, 0)', source: 'GameManager' },
  { id: 5, type: 'error', timestamp: '14:32:12', message: 'Failed to load audio file: missing.ogg', source: 'AudioManager' },
  { id: 6, type: 'info', timestamp: '14:32:15', message: 'Physics simulation started', source: 'Physics' },
  { id: 7, type: 'warning', timestamp: '14:32:18', message: 'Memory usage: 78% of allocated heap', source: 'Memory' },
  { id: 8, type: 'info', timestamp: '14:32:20', message: 'Frame rate: 60 FPS (target: 60)', source: 'Renderer' },
];

function ConsolePanel() {
  const [logs, setLogs] = useState(consoleLogs);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [command, setCommand] = useState('');
  const consoleEndRef = useRef(null);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.type === filter;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const executeCommand = () => {
    if (!command.trim()) return;
    
    const newLog = {
      id: logs.length + 1,
      type: 'command',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `> ${command}`,
      source: 'Console'
    };
    
    setLogs(prev => [...prev, newLog]);
    setCommand('');
  };

  const clearConsole = () => {
    setLogs([]);
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return <Icons.XMark className="w-3 h-3 text-red-400" />;
      case 'warning': return <div className="w-3 h-3 bg-yellow-400 rounded-full" />;
      case 'command': return <Icons.CommandLine className="w-3 h-3 text-blue-400" />;
      default: return <Icons.Circle className="w-3 h-3 text-green-400" />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-300';
      case 'warning': return 'text-yellow-300';
      case 'command': return 'text-blue-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Console Header */}
      <div className="p-3 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-white">Console</h3>
            <div className="flex items-center gap-1">
              {['all', 'info', 'warning', 'error'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({logs.filter(log => log.type === filterType).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icons.MagnifyingGlass className="w-3 h-3 absolute left-2 top-1.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 pr-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-32"
              />
            </div>
            <button
              onClick={clearConsole}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {/* Console Output */}
      <div className="flex-1 overflow-y-auto scrollbar-thin font-mono">
        <div className="p-2 space-y-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 px-2 py-1 text-xs hover:bg-slate-700/30 rounded transition-colors ${getLogColor(log.type)}`}
            >
              <span className="text-gray-500 shrink-0">{log.timestamp}</span>
              <div className="shrink-0 mt-0.5">{getLogIcon(log.type)}</div>
              <span className="text-gray-400 shrink-0 min-w-[80px]">[{log.source}]</span>
              <span className="break-all">{log.message}</span>
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
      </div>
      
      {/* Command Input */}
      <div className="border-t border-slate-700 p-2 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">&gt;</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none placeholder-gray-500"
          />
          <button
            onClick={executeCommand}
            disabled={!command.trim()}
            className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsolePanel;