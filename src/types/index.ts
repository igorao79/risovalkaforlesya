// Типы для рисования по клеткам

export interface Point {
  x: number;
  y: number;
}

export interface Cell {
  x: number;
  y: number;
  color: string;
}

export interface Layer {
  id: string;
  name: string;
  cells: Cell[];
  visible: boolean;
  opacity: number;
}

export interface Brush {
  id: string;
  name: string;
  size: number;
  shape: 'square' | 'circle' | 'diamond';
  pattern?: number[][];
}

export interface DrawingState {
  canvasSize: { width: number; height: number };
  cellSize: number;
  zoom: number;
  panOffset: Point;
  currentColor: string;
  currentBrush: Brush;
  layers: Layer[];
  activeLayerId: string;
  isDrawing: boolean;
  tool: 'brush' | 'eraser' | 'fill' | 'picker';
  showGrid: boolean;
  recentColors: string[];
  history: DrawingState[];
  historyIndex: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export const DEFAULT_BRUSHES: Brush[] = [
  {
    id: 'pixel',
    name: 'Пиксель',
    size: 1,
    shape: 'square'
  },
  {
    id: 'small-square',
    name: 'Маленький квадрат',
    size: 2,
    shape: 'square'
  },
  {
    id: 'medium-square',
    name: 'Средний квадрат',
    size: 4,
    shape: 'square'
  },
  {
    id: 'large-square',
    name: 'Большой квадрат',
    size: 6,
    shape: 'square'
  },
  {
    id: 'circle-small',
    name: 'Маленький круг',
    size: 2,
    shape: 'circle'
  },
  {
    id: 'circle',
    name: 'Круг',
    size: 4,
    shape: 'circle'
  },
  {
    id: 'circle-large',
    name: 'Большой круг',
    size: 6,
    shape: 'circle'
  },
  {
    id: 'diamond',
    name: 'Ромб',
    size: 3,
    shape: 'diamond'
  },
  {
    id: 'diamond-large',
    name: 'Большой ромб',
    size: 5,
    shape: 'diamond'
  }
];

export const DEFAULT_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
  '#FFD700', '#FF6347', '#32CD32', '#1E90FF', '#9370DB',
  '#F0E68C', '#DDA0DD', '#98FB98', '#87CEEB', '#DEB887',
  '#FF69B4', '#CD5C5C', '#40E0D0', '#EE82EE', '#90EE90'
];