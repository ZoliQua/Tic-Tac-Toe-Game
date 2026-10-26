import type { WinningLine as Line } from '../logic/types';
import styles from './GameBoard.module.css';

export type WinningLineProps = {
  line: Line;
};

// 3×3 grid normalised to a 100×100 viewBox; cell centres at 1/6, 3/6, 5/6.
const POSITIONS = [16.67, 50, 83.33] as const;

const cellCenter = (index: number): { x: number; y: number } => ({
  x: POSITIONS[index % 3],
  y: POSITIONS[Math.floor(index / 3)],
});

export const WinningLine = ({ line }: WinningLineProps) => {
  const start = cellCenter(line[0]);
  const end = cellCenter(line[2]);
  return (
    <svg className={styles.strike} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className={styles.strikeStroke}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default WinningLine;
