export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type Board = readonly [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export type WinningLine = readonly [number, number, number];

/**
 * Round state of the pure engine. The arcade lifecycle (idle / running /
 * paused / gameOver) is layered on top of it in TicTacToeGame.tsx.
 */
export type GameStatus = 'playing' | 'won' | 'draw';

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
  /** Marks placed by both sides in the current round. */
  moveCount: number;
  focusIndex: number;
  /** Session (match) total of round scores — `duelRoundScore` summed. */
  points: number;
  /** Score of the current round: 0 while playing, set when the round ends. */
  roundScore: number;
};

/** What a saved session stores: the whole match except the all-time best streaks. */
export type SavedGame = Omit<GameState, 'bestStreaks'>;

export type GameAction =
  | { type: 'place'; index: number }
  | { type: 'aiMove' }
  | { type: 'newRound' }
  | { type: 'changeMode'; mode: Mode }
  | { type: 'resetScores' }
  | { type: 'focus'; index: number };

export type Rng = () => number;
