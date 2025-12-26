'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Palette } from 'lucide-react';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  recentColors: string[];
  onColorSelect: (color: string) => void;
}

export function ColorPickerModal({ isOpen, onClose, currentColor, recentColors, onColorSelect }: ColorPickerModalProps) {
  const [customColor, setCustomColor] = useState(currentColor);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    onClose();
  };

  const handleCustomColorApply = () => {
    onColorSelect(customColor);
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-purple-300 to-sky-200 border-b border-purple-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-slate-800" />
            <h2 className="text-2xl font-bold text-slate-800">Выбор цвета</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6 text-slate-800" />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)] bg-white">
          {/* Текущий цвет */}
          <div className="flex items-center gap-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex-shrink-0">
              <div
                className="w-20 h-20 rounded-xl border-4 border-purple-300 shadow-md"
                style={{ backgroundColor: currentColor }}
              />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Текущий цвет</div>
              <div className="text-2xl font-mono font-bold text-slate-800">{currentColor}</div>
            </div>
          </div>

          {/* Последние использованные цвета */}
          {recentColors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span>⏱️</span>
                Недавно использованные
              </h3>
              <div className="grid grid-cols-8 gap-2">
                {recentColors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    onClick={() => handleColorSelect(color)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md ${
                      currentColor === color
                        ? 'border-purple-400 scale-110 shadow-md ring-2 ring-purple-200'
                        : 'border-purple-200 hover:border-purple-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Пользовательский цвет */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <span>✨</span>
              Свой цвет
            </h3>
            <div className="flex gap-4 items-start">
              {/* Color picker */}
              <div className="flex-shrink-0">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-24 h-24 rounded-lg cursor-pointer border-4 border-purple-200 hover:border-purple-300 transition-colors"
                />
              </div>

              {/* Inputs and button */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-sm text-slate-600 block mb-2">HEX код цвета:</label>
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-purple-200 text-slate-800 placeholder-slate-400 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
                    placeholder="#000000"
                  />
                </div>
                <button
                  onClick={handleCustomColorApply}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-300 to-sky-200 text-slate-800 font-semibold rounded-lg hover:from-purple-400 hover:to-sky-300 transition-all shadow-md hover:shadow-lg border border-purple-200 transform hover:scale-105"
                >
                  Применить цвет
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

