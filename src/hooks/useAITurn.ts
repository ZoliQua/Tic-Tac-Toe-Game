import { useEffect } from 'react';
import { AI_DELAY_MS } from '../logic/constants';
import type { GameAction, GameState, Mark } from '../logic/types';

const opposite = (mark: Mark): Mark => (mark === 'X' ? 'O' : 'X');

export const useAITurn = (
  state: GameState,
  dispatch: (action: GameAction) => void,
  delayMs: number = AI_DELAY_MS,
): void => {
  useEffect(() => {
    if (state.mode === 'pvp') return;
    if (state.status !== 'playing') return;
    const aiMark = opposite(state.humanMark);
    if (state.current !== aiMark) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'aiMove' });
    }, Math.max(0, delayMs));

    return () => clearTimeout(timer);
  }, [
    state.mode,
    state.status,
    state.current,
    state.humanMark,
    state.board,
    dispatch,
    delayMs,
  ]);
};
