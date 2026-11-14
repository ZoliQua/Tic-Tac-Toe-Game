# 🦷 Tic-Tac-Toe — Fogas kiadás

[English](README.md) · [Deutsch](README.de.md) · **Magyar**

Minimalista, típusbiztos amőba (Tic-Tac-Toe) **fogas ikonokkal** (vagy klasszikus X / O jelekkel), **React 18**, **Vite** és **TypeScript** alapokon – billentyűzetre és érintésre is, rácsos DOM, canvas és játékmotor nélkül.
Önállóan fut, **és** a **[Zoltan's Arcade](https://github.com/ZoliQua/Arcade-Game-Center)** tizenöt játékának egyike.

[![CI](https://github.com/ZoliQua/Tic-Tac-Toe-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Tic-Tac-Toe-Game/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Tartalom

- [A Zoltan's Arcade család](#-a-zoltans-arcade-család)
- [Funkciók](#-funkciók)
- [Gyors kezdés](#-gyors-kezdés)
- [Irányítás](#%EF%B8%8F-irányítás)
- [Mobilon](#-mobilon)
- [Pontozás és statisztika](#-pontozás-és-statisztika)
- [Automatikus mentés és folytatás](#-automatikus-mentés-és-folytatás)
- [Beágyazás az Arcade-Game-Centerbe](#-beágyazás-az-arcade-game-centerbe)
- [Hogyan működik](#-hogyan-működik)
- [Szkriptek](#-szkriptek)
- [Felépítés](#%EF%B8%8F-felépítés)
- [Közreműködés](#-közreműködés)
- [Licenc](#%EF%B8%8F-licenc)

## 🕹️ A Zoltan's Arcade család

Minden játék önálló repó, amely a portálba is becsatlakozik. Egy közös dizájnrendszeren, egy pontozási modellen és egy mentési formátumon osztoznak a becsomagolt [`src/arcade/`](./src/arcade) kiten keresztül.

| Játék | Repó | Műfaj |
| --- | --- | --- |
| 🏠 **Arcade portál** | [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) | Minden játék egy helyen, élő demók, statisztika, ranglista |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reflex |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Fejtörő |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Labirintus |
| ⚫ Gomoku | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Stratégia |
| 🦷 **Tic-Tac-Toe** (ez a repó) | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Párbaj |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Ütő |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Lövöldözős |
| 🔴 Connect Four | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Párbaj |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Rendezős |
| 🃏 Texas Hold'em | [Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game) | Kártya |
| 💣 Minesweeper | [Minesweeper-Game](https://github.com/ZoliQua/Minesweeper-Game) | Logika |
| ♠️ Solitaire | [Solitaire-Game](https://github.com/ZoliQua/Solitaire-Game) | Kártya |
| 🎴 Ulti | [Ulti-Game](https://github.com/ZoliQua/Ulti-Game) | Kártya |
| 🂡 Snapszer | [Snapszer-Game](https://github.com/ZoliQua/Snapszer-Game) | Kártya |

## ✨ Funkciók

- 🎮 **Négy mód** – játékos a játékos ellen, Könnyű (véletlen MI), Közepes (heurisztikus MI), Nehéz (α-β minimax – **soha nem veszít**)
- 🏆 **Egységes arcade pontozás** – minden kör a közös párbajképlettel kap pontot; a legjobb pontszám, a játékok és a győzelmek közösek a portállal
- 🔥 **Módonkénti legjobb sorozat** – a PvP / Könnyű / Közepes / Nehéz mind külön örökranglistás győzelmi sorozat-rekordot tart
- 🔄 **A vesztes kezd** – az előző kör vesztese nyitja a következőt (döntetlennél és megszakított körnél váltakozik a kezdő)
- ⏸️ **Szünet** (P / Esc) – megállítja a táblát, az MI-t és a körórát
- 📖 **Szabályok** – egy gomb megnyitja a szabályokat ábrával; kör közben megnyitva szünetelteti a játékot
- 🏁 **Idő előtti befejezés** – megerősítés után szándékosan lezárja az aktuális kört, és rangsorolja a pontszámát
- 📱 **Érintés és teljes képernyő** – a játékhoz elég egy mezőre koppintani; a teljes képernyő gomb eltünteti a böngészősávokat
- 💾 **Automatikus mentés és folytatás** – az egész meccs (tábla, állás, sorozat, pontok) túléli az újratöltést és a lap bezárását
- ⚡ **MI-sebesség** – Azonnali / 0,15 mp / 0,4 mp / 1 mp gondolkodási késleltetés, megjegyzi a beállítást
- 🔔 **Opcionális hang** – procedurális Web Audio hangok lerakáskor, győzelemkor és döntetlenkor; alapból ki van kapcsolva
- 🌗 **Sötét / világos téma**, közös az összes arcade játékkal (**T** billentyű)
- 🌍 **Három nyelv** – angol, magyar és német; a felső sávban vagy a beállításokban váltható (link átadásához `?lang=en|hu|de` is); a számok a nyelv csoportosítását követik
- 🦷 **Fogas mód** – a beállításokban egy „Fogas mód” / „Dental mode” / „Zahnmodus” kapcsoló, alapból kikapcsolva (vagy `?dental=1`), közös az egész arcade-dal. Bekapcsolt fogas módban az X és az O egy ép és egy szuvas fog lesz; kikapcsolva klasszikus X/O látszik. Váltható a beállításokban, a felső sáv kapcsolójával vagy az **I** billentyűvel; a régi `tictactoe.iconStyle = 'tooth'` választás egyszer átkerül az `arcade.dental`-ba. Csak megjelenés
- 🤖 **Bemutató demó** (`<TicTacToeDemo />`) – két különböző erősségű MI játszik a valódi motorral a portál nyitóoldalán
- ⌨️ **Billentyűzet az elsők között**; a gyorsbillentyűket figyelmen kívül hagyja, amíg űrlapmezőbe gépelsz vagy Cmd/Ctrl/Alt-ot tartasz
- 🧪 **Tesztelt** – minden nyerő vonal, a döntetlenek, *kimerítő* bizonyíték arra, hogy a nehéz MI sosem veszít, a pontozás, a mentés-ellenőrző és a komponensek viselkedése

## 🚀 Gyors kezdés

**Node ≥ 20** és npm szükséges.

```bash
git clone https://github.com/ZoliQua/Tic-Tac-Toe-Game.git
cd Tic-Tac-Toe-Game
npm install
npm run dev          # http://localhost:5173
```

Éles build: `npm run build && npm run preview`. A build relatív erőforrás-útvonalakat használ, így a `dist/` bármelyik almappából kiszolgálható.

## ⌨️ Irányítás

| Billentyű | Művelet |
| --- | --- |
| 🖱️ Kattintás / koppintás | A jeled lerakása egy mezőre |
| **Szabályok** gomb | A szabályok megnyitása (szünetelteti a kört; az **R** továbbra is *Új kör*) |
| ⬆️ ⬇️ ⬅️ ➡️ / **W A S D** | A mezőkurzor mozgatása (korlátozott, nincs sortörés) |
| **Enter** / **Szóköz** | Lerakás a kurzorra · indítás · folytatás · következő kör |
| **P** / **Esc** | Szünet / folytatás |
| **R** | Új kör (a meccs állása megmarad) |
| **N** | Mód léptetése (PvP → Könnyű → Közepes → Nehéz) |
| **1** / **2** / **3** / **4** | Ugrás a PvP / Könnyű / Közepes / Nehéz módra (új meccset indít) |
| **I** | Jelek váltása: fogak ↔ klasszikus X / O |
| **C** | A meccs állásának nullázása (előbb rákérdez – **Enter** megerősít, **Esc** megtart) |
| **Shift + C** | A meccs állásának nullázása kérdés nélkül |
| **T** | Sötét / világos téma váltása (önálló oldalon) |

> A v2 előtt az **Esc** a nullázás megerősítését nyitotta, a **T** pedig az ikonokat váltotta. Az Esc mostantól az arcade-szintű szünet billentyű,
> a T pedig az arcade-szintű téma billentyű, ezért ezek a funkciók a **C** (és az *Eredmények nullázása* gomb), illetve az **I** billentyűre költöztek.

A nyílbillentyűk meghívják a `preventDefault()`-ot, így az oldal sosem görög. A mezők valódi `<button>`-ök `aria-label`-lel (`Row 1, column 3, healthy tooth`).

### 📱 Mobilon

Koppints egy üres mezőre a jeled lerakásához; a mezők nagy érintési felületek, és játék közben az oldal nem nagyít és nem görög.
A **Szabályok** gomb elmagyarázza a játékot, a **Befejezés** idő előtt lezárja az aktuális kört (a kör pontszáma – 0, amíg el nem dől – felkerül
a ranglistára), a **Teljes képernyő** pedig eltünteti a böngészősávokat. iPhone-on a *Megosztás → Főképernyőhöz adás* sáv nélküli nézetet ad.

## 🎯 Pontozás és statisztika

Minden **kör egy arcade futás**. Amikor egy kör véget ér, a kit közös `duelRoundScore` függvényével kap pontot (ugyanaz a képlet, mint a Gomokunál),
az ember oldaláról nézve, ahol a `moves` = mindkét fél lerakott jelei, a `boardCells` = 9:

| Eredmény | Pont | Könnyű (alap 100) | Közepes (alap 250) | Nehéz (alap 500) |
| --- | --- | --- | --- | --- |
| Győzelem | `alap × (1 + üres mezők / 9)` | 144 (5 lépéses győzelem) … 100 | 361 … 250 | **722** … 500 |
| Döntetlen | `alap / 4` | 25 | 63 | 125 |
| Vereség | 0 | 0 | 0 | 0 |
| PvP | 0 – nem rangsorolt | | | |

A gyorsabb győzelem több üres mezőt hagy, és többet ér. A legyőzhetetlen Nehéz MI elleni döntetlen is pontot ér.

Az állapotsáv ezt mutatja:

| Érték | Jelentés |
| --- | --- |
| **Pontok** | A körpontok meccsösszege az aktuális módban (a munkamenettel mentődik; módváltáskor, az *Eredmények nullázása* vagy az *Elvetés* gombnál nullázódik) |
| **Legjobb** | A valaha elért legjobb egyetlen körpont (`arcade.stats.tictactoe`, közös a portállal) |
| **Gy–V–D** | A te győzelmeid – az MI győzelmei – döntetlenek ebben a meccsben (PvP-ben: X-győzelmek – O-győzelmek – döntetlenek) |
| **Sorozat** | Az aktuális győzelmi sorozat / az örökranglistás legjobb sorozat ebben a módban |
| **Idő** | Az aktuális kör aktív (nem szüneteltetett) ideje |

Minden befejezett kört a kit pontosan egyszer rögzít az `arcade.stats.tictactoe` alatt (`best`, `plays`, `wins`, `totalScore`,
`totalSeconds`, `lastScore`, `lastPlayedAt`). A PvP köröket nem rangsoroltként rögzíti (`ranked: false`, az 1. játékos = X oldaláról):
játéknak számítanak, de sosem érintik a Legjobbat vagy a ranglistát, és rájuk nem hívódik meg az `onGameOver`.
Az idő előtt befejezett kör az aktuális pontszámát rangsorolja (0, amíg a kör el nem dől), és meghívja az `onGameOver(score, { finished: true })`-t.
A módonkénti legjobb sorozatok megtartják a kit előtti kulcsaikat, `tictactoe.highScore.<mode>` (sorozat, nem pontszám – ezért nem kerül át
az arcade statisztikába); a régi egyetlen `tictactoe.highScore` kulcs továbbra is egyszer átkerül a Nehéz rekordba.

## 💾 Automatikus mentés és folytatás

A munkamenet az **egész meccs**, nem csak a kör: tábla, soron lévő fél, mód, kezdő jel, meccsállás, aktuális sorozat és
pontok (kulcs: `arcade.session.tictactoe`, sémaverziózott, és szigorú ellenőrző vizsgálja, amely az elérhetetlen állásokat is elutasítja).
Nagyjából másodpercenként menti, valahányszor az oldal elrejtődik, és amikor a játék leáll – és **a körök között is megmarad**,
így a lap bezárása egy kör után sosem viszi el a Gy–V–D állásodat vagy a pontjaidat. Újratöltéskor a **Üdv újra** kártya jelenik meg a szüneteltetett meccsel
(*Folytatás* · *Új kör* · *Új meccs*); a már befejezett kört nem játssza újra – a meccs egy friss körrel megy tovább.
Csak kifejezett művelet dobja el: az *Automatikusan mentve* jelvény melletti **Elvetés** (vissza egy friss, üres táblához), az *Eredmények nullázása*, vagy
a módváltás (új meccs). Egy kör idő előtti befejezése törli a mentést; a következő kör újra mentni kezd.

## 🧩 Beágyazás az Arcade-Game-Centerbe

```tsx
import { TicTacToeGame, TicTacToeDemo } from '@arcade/tictactoe';

<TicTacToeGame
  embedded                                   // az oldalcím elrejtése; a portál mutatja
  onGameOver={(score) => submitScore('tictactoe', score)}   // rangsorolt körök > 0 ponttal, vagy idő előtt befejezett kör (második argumentum { finished: true }, 0-nál is)
  onRunEnd={(run) => console.log(run.outcome, run.ranked)}  // minden kör, a PvP is
  onStatusChange={({ status, score, seconds }) => updateHeader(status, seconds)}
/>
<TicTacToeDemo active={cardIsVisible} />     // bemutató mód a nyitóoldalra
```

Mindkét komponens a `src/arcade/types.ts` közös `ArcadeGameProps` / `ArcadeDemoProps` szerződését követi.

Állapotleképezés: `idle` egy látogatás első köre előtt (Start fedőlap), `running` amíg egy kör zajlik, `paused` felfüggesztve
(vagy visszaállítva), `gameOver` attól a pillanattól, hogy egy kör véget ér, a következő kezdetéig. A `score` az aktuális kör pontszáma
(játék közben 0); a `runKey` körszámláló.

## 🧠 Hogyan működik

A motor egyetlen tiszta reducer, az `advanceGame(state, action, { rng })`:

```
playing ──┬── (nyerő lépés) ────────────→ won   ─┐
          └── (tele a tábla, nincs nyertes) → draw  ─┴─ newRound → playing (a vesztes kezd)
```

1. A **`place`** lerakja a soron lévő fél jelét egy üres mezőre – elutasítja, ha az MI következik, foglalt mezőre, és a kör vége után.
2. Az **`aiMove`** a `bestMove(board, mark, mode, rng)`-től kéri az MI mezőjét. Az RNG be van injektálva, így a tesztek determinisztikusak.
3. **Előbb a nyerés ellenőrzése**, utána a döntetlené – egy nyerő kilencedik jel győzelem, sosem döntetlen.
4. A befejezett kör a `duelRoundScore`-ral **kap pontot**; a pontok, a Gy–V–D és a sorozat ugyanabban a lépésben frissül.
5. A **`newRound`** letörli a táblát és megtartja a meccset; a **`changeMode`** új meccset indít; a **`resetScores`** nullázza; a **`finish`** eredmény nélkül, idő előtt lezárja a kört.

### 🤖 Játékmódok és MI

| Mód | 1. játékos (X) | 2. játékos (O) | Nyerhető? |
| --- | --- | --- | --- |
| **PvP** | Ember | Ember (ugyanazon az eszközön) | Igen, bármelyik játékos által |
| **Könnyű** | Ember | MI (egyenletesen véletlen) | Igen, szinte mindig |
| **Közepes** | Ember | MI (5 lépéses heurisztika) | Igen, némi erőfeszítéssel |
| **Nehéz** | Ember | MI (teljes α-β minimax) | **Soha.** A legjobb eredmény a döntetlen |

A Közepes szigorú sorrendet követ: nyerő lépés → az ellenfél nyerésének blokkolása → középre lépés → véletlen sarok → véletlen él.
A Nehéz teljes minimaxot futtat α-β nyesessel a 3×3-as fán (lépésenként jóval 1 ms alatt), győzelemért `+10 − mélység`,
vereségért `mélység − 10`, döntetlenért 0 pontot ad – így a rövidebb győzelmeket és a hosszabb vereségeket részesíti előnyben. A tesztek azt bizonyítják, hogy sosem veszít:
**minden** lehetséges emberi választ végigjárnak az üres táblától, az ember kezdésével és másodikként lépésével is.

A `useAITurn` a kiválasztott késleltetés után csak akkor ütemezi az MI lépését, ha a kör fut (nem idle, nem szünetel, és nem
a nullázás- vagy befejezés-megerősítés mögött van); az időzítő minden állapotváltozáskor és leálláskor megszakad, így sosem érkezik elavult lépés.

### 🦷 Fogas ikonok

| Jel | Ikon | Szín |
| --- | --- | --- |
| `X` | 🦷 **Ép** őrlőfog | orvosi kék `#4a8cf0` |
| `O` | 🦷 **Szuvas** őrlőfog (üreggel) | megöregedett zománc `#c9933f` |

Mindkettő ugyanazt az inline SVG sziluettet használja (`currentColor` körvonal, elefántcsont kitöltés), így a tábla *fogak rácsának* látszik – a különbség
a fog állapota. (A szerző fogorvos.) A belső modell mindig `'X'` / `'O'`; csak a megjelenítés változik.

### 🎬 Demó

A `TicTacToeDemo` különböző erősségű MI-ket állít egymás ellen (közepes a könnyű ellen, könnyű a nehéz ellen, nehéz a közepes ellen, …) a valódi
`advanceGame`-en keresztül, 400 ms-onként egy lépéssel, és minden eredmény után 1,2 mp-cel újraindul – felváltva fogas és X/O jelekkel. Nincs billentyűfigyelője,
hangja, statisztikája és tárolóírása, és lefagy, ha az `active` hamis.

## 🧪 Szkriptek

| Szkript | Cél |
| --- | --- |
| `npm run dev` | Vite fejlesztői szerver |
| `npm run build` | Típusellenőrzés (`tsc -b`) és éles build |
| `npm run preview` | Az éles build kiszolgálása |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (logikai és komponensteszt) |
| `npm run check` | lint → typecheck → test → build (amit a CI futtat) |

## 🏗️ Felépítés

```
src/
  arcade/              becsomagolt Zoltan's Arcade kit – itt ne szerkeszd (lásd a saját README-jét)
  logic/               tiszta játékszabályok
    types.ts constants.ts grid.ts win.ts
    ai.ts              könnyű / közepes / nehéz (α-β minimax), RNG injektálva
    game.ts            advanceGame reducer, createInitialState, roundOutcome, pontozás
    autopilot.ts       MI-MI ellen meghajtó + seedelt RNG a demóhoz
    persist.ts         a mentett munkamenetek szigorú futásidejű ellenőrzése
  hooks/               useAITurn, useKeyboardSelect, useBestStreak, useIconStyle, useAIDelay, useSound
  components/          GameBoard (teljes + mini), Cell, ToothIcon, WinningLine, ModeSelect, AISpeedToggle,
                       DentalToggle, SoundToggle
  demo/TicTacToeDemo.tsx  bemutató mód a nyitóoldalra
  rules.tsx            a szabályok szakaszai és a „három egy sorban” ábra
  TicTacToeGame.tsx    a beágyazható játék (ArcadeGameProps)
  App.tsx              önálló oldal: <ArcadeShell><TicTacToeGame/></ArcadeShell>
  main.tsx             belépési pont; egyszer tölti be a közös arcade.css-t
  index.ts             csomag-belépő az Arcade-Game-Centerhez
```

## 🤝 Közreműködés

Lásd a [CONTRIBUTING.md](./CONTRIBUTING.md) fájlt, a [Magatartási kódexet](./CODE_OF_CONDUCT.md) és a [SECURITY.md](./SECURITY.md) fájlt.
A közreműködők a [CONTRIBUTORS.md](./CONTRIBUTORS.md) fájlban szerepelnek; a változások a [CHANGELOG.md](./CHANGELOG.md) fájlban.
A v1 eredeti tervezési jegyzetei a [GAME-PLAN.md](./GAME-PLAN.md) fájlban vannak.

## ⚖️ Licenc

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">🦷-gyel készítette Zoltán Dul · a <a href="https://github.com/ZoliQua/Arcade-Game-Center">Zoltan's Arcade</a> része</p>
