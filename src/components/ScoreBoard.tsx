import { formatElapsed } from '../hooks/useElapsedSeconds';
import type { GameState } from '../logic/types';
import { ToothIcon } from './ToothIcon';

export type ScoreBoardProps = {
  state: GameState;
  bestStreak: number;
  elapsedSeconds: number;
};

const statusLabel = (state: GameState): string => {
  if (state.status === 'won') {
    if (state.winner === 'X') return 'Healthy tooth wins!';
    return 'Decayed tooth wins!';
  }
  if (state.status === 'draw') return 'Draw';
  if (state.mode === 'pvp') {
    return state.current === 'X' ? "Healthy's turn" : "Decayed's turn";
  }
  const aiMark = state.humanMark === 'X' ? 'O' : 'X';
  return state.current === aiMark ? 'AI thinking…' : 'Your turn';
};

export const ScoreBoard = ({ state, bestStreak, elapsedSeconds }: ScoreBoardProps) => {
  return (
    <div className="ttt-scoreboard">
      <div className="ttt-score ttt-score-x">
        <span className="ttt-score-icon" aria-hidden="true">
          <ToothIcon variant="healthy" />
        </span>
        <span className="ttt-score-label">Healthy</span>
        <span className="ttt-score-value">{state.scores.x}</span>
      </div>
      <div className="ttt-score ttt-score-draws">
        <span className="ttt-score-label">Draws</span>
        <span className="ttt-score-value">{state.scores.draws}</span>
      </div>
      <div className="ttt-score ttt-score-o">
        <span className="ttt-score-icon" aria-hidden="true">
          <ToothIcon variant="decayed" />
        </span>
        <span className="ttt-score-label">Decayed</span>
        <span className="ttt-score-value">{state.scores.o}</span>
      </div>
      <div className="ttt-meta">
        <span className="ttt-meta-row">
          <span className="ttt-meta-label">Status</span>
          <span className="ttt-meta-value">{statusLabel(state)}</span>
        </span>
        <span className="ttt-meta-row">
          <span className="ttt-meta-label">Streak</span>
          <span className="ttt-meta-value">{state.currentStreak}</span>
        </span>
        <span className="ttt-meta-row">
          <span className="ttt-meta-label">Best</span>
          <span className="ttt-meta-value">{bestStreak}</span>
        </span>
        <span className="ttt-meta-row">
          <span className="ttt-meta-label">Time</span>
          <span className="ttt-meta-value">{formatElapsed(elapsedSeconds)}</span>
        </span>
      </div>
    </div>
  );
};

export default ScoreBoard;
