import { ArcadeShell } from './arcade';
import { TicTacToeGame } from './TicTacToeGame';

export default function App() {
  return (
    <ArcadeShell gameId="tictactoe">
      <TicTacToeGame />
    </ArcadeShell>
  );
}
