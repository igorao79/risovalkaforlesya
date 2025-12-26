'use client';

import React, { useState } from 'react';
import { useDrawing } from '@/context/DrawingContext';

export function LayersPanel() {
  const { state, addLayer, removeLayer, setActiveLayer, toggleLayerVisibility, setLayerOpacity } = useDrawing();
  const [newLayerName, setNewLayerName] = useState('');

  const handleAddLayer = () => {
    const name = newLayerName.trim() || `Слой ${state.layers.length + 1}`;
    addLayer(name);
    setNewLayerName('');
  };

  const handleRemoveLayer = (layerId: string) => {
    if (state.layers.length > 1) {
      removeLayer(layerId);
    }
  };

  return (
    <div className="w-full lg:w-64 bg-white/80 backdrop-blur-sm border-l border-gray-200 p-3 md:p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">📚 Слои</h3>
        <button
          onClick={handleAddLayer}
          className="px-2 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all duration-200 shadow-md"
          title="Добавить слой"
        >
          +
        </button>
      </div>

      {/* Добавление нового слоя */}
      <div className="mb-4">
        <div className="flex gap-2">
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
            className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddLayer}
            className="px-2 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-all duration-200"
          >
            ✓
          </button>
        </div>
      </div>

      {/* Список слоев */}
      <div className="space-y-2">
        {[...state.layers].reverse().map(layer => (
          <div
            key={layer.id}
            className={`p-3 border rounded cursor-pointer transition-colors ${
              state.activeLayerId === layer.id
                ? 'bg-blue-100 border-blue-300'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setActiveLayer(layer.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Видимость слоя */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                  title={layer.visible ? 'Скрыть слой' : 'Показать слой'}
                >
                  {layer.visible ? '👁️' : '🙈'}
                </button>

                {/* Название слоя */}
                <span className="text-sm font-medium text-gray-800 truncate">
                  {layer.name}
                </span>

                {/* Количество клеток */}
                <span className="text-xs text-gray-500">
                  ({layer.cells.length})
                </span>
              </div>

              {/* Удаление слоя */}
              {state.layers.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLayer(layer.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Удалить слой"
                >
                  ×
                </button>
              )}
            </div>

            {/* Прозрачность */}
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Прозрачность:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layer.opacity}
                  onChange={(e) => setLayerOpacity(layer.id, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 h-1"
                />
                <span className="text-xs text-gray-600 w-8">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
            </div>

            {/* Миниатюра слоя */}
            <div className="mt-2 border border-gray-200 rounded overflow-hidden">
              <div
                className="w-full h-12 bg-gray-100 relative"
                style={{ imageRendering: 'pixelated' }}
              >
                {layer.cells.slice(0, 50).map(cell => (
                  <div
                    key={`${cell.x}-${cell.y}`}
                    className="absolute"
                    style={{
                      left: `${(cell.x / state.canvasSize.width) * 100}%`,
                      top: `${(cell.y / state.canvasSize.height) * 100}%`,
                      width: `${(1 / state.canvasSize.width) * 100}%`,
                      height: `${(1 / state.canvasSize.height) * 100}%`,
                      backgroundColor: cell.color,
                      opacity: layer.opacity
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Статистика */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div>Всего слоев: {state.layers.length}</div>
          <div>Активный слой: {state.layers.find(l => l.id === state.activeLayerId)?.name}</div>
          <div>
            Размер холста: {state.canvasSize.width}×{state.canvasSize.height}
          </div>
        </div>
      </div>
    </div>
  );
}
