# Tic-Tac-Toe Game — CLAUDE.md

## Project Facts

* **Repository (standalone)**: `https://github.com/ZoliQua/Tic-Tac-Toe-Game`
* **Portal repo**: <https://github.com/ZoliQua/Arcade-Game-Center> — this game ships embedded there too. Read `Arcade-Game-Center/MIGRATION.md` before any structural change to know what the portal will expect.
* **Sister projects**:
  + <https://github.com/ZoliQua/Snake-Game>
  + <https://github.com/ZoliQua/Tetris-Game>
  + <https://github.com/ZoliQua/2048-Game>
  Mirror their architecture, hook patterns, and conventions unless a Tic-Tac-Toe-specific reason dictates otherwise.
* **Plan**: see `GAME-PLAN.md` in the repo root for the full design, AI specification, tooth-icon palette, and phased roadmap.
* **Stack**: React 18+, Vite, TypeScript, plain CSS scoped under `.ttt-app`.
* **Package manager**: npm.
* **Node**: >=20.
* **Scripts**:
  + `npm run dev` — local dev server
  + `npm run build` — production build
  + `npm run preview` — preview production build
  + `npm run typecheck` — `tsc --noEmit`
  + `npm run lint` — ESLint
  + `npm run test` — Vitest (only if a test setup actually exists)
* **Board**: fixed 3 × 3 (`Board = readonly [Cell × 9]`). No alternative board sizes in v1.
* **Marks**: internally `'X'` and `'O'`. Rendered on screen as **tooth icons** — `ToothIcon.Healthy` for X, `ToothIcon.Decayed` for O. The strings `X` and `O` never appear in the UI.
* **Modes**: `'pvp'`, `'easy'` (random AI), `'medium'` (heuristic AI), `'hard'` (minimax — unbeatable, drawable only).
* **Win**: any of 8 winning lines (3 rows + 3 cols + 2 diagonals) fully owned by one mark. Win check runs **before** draw check on every move.
* **Draw**: board full AND no win.
* **Best stat**: longest human (X) win streak across all modes. `localStorage` key `tictactoe.highScore`. Only written when strictly higher.
* **Session scores**: `{ x, o, draws }`, displayed live; reset on mode change or explicit `Esc`. NOT persisted to `localStorage` in v1.
* **AI delay**: `AI_DELAY_MS = 400` (constants.ts). `useAITurn` dispatches `{ type: 'aiMove' }` after this delay; the timer is cancelled on state change or unmount.
* **No game loop**: 2048-style. There is no auto-tick. State only advances on user input and on AI's delayed dispatch. There is **no `useGameLoop`** in this project.
* **Rendering**: DOM grid (CSS grid) + inline SVG for tooth icons and the winning-line strikethrough. No canvas.
* **Target platform**: desktop browser primary; touch works natively (cells are buttons), no swipe needed.
* **Communication**: respond to the user in **Hungarian** in chat, even though this file and the codebase are in English.

If any fact above disagrees with the real repository, verify first and flag the divergence to the user before editing code.

---

## Primary Goal

A correct, minimal, type-safe Tic-Tac-Toe that is easy to review, debug, and extend, and that **drops into the Arcade-Game-Center portal with zero refactoring**. Treat this as a maintainable project, not a one-shot script.

The standalone repo and the portal embedding are not separate codebases — they are the same `src/logic/`, `src/hooks/`, `src/components/` tree, with two different *roots* on top of it (`App.tsx` for standalone, `TicTacToeGame.tsx` for both).

**Priority order**: correctness → truthfulness → verification → small diffs → maintainability → polish.

---

## Architecture

Logic lives outside presentation. **`src/logic/*` and `src/hooks/*` may not import from `react-dom`, from any portal package (`@arcade/*`), or from `src/components/*`.** This is the rule that makes the package portal-droppable.

```
src/
  logic/
    constants.ts        # WINNING_LINES, AI_DELAY_MS, animation durations, default colours
    types.ts            # Mark, Cell, Board, GameStatus, Mode, GameState, GameAction
    grid.ts             # index ↔ (row, col) helpers, getEmptyCells, isFull
    win.ts              # checkWin(board) -> { winner, line } | null; isDraw(board)
    ai.ts               # bestMove(board, mark, mode, rng); minimax with α-β pruning
    game.ts             # advanceGame(state, action) — single pure reducer; createInitialState(rng, overrides)
  hooks/
    useKeyboardSelect.ts   # arrow + WASD navigation; Enter/Space → place; R/N/1-4/Esc; preventDefault on arrows
    useAITurn.ts           # setTimeout-driven AI move dispatcher; cancels on state change / unmount
    useBestStreak.ts       # localStorage-backed best win streak; key 'tictactoe.highScore'; writes only on new best
    useElapsedSeconds.ts   # mm:ss round timer; pauses on 'won' / 'draw'
  components/
    GameBoard.tsx     # 3×3 CSS grid + 9 Cell children + WinningLine overlay + focus indicator
    Cell.tsx          # one cell button; aria-label; renders ToothIcon when filled
    ToothIcon.tsx     # SVG tooth, two variants ('healthy' | 'decayed'), uses currentColor
    WinningLine.tsx   # absolutely positioned SVG line; stroke-dashoffset reveal animation
    ScoreBoard.tsx    # X / O / draws + currentStreak + bestStreak + status + timer
    GameControls.tsx  # new round / reset session scores
    ModeSelect.tsx    # PvP / Easy / Medium / Hard segmented control
    Overlay.tsx       # idle / won / draw overlay
  styles/
    ttt.css           # ALL game styles, every selector starts with `.ttt-app`
  TicTacToeGame.tsx   # root component for both standalone AND portal; wraps everything in <div className="ttt-app">
  App.tsx             # standalone-only chrome (header/footer, page title); imports TicTacToeGame
  main.tsx            # standalone-only React entry; renders <App />
  index.ts            # library entry: `export { TicTacToeGame } from './TicTacToeGame'; export { default } from './TicTacToeGame';`
```

Use this layout only after confirming what is already on disk. If the repo diverges, follow the existing convention and flag the divergence — do not silently restructure.

A central pure reducer — `advanceGame(state, action): GameState` — owns every state transition. Hooks dispatch actions and read state; they never mutate `board`, `scores`, or any other field directly.

---

## Type Model

```ts
type Mark = 'X' | 'O';
type Cell = Mark | null;
type Board = readonly [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

type WinningLine = readonly [number, number, number];

type GameStatus = 'idle' | 'playing' | 'won' | 'draw';
type Mode = 'pvp' | 'easy' | 'medium' | 'hard';

type GameState = {
  board: Board;
  current: Mark;
  status: GameStatus;
  winner: Mark | null;
  winningLine: WinningLine | null;
  mode: Mode;
  humanMark: Mark;             // 'X' in v1
  startingMark: Mark;          // alternates per round
  scores: { x: number; o: number; draws: number };
  bestStreak: number;
  currentStreak: number;
  moveCount: number;
  focusIndex: number;          // 0..8
};

type GameAction =
  | { type: 'place'; index: number }
  | { type: 'aiMove' }
  | { type: 'newRound' }
  | { type: 'changeMode'; mode: Mode }
  | { type: 'resetScores' }
  | { type: 'focus'; index: number };
```

Deviate only if the repo already uses a cleaner model. The `Board` is a length-9 tuple — not a 3×3 matrix. Tuple shape gives strict bounds at the type level.

---

## Functional Requirements

State machine: `idle → playing → (won | draw) → newRound → playing`. Mode change at any time resets the round and session scores. AI moves only occur in `playing` when `current !== humanMark`.

Required behavior: 3×3 board, two-player turn alternation, mark placement on empty cells only, immediate win detection on every placement (winner + winning line), draw detection on a full board, mode-aware second-player source (human in PvP, AI in easy/medium/hard), AI delay before AI moves, keyboard + mouse + touch input, scoped CSS, `localStorage`-backed best streak, round-timer.

Out of scope for v1 unless asked: undo/redo, online multiplayer, alternative board sizes, replays, sound, configurable AI delay, mode-specific best streaks, swap-which-mark-the-human-plays.

---

## AI Specification

`bestMove(board: Board, mark: Mark, mode: Mode, rng: () => number): number` is a **pure function** in `src/logic/ai.ts`. It returns the chosen cell index (`0..8`). Behaviour by mode:

* **`easy`**: uniform-random pick from `getEmptyCells(board)`. Single line of meaningful logic. RNG is the only non-determinism.
* **`medium`** (heuristic): in priority order — (1) take a winning move if available, (2) block the opponent's winning move if available, (3) take centre (cell `4`) if empty, (4) take a random empty corner, (5) take a random empty edge. Steps 4–5 use the injected RNG.
* **`hard`** (minimax with α-β pruning): exhaustive game-tree search. Score function: `+10 - depth` for a win at this branch, `-10 + depth` for a loss, `0` for a draw. The depth penalty makes the AI prefer **shorter wins and longer losses** — without it, the AI is indifferent between winning in 1 move and winning in 5, which feels broken to humans. RNG is unused (deterministic in this mode).

**Hard never loses.** This is a checked invariant: 1000 self-play games (Hard vs Hard) must all draw; 100 manual play games (any human strategy) must end in human-loss or draw.

**`Math.random()` is forbidden inside `src/logic/*`.** The RNG is always injected. The only place `Math.random` may appear in this codebase is `useAITurn` (where it constructs the RNG to pass into `bestMove`) and any dev-only fixture. This rule is what lets us write deterministic AI tests.

---

## Input

Three input sources, one dispatch pipeline, all routed through `advanceGame`.

* **Mouse / touch**: `Cell.tsx` `onClick` dispatches `{ type: 'place', index }`. Cells are `<button>` elements; touch works natively. No swipe handling — there's nothing to swipe over.
* **Keyboard** (`useKeyboardSelect`): single `keydown` listener attached once per mount, removed on unmount.
  * Arrows + WASD move `focusIndex` on the 3×3 grid (row/column-aware, clamped at edges — pressing Right on the rightmost column does **not** wrap to the next row).
  * Enter / Space dispatch `{ type: 'place', index: focusIndex }`.
  * `R` dispatches `newRound` when in `won`/`draw`; otherwise no-op (or restart-current-round if held with Shift, see GAME-PLAN open questions).
  * `N` cycles modes; `1` `2` `3` `4` jump to PvP / Easy / Medium / Hard.
  * `Esc` dispatches `resetScores` (open question on confirmation modal — for now, immediate).
  * Arrow keys call `event.preventDefault()` so the page never scrolls.
  * Keys other than the listed ones are ignored.
* **AI** (`useAITurn`): when `status === 'playing'` and `current !== humanMark`, `setTimeout(..., AI_DELAY_MS)` schedules an `{ type: 'aiMove' }` dispatch. The timer ID lives in a ref; it is cleared on every effect re-run and on unmount. **A pending AI move that hasn't fired yet must never reach `advanceGame` after a state change** — the cleanup is non-negotiable.

No input is accepted in `won` / `draw` except the status-changing keys (`R`, `N`, `1–4`, `Esc`). AI does not tick in those states.

---

## Animations

CSS-only, visual-only, never blocks logic. The animation layer must not be able to corrupt or delay game state.

* **Mark placement**: when a `Tile` mounts inside a `Cell` (or the `Cell`'s `value` flips from `null` to a mark), a `place` CSS class animates `transform: scale(0) → scale(1)` over `~150 ms`. Driven purely by component mount / value-change, no JS scheduling.
* **Winning line strike**: `WinningLine.tsx` renders an SVG `<line>` from the centre of the first cell of the line to the centre of the last. Animates `stroke-dashoffset` from `100%` to `0%` over `~300 ms`. Mounts only when `winningLine !== null`.
* **Winning-cell pulse**: the three cells of `winningLine` get a `winning` CSS class that pulses scale slightly, synchronized with the strike reveal.
* **Draw shimmer**: on `status === 'draw'`, the board gets a `draw` class that briefly desaturates and grayscales the teeth. ~400 ms.
* **Mode change / new round**: no entrance animation in v1. Cells just clear.

Rule: the user can dispatch the next action while animations are mid-flight. Animations are visual-only and cannot delay or veto state updates.

---

## Tooth Icons

The game's identity. Two visually distinct tooth shapes, both inline SVG, both using `currentColor` so the player colours come from CSS variables.

* `<ToothIcon variant="healthy" />` — clean molar silhouette, white-cream enamel, no markings. Used for X.
* `<ToothIcon variant="decayed" />` — same molar silhouette plus a small dark cavity dot. Used for O.

Both variants share the same outer silhouette so the board reads as a *grid of teeth*. The difference is the dental state. This is the joke. (The author is a dentist.)

* `viewBox="0 0 100 100"`. The tooth occupies the central ~80%.
* `stroke="currentColor"` on the silhouette. `fill="var(--ttt-tooth-fill)"` for the body. Cavity dot uses `fill="var(--ttt-cavity-color)"`.
* The whole game roots at `<div class="ttt-app">`, which **defines** the colour CSS variables. The portal's `tokens.css` may override them globally, but `.ttt-app` always wins for game-internal rendering.
* CSS variables (set on `.ttt-app`):
  * `--ttt-x-color`: clean medical blue
  * `--ttt-o-color`: warm cream / aged enamel
  * `--ttt-tooth-fill`: ivory (almost white)
  * `--ttt-cavity-color`: dark brown
  * `--ttt-board-bg`, `--ttt-grid-line`, `--ttt-win-line`: board surface colours

Default values are pinned in `src/styles/ttt.css` under `.ttt-app { ... }`. The portal can override on `:root` but does not need to.

---

## Working Rules

**Verify before and after every non-trivial change.** Before: read the target file and its neighbours, understand data flow and state shape. After: re-check imports, signatures, call sites, state transitions, and that no stale code remains.

**No hallucination.** Do not invent files, hooks, scripts, dependencies, or prior decisions. If something is not verified, say so — "I have not confirmed X", "I do not see evidence of Y". Never claim a build, lint, or test passed without running it.

**Small, local, reversible changes.** One fix or one feature at a time. Do not bundle refactor + feature + style. If the scope feels large, decompose and ask before proceeding.

**Preserve architecture.** Do not change Vite config, `tsconfig`, folder layout, styling approach, or rendering strategy without a stated reason and user approval.

**Explicitness over cleverness.** Small pure functions, explicit types, direct state transitions. Avoid clever one-liners and hidden side effects.

**No new dependencies** without justification. Default: React + Vite + TS only. No Zustand, no game engines, no lodash, no immer, no react-spring, no framer-motion.

**Pure logic, dumb UI.** `src/logic/*` must not import from `react`, `src/hooks/*`, `src/components/*`, or `@arcade/*`. `src/hooks/*` may import from `react` and `src/logic/*` only — never from `src/components/*` or `@arcade/*`. Components read state and dispatch actions; they never mutate `board` or `scores`. This is what makes `git subtree pull` from this repo into the portal monorepo a no-op for the pure folders.

**Pure logic is RNG-injected.** `bestMove` and any randomized helper accept an RNG (`() => number`). `Math.random` may only be invoked inside `useAITurn` (and dev fixtures), never inside `src/logic/*`.

**Portal-purity is checkable.** Two grep tests must pass:
* `grep -rE "from ['\"](\\.\\./)+components" src/logic src/hooks` returns nothing.
* `grep -rE "from ['\"]@arcade" src/logic src/hooks src/components` returns nothing in the standalone repo.
Treat a violation of either as a **build break**, not a style nit.

**CSS scope-tightness.** Every selector in `src/styles/ttt.css` starts with `.ttt-app`. No `:root`, no global `body`, no naked element selectors (`button { ... }`). The grep test is in the bug checklist.

---

## Tic-Tac-Toe-Specific Bug Checklist

Before concluding any non-trivial task, confirm each item was checked — or explicitly state it was not:

* **Win detection covers all 8 lines**: 3 rows, 3 columns, 2 diagonals. Both marks tested for each line.
* **Win-on-last-move**: a move that fills the board AND completes a line is recorded as `won`, not `draw`. Order of checks in `advanceGame` is win first, then draw.
* **Draw only on full board**: `isDraw` returns false on a non-full board even if no winner currently exists.
* **No-op on filled cell**: dispatching `{ type: 'place', index }` for an already-marked cell returns the previous state unchanged. No `moveCount` change, no streak change, no AI tick.
* **No-op in dead states**: `place` actions in `won` / `draw` return unchanged state. AI does not tick in dead states.
* **AI delay cancellation**: changing mode, starting a new round, or unmounting cancels any pending `setTimeout` from `useAITurn`. No stale `aiMove` action ever fires after a state change. **Verified explicitly** — write a test or do a manual fast-mode-switch.
* **Hard AI never loses**: 1000 self-play games (Hard vs Hard) all draw. 100 manual play games against Hard end in loss-or-draw, never human-win.
* **Easy AI variance**: over 1000 simulated games against random play, Easy produces a mix of wins, losses, and draws. (Proves the RNG actually fires; catches a bug where Easy was implemented but never randomized.)
* **Medium AI takes wins and blocks**: every "win in 1" position takes the win; every "opponent wins in 1" position blocks. Test fixtures cover both.
* **Starting mark alternation**: round N starts with `X`, round N+1 with `O`, etc. (Open question on loser-goes-first — see GAME-PLAN open questions.)
* **Streak stickiness**: `currentStreak` increments only on a human win, resets on any loss or draw. `bestStreak` updates only when `currentStreak > bestStreak`, never decreases.
* **Mode change resets session, not best**: `changeMode` zeros `{ x, o, draws }` and `currentStreak`, but `bestStreak` and `localStorage` are preserved.
* **`tictactoe.highScore` round-trips**: write, refresh, re-read returns the same number. Format is a plain integer string.
* **Best-stat never regresses**: `useBestStreak.recordStreak(n)` only writes when `n > best`.
* **Keyboard hygiene**: single listener per mount, cleaned up on unmount, arrows call `preventDefault`, focus indicator visible at all times during play.
* **Focus index bounds + clamping**: arrow keys clamp `focusIndex` to `0..8` with no row-wraparound. Right on cell `2` stays at `2`. Down on cell `7` stays at `7`.
* **Cell aria-label**: every cell has a meaningful `aria-label` reflecting its current state (`"empty"`, `"X"`, `"O"`).
* **Winning line geometry**: the SVG strike connects the *centres* of the first and last cells of the winning line, not corners.
* **Tooth icons render at every cell size**: tested at 32 px, 64 px, 128 px. No clipping, no overflow.
* **Initial state**: `createInitialState(rng)` returns an empty board, `current: 'X'`, `status: 'playing'`, `mode: 'pvp'`, `humanMark: 'X'`, all-zero session scores, `bestStreak` loaded from `localStorage`.
* **Portal-purity grep tests pass**: both grep commands listed in Working Rules return nothing.
* **CSS-scope grep test passes**: every selector in `src/styles/ttt.css` is prefixed with `.ttt-app`.

---

## Portal-Purity (the most important rule)

Tic-Tac-Toe is the first game in the family designed from day one to be portal-embeddable. Three concrete requirements:

1. **Pure folders are pure.** `src/logic/` and `src/hooks/` import nothing from `src/components/`, `react-dom`, or `@arcade/*`. The grep tests in the bug checklist enforce this.
2. **CSS is scoped.** Every selector in `src/styles/ttt.css` starts with `.ttt-app`. No `:root` declarations. Default colour tokens are set on `.ttt-app { ... }`, not on the document root.
3. **Two-root design is preserved.** `App.tsx` (standalone chrome) and `main.tsx` are the only files that get **deleted** during portal integration. `TicTacToeGame.tsx`, `index.ts`, and everything under `logic/` / `hooks/` / `components/` / `styles/` survive byte-for-byte.

When implementing any feature, ask: *would this still work if `App.tsx` and `main.tsx` were deleted and `TicTacToeGame` were rendered inside someone else's React tree?* If the answer is "no", refactor before merging.

`Arcade-Game-Center/scripts/sync-to-upstream.sh` only syncs `src/logic/`, `src/hooks/`, `src/components/`. If a portal-only import sneaks into one of those folders, the next sync will silently break the standalone repo. Treat a violation as a **build break**, not a style nit.

---

## Implementation Protocol (short)

For every non-trivial task:

1. **Current state** — only what you verified from the repo.
2. **Goal** — the exact requested change.
3. **Plan** — the smallest safe path and which files you will touch.
4. **Edit** — only the scoped change.
5. **Verify** — run `npm run typecheck` and `npm run build` when available; run the grep tests for portal-purity and CSS-scope when relevant; note any checks you skipped.
6. **Report** — see below.

---

## End-of-Task Report

End every meaningful change with:

* **Changed files** — each file with a one-line reason.
* **Verified** — which checks actually ran (typecheck, build, lint, tests, manual inspection, grep tests).
* **Not verified** — explicit gaps.
* **Risks / follow-ups** — only real concerns, no filler.

---

**Guiding principle**: correctness over speed, verification over confidence, truth over fluency, small safe diffs over large rewrites. When in doubt — inspect more, assume less, change less, state uncertainty clearly.
