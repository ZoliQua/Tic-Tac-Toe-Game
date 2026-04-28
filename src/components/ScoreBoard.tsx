import { formatElapsed } from '../hooks/useElapsedSeconds';
import type { IconStyle } from '../hooks/useIconStyle';
import type { GameState, Mark } from '../logic/types';
import { ToothIcon } from './ToothIcon';

export type ScoreBoardProps = {
  state: GameState;
  bestStreak: number;
  elapsedSeconds: number;
  iconStyle: IconStyle;
};

const markName = (mark: Mark, iconStyle: IconStyle): string => {
  if (iconStyle === 'classic') return mark;
  return mark === 'X' ? 'Healthy' : 'Decayed';
};

const winLabel = (winner: Mark, iconStyle: IconStyle): string =>
  iconStyle === 'classic'
    ? `${winner} wins!`
    : winner === 'X' ? 'Healthy tooth wins!' : 'Decayed tooth wins!';

const turnLabel = (state: GameState, iconStyle: IconStyle): string => {
  if (state.status === 'won' && state.winner) return winLabel(state.winner, iconStyle);
  if (state.status === 'draw') return 'Draw';
  if (state.mode === 'pvp') {
    return `${markName(state.current, iconStyle)}'s turn`;
  }
  const aiMark: Mark = state.humanMark === 'X' ? 'O' : 'X';
  return state.current === aiMark ? 'AI thinking…' : 'Your turn';
};

const MarkIcon = ({ mark, iconStyle }: { mark: Mark; iconStyle: IconStyle }) => {
  if (iconStyle === 'classic') {
    return <span className={`ttt-score-mark ttt-mark-${mark.toLowerCase()}`}>{mark}</span>;
  }
  return <ToothIcon variant={mark === 'X' ? 'healthy' : 'decayed'} />;
};

export const ScoreBoard = ({
  state,
  bestStreak,
  elapsedSeconds,
  iconStyle,
}: ScoreBoardProps) => {
  return (
    <div className="ttt-scoreboard">
      <div className="ttt-score ttt-score-x">
        <span className="ttt-score-icon" aria-hidden="true">
          <MarkIcon mark="X" iconStyle={iconStyle} />
        </span>
        <span className="ttt-score-label">{markName('X', iconStyle)}</span>
        <span className="ttt-score-value">{state.scores.x}</span>
      </div>
      <div className="ttt-score ttt-score-draws">
        <span className="ttt-score-label">Draws</span>
        <span className="ttt-score-value">{state.scores.draws}</span>
      </div>
      <div className="ttt-score ttt-score-o">
        <span className="ttt-score-icon" aria-hidden="true">
          <MarkIcon mark="O" iconStyle={iconStyle} />
        </span>
        <span className="ttt-score-label">{markName('O', iconStyle)}</span>
        <span className="ttt-score-value">{state.scores.o}</span>
      </div>
      <div className="ttt-meta">
        <span className="ttt-meta-row">
          <span className="ttt-meta-label">Status</span>
          <span className="ttt-meta-value">{turnLabel(state, iconStyle)}</span>
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
