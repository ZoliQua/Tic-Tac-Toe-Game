import { memo } from 'react';
import type { IconStyle } from '../hooks/useIconStyle';
import type { Cell as CellValue } from '../logic/types';
import { ToothIcon } from './ToothIcon';

export type CellProps = {
  index: number;
  value: CellValue;
  isFocused: boolean;
  isWinning: boolean;
  isInteractive: boolean;
  iconStyle: IconStyle;
  onSelect: (index: number) => void;
  onFocusCell: (index: number) => void;
};

const ariaForValue = (index: number, value: CellValue, iconStyle: IconStyle): string => {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  if (value === null) return `Row ${row}, column ${col}, empty`;
  if (iconStyle === 'classic') {
    return `Row ${row}, column ${col}, ${value}`;
  }
  return value === 'X'
    ? `Row ${row}, column ${col}, healthy tooth`
    : `Row ${row}, column ${col}, decayed tooth`;
};

export const Cell = memo(({
  index,
  value,
  isFocused,
  isWinning,
  isInteractive,
  iconStyle,
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
      aria-label={ariaForValue(index, value, iconStyle)}
      onClick={handleClick}
      onFocus={handleFocus}
      tabIndex={isFocused ? 0 : -1}
      data-index={index}
    >
      {value !== null && (
        iconStyle === 'classic' ? (
          <span className="ttt-cell-mark" aria-hidden="true">{value}</span>
        ) : (
          <span className="ttt-cell-icon" aria-hidden="true">
            <ToothIcon variant={value === 'X' ? 'healthy' : 'decayed'} />
          </span>
        )
      )}
    </button>
  );
});

Cell.displayName = 'Cell';

export default Cell;
