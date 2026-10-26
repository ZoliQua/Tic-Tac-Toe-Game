import type { IconStyle } from '../hooks/useIconStyle';

export type IconStyleToggleProps = {
  style: IconStyle;
  onChange: (next: IconStyle) => void;
};

const OPTIONS: ReadonlyArray<{ id: IconStyle; label: string; hint: string }> = [
  { id: 'tooth', label: '🦷 Teeth', hint: 'Healthy / decayed tooth (key I)' },
  { id: 'classic', label: '✕◯ Classic', hint: 'X / O (key I)' },
];

export const IconStyleToggle = ({ style, onChange }: IconStyleToggleProps) => (
  <div className="arc-field" role="group" aria-label="Icon style">
    <span>Marks</span>
    <div className="arc-segmented">
      {OPTIONS.map(({ id, label, hint }) => (
        <button type="button" key={id} aria-pressed={id === style} title={hint} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default IconStyleToggle;
