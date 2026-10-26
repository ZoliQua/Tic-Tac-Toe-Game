export type SoundToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

export const SoundToggle = ({ enabled, onToggle }: SoundToggleProps) => (
  <label className="arc-field">
    <input type="checkbox" checked={enabled} onChange={onToggle} />
    Sound effects
  </label>
);

export default SoundToggle;
