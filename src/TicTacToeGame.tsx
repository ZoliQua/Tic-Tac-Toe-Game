import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from 'react';
import {
  clearSession,
  DUEL_BASE_POINTS,
  formatClock,
  formatNumber,
  gameName,
  GameOverlay,
  KeyHelp,
  SaveBadge,
  StatPanel,
  useArcadeRun,
  useKitMessages,
  useLang,
  useMessages,
  useRestoredSession,
  useRunTimer,
  useSessionAutosave,
  type ArcadeGameProps,
  type ArcadeStatus,
  type OverlayAction,
} from './arcade';
import { MESSAGES, MODE_KEY, type TicTacToeMessageKey } from './i18n';
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

type T = (key: TicTacToeMessageKey, vars?: Record<string, string | number>) => string;

const keyRows = (t: T): [string, string][] => [
  ['← ↑ → ↓', t('keyMove')],
  [`Enter ${t('kbdSpace')}`, t('keyPlace')],
  ['P Esc', t('keyPause')],
  ['R', t('keyNewRound')],
  ['N 1–4', t('keyMode')],
  ['I', t('keyIcons')],
  ['C', t('keyReset')],
];

const markName = (mark: Mark, iconStyle: IconStyle, t: T): string => {
  if (iconStyle === 'classic') return mark;
  return t(mark === 'X' ? 'healthyTooth' : 'decayedTooth');
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
  const t = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const num = (n: number) => formatNumber(n, lang);
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
    if (aiMark === null) turnLabel = t('toMove', { mark: markName(state.current, iconStyle, t) });
    else turnLabel = t(state.current === aiMark ? 'aiThinking' : 'yourTurn');
  }

  let overlay: { title: string; message: string; actions: OverlayAction[] } | null = null;
  if (confirmOpen) {
    overlay = {
      title: t('resetTitle'),
      message: t('resetBody'),
      actions: [
        { label: t('resetScores'), onClick: confirmReset, primary: true, kbd: 'Enter' },
        { label: t('keep'), onClick: cancelReset, kbd: 'Esc' },
      ],
    };
  } else if (status === 'idle') {
    overlay = {
      title: gameName('tictactoe', lang),
      message: t(state.mode === 'pvp' ? 'idlePvp' : 'idleDuel'),
      actions: [{ label: k('start'), onClick: start, primary: true, kbd: t('kbdSpace') }],
    };
  } else if (status === 'paused') {
    overlay = welcomeBack
      ? {
          title: k('welcomeBack'),
          message: t('welcomeBody', {
            mode: t(MODE_KEY[state.mode]),
            points: num(state.points),
            record: `${num(humanWins)}–${num(aiWins)}–${num(state.scores.draws)}`,
          }),
          actions: [
            { label: t('continue'), onClick: togglePause, primary: true, kbd: 'P' },
            { label: t('newRound'), onClick: newRound, kbd: 'R' },
            { label: t('newMatch'), onClick: newMatch },
          ],
        }
      : {
          title: k('paused'),
          message: t('pausedBody'),
          actions: [
            { label: k('resume'), onClick: togglePause, primary: true, kbd: 'P' },
            { label: t('newRound'), onClick: newRound, kbd: 'R' },
          ],
        };
  } else if (status === 'gameOver' && showResult) {
    const outcome = roundOutcome(state);
    let title: string;
    if (outcome === 'draw') title = t('draw');
    else if (aiMark === null) title = t('markWins', { mark: markName(state.winner as Mark, iconStyle, t) });
    else title = t(outcome === 'win' ? 'youWin' : 'aiWins');
    const message = ranked
      ? t(newBest ? 'roundNewBest' : 'roundRanked', { round: num(state.roundScore), points: num(state.points), best: num(best) })
      : t('roundPvp');
    overlay = {
      title,
      message,
      actions: [{ label: t('nextRound'), onClick: newRound, primary: true, kbd: 'R' }],
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
            <h1 className="arc-game__title">{iconStyle === 'classic' ? gameName('tictactoe', lang) : t('titleTooth')}</h1>
            <p className="arc-game__sub">
              {t(iconStyle === 'classic' ? 'subClassic' : 'subTooth')}
            </p>
          </div>
        </header>
      )}

      <StatPanel
        status={status}
        statusLabel={turnLabel}
        items={[
          { label: t('points'), value: num(state.points) },
          { label: k('best'), value: num(best), highlight: newBest },
          {
            label: t(aiMark === null ? 'tallyPvp' : 'tallyDuel'),
            value: `${num(humanWins)}–${num(aiWins)}–${num(state.scores.draws)}`,
          },
          {
            label: t('streak'),
            value: (
              <>
                {num(state.currentStreak)}
                <small className={styles.sub}> / {num(bestStreak)}</small>
              </>
            ),
          },
          { label: k('time'), value: formatClock(seconds) },
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
            <h2 className="arc-panel__title">{t('panelGame')}</h2>
            <div className={styles.buttons}>
              <button
                type="button"
                className="arc-btn arc-btn--primary"
                onClick={status === 'running' || status === 'paused' ? togglePause : primary}
              >
                {status === 'running'
                  ? k('pause')
                  : status === 'paused'
                    ? k('resume')
                    : status === 'idle'
                      ? k('start')
                      : t('nextRound')}
              </button>
              <button type="button" className="arc-btn" onClick={newRound} disabled={status === 'idle'}>
                {t('newRound')}
              </button>
            </div>
            <button
              type="button"
              className={`arc-btn arc-btn--ghost ${styles.reset}`}
              onClick={() => requestReset(false)}
            >
              {t('resetScores')} <kbd className="arc-kbd">C</kbd>
            </button>
            <div className={styles.save}>
              <SaveBadge savedAt={phase !== 'idle' ? savedAt : null} onDiscard={discardSave} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{t('panelMode')}</h2>
            <ModeSelect mode={state.mode} onChange={changeMode} />
            <p className={styles.note}>
              {state.mode === 'pvp'
                ? t('notePvp')
                : t('noteRanked', { min: num(DUEL_BASE_POINTS[state.mode]), max: num(DUEL_BASE_POINTS[state.mode] * 2) })}
            </p>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{t('panelSettings')}</h2>
            <div className={styles.settings}>
              <IconStyleToggle style={iconStyle} onChange={setIconStyle} />
              <AISpeedToggle speed={aiSpeed} onChange={setAISpeed} />
              <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{t('panelKeys')}</h2>
            <KeyHelp rows={keyRows(t)} />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default TicTacToeGame;
