# 🦷 Tic-Tac-Toe — Tooth Edition

A minimal, type-safe Tic-Tac-Toe with **dental tooth icons** (or classic X / O) built with **React 18**, **Vite** and **TypeScript** — keyboard-first, grid-based DOM, no canvas, no game engine.
Runs on its own **and** as one of the ten games of **[Zoltan's Arcade](https://github.com/ZoliQua/Arcade-Game-Center)**.

[![CI](https://github.com/ZoliQua/Tic-Tac-Toe-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Tic-Tac-Toe-Game/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Table of contents

- [The Zoltan's Arcade family](#-the-zoltans-arcade-family)
- [Features](#-features)
- [Quick start](#-quick-start)
- [Controls](#%EF%B8%8F-controls)
- [Scoring & stats](#-scoring--stats)
- [Autosave & resume](#-autosave--resume)
- [Embedding in Arcade-Game-Center](#-embedding-in-arcade-game-center)
- [How it works](#-how-it-works)
- [Scripts](#-scripts)
- [Architecture](#%EF%B8%8F-architecture)
- [Contributing](#-contributing)
- [License](#%EF%B8%8F-license)

## 🕹️ The Zoltan's Arcade family

Every game is a standalone repo that also plugs into the portal. They share one design system, one scoring model and one save format through the vendored [`src/arcade/`](./src/arcade) kit.

| Game | Repo | Genre |
| --- | --- | --- |
| 🏠 **Arcade portal** | [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) | All games in one place, live demos, stats, leaderboard |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reflex |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Puzzle |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Maze |
| ⚫ Gomoku | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Strategy |
| 🦷 **Tic-Tac-Toe** (this repo) | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Duel |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Paddle |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Shooter |
| 🔴 Connect Four | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Duel |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Sorting |

## ✨ Features

- 🦷 **Dental theme** — `Healthy` (X) vs `Decayed` (O) tooth icons, with a toggle (or **I**) to classic `X` / `O`; the choice is remembered
- 🎮 **Four modes** — Player-vs-Player, Easy (random AI), Medium (heuristic AI), Hard (α-β minimax — **never loses**)
- 🏆 **Unified arcade scoring** — every round is scored with the shared duel formula; best score, plays and wins are shared with the portal
- 🔥 **Per-mode best streaks** — PvP / Easy / Medium / Hard each keep their own all-time win-streak record
- 🔄 **Loser-goes-first** — the previous round's loser opens the next round (draws and abandoned rounds alternate)
- ⏸️ **Pause** (P / Esc) — freezes the board, the AI and the round timer
- 💾 **Autosave & resume** — the whole match (board, scores, streak, points) survives reloads and tab closes
- ⚡ **AI speed** — Instant / 0.15 s / 0.4 s / 1 s thinking delay, remembered
- 🔔 **Optional sound** — procedural Web Audio beeps on placement, win and draw; off by default
- 🌗 **Dark / light theme** shared with every arcade game (press **T**)
- 🤖 **Attract-mode demo** (`<TicTacToeDemo />`) — two AIs of mixed strength play the real engine on the portal's landing page
- ⌨️ **Keyboard-first**; hotkeys are ignored while you type in a form field or hold Cmd/Ctrl/Alt
- 🧪 **Tested** — every winning line, draws, an *exhaustive* proof that the hard AI never loses, scoring, the save validator and component behaviour

## 🚀 Quick start

Requires **Node ≥ 20** and npm.

```bash
git clone https://github.com/ZoliQua/Tic-Tac-Toe-Game.git
cd Tic-Tac-Toe-Game
npm install
npm run dev          # http://localhost:5173
```

Production build: `npm run build && npm run preview`. The build uses relative asset paths, so `dist/` can be served from any sub-folder.

## ⌨️ Controls

| Key | Action |
| --- | --- |
| 🖱️ Click / tap | Place your mark on a cell |
| ⬆️ ⬇️ ⬅️ ➡️ / **W A S D** | Move the cell cursor (clamped, no row wrap) |
| **Enter** / **Space** | Place on the cursor · start · resume · next round |
| **P** / **Esc** | Pause / resume |
| **R** | New round (keeps the match scores) |
| **N** | Cycle mode (PvP → Easy → Medium → Hard) |
| **1** / **2** / **3** / **4** | Jump to PvP / Easy / Medium / Hard (starts a new match) |
| **I** | Toggle marks: teeth ↔ classic X / O |
| **C** | Reset match scores (asks first — **Enter** confirms, **Esc** keeps) |
| **Shift + C** | Reset match scores without asking |
| **T** | Toggle dark / light theme (standalone page) |

> Before v2, **Esc** opened the reset-scores confirmation and **T** toggled the icons. Esc is now the arcade-wide pause key
> and T the arcade-wide theme key, so those moved to **C** (plus the *Reset scores* button) and **I**.

Arrow keys call `preventDefault()` so the page never scrolls. Cells are real `<button>`s with `aria-label`s (`Row 1, column 3, healthy tooth`).

## 🎯 Scoring & stats

Each **round is one arcade run**. When a round ends it is scored with the kit's shared `duelRoundScore` (the same formula Gomoku uses),
from the human's side, with `moves` = marks placed by both players and `boardCells` = 9:

| Result | Points | Easy (base 100) | Medium (base 250) | Hard (base 500) |
| --- | --- | --- | --- | --- |
| Win | `base × (1 + empty cells / 9)` | 144 (5-move win) … 100 | 361 … 250 | **722** … 500 |
| Draw | `base / 4` | 25 | 63 | 125 |
| Loss | 0 | 0 | 0 | 0 |
| PvP | 0 — unranked | | | |

Faster wins leave more of the board empty and pay more. A draw against the unbeatable Hard AI still earns points.

The stat strip shows:

| Stat | Meaning |
| --- | --- |
| **Points** | Match total of round scores in the current mode (saved with the session; reset on mode change, *Reset scores* or *Discard*) |
| **Best** | Best single-round score ever (`arcade.stats.tictactoe`, shared with the portal) |
| **W–L–D** | Your wins – AI wins – draws this match (in PvP: X wins – O wins – draws) |
| **Streak** | Current win streak / all-time best streak for this mode |
| **Time** | Active (unpaused) time of the current round |

Every finished round is recorded once by the kit under `arcade.stats.tictactoe` (`best`, `plays`, `wins`, `totalScore`,
`totalSeconds`, `lastScore`, `lastPlayedAt`). PvP rounds are recorded as unranked (`ranked: false`, from player 1 = X's side):
they count as plays but never touch Best or the leaderboard, and `onGameOver` is not called for them.
Per-mode best streaks keep their pre-kit keys `tictactoe.highScore.<mode>` (a streak, not a score — so it is not migrated into
arcade stats); the legacy single key `tictactoe.highScore` is still migrated into the Hard record once.

## 💾 Autosave & resume

The session is the **whole match**, not just the round: board, side to move, mode, starting mark, match scores, current streak and
points (key `arcade.session.tictactoe`, schema-versioned and checked by a strict validator that also rejects unreachable positions).
It is saved about once a second, whenever the page is hidden and when the game unmounts — and it is kept **between rounds**, so
closing the tab after a round never loses your W–L–D or points. Reloading shows **Welcome back** with the match paused
(*Continue* · *New round* · *New match*); a round that had already finished is not replayed — the match continues with a fresh round.
Only an explicit action drops it: **Discard** next to the *Autosaved* badge (back to a fresh, idle board), *Reset scores*, or
changing the mode (a new match).

## 🧩 Embedding in Arcade-Game-Center

```tsx
import { TicTacToeGame, TicTacToeDemo } from '@arcade/tictactoe';

<TicTacToeGame
  embedded                                   // hide the page title; the portal shows it
  onGameOver={(score) => submitScore('tictactoe', score)}   // ranked rounds with points > 0
  onRunEnd={(run) => console.log(run.outcome, run.ranked)}  // every round, PvP included
  onStatusChange={({ status, score, seconds }) => updateHeader(status, seconds)}
/>
<TicTacToeDemo active={cardIsVisible} />     // landing-page attract mode
```

Both components follow the shared `ArcadeGameProps` / `ArcadeDemoProps` contract from `src/arcade/types.ts`.

Status mapping: `idle` before the first round of a visit (Start overlay), `running` while a round is played, `paused` while
suspended (or restored), `gameOver` from the moment a round ends until the next one starts. `score` is the current round's score
(0 while playing); `runKey` is a round counter.

## 🧠 How it works

The engine is a single pure reducer, `advanceGame(state, action, { rng })`:

```
playing ──┬── (winning move) ───────────→ won   ─┐
          └── (board full, no winner) ───→ draw  ─┴─ newRound → playing (loser opens)
```

1. **`place`** drops the side-to-move's mark on an empty cell — rejected while it is the AI's turn, on filled cells and after the round ended.
2. **`aiMove`** asks `bestMove(board, mark, mode, rng)` for the AI's cell. The RNG is injected, so tests are deterministic.
3. **Win check first**, then draw check — a winning ninth mark is a win, never a draw.
4. A finished round is **scored** with `duelRoundScore`; points, W–L–D and the streak are updated in the same step.
5. **`newRound`** clears the board and keeps the match; **`changeMode`** starts a new match; **`resetScores`** zeroes it.

### 🤖 Game modes & AI

| Mode | Player 1 (X) | Player 2 (O) | Winnable? |
| --- | --- | --- | --- |
| **PvP** | Human | Human (same device) | Yes, by either player |
| **Easy** | Human | AI (uniform random) | Yes, almost always |
| **Medium** | Human | AI (5-step heuristic) | Yes, with effort |
| **Hard** | Human | AI (full α-β minimax) | **Never.** Best result is a draw |

Medium follows a strict priority: take the win → block the opponent's win → take the centre → a random corner → a random edge.
Hard runs full minimax with α-β pruning over the 3×3 tree (well under 1 ms per move), scoring `+10 − depth` for a win,
`depth − 10` for a loss and 0 for a draw — so it prefers shorter wins and longer losses. The test suite proves it never loses by
walking **every** possible human reply from the empty board, with the human moving first and second.

`useAITurn` schedules the AI move after the chosen delay only while the round is running (not idle, paused or behind the
reset dialog); the timer is cancelled on every state change and on unmount, so no stale move ever lands.

### 🦷 Tooth icons

| Mark | Icon | Colour |
| --- | --- | --- |
| `X` | 🦷 **Healthy** molar | medical blue `#4a8cf0` |
| `O` | 🦷 **Decayed** molar (with cavity) | aged enamel `#c9933f` |

Both share one inline-SVG silhouette (`currentColor` stroke, ivory fill), so the board reads as a *grid of teeth* — the difference is
the dental state. (The author is a dentist.) The internal model is always `'X'` / `'O'`; only the rendering swaps.

### 🎬 Demo

`TicTacToeDemo` pits AIs of mixed strength against each other (medium vs easy, easy vs hard, hard vs medium, …) through the real
`advanceGame`, one move every 400 ms, and restarts 1.2 s after each result — alternating tooth and X/O marks. It has no keyboard
listeners, no sound, no stats and no storage writes, and freezes when `active` is false.

## 🧪 Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (logic + component tests) |
| `npm run check` | lint → typecheck → test → build (what CI runs) |

## 🏗️ Architecture

```
src/
  arcade/              vendored Zoltan's Arcade kit — do not edit here (see its README)
  logic/               pure game rules
    types.ts constants.ts grid.ts win.ts
    ai.ts              easy / medium / hard (α-β minimax), RNG injected
    game.ts            advanceGame reducer, createInitialState, roundOutcome, scoring
    autopilot.ts       AI-vs-AI driver + seeded RNG for the demo
    persist.ts         strict runtime validation of saved sessions
  hooks/               useAITurn, useKeyboardSelect, useBestStreak, useIconStyle, useAIDelay, useSound
  components/          GameBoard (full + mini), Cell, ToothIcon, WinningLine, ModeSelect, AISpeedToggle,
                       IconStyleToggle, SoundToggle
  demo/TicTacToeDemo.tsx  landing-page attract mode
  TicTacToeGame.tsx    the embeddable game (ArcadeGameProps)
  App.tsx              standalone page: <ArcadeShell><TicTacToeGame/></ArcadeShell>
  main.tsx             entry; loads the shared arcade.css once
  index.ts             package entry used by Arcade-Game-Center
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md), the [Code of Conduct](./CODE_OF_CONDUCT.md) and [SECURITY.md](./SECURITY.md).
Contributors are listed in [CONTRIBUTORS.md](./CONTRIBUTORS.md); changes in [CHANGELOG.md](./CHANGELOG.md).
The original v1 design notes live in [GAME-PLAN.md](./GAME-PLAN.md).

## ⚖️ License

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">Made with 🦷 by Zoltán Dul · part of <a href="https://github.com/ZoliQua/Arcade-Game-Center">Zoltan's Arcade</a></p>
