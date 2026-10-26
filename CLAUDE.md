# Tic-Tac-Toe Game — CLAUDE.md

## Project Facts

* **Repository**: https://github.com/ZoliQua/Tic-Tac-Toe-Game (package `tic-tac-toe-game`)
* **Portal**: https://github.com/ZoliQua/Arcade-Game-Center — arcade id **`tictactoe`**, colour token `--game-tictactoe`.
  The same `src/` is mirrored into `Arcade-Game-Center/apps/tictactoe/`.
* **Sister games**: Tetris-Game, Snake-Game (the reference implementation), 2048-Game, Pac-Man-Game, Gomoku-Game.
* **Stack**: React 18.3, Vite 5.4, TypeScript 5.6, CSS Modules on the shared arcade tokens. No other runtime dependencies.
* **Package manager**: npm. **Node**: >=20.
* **Scripts**:
  * `npm run dev` — local dev server
  * `npm run build` — `tsc -b && vite build`
  * `npm run preview` — preview production build
  * `npm run typecheck` — `tsc -b`
  * `npm run lint` — ESLint (flat config, typescript-eslint)
  * `npm test` — Vitest (logic + component tests, jsdom)
  * `npm run check` — lint → typecheck → test → build (same as CI)
* **Board**: fixed 3 × 3 (`Board = readonly [Cell × 9]`, length-9 tuple).
* **Marks**: internally `'X'` / `'O'`. Rendered as tooth icons (healthy = X, decayed = O) or, with the **I** toggle, classic X / O glyphs.
* **Modes**: `'pvp'`, `'easy'` (random AI), `'medium'` (heuristic AI), `'hard'` (α-β minimax — never loses). Human is always X (`humanMark`).
* **Win**: any of 8 lines; win check runs **before** draw check. **Draw**: full board, no win.
* **Scoring**: each round is one arcade run, scored with the kit's `duelRoundScore({ outcome, difficulty: mode | null, moves: moveCount, boardCells: 9 })`
  from the human's side. PvP → difficulty `null` → `ranked: false`, score 0 (outcome from player 1 = X).
  `GameState.roundScore` is the current round's score, `GameState.points` the match total.
* **Stats**: kept by the kit (`arcade.stats.tictactoe`); Best = `stats.best`. There is no game-owned high-score storage.
* **Best streaks**: per mode, all-time, `localStorage` keys `tictactoe.highScore.<mode>` (legacy name kept for existing records; it is a streak, deliberately not the kit's `legacyBestKey`). The old single key `tictactoe.highScore` is migrated into Hard once.
* **Session**: the whole match (`SavedGame` = `GameState` minus `bestStreaks`) under `arcade.session.tictactoe`, schema `SESSION_SCHEMA = 1`, validated by `isTicTacToeSession`. Kept between rounds; dropped only by Discard (→ idle), reset by *Reset scores* / mode change.
* **Other prefs**: `tictactoe.iconStyle`, `tictactoe.aiSpeed`, `tictactoe.soundEnabled`.
* **No game loop**: state advances only on input and on the AI's delayed dispatch.
* **Rendering**: DOM grid + inline SVG (tooth icons, winning strike). No canvas.
* **Communication**: respond to the user in **Hungarian** in chat, even though this file and the codebase are in English.

If any fact above disagrees with the real repository, verify first and flag the divergence to the user before editing code.

---

## Primary Goal

A correct, minimal, type-safe Tic-Tac-Toe that runs standalone and embeds unchanged in the Arcade-Game-Center portal.

**Priority order**: correctness → truthfulness → verification → small diffs → maintainability → polish.

---

## Architecture

```
src/
  arcade/              # VENDORED shared kit from Arcade-Game-Center/packages/kit — never edit here
  logic/               # pure rules, no React
    types.ts constants.ts grid.ts win.ts
    ai.ts              # bestMove(board, mark, mode, rng); easy / medium / hard (α-β minimax)
    game.ts            # advanceGame reducer, createInitialState, roundOutcome, aiMarkFor, scoring
    autopilot.ts       # demo driver: DEMO_PAIRINGS, autoplayStep, seededRng
    persist.ts         # isTicTacToeSession — strict saved-session validator
    *.test.ts
  hooks/               # useAITurn, useKeyboardSelect, useBestStreak, useIconStyle, useAIDelay, useSound
  components/          # GameBoard (full + mini) + GameBoard.module.css, Cell, ToothIcon, WinningLine,
                       # ModeSelect, AISpeedToggle, IconStyleToggle, SoundToggle
  demo/TicTacToeDemo.tsx
  TicTacToeGame.tsx    # embeddable game, ArcadeGameProps; App.module.css for its layout
  TicTacToeGame.test.tsx
  App.tsx              # exactly <ArcadeShell gameId="tictactoe"><TicTacToeGame /></ArcadeShell>
  main.tsx             # imports arcade/arcade.css once, applyTheme(readTheme())
  index.ts             # exports TicTacToeGame, TicTacToeDemo, default + types
  test/setup.ts
```

Stats, Best, session autosave/restore, timer, theme, stat strip and overlays come from `src/arcade/`
(`useArcadeRun`, `useSessionAutosave`, `useRestoredSession`, `useRunTimer`, `StatPanel`, `GameOverlay`, `SaveBadge`, `KeyHelp`).
Change the kit only in Arcade-Game-Center and sync it. `GAME-PLAN.md` is the historical v1 design document.

`advanceGame(state, action, { rng })` owns every state transition. Components dispatch actions; they never mutate state.
`src/logic/*` never imports from `react`, `hooks/` or `components/` (it may import pure helpers such as `duelRoundScore` from `../arcade`).
`Math.random` is only passed in by `TicTacToeGame.tsx`; logic receives an injected RNG, the demo uses `seededRng`.

### Arcade status mapping

`TicTacToeGame` layers a UI `phase` (`idle | live | paused`) over the engine's round status (`playing | won | draw`):

| Arcade status | When |
| --- | --- |
| `idle` | first visit / after Discard, before Start (Start overlay) |
| `running` | phase `live` and round `playing` |
| `paused` | phase `paused` and round `playing` (also every restored session) |
| `gameOver` | round `won` / `draw` until the next round starts |

`runKey` is a round counter: Start, New round (R), mode change and New match increment it; abandoning a round never records it.
A restored round that had already finished is not replayed — `newRound` is applied and the match continues paused.

---

## Input

* **Mouse / touch**: cells are `<button role="gridcell">`; a click places only while running and on the human's turn.
* **Keyboard** (`useKeyboardSelect`): one window listener per mount (handlers via ref); starts with `shouldIgnoreKey`.
  Arrows/WASD cursor · Enter/Space place / start / resume / next round · **P/Esc** pause · **R** new round · **N** / **1–4** mode ·
  **I** icon style · **C** reset scores (confirm overlay: Enter confirms, Esc keeps; **Shift+C** skips it). **T** is reserved for the theme.
* **AI** (`useAITurn`): schedules `aiMove` after the AI delay only while running and no dialog is open; cancelled on every change and on unmount.
* `place` is rejected by the reducer on the AI's turn, so no input path can play the AI's mark.

---

## Working Rules

**Verify before and after every non-trivial change.** Read the target file and its neighbours; afterwards re-check imports, call sites and state transitions.

**No hallucination.** Never claim a build, lint or test passed without running it.

**Small, local, reversible changes.** One fix or one feature at a time.

**Preserve architecture.** Do not change Vite config, tsconfig, folder layout or styling approach without a stated reason and user approval.

**No new dependencies** without justification. No Zustand, game engines, lodash, immer, animation libraries.

**CSS**: CSS Modules + kit tokens only. No `:root`, `html`, `body`, `*` or bare element selectors in game styles. Must look right in both `[data-theme='dark']` and `[data-theme='light']`.

---

## Tic-Tac-Toe-Specific Bug Checklist

* All 8 winning lines detected for both marks; win-on-ninth-move is a win, not a draw.
* `place` is a no-op on filled cells, bad indices, finished rounds and the AI's turn.
* AI never moves while idle, paused, behind the reset dialog or after the round ended; pending timers are cancelled.
* Hard AI never loses (exhaustive test, human first and second).
* Easy uses the RNG (all outcomes occur vs random play); Medium takes wins and blocks.
* Loser opens the next round; draws / abandoned rounds alternate the starter.
* Streak increments only on a human win; per-mode best streaks never regress; mode change keeps them.
* Every finished round is recorded exactly once (`useArcadeRun` + `runKey`); PvP is unranked.
* The session validator rejects anything unreachable; restored sessions are always paused.
* Demo: no keyboard, sound, stats or storage writes; freezes when `active === false`.
* Hotkeys ignored while typing or with Cmd/Ctrl/Alt.

---

## Implementation Protocol (short)

1. **Current state** — only what you verified from the repo.
2. **Goal** — the exact requested change.
3. **Plan** — the smallest safe path and which files you will touch.
4. **Edit** — only the scoped change.
5. **Verify** — `npm run check`; note any checks you skipped.
6. **Report** — see below.

---

## End-of-Task Report

* **Changed files** — each file with a one-line reason.
* **Verified** — which checks actually ran.
* **Not verified** — explicit gaps.
* **Risks / follow-ups** — only real concerns, no filler.

---

**Guiding principle**: correctness over speed, verification over confidence, truth over fluency, small safe diffs over large rewrites. When in doubt — inspect more, assume less, change less, state uncertainty clearly.

---

## Git & Commit Rules

- Commit **only** as `Zoltán Dul <zoltan.dul@gmail.com>` (the global git identity).
- **Never** add `Co-Authored-By: Claude …`, "Generated with Claude Code" or any AI attribution
  to commit messages or pull-request descriptions.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
