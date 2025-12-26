'use client';

import React, { useState } from 'react';
import { useDrawing } from '@/context/DrawingContext';
import { DEFAULT_BRUSHES } from '@/types';
import { 
  Brush, 
  Eraser, 
  PaintBucket, 
  Pipette,
  Save,
  Palette
} from 'lucide-react';
import { ColorPickerModal } from './ColorPickerModal';

export function CompactToolbar() {
  const { state, dispatch, exportCanvas } = useDrawing();
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const tools = [
    { id: 'brush', name: 'Кисть', icon: Brush, shortcut: 'B' },
    { id: 'eraser', name: 'Ластик', icon: Eraser, shortcut: 'E' },
    { id: 'fill', name: 'Заливка', icon: PaintBucket, shortcut: 'F' },
    { id: 'picker', name: 'Пипетка', icon: Pipette, shortcut: 'I' }
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

  const handleSave = () => {
    const dataUrl = exportCanvas();
    const link = document.createElement('a');
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    setActivePopover(null);
  };

  const handleColorChange = (color: string) => {
    dispatch({ type: 'SET_CURRENT_COLOR', payload: color });
  };

  return (
    <div className="flex flex-col items-center py-4 space-y-3">
      {/* Инструменты */}
      <div className="space-y-2">
        {tools.map(tool => {
          const IconComponent = tool.icon;
          return (
            <div key={tool.id} className="relative">
              <button
                onClick={() => handleToolChange(tool.id as 'brush' | 'eraser' | 'fill' | 'picker')}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setActivePopover(activePopover === tool.id ? null : tool.id);
                }}
                className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                  state.tool === tool.id
                    ? 'bg-purple-300 text-slate-800 border-purple-300 shadow-lg shadow-purple-200 scale-105'
                    : 'bg-white text-slate-600 border-purple-200 hover:bg-purple-50 hover:scale-105'
                }`}
                title={`${tool.name} (${tool.shortcut}) - ПКМ для настроек`}
              >
                <IconComponent className="w-5 h-5" />
              </button>

            {activePopover === tool.id && (
              <div className="absolute top-full left-0 mt-2 bg-white backdrop-blur-md border border-purple-200 rounded-xl p-4 shadow-xl z-50 min-w-64">
                <div className="text-center">
                  <h3 className="font-semibold text-slate-800 mb-2">{tool.name}</h3>
                  <p className="text-sm text-slate-600 mb-3">Выберите кисть для этого инструмента</p>

                  <div className="grid grid-cols-2 gap-2">
                    {DEFAULT_BRUSHES.slice(0, 4).map(brush => (
                      <button
                        key={brush.id}
                        onClick={() => handleBrushChange(brush.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          state.currentBrush.id === brush.id
                            ? 'bg-purple-200 text-slate-800 border-purple-300'
                            : 'bg-purple-50 text-slate-700 hover:bg-purple-100 border-purple-200'
                        }`}
                      >
                        <div className="text-xs font-medium">{brush.name}</div>
                        <div className="text-xs opacity-70">{brush.size}×{brush.size}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>

      {/* Разделитель */}
      <div className="w-8 h-px bg-white/20" />

      {/* Действия */}
      <div className="space-y-2">
        {/* Сохранение */}
        <button
          onClick={handleSave}
          className="w-12 h-12 rounded-xl border-2 bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200 transition-all duration-200 flex items-center justify-center shadow-sm"
          title="Сохранить (Ctrl+S)"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      {/* Разделитель */}
      <div className="w-8 h-px bg-white/20" />

      {/* Цвета */}
      <div className="space-y-2">
        {/* Последние использованные цвета */}
        <div className="grid grid-cols-2 gap-1">
          {state.recentColors.slice(0, 8).map((color, index) => (
            <button
              key={`${color}-${index}`}
              onClick={() => handleColorChange(color)}
              className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                state.currentColor === color
                  ? 'border-purple-400 scale-110 ring-2 ring-purple-200'
                  : 'border-purple-200'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Текущий цвет + открыть палитру */}
        <button
          onClick={() => setIsColorPickerOpen(true)}
          className="w-full flex items-center justify-center group"
          title="Открыть палитру цветов"
        >
          <div className="relative w-12 h-12">
            <div
              className="w-full h-full border-2 border-purple-200 rounded-xl cursor-pointer transition-all group-hover:scale-105 group-hover:border-purple-300 shadow-sm"
              style={{ backgroundColor: state.currentColor }}
            />
            <div className="absolute -bottom-1 -right-1 bg-purple-300 text-slate-800 rounded-full p-1 shadow-md group-hover:bg-purple-400 transition-colors">
              <Palette className="w-3 h-3" />
            </div>
          </div>
        </button>
      </div>

      {/* Модалка выбора цвета */}
      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        currentColor={state.currentColor}
        recentColors={state.recentColors}
        onColorSelect={handleColorChange}
      />
    </div>
  );
}
