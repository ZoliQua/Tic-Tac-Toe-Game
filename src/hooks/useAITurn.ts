import { useEffect } from 'react';
import { AI_DELAY_MS } from '../logic/constants';
import { aiMarkFor } from '../logic/game';
import type { GameAction, GameState } from '../logic/types';

/**
 * Schedules the AI's move after `delayMs` when it is the AI's turn and the
 * round is `active` (running: not idle, paused or behind a dialog). The timer
 * is cancelled on every relevant state change and on unmount, so a stale
 * `aiMove` never fires after a pause, new round, mode change or unmount.
 */
export const useAITurn = (
  state: GameState,
  dispatch: (action: GameAction) => void,
  delayMs: number = AI_DELAY_MS,
  active = true,
): void => {
  const aiMark = aiMarkFor(state);
  const aiToMove = active && state.status === 'playing' && aiMark !== null && state.current === aiMark;

  useEffect(() => {
    if (!aiToMove) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'aiMove' });
    }, Math.max(0, delayMs));
    return () => window.clearTimeout(timer);
  }, [aiToMove, state.board, dispatch, delayMs]);
};
