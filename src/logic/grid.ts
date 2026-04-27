import type { Board } from './types';

export const indexToRowCol = (index: number): [number, number] => [
  Math.floor(index / 3),
  index % 3,
];

export const rowColToIndex = (row: number, col: number): number => row * 3 + col;

export const getEmptyCells = (board: Board): number[] => {
  const out: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) out.push(i);
  }
  return out;
};

export const isFull = (board: Board): boolean => {
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) return false;
  }
  return true;
};

export const EMPTY_BOARD: Board = [
  null, null, null,
  null, null, null,
  null, null, null,
] as const;

export const moveFocus = (
  index: number,
  direction: 'up' | 'down' | 'left' | 'right',
): number => {
  const [row, col] = indexToRowCol(index);
  switch (direction) {
    case 'up':
      return rowColToIndex(row === 0 ? 0 : row - 1, col);
    case 'down':
      return rowColToIndex(row === 2 ? 2 : row + 1, col);
    case 'left':
      return rowColToIndex(row, col === 0 ? 0 : col - 1);
    case 'right':
      return rowColToIndex(row, col === 2 ? 2 : col + 1);
  }
};
