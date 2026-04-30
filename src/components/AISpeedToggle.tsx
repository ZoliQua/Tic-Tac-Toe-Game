import type { AISpeed } from '../hooks/useAIDelay';

export type AISpeedToggleProps = {
  speed: AISpeed;
  onChange: (next: AISpeed) => void;
};

const OPTIONS: ReadonlyArray<{ id: AISpeed; label: string; hint: string }> = [
  { id: 'instant', label: '0', hint: 'Instant' },
  { id: 'fast', label: '0.15s', hint: 'Fast (150 ms)' },
  { id: 'normal', label: '0.4s', hint: 'Normal (400 ms)' },
  { id: 'slow', label: '1s', hint: 'Slow (1000 ms)' },
];

export const AISpeedToggle = ({ speed, onChange }: AISpeedToggleProps) => {
  return (
    <div className="ttt-settings-group" role="radiogroup" aria-label="AI speed">
      <span className="ttt-settings-label">AI delay</span>
      <div className="ttt-segmented">
        {OPTIONS.map(({ id, label, hint }) => {
          const active = id === speed;
          return (
            <button
              type="button"
              key={id}
              role="radio"
              aria-checked={active}
              title={hint}
              className={`ttt-segmented-btn${active ? ' ttt-segmented-active' : ''}`}
              onClick={() => onChange(id)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AISpeedToggle;
