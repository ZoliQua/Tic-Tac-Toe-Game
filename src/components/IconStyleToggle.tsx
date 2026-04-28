import type { IconStyle } from '../hooks/useIconStyle';

export type IconStyleToggleProps = {
  style: IconStyle;
  onChange: (next: IconStyle) => void;
};

const OPTIONS: ReadonlyArray<{ id: IconStyle; label: string; icon: string; hint: string }> = [
  { id: 'tooth', label: 'Teeth', icon: '🦷', hint: 'Healthy / Decayed' },
  { id: 'classic', label: 'Classic', icon: '✕◯', hint: 'X / O' },
];

export const IconStyleToggle = ({ style, onChange }: IconStyleToggleProps) => {
  return (
    <div
      className="ttt-icon-toggle"
      role="radiogroup"
      aria-label="Icon style"
    >
      {OPTIONS.map(({ id, label, icon, hint }) => {
        const active = id === style;
        return (
          <button
            type="button"
            key={id}
            role="radio"
            aria-checked={active}
            title={hint}
            className={`ttt-icon-toggle-btn${active ? ' ttt-icon-toggle-active' : ''}`}
            onClick={() => onChange(id)}
          >
            <span className="ttt-icon-toggle-icon" aria-hidden="true">{icon}</span>
            <span className="ttt-icon-toggle-label">{label}</span>
          </button>
        );
      })}
      <span className="ttt-icon-toggle-kbd" aria-hidden="true">
        <kbd className="ttt-kbd">T</kbd>
      </span>
    </div>
  );
};

export default IconStyleToggle;
