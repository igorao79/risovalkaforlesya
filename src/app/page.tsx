'use client';

'use client';

import { Canvas } from '@/components/Canvas';
import { CompactToolbar } from '@/components/CompactToolbar';
import { CompactLayersPanel } from '@/components/CompactLayersPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col">
      {/* Заголовок */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-4 py-3 flex-shrink-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              🎨 Pixel Art Studio
            </h1>
            <p className="text-white/70 text-sm">
              Создавайте пиксель-арт
            </p>
          </div>
          <div className="text-white/60 text-sm">
            <span>64×64</span>
          </div>
        </div>
      </header>

      {/* Основная область */}
      <div className="flex-1 flex min-h-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }}>
        {/* Левая панель инструментов */}
        <div className="w-16 bg-black/20 backdrop-blur-md border-r border-white/10">
          <CompactToolbar />
        </div>

        {/* Центральная область с холстом */}
        <div className="flex-1 flex items-stretch justify-center bg-black/5">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 w-full h-full max-w-full max-h-full flex items-center justify-center overflow-hidden">
            <Canvas className="w-full h-full shadow-inner rounded-2xl" />
          </div>
        </div>

        {/* Правая панель слоев */}
        <div className="w-16 bg-black/20 backdrop-blur-md border-l border-white/10">
          <CompactLayersPanel />
        </div>
      </div>



    </div>
  );
}
