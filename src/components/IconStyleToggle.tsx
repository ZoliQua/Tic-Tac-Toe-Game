import { useMessages } from '../arcade';
import type { IconStyle } from '../hooks/useIconStyle';
import { MESSAGES, type TicTacToeMessageKey } from '../i18n';

export type IconStyleToggleProps = {
  style: IconStyle;
  onChange: (next: IconStyle) => void;
};

const OPTIONS: ReadonlyArray<{ id: IconStyle; icon: string; label: TicTacToeMessageKey; hint: TicTacToeMessageKey }> = [
  { id: 'tooth', icon: '🦷', label: 'teeth', hint: 'teethHint' },
  { id: 'classic', icon: '✕◯', label: 'classic', hint: 'classicHint' },
];

export const IconStyleToggle = ({ style, onChange }: IconStyleToggleProps) => {
  const t = useMessages(MESSAGES);
  return (
    <div className="arc-field" role="group" aria-label={t('iconStyle')}>
      <span>{t('marks')}</span>
      <div className="arc-segmented">
        {OPTIONS.map(({ id, icon, label, hint }) => (
          <button type="button" key={id} aria-pressed={id === style} title={t(hint)} onClick={() => onChange(id)}>
            {icon} {t(label)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IconStyleToggle;
