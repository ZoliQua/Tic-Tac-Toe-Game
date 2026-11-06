import { useMessages } from '../arcade';
import type { AISpeed } from '../hooks/useAIDelay';
import { MESSAGES, type TicTacToeMessageKey } from '../i18n';

export type AISpeedToggleProps = {
  speed: AISpeed;
  onChange: (next: AISpeed) => void;
};

const OPTIONS: ReadonlyArray<{ id: AISpeed; label: string; hint: TicTacToeMessageKey }> = [
  { id: 'instant', label: '0', hint: 'speedInstant' },
  { id: 'fast', label: '0.15s', hint: 'speedFast' },
  { id: 'normal', label: '0.4s', hint: 'speedNormal' },
  { id: 'slow', label: '1s', hint: 'speedSlow' },
];

export const AISpeedToggle = ({ speed, onChange }: AISpeedToggleProps) => {
  const t = useMessages(MESSAGES);
  return (
    <div className="arc-field" role="group" aria-label={t('aiDelay')}>
      <span>{t('aiDelay')}</span>
      <div className="arc-segmented">
        {OPTIONS.map(({ id, label, hint }) => (
          <button type="button" key={id} aria-pressed={id === speed} title={t(hint)} onClick={() => onChange(id)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AISpeedToggle;
