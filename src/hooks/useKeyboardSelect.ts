import { useEffect, useRef } from 'react';
import { ARCADE_KEYS, isKey, shouldIgnoreKey } from '../arcade';

type FocusDirection = 'up' | 'down' | 'left' | 'right';

const DIRECTION_KEYS: Record<string, FocusDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

export type KeyboardHandlers = {
  /** A confirm dialog is open: only `onConfirm` / `onCancel` are live. */
  confirmOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onMove: (direction: FocusDirection) => void;
  /** Enter / Space: place on the focused cell, start, resume or next round. */
  onPrimary: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onCycleMode: () => void;
  /** `1`–`4` jump straight to PvP / Easy / Medium / Hard. */
  onModeIndex: (index: number) => void;
  onToggleIcons: () => void;
  /** `C` asks for confirmation; Shift+C resets immediately. */
  onResetScores: (skipConfirm: boolean) => void;
};

/**
 * One window `keydown` listener for the component's lifetime; handlers are
 * read from a ref, so they are never stale and never re-attached. Every key is
 * ignored while the user types in a form field or holds Cmd/Ctrl/Alt.
 * `T` is left alone: it is the shared arcade theme toggle.
 */
export const useKeyboardSelect = (handlers: KeyboardHandlers): void => {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (shouldIgnoreKey(event)) return;
      const h = ref.current;
      const key = event.key;

      if (h.confirmOpen) {
        if (key === 'Enter') {
          event.preventDefault();
          h.onConfirm();
        } else if (key === 'Escape') {
          event.preventDefault();
          h.onCancel();
        }
        return;
      }

      const direction = DIRECTION_KEYS[key];
      if (direction) {
        event.preventDefault();
        h.onMove(direction);
        return;
      }
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        h.onPrimary();
        return;
      }
      if (isKey(event, ARCADE_KEYS.pause)) {
        event.preventDefault();
        h.onTogglePause();
        return;
      }
      if (isKey(event, ARCADE_KEYS.restart)) {
        event.preventDefault();
        h.onRestart();
        return;
      }
      if (key === 'n' || key === 'N') {
        event.preventDefault();
        h.onCycleMode();
        return;
      }
      if (key === '1' || key === '2' || key === '3' || key === '4') {
        event.preventDefault();
        h.onModeIndex(Number(key) - 1);
        return;
      }
      if (key === 'i' || key === 'I') {
        event.preventDefault();
        h.onToggleIcons();
        return;
      }
      if (key === 'c' || key === 'C') {
        event.preventDefault();
        h.onResetScores(event.shiftKey);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
};
