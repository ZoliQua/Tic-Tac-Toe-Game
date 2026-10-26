import { bestMove } from './ai';
import { advanceGame, createInitialState } from './game';
import type { GameState, Mark, Rng } from './types';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Who plays X and O in each demo round. Mixed strengths so the attract mode
 * shows wins for both sides and the occasional draw — hard vs hard would
 * always draw.
 */
export const DEMO_PAIRINGS: readonly (readonly [x: AIDifficulty, o: AIDifficulty])[] = [
  ['medium', 'easy'],
  ['easy', 'hard'],
  ['hard', 'medium'],
  ['easy', 'medium'],
  ['hard', 'easy'],
  ['medium', 'medium'],
];

export const pairingFor = (round: number) => DEMO_PAIRINGS[round % DEMO_PAIRINGS.length];

export const difficultyOf = (round: number, mark: Mark): AIDifficulty => {
  const [x, o] = pairingFor(round);
  return mark === 'X' ? x : o;
};

/** Fresh demo state: a PvP round (both seats driven by the autopilot). */
export const createDemoState = (): GameState => createInitialState({ mode: 'pvp' });

/**
 * One autopilot move with the REAL engine: the side to move picks a cell with
 * its difficulty's AI and the move goes through `advanceGame` like a human's.
 */
export function autoplayStep(state: GameState, round: number, rng: Rng): GameState {
  if (state.status !== 'playing') return state;
  const index = bestMove(state.board, state.current, difficultyOf(round, state.current), rng);
  if (index < 0) return state;
  return advanceGame(state, { type: 'place', index }, { rng });
}

/** Deterministic PRNG (mulberry32) so demo rounds are reproducible in tests. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
