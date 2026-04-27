import { TicTacToeGame } from './TicTacToeGame';

export const App = () => {
  return (
    <div className="page">
      <TicTacToeGame />
      <footer className="page-footer">
        <a
          href="https://github.com/ZoliQua/Tic-Tac-Toe-Game"
          target="_blank"
          rel="noreferrer"
        >
          Source on GitHub
        </a>
        <span className="page-footer-sep">·</span>
        <span>
          Part of the{' '}
          <a
            href="https://github.com/ZoliQua/Arcade-Game-Center"
            target="_blank"
            rel="noreferrer"
          >
            Arcade-Game-Center
          </a>{' '}
          family
        </span>
      </footer>
    </div>
  );
};

export default App;
