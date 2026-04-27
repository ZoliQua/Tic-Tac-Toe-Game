import type { WinningLine } from './types';

export const WINNING_LINES: readonly WinningLine[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export const AI_DELAY_MS = 400;

export const PLACE_ANIMATION_MS = 150;
export const STRIKE_ANIMATION_MS = 320;

export const STORAGE_KEY_BEST = 'tictactoe.highScore';

export const CORNERS = [0, 2, 6, 8] as const;
export const EDGES = [1, 3, 5, 7] as const;
export const CENTER = 4 as const;
