# 🦷 Tic-Tac-Toe — GAME-PLAN.md

Development plan for a minimal, type-safe Tic-Tac-Toe with **dental-themed tooth icons**,
built in the same spirit as
[ZoliQua/Snake-Game](https://github.com/ZoliQua/Snake-Game),
[ZoliQua/Tetris-Game](https://github.com/ZoliQua/Tetris-Game) and
[ZoliQua/2048-Game](https://github.com/ZoliQua/2048-Game),
and designed from day one to be embedded in
[ZoliQua/Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) without rework:
**React 18 + Vite + TypeScript**, keyboard-first, grid-based DOM (no canvas), pure game logic
separated from presentation, strict types with no `any` escape hatches in game code.

> **Repository (standalone)**: `https://github.com/ZoliQua/Tic-Tac-Toe-Game`
> **Portal repo**: <https://github.com/ZoliQua/Arcade-Game-Center>
> **Mirror architecture**: Snake-Game / Tetris-Game / 2048-Game.
> **Portal integration**: this repo must satisfy the "Adding a 4th game" checklist in `Arcade-Game-Center/MIGRATION.md` *out of the box*, with no post-hoc refactoring.

---

## 📑 Table of contents

* [Goals](#-goals)
* [Non-goals (v1)](#-non-goals-v1)
* [Tech stack](#-tech-stack)
* [Game specification](#-game-specification)
* [Type model](#-type-model)
* [Architecture](#-architecture)
* [State machine](#-state-machine)
* [Game modes & AI](#-game-modes--ai)
* [Scoring & best-score semantics](#-scoring--best-score-semantics)
* [Tooth icons](#-tooth-icons)
* [Controls](#-controls)
* [Phased roadmap](#-phased-roadmap)
* [Tic-Tac-Toe-specific bug checklist](#-tic-tac-toe-specific-bug-checklist)
* [Portal integration checklist](#-portal-integration-checklist)
* [Working rules](#-working-rules)
* [Open questions](#-open-questions)

---

## 🎯 Goals

* A correct, minimal, type-safe Tic-Tac-Toe that is easy to review, debug, and extend.
* Follow Snake / Tetris / 2048 conventions exactly: `logic/` + `hooks/` + `components/`, a single pure entry point for state transitions, keyboard-first input, `localStorage`-backed best stat, real-time elapsed timer.
* **Standalone-first, portal-ready**. The standalone Vite app must be playable on its own (`npm run dev`, deploy to Vercel), AND the `src/logic/`, `src/hooks/`, `src/components/` folders must be pure enough for `git subtree`-pull into the Arcade-Game-Center monorepo with zero behavioural changes.
* **Dental theme**: instead of "X" and "O", use two visually distinct tooth icons. This is the game's identity.
* Three AI difficulty levels (random / heuristic / minimax) and a local 2-player mode.
* Desktop browser primary; touch works natively (cells are buttons — no swipe needed).

**Priority order**: correctness → truthfulness → verification → small diffs → maintainability → polish.

---

## 🚫 Non-goals (v1)

* No online multiplayer, no networking, no accounts.
* No board sizes other than 3×3 (no 4×4 / 5×5 / Gomoku-style).
* No undo / redo. Each move is final within a round.
* No replays, no PGN-style move recording, no game export.
* No sound, no skins, no themes (apart from honouring portal `tokens.css`).
* No canvas, no WebGL, no animation library.
* No leaderboard beyond the local stat in `localStorage`.

---

## 🧰 Tech stack

| Area        | Choice                       | Reason                                  |
| ----------- | ---------------------------- | --------------------------------------- |
| Framework   | React 18                     | Same as the family                       |
| Bundler     | Vite 5                       | Same as the family                       |
| Language    | TypeScript (strict)          | No `any` in game logic                   |
| Styling     | Plain CSS (scoped under `.ttt-app`) | Portal-compatible: scoped at root |
| State       | Local React state + hooks    | No Zustand, no Redux                     |
| Persistence | `localStorage`               | Best stat + session scores               |
| Renderer    | DOM grid (CSS grid) + inline SVG | Tooth icons are SVG; no canvas        |
| Package mgr | npm                          | `package-lock.json` committed in standalone |
| Node        | ≥ 20                         | Same as the family                       |

**Scripts** (standalone repo, mirroring the family):
`npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`, `npm run lint`.

---

## 🎮 Game specification

* **Board**: 3 × 3, nine cells indexed `0..8` row-major (`0,1,2 / 3,4,5 / 6,7,8`).
* **Marks**: `'X'` (Player 1) and `'O'` (Player 2). These are the *internal* names; on screen they are rendered as **tooth icons** (see Tooth icons section). The strings `X` and `O` never appear in the UI.
* **Turn order**: `X` always goes first within a round. Across rounds, the starting mark alternates by default (loser-goes-first is an open question — see Open questions).
* **Move**: clicking an empty cell, or pressing Enter/Space on the focused empty cell, places the current player's mark in that cell. Moves on filled cells are no-ops.
* **Win condition**: any of the 8 winning lines (3 rows + 3 columns + 2 diagonals) is fully occupied by one mark. The game ends with that mark as the winner, and the winning line is highlighted with an SVG strikethrough.
* **Draw condition**: the board is full and no winning line was completed.
* **Round end**: on win or draw, the board freezes, an overlay appears, and the round-scores are updated. The next round starts on user action (Enter / `R` / "New round" button).
* **No-op detection**: clicking a filled cell, an opponent-marked cell, or any cell while `status !== 'playing'` is silently ignored — no state change, no AI tick.

---

## 🧱 Type model

```ts
type Mark = 'X' | 'O';
type Cell = Mark | null;                        // null = empty
type Board = readonly [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]; // length-9 tuple

type WinningLine = readonly [number, number, number]; // three cell indices

type GameStatus = 'idle' | 'playing' | 'won' | 'draw';

type Mode = 'pvp' | 'easy' | 'medium' | 'hard';

type GameState = {
  board: Board;
  current: Mark;                  // whose turn it is
  status: GameStatus;
  winner: Mark | null;            // set on 'won'
  winningLine: WinningLine | null;// for the strike animation
  mode: Mode;
  humanMark: Mark;                // which mark the human plays (vs AI). Always 'X' in v1.
  startingMark: Mark;             // who started this round
  scores: { x: number; o: number; draws: number }; // session scores per current mode
  bestStreak: number;             // longest run of human (X) wins in any single mode
  currentStreak: number;          // current run of human wins; resets on loss or draw
  moveCount: number;
  focusIndex: number;             // 0..8, for keyboard navigation
};

type GameAction =
  | { type: 'place'; index: number }
  | { type: 'aiMove' }                     // dispatched by useAITurn after a delay
  | { type: 'newRound' }                   // start next round, alternating starting mark
  | { type: 'changeMode'; mode: Mode }     // resets session scores
  | { type: 'resetScores' }                // resets {x, o, draws} for the current mode
  | { type: 'focus'; index: number };      // keyboard navigation
```

The `Board` is a length-9 tuple — not a 3×3 matrix. Row/column conversion lives in `grid.ts`. Tuple shape gives us strict bounds at the type level and makes `bestMove` trivially memoizable by board-as-string-key.

---

## 🏗️ Architecture

Logic lives outside presentation. Do not bury game rules inside JSX. **`src/logic/*` must not import from `react`, `src/hooks/*`, or `src/components/*` — this is what makes the package portal-droppable.**

```
src/
  logic/
    types.ts            # shared types (Mark, Cell, Board, GameStatus, Mode, ...)
    constants.ts        # WINNING_LINES (8 triples), AI_DELAY_MS, animation durations
    grid.ts             # index ↔ (row,col) helpers, getEmptyCells, isFull
    win.ts              # checkWin(board) -> { winner, line } | null; isDraw(board)
    ai.ts               # bestMove(board, mark, mode, rng); minimax core; heuristic for medium
    game.ts             # advanceGame(state, action) — single pure reducer; createInitialState(overrides, rng)
  hooks/
    useKeyboardSelect.ts   # arrows move focusIndex; Enter/Space dispatches { type: 'place' }
    useAITurn.ts           # when status === 'playing' and current === aiMark, setTimeout dispatches { type: 'aiMove' }
    useBestStreak.ts       # localStorage-backed best win streak; writes only on new best
    useElapsedSeconds.ts   # real-time mm:ss; pauses with the round (stops on 'won' / 'draw')
  components/
    GameBoard.tsx     # 3×3 CSS grid + 9 Cell children + WinningLine overlay
    Cell.tsx          # one cell button; renders ToothIcon when filled; aria-label for screen readers
    ToothIcon.tsx     # the two SVG variants; props: variant ('healthy' | 'decayed'), size
    WinningLine.tsx   # absolutely positioned SVG line with stroke-dashoffset animation
    ScoreBoard.tsx    # X wins / O wins / draws + current streak + best streak + status + timer
    GameControls.tsx  # new round / reset scores
    ModeSelect.tsx    # PvP / Easy / Medium / Hard segmented control
    Overlay.tsx       # idle / won / draw overlay
  styles/
    ttt.css           # ALL game styles, every selector starts with `.ttt-app`
  TicTacToeGame.tsx   # root component; wraps everything in <div className="ttt-app">; exported by index.ts
  App.tsx             # standalone-only chrome (header/footer); imports TicTacToeGame
  main.tsx            # React entry (standalone-only)
  index.ts            # library entry: `export { TicTacToeGame } from './TicTacToeGame'; export { default } from './TicTacToeGame';`
```

**Why two roots (`TicTacToeGame.tsx` AND `App.tsx`)?** Per `Arcade-Game-Center/MIGRATION.md` step 3: when the game is moved into the monorepo, `App.tsx`, `main.tsx`, and `index.html` are deleted, and the portal renders `<TicTacToeGame />` directly inside its shell. Designing this split from day one means **zero refactoring** when integration time comes — the standalone `App.tsx` just adds the page-level chrome (page title, GitHub link, tab title) around `<TicTacToeGame />`.

Central pure reducer shape:

```ts
function advanceGame(state: GameState, action: GameAction): GameState;
```

`advanceGame` owns every state transition. Hooks dispatch actions and read state; they never mutate `board` or `scores` directly.

---

## 🔄 State machine

```
idle ──(place / aiMove)──▶ playing ──┬──(winning move)──▶ won
                                      │
                                      └──(board fills, no winner)──▶ draw

won  ──(newRound)──▶ playing
draw ──(newRound)──▶ playing

(any) ──(changeMode)──▶ playing  // session scores reset; board reset; current = X
```

* `idle → playing`: the initial state on mount is `playing` (`X` to move). `idle` is reserved for a future "press any key to start" landing card if we want one.
* `playing → won`: as soon as a placed mark completes a winning line. The winning player is recorded, the winning line is set, the AI does not respond.
* `playing → draw`: as soon as `moveCount === 9` and no win was scored on the last move.
* `won → playing` / `draw → playing`: on `newRound`. The board is cleared, `moveCount` reset, `winner` and `winningLine` cleared, `current` set to the new starting mark, `scores` carried over.
* `→ playing` via `changeMode`: full board reset, `scores` reset to `{ 0, 0, 0 }`, `current = X`, `humanMark = X`, `bestStreak` carried over.

Input is silently ignored in `won` and `draw` states except `newRound` and `changeMode`. AI does not tick in those states.

---

## 🤖 Game modes & AI

Four modes, all sharing the same `advanceGame` reducer. Mode only changes who provides the second player's moves.

| Mode      | Player 1 (X)   | Player 2 (O)   | Winnable?           |
| --------- | -------------- | -------------- | ------------------- |
| `pvp`     | Human (mouse/kbd) | Human (same device) | Yes, by either player |
| `easy`    | Human          | AI (random)         | Yes, almost always |
| `medium`  | Human          | AI (heuristic)      | Yes, with effort |
| `hard`    | Human          | AI (minimax)        | **Never.** Best result is a draw. |

**`bestMove(board, mark, mode, rng)`** (pure, in `src/logic/ai.ts`):

* **Easy**: pick uniformly at random from `getEmptyCells(board)`.
* **Medium** (heuristic, ~150 lines):
  1. If a move wins immediately → take it.
  2. Else if the opponent has a move that would win next turn → block it.
  3. Else if the centre (cell `4`) is empty → take it.
  4. Else if any corner (`0, 2, 6, 8`) is empty → take a random empty corner.
  5. Else take a random empty edge.
* **Hard** (full minimax with α-β pruning, ~80 lines): exhaustive search of the game tree. Score: `+10` win, `0` draw, `-10` loss, with depth penalty so the AI prefers shorter wins and longer losses. The 3×3 game tree has at most 9! ≈ 362 880 leaves; α-β reduces this drastically and the move runs in well under 1 ms. No memoization needed in v1, but the function signature is set up so we can add one later if we ever scale to 4×4.

The RNG is **injected**. `bestMove(board, mark, mode, rng)` accepts a `() => number` so `easy` is deterministic in tests. `Math.random` is only invoked at the call site (in `useAITurn`), never inside pure logic.

**AI delay** (`AI_DELAY_MS`, default `400`): when it's the AI's turn, `useAITurn` waits `AI_DELAY_MS` before dispatching `{ type: 'aiMove' }`. Without the delay the AI move feels instantaneous and wrong. The delay is cancelled if the game state changes (new round, mode change, unmount) before it fires — standard `setTimeout` cleanup in `useEffect`.

---

## 🎯 Scoring & best-score semantics

Tic-Tac-Toe doesn't have a continuous score. Instead we track:

* **Session scores**: `{ x, o, draws }`, displayed on the scoreboard. Persists across rounds within the same mode. Resets when `mode` changes or the user presses "Reset scores".
* **Current streak**: number of consecutive *human wins* in the current mode (vs AI) or X wins (in PvP). Resets to `0` on a loss or draw.
* **Best streak**: longest streak of human wins across the entire history of the game, across all modes. Persisted to `localStorage` under key `tictactoe.highScore`. Only written when strictly higher than the existing best.

The portal's `GAMES` registry expects a single `best` value per game. We expose `bestStreak` as that value:

```ts
{
  id: 'tictactoe',
  name: 'Tic-Tac-Toe',
  Icon: ToothIcon,
  color: 'var(--ttt-accent)',
  best: () => useBestStreak().value,  // adapter function provided by Shell.tsx
}
```

**Mode-weighted streak** *(decision)*: a hard-mode win counts the same as an easy-mode win in the streak counter — they're all "human wins". An open question lists the alternative (`hardWinsOnly` or weighted streaks) for future consideration.

---

## 🦷 Tooth icons

The game's identity. Two visually distinct tooth shapes, both inline SVG, both using `currentColor` for stroke / fill so the player colours come from CSS variables.

| Mark | Icon name           | Visual                                                                            | Player colour token |
| ---- | ------------------- | --------------------------------------------------------------------------------- | ------------------- |
| `X`  | `ToothIcon.Healthy` | Clean molar silhouette, white-cream enamel, no markings. The "ép fog".            | `--ttt-x-color`     |
| `O`  | `ToothIcon.Decayed` | Same molar silhouette, plus a small dark cavity dot on the occlusal surface. The "szuvas fog". | `--ttt-o-color`     |

Both icons share the same outer silhouette so the board reads as a *grid of teeth*, with the difference being the dental state. This is the joke. (The author is a dentist.)

* SVG `viewBox="0 0 100 100"`. The tooth occupies the central ~80% of the box; padding around it for clean cell hit-testing.
* `stroke="currentColor"` on the silhouette. `fill="var(--ttt-tooth-fill)"` for the enamel body. The cavity dot in the decayed variant uses `fill="var(--ttt-cavity-color)"`.
* No raster, no external assets. The full icon set ships as TSX in `src/components/ToothIcon.tsx`.
* Default colours (overridable from portal tokens):
  * `--ttt-x-color`: a clean medical blue (`#3b82f6` / `#60a5fa` in dark mode)
  * `--ttt-o-color`: a warm off-white / cream that suggests aged enamel (`#e2c889` / `#d4a574` in dark mode)
  * `--ttt-tooth-fill`: very light ivory `#fafaf6`
  * `--ttt-cavity-color`: dark brown `#3f2a1a`
  * `--ttt-board-bg`: subtle off-white grid `#f8f8f5` (or dark variant)
  * `--ttt-grid-line`: `#d4d4d8` / `#3f3f46`
  * `--ttt-win-line`: bright accent `#10b981` (works on both light and dark)

The whole game roots at `<div class="ttt-app">`, which both *defines* these CSS variables and *consumes* them. When the game is dropped into the portal, the portal's `tokens.css` may override the same variables on `:root` or on the portal shell, but the `.ttt-app` block always wins for game-internal rendering.

**Open**: pick exact silhouettes — friendly cartoon style vs. anatomically correct molar with cusps and roots. The plan sketches both as v1.1 alternatives.

---

## ⌨️ Controls

| Input                         | Action                                       |
| ----------------------------- | -------------------------------------------- |
| Mouse / touch click on a cell | Place mark on that cell (if empty + your turn) |
| ⬆️ ⬇️ ⬅️ ➡️                  | Move focus indicator on the 3×3 grid          |
| **W A S D**                   | Move focus indicator (alt)                    |
| **Enter** / **Space**         | Place mark on focused cell                   |
| **R**                         | New round (after `won` / `draw`); also restart current round if held with `Shift` |
| **N**                         | Cycle through modes (PvP → Easy → Medium → Hard → PvP) |
| **1–4**                       | Jump to mode (`1`=PvP, `2`=Easy, `3`=Medium, `4`=Hard) |
| **Esc**                       | Reset session scores (with confirmation)     |

Single `keydown` listener per mount, removed on unmount. Arrow keys call `event.preventDefault()` so the page never scrolls. Keys other than the listed ones are ignored. **No input is accepted in `won` / `draw` except** `R`, `N`, `1–4`, `Esc`.

Cells are real `<button>` elements with `aria-label="Cell row 1, column 1, empty"` (or `"X"` / `"O"` when filled), so screen readers and keyboard `Tab` work natively even if the user ignores arrow-key navigation.

---

## 🗺️ Phased roadmap

Each phase ends with a concrete **Done when** criterion. Do not start the next phase until the previous one is verified.

### Phase 0 — Scaffold

Vite + React + TS setup mirroring Snake / Tetris / 2048. Copy the ESLint config, `tsconfig*`, script names. Empty `src/logic/`, `src/hooks/`, `src/components/`. Create the dual-root structure: `App.tsx` (standalone chrome) + `TicTacToeGame.tsx` (the actual game) + `index.ts` (library entry).
**Done when**: `npm run dev` shows an empty page with the standalone chrome; `npm run typecheck` and `npm run build` pass.

### Phase 1 — Static board + tooth icons

Render the 3×3 grid background. Build `ToothIcon.Healthy` and `ToothIcon.Decayed` as SVG components. Hard-code a board with a few teeth in cells to verify rendering, focus styles, and colour tokens.
**Done when**: both tooth variants render at multiple sizes, in both default and `currentColor`-overridden states; a hand-built `[X, null, O, null, X, null, null, O, null]` board displays correctly.

### Phase 2 — `checkWin(board)` and `isDraw(board)`

Pure functions. `checkWin` returns `{ winner, line }` or `null` by checking all 8 `WINNING_LINES`. `isDraw` returns `true` iff every cell is filled AND `checkWin` is `null`.
**Done when**: unit table — every winning line for both marks resolves correctly; `[X,O,X,X,O,O,O,X,X]` (no winner) returns null; `[X,O,X,X,O,O,O,X,O]` returns null with `isDraw === true`.

### Phase 3 — `advanceGame` + place action (PvP only)

Implement the reducer for `place` and `newRound`. PvP only — no AI yet. Moves alternate `X` / `O`. On win, set `status='won'`, `winner`, `winningLine`. On full board with no win, set `status='draw'`. Input on filled cells / wrong status is a no-op.
**Done when**: a full PvP round can be played to a win and to a draw; `newRound` cleanly resets the board and alternates `startingMark`; clicking a filled cell does nothing.

### Phase 4 — Mouse + keyboard input

Wire `Cell.tsx` `onClick` to dispatch `{ type: 'place', index }`. Implement `useKeyboardSelect`: arrow keys move `focusIndex` (clamped 0..8 with row/column wrapping), Enter/Space dispatches place, R dispatches `newRound`. Arrows call `preventDefault`.
**Done when**: a full round is playable with keyboard alone; focus indicator is visible; arrow navigation never scrolls the page.

### Phase 5 — Winning line animation

`WinningLine.tsx` renders an absolutely positioned SVG with a single line element from the centre of the first winning cell to the centre of the last. `stroke-dasharray` + `stroke-dashoffset` animation reveals it left-to-right over ~300 ms.
**Done when**: every one of the 8 winning lines renders with a correctly positioned, fully-revealed strike; the strike does not appear on draws.

### Phase 6 — `bestMove` Easy

Implement Easy AI (random). Wire `useAITurn` to dispatch `{ type: 'aiMove' }` after `AI_DELAY_MS` whenever it's the AI's turn. RNG injection: tests pass a deterministic RNG.
**Done when**: in Easy mode, the AI plays a random legal move ~400 ms after the human; over 1000 simulated games, AI wins, losses, and draws all occur (proves the AI isn't always losing or always drawing).

### Phase 7 — `bestMove` Medium (heuristic)

Implement the 5-step heuristic. Test against a fixture set: every "you must block" position blocks correctly; every "you can win now" position takes the win.
**Done when**: against random play, Medium AI wins ≥ 70% of games; against itself, all games end in a draw; never misses a forced win or block.

### Phase 8 — `bestMove` Hard (minimax)

Full game-tree search with α-β pruning. Score function: `+10 - depth` for win, `-10 + depth` for loss, `0` for draw. Move runs in < 1 ms.
**Done when**: in 1000 self-play games (Hard vs Hard), every game is a draw; against random, Hard never loses; against the human, Hard never loses (manual play test for at least 20 games).

### Phase 9 — Mode select + scores

`ModeSelect.tsx` segmented control. `changeMode` action resets the board and session scores. `ScoreBoard.tsx` displays `{ x, o, draws }` and the current streak.
**Done when**: switching modes mid-round clears the board and zeros the session scores; the streak counter increments on human win, resets on loss or draw.

### Phase 10 — Best streak persistence + elapsed timer

`useBestStreak`: read on mount, write only when `currentStreak > bestStreak`. Key: `tictactoe.highScore`. `useElapsedSeconds`: `mm:ss` round-timer; pauses on `won` / `draw`.
**Done when**: best streak survives a refresh; timer resets on `newRound` and pauses on round end; best streak does not regress.

### Phase 11 — Place + win animations

Tooth icon scales `0 → 1` with a 150 ms pop on placement. Winning cells get a subtle pulse synced to the strike-line reveal. Draw state gets a brief grayscale shimmer on the whole board. CSS-only.
**Done when**: animations never desync from logical state; rapid clicks never produce visual glitches; no animation library was added.

### Phase 12 — Polish + ship standalone

README mirroring the family structure (badges, TOC, features, controls, scoring, scripts, architecture, license). Deploy to Vercel. Tag `v1.0.0`. Standalone game is fully playable.
**Done when**: `npm run build` produces a clean prod bundle; the app is live at a Vercel URL; the release is tagged.

### Phase 13 — Portal integration smoke test

Run through `Arcade-Game-Center/MIGRATION.md` "Adding a 4th game" steps end-to-end against a local clone of the monorepo. Specifically: subtree-add this repo, strip chrome, rename to `TicTacToeGame.tsx` (no-op since we already named it that), scope CSS (no-op since already scoped under `.ttt-app`), workspace `package.json`, register in `Shell.tsx` `GAMES` array, register in `App.tsx` route. Run `npm install && npm run typecheck && npm run build && npm run dev`.
**Done when**: the game card appears on the portal landing; clicking it loads the game inside the portal shell; no console errors; high score key `tictactoe.highScore` round-trips through the portal's storage; **zero post-integration source changes were needed** beyond what `MIGRATION.md` prescribes mechanically.

---

## 🧪 Tic-Tac-Toe-specific bug checklist

Confirm each item was checked before closing any non-trivial task, or explicitly state it was not:

* **Win detection covers all 8 lines**: 3 rows, 3 columns, 2 diagonals. Both marks tested for each line.
* **Win on the *last* move**: a winning move on move 9 (filling the last cell while completing a line) is recorded as `won`, not `draw`. Order matters: check win first, then draw.
* **Draw only on full board**: `isDraw` returns false on a non-full board even if no winner *yet* exists.
* **No-op on filled cell**: clicking an already-marked cell does nothing — no state mutation, no AI tick, no streak change, no `moveCount` increment.
* **No-op in dead states**: clicks on cells in `won` / `draw` are silently dropped. AI does not tick in dead states.
* **AI delay cancellation**: changing mode, starting a new round, or unmounting cancels any pending `setTimeout` from `useAITurn`. No stale `aiMove` action ever fires after a state change.
* **Hard AI never loses**: 1000 self-play games are all draws. 100 manual play games all end in human-loss or draw, never human-win.
* **Easy AI variance**: over 1000 simulated games, Easy produces a mix of wins, losses, and draws (RNG actually fires).
* **Medium AI takes wins and blocks**: every "win in 1" position takes the win; every "opponent wins in 1" position blocks.
* **Starting mark alternation**: round N starts with `X`, round N+1 starts with `O`, round N+2 with `X`, etc. (Open question: loser-goes-first — see Open questions.)
* **Streak stickiness**: `currentStreak` increments only on a human win, resets on any loss or draw. `bestStreak` updates only when `currentStreak > bestStreak`, never decreases.
* **Mode change resets session, not best**: `changeMode` zeros `{ x, o, draws }` and `currentStreak`, but `bestStreak` and `localStorage` are preserved.
* **Keyboard hygiene**: single listener per mount, cleaned up on unmount, arrows call `preventDefault`, focus indicator visible at all times during play.
* **Focus index bounds**: arrow keys clamp `focusIndex` to `0..8` with sensible row/column wrap-around. Pressing Right on cell 2 stays at cell 2 (not cell 3, which would be a row jump).
* **Winning line geometry**: the SVG strike connects the *centres* of the first and last cells of the winning line, not the cell corners.
* **Tooth icons render at every cell size**: tested at 32 px, 64 px, 128 px. No clipping, no overflow.
* **Portal-purity of `logic/` and `hooks/`**: no imports from `react-dom`, `@arcade/ui`, `@/components`, or any UI-side path. Pure functions and pure-state hooks only. Verified with a grep test in CI (`grep -rE "from ['\"](\\.\\./)*components" src/logic src/hooks` must return nothing).
* **CSS scope tightness**: every selector in `src/styles/ttt.css` starts with `.ttt-app`. No `:root`, no global `body`, no naked element selectors. Verified with a grep test (`grep -nE "^[^.]" src/styles/ttt.css | grep -v "^\s*/\*\|^\s*\*\|^@"` must return nothing).
* **Initial state**: `createInitialState()` returns an empty board, `current: 'X'`, `status: 'playing'`, `mode: 'pvp'`, all-zero scores, `bestStreak` loaded from `localStorage` if present.

---

## 🔌 Portal integration checklist

A pre-flight check that this repo satisfies `Arcade-Game-Center/MIGRATION.md` step 1–11 *as currently written*. Maintain this checklist as the migration doc evolves.

| MIGRATION.md step                                 | Pre-satisfied here?                              | Action on integration day                    |
| ------------------------------------------------- | ------------------------------------------------ | -------------------------------------------- |
| 1. `git subtree add --prefix=apps/tictactoe …`    | N/A — done in monorepo                           | Run the command                              |
| 2. Strip chrome (`index.html`, `main.tsx`, etc.)  | ✅ Chrome already isolated in `App.tsx` + `main.tsx` | Delete the listed files                      |
| 3. Rename `App.tsx` → `<Game>Game.tsx`            | ✅ Already named `TicTacToeGame.tsx`              | No-op (or delete `App.tsx`)                 |
| 3. Wrap root in `<div className="ttt-app">`      | ✅ Already wrapped                                | No-op                                        |
| 4. Scope CSS under `.ttt-app`                    | ✅ Every selector pre-scoped                      | No-op                                        |
| 5. `src/index.ts` library entry                  | ✅ Pre-built, exports `TicTacToeGame`             | No-op                                        |
| 6. Replace `package.json` with workspace package | ❌ Standalone has full Vite deps                  | Replace with `@arcade/tictactoe` package.json |
| 7. Replace `tsconfig.json`                       | ❌ Standalone has full Vite tsconfig              | Replace with the monorepo's tsconfig         |
| 8. CSS Modules typing                            | N/A — using plain CSS                            | Skip                                         |
| 9. Register in portal                            | N/A — happens in monorepo                        | Add to `Shell.tsx` `GAMES`, `App.tsx` route, `Landing.tsx` preview, `package.json` deps |
| 10. Extend sync script                           | N/A — happens in monorepo                        | Add `tictactoe` case to `sync-to-upstream.sh` |
| 11. `npm install && typecheck && build && dev`   | N/A — happens in monorepo                        | Run                                          |

The two `❌` rows are the only manual changes integration day. Everything else is already done by following this plan.

**Portal-side artefacts to prepare** (these go in the monorepo, not this repo, but we draft them here so they're ready):

* `GAMES` entry: `{ id: 'tictactoe', name: 'Tic-Tac-Toe', Icon: Sparkle, color: '#3b82f6', best: 'tictactoe.highScore' }` — exact shape TBD by inspecting the current `Shell.tsx`.
* Landing-page preview component: a static 3×3 mini-grid showing one healthy and one decayed tooth, ~80×80 px. Lives in `apps/portal/src/Landing.tsx`.
* Sidebar icon: a small healthy tooth, exported from `packages/ui/src/Icons.tsx` so the portal can render it without depending on `@arcade/tictactoe`.

---

## 📏 Working rules

* **Verify before and after every non-trivial change.** Read the target file and its neighbours. After the edit, re-check imports, signatures, call sites, and state transitions.
* **No hallucination.** Do not invent files, hooks, or scripts. If something is not verified, say so explicitly.
* **Small, local, reversible changes.** One fix or one feature at a time. No bundling refactor + feature + style.
* **Preserve architecture.** No changes to Vite config, `tsconfig`, folder layout, styling approach, or rendering strategy without a stated reason and approval.
* **Explicitness over cleverness.** Small pure functions, explicit types, direct state transitions.
* **No new dependencies** without justification. Default is React + Vite + TS only. No game engines, no Zustand, no immer, no animation libs.
* **Pure logic is RNG-injected.** `bestMove` and any randomized helper accept an RNG. `Math.random` is only invoked from `useAITurn` (or its tests), never from inside `src/logic/*`.
* **Portal-purity is a hard rule.** `src/logic/*` and `src/hooks/*` may not import from `react-dom`, from any portal package, or from `src/components/*`. The grep-tests in the bug checklist enforce this in CI.
* **End-of-task report**: changed files, verified checks, unverified gaps, real risks only.

**Communication**: respond to the user in **Hungarian** in chat, even though this file and the codebase are in English (same convention as Snake / Tetris / 2048).

---

## ❓ Open questions

* **Tooth icon style**: cartoon-friendly silhouette vs. anatomically correct molar (cusps, two roots, pulp chamber visible)? The cartoon version reads better at small grid sizes; the anatomical version is more on-brand for the dentist author. Ship cartoon in v1, anatomical as a v1.1 toggle?
* **X / O assignment**: `X = healthy, O = decayed` (current plan, "good vs. bad" reading) vs. `X = molar, O = incisor` (purely shape-based, no moral overtone). Stick with healthy/decayed?
* **Loser-goes-first**: currently `startingMark` strictly alternates. Tic-Tac-Toe tradition often gives the previous loser the first move next round (a small comeback mechanic). Implement, or keep strict alternation?
* **Best-streak weighting**: a streak of 5 Easy wins counts the same as 5 Hard wins (current plan). Alternative: track separate `bestStreak` per mode, expose the maximum to the portal. Or expose only `bestHardStreak` (since Hard is unbeatable, even reaching streak `1` is impossible — drawing forever still gives `0`). The current plan is the simplest; flag if Hard makes the streak useless.
* **AI delay configurability**: 400 ms hard-coded vs. user-tunable slider (e.g., 100 ms / 400 ms / 1000 ms)?
* **PvP turn indicator**: in PvP mode, who's-next is more important than vs-AI mode. Show a large coloured banner ("X to move" with the healthy tooth icon), or just rely on the focus indicator and scoreboard?
* **Confirmation dialogs**: `Esc` resets session scores. Confirm in a modal, or just commit and rely on the user being able to reset back? (Snake/Tetris/2048 don't have score-reset commands at all.)
* **Sound**: explicitly out of scope for v1. Reconsider for v1.1 (subtle "click" on placement, "ding" on win, "tick" on draw)?
* **Keyboard shortcut for "swap which mark you play"**: currently human is always X. Allow human-as-O for variety (so AI moves first and the human reacts)?

---

**Guiding principle**: correctness over speed, verification over confidence, truth over fluency, small safe diffs over large rewrites. When in doubt — inspect more, assume less, change less, state uncertainty clearly.
