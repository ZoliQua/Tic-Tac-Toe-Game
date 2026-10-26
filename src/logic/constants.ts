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

export const BOARD_CELLS = 9;

/** Default AI "thinking" delay (the Normal AI speed). */
export const AI_DELAY_MS = 400;

/**
 * Prefix of the per-mode all-time best win streak keys
 * (`tictactoe.highScore.<mode>`). The name predates the arcade kit and is kept
 * so existing records survive; the value is a streak, not a score, so it is
 * deliberately NOT registered as the kit's `legacyBestKey`.
 */
export const STREAK_KEY_PREFIX = 'tictactoe.highScore';

export const CORNERS = [0, 2, 6, 8] as const;
export const EDGES = [1, 3, 5, 7] as const;
export const CENTER = 4 as const;
