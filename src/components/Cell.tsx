import { memo } from 'react';
import type { Cell as CellValue } from '../logic/types';
import { ToothIcon } from './ToothIcon';

export type CellProps = {
  index: number;
  value: CellValue;
  isFocused: boolean;
  isWinning: boolean;
  isInteractive: boolean;
  onSelect: (index: number) => void;
  onFocusCell: (index: number) => void;
};

const ariaForValue = (index: number, value: CellValue): string => {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  if (value === 'X') return `Row ${row}, column ${col}, healthy tooth`;
  if (value === 'O') return `Row ${row}, column ${col}, decayed tooth`;
  return `Row ${row}, column ${col}, empty`;
};

export const Cell = memo(({
  index,
  value,
  isFocused,
  isWinning,
  isInteractive,
  onSelect,
  onFocusCell,
}: CellProps) => {
  const handleClick = () => {
    if (!isInteractive) return;
    onSelect(index);
  };

  const handleFocus = () => {
    onFocusCell(index);
  };

  return (
    <button
      type="button"
      className={[
        'ttt-cell',
        value ? `ttt-cell-${value.toLowerCase()}` : 'ttt-cell-empty',
        isFocused ? 'ttt-cell-focused' : '',
        isWinning ? 'ttt-cell-winning' : '',
      ].filter(Boolean).join(' ')}
      aria-label={ariaForValue(index, value)}
      onClick={handleClick}
      onFocus={handleFocus}
      tabIndex={isFocused ? 0 : -1}
      data-index={index}
    >
      {value !== null && (
        <span className="ttt-cell-icon" aria-hidden="true">
          <ToothIcon variant={value === 'X' ? 'healthy' : 'decayed'} />
        </span>
      )}
    </button>
  );
});

Cell.displayName = 'Cell';

export default Cell;
