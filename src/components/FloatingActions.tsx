'use client';

import React, { useState } from 'react';
import { useDrawing } from '@/context/DrawingContext';
// Simple popover implementation

export function FloatingActions() {
  const { state, dispatch } = useDrawing();
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const quickActions = [
    {
      id: 'clear',
      icon: '🗑️',
      label: 'Очистить',
      description: 'Очистить активный слой',
      action: () => {
        // Очистить все клетки активного слоя
        const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
        if (activeLayer) {
          activeLayer.cells.forEach(cell => {
            dispatch({ type: 'CLEAR_CELL', payload: { x: cell.x, y: cell.y } });
          });
        }
        setActivePopover(null);
      }
    },
    {
      id: 'grid',
      icon: '📐',
      label: 'Сетка',
      description: 'Показать/скрыть сетку',
      action: () => {
        // Эта функция может управлять видимостью сетки
        setActivePopover(null);
      }
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {/* Основные плавающие действия */}
      <div className="flex flex-col gap-2">
        {quickActions.map(action => (
          <div key={action.id} className="relative">
            <button
              onClick={() => setActivePopover(activePopover === action.id ? null : action.id)}
              className="w-12 h-12 bg-white/90 backdrop-blur-md text-gray-800 border border-white/20 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105"
              title={action.label}
            >
              <span className="text-lg">{action.icon}</span>
            </button>

            {activePopover === action.id && (
              <div className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl mr-2 max-w-xs">
                <div className="text-center space-y-2">
                  <div className="text-lg">{action.icon}</div>
                  <h3 className="font-semibold text-gray-800">{action.label}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                  {action.id === 'clear' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          action.action();
                          setActivePopover(null);
                        }}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Очистить
                      </button>
                      <button
                        onClick={() => setActivePopover(null)}
                        className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
