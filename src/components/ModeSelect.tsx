import type { Mode } from '../logic/types';

export type ModeSelectProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const MODES: ReadonlyArray<{ id: Mode; label: string; hint: string }> = [
  { id: 'pvp', label: 'PvP', hint: 'Two players on one device (key 1)' },
  { id: 'easy', label: 'Easy', hint: 'Random AI (key 2)' },
  { id: 'medium', label: 'Medium', hint: 'Heuristic AI (key 3)' },
  { id: 'hard', label: 'Hard', hint: 'Minimax AI — never loses (key 4)' },
];

export const ModeSelect = ({ mode, onChange }: ModeSelectProps) => (
  <div className="arc-segmented arc-segmented--full" role="group" aria-label="Game mode">
    {MODES.map(({ id, label, hint }) => (
      <button type="button" key={id} aria-pressed={id === mode} title={hint} onClick={() => onChange(id)}>
        {label}
      </button>
    ))}
  </div>
);

export default ModeSelect;
