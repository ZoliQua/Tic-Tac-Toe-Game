# 🦷 Tic-Tac-Toe — Zahn-Edition

[English](README.md) · **Deutsch** · [Magyar](README.hu.md)

Ein minimalistisches, typsicheres Tic-Tac-Toe mit **Zahn-Symbolen** (oder klassischem X / O), gebaut mit **React 18**, **Vite** und **TypeScript** — für Tastatur und Touch, rasterbasiertes DOM, kein Canvas, keine Spiel-Engine.
Läuft allein **und** als eines der fünfzehn Spiele von **[Zoltan's Arcade](https://github.com/ZoliQua/Arcade-Game-Center)**.

[![CI](https://github.com/ZoliQua/Tic-Tac-Toe-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Tic-Tac-Toe-Game/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Inhaltsverzeichnis

- [Die Zoltan's-Arcade-Familie](#-die-zoltans-arcade-familie)
- [Funktionen](#-funktionen)
- [Schnellstart](#-schnellstart)
- [Steuerung](#%EF%B8%8F-steuerung)
- [Auf dem Handy](#-auf-dem-handy)
- [Punkte & Statistik](#-punkte--statistik)
- [Autospeichern & Fortsetzen](#-autospeichern--fortsetzen)
- [Einbindung in Arcade-Game-Center](#-einbindung-in-arcade-game-center)
- [So funktioniert es](#-so-funktioniert-es)
- [Skripte](#-skripte)
- [Architektur](#%EF%B8%8F-architektur)
- [Mitwirken](#-mitwirken)
- [Lizenz](#%EF%B8%8F-lizenz)

## 🕹️ Die Zoltan's-Arcade-Familie

Jedes Spiel ist ein eigenständiges Repo, das sich auch ins Portal einklinkt. Alle teilen ein Designsystem, ein Punktemodell und ein Speicherformat über das mitgelieferte Kit [`src/arcade/`](./src/arcade).

| Spiel | Repo | Genre |
| --- | --- | --- |
| 🏠 **Arcade-Portal** | [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) | Alle Spiele an einem Ort, Live-Demos, Statistik, Bestenliste |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reaktion |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Puzzle |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Labyrinth |
| ⚫ Gomoku | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Strategie |
| 🦷 **Tic-Tac-Toe** (dieses Repo) | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Duell |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Schläger |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Shooter |
| 🔴 Connect Four | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Duell |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Sortieren |
| 🃏 Texas Hold'em | [Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game) | Karten |
| 💣 Minesweeper | [Minesweeper-Game](https://github.com/ZoliQua/Minesweeper-Game) | Logik |
| ♠️ Solitaire | [Solitaire-Game](https://github.com/ZoliQua/Solitaire-Game) | Karten |
| 🎴 Ulti | [Ulti-Game](https://github.com/ZoliQua/Ulti-Game) | Karten |
| 🂡 Snapszer | [Snapszer-Game](https://github.com/ZoliQua/Snapszer-Game) | Karten |

## ✨ Funktionen

- 🎮 **Vier Modi** — Spieler gegen Spieler, Leicht (zufällige KI), Mittel (heuristische KI), Schwer (α-β-Minimax — **verliert nie**)
- 🏆 **Einheitliche Arcade-Wertung** — jede Runde wird mit der gemeinsamen Duell-Formel gewertet; Bestwert, Spiele und Siege werden mit dem Portal geteilt
- 🔥 **Beste Serien pro Modus** — PvP / Leicht / Mittel / Schwer führen je einen eigenen Allzeit-Rekord für Siegesserien
- 🔄 **Verlierer beginnt** — der Verlierer der letzten Runde eröffnet die nächste (bei Unentschieden und abgebrochenen Runden wechselt der Beginn)
- ⏸️ **Pause** (P / Esc) — friert Feld, KI und Rundenuhr ein
- 📖 **Regeln** — ein Knopf öffnet die Regeln mit Diagramm; wer sie mitten in der Runde öffnet, pausiert das Spiel
- 🏁 **Vorzeitig beenden** — beendet die aktuelle Runde nach einer Rückfrage mit Absicht und wertet ihre Punkte
- 📱 **Touch und Vollbild** — zum Spielen auf ein Feld tippen; ein Vollbild-Knopf blendet die Browserleisten aus
- 💾 **Autospeichern & Fortsetzen** — das ganze Match (Feld, Stände, Serie, Punkte) überlebt Neuladen und geschlossene Tabs
- ⚡ **KI-Tempo** — Bedenkzeit Sofort / 0,15 s / 0,4 s / 1 s, wird gemerkt
- 🔔 **Optionaler Ton** — prozedurale Web-Audio-Töne beim Setzen, Sieg und Unentschieden; standardmäßig aus
- 🌗 **Dunkles / helles Design**, geteilt mit allen Arcade-Spielen (Taste **T**)
- 🌍 **Drei Sprachen** — Englisch, Ungarisch und Deutsch; umschaltbar in der oberen Leiste oder in den Einstellungen (auch `?lang=en|hu|de` zum Weitergeben per Link); Zahlen folgen der Gruppierung der Sprache
- 🦷 **Zahnmodus** — ein Schalter „Fogas mód“ / „Dental mode“ / „Zahnmodus“ in den Einstellungen, standardmäßig aus (oder `?dental=1`), geteilt mit der ganzen Arcade. Bei eingeschaltetem Zahnmodus werden X und O zu einem gesunden und einem kariösen Zahn; ausgeschaltet zeigt klassisches X/O. Umschaltbar in den Einstellungen, über den Schalter in der oberen Leiste oder mit **I**; eine alte Wahl `tictactoe.iconStyle = 'tooth'` wird einmalig nach `arcade.dental` übernommen. Nur Darstellung
- 🤖 **Attract-Mode-Demo** (`<TicTacToeDemo />`) — zwei KIs unterschiedlicher Stärke spielen mit der echten Engine auf der Startseite des Portals
- ⌨️ **Tastatur zuerst**; Tastenkürzel werden ignoriert, solange du in ein Formularfeld tippst oder Cmd/Strg/Alt hältst
- 🧪 **Getestet** — jede Gewinnreihe, Unentschieden, ein *erschöpfender* Beweis, dass die schwere KI nie verliert, Wertung, der Speicher-Validator und das Komponentenverhalten

## 🚀 Schnellstart

Benötigt **Node ≥ 20** und npm.

```bash
git clone https://github.com/ZoliQua/Tic-Tac-Toe-Game.git
cd Tic-Tac-Toe-Game
npm install
npm run dev          # http://localhost:5173
```

Produktions-Build: `npm run build && npm run preview`. Der Build nutzt relative Asset-Pfade, `dist/` lässt sich also aus jedem Unterordner ausliefern.

## ⌨️ Steuerung

| Taste | Aktion |
| --- | --- |
| 🖱️ Klick / Tippen | Dein Zeichen auf ein Feld setzen |
| Knopf **Regeln** | Regeln öffnen (pausiert die Runde; **R** bleibt *Neue Runde*) |
| ⬆️ ⬇️ ⬅️ ➡️ / **W A S D** | Feld-Cursor bewegen (begrenzt, kein Zeilenumbruch) |
| **Enter** / **Leertaste** | Auf den Cursor setzen · starten · fortsetzen · nächste Runde |
| **P** / **Esc** | Pause / Fortsetzen |
| **R** | Neue Runde (die Match-Stände bleiben) |
| **N** | Modus durchschalten (PvP → Leicht → Mittel → Schwer) |
| **1** / **2** / **3** / **4** | Direkt zu PvP / Leicht / Mittel / Schwer (startet ein neues Match) |
| **I** | Zeichen umschalten: Zähne ↔ klassisches X / O |
| **C** | Match-Stände zurücksetzen (fragt vorher — **Enter** bestätigt, **Esc** behält) |
| **Umschalt + C** | Match-Stände ohne Rückfrage zurücksetzen |
| **T** | Dunkles / helles Design umschalten (eigenständige Seite) |

> Vor v2 öffnete **Esc** die Rückfrage zum Zurücksetzen und **T** schaltete die Symbole um. Esc ist jetzt die arcade-weite Pausetaste
> und T die arcade-weite Designtaste, deshalb wanderten diese Funktionen auf **C** (plus den Knopf *Stände zurücksetzen*) und **I**.

Die Pfeiltasten rufen `preventDefault()` auf, die Seite scrollt also nie. Die Felder sind echte `<button>`s mit `aria-label` (`Row 1, column 3, healthy tooth`).

### 📱 Auf dem Handy

Tippe auf ein leeres Feld, um dein Zeichen zu setzen; die Felder sind große Touch-Ziele, und die Seite zoomt oder scrollt nicht, während du spielst.
Der Knopf **Regeln** erklärt das Spiel, **Beenden** schließt die aktuelle Runde vorzeitig ab (die Punkte der Runde — 0, bis sie entschieden ist — kommen
in die Bestenliste) und **Vollbild** blendet die Browserleisten aus. Auf dem iPhone sorgt *Teilen → Zum Home-Bildschirm* für eine Ansicht ohne Leisten.

## 🎯 Punkte & Statistik

Jede **Runde ist ein Arcade-Lauf**. Endet eine Runde, wird sie mit der gemeinsamen `duelRoundScore` des Kits gewertet (dieselbe Formel wie bei Gomoku),
aus Sicht des Menschen, mit `moves` = von beiden gesetzte Zeichen und `boardCells` = 9:

| Ergebnis | Punkte | Leicht (Basis 100) | Mittel (Basis 250) | Schwer (Basis 500) |
| --- | --- | --- | --- | --- |
| Sieg | `Basis × (1 + leere Felder / 9)` | 144 (Sieg in 5 Zügen) … 100 | 361 … 250 | **722** … 500 |
| Unentschieden | `Basis / 4` | 25 | 63 | 125 |
| Niederlage | 0 | 0 | 0 | 0 |
| PvP | 0 — ungewertet | | | |

Schnellere Siege lassen mehr vom Feld leer und zahlen mehr. Auch ein Unentschieden gegen die unbesiegbare schwere KI bringt Punkte.

Die Statusleiste zeigt:

| Wert | Bedeutung |
| --- | --- |
| **Punkte** | Match-Summe der Rundenpunkte im aktuellen Modus (mit der Sitzung gespeichert; zurückgesetzt bei Moduswechsel, *Stände zurücksetzen* oder *Verwerfen*) |
| **Bestwert** | Beste Einzelrunde aller Zeiten (`arcade.stats.tictactoe`, mit dem Portal geteilt) |
| **S–N–U** | Deine Siege – KI-Siege – Unentschieden in diesem Match (in PvP: X-Siege – O-Siege – Unentschieden) |
| **Serie** | Aktuelle Siegesserie / Allzeit-Bestserie für diesen Modus |
| **Zeit** | Aktive (nicht pausierte) Zeit der aktuellen Runde |

Jede beendete Runde wird vom Kit genau einmal unter `arcade.stats.tictactoe` erfasst (`best`, `plays`, `wins`, `totalScore`,
`totalSeconds`, `lastScore`, `lastPlayedAt`). PvP-Runden werden als ungewertet erfasst (`ranked: false`, aus Sicht von Spieler 1 = X):
Sie zählen als Spiele, berühren aber nie den Bestwert oder die Bestenliste, und `onGameOver` wird für sie nicht aufgerufen.
Eine vorzeitig beendete Runde wertet ihre aktuellen Punkte (0, solange die Runde nicht entschieden ist) und ruft `onGameOver(score, { finished: true })` auf.
Die besten Serien pro Modus behalten ihre Schlüssel aus der Zeit vor dem Kit, `tictactoe.highScore.<mode>` (eine Serie, keine Punktzahl — sie wird also nicht
in die Arcade-Statistik übernommen); der alte Einzelschlüssel `tictactoe.highScore` wird weiterhin einmalig in den Rekord für Schwer übernommen.

## 💾 Autospeichern & Fortsetzen

Die Sitzung ist das **ganze Match**, nicht nur die Runde: Feld, Spieler am Zug, Modus, Startzeichen, Match-Stände, aktuelle Serie und
Punkte (Schlüssel `arcade.session.tictactoe`, mit Schema-Version und von einem strengen Validator geprüft, der auch unerreichbare Stellungen ablehnt).
Sie wird etwa einmal pro Sekunde gespeichert, immer wenn die Seite verborgen wird und wenn das Spiel entladen wird — und sie bleibt **zwischen den Runden** erhalten,
das Schließen des Tabs nach einer Runde kostet also nie deinen S–N–U-Stand oder deine Punkte. Beim Neuladen erscheint **Willkommen zurück** mit pausiertem Match
(*Weiter* · *Neue Runde* · *Neues Match*); eine bereits beendete Runde wird nicht erneut gespielt — das Match geht mit einer frischen Runde weiter.
Nur eine ausdrückliche Aktion verwirft sie: **Verwerfen** neben dem Hinweis *Automatisch gespeichert* (zurück zu einem frischen, leeren Feld), *Stände zurücksetzen* oder
ein Moduswechsel (neues Match). Eine vorzeitig beendete Runde löscht die Sicherung; die nächste Runde beginnt wieder mit dem Speichern.

## 🧩 Einbindung in Arcade-Game-Center

```tsx
import { TicTacToeGame, TicTacToeDemo } from '@arcade/tictactoe';

<TicTacToeGame
  embedded                                   // Seitentitel ausblenden; das Portal zeigt ihn
  onGameOver={(score) => submitScore('tictactoe', score)}   // gewertete Runden mit Punkten > 0, oder eine vorzeitig beendete Runde (zweites Argument { finished: true }, auch bei 0)
  onRunEnd={(run) => console.log(run.outcome, run.ranked)}  // jede Runde, auch PvP
  onStatusChange={({ status, score, seconds }) => updateHeader(status, seconds)}
/>
<TicTacToeDemo active={cardIsVisible} />     // Attract-Mode für die Startseite
```

Beide Komponenten folgen dem gemeinsamen Vertrag `ArcadeGameProps` / `ArcadeDemoProps` aus `src/arcade/types.ts`.

Statuszuordnung: `idle` vor der ersten Runde eines Besuchs (Start-Overlay), `running` während eine Runde gespielt wird, `paused` bei Unterbrechung
(oder nach Wiederherstellung), `gameOver` ab dem Moment, in dem eine Runde endet, bis die nächste beginnt. `score` ist die Punktzahl der aktuellen Runde
(0 während des Spiels); `runKey` ist ein Rundenzähler.

## 🧠 So funktioniert es

Die Engine ist ein einziger reiner Reducer, `advanceGame(state, action, { rng })`:

```
playing ──┬── (Gewinnzug) ──────────────→ won   ─┐
          └── (Feld voll, kein Sieger) ──→ draw  ─┴─ newRound → playing (Verlierer eröffnet)
```

1. **`place`** setzt das Zeichen der Seite am Zug auf ein leeres Feld — abgelehnt, wenn die KI dran ist, bei belegten Feldern und nach dem Rundenende.
2. **`aiMove`** fragt `bestMove(board, mark, mode, rng)` nach dem Feld der KI. Der Zufallsgenerator wird injiziert, die Tests sind also deterministisch.
3. **Erst die Gewinnprüfung**, dann die Unentschieden-Prüfung — ein gewinnendes neuntes Zeichen ist ein Sieg, nie ein Unentschieden.
4. Eine beendete Runde wird mit `duelRoundScore` **gewertet**; Punkte, S–N–U und die Serie werden im selben Schritt aktualisiert.
5. **`newRound`** leert das Feld und behält das Match; **`changeMode`** startet ein neues Match; **`resetScores`** nullt es; **`finish`** beendet die Runde vorzeitig, ohne Ergebnis.

### 🤖 Spielmodi & KI

| Modus | Spieler 1 (X) | Spieler 2 (O) | Zu gewinnen? |
| --- | --- | --- | --- |
| **PvP** | Mensch | Mensch (am selben Gerät) | Ja, durch beide Spieler |
| **Leicht** | Mensch | KI (gleichverteilt zufällig) | Ja, fast immer |
| **Mittel** | Mensch | KI (Heuristik in 5 Schritten) | Ja, mit Mühe |
| **Schwer** | Mensch | KI (vollständiges α-β-Minimax) | **Nie.** Bestes Ergebnis ist ein Unentschieden |

Mittel folgt einer strengen Rangfolge: Gewinn nehmen → Gewinn des Gegners blocken → Mitte nehmen → eine zufällige Ecke → eine zufällige Kante.
Schwer führt vollständiges Minimax mit α-β-Beschneidung über den 3×3-Baum aus (deutlich unter 1 ms pro Zug) und bewertet `+10 − Tiefe` für einen Sieg,
`Tiefe − 10` für eine Niederlage und 0 für ein Unentschieden — es bevorzugt also kürzere Siege und längere Niederlagen. Die Tests beweisen, dass es nie verliert,
indem sie **jede** mögliche menschliche Antwort vom leeren Feld aus durchgehen, einmal mit dem Menschen am Zug und einmal als Zweitem.

`useAITurn` plant den KI-Zug nach der gewählten Verzögerung nur, solange die Runde läuft (nicht idle, nicht pausiert, nicht hinter dem
Rückfragedialog oder der Bestätigung zum Beenden); der Timer wird bei jeder Zustandsänderung und beim Entladen abgebrochen, es landet also nie ein veralteter Zug.

### 🦷 Zahn-Symbole

| Zeichen | Symbol | Farbe |
| --- | --- | --- |
| `X` | 🦷 **Gesunder** Backenzahn | medizinisches Blau `#4a8cf0` |
| `O` | 🦷 **Kariöser** Backenzahn (mit Loch) | gealterter Zahnschmelz `#c9933f` |

Beide teilen sich eine Inline-SVG-Silhouette (Strich in `currentColor`, elfenbeinfarbene Füllung), das Feld wirkt also wie ein *Raster aus Zähnen* — der Unterschied ist
der Zahnzustand. (Der Autor ist Zahnarzt.) Das interne Modell ist immer `'X'` / `'O'`; nur die Darstellung wechselt.

### 🎬 Demo

`TicTacToeDemo` lässt KIs unterschiedlicher Stärke gegeneinander antreten (Mittel gegen Leicht, Leicht gegen Schwer, Schwer gegen Mittel, …), über die echte
`advanceGame`, ein Zug alle 400 ms, und startet 1,2 s nach jedem Ergebnis neu — im Wechsel mit Zahn- und X/O-Zeichen. Es hat keine Tastatur-Listener,
keinen Ton, keine Statistik und keine Speicherzugriffe und friert ein, wenn `active` false ist.

## 🧪 Skripte

| Skript | Zweck |
| --- | --- |
| `npm run dev` | Vite-Entwicklungsserver |
| `npm run build` | Typprüfung (`tsc -b`) und Produktions-Build |
| `npm run preview` | Produktions-Build ausliefern |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (Logik- und Komponententests) |
| `npm run check` | lint → typecheck → test → build (was die CI ausführt) |

## 🏗️ Architektur

```
src/
  arcade/              mitgeliefertes Zoltan's-Arcade-Kit — hier nicht bearbeiten (siehe dessen README)
  logic/               reine Spielregeln
    types.ts constants.ts grid.ts win.ts
    ai.ts              Leicht / Mittel / Schwer (α-β-Minimax), RNG injiziert
    game.ts            advanceGame-Reducer, createInitialState, roundOutcome, Wertung
    autopilot.ts       KI-gegen-KI-Treiber + Seed-RNG für die Demo
    persist.ts         strenge Laufzeitprüfung gespeicherter Sitzungen
  hooks/               useAITurn, useKeyboardSelect, useBestStreak, useIconStyle, useAIDelay, useSound
  components/          GameBoard (voll + mini), Cell, ToothIcon, WinningLine, ModeSelect, AISpeedToggle,
                       DentalToggle, SoundToggle
  demo/TicTacToeDemo.tsx  Attract-Mode für die Startseite
  rules.tsx            Regeln-Abschnitte und das Diagramm „drei in einer Reihe“
  TicTacToeGame.tsx    das einbettbare Spiel (ArcadeGameProps)
  App.tsx              eigenständige Seite: <ArcadeShell><TicTacToeGame/></ArcadeShell>
  main.tsx             Einstieg; lädt die gemeinsame arcade.css einmal
  index.ts             Paket-Einstieg für Arcade-Game-Center
```

## 🤝 Mitwirken

Siehe [CONTRIBUTING.md](./CONTRIBUTING.md), den [Verhaltenskodex](./CODE_OF_CONDUCT.md) und [SECURITY.md](./SECURITY.md).
Mitwirkende stehen in [CONTRIBUTORS.md](./CONTRIBUTORS.md); Änderungen in [CHANGELOG.md](./CHANGELOG.md).
Die ursprünglichen Entwurfsnotizen zu v1 liegen in [GAME-PLAN.md](./GAME-PLAN.md).

## ⚖️ Lizenz

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">Mit 🦷 gemacht von Zoltán Dul · Teil von <a href="https://github.com/ZoliQua/Arcade-Game-Center">Zoltan's Arcade</a></p>
