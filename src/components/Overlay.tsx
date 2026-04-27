import type { GameState } from '../logic/types';
import { ToothIcon } from './ToothIcon';

export type OverlayProps = {
  state: GameState;
  onNewRound: () => void;
};

export const Overlay = ({ state, onNewRound }: OverlayProps) => {
  if (state.status !== 'won' && state.status !== 'draw') return null;

  const isWin = state.status === 'won';
  const winnerVariant = state.winner === 'O' ? 'decayed' : 'healthy';
  const title = isWin
    ? state.winner === 'X' ? 'Healthy tooth wins!' : 'Decayed tooth wins!'
    : "It's a draw";
  const subtitle = isWin
    ? 'Press R or click below for a new round'
    : 'No winning line — try again';

  return (
    <div className="ttt-overlay" role="dialog" aria-live="polite" aria-label={title}>
      <div className="ttt-overlay-card">
        {isWin && (
          <div className="ttt-overlay-icon" aria-hidden="true">
            <ToothIcon variant={winnerVariant} />
          </div>
        )}
        <h2 className="ttt-overlay-title">{title}</h2>
        <p className="ttt-overlay-sub">{subtitle}</p>
        <button
          type="button"
          className="ttt-btn ttt-btn-primary ttt-overlay-btn"
          onClick={onNewRound}
          autoFocus
        >
          New round
          <kbd className="ttt-kbd">R</kbd>
        </button>
      </div>
    </div>
  );
};

export default Overlay;
