'use client';

import React, { useState } from 'react';
import { useDrawing } from '@/context/DrawingContext';
import { Plus, Trash2, Grid3X3, Eye, EyeOff } from 'lucide-react';

export function CompactLayersPanel() {
  const { state, addLayer, removeLayer, setActiveLayer, toggleLayerVisibility, setLayerOpacity, toggleGrid, dispatch } = useDrawing();
  const [newLayerName, setNewLayerName] = useState('');
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const handleAddLayer = () => {
    const name = newLayerName.trim() || `Слой ${state.layers.length + 1}`;
    addLayer(name);
    setNewLayerName('');
    setActivePopover(null);
  };

  const handleRemoveLayer = (layerId: string) => {
    if (state.layers.length > 1) {
      removeLayer(layerId);
      setActivePopover(null);
    }
  };

  const handleLayerClick = (layerId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveLayer(layerId);
    setActivePopover(activePopover === layerId ? null : layerId);
  };

  return (
    <div className="flex flex-col items-center py-4 space-y-3">
      {/* Список слоев */}
      <div className="space-y-2 w-full flex flex-col items-center">
        {state.layers.map((layer, index) => (
          <div key={layer.id} className="relative">
            <button
              onClick={(e) => handleLayerClick(layer.id, e)}
              onContextMenu={(e) => {
                e.preventDefault();
                setActivePopover(activePopover === layer.id ? null : layer.id);
              }}
              className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-xs ${
                state.activeLayerId === layer.id
                  ? 'bg-purple-300 text-slate-800 border-purple-300 shadow-lg shadow-purple-200 scale-105'
                  : 'bg-white text-slate-600 border-purple-200 hover:bg-purple-50 hover:scale-105'
              }`}
              title={`${layer.name} (${layer.cells.length} пикселей)`}
            >
              <div className="text-lg">{index + 1}</div>
              {!layer.visible && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <EyeOff className="w-4 h-4" />
                </div>
              )}
            </button>

            {activePopover === layer.id && (
              <div className="absolute top-full right-0 mt-2 bg-white backdrop-blur-md border border-purple-200 rounded-xl p-4 shadow-xl z-50 min-w-64">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{layer.name}</h3>
                    {state.layers.length > 1 && (
                      <button
                        onClick={() => handleRemoveLayer(layer.id)}
                        className="text-red-400 hover:text-red-500"
                        title="Удалить слой"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border ${
                        layer.visible
                          ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
                          : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="text-sm">{layer.visible ? 'Видимый' : 'Скрытый'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-sm text-slate-700 block mb-1">Прозрачность</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={layer.opacity}
                      onChange={(e) => setLayerOpacity(layer.id, Number(e.target.value))}
                      className="w-full accent-purple-400"
                    />
                    <div className="text-xs text-slate-600 text-center mt-1">
                      {Math.round(layer.opacity * 100)}%
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-700 block mb-1">Пикселей: {layer.cells.length}</label>
                    <div className="w-full h-12 bg-purple-50 rounded border border-purple-200 overflow-hidden relative">
                      {layer.cells.slice(0, 100).map(cell => (
                        <div
                          key={`${cell.x}-${cell.y}`}
                          className="absolute w-1 h-1"
                          style={{
                            left: `${(cell.x / state.canvasSize.width) * 100}%`,
                            top: `${(cell.y / state.canvasSize.height) * 100}%`,
                            backgroundColor: cell.color,
                            opacity: layer.opacity
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Разделитель */}
      <div className="w-8 h-px bg-white/20" />

      {/* Добавить слой */}
      <div className="relative">
        <button
          onClick={() => setActivePopover(activePopover === 'add-layer' ? null : 'add-layer')}
          onContextMenu={(e) => {
            e.preventDefault();
            setActivePopover(activePopover === 'add-layer' ? null : 'add-layer');
          }}
          className="w-12 h-12 rounded-xl border-2 bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200 transition-all duration-200 flex items-center justify-center shadow-sm"
          title="Добавить слой"
        >
          <Plus className="w-5 h-5" />
        </button>

        {activePopover === 'add-layer' && (
          <div className="absolute top-full right-0 mt-2 bg-white backdrop-blur-md border border-purple-200 rounded-xl p-4 shadow-xl z-50 min-w-64">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Добавить слой</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddLayer();
                    }
                  }}
                  placeholder="Название слоя"
                  className="w-full px-3 py-2 bg-white border border-purple-200 text-slate-800 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  onClick={handleAddLayer}
                  className="w-full px-4 py-2 bg-purple-300 text-slate-800 rounded-lg hover:bg-purple-400 transition-colors flex items-center justify-center gap-2 border border-purple-300"
                >
                  <Plus className="w-4 h-4" />
                  Добавить слой
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Разделитель */}
      <div className="w-8 h-px bg-white/20" />

      {/* Дополнительные действия */}
      <div className="space-y-2">
        {/* Очистить слой */}
        <button
          onClick={() => {
            const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
            if (activeLayer && activeLayer.cells.length > 0) {
              activeLayer.cells.forEach(cell => {
                dispatch({ type: 'CLEAR_CELL', payload: { x: cell.x, y: cell.y } });
              });
            }
          }}
          className="w-12 h-12 rounded-xl border-2 bg-red-50 text-red-500 border-red-200 hover:bg-red-100 transition-all duration-200 flex items-center justify-center"
          title="Очистить активный слой"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        {/* Показать/скрыть сетку */}
        <button
          onClick={toggleGrid}
          className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
            state.showGrid
              ? 'bg-purple-200 text-slate-800 border-purple-300 hover:bg-purple-300'
              : 'bg-white text-slate-600 border-purple-200 hover:bg-purple-50'
          }`}
          title={state.showGrid ? "Скрыть сетку" : "Показать сетку"}
        >
          <Grid3X3 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
