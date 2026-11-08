import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, loadSession, saveSession } from './arcade';
import { createInitialState } from './logic/game';
import type { Board, SavedGame } from './logic/types';
import { TicTacToeGame } from './TicTacToeGame';

beforeEach(() => {
  localStorage.clear();
  applyLang('en', { silent: true });
  applyDental(false, { silent: true });
  localStorage.clear();
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
const boardRoot = (container: HTMLElement) => container.querySelector('[data-dental]') as HTMLElement;
const board = (cells: string): Board =>
  cells.split('').map((c) => (c === 'X' || c === 'O' ? c : null)) as unknown as Board;

/** Easy mode, X (human) to move on the centre; one X and one O placed, 100 match points. */
const seedMidRound = () => {
  const { bestStreaks, ...rest } = createInitialState({ mode: 'easy' });
  void bestStreaks;
  const data: SavedGame = {
    ...rest,
    board: board('X.......O'),
    moveCount: 2,
    focusIndex: 4,
    points: 100,
    scores: { x: 1, o: 0, draws: 0 },
  };
  saveSession('tictactoe', { schema: 1, data, seconds: 12, score: 100 });
};

describe('Tic-Tac-Toe dental mode', () => {
  it('draws X as a healthy tooth and O as a chipped, decayed tooth when dental mode is on', () => {
    applyDental(true, { silent: true });
    seedMidRound();
    const { container } = render(<TicTacToeGame />);
    expect(boardRoot(container).dataset.dental).toBe('true');
    const teeth = screen.getAllByTestId('tictactoe-mark-tooth');
    expect(teeth.map((el) => el.dataset.shape).sort()).toEqual(['decayed', 'healthy']);
    expect(screen.getByRole('gridcell', { name: 'Row 1, column 1, healthy tooth' })).toBeTruthy();
    expect(screen.getByRole('gridcell', { name: 'Row 3, column 3, decayed tooth' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: /Dental mode/ })).toHaveProperty('checked', true);
  });

  it('toggling dental mode mid-round keeps the board, the score and the run', () => {
    seedMidRound();
    const { container } = render(<TicTacToeGame />);
    act(() => key('p')); // continue the restored round
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('gridcell', { name: 'Row 1, column 1, X' })).toBeTruthy();

    act(() => applyDental(true));
    expect(boardRoot(container).dataset.dental).toBe('true');
    expect(screen.getAllByTestId('tictactoe-mark-tooth')).toHaveLength(2);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stat('Points')).toBe('100');
    expect(stat('W–L–D')).toBe('1–0–0');
    act(() => key('Enter')); // the round goes on: X takes the centre
    expect(screen.getByRole('gridcell', { name: 'Row 2, column 2, healthy tooth' })).toBeTruthy();

    fireEvent.click(screen.getByRole('checkbox', { name: /Dental mode/ }));
    expect(boardRoot(container).dataset.dental).toBe('false');
    expect(localStorage.getItem('arcade.dental')).toBe('0');
    expect(screen.getByRole('gridcell', { name: 'Row 2, column 2, X' })).toBeTruthy();
    expect(stat('Points')).toBe('100');
    act(() => vi.advanceTimersByTime(1200));
    expect(loadSession<SavedGame>('tictactoe', 1)?.data).toMatchObject({ points: 100, scores: { x: 1, o: 0, draws: 0 } });
  });

  it('with dental mode off the classic X / O marks are drawn', () => {
    seedMidRound();
    const { container } = render(<TicTacToeGame />);
    expect(boardRoot(container).dataset.dental).toBe('false');
    expect(screen.queryAllByTestId('tictactoe-mark-tooth')).toHaveLength(0);
    expect(screen.getByRole('gridcell', { name: 'Row 3, column 3, O' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: /Dental mode/ })).toHaveProperty('checked', false);
  });

  it('labels the settings row „Fogas mód” in Hungarian and says the marks become teeth', () => {
    applyLang('hu', { silent: true });
    render(<TicTacToeGame />);
    const box = screen.getByRole('checkbox', { name: /Fogas mód/ });
    expect(box.closest('label')?.textContent).toMatch(/fog/i);
  });

  it('I toggles the shared dental mode', () => {
    const { container } = render(<TicTacToeGame />);
    act(() => key('i'));
    expect(boardRoot(container).dataset.dental).toBe('true');
    expect(localStorage.getItem('arcade.dental')).toBe('1');
  });
});

describe('legacy icon-style migration', () => {
  it('an old „tooth” choice turns dental mode on once and the old key is removed', () => {
    localStorage.setItem('tictactoe.iconStyle', 'tooth');
    const { container } = render(<TicTacToeGame />);
    expect(localStorage.getItem('arcade.dental')).toBe('1');
    expect(localStorage.getItem('tictactoe.iconStyle')).toBeNull();
    expect(boardRoot(container).dataset.dental).toBe('true');
  });

  it('never overrides a dental choice that was already made', () => {
    localStorage.setItem('tictactoe.iconStyle', 'tooth');
    localStorage.setItem('arcade.dental', '0');
    const { container } = render(<TicTacToeGame />);
    expect(localStorage.getItem('arcade.dental')).toBe('0');
    expect(localStorage.getItem('tictactoe.iconStyle')).toBeNull();
    expect(boardRoot(container).dataset.dental).toBe('false');
  });

  it('an old „classic” choice just drops the key', () => {
    localStorage.setItem('tictactoe.iconStyle', 'classic');
    render(<TicTacToeGame />);
    expect(localStorage.getItem('arcade.dental')).toBeNull();
    expect(localStorage.getItem('tictactoe.iconStyle')).toBeNull();
  });
});
