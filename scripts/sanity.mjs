// Quick AI/logic sanity test (not a real test framework — just a smoke check).
import { advanceGame, createInitialState } from '../src/logic/game.ts';
import { checkWin, isDraw } from '../src/logic/win.ts';
import { bestMove } from '../src/logic/ai.ts';

let pass = 0;
let fail = 0;

const assert = (label, cond) => {
  if (cond) { pass++; console.log(`  ok  ${label}`); }
  else { fail++; console.log(`  FAIL ${label}`); }
};

// 1. Win detection across all 8 lines for both marks
const winningPositions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];
for (const mark of ['X', 'O']) {
  for (const line of winningPositions) {
    const board = Array(9).fill(null);
    for (const i of line) board[i] = mark;
    const result = checkWin(board);
    assert(`win ${mark} on [${line.join(',')}]`,
      result !== null && result.winner === mark);
  }
}

// 2. Draw detection
const drawBoard = ['X','O','X','X','O','O','O','X','X'];
assert('draw board has no winner', checkWin(drawBoard) === null);
assert('draw board isDraw=true', isDraw(drawBoard) === true);

// 3. Win-on-last-move beats draw
const winLastBoard = ['X','O','X','X','O','O','X','X','O']; // X wins col 0
assert('win on last move: winner detected', checkWin(winLastBoard)?.winner === 'X');

// 4. Hard AI never loses across 200 games (Hard vs random)
const rng = () => Math.random();
let humanWins = 0;
let aiWins = 0;
let draws = 0;
for (let g = 0; g < 200; g++) {
  let s = createInitialState({ mode: 'hard' });
  while (s.status === 'playing') {
    if (s.current === 'X') {
      // random human
      const empties = s.board.map((c,i)=>c===null?i:-1).filter(i=>i>=0);
      const idx = empties[Math.floor(rng()*empties.length)];
      s = advanceGame(s, { type: 'place', index: idx }, { rng });
    } else {
      s = advanceGame(s, { type: 'aiMove' }, { rng });
    }
  }
  if (s.winner === 'X') humanWins++;
  else if (s.winner === 'O') aiWins++;
  else draws++;
}
console.log(`  Hard AI vs random over 200 games: human=${humanWins} ai=${aiWins} draws=${draws}`);
assert('Hard AI never loses to random', humanWins === 0);

// 5. Easy AI variance over 200 random-vs-random
let easyMixed = { x: 0, o: 0, d: 0 };
for (let g = 0; g < 200; g++) {
  let s = createInitialState({ mode: 'easy' });
  while (s.status === 'playing') {
    if (s.current === 'X') {
      const empties = s.board.map((c,i)=>c===null?i:-1).filter(i=>i>=0);
      const idx = empties[Math.floor(rng()*empties.length)];
      s = advanceGame(s, { type: 'place', index: idx }, { rng });
    } else {
      s = advanceGame(s, { type: 'aiMove' }, { rng });
    }
  }
  if (s.winner === 'X') easyMixed.x++;
  else if (s.winner === 'O') easyMixed.o++;
  else easyMixed.d++;
}
console.log(`  Easy/random mix over 200 games: x=${easyMixed.x} o=${easyMixed.o} d=${easyMixed.d}`);
assert('Easy produces variance (all 3 outcomes)', easyMixed.x > 0 && easyMixed.o > 0 && easyMixed.d > 0);

// 6. Medium takes obvious wins
const winInOne = ['X','X',null,'O','O',null,null,null,null]; // X plays index 2 to win
assert('Medium takes win-in-1', bestMove(winInOne, 'X', 'medium', rng) === 2);

// 7. Medium blocks obvious threats
const blockBoard = ['O','O',null,'X',null,null,null,null,null]; // X must block at 2
assert('Medium blocks opponent win', bestMove(blockBoard, 'X', 'medium', rng) === 2);

// 8. No-op on filled cell
let s2 = createInitialState();
s2 = advanceGame(s2, { type: 'place', index: 0 }, { rng });
const before = s2.board.slice();
s2 = advanceGame(s2, { type: 'place', index: 0 }, { rng });
assert('Filled cell click is no-op',
  JSON.stringify(s2.board) === JSON.stringify(before));

console.log(`\nPass: ${pass}  Fail: ${fail}`);
process.exit(fail === 0 ? 0 : 1);
