export type GameControlsProps = {
  onNewRound: () => void;
  onResetScores: () => void;
};

export const GameControls = ({ onNewRound, onResetScores }: GameControlsProps) => {
  return (
    <div className="ttt-controls">
      <button type="button" className="ttt-btn ttt-btn-primary" onClick={onNewRound}>
        New round
        <kbd className="ttt-kbd">R</kbd>
      </button>
      <button type="button" className="ttt-btn ttt-btn-ghost" onClick={onResetScores}>
        Reset scores
        <kbd className="ttt-kbd">Esc</kbd>
      </button>
    </div>
  );
};

export default GameControls;
