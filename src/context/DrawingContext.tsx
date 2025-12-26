'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DrawingState, Layer, Brush, Point, DEFAULT_BRUSHES } from '@/types';

interface DrawingContextType {
  state: DrawingState;
  dispatch: React.Dispatch<DrawingAction>;
  setCell: (x: number, y: number, color: string) => void;
  clearCell: (x: number, y: number) => void;
  getCellColor: (x: number, y: number) => string | null;
  addLayer: (name: string) => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  toggleGrid: () => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  exportCanvas: () => string;
}

type DrawingAction =
  | { type: 'SET_CELL'; payload: { x: number; y: number; color: string } }
  | { type: 'CLEAR_CELL'; payload: { x: number; y: number } }
  | { type: 'SET_CURRENT_COLOR'; payload: string }
  | { type: 'SET_CURRENT_BRUSH'; payload: Brush }
  | { type: 'SET_CELL_SIZE'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN_OFFSET'; payload: Point }
  | { type: 'SET_ZOOM_AND_PAN'; payload: { zoom: number; panOffset: Point } }
  | { type: 'SET_TOOL'; payload: 'brush' | 'eraser' | 'fill' | 'picker' }
  | { type: 'TOGGLE_GRID' }
  | { type: 'ADD_RECENT_COLOR'; payload: string }
  | { type: 'ADD_LAYER'; payload: { name: string } }
  | { type: 'REMOVE_LAYER'; payload: string }
  | { type: 'SET_ACTIVE_LAYER'; payload: string }
  | { type: 'TOGGLE_LAYER_VISIBILITY'; payload: string }
  | { type: 'SET_LAYER_OPACITY'; payload: { id: string; opacity: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_TO_HISTORY' };

const createInitialState = (): DrawingState => {
  const baseState: Omit<DrawingState, 'history' | 'historyIndex'> = {
    canvasSize: { width: 64, height: 64 },
    cellSize: 8,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    currentColor: '#000000',
    currentBrush: DEFAULT_BRUSHES[0],
    layers: [
      {
        id: 'layer-1',
        name: 'Слой 1',
        cells: [],
        visible: true,
        opacity: 1
      }
    ],
    activeLayerId: 'layer-1',
    isDrawing: false,
    tool: 'brush',
    showGrid: true,
    recentColors: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
  };

  const initialState: DrawingState = {
    ...baseState,
    history: [],
    historyIndex: 0
  };

  // Добавляем начальное состояние в историю
  initialState.history = [{ ...initialState }];

  return initialState;
};

const initialState = createInitialState();

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'SET_CELL': {
      const { x, y, color } = action.payload;
      const newLayers = state.layers.map(layer => {
        if (layer.id === state.activeLayerId) {
          const existingCellIndex = layer.cells.findIndex(cell => cell.x === x && cell.y === y);
          const newCells = [...layer.cells];

          if (existingCellIndex >= 0) {
            if (color === 'transparent') {
              newCells.splice(existingCellIndex, 1);
            } else {
              newCells[existingCellIndex] = { x, y, color };
            }
          } else if (color !== 'transparent') {
            newCells.push({ x, y, color });
          }

          return { ...layer, cells: newCells };
        }
        return layer;
      });

      return { ...state, layers: newLayers };
    }

    case 'CLEAR_CELL': {
      const { x, y } = action.payload;
      const newLayers = state.layers.map(layer => {
        if (layer.id === state.activeLayerId) {
          return {
            ...layer,
            cells: layer.cells.filter(cell => !(cell.x === x && cell.y === y))
          };
        }
        return layer;
      });
      return { ...state, layers: newLayers };
    }

    case 'SET_CURRENT_COLOR': {
      const newColor = action.payload;
      // Добавляем цвет в историю, если его там еще нет
      let newRecentColors = state.recentColors.filter(c => c !== newColor);
      newRecentColors.unshift(newColor);
      // Ограничиваем до 16 последних цветов
      newRecentColors = newRecentColors.slice(0, 16);
      
      return { 
        ...state, 
        currentColor: newColor,
        recentColors: newRecentColors
      };
    }

    case 'ADD_RECENT_COLOR': {
      const newColor = action.payload;
      let newRecentColors = state.recentColors.filter(c => c !== newColor);
      newRecentColors.unshift(newColor);
      newRecentColors = newRecentColors.slice(0, 16);
      
      return { 
        ...state,
        recentColors: newRecentColors
      };
    }

    case 'SET_CURRENT_BRUSH':
      return { ...state, currentBrush: action.payload };

    case 'SET_CELL_SIZE':
      return { ...state, cellSize: action.payload };

    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };

    case 'SET_PAN_OFFSET':
      return { ...state, panOffset: action.payload };

    case 'SET_ZOOM_AND_PAN':
      return {
        ...state,
        zoom: action.payload.zoom,
        panOffset: action.payload.panOffset
      };

    case 'SET_TOOL':
      return { ...state, tool: action.payload };

    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };

    case 'ADD_LAYER': {
      const newLayer: Layer = {
        id: `layer-${Date.now()}`,
        name: action.payload.name,
        cells: [],
        visible: true,
        opacity: 1
      };
      // Вставляем новый слой НА ВТОРУЮ ПОЗИЦИЮ (индекс 1), сразу под первым слоем
      const newLayers = [...state.layers];
      newLayers.splice(1, 0, newLayer); // Вставляем на позицию 1
      return {
        ...state,
        layers: newLayers,
        activeLayerId: newLayer.id
      };
    }

    case 'REMOVE_LAYER': {
      if (state.layers.length <= 1) return state;

      const newLayers = state.layers.filter(layer => layer.id !== action.payload);
      const newActiveId = state.activeLayerId === action.payload
        ? newLayers[0].id
        : state.activeLayerId;

      return {
        ...state,
        layers: newLayers,
        activeLayerId: newActiveId
      };
    }

    case 'SET_ACTIVE_LAYER':
      return { ...state, activeLayerId: action.payload };

    case 'TOGGLE_LAYER_VISIBILITY': {
      const newLayers = state.layers.map(layer =>
        layer.id === action.payload
          ? { ...layer, visible: !layer.visible }
          : layer
      );
      return { ...state, layers: newLayers };
    }

    case 'SET_LAYER_OPACITY': {
      const newLayers = state.layers.map(layer =>
        layer.id === action.payload.id
          ? { ...layer, opacity: action.payload.opacity }
          : layer
      );
      return { ...state, layers: newLayers };
    }

    case 'SAVE_TO_HISTORY': {
      // Создаем копию состояния без циклических ссылок
      const stateToSave: DrawingState = {
        ...state,
        history: state.history,
        historyIndex: state.historyIndex
      };

      // Удаляем все состояния после текущего индекса
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      // Добавляем новое состояние
      newHistory.push(stateToSave);
      
      // Ограничиваем размер истории до 50 шагов
      const limitedHistory = newHistory.slice(-50);

      return {
        ...state,
        history: limitedHistory,
        historyIndex: limitedHistory.length - 1
      };
    }

    case 'UNDO': {
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        return {
          ...previousState,
          history: state.history,
          historyIndex: state.historyIndex - 1,
          recentColors: state.recentColors // Сохраняем историю цветов
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...nextState,
          history: state.history,
          historyIndex: state.historyIndex + 1,
          recentColors: state.recentColors // Сохраняем историю цветов
        };
      }
      return state;
    }

    default:
      return state;
  }
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export function DrawingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(drawingReducer, initialState);

  const setCell = (x: number, y: number, color: string) => {
    dispatch({ type: 'SET_CELL', payload: { x, y, color } });
  };

  const clearCell = (x: number, y: number) => {
    dispatch({ type: 'CLEAR_CELL', payload: { x, y } });
  };

  const getCellColor = (x: number, y: number): string | null => {
    for (const layer of [...state.layers].reverse()) {
      if (!layer.visible) continue;
      const cell = layer.cells.find(c => c.x === x && c.y === y);
      if (cell) return cell.color;
    }
    return null;
  };

  const addLayer = (name: string) => {
    dispatch({ type: 'ADD_LAYER', payload: { name } });
  };

  const removeLayer = (id: string) => {
    dispatch({ type: 'REMOVE_LAYER', payload: id });
  };

  const setActiveLayer = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_LAYER', payload: id });
  };

  const toggleLayerVisibility = (id: string) => {
    dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', payload: id });
  };

  const setLayerOpacity = (id: string, opacity: number) => {
    dispatch({ type: 'SET_LAYER_OPACITY', payload: { id, opacity } });
  };

  const toggleGrid = () => {
    dispatch({ type: 'TOGGLE_GRID' });
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const redo = () => {
    dispatch({ type: 'REDO' });
  };

  const saveToHistory = () => {
    dispatch({ type: 'SAVE_TO_HISTORY' });
  };

  const exportCanvas = (): string => {
    // Собираем все видимые клетки
    const allCells: { x: number; y: number; color: string; opacity: number }[] = [];
    
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      for (const cell of layer.cells) {
        allCells.push({ ...cell, opacity: layer.opacity });
      }
    }

    // Если нет клеток, возвращаем пустое прозрачное изображение
    if (allCells.length === 0) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      return canvas.toDataURL('image/png');
    }

    // Находим границы рисунка
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const cell of allCells) {
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    }

    // Добавляем небольшой отступ
    const padding = 1;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Вычисляем размеры
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const baseCellSize = 8; // Базовый размер клетки для экспорта

    // Создаем canvas для экспорта
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = width * baseCellSize;
    canvas.height = height * baseCellSize;

    // Прозрачный фон (не заполняем)

    // Группируем клетки по слоям для правильной отрисовки
    const layerMap = new Map<string, typeof allCells>();
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      layerMap.set(layer.id, []);
    }

    for (const layer of state.layers) {
      if (!layer.visible) continue;
      for (const cell of layer.cells) {
        layerMap.get(layer.id)?.push({ ...cell, opacity: layer.opacity });
      }
    }

    // Рисуем слои в правильном порядке
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      const cells = layerMap.get(layer.id) || [];
      
      ctx.globalAlpha = layer.opacity;

      for (const cell of cells) {
        ctx.fillStyle = cell.color;
        ctx.fillRect(
          (cell.x - minX) * baseCellSize,
          (cell.y - minY) * baseCellSize,
          baseCellSize,
          baseCellSize
        );
      }
    }

    ctx.globalAlpha = 1.0;

    return canvas.toDataURL('image/png');
  };

  return (
    <DrawingContext.Provider value={{
      state,
      dispatch,
      setCell,
      clearCell,
      getCellColor,
      addLayer,
      removeLayer,
      setActiveLayer,
      toggleLayerVisibility,
      setLayerOpacity,
      toggleGrid,
      undo,
      redo,
      saveToHistory,
      exportCanvas
    }}>
      {children}
    </DrawingContext.Provider>
  );
}

export function useDrawing() {
  const context = useContext(DrawingContext);
  if (context === undefined) {
    throw new Error('useDrawing must be used within a DrawingProvider');
  }
  return context;
}
