'use client';

import React, { useState } from 'react';
import { useDrawing } from '@/context/DrawingContext';
import { DEFAULT_COLORS } from '@/types';
// Simple popover implementation

export function CompactColorPicker() {
  const { state, dispatch } = useDrawing();
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const handleColorChange = (color: string) => {
    dispatch({ type: 'SET_CURRENT_COLOR', payload: color });
    setActivePopover(null);
  };

  // Разделим цвета на группы для лучшей организации
  const colorGroups = [
    { name: 'Базовые', colors: DEFAULT_COLORS.slice(0, 8) },
    { name: 'Дополнительные', colors: DEFAULT_COLORS.slice(8, 16) },
    { name: 'Пастельные', colors: DEFAULT_COLORS.slice(16, 24) },
    { name: 'Яркие', colors: DEFAULT_COLORS.slice(24) }
  ];

  return (
    <div className="flex items-center justify-center px-4 py-2">
      {/* Быстрые цвета */}
      <div className="flex gap-1 mr-4">
        {DEFAULT_COLORS.slice(0, 8).map(color => (
          <button
            key={color}
            onClick={() => handleColorChange(color)}
            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
              state.currentColor === color
                ? 'border-white scale-110 shadow-lg'
                : 'border-white/30'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Кнопка дополнительных цветов */}
      <div className="relative">
        <button
          onClick={() => setActivePopover(activePopover === 'colors' ? null : 'colors')}
          className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
          title="Больше цветов"
        >
          <span>🎨</span>
          <span className="text-sm">Больше</span>
        </button>

        {activePopover === 'colors' && (
          <div className="absolute bottom-full left-0 mb-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl z-50 min-w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Палитра цветов</h3>
                <input
                  type="color"
                  value={state.currentColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  title="Выбрать любой цвет"
                />
              </div>

              {colorGroups.map(group => (
                <div key={group.name}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{group.name}</h4>
                  <div className="grid grid-cols-8 gap-2">
                    {group.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                          state.currentColor === color
                            ? 'border-blue-500 scale-110 shadow-lg'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Текущий цвет */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg shadow-inner"
                    style={{ backgroundColor: state.currentColor }}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">Текущий цвет</div>
                    <div className="text-xs text-gray-600 font-mono">{state.currentColor}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Текущий цвет */}
      <div className="flex items-center gap-2 ml-4">
        <div
          className="w-6 h-6 border-2 border-white/50 rounded"
          style={{ backgroundColor: state.currentColor }}
        />
        <span className="text-white/80 text-sm font-mono">
          {state.currentColor}
        </span>
      </div>
    </div>
  );
}
