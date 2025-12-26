'use client';

import React, { useState } from 'react';
import { useDrawing } from '@/context/DrawingContext';
// Simple popover implementation

export function CompactLayersPanel() {
  const { state, addLayer, removeLayer, toggleLayerVisibility, setLayerOpacity, toggleGrid, dispatch } = useDrawing();
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
    }
  };

  return (
    <div className="flex flex-col items-center py-4 space-y-3">
      {/* Список слоев */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {[...state.layers].reverse().map((layer, index) => (
          <div key={layer.id} className="relative">
            <button
              onClick={() => {
                // При клике переключаем активный слой
                setActivePopover(activePopover === layer.id ? null : layer.id);
              }}
              className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-xs relative ${
                state.activeLayerId === layer.id
                  ? 'bg-blue-500 text-white border-blue-400 shadow-lg scale-105'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:scale-105'
              }`}
              title={`${layer.name} (${layer.cells.length} пикселей)`}
            >
              <div className="text-lg">{index + 1}</div>
              {!layer.visible && <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">🙈</div>}
            </button>

            {activePopover === layer.id && (
              <div className="absolute top-0 right-full mr-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl z-50 min-w-64">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{layer.name}</h3>
                    {state.layers.length > 1 && (
                      <button
                        onClick={() => handleRemoveLayer(layer.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Удалить слой"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => toggleLayerVisibility(layer.id)}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700">Видимый</label>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700 block mb-1">Прозрачность</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={layer.opacity}
                      onChange={(e) => setLayerOpacity(layer.id, Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 text-center mt-1">
                      {Math.round(layer.opacity * 100)}%
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700 block mb-1">Пикселей: {layer.cells.length}</label>
                    <div className="w-full h-12 bg-gray-100 rounded border overflow-hidden relative">
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
          className="w-12 h-12 rounded-xl border-2 bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30 transition-all duration-200 flex items-center justify-center text-lg"
          title="Добавить слой"
        >
          +
        </button>

        {activePopover === 'add-layer' && (
          <div className="absolute top-0 right-full mr-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl z-50 min-w-64">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Добавить слой</h3>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddLayer}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ➕ Добавить слой
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
              // Очищаем все клетки активного слоя
              activeLayer.cells.forEach(cell => {
                dispatch({ type: 'CLEAR_CELL', payload: { x: cell.x, y: cell.y } });
              });
            }
          }}
          className="w-12 h-12 rounded-xl border-2 bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30 transition-all duration-200 flex items-center justify-center text-lg"
          title="Очистить активный слой"
        >
          🗑️
        </button>

        {/* Показать/скрыть сетку */}
        <button
          onClick={toggleGrid}
          className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-lg ${
            state.showGrid
              ? 'bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30'
              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
          }`}
          title={state.showGrid ? "Скрыть сетку" : "Показать сетку"}
        >
          📐
        </button>
      </div>
    </div>
  );
}
