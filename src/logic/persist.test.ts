import { describe, expect, it } from 'vitest';
import { advanceGame, createInitialState } from './game';
import { isTicTacToeSession } from './persist';
import type { GameState, SavedGame } from './types';

const rng = () => 0;
const strip = ({ bestStreaks, ...rest }: GameState): SavedGame => {
  void bestStreaks;
  return rest;
};
const play = (s: GameState, ...indices: number[]) =>
  indices.reduce((acc, index) => advanceGame(acc, { type: 'place', index }, { rng }), s);

describe('isTicTacToeSession', () => {
  const midRound = strip(play(createInitialState({ mode: 'medium' }), 4));
  const won = strip(play(createInitialState({ mode: 'pvp' }), 0, 3, 1, 4, 2));
  const drawn = strip(play(createInitialState({ mode: 'pvp' }), 0, 1, 2, 4, 3, 5, 7, 6, 8));

  it('accepts real states (fresh, mid-round, won, drawn, JSON round-tripped)', () => {
    for (const s of [strip(createInitialState()), midRound, won, drawn]) {
      expect(isTicTacToeSession(JSON.parse(JSON.stringify(s)))).toBe(true);
    }
    expect(isTicTacToeSession(strip(createInitialState({ startingMark: 'O', mode: 'hard' })))).toBe(true);
  });

  it('rejects non-objects and missing / mistyped fields', () => {
    for (const v of [null, undefined, 42, 'x', []]) expect(isTicTacToeSession(v)).toBe(false);
    const bad: Partial<Record<keyof SavedGame, unknown>>[] = [
      { board: [] },
      { board: Array(9).fill('Z') },
      { mode: 'insane' },
      { current: 'Y' },
      { humanMark: null },
      { status: 'idle' },
      { scores: { x: -1, o: 0, draws: 0 } },
      { scores: { x: 1.5, o: 0, draws: 0 } },
      { points: -10 },
      { points: '100' },
      { roundScore: Number.NaN },
      { currentStreak: -1 },
      { focusIndex: 9 },
      { moveCount: 3 },
    ];
    for (const patch of bad) expect(isTicTacToeSession({ ...midRound, ...patch })).toBe(false);
  });

  it('rejects unreachable positions', () => {
    const b = [...midRound.board];
    b[0] = 'X'; // two X marks, no O
    expect(isTicTacToeSession({ ...midRound, board: b, moveCount: 2 })).toBe(false);
    // wrong side to move
    expect(isTicTacToeSession({ ...midRound, current: 'X' })).toBe(false);
    // playing although the board shows a line
    expect(isTicTacToeSession({ ...won, status: 'playing', winner: null, winningLine: null })).toBe(false);
    // winner / line that disagree with the board
    expect(isTicTacToeSession({ ...won, winner: 'O' })).toBe(false);
    expect(isTicTacToeSession({ ...won, winningLine: [3, 4, 5] })).toBe(false);
    // a draw that is not full
    expect(isTicTacToeSession({ ...midRound, status: 'draw' })).toBe(false);
    // a round score while still playing
    expect(isTicTacToeSession({ ...midRound, roundScore: 50 })).toBe(false);
    expect(isTicTacToeSession({ ...drawn, winner: 'X' })).toBe(false);
  });
});
