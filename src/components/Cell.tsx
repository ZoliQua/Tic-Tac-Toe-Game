import { memo } from 'react';
import type { IconStyle } from '../hooks/useIconStyle';
import type { Cell as CellValue } from '../logic/types';
import { ToothIcon } from './ToothIcon';
import styles from './GameBoard.module.css';

export type CellProps = {
  index: number;
  value: CellValue;
  isFocused: boolean;
  isWinning: boolean;
  isInteractive: boolean;
  iconStyle: IconStyle;
  onSelect: (index: number) => void;
  onFocusCell: (index: number) => void;
  /** Mini (demo) cells are plain, non-focusable divs. */
  mini?: boolean;
};

const ariaForValue = (index: number, value: CellValue, iconStyle: IconStyle): string => {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  if (value === null) return `Row ${row}, column ${col}, empty`;
  if (iconStyle === 'classic') return `Row ${row}, column ${col}, ${value}`;
  return value === 'X'
    ? `Row ${row}, column ${col}, healthy tooth`
    : `Row ${row}, column ${col}, decayed tooth`;
};

const Mark = ({ value, iconStyle }: { value: 'X' | 'O'; iconStyle: IconStyle }) =>
  iconStyle === 'classic' ? (
    <span className={styles.glyph} aria-hidden="true">
      {value}
    </span>
  ) : (
    <span className={styles.icon} aria-hidden="true">
      <ToothIcon variant={value === 'X' ? 'healthy' : 'decayed'} />
    </span>
  );

export const Cell = memo(function Cell({
  index,
  value,
  isFocused,
  isWinning,
  isInteractive,
  iconStyle,
  onSelect,
  onFocusCell,
  mini = false,
}: CellProps) {
  const className = [
    styles.cell,
    value === 'X' ? styles.x : value === 'O' ? styles.o : styles.empty,
    isFocused ? styles.focused : '',
    isWinning ? styles.winning : '',
    isInteractive && value === null ? styles.playable : '',
  ]
    .filter(Boolean)
    .join(' ');

  const mark = value !== null ? <Mark value={value} iconStyle={iconStyle} /> : null;

  if (mini) return <div className={className}>{mark}</div>;

  return (
    <button
      type="button"
      role="gridcell"
      className={className}
      aria-label={ariaForValue(index, value, iconStyle)}
      aria-disabled={!isInteractive || value !== null}
      onClick={() => {
        if (isInteractive) onSelect(index);
      }}
      onFocus={() => onFocusCell(index)}
      tabIndex={isFocused ? 0 : -1}
      data-index={index}
    >
      {mark}
    </button>
  );
});

export default Cell;
