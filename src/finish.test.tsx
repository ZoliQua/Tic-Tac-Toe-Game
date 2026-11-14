import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, loadSession } from './arcade';
import { TicTacToeGame } from './TicTacToeGame';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  applyLang('en', { silent: true });
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const finishBtn = () => screen.queryByRole('button', { name: 'Befejezés' });
const filled = () => screen.getAllByRole('gridcell').filter((c) => !/üres/.test(c.getAttribute('aria-label') ?? ''));

describe('Tic-Tac-Toe finish early', () => {
  it('is hidden before the run starts and visible after the first move', () => {
    render(<TicTacToeGame />);
    expect(finishBtn()).toBeNull();
    act(() => key(' '));
    act(() => key('Enter'));
    expect(finishBtn()).toBeTruthy();
  });

  it('confirms with the round score, ranks it once and shows the finished card', () => {
    localStorage.setItem('tictactoe.aiSpeed', 'instant');
    const onGameOver = vi.fn();
    render(<TicTacToeGame onGameOver={onGameOver} />);
    act(() => key(' '));
    act(() => key('Enter'));
    fireEvent.click(finishBtn()!);
    expect(screen.getByRole('alertdialog').textContent).toContain('0 pont kerül a ranglistára');
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(0, { finished: true });
    expect(screen.getByRole('dialog', { name: 'Idő előtt befejezve' })).toBeTruthy();
    expect(loadSession('tictactoe', 1)).toBeNull();
    act(() => vi.advanceTimersByTime(3000));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(loadSession('tictactoe', 1)).toBeNull();
  });

  it('Cancel changes nothing', () => {
    const onGameOver = vi.fn();
    render(<TicTacToeGame onGameOver={onGameOver} />);
    act(() => key('1'));
    act(() => key(' '));
    act(() => key('Enter'));
    fireEvent.click(finishBtn()!);
    fireEvent.click(screen.getByRole('button', { name: 'Mégse' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onGameOver).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(filled()).toHaveLength(1);
  });

  it('stops the AI while the confirm is open', () => {
    localStorage.setItem('tictactoe.aiSpeed', 'fast');
    render(<TicTacToeGame />);
    act(() => key('2'));
    act(() => key(' '));
    act(() => key('Enter'));
    fireEvent.click(finishBtn()!);
    act(() => vi.advanceTimersByTime(3000));
    expect(filled()).toHaveLength(1);
  });

  it('a finished round does not accept moves; the next round starts clean', () => {
    render(<TicTacToeGame />);
    act(() => key('1'));
    act(() => key(' '));
    act(() => key('Enter'));
    fireEvent.click(finishBtn()!);
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    act(() => key('ArrowLeft'));
    act(() => key('Enter')); // new round via primary
    expect(filled()).toHaveLength(0);
    expect(finishBtn()).toBeTruthy(); // the new round is live
    act(() => key('Enter'));
    expect(filled()).toHaveLength(1);
  });
});
