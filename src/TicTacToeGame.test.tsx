import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { duelRoundScore, loadSession, readStats, saveSession } from './arcade';
import { TicTacToeDemo } from './demo/TicTacToeDemo';
import { createInitialState } from './logic/game';
import type { Board, SavedGame } from './logic/types';
import { RESULT_DELAY_MS, TicTacToeGame } from './TicTacToeGame';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const board = (cells: string): Board =>
  cells.split('').map((c) => (c === 'X' || c === 'O' ? c : null)) as unknown as Board;
const saved = (patch: Partial<SavedGame>): SavedGame => {
  const { bestStreaks, ...rest } = createInitialState({ mode: 'easy' });
  void bestStreaks;
  return { ...rest, ...patch };
};
const filledCells = () => screen.getAllByRole('gridcell').filter((c) => !/empty$/.test(c.getAttribute('aria-label') ?? ''));

describe('<TicTacToeGame />', () => {
  it('starts with Space, pauses with P / Esc and reports status to the host', () => {
    const onStatusChange = vi.fn();
    render(<TicTacToeGame onStatusChange={onStatusChange} />);
    expect(screen.getByRole('dialog', { name: 'Tic-Tac-Toe' })).toBeTruthy();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'idle' }));
    act(() => key(' '));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'running', score: 0 }));
    act(() => key('p'));
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeTruthy();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'paused' }));
    act(() => key('Escape'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('pause blocks the board and the AI', () => {
    localStorage.setItem('tictactoe.aiSpeed', 'fast');
    render(<TicTacToeGame />);
    act(() => key('2')); // Easy
    act(() => key(' ')); // start
    act(() => key('Enter')); // human places in the centre
    expect(filledCells()).toHaveLength(1);
    act(() => key('p'));
    act(() => vi.advanceTimersByTime(2000));
    expect(filledCells()).toHaveLength(1); // AI frozen while paused
    act(() => key('Enter')); // resumes instead of placing
    act(() => vi.advanceTimersByTime(200));
    expect(filledCells()).toHaveLength(2);
  });

  it('autosaves the match and restores it paused with Welcome back', () => {
    const { unmount } = render(<TicTacToeGame />);
    act(() => key('1')); // PvP, so no AI reply changes the mark count
    act(() => key(' '));
    act(() => key('Enter'));
    act(() => vi.advanceTimersByTime(1200));
    unmount();
    const env = loadSession<SavedGame>('tictactoe', 1);
    expect(env?.data).toMatchObject({ mode: 'pvp', moveCount: 1, status: 'playing' });

    render(<TicTacToeGame embedded />);
    expect(screen.getByRole('dialog', { name: 'Welcome back' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(filledCells()).toHaveLength(1);
  });

  it('a finished ranked round calls onGameOver once, records stats and keeps the match', () => {
    const onGameOver = vi.fn();
    const onRunEnd = vi.fn();
    // Easy mode, X (human) to move with a win in one at cell 2; 100 match points so far.
    saveSession('tictactoe', {
      schema: 1,
      data: saved({ board: board('XX.OO....'), moveCount: 4, focusIndex: 2, points: 100, scores: { x: 1, o: 0, draws: 0 } }),
      seconds: 12,
      score: 100,
    });
    render(<TicTacToeGame onGameOver={onGameOver} onRunEnd={onRunEnd} />);
    act(() => key('p'));
    act(() => key('Enter'));
    const expected = duelRoundScore({ outcome: 'win', difficulty: 'easy', moves: 5, boardCells: 9 });
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(expected);
    expect(onRunEnd).toHaveBeenCalledWith({ score: expected, seconds: 12, outcome: 'win', ranked: true });
    expect(readStats('tictactoe')).toMatchObject({ best: expected, plays: 1, wins: 1 });

    act(() => vi.advanceTimersByTime(RESULT_DELAY_MS));
    expect(screen.getByRole('dialog', { name: 'You win!' })).toBeTruthy();
    act(() => vi.advanceTimersByTime(1200));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    // The match (scores + points) survives the round end in the session.
    expect(loadSession<SavedGame>('tictactoe', 1)?.data).toMatchObject({ points: 100 + expected, scores: { x: 2 } });

    act(() => key('r'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(filledCells()).toHaveLength(0);
  });

  it('PvP rounds are unranked: no onGameOver, no Best', () => {
    const onGameOver = vi.fn();
    const onRunEnd = vi.fn();
    render(<TicTacToeGame onGameOver={onGameOver} onRunEnd={onRunEnd} />);
    act(() => key('1')); // PvP
    act(() => key(' '));
    const cells = screen.getAllByRole('gridcell');
    for (const i of [0, 3, 1, 4, 2]) act(() => fireEvent.click(cells[i]));
    expect(onRunEnd).toHaveBeenCalledWith(expect.objectContaining({ ranked: false, score: 0, outcome: 'win' }));
    expect(onGameOver).not.toHaveBeenCalled();
    expect(readStats('tictactoe')).toMatchObject({ best: 0, plays: 1 });
  });

  it('C asks before resetting the match; Esc keeps it', () => {
    saveSession('tictactoe', { schema: 1, data: saved({ points: 300, scores: { x: 2, o: 1, draws: 0 } }), seconds: 0, score: 300 });
    render(<TicTacToeGame />);
    act(() => key('p'));
    act(() => key('c'));
    expect(screen.getByRole('dialog', { name: 'Reset match scores?' })).toBeTruthy();
    act(() => key('Escape'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('2–1–0')).toBeTruthy();
    act(() => key('c'));
    act(() => key('Enter'));
    expect(screen.getByText('0–0–0')).toBeTruthy();
  });

  it('ignores hotkeys while typing in a field and leaves T to the theme', () => {
    render(
      <>
        <input aria-label="nick" />
        <TicTacToeGame />
      </>,
    );
    const input = screen.getByLabelText('nick');
    act(() => {
      fireEvent.keyDown(input, { key: ' ' });
      fireEvent.keyDown(input, { key: '4' });
    });
    expect(screen.getByRole('dialog', { name: 'Tic-Tac-Toe' })).toBeTruthy();
    // Opens in Medium; the '4' typed into the field must not switch to Hard.
    expect(screen.getByRole('button', { name: 'Medium' }).getAttribute('aria-pressed')).toBe('true');
    act(() => key('t'));
    expect(localStorage.getItem('arcade.dental')).toBeNull();
    act(() => key('i')); // I toggles the shared dental mode (teeth ↔ X/O)
    expect(localStorage.getItem('arcade.dental')).toBe('1');
  });
});

describe('<TicTacToeDemo />', () => {
  it('plays by itself, loops rounds, and writes nothing', () => {
    const { container } = render(<TicTacToeDemo />);
    const marks = () => container.querySelectorAll('svg path, span').length;
    expect(container.querySelector('.arc-demo')).toBeTruthy();
    expect(container.querySelector('button, [tabindex]')).toBeNull();
    expect(marks()).toBe(0);
    act(() => vi.advanceTimersByTime(1300));
    expect(marks()).toBeGreaterThan(0);
    act(() => vi.advanceTimersByTime(20_000)); // several full rounds
    expect(readStats('tictactoe').plays).toBe(0);
    expect(localStorage.length).toBe(0);
  });

  it('freezes when inactive', () => {
    const { container } = render(<TicTacToeDemo active={false} />);
    act(() => vi.advanceTimersByTime(5000));
    expect(container.querySelectorAll('svg path, span').length).toBe(0);
  });
});
