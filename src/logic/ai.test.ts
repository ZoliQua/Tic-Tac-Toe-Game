import { describe, expect, it } from 'vitest';
import { seededRng } from './autopilot';
import { bestMove, easyMove, hardMove, mediumMove } from './ai';
import { advanceGame, createInitialState } from './game';
import { getEmptyCells } from './grid';
import type { Board, GameState, Mark } from './types';

const board = (cells: string): Board =>
  cells.split('').map((c) => (c === 'X' || c === 'O' ? c : null)) as unknown as Board;

/**
 * Exhaustive check: from the empty board, try EVERY human reply at every
 * human turn against the deterministic hard AI. Returns the outcomes reached.
 */
function exploreHard(start: Mark): { humanWins: number; aiWins: number; draws: number; games: number } {
  const tally = { humanWins: 0, aiWins: 0, draws: 0, games: 0 };
  const rng = () => 0;
  const visit = (s: GameState) => {
    if (s.status !== 'playing') {
      tally.games++;
      if (s.status === 'draw') tally.draws++;
      else if (s.winner === s.humanMark) tally.humanWins++;
      else tally.aiWins++;
      return;
    }
    if (s.current === s.humanMark) {
      for (const index of getEmptyCells(s.board)) visit(advanceGame(s, { type: 'place', index }, { rng }));
    } else {
      const next = advanceGame(s, { type: 'aiMove' }, { rng });
      expect(next.moveCount).toBe(s.moveCount + 1);
      visit(next);
    }
  };
  visit(createInitialState({ mode: 'hard', startingMark: start }));
  return tally;
}

describe('hard (minimax) AI', () => {
  it('never loses when the human moves first — every line of play', () => {
    const t = exploreHard('X');
    expect(t.humanWins).toBe(0);
    expect(t.games).toBeGreaterThan(100);
    expect(t.aiWins).toBeGreaterThan(0);
  });

  it('never loses when the AI moves first — every line of play', () => {
    const t = exploreHard('O');
    expect(t.humanWins).toBe(0);
    expect(t.aiWins).toBeGreaterThan(0);
  });

  it('opens in the centre, takes an immediate win and blocks', () => {
    expect(hardMove(board('.........'), 'X')).toBe(4);
    expect(hardMove(board('OO.XX....'), 'O')).toBe(2);
    expect(hardMove(board('XX..O....'), 'O')).toBe(2);
  });

  it('hard vs hard always draws', () => {
    let s = createInitialState({ mode: 'pvp' });
    while (s.status === 'playing') {
      s = advanceGame(s, { type: 'place', index: hardMove(s.board, s.current) }, { rng: () => 0 });
    }
    expect(s.status).toBe('draw');
  });
});

describe('medium AI', () => {
  const rng = seededRng(1);
  it('takes a win in one', () => {
    expect(mediumMove(board('XX.OO....'), 'X', rng)).toBe(2);
    expect(mediumMove(board('O..O...XX'), 'O', rng)).toBe(6);
  });
  it('blocks the opponent', () => {
    expect(mediumMove(board('OO.X.....'), 'X', rng)).toBe(2);
  });
  it('prefers the centre, then a corner', () => {
    expect(mediumMove(board('X........'), 'O', rng)).toBe(4);
    for (let i = 0; i < 20; i++) {
      expect([0, 2, 6, 8]).toContain(mediumMove(board('....X....'), 'O', rng));
    }
  });
});

describe('easy AI', () => {
  it('only picks empty cells and uses the RNG', () => {
    const b = board('XO.X.O..X');
    const empties = getEmptyCells(b);
    const picks = new Set<number>();
    const rng = seededRng(9);
    for (let i = 0; i < 200; i++) {
      const m = easyMove(b, 'O', rng);
      expect(empties).toContain(m);
      picks.add(m);
    }
    expect(picks.size).toBe(empties.length);
  });

  it('against random play produces wins, losses and draws', () => {
    const rng = seededRng(2024);
    const tally = { x: 0, o: 0, d: 0 };
    for (let g = 0; g < 400; g++) {
      let s = createInitialState({ mode: 'easy' });
      while (s.status === 'playing') {
        if (s.current === 'X') {
          const e = getEmptyCells(s.board);
          s = advanceGame(s, { type: 'place', index: e[Math.floor(rng() * e.length)] }, { rng });
        } else {
          s = advanceGame(s, { type: 'aiMove' }, { rng });
        }
      }
      if (s.winner === 'X') tally.x++;
      else if (s.winner === 'O') tally.o++;
      else tally.d++;
    }
    expect(tally.x).toBeGreaterThan(0);
    expect(tally.o).toBeGreaterThan(0);
    expect(tally.d).toBeGreaterThan(0);
  });

  it('bestMove dispatches by mode and returns -1 for PvP', () => {
    const b = board('XX.OO....');
    expect(bestMove(b, 'O', 'hard', () => 0)).toBe(5);
    expect(bestMove(b, 'O', 'medium', () => 0)).toBe(5);
    expect(bestMove(b, 'O', 'pvp', () => 0)).toBe(-1);
  });
});
