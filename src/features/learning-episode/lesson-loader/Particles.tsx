import { motion } from "motion/react";
import { useMemo } from 'react';
import type { AmbientParticle, FragmentParticle, GraphPoint } from './types';
import { LOOP_DURATION, PALETTE } from './types';

/**
 * AMBIENT PARTICLES
 * -------------------------------------------------------------------------
 * Slow-drifting dust in the background, entirely independent of the
 * coin/graph story. This is environment, not narrative - it should never
 * draw attention, only add depth.
 */

const AMBIENT_COUNT = 24;

function useAmbientParticles(): AmbientParticle[] {
  return useMemo(
    () =>
      Array.from({ length: AMBIENT_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 6,
      })),
    [],
  );
}

export default function AmbientParticles() {
  const particles = useAmbientParticles();

  return (
    <div aria-hidden className="loading-particle-field z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: PALETTE.cardGreenDark, opacity: 0.18 }}
          initial={{ x: p.x, y: p.y, opacity: 0 }}
          animate={{ y: [p.y, p.y - 50], opacity: [0, 0.5, 0] }}
          transition={{
            delay: p.delay,
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

/**
 * FRAGMENT BURST
 * -------------------------------------------------------------------------
 * The narrative particles: the coin's substance released into potential,
 * then arriving at the graph's control points to "become" the growth line.
 * This is the visual thread that makes coin -> graph feel like one
 * transformation instead of two separate effects.
 */

const FRAGMENT_COUNT_PER_TARGET = 3;

interface FragmentBurstProps {
  /** Origin point (coin center) in the same local coordinate space as targets. */
  origin: GraphPoint;
  /** Graph points (already scaled to local px) the fragments travel toward. */
  targets: readonly GraphPoint[];
  /** Absolute loop-second each fragment group may start departing the coin. */
  departStart: number;
  /** Absolute loop-second window over which departures are staggered. */
  departWindow: number;
  /** Absolute loop-second by which every fragment must have arrived. */
  arriveBy: number;
}

const frac = (seconds: number) => seconds / LOOP_DURATION;

function buildFragments(
  origin: GraphPoint,
  targets: readonly GraphPoint[],
  departStart: number,
  departWindow: number,
): FragmentParticle[] {
  const fragments: FragmentParticle[] = [];
  let id = 0;

  targets.forEach((target, targetIndex) => {
    for (let i = 0; i < FRAGMENT_COUNT_PER_TARGET; i++) {
      fragments.push({
        id: id++,
        originX: origin.x + (Math.random() - 0.5) * 24,
        originY: origin.y + (Math.random() - 0.5) * 24,
        target,
        // Staggered by target index (later graph points depart slightly
        // later) plus a touch of jitter so the burst doesn't look mechanical.
        delay:
          departStart +
          (targetIndex / Math.max(targets.length - 1, 1)) * departWindow +
          Math.random() * 0.05,
        size: 3 + Math.random() * 2.5,
      });
    }
  });

  return fragments;
}

/**
 * Renders the coin-fragment burst as a fully time-fraction-driven animation
 * (rather than toggled by an `active` boolean). Framer Motion's
 * `transition.delay` only applies before the very first play of a repeating
 * animation, not before every repeat - so each fragment instead gets an
 * explicit `times` array spanning the whole LOOP_DURATION, guaranteeing it
 * departs/arrives at the same wall-clock moment on every single loop.
 */
export function FragmentBurst({
  origin,
  targets,
  departStart,
  departWindow,
  arriveBy,
}: FragmentBurstProps) {
  const fragments = useMemo(
    () => buildFragments(origin, targets, departStart, departWindow),
    [origin, targets, departStart, departWindow],
  );

  return (
    <>
      {fragments.map((f) => {
        const departFrac = frac(f.delay);
        const arriveFrac = frac(arriveBy);
        const fadeOutFrac = Math.min(arriveFrac + frac(0.12), 1);

        const times = [0, departFrac, arriveFrac, fadeOutFrac, 1];

        return (
          <motion.circle
            key={f.id}
            r={f.size}
            fill={PALETTE.coinCore}
            animate={{
              cx: [f.originX, f.originX, f.target.x, f.target.x, f.target.x],
              cy: [f.originY, f.originY, f.target.y, f.target.y, f.target.y],
              opacity: [0, 1, 0.95, 0, 0],
            }}
            transition={{
              duration: LOOP_DURATION,
              times,
              repeat: Infinity,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        );
      })}
    </>
  );
}
