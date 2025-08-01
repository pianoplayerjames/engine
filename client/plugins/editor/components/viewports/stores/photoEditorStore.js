import { proxy } from 'valtio';
import { devToolsManager } from '@/utils/devToolsManager.js';
import { log } from '@/utils/logger.js';

// Factory function to create a new photo editor store
export const createPhotoEditorStore = () => {
  const state = proxy({
    selectedTool: 'move',
    zoom: 100,
    image: null,
    layers: [
      { id: '1', name: 'Background', type: 'background', visible: true, locked: false, opacity: 100 }
    ],
    selectedLayer: '1',
    blendMode: 'normal',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    brushSettings: {
      size: 50,
      hardness: 100,
      opacity: 100,
      flow: 100
    },
    history: [
      { id: '1', name: 'Open', action: 'open', time: new Date().toLocaleTimeString() }
    ],
    currentHistoryIndex: 0,
    activeAdjustment: 'brightness-contrast',
    adjustments: {
      brightness: 0,
      contrast: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 0,
      vibrance: 0,
      hue: 0,
      temperature: 0,
      tint: 0,
      clarity: 0,
      dehaze: 0,
      vignette: 0
    }
  });

  const actions = {
    setTool: (tool) => {
      state.selectedTool = tool;
    },
    setZoom: (zoom) => {
      state.zoom = zoom;
    },
    setImage: (image) => {
      state.image = image;
    },
    addLayer: (layer) => {
      state.layers.push(layer);
    },
    updateLayer: (layerId, updates) => {
      const layerIndex = state.layers.findIndex(l => l.id === layerId);
      if (layerIndex !== -1) {
        Object.assign(state.layers[layerIndex], updates);
      }
    },
    removeLayer: (layerId) => {
      state.layers = state.layers.filter(l => l.id !== layerId);
    },
    setSelectedLayer: (layerId) => {
      state.selectedLayer = layerId;
    },
    setBlendMode: (blendMode) => {
      state.blendMode = blendMode;
    },
    setColors: (foreground, background) => {
      if (foreground !== undefined) state.foregroundColor = foreground;
      if (background !== undefined) state.backgroundColor = background;
    },
    updateBrushSettings: (settings) => {
      Object.assign(state.brushSettings, settings);
    },
    addHistoryState: (action) => {
      const history = state.history;
      const newState = {
        id: Date.now().toString(),
        name: action.name,
        action: action.type,
        time: new Date().toLocaleTimeString()
      };
      history.splice(state.currentHistoryIndex + 1);
      history.push(newState);
      state.currentHistoryIndex = history.length - 1;
    },
    setHistoryIndex: (index) => {
      const maxIndex = state.history.length - 1;
      state.currentHistoryIndex = Math.max(0, Math.min(index, maxIndex));
    },
    setActiveAdjustment: (adjustment) => {
      state.activeAdjustment = adjustment;
    },
    setAdjustment: (property, value) => {
      state.adjustments[property] = value;
    },
    resetAdjustments: () => {
      state.adjustments = {
        brightness: 0,
        contrast: 0,
        exposure: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0,
        saturation: 0,
        vibrance: 0,
        hue: 0,
        temperature: 0,
        tint: 0,
        clarity: 0,
        dehaze: 0,
        vignette: 0
      };
    },
    registerDevTools: (id) => {
      devToolsManager.register(`PhotoEditorState_${id}`, state, {
        trace: true
      });
      log(`🔧 Photo Editor DevTools registered for ${id}`);
    },
    unregisterDevTools: (id) => {
      devToolsManager.unregister(`PhotoEditorState_${id}`);
      log(`🔌 Photo Editor DevTools unregistered for ${id}`);
    }
  };

  return { state, actions };
};