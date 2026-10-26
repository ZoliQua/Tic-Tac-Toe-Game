import { MODES, opposite } from './game';
import { checkWin } from './win';
import type { Board, Cell, GameStatus, Mark, Mode, SavedGame } from './types';

const MARKS: readonly Mark[] = ['X', 'O'];
const STATUSES: readonly GameStatus[] = ['playing', 'won', 'draw'];

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const isNonNegInt = (v: unknown): v is number => isInt(v) && v >= 0;
const isMark = (v: unknown): v is Mark => MARKS.includes(v as Mark);
const isCell = (v: unknown): v is Cell => v === null || isMark(v);

function isBoard(v: unknown): v is Board {
  return Array.isArray(v) && v.length === 9 && v.every(isCell);
}

function isScores(v: unknown): boolean {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return isNonNegInt(s.x) && isNonNegInt(s.o) && isNonNegInt(s.draws);
}

/**
 * Guards a saved Tic-Tac-Toe session before it is trusted as game state.
 * Besides field types it checks that the position is reachable: mark counts
 * match the starting mark and move count, the side to move is consistent, and
 * the status / winner / winning line agree with the board.
 */
export function isTicTacToeSession(v: unknown): v is SavedGame {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;

  if (!isBoard(s.board)) return false;
  if (!isMark(s.current) || !isMark(s.humanMark) || !isMark(s.startingMark)) return false;
  if (!STATUSES.includes(s.status as GameStatus)) return false;
  if (!MODES.includes(s.mode as Mode)) return false;
  if (!isScores(s.scores)) return false;
  if (!isNonNegInt(s.currentStreak) || !isNonNegInt(s.points) || !isNonNegInt(s.roundScore)) return false;
  if (!isInt(s.focusIndex) || s.focusIndex < 0 || s.focusIndex > 8) return false;
  if (!isInt(s.moveCount)) return false;
  if (!(s.winner === null || isMark(s.winner))) return false;

  const board = s.board;
  const starter = s.startingMark as Mark;
  const filled = board.filter((c) => c !== null).length;
  const starterCount = board.filter((c) => c === starter).length;
  const otherCount = filled - starterCount;
  if (s.moveCount !== filled) return false;
  // The starting mark is always level with, or one ahead of, the other mark.
  if (starterCount !== otherCount && starterCount !== otherCount + 1) return false;

  const win = checkWin(board);
  const status = s.status as GameStatus;
  if (status === 'playing') {
    if (win !== null || filled === 9) return false;
    if (s.winner !== null || s.winningLine !== null) return false;
    if (s.roundScore !== 0) return false;
    const toMove = filled % 2 === 0 ? starter : opposite(starter);
    return s.current === toMove;
  }
  if (status === 'won') {
    if (win === null || s.winner !== win.winner) return false;
    const line = s.winningLine;
    return (
      Array.isArray(line) &&
      line.length === 3 &&
      line.every((i, k) => i === win.line[k])
    );
  }
  // draw
  return win === null && filled === 9 && s.winner === null && s.winningLine === null;
}
