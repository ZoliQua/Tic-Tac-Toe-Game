export type SoundToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

export const SoundToggle = ({ enabled, onToggle }: SoundToggleProps) => {
  return (
    <div className="ttt-settings-group">
      <span className="ttt-settings-label">Sound</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        title={enabled ? 'Sound on (click to mute)' : 'Sound off (click to enable)'}
        className={`ttt-sound-btn${enabled ? ' ttt-sound-on' : ''}`}
        onClick={onToggle}
      >
        <span aria-hidden="true">{enabled ? '🔊' : '🔇'}</span>
        <span className="ttt-sound-label">{enabled ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
};

export default SoundToggle;
