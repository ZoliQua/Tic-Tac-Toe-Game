import type { GameState, GameAction } from '../logic/types';
import { Cell } from './Cell';
import { WinningLine } from './WinningLine';

export type GameBoardProps = {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isHumanTurn: boolean;
};

export const GameBoard = ({ state, dispatch, isHumanTurn }: GameBoardProps) => {
  const interactive = state.status === 'playing' && isHumanTurn;

  const onSelect = (index: number) => {
    dispatch({ type: 'place', index });
  };
  const onFocusCell = (index: number) => {
    dispatch({ type: 'focus', index });
  };

  return (
    <div className="ttt-board" role="grid" aria-label="Tic-Tac-Toe board">
      {state.board.map((value, index) => {
        const isWinning =
          state.winningLine !== null && state.winningLine.includes(index);
        return (
          <Cell
            key={index}
            index={index}
            value={value}
            isFocused={state.focusIndex === index}
            isWinning={isWinning}
            isInteractive={interactive}
            onSelect={onSelect}
            onFocusCell={onFocusCell}
          />
        );
      })}
      {state.winningLine && <WinningLine line={state.winningLine} />}
    </div>
  );
};

export default GameBoard;
