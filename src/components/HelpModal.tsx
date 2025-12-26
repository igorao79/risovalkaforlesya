'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mouse, Keyboard } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
          <h2 className="text-2xl font-bold text-slate-800">Горячие клавиши</h2>
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
          {/* Мышь */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mouse className="w-5 h-5 text-sky-500" />
              <h3 className="text-lg font-semibold text-slate-800">Управление мышью</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-slate-700">Колесико мыши</span>
                <span className="text-sm text-slate-500">Масштабирование</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-slate-700">Правая кнопка + перетаскивание</span>
                <span className="text-sm text-slate-500">Панорамирование</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-slate-700">Alt + перетаскивание</span>
                <span className="text-sm text-slate-500">Панорамирование</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-slate-700">Средняя кнопка + перетаскивание</span>
                <span className="text-sm text-slate-500">Панорамирование</span>
              </div>
            </div>
          </div>

          {/* Клавиатура */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="w-5 h-5 text-sky-500" />
              <h3 className="text-lg font-semibold text-slate-800">Горячие клавиши</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">B</div>
                <div className="text-sm text-slate-600">Кисть</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">E</div>
                <div className="text-sm text-slate-600">Ластик</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">F</div>
                <div className="text-sm text-slate-600">Заливка</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">I</div>
                <div className="text-sm text-slate-600">Пипетка</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">Ctrl+Z</div>
                <div className="text-sm text-slate-600">Отмена</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">Ctrl+Y</div>
                <div className="text-sm text-slate-600">Повтор</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">Ctrl+Shift+Z</div>
                <div className="text-sm text-slate-600">Повтор</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">Ctrl+S</div>
                <div className="text-sm text-slate-600">Сохранить</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">+</div>
                <div className="text-sm text-slate-600">Увеличить</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-mono font-semibold text-purple-600">-</div>
                <div className="text-sm text-slate-600">Уменьшить</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

