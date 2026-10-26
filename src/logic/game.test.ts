import { describe, expect, it } from 'vitest';
import { duelRoundScore } from '../arcade';
import { autoplayStep, createDemoState, DEMO_PAIRINGS, difficultyOf, seededRng } from './autopilot';
import { WINNING_LINES } from './constants';
import { advanceGame, createInitialState, roundOutcome } from './game';
import { EMPTY_BOARD, moveFocus } from './grid';
import { checkWin, isDraw } from './win';
import type { Board, Cell, GameAction, GameState, Mark } from './types';

const rng = seededRng(42);
const act = (s: GameState, a: GameAction) => advanceGame(s, a, { rng });
const board = (cells: string): Board =>
  cells.split('').map((c) => (c === 'X' || c === 'O' ? c : null)) as unknown as Board;
const play = (s: GameState, ...indices: number[]) =>
  indices.reduce((acc, index) => act(acc, { type: 'place', index }), s);

describe('win / draw detection', () => {
  for (const mark of ['X', 'O'] as Mark[]) {
    for (const line of WINNING_LINES) {
      it(`detects ${mark} on [${line.join(',')}]`, () => {
        const cells: Cell[] = Array(9).fill(null);
        for (const i of line) cells[i] = mark;
        expect(checkWin(cells as unknown as Board)).toEqual({ winner: mark, line });
      });
    }
  }

  it('covers exactly the 8 lines', () => {
    expect(WINNING_LINES).toHaveLength(8);
    expect(new Set(WINNING_LINES.map((l) => l.join())).size).toBe(8);
  });

  it('recognises a draw only on a full board without a line', () => {
    const drawn = board('XOXXOOOXX');
    expect(checkWin(drawn)).toBeNull();
    expect(isDraw(drawn)).toBe(true);
    expect(isDraw(board('XOXXOOOX.'))).toBe(false);
    expect(isDraw(EMPTY_BOARD)).toBe(false);
  });

  it('a winning last move is a win, not a draw', () => {
    // X: 0 2 3 7 6 · O: 1 4 5 8 — X's ninth mark at 6 completes column 0.
    const s = play(createInitialState(), 0, 1, 2, 4, 3, 5, 7, 8, 6);
    expect(s.status).toBe('won');
    expect(s.winner).toBe('X');
    expect(s.winningLine).toEqual([0, 3, 6]);
    expect(s.scores).toEqual({ x: 1, o: 0, draws: 0 });
  });
});

describe('advanceGame', () => {
  it('ignores filled cells, bad indices and moves after the round ended', () => {
    const s = play(createInitialState(), 0);
    expect(play(s, 0)).toBe(s);
    expect(play(s, 9)).toBe(s);
    expect(play(s, -1)).toBe(s);
    const won = play(createInitialState(), 0, 3, 1, 4, 2);
    expect(won.status).toBe('won');
    expect(play(won, 8)).toBe(won);
    expect(act(won, { type: 'aiMove' })).toBe(won);
  });

  it('never lets the human place the AI mark during its turn', () => {
    const s = createInitialState({ mode: 'easy', startingMark: 'O' });
    expect(play(s, 0)).toBe(s);
    expect(act(s, { type: 'aiMove' }).moveCount).toBe(1);
  });

  it('counts a draw and resets the streak', () => {
    const s = play({ ...createInitialState(), currentStreak: 3 }, 0, 1, 2, 4, 3, 5, 7, 6, 8);
    expect(s.status).toBe('draw');
    expect(s.scores.draws).toBe(1);
    expect(s.currentStreak).toBe(0);
  });

  it('loser opens the next round; draws and abandoned rounds alternate', () => {
    const oWins = play(createInitialState(), 0, 3, 1, 4, 8, 5);
    expect(oWins.winner).toBe('O');
    const next = act(oWins, { type: 'newRound' });
    expect(next.current).toBe('X');
    expect(next.board).toEqual(EMPTY_BOARD);
    expect(next.scores.o).toBe(1); // match scores survive rounds
    const abandoned = act(next, { type: 'newRound' });
    expect(abandoned.startingMark).toBe('O');
  });

  it('tracks per-mode best streaks that never regress', () => {
    const bestStreaks = { pvp: 1, easy: 1, medium: 0, hard: 0 };
    const won = play({ ...createInitialState({ mode: 'pvp' }), currentStreak: 1, bestStreaks }, 0, 3, 1, 4, 2);
    expect(won.currentStreak).toBe(2);
    expect(won.bestStreaks.pvp).toBe(2);
    expect(won.bestStreaks.easy).toBe(1);
    const lost = play(act(won, { type: 'newRound' }), 0, 3, 1, 4, 2); // O opens and wins
    expect(lost.currentStreak).toBe(0);
    expect(lost.bestStreaks.pvp).toBe(2);
  });

  it('mode change starts a new match, keeps best streaks', () => {
    const s = { ...play(createInitialState(), 0, 3, 1, 4, 2), bestStreaks: { pvp: 4, easy: 0, medium: 0, hard: 2 } };
    const m = act(s, { type: 'changeMode', mode: 'hard' });
    expect(m).toMatchObject({ mode: 'hard', status: 'playing', points: 0, currentStreak: 0, scores: { x: 0, o: 0, draws: 0 } });
    expect(m.bestStreaks).toEqual(s.bestStreaks);
  });

  it('resetScores clears the match but not the board', () => {
    const s = { ...play(createInitialState(), 0), scores: { x: 2, o: 1, draws: 3 }, points: 500, currentStreak: 2 };
    const r = act(s, { type: 'resetScores' });
    expect(r).toMatchObject({ scores: { x: 0, o: 0, draws: 0 }, points: 0, currentStreak: 0, board: s.board });
  });

  it('moves the focus with clamping and no row wrap', () => {
    expect(moveFocus(2, 'right')).toBe(2);
    expect(moveFocus(7, 'down')).toBe(7);
    expect(moveFocus(3, 'left')).toBe(3);
    expect(moveFocus(4, 'up')).toBe(1);
    expect(act(createInitialState(), { type: 'focus', index: 9 }).focusIndex).toBe(4);
  });
});

describe('round scoring uses duelRoundScore', () => {
  it('a 5-move win on hard pays 500 × (1 + 4/9)', () => {
    const s0 = { ...createInitialState({ mode: 'hard' }), board: board('XX.OO....'), moveCount: 4 };
    const s = act(s0, { type: 'place', index: 2 });
    expect(s.status).toBe('won');
    expect(s.roundScore).toBe(duelRoundScore({ outcome: 'win', difficulty: 'hard', moves: 5, boardCells: 9 }));
    expect(s.roundScore).toBe(722);
    expect(s.points).toBe(722);
  });

  it('a human win via the reducer adds the round score to the match points', () => {
    const s0 = { ...createInitialState({ mode: 'easy' }), board: board('XX.OO....'), moveCount: 4, points: 100 };
    const s = act(s0, { type: 'place', index: 2 });
    const expected = duelRoundScore({ outcome: 'win', difficulty: 'easy', moves: 5, boardCells: 9 });
    expect(s.roundScore).toBe(expected);
    expect(s.points).toBe(100 + expected);
    expect(act(s, { type: 'newRound' })).toMatchObject({ roundScore: 0, points: 100 + expected });
  });

  it('an AI win scores 0 and a draw scores a quarter of the base', () => {
    const lost = act({ ...createInitialState({ mode: 'medium', startingMark: 'O' }), board: board('OO.XX.X..'), current: 'O', moveCount: 5 }, { type: 'aiMove' });
    expect(lost.winner).toBe('O');
    expect(roundOutcome(lost)).toBe('loss');
    expect(lost.roundScore).toBe(0);

    const drawn = act({ ...createInitialState({ mode: 'medium' }), board: board('XOXXOOO.X'), moveCount: 8 }, { type: 'place', index: 7 });
    expect(drawn.status).toBe('draw');
    expect(drawn.roundScore).toBe(duelRoundScore({ outcome: 'draw', difficulty: 'medium', moves: 9, boardCells: 9 }));
    expect(drawn.roundScore).toBe(63);
  });

  it('PvP rounds are unranked and score 0', () => {
    const s = play(createInitialState({ mode: 'pvp' }), 0, 3, 1, 4, 2);
    expect(s.status).toBe('won');
    expect(s.roundScore).toBe(0);
    expect(roundOutcome(s)).toBe('win');
  });
});

describe('demo autopilot', () => {
  it('mixes difficulties so rounds are not all draws', () => {
    expect(DEMO_PAIRINGS.some(([x, o]) => x !== o)).toBe(true);
    expect(difficultyOf(0, 'X')).toBe(DEMO_PAIRINGS[0][0]);
    expect(difficultyOf(DEMO_PAIRINGS.length + 1, 'O')).toBe(DEMO_PAIRINGS[1][1]);
  });

  it('plays full rounds with the real engine and produces varied results', () => {
    const r = seededRng(7);
    const results = new Set<string>();
    let s = createDemoState();
    for (let round = 0; round < 24; round++) {
      let guard = 0;
      while (s.status === 'playing' && guard++ < 9) s = autoplayStep(s, round, r);
      expect(s.status).not.toBe('playing');
      results.add(s.status === 'draw' ? 'draw' : s.winner!);
      s = advanceGame(s, { type: 'newRound' }, { rng: r });
    }
    expect(results.size).toBeGreaterThanOrEqual(2);
  });

  it('is a no-op once the round is over', () => {
    const won = play(createInitialState(), 0, 3, 1, 4, 2);
    expect(autoplayStep(won, 0, rng)).toBe(won);
  });
});
