import { duelRoundScore, type DuelDifficulty, type RunOutcome } from '../arcade';
import { bestMove } from './ai';
import { BOARD_CELLS } from './constants';
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

export const opposite = (mark: Mark): Mark => (mark === 'X' ? 'O' : 'X');

export const MODES: readonly Mode[] = ['pvp', 'easy', 'medium', 'hard'] as const;

/** The AI's mark, or null in local two-player mode. */
export const aiMarkFor = (state: Pick<GameState, 'mode' | 'humanMark'>): Mark | null => {
  if (state.mode === 'pvp') return null;
  return opposite(state.humanMark);
};

/** Difficulty fed to `duelRoundScore`; null (unranked) for PvP. */
export const difficultyFor = (mode: Mode): DuelDifficulty | null => (mode === 'pvp' ? null : mode);

/**
 * How a finished round ended from the human's side. In PvP the "human" is
 * player 1 (`humanMark`, X): the round is unranked there anyway.
 */
export const roundOutcome = (
  state: Pick<GameState, 'status' | 'winner' | 'humanMark'>,
): RunOutcome => {
  if (state.status === 'draw' || state.winner === null) return 'draw';
  return state.winner === state.humanMark ? 'win' : 'loss';
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
    points: 0,
    roundScore: 0,
  };
};

/** Scores a finished round with the shared arcade duel formula. */
const scoreRound = (state: GameState): GameState => {
  const roundScore = duelRoundScore({
    outcome: roundOutcome(state),
    difficulty: difficultyFor(state.mode),
    moves: state.moveCount,
    boardCells: BOARD_CELLS,
  });
  return { ...state, roundScore, points: state.points + roundScore };
};

const applyResultToScores = (state: GameState, board: Board): GameState => {
  const moveCount = state.moveCount + 1;
  const win = checkWin(board);
  if (win) {
    // PvP counts player 1 (humanMark) wins toward the streak.
    const humanWon = win.winner === state.humanMark;
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

    return scoreRound({
      ...state,
      board,
      status: 'won',
      winner: win.winner,
      winningLine: win.line,
      scores,
      currentStreak,
      bestStreaks,
      moveCount,
    });
  }

  if (isDraw(board)) {
    return scoreRound({
      ...state,
      board,
      status: 'draw',
      winner: null,
      winningLine: null,
      scores: { ...state.scores, draws: state.scores.draws + 1 },
      currentStreak: 0,
      moveCount,
    });
  }

  return {
    ...state,
    board,
    current: opposite(state.current),
    moveCount,
  };
};

const tryPlace = (state: GameState, index: number, mark: Mark): GameState => {
  if (state.status !== 'playing' || state.finishedEarly) return state;
  if (!Number.isInteger(index) || index < 0 || index > 8) return state;
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
    case 'place': {
      // A human may only place on their own turn; in PvP both marks are human.
      const aiMark = aiMarkFor(state);
      if (aiMark !== null && state.current === aiMark) return state;
      return tryPlace(state, action.index, state.current);
    }

    case 'aiMove': {
      if (state.status !== 'playing' || state.finishedEarly) return state;
      const aiMark = aiMarkFor(state);
      if (aiMark === null) return state;
      if (state.current !== aiMark) return state;
      const idx = bestMove(state.board, aiMark, state.mode, ctx.rng);
      if (idx < 0) return state;
      return tryPlace(state, idx, aiMark);
    }

    case 'newRound': {
      // Loser-goes-first: if the previous round had a winner, the loser opens
      // the next round; on a draw, an abandoned round or the first round, alternate.
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
        roundScore: 0,
        finishedEarly: false,
      };
    }

    case 'changeMode': {
      // A new mode starts a new match: scores, streak and points reset.
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
        points: 0,
        roundScore: 0,
        finishedEarly: false,
      };
    }

    case 'finish':
      // Ends the round where it stands: no result, no score change (roundScore is still 0).
      return state.status === 'playing' && !state.finishedEarly ? { ...state, finishedEarly: true } : state;

    case 'resetScores':
      return {
        ...state,
        scores: { x: 0, o: 0, draws: 0 },
        currentStreak: 0,
        points: 0,
      };

    case 'focus': {
      if (!Number.isInteger(action.index) || action.index < 0 || action.index > 8) return state;
      return { ...state, focusIndex: action.index };
    }
  }
};
