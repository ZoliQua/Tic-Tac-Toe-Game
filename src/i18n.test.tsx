import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyLang, formatNumber, LANGS, loadSession, saveSession } from './arcade';
import { MESSAGES } from './i18n';
import { createInitialState } from './logic/game';
import type { SavedGame } from './logic/types';
import { TicTacToeGame } from './TicTacToeGame';

beforeEach(() => {
  localStorage.clear();
  applyLang('en', { silent: true });
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const stat = (label: string) => {
  const dt = screen.getAllByRole('term').find((el) => el.textContent === label);
  return dt?.nextElementSibling?.textContent;
};

describe('Tic-Tac-Toe messages', () => {
  it('has every key in en / hu / de with a non-empty value', () => {
    const keys = Object.keys(MESSAGES.en).sort();
    expect(keys.length).toBeGreaterThan(0);
    for (const lang of LANGS) {
      expect(Object.keys(MESSAGES[lang]).sort()).toEqual(keys);
      for (const k of keys) {
        const value = (MESSAGES[lang] as Record<string, string>)[k];
        expect(typeof value, `${lang}.${k}`).toBe('string');
        expect(value.trim(), `${lang}.${k}`).not.toBe('');
      }
    }
  });
});

describe('<TicTacToeGame /> in other languages', () => {
  it('shows the German start overlay after applyLang("de")', () => {
    applyLang('de');
    render(<TicTacToeGame />);
    const dialog = screen.getByRole('dialog', { name: 'Tic-Tac-Toe' });
    expect(dialog.textContent).toContain('Drei in einer Reihe schlagen die KI');
    expect(screen.getAllByRole('button', { name: /Start/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Einstellungen' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mittel' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('shows the Hungarian start button', () => {
    applyLang('hu');
    render(<TicTacToeGame />);
    expect(screen.getAllByRole('button', { name: /Indítás/ }).length).toBeGreaterThan(0);
  });

  it('switching to Hungarian mid-round keeps the board and the run', () => {
    render(<TicTacToeGame />);
    act(() => key('1')); // PvP
    act(() => key(' ')); // start
    act(() => key('Enter')); // X (healthy tooth) in the centre
    expect(screen.getByRole('gridcell', { name: 'Row 2, column 2, healthy tooth' })).toBeTruthy();

    act(() => applyLang('hu'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('gridcell', { name: '2. sor, 2. oszlop, egészséges fog' })).toBeTruthy();
    expect(screen.getAllByRole('gridcell', { name: /üres$/ })).toHaveLength(8);
    expect(screen.getByRole('status').textContent).toContain('Szuvas fog lép');
    act(() => vi.advanceTimersByTime(1200));
    expect(loadSession<SavedGame>('tictactoe', 1)?.data).toMatchObject({ mode: 'pvp', moveCount: 1, status: 'playing' });
  });

  it('formats match points with the locale grouping', () => {
    const { bestStreaks, ...rest } = createInitialState({ mode: 'hard' });
    void bestStreaks;
    const data: SavedGame = { ...rest, points: 12345 };
    saveSession('tictactoe', { schema: 1, data, seconds: 0, score: data.points });
    render(<TicTacToeGame />);
    expect(stat('Points')).toBe('12,345');
    expect(screen.getByRole('dialog', { name: 'Welcome back' }).textContent).toContain('12,345 points');
    act(() => applyLang('hu'));
    expect(stat('Pontok')).toBe(formatNumber(12345, 'hu'));
    expect(screen.getByRole('dialog', { name: 'Üdv újra!' }).textContent).toContain(`${formatNumber(12345, 'hu')} pont`);
    act(() => applyLang('de'));
    expect(stat('Punkte')).toBe('12.345');
  });
});
