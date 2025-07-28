// plugins/editor/components/PhysicsPanel.jsx
import React, { useState } from 'react';
import { Icons } from '@/plugins/editor/components/Icons';

const physicsObjects = [
  { id: 'player', name: 'Player Character', type: 'rigidbody', mass: 70, enabled: true },
  { id: 'crate1', name: 'Wooden Crate', type: 'rigidbody', mass: 15, enabled: true },
  { id: 'floor', name: 'Ground Plane', type: 'static', mass: 0, enabled: true },
  { id: 'platform', name: 'Moving Platform', type: 'kinematic', mass: 50, enabled: true },
  { id: 'trigger1', name: 'Door Trigger', type: 'trigger', mass: 0, enabled: true },
];

const colliderTypes = [
  { id: 'box', name: 'Box Collider', icon: Icons.Square },
  { id: 'sphere', name: 'Sphere Collider', icon: Icons.Circle },
  { id: 'capsule', name: 'Capsule Collider', icon: Icons.Capsule },
  { id: 'mesh', name: 'Mesh Collider', icon: Icons.Mesh },
];

const materialPresets = [
  { id: 'default', name: 'Default', friction: 0.6, restitution: 0.0 },
  { id: 'ice', name: 'Ice', friction: 0.05, restitution: 0.1 },
  { id: 'rubber', name: 'Rubber', friction: 0.8, restitution: 0.9 },
  { id: 'metal', name: 'Metal', friction: 0.3, restitution: 0.2 },
];

function PhysicsPanel() {
  const [selectedObject, setSelectedObject] = useState('player');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [selectedCollider, setSelectedCollider] = useState('box');
  const [physicsStep, setPhysicsStep] = useState(60);

  const currentObject = physicsObjects.find(obj => obj.id === selectedObject);

  return (
    <div className="h-full flex bg-slate-800">
      {/* Physics Objects List */}
      <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-3 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Physics Objects</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300">+ Add</button>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setSimulationRunning(!simulationRunning)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                simulationRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {simulationRunning ? (
                <>
                  <div className="w-2 h-2 bg-white" />
                  Stop
                </>
              ) : (
                <>
                  <Icons.Play className="w-3 h-3" />
                  Play
                </>
              )}
            </button>
            <button className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors">
              Reset
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-1 p-2">
            {physicsObjects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => setSelectedObject(obj.id)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  selectedObject === obj.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`w-3 h-3 rounded border-2 ${
                  obj.enabled ? 'bg-green-500 border-green-500' : 'border-gray-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{obj.name}</div>
                  <div className="text-xs text-gray-400 capitalize">
                    {obj.type} {obj.mass > 0 && `• ${obj.mass}kg`}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  obj.type === 'rigidbody' ? 'bg-red-400' :
                  obj.type === 'kinematic' ? 'bg-yellow-400' :
                  obj.type === 'trigger' ? 'bg-purple-400' : 'bg-gray-400'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Physics Properties */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              {currentObject ? `${currentObject.name} Properties` : 'Physics Properties'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Step Rate:</span>
              <select 
                value={physicsStep}
                onChange={(e) => setPhysicsStep(Number(e.target.value))}
                className="bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
              >
                <option value={30}>30 Hz</option>
                <option value={60}>60 Hz</option>
                <option value={120}>120 Hz</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          {currentObject ? (
            <div className="space-y-6">
              {/* Rigidbody Properties */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Rigidbody</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Body Type</label>
                    <select className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded">
                      <option value="rigidbody">Dynamic</option>
                      <option value="kinematic">Kinematic</option>
                      <option value="static">Static</option>
                      <option value="trigger">Trigger</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Mass (kg)</label>
                    <input
                      type="number"
                      defaultValue={currentObject.mass}
                      min="0.1"
                      step="0.1"
                      className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Linear Drag</label>
                      <span className="text-xs text-white">0.1</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      defaultValue="0.1"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Angular Drag</label>
                      <span className="text-xs text-white">0.05</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.01"
                      defaultValue="0.05"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="gravity" defaultChecked className="text-blue-600" />
                    <label htmlFor="gravity" className="text-xs text-gray-300">Use Gravity</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="freeze-rotation" className="text-blue-600" />
                    <label htmlFor="freeze-rotation" className="text-xs text-gray-300">Freeze Rotation</label>
                  </div>
                </div>
              </div>
              
              {/* Collider Properties */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Collider</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Collider Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {colliderTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedCollider(type.id)}
                          className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                            selectedCollider === type.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <type.icon className="w-3 h-3" />
                          {type.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is-trigger" className="text-blue-600" />
                    <label htmlFor="is-trigger" className="text-xs text-gray-300">Is Trigger</label>
                  </div>
                  
                  {/* Collider Size */}
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="X"
                        defaultValue="1"
                        step="0.1"
                        className="bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        defaultValue="1"
                        step="0.1"
                        className="bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                      />
                      <input
                        type="number"
                        placeholder="Z"
                        defaultValue="1"
                        step="0.1"
                        className="bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Physics Material */}
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Physics Material</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Material Preset</label>
                    <select className="w-full bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded">
                      {materialPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Friction</label>
                      <span className="text-xs text-white">0.6</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue="0.6"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-300">Bounciness</label>
                      <span className="text-xs text-white">0.0</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue="0"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-sm">Select a physics object to edit its properties</p>
            </div>
          )}
          
          {/* Physics World Settings */}
          <div className="mt-6 p-3 bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-3">World Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">Gravity</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="X"
                    defaultValue="0"
                    className="bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    defaultValue="-9.81"
                    className="bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Z"
                    defaultValue="0"
                    className="bg-slate-800 border border-slate-600 text-white text-xs p-1 rounded"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="auto-sleep" defaultChecked className="text-blue-600" />
                <label htmlFor="auto-sleep" className="text-xs text-gray-300">Auto Sleep Objects</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhysicsPanel;