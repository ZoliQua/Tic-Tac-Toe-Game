import { memo } from 'react';
import { useMessages } from '../arcade';
import type { IconStyle } from '../hooks/useIconStyle';
import { MESSAGES } from '../i18n';
import type { Board, WinningLine as Line } from '../logic/types';
import { Cell } from './Cell';
import { WinningLine } from './WinningLine';
import styles from './GameBoard.module.css';

export type GameBoardProps = {
  board: Board;
  winningLine: Line | null;
  iconStyle: IconStyle;
  /** Focus ring position (keyboard cursor); ignored by the mini variant. */
  focusIndex?: number;
  /** True when a click may place a mark (human's turn, round running). */
  interactive?: boolean;
  draw?: boolean;
  onSelect?: (index: number) => void;
  onFocusCell?: (index: number) => void;
  /** `mini` renders the compact, non-focusable landing-page variant. */
  variant?: 'full' | 'mini';
};

const noop = () => {};

export const GameBoard = memo(function GameBoard({
  board,
  winningLine,
  iconStyle,
  focusIndex = -1,
  interactive = false,
  draw = false,
  onSelect = noop,
  onFocusCell = noop,
  variant = 'full',
}: GameBoardProps) {
  const mini = variant === 'mini';
  const t = useMessages(MESSAGES);
  return (
    <div
      className={[styles.board, mini ? styles.mini : '', draw ? styles.draw : ''].filter(Boolean).join(' ')}
      data-icon-style={iconStyle}
      role={mini ? undefined : 'grid'}
      aria-label={mini ? undefined : t('board')}
      aria-hidden={mini ? true : undefined}
    >
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          isFocused={!mini && focusIndex === index}
          isWinning={winningLine !== null && winningLine.includes(index)}
          isInteractive={interactive}
          iconStyle={iconStyle}
          onSelect={onSelect}
          onFocusCell={onFocusCell}
          mini={mini}
        />
      ))}
      {winningLine && <WinningLine line={winningLine} />}
    </div>
  );
});

export default GameBoard;
