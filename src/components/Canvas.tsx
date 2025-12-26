'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useDrawing } from '@/context/DrawingContext';
import { Point } from '@/types';

interface CanvasProps {
  className?: string;
}

export function Canvas({ className }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch, setCell, clearCell, getCellColor, saveToHistory, undo, redo, exportCanvas } = useDrawing();
  const isDrawingRef = useRef(false);
  const lastCellRef = useRef<{ x: number; y: number } | null>(null);

  const getCanvasCoordinates = useCallback((event: React.MouseEvent) => {
    if (!canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Базовый размер клетки в пикселях
    const baseCellSize = 8;

    // Учитываем zoom и pan
    const cellX = Math.floor((x - state.panOffset.x) / (baseCellSize * state.zoom));
    const cellY = Math.floor((y - state.panOffset.y) / (baseCellSize * state.zoom));

    return { x: cellX, y: cellY };
  }, [state.zoom, state.panOffset]);

  const drawBrush = useCallback((centerX: number, centerY: number, color: string) => {
    const { currentBrush } = state;
    const cells: { x: number; y: number }[] = [];

    // Создаем паттерн кисти в зависимости от формы
    for (let dy = -Math.floor(currentBrush.size / 2); dy <= Math.floor(currentBrush.size / 2); dy++) {
      for (let dx = -Math.floor(currentBrush.size / 2); dx <= Math.floor(currentBrush.size / 2); dx++) {
        let shouldDraw = false;

        switch (currentBrush.shape) {
          case 'square':
            shouldDraw = true;
            break;
          case 'circle':
            shouldDraw = Math.sqrt(dx * dx + dy * dy) <= currentBrush.size / 2;
            break;
          case 'diamond':
            shouldDraw = Math.abs(dx) + Math.abs(dy) <= currentBrush.size / 2;
            break;
        }

        if (shouldDraw) {
          const x = centerX + dx;
          const y = centerY + dy;

          // Рисуем в любой точке белой области, без ограничений
          cells.push({ x, y });
        }
      }
    }

    // Применяем кисть
    cells.forEach(({ x, y }) => {
      if (state.tool === 'eraser') {
        clearCell(x, y);
      } else {
        setCell(x, y, color);
      }
    });
  }, [state, setCell, clearCell]);

  const floodFill = useCallback((startX: number, startY: number, newColor: string) => {
    const targetColor = getCellColor(startX, startY);
    if (targetColor === newColor) return;

    const stack: Point[] = [{ x: startX, y: startY }];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const currentColor = getCellColor(x, y);
      if (currentColor !== targetColor) continue;

      setCell(x, y, newColor);

      // Добавляем соседние клетки
      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      ];

      for (const neighbor of neighbors) {
        // Заливка работает в любом месте белой области, без ограничений
        if (!visited.has(`${neighbor.x},${neighbor.y}`)) {
          stack.push(neighbor);
        }
      }
    }
  }, [getCellColor, setCell]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    const coords = getCanvasCoordinates(event);
    if (!coords) return;

    isDrawingRef.current = true;
    lastCellRef.current = coords;

    // Сохраняем состояние перед началом рисования
    saveToHistory();

    if (state.tool === 'picker') {
      const color = getCellColor(coords.x, coords.y);
      if (color) {
        dispatch({ type: 'SET_CURRENT_COLOR', payload: color });
      }
    } else if (state.tool === 'fill') {
      floodFill(coords.x, coords.y, state.currentColor);
    } else {
      drawBrush(coords.x, coords.y, state.currentColor);
    }
  }, [getCanvasCoordinates, state.tool, state.currentColor, drawBrush, floodFill, saveToHistory, getCellColor, dispatch]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDrawingRef.current) return;

    const coords = getCanvasCoordinates(event);
    if (!coords) return;

    // Проверяем, что мышь переместилась на новую клетку
    if (lastCellRef.current &&
        lastCellRef.current.x === coords.x &&
        lastCellRef.current.y === coords.y) {
      return;
    }

    lastCellRef.current = coords;

    if (state.tool === 'picker') {
      const color = getCellColor(coords.x, coords.y);
      if (color) {
        dispatch({ type: 'SET_CURRENT_COLOR', payload: color });
      }
    } else {
      drawBrush(coords.x, coords.y, state.currentColor);
    }
  }, [getCanvasCoordinates, state.tool, state.currentColor, drawBrush, getCellColor, dispatch]);

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    lastCellRef.current = null;
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(4, state.zoom * zoomFactor));

    if (newZoom !== state.zoom) {
      // Масштабируем от центра canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Текущие координаты центра в мировых координатах
        const worldCenterX = (centerX - state.panOffset.x) / state.zoom;
        const worldCenterY = (centerY - state.panOffset.y) / state.zoom;

        // Новые координаты центра после масштабирования
        const newPanOffsetX = centerX - worldCenterX * newZoom;
        const newPanOffsetY = centerY - worldCenterY * newZoom;

        dispatch({
          type: 'SET_ZOOM_AND_PAN',
          payload: {
            zoom: newZoom,
            panOffset: { x: newPanOffsetX, y: newPanOffsetY }
          }
        });
      } else {
        dispatch({ type: 'SET_ZOOM', payload: newZoom });
      }
    }
  }, [state.zoom, state.panOffset, dispatch]);

  // Панорамирование (перетаскивание)
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);

  // Обработчик клавиш
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Игнорируем если фокус в input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'b':
        dispatch({ type: 'SET_TOOL', payload: 'brush' });
        break;
      case 'e':
        dispatch({ type: 'SET_TOOL', payload: 'eraser' });
        break;
      case 'f':
        dispatch({ type: 'SET_TOOL', payload: 'fill' });
        break;
      case 'i':
        dispatch({ type: 'SET_TOOL', payload: 'picker' });
        break;
      case 'z':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;
      case 'y':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          redo();
        }
        break;
      case 's':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const dataUrl = exportCanvas();
          const link = document.createElement('a');
          link.download = `pixel-art-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        }
        break;
      case '+':
      case '=':
        dispatch({ type: 'SET_ZOOM', payload: Math.min(4, state.zoom * 1.2) });
        break;
      case '-':
        dispatch({ type: 'SET_ZOOM', payload: Math.max(0.25, state.zoom / 1.2) });
        break;
    }
  }, [state.zoom, dispatch, exportCanvas, redo, undo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Отслеживаем изменение размера контейнера
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // При изменении размера контейнера перерисовываем canvas
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        const containerRect = container.getBoundingClientRect();
        canvas.width = containerRect.width;
        canvas.height = containerRect.height;
        canvas.style.width = `${containerRect.width}px`;
        canvas.style.height = `${containerRect.height}px`;

        // Перерисовываем содержимое
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Очищаем и перерисовываем
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          ctx.translate(state.panOffset.x, state.panOffset.y);
          ctx.scale(state.zoom, state.zoom);

          // Рисуем клетки (масштабируются с zoom)
          for (const layer of state.layers) {
            if (!layer.visible) continue;
            ctx.globalAlpha = layer.opacity;

            // Базовый размер клетки в пикселях
            const baseCellSize = 8;

            for (const cell of layer.cells) {
              ctx.fillStyle = cell.color;
              ctx.fillRect(
                cell.x * baseCellSize,
                cell.y * baseCellSize,
                baseCellSize,
                baseCellSize
              );
            }
          }

          ctx.restore();

          // Рисуем сетку в экранных координатах (масштабируется вместе с ячейками)
          if (state.showGrid) {
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1; // Фиксированная толщина в 1px

            // Базовый размер клетки в пикселях (масштабируется с zoom)
            const baseCellSize = 8;
            const scaledCellSize = baseCellSize * state.zoom;

            // Рисуем вертикальные линии сетки
            const startX = Math.floor((-state.panOffset.x) / scaledCellSize) * scaledCellSize;
            for (let x = startX; x < canvas.width - state.panOffset.x + scaledCellSize; x += scaledCellSize) {
              const screenX = x + state.panOffset.x;
              ctx.beginPath();
              ctx.moveTo(screenX, 0);
              ctx.lineTo(screenX, canvas.height);
              ctx.stroke();
            }

            // Рисуем горизонтальные линии сетки
            const startY = Math.floor((-state.panOffset.y) / scaledCellSize) * scaledCellSize;
            for (let y = startY; y < canvas.height - state.panOffset.y + scaledCellSize; y += scaledCellSize) {
              const screenY = y + state.panOffset.y;
              ctx.beginPath();
              ctx.moveTo(0, screenY);
              ctx.lineTo(canvas.width, screenY);
              ctx.stroke();
            }
          }
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [state.layers, state.canvasSize, state.zoom, state.panOffset, state.showGrid]);

  const handleMouseDownPan = useCallback((event: React.MouseEvent) => {
    if (event.button === 1 || (event.button === 0 && event.altKey) || event.button === 2) { // Средняя кнопка, Alt+левая или правая кнопка
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMovePan = useCallback((event: React.MouseEvent) => {
    if (isPanning && lastPanPoint) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;

      dispatch({
        type: 'SET_PAN_OFFSET',
        payload: {
          x: state.panOffset.x + deltaX,
          y: state.panOffset.y + deltaY
        }
      });

      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, [isPanning, lastPanPoint, state.panOffset, dispatch]);

  const handleMouseUpPan = useCallback(() => {
    setIsPanning(false);
    setLastPanPoint(null);
  }, []);

  // Отрисовка canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Получаем размеры контейнера
    const container = canvas.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Устанавливаем размеры canvas равными размеру контейнера
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Сохраняем контекст
    ctx.save();

    // Применяем трансформации для клеток
    ctx.translate(state.panOffset.x, state.panOffset.y);
    ctx.scale(state.zoom, state.zoom);

    // Рисуем клетки (масштабируются с zoom)
    for (const layer of state.layers) {
      if (!layer.visible) continue;

      ctx.globalAlpha = layer.opacity;

      // Базовый размер клетки в пикселях
      const baseCellSize = 8;

      for (const cell of layer.cells) {
        ctx.fillStyle = cell.color;
        ctx.fillRect(
          cell.x * baseCellSize,
          cell.y * baseCellSize,
          baseCellSize,
          baseCellSize
        );
      }
    }

    // Восстанавливаем контекст после рисования клеток
    ctx.restore();

    // Рисуем сетку в экранных координатах (масштабируется вместе с ячейками)
    if (state.showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1; // Фиксированная толщина в 1px

      // Базовый размер клетки в пикселях (масштабируется с zoom)
      const baseCellSize = 8;
      const scaledCellSize = baseCellSize * state.zoom;

      // Рисуем вертикальные линии сетки
      const startX = Math.floor((-state.panOffset.x) / scaledCellSize) * scaledCellSize;
      for (let x = startX; x < canvas.width - state.panOffset.x + scaledCellSize; x += scaledCellSize) {
        const screenX = x + state.panOffset.x;
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, canvas.height);
        ctx.stroke();
      }

      // Рисуем горизонтальные линии сетки
      const startY = Math.floor((-state.panOffset.y) / scaledCellSize) * scaledCellSize;
      for (let y = startY; y < canvas.height - state.panOffset.y + scaledCellSize; y += scaledCellSize) {
        const screenY = y + state.panOffset.y;
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(canvas.width, screenY);
        ctx.stroke();
      }
    }
  }, [state.layers, state.canvasSize, state.zoom, state.panOffset, state.showGrid]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-white ${className}`}>
      <canvas
        ref={canvasRef}
        className={`${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'} select-none`}
        onMouseDown={(e) => {
          handleMouseDownPan(e);
          if (!isPanning) handleMouseDown(e);
        }}
        onMouseMove={(e) => {
          handleMouseMovePan(e);
          if (!isPanning) handleMouseMove(e);
        }}
        onMouseUp={() => {
          handleMouseUpPan();
          handleMouseUp();
        }}
        onMouseLeave={() => {
          handleMouseUpPan();
          handleMouseUp();
        }}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          imageRendering: 'pixelated'
        }}
      />

      {/* Индикатор инструмента */}
      <div className="absolute top-2 left-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
        {state.tool === 'brush' && 'Кисть'}
        {state.tool === 'eraser' && 'Ластик'}
        {state.tool === 'fill' && 'Заливка'}
        {state.tool === 'picker' && 'Пипетка'}
      </div>

      {/* Индикатор цвета */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <div
          className="w-6 h-6 border-2 border-gray-300 rounded"
          style={{ backgroundColor: state.currentColor }}
        />
        <span className="bg-black/75 text-white px-2 py-1 rounded text-sm">
          {state.currentColor}
        </span>
      </div>

      {/* Индикатор масштаба */}
      <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
        {state.zoom}x
      </div>

      {/* Подсказки */}
      <div className="absolute bottom-2 left-2 bg-black/75 text-white px-3 py-2 rounded text-xs space-y-1 max-w-xs">
        <div>🖱️ Колесико мыши: масштаб</div>
        <div>🖱️ Alt + перетаскивание: панорамирование</div>
        <div>⌨️ B/E/F/I: кисть/ластик/заливка/пипетка</div>
        <div>⌨️ Ctrl+Z/Y: отмена/повтор</div>
        <div>⌨️ Ctrl+S: сохранить</div>
      </div>
    </div>
  );
}
