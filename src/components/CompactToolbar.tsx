'use client';

import React, { useState } from 'react';
import { useDrawing } from '@/context/DrawingContext';
import { DEFAULT_BRUSHES, DEFAULT_COLORS } from '@/types';
// Simple popover implementation without motion-primitives

export function CompactToolbar() {
  const { state, dispatch, undo, redo, exportCanvas } = useDrawing();
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const tools = [
    { id: 'brush', name: 'Кисть', icon: '🖌️', shortcut: 'B' },
    { id: 'eraser', name: 'Ластик', icon: '🧽', shortcut: 'E' },
    { id: 'fill', name: 'Заливка', icon: '🪣', shortcut: 'F' },
    { id: 'picker', name: 'Пипетка', icon: '👁️', shortcut: 'I' }
  ];

  const handleToolChange = (tool: 'brush' | 'eraser' | 'fill' | 'picker') => {
    dispatch({ type: 'SET_TOOL', payload: tool });
    setActivePopover(null);
  };

  const handleBrushChange = (brushId: string) => {
    const brush = DEFAULT_BRUSHES.find(b => b.id === brushId);
    if (brush) {
      dispatch({ type: 'SET_CURRENT_BRUSH', payload: brush });
    }
    setActivePopover(null);
  };

  const handleZoomChange = (zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
    setActivePopover(null);
  };

  const handleSave = () => {
    const dataUrl = exportCanvas();
    const link = document.createElement('a');
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    setActivePopover(null);
  };

  return (
    <div className="flex flex-col items-center py-4 space-y-3">
      {/* Инструменты */}
      <div className="space-y-2">
        {tools.map(tool => (
          <div key={tool.id} className="relative">
            <button
              onClick={() => handleToolChange(tool.id as 'brush' | 'eraser' | 'fill' | 'picker')}
              onContextMenu={(e) => {
                e.preventDefault();
                setActivePopover(activePopover === tool.id ? null : tool.id);
              }}
              className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-lg ${
                state.tool === tool.id
                  ? 'bg-blue-500 text-white border-blue-400 shadow-lg scale-105'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:scale-105'
              }`}
              title={`${tool.name} (${tool.shortcut}) - ПКМ для настроек`}
            >
              {tool.icon}
            </button>

            {activePopover === tool.id && (
              <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl z-50 min-w-64">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 mb-2">{tool.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">Выберите кисть для этого инструмента</p>

                  <div className="grid grid-cols-2 gap-2">
                    {DEFAULT_BRUSHES.slice(0, 4).map(brush => (
                      <button
                        key={brush.id}
                        onClick={() => handleBrushChange(brush.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          state.currentBrush.id === brush.id
                            ? 'bg-blue-500 text-white border-blue-400'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        <div className="text-xs font-medium">{brush.name}</div>
                        <div className="text-xs text-gray-500">{brush.size}×{brush.size}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Разделитель */}
      <div className="w-8 h-px bg-white/20" />

      {/* Действия */}
      <div className="space-y-2">
        {/* Отмена/Повтор */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(activePopover === 'history' ? null : 'history')}
            className="w-12 h-12 rounded-xl border-2 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
            title="История"
          >
            ↩️
          </button>

          {activePopover === 'history' && (
            <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl z-50">
              <div className="text-center space-y-3">
                <h3 className="font-semibold text-gray-800">История</h3>
                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    disabled={state.historyIndex <= 0}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    ↶ Отмена
                  </button>
                  <button
                    onClick={redo}
                    disabled={state.historyIndex >= state.history.length - 1}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    ↷ Повтор
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Масштаб */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(activePopover === 'zoom' ? null : 'zoom')}
            className="w-12 h-12 rounded-xl border-2 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
            title="Масштаб"
          >
            🔍
          </button>

          {activePopover === 'zoom' && (
            <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl z-50">
              <div className="text-center space-y-3">
                <h3 className="font-semibold text-gray-800">Масштаб</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0.25"
                    max="4"
                    step="0.25"
                    value={state.zoom}
                    onChange={(e) => handleZoomChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">{state.zoom}x</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[0.5, 1, 2, 4].map(zoom => (
                    <button
                      key={zoom}
                      onClick={() => handleZoomChange(zoom)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        state.zoom === zoom
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-200'
                      }`}
                    >
                      {zoom}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Сохранение */}
        <button
          onClick={handleSave}
          className="w-12 h-12 rounded-xl border-2 bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30 transition-all duration-200 flex items-center justify-center"
          title="Сохранить (Ctrl+S)"
        >
          💾
        </button>
      </div>

      {/* Разделитель */}
      <div className="w-8 h-px bg-white/20" />

      {/* Цвета */}
      <div className="space-y-2">
        {/* Быстрые цвета */}
        <div className="grid grid-cols-2 gap-1">
          {DEFAULT_COLORS.slice(0, 8).map(color => (
            <button
              key={color}
              onClick={() => dispatch({ type: 'SET_CURRENT_COLOR', payload: color })}
              className={`w-6 h-6 rounded border transition-all hover:scale-110 ${
                state.currentColor === color
                  ? 'border-white scale-110'
                  : 'border-white/30'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Текущий цвет */}
        <div className="flex items-center justify-center">
          <div
            className="w-8 h-8 border-2 border-white/50 rounded"
            style={{ backgroundColor: state.currentColor }}
          />
        </div>
      </div>
    </div>
  );
}
