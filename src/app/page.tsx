'use client';

import { useState } from 'react';
import { Canvas } from '@/components/Canvas';
import { CompactToolbar } from '@/components/CompactToolbar';
import { CompactLayersPanel } from '@/components/CompactLayersPanel';
import { HelpModal } from '@/components/HelpModal';
import { HelpCircle, Heart } from 'lucide-react';

export default function Home() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-100 to-sky-100 flex flex-col">
      {/* Заголовок */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-200 px-4 py-3 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-purple-400" />
              lesyarisovalka
            </h1>
            <p className="text-slate-600 text-sm">
              this one for lesya
            </p>
          </div>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors flex items-center gap-2 border border-purple-200"
            title="Горячие клавиши"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm">Помощь</span>
          </button>
        </div>
      </header>

      {/* Основная область */}
      <div className="flex-1 flex min-h-0">
        {/* Левая панель инструментов */}
        <div className="w-16 bg-white/80 backdrop-blur-md border-r border-purple-200 shadow-sm">
          <CompactToolbar />
        </div>

        {/* Центральная область с холстом */}
        <div className="flex-1 flex items-stretch justify-center bg-gradient-to-br from-sky-50 to-purple-50 p-4">
          <div className="bg-amber-50 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 w-full h-full max-w-full max-h-full flex items-center justify-center overflow-hidden">
            <Canvas className="w-full h-full shadow-inner rounded-2xl" />
          </div>
        </div>

        {/* Правая панель слоев */}
        <div className="w-16 bg-white/80 backdrop-blur-md border-l border-purple-200 shadow-sm">
          <CompactLayersPanel />
        </div>
      </div>

      {/* Модалка помощи */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
