import { useCallback, useReducer, useRef } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { IconStyleToggle } from './components/IconStyleToggle';
import { ModeSelect } from './components/ModeSelect';
import { Overlay } from './components/Overlay';
import { ScoreBoard } from './components/ScoreBoard';
import { useAITurn } from './hooks/useAITurn';
import { useBestStreak } from './hooks/useBestStreak';
import { useElapsedSeconds } from './hooks/useElapsedSeconds';
import { useIconStyle } from './hooks/useIconStyle';
import { useKeyboardSelect } from './hooks/useKeyboardSelect';
import { STORAGE_KEY_BEST } from './logic/constants';
import { advanceGame, createInitialState } from './logic/game';
import type { GameAction, GameState, Mode } from './logic/types';
import './styles/ttt.css';

const readBestStreak = (): number => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_BEST);
    if (raw === null) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
};

const init = (): GameState => createInitialState({ bestStreak: readBestStreak() });

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

  const bestStreak = useBestStreak(state.currentStreak);
  const isHumanTurn = state.mode === 'pvp' || state.current === state.humanMark;
  const roundKey = `${state.mode}-${state.startingMark}-${state.scores.x + state.scores.o + state.scores.draws}`;
  const elapsed = useElapsedSeconds(state.status, roundKey);

  useAITurn(state, dispatch);
  useKeyboardSelect({ state, dispatch, onToggleIconStyle: toggleIconStyle });

  const handleModeChange = (mode: Mode) => dispatch({ type: 'changeMode', mode });
  const handleNewRound = () => dispatch({ type: 'newRound' });
  const handleResetScores = () => dispatch({ type: 'resetScores' });

  const effectiveBest = Math.max(bestStreak, state.bestStreak);

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

        <main className="ttt-main">
          <ScoreBoard
            state={state}
            bestStreak={effectiveBest}
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
              <kbd className="ttt-kbd">Esc</kbd> reset scores
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TicTacToeGame;
