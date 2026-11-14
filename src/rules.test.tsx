import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, DUEL_BASE_POINTS, formatNumber } from './arcade';
import { TicTacToeGame } from './TicTacToeGame';
import { setCoarsePointer } from './test/touchEnv';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers();
  setCoarsePointer(false);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  applyLang('en', { silent: true });
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const openRules = () => fireEvent.click(screen.getByRole('button', { name: /Szabályok/ }));
const headings = () => within(screen.getByRole('dialog', { name: /szabályok/ })).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

describe('Tic-Tac-Toe rules dialog', () => {
  it('shows a Rules button; opening mid-run pauses and closing leaves it paused', () => {
    render(<TicTacToeGame />);
    expect(screen.getByRole('button', { name: /Szabályok/ })).toBeTruthy();
    act(() => key(' '));
    expect(screen.queryByRole('dialog')).toBeNull();
    openRules();
    expect(screen.getByRole('dialog', { name: 'Tic-Tac-Toe — szabályok' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Bezárás' }));
    expect(screen.getByRole('dialog', { name: 'Szünet' })).toBeTruthy();
  });

  it('R keeps restarting the round and does not open the rules', () => {
    render(<TicTacToeGame />);
    act(() => key(' '));
    act(() => key('r'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('lists goal, play, rules, scoring, dental in order; mobile only on touch', () => {
    const { unmount } = render(<TicTacToeGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód']);
    unmount();
    setCoarsePointer(true);
    render(<TicTacToeGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód', 'Mobilon']);
    const dialog = screen.getByRole('dialog', { name: /szabályok/ });
    expect(dialog.textContent).toContain('Koppints');
    expect(dialog.textContent).toContain('Teljes képernyő');
  });

  it('prints every scoring number', () => {
    render(<TicTacToeGame />);
    openRules();
    const text = screen.getByRole('dialog', { name: /szabályok/ }).textContent ?? '';
    for (const base of Object.values(DUEL_BASE_POINTS)) {
      for (const n of [base, base * 2, Math.round(base / 4)]) expect(text).toContain(formatNumber(n, 'hu'));
    }
  });

  it('has a described diagram', () => {
    render(<TicTacToeGame />);
    openRules();
    expect(within(screen.getByRole('dialog', { name: /szabályok/ })).getByRole('img', { name: /Ábra/ })).toBeTruthy();
  });

  it('keeps the run when the language changes inside the rules', () => {
    render(<TicTacToeGame />);
    act(() => key('1')); // PvP: no AI reply
    act(() => key(' '));
    act(() => key('Enter'));
    openRules();
    act(() => applyLang('de'));
    expect(screen.getByRole('heading', { level: 2, name: 'Tic-Tac-Toe — Regeln' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Ziel' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Schließen' }));
    expect(screen.getByRole('dialog', { name: 'Pausiert' })).toBeTruthy();
    expect(screen.getAllByRole('gridcell').filter((c) => !/leer|empty/i.test(c.getAttribute('aria-label') ?? ''))).toHaveLength(1);
  });
});
