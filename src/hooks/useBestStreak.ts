import { useEffect } from 'react';
import { STREAK_KEY_PREFIX } from '../logic/constants';
import { EMPTY_BEST_STREAKS } from '../logic/game';
import type { BestStreaks, Mode } from '../logic/types';

const MODES: readonly Mode[] = ['pvp', 'easy', 'medium', 'hard'] as const;

const keyFor = (mode: Mode): string => `${STREAK_KEY_PREFIX}.${mode}`;
const LEGACY_KEY = STREAK_KEY_PREFIX; // pre-C3 single-key best streak

const readOne = (mode: Mode): number => {
  try {
    const raw = window.localStorage.getItem(keyFor(mode));
    if (raw === null) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
};

const readLegacy = (): number => {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (raw === null) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
};

const writeOne = (mode: Mode, value: number): void => {
  try {
    window.localStorage.setItem(keyFor(mode), String(Math.floor(value)));
  } catch {
    // ignore quota / privacy mode errors
  }
};

/**
 * Read all four per-mode best streaks. If no per-mode keys exist but a
 * legacy single-key value does, migrate it to the most-pessimistic
 * assumption: drop it into Hard (hardest to attain) and zero the rest.
 * One-time on first call after upgrade.
 */
export const readBestStreaks = (): BestStreaks => {
  const out = { ...EMPTY_BEST_STREAKS };
  let anyPresent = false;
  for (const m of MODES) {
    const v = readOne(m);
    out[m] = v;
    if (v > 0) anyPresent = true;
  }
  if (!anyPresent) {
    const legacy = readLegacy();
    if (legacy > 0) {
      out.hard = legacy;
      writeOne('hard', legacy);
    }
  }
  return out;
};

/**
 * Persist any best-streak that grew in `state.bestStreaks` since last call.
 * Called from a useEffect; the reducer is the source of truth.
 */
export const useBestStreaks = (bestStreaks: BestStreaks): void => {
  useEffect(() => {
    for (const m of MODES) {
      const cur = readOne(m);
      const next = bestStreaks[m];
      if (next > cur) writeOne(m, next);
    }
  }, [bestStreaks]);
};
