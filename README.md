# 🦷 Tic-Tac-Toe — Tooth Edition

A minimal, type-safe Tic-Tac-Toe with **dental tooth icons** instead of X and O, built with **React 18**, **Vite**, and **TypeScript**. Keyboard-first, grid-based, no canvas, no external game engine.

![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Table of contents

- [Features](#-features)
- [How it works](#-how-it-works)
- [Game modes & AI](#-game-modes--ai)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage](#-usage)
- [Controls](#-controls)
- [Scoring](#-scoring)
- [Tooth icons](#-tooth-icons)
- [Scripts](#-scripts)
- [Architecture](#-architecture)
- [License](#-license)

## ✨ Features

- 🦷 **Dental theme** — `Healthy` (X) vs `Decayed` (O) tooth icons, the strings `X` and `O` never show on screen
- 🎮 **Four modes** — Player-vs-Player, Easy (random AI), Medium (heuristic AI), Hard (minimax — unbeatable)
- 🤖 **Minimax + α-β pruning** — Hard AI never loses, always reaches a draw at worst
- 🏆 **Persistent best streak** in `localStorage` (`tictactoe.highScore`) across refreshes and modes
- ⏱️ **Real-time round timer** (`mm:ss`) that pauses on win or draw
- ⌨️ **Keyboard-first** — arrows + WASD, Enter/Space to place, R for new round, 1–4 to jump modes
- ✨ **CSS-only animations** — tooth pop on placement, animated SVG strikethrough on the winning line
- 🧼 **Pure game logic** separated from UI — `src/logic/*` and `src/hooks/*` never import from `components/`
- 🎨 **Plain CSS** scoped under `.ttt-app` — drop-in compatible with the `Arcade-Game-Center` portal
- 🔒 **Type-safe** — strict TypeScript, no `any` escape hatches in game code, length-9 tuple board

## 🧠 How it works

The game is a small state machine driven by a single pure reducer:

```
idle → playing ──┬── (winning move) ──→ won
                 └── (board fills, no winner) → draw

won  → (R / new round) → playing
draw → (R / new round) → playing
```

`advanceGame(state, action, ctx): GameState` owns every transition:

1. **`place`** — drops the current player's mark on an empty cell. Filled-cell clicks are silent no-ops.
2. **`aiMove`** — `bestMove(board, mark, mode, rng)` picks a move under the current mode's strategy. RNG is injected so tests are deterministic.
3. **Win check first**, then draw check — a winning move on cell #9 is always recorded as `won`, never `draw`.
4. **Streak bookkeeping** — `currentStreak` increments only on a human win, resets on any loss or draw. `bestStreak` only ever increases.
5. **`newRound`** — clears the board, alternates the starting mark, keeps session scores. **`changeMode`** resets session scores too.

A small React hook (`useAITurn`) watches the state and dispatches `aiMove` after a 400 ms delay when it's the AI's turn — the timer is cancelled on every state change and on unmount, so no stale move ever fires after a new round, mode change, or unmount.

## 🤖 Game modes & AI

| Mode      | Player 1 (X)      | Player 2 (O)            | Winnable?                          |
| --------- | ----------------- | ----------------------- | ---------------------------------- |
| **PvP**   | Human             | Human (same device)     | Yes, by either player              |
| **Easy**  | Human             | AI (uniform random)     | Yes, almost always                 |
| **Medium**| Human             | AI (5-step heuristic)   | Yes, with effort                   |
| **Hard**  | Human             | AI (full α-β minimax)   | **Never.** Best result is a draw.  |

The Medium AI follows a tight 5-step priority: take the win → block the opponent's win → take the centre → take a random empty corner → take a random empty edge. The Hard AI runs full minimax over the 3×3 game tree (`< 1 ms` per move) with `+10 - depth` for a win, `depth - 10` for a loss, `0` for a draw — so it prefers shorter wins and longer losses.

## 📦 Requirements

- 🟢 **Node ≥ 20**
- 📦 **npm** (the lockfile is committed as `package-lock.json`)

## 🚀 Installation

```bash
git clone https://github.com/ZoliQua/Tic-Tac-Toe-Game.git
cd Tic-Tac-Toe-Game
npm install
```

## 🕹️ Usage

Start the dev server:

```bash
npm run dev
```

Then open `http://localhost:5173` in a modern desktop browser.

For a production build:

```bash
npm run build
npm run preview
```

## ⌨️ Controls

| Key                            | Action                                  |
| ------------------------------ | --------------------------------------- |
| 🖱️ Click / Touch              | Place mark on the chosen cell           |
| ⬆️ / ⬇️ / ⬅️ / ➡️             | Move the focus indicator                |
| **W** / **A** / **S** / **D**  | Move the focus indicator (alternate)    |
| **Enter** / **Space**          | Place mark on the focused cell          |
| **R**                          | New round (after win / draw)            |
| **N**                          | Cycle through modes (PvP → Easy → …)    |
| **1** / **2** / **3** / **4**  | Jump to PvP / Easy / Medium / Hard      |
| **Esc**                        | Reset session scores                    |

Arrow keys call `preventDefault()` so the page never scrolls during play. Cells are real `<button>` elements with `aria-label`s, so screen readers and `Tab` navigation work natively.

## 🎯 Scoring

Tic-Tac-Toe has no continuous score, so this game tracks three things instead:

| Stat               | Meaning                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| **Session scores** | `{ X wins, O wins, draws }` for the current mode. Resets on mode change.   |
| **Current streak** | Consecutive **human** wins in the current session. Resets on loss or draw. |
| **Best streak**    | Longest human win streak ever, across all modes. Persisted in `localStorage`. |

The best streak is stored under `tictactoe.highScore` and only written when strictly higher than the previous best — it never decreases. Clear your site data to reset it.

## 🦷 Tooth icons

The game's identity. Two visually distinct molar shapes, both inline SVG, both using `currentColor` for the silhouette stroke so the player colours come from CSS variables.

| Mark | Icon                  | Player colour token | Default light / dark |
| ---- | --------------------- | ------------------- | -------------------- |
| `X`  | 🦷 **Healthy** molar  | `--ttt-x-color`     | `#3b82f6` / `#60a5fa` |
| `O`  | 🦷 **Decayed** molar (with cavity dot) | `--ttt-o-color` | `#c9a35a` / `#d4a574` |

Both icons share the same outer silhouette, so the board reads as a *grid of teeth* — the difference is the dental state. (The author is a dentist.) The whole game roots at `<div class="ttt-app">` which both defines and consumes these CSS variables, so the portal's tokens override the surrounding page but `.ttt-app` always wins for game-internal rendering.

## 🧪 Scripts

| Script                | Purpose                                |
| --------------------- | -------------------------------------- |
| `npm run dev`         | Start the local dev server (Vite)      |
| `npm run build`       | Type-check and produce a prod bundle   |
| `npm run preview`     | Preview the production build           |
| `npm run typecheck`   | Run `tsc --noEmit`                     |
| `npm run lint`        | Run ESLint across the project          |

## 🏗️ Architecture

Logic lives outside presentation. **`src/logic/*` and `src/hooks/*` never import from `components/`** — that's what makes this package drop-in for the [`Arcade-Game-Center`](https://github.com/ZoliQua/Arcade-Game-Center) monorepo.

```
src/
  logic/             pure game rules — no React, no DOM
    types.ts            Mark, Cell, Board (length-9 tuple), GameState, GameAction
    constants.ts        WINNING_LINES, AI_DELAY_MS, animation durations
    grid.ts             index ↔ (row, col), getEmptyCells, isFull, focus movement
    win.ts              checkWin(board), isDraw(board)
    ai.ts               easy / medium / hard with α-β pruning; RNG injected
    game.ts             advanceGame(state, action, ctx) reducer + createInitialState
  hooks/
    useKeyboardSelect.ts    arrow/WASD/Enter/R/N/1–4/Esc; preventDefault on arrows
    useAITurn.ts            cancellable setTimeout dispatching `aiMove`
    useBestStreak.ts        localStorage-backed best streak, write-on-new-best only
    useElapsedSeconds.ts    mm:ss round timer; pauses on won / draw
  components/
    GameBoard.tsx       3×3 CSS grid + 9 Cell children + WinningLine overlay
    Cell.tsx            <button> + aria-label + ToothIcon when filled
    ToothIcon.tsx       SVG tooth, healthy / decayed variants, currentColor stroke
    WinningLine.tsx     absolutely positioned SVG line, stroke-dashoffset reveal
    ScoreBoard.tsx      X / O / draws + streak + best + status + timer
    GameControls.tsx    new round / reset session scores
    ModeSelect.tsx      PvP / Easy / Medium / Hard segmented control
    Overlay.tsx         won / draw overlay
  styles/
    ttt.css             every selector scoped under .ttt-app
    page.css            standalone-only chrome (deleted on portal integration)
  TicTacToeGame.tsx     root for both standalone AND portal; wraps in .ttt-app
  App.tsx               standalone-only chrome (footer, page title)
  main.tsx              standalone-only React entry
  index.ts              library entry — exports { TicTacToeGame }
```

The dual-root layout (`TicTacToeGame.tsx` + `App.tsx` + `index.ts`) means **zero refactoring** when this game is moved into the [`Arcade-Game-Center`](https://github.com/ZoliQua/Arcade-Game-Center) monorepo — the portal renders `<TicTacToeGame />` directly inside its shell.

## 🧩 Sister projects

- 🐍 [Snake-Game](https://github.com/ZoliQua/Snake-Game)
- 🟦 [Tetris-Game](https://github.com/ZoliQua/Tetris-Game)
- 🔢 [2048-Game](https://github.com/ZoliQua/2048-Game)
- 🕹️ [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) — the portal that hosts them all

## ⚖️ License

Released under the [MIT License](./LICENSE). © 2026 Zoltan Dul.

---

<p align="center">Made with 🦷 by Zoltan Dul</p>
