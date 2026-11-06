import { useMessages } from '../arcade';
import { MESSAGES } from '../i18n';

export type SoundToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

export const SoundToggle = ({ enabled, onToggle }: SoundToggleProps) => {
  const t = useMessages(MESSAGES);
  return (
    <label className="arc-field">
      <input type="checkbox" checked={enabled} onChange={onToggle} />
      {t('sound')}
    </label>
  );
};

export default SoundToggle;
