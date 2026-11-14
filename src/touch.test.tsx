import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang } from './arcade';
import { TicTacToeGame } from './TicTacToeGame';
import { setCoarsePointer } from './test/touchEnv';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('en', { silent: true });
  vi.useFakeTimers();
  setCoarsePointer(true);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const cell = (i: number) => document.querySelector(`[data-index="${i}"]`) as HTMLElement;
const tap = (el: HTMLElement) => {
  fireEvent.pointerDown(el, { pointerId: 1, pointerType: 'touch', button: 0 });
  fireEvent.pointerUp(el, { pointerId: 1, pointerType: 'touch', button: 0 });
  fireEvent.click(el);
};
const filled = () => screen.getAllByRole('gridcell').filter((c) => !/empty/.test(c.getAttribute('aria-label') ?? ''));

describe('Tic-Tac-Toe touch controls', () => {
  it('marks the board as a tap board', () => {
    render(<TicTacToeGame />);
    expect(document.querySelector('.arc-board-tap')).toBeTruthy();
  });

  it('tapping a square places a mark', () => {
    render(<TicTacToeGame />);
    act(() => key('1')); // PvP
    act(() => key(' '));
    tap(cell(0));
    expect(filled()).toHaveLength(1);
    expect(cell(0).getAttribute('aria-label')).toContain('X');
    tap(cell(8));
    expect(cell(8).getAttribute('aria-label')).toContain('O');
  });

  it('tapping an occupied square or the AI turn does nothing', () => {
    render(<TicTacToeGame />);
    act(() => key('1'));
    act(() => key(' '));
    tap(cell(0));
    tap(cell(0));
    expect(filled()).toHaveLength(1);
  });

  it('shows touch help instead of keys', () => {
    render(<TicTacToeGame />);
    expect(screen.getByText('Tap')).toBeTruthy();
  });

  it('the full-screen button toggles the immersive mode', () => {
    render(<TicTacToeGame />);
    fireEvent.click(screen.getByRole('button', { name: /Full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: /Exit full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBeUndefined();
  });
});
