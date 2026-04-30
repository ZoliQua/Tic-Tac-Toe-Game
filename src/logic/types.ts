export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type Board = readonly [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export type WinningLine = readonly [number, number, number];

export type GameStatus = 'idle' | 'playing' | 'won' | 'draw';

export type Mode = 'pvp' | 'easy' | 'medium' | 'hard';

export type Scores = { x: number; o: number; draws: number };

export type BestStreaks = { pvp: number; easy: number; medium: number; hard: number };

export type GameState = {
  board: Board;
  current: Mark;
  status: GameStatus;
  winner: Mark | null;
  winningLine: WinningLine | null;
  mode: Mode;
  humanMark: Mark;
  startingMark: Mark;
  scores: Scores;
  bestStreaks: BestStreaks;
  currentStreak: number;
  moveCount: number;
  focusIndex: number;
};

export type GameAction =
  | { type: 'place'; index: number }
  | { type: 'aiMove' }
  | { type: 'newRound' }
  | { type: 'changeMode'; mode: Mode }
  | { type: 'resetScores' }
  | { type: 'focus'; index: number };

export type Rng = () => number;
