'use client';

import React from 'react';
import { useDrawing } from '@/context/DrawingContext';
import { DEFAULT_BRUSHES, DEFAULT_COLORS } from '@/types';

export function Toolbar() {
  const { state, dispatch, undo, redo, exportCanvas } = useDrawing();

  const tools = [
    { id: 'brush', name: 'Кисть', icon: '🖌️' },
    { id: 'eraser', name: 'Ластик', icon: '🧽' },
    { id: 'fill', name: 'Заливка', icon: '🪣' },
    { id: 'picker', name: 'Пипетка', icon: '👁️' }
  ];

  const handleToolChange = (tool: 'brush' | 'eraser' | 'fill' | 'picker') => {
    dispatch({ type: 'SET_TOOL', payload: tool });
  };

  const handleBrushChange = (brushId: string) => {
    const brush = DEFAULT_BRUSHES.find(b => b.id === brushId);
    if (brush) {
      dispatch({ type: 'SET_CURRENT_BRUSH', payload: brush });
    }
  };

  const handleCellSizeChange = (size: number) => {
    dispatch({ type: 'SET_CELL_SIZE', payload: size });
  };

  const handleZoomChange = (zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  };

  const handleSave = () => {
    const dataUrl = exportCanvas();
    const link = document.createElement('a');
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="p-2 md:p-4">
      <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center md:justify-start">
        {/* Инструменты */}
        <div className="flex gap-1 md:gap-2">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id as 'brush' | 'eraser' | 'fill' | 'picker')}
              className={`px-2 md:px-3 py-2 rounded-lg border-2 transition-all duration-200 text-sm md:text-base ${
                state.tool === tool.id
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105'
                  : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400'
              }`}
              title={tool.name}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Разделитель */}
        <div className="w-px h-8 bg-gray-300 hidden md:block" />

        {/* Кисти */}
        <div className="flex items-center gap-2">
          <label className="text-xs md:text-sm font-medium text-gray-700">Кисть:</label>
          <select
            value={state.currentBrush.id}
            onChange={(e) => handleBrushChange(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs md:text-sm bg-white"
          >
            {DEFAULT_BRUSHES.map(brush => (
              <option key={brush.id} value={brush.id}>
                {brush.name}
              </option>
            ))}
          </select>
        </div>

        {/* Размер клеток */}
        <div className="flex items-center gap-2">
          <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Размер клетки:</label>
          <input
            type="range"
            min="4"
            max="20"
            step="2"
            value={state.cellSize}
            onChange={(e) => handleCellSizeChange(Number(e.target.value))}
            className="w-12 md:w-16"
          />
          <span className="text-xs md:text-sm text-gray-600 w-6 md:w-8">{state.cellSize}px</span>
        </div>

        {/* Масштаб */}
        <div className="flex items-center gap-2">
          <label className="text-xs md:text-sm font-medium text-gray-700">Масштаб:</label>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={state.zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-12 md:w-16"
          />
          <span className="text-xs md:text-sm text-gray-600 w-8 md:w-12">{state.zoom}x</span>
        </div>

        {/* Разделитель */}
        <div className="w-px h-8 bg-gray-300 hidden md:block" />

        {/* Действия с историей */}
        <div className="flex gap-1 md:gap-2">
          <button
            onClick={undo}
            disabled={state.historyIndex <= 0}
            className="px-2 md:px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            title="Отменить (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={redo}
            disabled={state.historyIndex >= state.history.length - 1}
            className="px-2 md:px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            title="Повторить (Ctrl+Y)"
          >
            ↷
          </button>
        </div>

        {/* Сохранение */}
        <button
          onClick={handleSave}
          className="px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
        >
          💾 Сохранить PNG
        </button>
      </div>
    </div>
  );
}

export function ColorPicker() {
  const { state, dispatch } = useDrawing();

  const handleColorChange = (color: string) => {
    dispatch({ type: 'SET_CURRENT_COLOR', payload: color });
  };

  return (
    <div className="p-2 md:p-4">
      <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
        <label className="text-xs md:text-sm font-medium text-gray-700 mr-2">Цвет:</label>

        {/* Палитра цветов */}
        <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1">
          {DEFAULT_COLORS.map(color => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`w-6 h-6 md:w-8 md:h-8 border-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                state.currentColor === color
                  ? 'border-blue-500 scale-110 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Кастомный цвет */}
        <div className="flex items-center gap-2 ml-2 md:ml-4">
          <input
            type="color"
            value={state.currentColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-8 h-8 md:w-10 md:h-8 border border-gray-300 rounded cursor-pointer"
            title="Выбрать любой цвет"
          />

          {/* Текущий цвет */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 md:w-8 md:h-8 border-2 border-gray-300 rounded-lg shadow-inner"
              style={{ backgroundColor: state.currentColor }}
            />
            <span className="text-xs md:text-sm text-gray-700 font-mono hidden md:block">
              {state.currentColor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
