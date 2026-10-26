import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from 'react';
import {
  clearSession,
  DUEL_BASE_POINTS,
  formatClock,
  GameOverlay,
  KeyHelp,
  SaveBadge,
  StatPanel,
  useArcadeRun,
  useRestoredSession,
  useRunTimer,
  useSessionAutosave,
  type ArcadeGameProps,
  type ArcadeStatus,
  type OverlayAction,
} from './arcade';
import { AISpeedToggle } from './components/AISpeedToggle';
import { GameBoard } from './components/GameBoard';
import { IconStyleToggle } from './components/IconStyleToggle';
import { ModeSelect } from './components/ModeSelect';
import { SoundToggle } from './components/SoundToggle';
import { useAIDelay } from './hooks/useAIDelay';
import { useAITurn } from './hooks/useAITurn';
import { readBestStreaks, useBestStreaks } from './hooks/useBestStreak';
import { useIconStyle, type IconStyle } from './hooks/useIconStyle';
import { useKeyboardSelect } from './hooks/useKeyboardSelect';
import { useSound } from './hooks/useSound';
import { advanceGame, aiMarkFor, createInitialState, MODES, roundOutcome } from './logic/game';
import { moveFocus } from './logic/grid';
import { isTicTacToeSession } from './logic/persist';
import type { GameAction, GameState, Mark, Mode, SavedGame } from './logic/types';
import styles from './App.module.css';

/** Bump when SavedGame changes shape; older saves are then discarded. */
const SESSION_SCHEMA = 1;

/** Lets the winning strike play before the result card covers the board. */
export const RESULT_DELAY_MS = 900;

/**
 * UI phase layered on top of the engine's round status:
 * `idle` before the first round of a visit, `live` while a round is on (or
 * just finished), `paused` while the round is suspended.
 */
type Phase = 'idle' | 'live' | 'paused';

const KEYS: [string, string][] = [
  ['← ↑ → ↓', 'Move cursor (or WASD)'],
  ['Enter Space', 'Place · start · next round'],
  ['P Esc', 'Pause / resume'],
  ['R', 'New round'],
  ['N 1–4', 'Cycle / pick mode'],
  ['I', 'Teeth ↔ X/O marks'],
  ['C', 'Reset match scores'],
];

const markName = (mark: Mark, iconStyle: IconStyle): string => {
  if (iconStyle === 'classic') return mark;
  return mark === 'X' ? 'Healthy tooth' : 'Decayed tooth';
};

// Best streaks are all-time records with their own storage, not session data.
const toSaved = ({ bestStreaks, ...rest }: GameState): SavedGame => {
  void bestStreaks;
  return rest;
};

const reducer = (state: GameState, action: GameAction): GameState =>
  advanceGame(state, action, { rng: Math.random });

export function TicTacToeGame(props: ArcadeGameProps = {}) {
  const { embedded = false } = props;
  const restored = useRestoredSession<SavedGame>('tictactoe', SESSION_SCHEMA, isTicTacToeSession);
  // A restored round that was still being played resumes exactly; a finished
  // one is not replayed (it is already recorded) — the match goes on with a new round.
  const restoredInProgress = restored !== null && restored.data.status === 'playing';

  const [state, dispatch] = useReducer(reducer, undefined, (): GameState => {
    const bestStreaks = readBestStreaks();
    // Ranked by default: the arcade scores rounds against the AI; PvP is one key away.
    if (!restored) return createInitialState({ bestStreaks, mode: 'medium' });
    const loaded: GameState = { ...restored.data, bestStreaks };
    return restoredInProgress ? loaded : advanceGame(loaded, { type: 'newRound' }, { rng: Math.random });
  });
  const [phase, setPhase] = useState<Phase>(restored ? 'paused' : 'idle');
  const [runKey, setRunKey] = useState(0);
  const [welcomeBack, setWelcomeBack] = useState(restored !== null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const { style: iconStyle, setStyle: setIconStyle, toggle: toggleIconStyle } = useIconStyle();
  const { speed: aiSpeed, delayMs: aiDelay, setSpeed: setAISpeed } = useAIDelay();
  const sound = useSound();
  useBestStreaks(state.bestStreaks);

  const roundOver = state.status !== 'playing';
  const status: ArcadeStatus =
    phase === 'idle' ? 'idle' : roundOver ? 'gameOver' : phase === 'paused' ? 'paused' : 'running';
  const running = status === 'running';
  const ranked = state.mode !== 'pvp';

  const seconds = useRunTimer(running, runKey, runKey === 0 && restoredInProgress ? (restored?.seconds ?? 0) : 0);

  const stats = useArcadeRun({
    gameId: 'tictactoe',
    status,
    score: state.roundScore,
    seconds,
    runKey,
    outcome: () => roundOutcome(state),
    ranked,
    props,
  });

  const saved = useMemo(() => toSaved(state), [state]);
  const savedAt = useSessionAutosave({
    gameId: 'tictactoe',
    schema: SESSION_SCHEMA,
    // The whole match (board, scores, streak, points) is the session: it is
    // kept between rounds and only dropped on an explicit discard.
    enabled: phase !== 'idle',
    discard: phase === 'idle',
    data: saved,
    seconds,
    score: state.points,
  });

  const aiMark = aiMarkFor(state);
  const humanTurn = aiMark === null || state.current !== aiMark;
  useAITurn(state, dispatch, aiDelay, running && !confirmOpen);

  // Sound: a click per placed mark, a chime when a round ends.
  const lastMovesRef = useRef(state.moveCount);
  const lastStatusRef = useRef(state.status);
  useEffect(() => {
    if (state.moveCount > lastMovesRef.current) sound.click();
    lastMovesRef.current = state.moveCount;
  }, [state.moveCount, sound]);
  useEffect(() => {
    if (lastStatusRef.current === 'playing') {
      if (state.status === 'won') sound.win();
      else if (state.status === 'draw') sound.draw();
    }
    lastStatusRef.current = state.status;
  }, [state.status, sound]);

  useEffect(() => {
    if (!roundOver) {
      setShowResult(false);
      return;
    }
    const id = window.setTimeout(() => setShowResult(true), RESULT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [roundOver, runKey]);

  // ── Actions ────────────────────────────────────────────────
  const beginRound = useCallback((action: GameAction | null) => {
    if (action) dispatch(action);
    setWelcomeBack(false);
    setConfirmOpen(false);
    setPhase('live');
    setRunKey((k) => k + 1);
  }, []);

  const start = useCallback(() => {
    // The idle state already holds a fresh round; just open it.
    beginRound(null);
  }, [beginRound]);

  const newRound = useCallback(() => {
    if (phase === 'idle') beginRound(null);
    else beginRound({ type: 'newRound' });
  }, [phase, beginRound]);

  const togglePause = useCallback(() => {
    if (roundOver) return;
    setWelcomeBack(false);
    setPhase((p) => (p === 'live' ? 'paused' : p === 'paused' ? 'live' : p));
  }, [roundOver]);

  const changeMode = useCallback(
    (mode: Mode) => {
      if (mode === state.mode) return;
      dispatch({ type: 'changeMode', mode });
      // In idle the new mode simply waits for Start; otherwise a new match begins.
      if (phase !== 'idle') beginRound(null);
    },
    [state.mode, phase, beginRound],
  );

  const newMatch = useCallback(() => {
    dispatch({ type: 'resetScores' });
    beginRound({ type: 'newRound' });
  }, [beginRound]);

  const requestReset = useCallback(
    (skipConfirm: boolean) => {
      const hasScores =
        state.scores.x > 0 || state.scores.o > 0 || state.scores.draws > 0 || state.currentStreak > 0 || state.points > 0;
      if (!hasScores) return;
      if (skipConfirm) dispatch({ type: 'resetScores' });
      else setConfirmOpen(true);
    },
    [state.scores, state.currentStreak, state.points],
  );
  const confirmReset = useCallback(() => {
    dispatch({ type: 'resetScores' });
    setConfirmOpen(false);
  }, []);
  const cancelReset = useCallback(() => setConfirmOpen(false), []);

  const discardSave = useCallback(() => {
    clearSession('tictactoe');
    setWelcomeBack(false);
    setConfirmOpen(false);
    // Re-entering the same mode clears the board, scores, streak and points.
    dispatch({ type: 'changeMode', mode: state.mode });
    setPhase('idle');
    setRunKey((k) => k + 1);
  }, [state.mode]);

  const place = useCallback(
    (index: number) => {
      if (status !== 'running' || !humanTurn) return;
      dispatch({ type: 'place', index });
    },
    [status, humanTurn],
  );
  const focusCell = useCallback((index: number) => dispatch({ type: 'focus', index }), []);

  const primary = useCallback(() => {
    if (status === 'idle') start();
    else if (status === 'gameOver') newRound();
    else if (status === 'paused') togglePause();
    else place(state.focusIndex);
  }, [status, start, newRound, togglePause, place, state.focusIndex]);

  useKeyboardSelect({
    confirmOpen,
    onConfirm: confirmReset,
    onCancel: cancelReset,
    onMove: (direction) => {
      if (status === 'running') focusCell(moveFocus(state.focusIndex, direction));
    },
    onPrimary: primary,
    onTogglePause: togglePause,
    onRestart: newRound,
    onCycleMode: () => changeMode(MODES[(MODES.indexOf(state.mode) + 1) % MODES.length]),
    onModeIndex: (i) => changeMode(MODES[i]),
    onToggleIcons: toggleIconStyle,
    onResetScores: requestReset,
  });

  // ── View ───────────────────────────────────────────────────
  const best = Math.max(stats.best, ranked ? state.roundScore : 0);
  const newBest = ranked && state.roundScore > 0 && state.roundScore > stats.bestBeforeRun;
  const bestStreak = state.bestStreaks[state.mode];
  const humanWins = state.humanMark === 'X' ? state.scores.x : state.scores.o;
  const aiWins = state.humanMark === 'X' ? state.scores.o : state.scores.x;

  let turnLabel: string | undefined;
  if (status === 'running') {
    if (aiMark === null) turnLabel = `${markName(state.current, iconStyle)} to move`;
    else turnLabel = state.current === aiMark ? 'AI thinking…' : 'Your turn';
  }

  let overlay: { title: string; message: string; actions: OverlayAction[] } | null = null;
  if (confirmOpen) {
    overlay = {
      title: 'Reset match scores?',
      message: 'This clears wins, losses, draws, points and your current streak. Best streaks and arcade stats stay.',
      actions: [
        { label: 'Reset scores', onClick: confirmReset, primary: true, kbd: 'Enter' },
        { label: 'Keep', onClick: cancelReset, kbd: 'Esc' },
      ],
    };
  } else if (status === 'idle') {
    overlay = {
      title: 'Tic-Tac-Toe',
      message:
        state.mode === 'pvp'
          ? 'Two players, one board: get three in a row. PvP rounds are just for fun (unranked).'
          : 'Three in a row beats the AI. Faster wins and harder AIs score more points.',
      actions: [{ label: 'Start', onClick: start, primary: true, kbd: 'Space' }],
    };
  } else if (status === 'paused') {
    overlay = welcomeBack
      ? {
          title: 'Welcome back',
          message: `Your ${state.mode === 'pvp' ? 'PvP' : state.mode} match was restored — ${state.points} points, ${humanWins}–${aiWins}–${state.scores.draws}.`,
          actions: [
            { label: 'Continue', onClick: togglePause, primary: true, kbd: 'P' },
            { label: 'New round', onClick: newRound, kbd: 'R' },
            { label: 'New match', onClick: newMatch },
          ],
        }
      : {
          title: 'Paused',
          message: 'Your match is autosaved — you can close the tab and continue later.',
          actions: [
            { label: 'Resume', onClick: togglePause, primary: true, kbd: 'P' },
            { label: 'New round', onClick: newRound, kbd: 'R' },
          ],
        };
  } else if (status === 'gameOver' && showResult) {
    const outcome = roundOutcome(state);
    let title: string;
    if (outcome === 'draw') title = "It's a draw";
    else if (aiMark === null) title = `${markName(state.winner as Mark, iconStyle)} wins!`;
    else title = outcome === 'win' ? 'You win!' : 'The AI wins';
    const message = ranked
      ? `+${state.roundScore} points · Match ${state.points} · Best ${best}${newBest ? ' — new best!' : ''}`
      : 'PvP rounds are unranked. Loser opens the next round.';
    overlay = {
      title,
      message,
      actions: [{ label: 'Next round', onClick: newRound, primary: true, kbd: 'R' }],
    };
  }

  return (
    <div
      className={`arc-game ${styles.game}`}
      style={{ '--game-color': 'var(--game-tictactoe)' } as CSSProperties}
    >
      {!embedded && (
        <header className="arc-game__head">
          <div>
            <h1 className="arc-game__title">{iconStyle === 'classic' ? 'Tic-Tac-Toe' : 'Tooth Tac Toe'}</h1>
            <p className="arc-game__sub">
              {iconStyle === 'classic'
                ? 'Classic X / O — the hard AI never loses.'
                : 'Healthy vs decayed — the hard AI never loses.'}
            </p>
          </div>
        </header>
      )}

      <StatPanel
        status={status}
        statusLabel={turnLabel}
        items={[
          { label: 'Points', value: state.points },
          { label: 'Best', value: best, highlight: newBest },
          {
            label: aiMark === null ? 'X–O–D' : 'W–L–D',
            value: `${humanWins}–${aiWins}–${state.scores.draws}`,
          },
          {
            label: 'Streak',
            value: (
              <>
                {state.currentStreak}
                <small className={styles.sub}> / {bestStreak}</small>
              </>
            ),
          },
          { label: 'Time', value: formatClock(seconds) },
        ]}
      />

      <div className={styles.layout}>
        <div className={`arc-game__board ${styles.boardWrap}`}>
          <GameBoard
            board={state.board}
            winningLine={state.winningLine}
            iconStyle={iconStyle}
            focusIndex={state.focusIndex}
            interactive={running && humanTurn && !confirmOpen}
            draw={state.status === 'draw'}
            onSelect={place}
            onFocusCell={focusCell}
          />
          {overlay && <GameOverlay {...overlay} />}
        </div>

        <aside className={styles.side}>
          <section className="arc-panel">
            <h2 className="arc-panel__title">Game</h2>
            <div className={styles.buttons}>
              <button
                type="button"
                className="arc-btn arc-btn--primary"
                onClick={status === 'running' || status === 'paused' ? togglePause : primary}
              >
                {status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : status === 'idle' ? 'Start' : 'Next round'}
              </button>
              <button type="button" className="arc-btn" onClick={newRound} disabled={status === 'idle'}>
                New round
              </button>
            </div>
            <button
              type="button"
              className={`arc-btn arc-btn--ghost ${styles.reset}`}
              onClick={() => requestReset(false)}
            >
              Reset scores <kbd className="arc-kbd">C</kbd>
            </button>
            <div className={styles.save}>
              <SaveBadge savedAt={phase !== 'idle' ? savedAt : null} onDiscard={discardSave} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Mode</h2>
            <ModeSelect mode={state.mode} onChange={changeMode} />
            <p className={styles.note}>
              {state.mode === 'pvp'
                ? 'Two players on one device. Unranked — rounds count as plays only.'
                : `Ranked: a win pays ${DUEL_BASE_POINTS[state.mode]}–${DUEL_BASE_POINTS[state.mode] * 2} (faster wins pay more), a draw a quarter. Changing mode starts a new match.`}
            </p>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Settings</h2>
            <div className={styles.settings}>
              <IconStyleToggle style={iconStyle} onChange={setIconStyle} />
              <AISpeedToggle speed={aiSpeed} onChange={setAISpeed} />
              <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Keys</h2>
            <KeyHelp rows={KEYS} />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default TicTacToeGame;
