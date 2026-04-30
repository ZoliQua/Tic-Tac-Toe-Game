import { bestMove } from './ai';
import { EMPTY_BOARD } from './grid';
import { checkWin, isDraw } from './win';
import type {
  BestStreaks,
  Board,
  Cell,
  GameAction,
  GameState,
  Mark,
  Mode,
  Rng,
} from './types';

const opposite = (mark: Mark): Mark => (mark === 'X' ? 'O' : 'X');

const aiMarkFor = (state: Pick<GameState, 'mode' | 'humanMark'>): Mark | null => {
  if (state.mode === 'pvp') return null;
  return opposite(state.humanMark);
};

const placeAt = (board: Board, index: number, mark: Mark): Board => {
  const next = board.slice() as Cell[];
  next[index] = mark;
  return next as unknown as Board;
};

export const EMPTY_BEST_STREAKS: BestStreaks = {
  pvp: 0,
  easy: 0,
  medium: 0,
  hard: 0,
};

export type CreateInitialOptions = {
  mode?: Mode;
  humanMark?: Mark;
  bestStreaks?: BestStreaks;
  startingMark?: Mark;
};

export const createInitialState = (opts: CreateInitialOptions = {}): GameState => {
  const mode: Mode = opts.mode ?? 'pvp';
  const humanMark: Mark = opts.humanMark ?? 'X';
  const startingMark: Mark = opts.startingMark ?? 'X';
  return {
    board: EMPTY_BOARD,
    current: startingMark,
    status: 'playing',
    winner: null,
    winningLine: null,
    mode,
    humanMark,
    startingMark,
    scores: { x: 0, o: 0, draws: 0 },
    bestStreaks: opts.bestStreaks ?? EMPTY_BEST_STREAKS,
    currentStreak: 0,
    moveCount: 0,
    focusIndex: 4,
  };
};

const applyResultToScores = (state: GameState, board: Board): GameState => {
  const win = checkWin(board);
  if (win) {
    const aiMark = aiMarkFor(state);
    const humanWon = aiMark === null
      ? win.winner === 'X' // PvP: count X wins toward streak (humanMark default)
      : win.winner === state.humanMark;

    const scores = {
      ...state.scores,
      x: state.scores.x + (win.winner === 'X' ? 1 : 0),
      o: state.scores.o + (win.winner === 'O' ? 1 : 0),
    };
    const currentStreak = humanWon ? state.currentStreak + 1 : 0;
    const prevBest = state.bestStreaks[state.mode];
    const bestStreaks: BestStreaks = currentStreak > prevBest
      ? { ...state.bestStreaks, [state.mode]: currentStreak }
      : state.bestStreaks;

    return {
      ...state,
      board,
      status: 'won',
      winner: win.winner,
      winningLine: win.line,
      scores,
      currentStreak,
      bestStreaks,
      moveCount: state.moveCount + 1,
    };
  }

  if (isDraw(board)) {
    return {
      ...state,
      board,
      status: 'draw',
      winner: null,
      winningLine: null,
      scores: { ...state.scores, draws: state.scores.draws + 1 },
      currentStreak: 0,
      moveCount: state.moveCount + 1,
    };
  }

  return {
    ...state,
    board,
    current: opposite(state.current),
    moveCount: state.moveCount + 1,
  };
};

const tryPlace = (state: GameState, index: number, mark: Mark): GameState => {
  if (state.status !== 'playing') return state;
  if (index < 0 || index > 8) return state;
  if (state.board[index] !== null) return state;
  if (state.current !== mark) return state;
  const next = placeAt(state.board, index, mark);
  return applyResultToScores(state, next);
};

export type AdvanceContext = { rng: Rng };

export const advanceGame = (
  state: GameState,
  action: GameAction,
  ctx: AdvanceContext,
): GameState => {
  switch (action.type) {
    case 'place':
      return tryPlace(state, action.index, state.current);

    case 'aiMove': {
      if (state.status !== 'playing') return state;
      const aiMark = aiMarkFor(state);
      if (aiMark === null) return state;
      if (state.current !== aiMark) return state;
      const idx = bestMove(state.board, aiMark, state.mode, ctx.rng);
      if (idx < 0) return state;
      return tryPlace(state, idx, aiMark);
    }

    case 'newRound': {
      // C1 — loser-goes-first: if the previous round had a winner, the
      // loser opens the next round; on draw or first round, alternate.
      const nextStarting: Mark = state.winner !== null
        ? opposite(state.winner)
        : opposite(state.startingMark);
      return {
        ...state,
        board: EMPTY_BOARD,
        current: nextStarting,
        status: 'playing',
        winner: null,
        winningLine: null,
        startingMark: nextStarting,
        moveCount: 0,
        focusIndex: 4,
      };
    }

    case 'changeMode': {
      const startingMark: Mark = 'X';
      return {
        ...state,
        mode: action.mode,
        board: EMPTY_BOARD,
        current: startingMark,
        startingMark,
        status: 'playing',
        winner: null,
        winningLine: null,
        scores: { x: 0, o: 0, draws: 0 },
        currentStreak: 0,
        moveCount: 0,
        focusIndex: 4,
      };
    }

    case 'resetScores':
      return {
        ...state,
        scores: { x: 0, o: 0, draws: 0 },
        currentStreak: 0,
      };

    case 'focus': {
      if (action.index < 0 || action.index > 8) return state;
      return { ...state, focusIndex: action.index };
    }
  }
};
