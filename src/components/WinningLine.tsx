import type { WinningLine as Line } from '../logic/types';

export type WinningLineProps = {
  line: Line;
};

const cellCenter = (index: number): { x: number; y: number } => {
  const row = Math.floor(index / 3);
  const col = index % 3;
  // 3x3 grid normalized to 100x100 viewBox; cells at 1/6, 3/6, 5/6
  const positions = [16.67, 50, 83.33];
  return {
    x: positions[col] as number,
    y: positions[row] as number,
  };
};

export const WinningLine = ({ line }: WinningLineProps) => {
  const start = cellCenter(line[0]);
  const end = cellCenter(line[2]);

  return (
    <svg
      className="ttt-winning-line"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="var(--ttt-win-line)"
        strokeWidth="3"
        strokeLinecap="round"
        className="ttt-winning-stroke"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default WinningLine;
