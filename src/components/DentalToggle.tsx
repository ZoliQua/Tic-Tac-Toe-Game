import { useKitMessages, useMessages } from '../arcade';
import { MESSAGES } from '../i18n';

export type DentalToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

/** Settings row for the shared dental mode (`arcade.dental`): X / O ↔ teeth. */
export const DentalToggle = ({ enabled, onToggle }: DentalToggleProps) => {
  const t = useMessages(MESSAGES);
  const k = useKitMessages();
  return (
    <label className="arc-field ttt-dental">
      <input type="checkbox" checked={enabled} onChange={onToggle} />
      <span>{k('dental')}</span>
      <small className="ttt-dental__hint">{t('dentalHint')}</small>
    </label>
  );
};

export default DentalToggle;
