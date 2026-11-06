import { useMessages } from '../arcade';
import { MESSAGES, MODE_KEY, type TicTacToeMessageKey } from '../i18n';
import type { Mode } from '../logic/types';

export type ModeSelectProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const MODES: ReadonlyArray<{ id: Mode; hint: TicTacToeMessageKey }> = [
  { id: 'pvp', hint: 'hintPvp' },
  { id: 'easy', hint: 'hintEasy' },
  { id: 'medium', hint: 'hintMedium' },
  { id: 'hard', hint: 'hintHard' },
];

export const ModeSelect = ({ mode, onChange }: ModeSelectProps) => {
  const t = useMessages(MESSAGES);
  return (
    <div className="arc-segmented arc-segmented--full" role="group" aria-label={t('modeGroup')}>
      {MODES.map(({ id, hint }) => (
        <button type="button" key={id} aria-pressed={id === mode} title={t(hint)} onClick={() => onChange(id)}>
          {t(MODE_KEY[id])}
        </button>
      ))}
    </div>
  );
};

export default ModeSelect;
