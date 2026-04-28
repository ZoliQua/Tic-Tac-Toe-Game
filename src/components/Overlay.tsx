import type { IconStyle } from '../hooks/useIconStyle';
import type { GameState } from '../logic/types';
import { ToothIcon } from './ToothIcon';

export type OverlayProps = {
  state: GameState;
  iconStyle: IconStyle;
  onNewRound: () => void;
};

export const Overlay = ({ state, iconStyle, onNewRound }: OverlayProps) => {
  if (state.status !== 'won' && state.status !== 'draw') return null;

  const isWin = state.status === 'won';
  const winner = state.winner;

  let title: string;
  if (isWin && winner) {
    if (iconStyle === 'classic') {
      title = `${winner} wins!`;
    } else {
      title = winner === 'X' ? 'Healthy tooth wins!' : 'Decayed tooth wins!';
    }
  } else {
    title = "It's a draw";
  }

  const subtitle = isWin
    ? 'Press R or click below for a new round'
    : 'No winning line — try again';

  return (
    <div className="ttt-overlay" role="dialog" aria-live="polite" aria-label={title}>
      <div className="ttt-overlay-card">
        {isWin && winner && (
          <div className={`ttt-overlay-icon ttt-overlay-icon-${winner.toLowerCase()}`} aria-hidden="true">
            {iconStyle === 'classic' ? (
              <span className="ttt-overlay-mark">{winner}</span>
            ) : (
              <ToothIcon variant={winner === 'X' ? 'healthy' : 'decayed'} />
            )}
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
