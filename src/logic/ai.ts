import { CENTER, CORNERS, EDGES, WINNING_LINES } from './constants';
import { getEmptyCells } from './grid';
import { checkWin } from './win';
import type { Board, Cell, Mark, Mode, Rng } from './types';

const opposite = (mark: Mark): Mark => (mark === 'X' ? 'O' : 'X');

const placeAt = (board: Board, index: number, mark: Mark): Board => {
  const next = board.slice() as Cell[];
  next[index] = mark;
  return next as unknown as Board;
};

const pickRandom = <T,>(arr: readonly T[], rng: Rng): T => {
  const i = Math.floor(rng() * arr.length);
  return arr[i] as T;
};

const findWinningMove = (board: Board, mark: Mark): number | null => {
  for (const line of WINNING_LINES) {
    const cells = [board[line[0]], board[line[1]], board[line[2]]];
    const marks = cells.filter((c) => c === mark).length;
    const empties = cells.filter((c) => c === null).length;
    if (marks === 2 && empties === 1) {
      const idxInLine = cells.indexOf(null);
      return line[idxInLine];
    }
  }
  return null;
};

export const easyMove = (board: Board, _mark: Mark, rng: Rng): number => {
  const empties = getEmptyCells(board);
  return pickRandom(empties, rng);
};

export const mediumMove = (board: Board, mark: Mark, rng: Rng): number => {
  const opp = opposite(mark);

  const winNow = findWinningMove(board, mark);
  if (winNow !== null) return winNow;

  const blockNow = findWinningMove(board, opp);
  if (blockNow !== null) return blockNow;

  if (board[CENTER] === null) return CENTER;

  const emptyCorners = CORNERS.filter((i) => board[i] === null);
  if (emptyCorners.length > 0) return pickRandom(emptyCorners, rng);

  const emptyEdges = EDGES.filter((i) => board[i] === null);
  if (emptyEdges.length > 0) return pickRandom(emptyEdges, rng);

  return getEmptyCells(board)[0] ?? -1;
};

type ScoredMove = { score: number; index: number };

const minimax = (
  board: Board,
  toMove: Mark,
  aiMark: Mark,
  depth: number,
  alpha: number,
  beta: number,
): ScoredMove => {
  const win = checkWin(board);
  if (win) {
    if (win.winner === aiMark) return { score: 10 - depth, index: -1 };
    return { score: depth - 10, index: -1 };
  }

  const empties = getEmptyCells(board);
  if (empties.length === 0) return { score: 0, index: -1 };

  const isMaximizing = toMove === aiMark;
  let best: ScoredMove = {
    score: isMaximizing ? -Infinity : Infinity,
    index: empties[0] as number,
  };

  let a = alpha;
  let b = beta;

  for (const idx of empties) {
    const next = placeAt(board, idx, toMove);
    const result = minimax(next, opposite(toMove), aiMark, depth + 1, a, b);
    if (isMaximizing) {
      if (result.score > best.score) best = { score: result.score, index: idx };
      if (best.score > a) a = best.score;
    } else {
      if (result.score < best.score) best = { score: result.score, index: idx };
      if (best.score < b) b = best.score;
    }
    if (b <= a) break;
  }

  return best;
};

export const hardMove = (board: Board, mark: Mark): number => {
  const empties = getEmptyCells(board);
  if (empties.length === 9) {
    // First move: center is canonical optimal.
    return CENTER;
  }
  const result = minimax(board, mark, mark, 0, -Infinity, Infinity);
  return result.index;
};

export const bestMove = (board: Board, mark: Mark, mode: Mode, rng: Rng): number => {
  switch (mode) {
    case 'easy':
      return easyMove(board, mark, rng);
    case 'medium':
      return mediumMove(board, mark, rng);
    case 'hard':
      return hardMove(board, mark);
    case 'pvp':
      return -1;
  }
};
