import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AISpeedToggle } from './components/AISpeedToggle';
import { ConfirmDialog } from './components/ConfirmDialog';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { IconStyleToggle } from './components/IconStyleToggle';
import { ModeSelect } from './components/ModeSelect';
import { Overlay } from './components/Overlay';
import { ScoreBoard } from './components/ScoreBoard';
import { SoundToggle } from './components/SoundToggle';
import { useAIDelay } from './hooks/useAIDelay';
import { useAITurn } from './hooks/useAITurn';
import { readBestStreaks, useBestStreaks } from './hooks/useBestStreak';
import { useElapsedSeconds } from './hooks/useElapsedSeconds';
import { useIconStyle } from './hooks/useIconStyle';
import { useKeyboardSelect } from './hooks/useKeyboardSelect';
import { useSound } from './hooks/useSound';
import { advanceGame, createInitialState } from './logic/game';
import type { GameAction, GameState, Mode } from './logic/types';
import './styles/ttt.css';

const init = (): GameState => createInitialState({ bestStreaks: readBestStreaks() });

export const TicTacToeGame = () => {
  const rngRef = useRef<() => number>(Math.random);
  const reducer = useCallback(
    (state: GameState, action: GameAction): GameState =>
      advanceGame(state, action, { rng: rngRef.current }),
    [],
  );

  const [state, dispatch] = useReducer(reducer, undefined, init);

  const { style: iconStyle, setStyle: setIconStyle, toggle: toggleIconStyle } =
    useIconStyle();
  const { speed: aiSpeed, delayMs: aiDelay, setSpeed: setAISpeed } = useAIDelay();
  const sound = useSound();

  // Persist best streaks to localStorage when state.bestStreaks changes.
  useBestStreaks(state.bestStreaks);

  const isHumanTurn = state.mode === 'pvp' || state.current === state.humanMark;
  const roundKey = `${state.mode}-${state.startingMark}-${state.scores.x + state.scores.o + state.scores.draws}`;
  const elapsed = useElapsedSeconds(state.status, roundKey);

  // C5 — sound: click on placement, win/draw chimes on round end.
  const lastMoveCountRef = useRef(state.moveCount);
  const lastStatusRef = useRef(state.status);
  useEffect(() => {
    if (state.moveCount > lastMoveCountRef.current) {
      sound.click();
    }
    lastMoveCountRef.current = state.moveCount;
  }, [state.moveCount, sound]);

  useEffect(() => {
    const prev = lastStatusRef.current;
    if (prev === 'playing') {
      if (state.status === 'won') sound.win();
      else if (state.status === 'draw') sound.draw();
    }
    lastStatusRef.current = state.status;
  }, [state.status, sound]);

  // C4 — Esc confirmation dialog.
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const requestReset = useCallback(() => {
    const hasScores =
      state.scores.x > 0 ||
      state.scores.o > 0 ||
      state.scores.draws > 0 ||
      state.currentStreak > 0;
    if (!hasScores) return; // nothing to confirm
    setConfirmResetOpen(true);
  }, [state.scores.x, state.scores.o, state.scores.draws, state.currentStreak]);
  const confirmReset = useCallback(() => {
    dispatch({ type: 'resetScores' });
    setConfirmResetOpen(false);
  }, []);
  const cancelReset = useCallback(() => setConfirmResetOpen(false), []);

  useAITurn(state, dispatch, aiDelay);
  useKeyboardSelect({
    state,
    dispatch,
    onResetRequested: requestReset,
    onToggleIconStyle: toggleIconStyle,
  });

  const handleModeChange = (mode: Mode) => dispatch({ type: 'changeMode', mode });
  const handleNewRound = () => dispatch({ type: 'newRound' });
  const handleResetScores = () => requestReset();

  const bestStreakForMode = state.bestStreaks[state.mode];

  return (
    <div className="ttt-app" data-mode={state.mode} data-icon-style={iconStyle}>
      <div className="ttt-shell">
        <header className="ttt-header">
          <div className="ttt-header-row">
            <h1 className="ttt-title">
              <span className="ttt-title-icon" aria-hidden="true">
                {iconStyle === 'classic' ? '✕◯' : '🦷'}
              </span>
              {iconStyle === 'classic' ? 'Tic-Tac-Toe' : 'Tooth Tac Toe'}
            </h1>
            <IconStyleToggle style={iconStyle} onChange={setIconStyle} />
          </div>
          <p className="ttt-subtitle">
            {iconStyle === 'classic'
              ? 'Classic X / O — minimax-hard, keyboard-first.'
              : 'Healthy vs decayed — minimax-hard, keyboard-first.'}
          </p>
        </header>

        <ModeSelect mode={state.mode} onChange={handleModeChange} />

        <div className="ttt-settings-row">
          <AISpeedToggle speed={aiSpeed} onChange={setAISpeed} />
          <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />
        </div>

        <main className="ttt-main">
          <ScoreBoard
            state={state}
            bestStreak={bestStreakForMode}
            elapsedSeconds={elapsed}
            iconStyle={iconStyle}
          />

          <div className="ttt-board-frame">
            <GameBoard
              state={state}
              dispatch={dispatch}
              isHumanTurn={isHumanTurn}
              iconStyle={iconStyle}
            />
            <Overlay
              state={state}
              iconStyle={iconStyle}
              onNewRound={handleNewRound}
            />
          </div>

          <GameControls
            onNewRound={handleNewRound}
            onResetScores={handleResetScores}
          />

          <div className="ttt-help">
            <p>
              <kbd className="ttt-kbd">↑↓←→</kbd> / <kbd className="ttt-kbd">WASD</kbd> move ·{' '}
              <kbd className="ttt-kbd">Enter</kbd>/<kbd className="ttt-kbd">Space</kbd> place ·{' '}
              <kbd className="ttt-kbd">R</kbd> new round ·{' '}
              <kbd className="ttt-kbd">N</kbd> cycle mode ·{' '}
              <kbd className="ttt-kbd">1–4</kbd> jump mode ·{' '}
              <kbd className="ttt-kbd">T</kbd> toggle icons ·{' '}
              <kbd className="ttt-kbd">Esc</kbd> reset scores ·{' '}
              <kbd className="ttt-kbd">Shift+Esc</kbd> reset (no confirm)
            </p>
          </div>
        </main>

        <ConfirmDialog
          open={confirmResetOpen}
          title="Reset session scores?"
          message="This clears X / O / draws and your current streak. Your best streak per mode is preserved."
          confirmLabel="Reset scores"
          cancelLabel="Keep"
          onConfirm={confirmReset}
          onCancel={cancelReset}
        />
      </div>
    </div>
  );
};

export default TicTacToeGame;
