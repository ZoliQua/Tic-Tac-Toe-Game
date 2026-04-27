import { WINNING_LINES } from './constants';
import { isFull } from './grid';
import type { Board, Mark, WinningLine } from './types';

export type WinResult = { winner: Mark; line: WinningLine };

export const checkWin = (board: Board): WinResult | null => {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const va = board[a];
    if (va === null) continue;
    if (va === board[b] && va === board[c]) {
      return { winner: va, line };
    }
  }
  return null;
};

export const isDraw = (board: Board): boolean => isFull(board) && checkWin(board) === null;
