import { useEffect, useRef, useState } from 'react';
import type { ArcadeDemoProps } from '../arcade';
import { GameBoard } from '../components/GameBoard';
import { autoplayStep, createDemoState, seededRng } from '../logic/autopilot';
import { advanceGame } from '../logic/game';
import type { GameState } from '../logic/types';

export const DEMO_MOVE_MS = 400;
export const DEMO_RESTART_MS = 1200;

type DemoFrame = { game: GameState; round: number };

/**
 * Attract mode for the portal landing page: two AIs of mixed strength play
 * the real engine against each other, one move every 400 ms, and a new round
 * starts 1.2 s after each result. No keyboard, no stats, no saves, no sound.
 */
export function TicTacToeDemo({ active = true }: ArcadeDemoProps) {
  const rngRef = useRef(seededRng(0x7ac7));
  const [frame, setFrame] = useState<DemoFrame>(() => ({ game: createDemoState(), round: 0 }));
  const playing = frame.game.status === 'playing';

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(
      () => {
        setFrame((prev) =>
          prev.game.status === 'playing'
            ? { ...prev, game: autoplayStep(prev.game, prev.round, rngRef.current) }
            : { round: prev.round + 1, game: advanceGame(prev.game, { type: 'newRound' }, { rng: rngRef.current }) },
        );
      },
      playing ? DEMO_MOVE_MS : DEMO_RESTART_MS,
    );
    return () => window.clearTimeout(id);
  }, [active, playing, frame]);

  return (
    <div className="arc-demo" aria-hidden="true">
      <GameBoard
        board={frame.game.board}
        winningLine={frame.game.winningLine}
        draw={frame.game.status === 'draw'}
        iconStyle={frame.round % 2 === 0 ? 'tooth' : 'classic'}
        variant="mini"
      />
    </div>
  );
}

export default TicTacToeDemo;
