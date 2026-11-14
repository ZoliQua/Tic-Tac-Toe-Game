import type { ReactNode } from 'react';
import {
  formatNumber,
  Tooth,
  useDental,
  useIsTouch,
  useKitMessages,
  useLang,
  useMessages,
  type RulesSection,
} from './arcade';
import { MESSAGES, MODE_KEY } from './i18n';
import { drawScore, winScoreRange } from './logic/game';

const SIZE = 36;
const GAP = 6;
const X0 = 8;
const Y0 = 8;
const at = (i: number) => X0 + i * (SIZE + GAP);

/** A mark of the diagram: a drawn X or O in plain mode, a tooth in dental mode (X healthy, O = ring). */
function Mark({ kind, col, row, dental }: { kind: 'X' | 'O'; col: number; row: number; dental: boolean }) {
  const x = at(col);
  const y = Y0 + row * (SIZE + GAP);
  if (dental && kind === 'X') {
    return (
      <g transform={`translate(${x + 2} ${y + 2})`}>
        <Tooth size={SIZE - 4} />
      </g>
    );
  }
  if (kind === 'O') {
    return <circle cx={x + SIZE / 2} cy={y + SIZE / 2} r={11} fill="none" stroke="var(--text)" strokeWidth={3} />;
  }
  return <path d={`M${x + 9} ${y + 9}l${SIZE - 18} ${SIZE - 18}M${x + SIZE - 9} ${y + 9}l-${SIZE - 18} ${SIZE - 18}`} stroke="var(--text)" strokeWidth={3.5} strokeLinecap="round" />;
}

/** Rules diagram: a 3×3 board with three X in the middle row, struck through and ticked (✓). */
export function ThreeDiagram() {
  const m = useMessages(MESSAGES);
  const [dental] = useDental();
  const cells = Array.from({ length: 9 }, (_, i) => ({ col: i % 3, row: Math.floor(i / 3) }));
  const midY = Y0 + (SIZE + GAP) + SIZE / 2;
  return (
    <svg viewBox="0 0 220 140" role="img" aria-label={m('rulesDiagramLabel')} style={{ width: '100%', maxWidth: 300, height: 'auto', display: 'block', margin: '8px auto' }}>
      {cells.map(({ col, row }) => (
        <rect key={`${col}${row}`} x={at(col)} y={Y0 + row * (SIZE + GAP)} width={SIZE} height={SIZE} rx={5} fill="none" stroke="var(--text-mute)" strokeWidth={1.5} />
      ))}
      <Mark kind="O" col={0} row={0} dental={dental} />
      <Mark kind="O" col={2} row={2} dental={dental} />
      <Mark kind="X" col={0} row={1} dental={dental} />
      <Mark kind="X" col={1} row={1} dental={dental} />
      <Mark kind="X" col={2} row={1} dental={dental} />
      <path d={`M${at(0) - 4} ${midY}H${at(2) + SIZE + 4}`} stroke="var(--text)" strokeWidth={3} strokeDasharray="7 4" strokeLinecap="round" />
      <path d="M164 62l10 10 20-24" fill="none" stroke="var(--text)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <text x={176} y={96} fontSize="11" fontWeight="700" fill="var(--text)" textAnchor="middle">
        <tspan x={176} dy="0">{m('rulesDiagramRow')}</tspan>
      </text>
    </svg>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- the diagram and its hook belong together
export function useRulesSections(): RulesSection[] {
  const m = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const touch = useIsTouch();
  const num = (n: number) => formatNumber(n, lang);
  const ios = typeof navigator !== 'undefined' && /iP(hone|od)/.test(navigator.userAgent);
  const mobile: ReactNode = (
    <ul>
      <li>{m('rulesMobileTap')}</li>
      <li>{m('rulesMobileFs')}</li>
      {ios && <li>{k('iosHomeScreenTip')}</li>}
    </ul>
  );
  return [
    {
      id: 'goal',
      body: (
        <>
          <p>{m('rulesGoal')}</p>
          <ThreeDiagram />
        </>
      ),
    },
    { id: 'play', body: <p>{touch ? m('rulesPlayTouch') : m('rulesPlayKeys')}</p> },
    {
      id: 'rules',
      body: (
        <ul>
          <li>{m('rulesRulesWin')}</li>
          <li>{m('rulesRulesTurn')}</li>
          <li>{m('rulesRulesSave')}</li>
        </ul>
      ),
    },
    {
      id: 'scoring',
      body: (
        <>
          <p>{m('rulesScoringIntro')}</p>
          <ul>
            {(['easy', 'medium', 'hard'] as const).map((mode) => (
              <li key={mode}>
                {m('rulesScoringMode', {
                  mode: m(MODE_KEY[mode]),
                  min: num(winScoreRange(mode).min),
                  max: num(winScoreRange(mode).max),
                  draw: num(drawScore(mode)),
                })}
              </li>
            ))}
          </ul>
          <p>{m('rulesScoringPvp', { zero: num(0) })}</p>
          <p>{m('rulesScoringFinish', { zero: num(0) })}</p>
        </>
      ),
    },
    { id: 'dental', body: <p>{m('rulesDentalText')}</p> },
    { id: 'mobile', body: mobile },
  ];
}
