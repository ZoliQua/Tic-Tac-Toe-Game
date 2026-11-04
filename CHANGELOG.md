# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [2.1.2] — 2026-12-06

### Changed

- Vendored kit (`src/arcade/`) updated: the registry knows the eleventh arcade game, Texas Hold'em, with its accent colour.
- README: the Zoltan's Arcade family table lists all eleven games.

## [2.1.1] — 2026-11-22

### Changed

- Vendored kit (`src/arcade/`) updated: the registry knows the tenth arcade game, Nut Sort, with its accent colour.
- README: the Zoltan's Arcade family table lists all ten games.

## [2.1.0] — 2026-11-13

### Changed

- Vendored kit (`src/arcade/`) updated: the registry knows the three new arcade games — Breakout, Space Invaders and
  Connect Four — with their accent colours; the duel round-score docs mention Connect Four.
- README: the Zoltan's Arcade family table lists all nine games.

## [2.0.0] — 2026-10-24

### Added
- Shared Zoltan's Arcade kit (`src/arcade/`): unified stats, theme, standalone shell and UI; the game now joins the portal as `tictactoe`.
- Round scoring with the kit's `duelRoundScore` (difficulty = mode, moves = marks placed, 9 cells); PvP rounds are unranked.
  New **Points** (match total) and **Best** (best round, `arcade.stats.tictactoe`) stats.
- Pause / resume with **P** / **Esc** — freezes the board, the AI and the round timer.
- Autosave & resume of the whole match (`arcade.session.tictactoe`, strict validator), restored paused with a *Welcome back* overlay.
- `TicTacToeDemo` attract mode: AIs of mixed strength play the real engine, used on the portal landing page.
- `embedded`, `onGameOver`, `onRunEnd` and `onStatusChange` props (shared `ArcadeGameProps` contract).
- Idle start screen, *Reset scores* button, *New match* action.
- Vitest + Testing Library suite (all 8 lines, draws, exhaustive never-loses proof for the hard AI, scoring, validator,
  demo, component behaviour) replacing `scripts/sanity.mjs`; `npm run check`, GitHub Actions CI.
- Code of Conduct, Contributing, Contributors and Security docs, issue/PR templates, game favicon.

### Changed
- The game opens in **Medium** (ranked) mode; PvP is still one key (1) away.
- Score panel, overlays, buttons and settings use the shared arcade design system and work in the dark **and** light theme.
- Keys: the reset-scores confirmation moved from **Esc** to **C** (**Shift+C** skips it; was Shift+Esc) because Esc is the
  arcade pause key; the icon-style toggle moved from **T** to **I** because T is the arcade theme toggle.
  The confirmation is now an in-board overlay (**Enter** confirms, **Esc** keeps).
- Match scores, streak and points are kept across reloads (they used to reset on every page load).
- The round timer is the kit's pause-aware `useRunTimer`.
- Styles are CSS Modules on kit tokens; the global `page.css` / `ttt.css` stylesheets are gone. Toolchain aligned with the
  other arcade games (ESLint flat config with `typescript-eslint`, Vitest, `base: './'`).

### Fixed
- Pressing Enter/Space during the AI's thinking delay placed the **AI's** mark for the human; `place` now rejects moves on the AI's turn.
- Hotkeys fired while typing in form fields and with Cmd/Ctrl held (Cmd+R started a new round, Cmd+1…4 switched the mode while switching browser tabs).
- **T** clashed with the arcade theme toggle.
- The round timer restarted from zero on every status change and when scores were reset mid-round, and never paused.
- `npm run typecheck` checked nothing (`tsc --noEmit` on the empty solution tsconfig); it now runs `tsc -b`.
- Light theme was unreadable (hard-coded light text and a `prefers-color-scheme` query that ignored the arcade theme).
- The keyboard listener was re-attached on every focus / status change; it is now attached once per mount.
- Favicon used an absolute `/tooth.svg` path that broke when served from a sub-folder.
- Memoised cells re-rendered on every change because their callbacks were recreated each render.

## [1.0.0] — 2026-04-27

- First release: Tooth Edition Tic-Tac-Toe with PvP, Easy, Medium and Hard (minimax) modes, best streak and round timer.
- 2026-04-28: classic X / O icon style with a toggle.
- 2026-04-30: loser-goes-first, AI speed setting, per-mode best streaks, Esc reset confirmation, optional sound
  (shipped without a version bump).
