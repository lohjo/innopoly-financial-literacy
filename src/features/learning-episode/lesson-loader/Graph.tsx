import { motion } from "motion/react";
import { useMemo } from 'react';
import { FragmentBurst } from './Particles';
import {
  COIN_REST_POSITION,
  GROWTH_TREND_POINTS,
  LOOP_DURATION,
  PALETTE,
  PHASE_DURATIONS,
  PHASE_START,
  STAGE_SIZE,
  buildSmoothPath,
} from './types';

/**
 * Graph
 * -------------------------------------------------------------------------
 * The "Growth" beat. The line is drawn (via animated `pathLength`) only
 * across the `graphDraw` phase, and its points are the exact destinations
 * the coin-fragments travel to - so the line appearing IS the fragments
 * arriving, not a separate effect layered on top of them.
 */

const frac = (seconds: number) => seconds / LOOP_DURATION;

const path = buildSmoothPath(
  GROWTH_TREND_POINTS,
  STAGE_SIZE.width,
  STAGE_SIZE.height,
);

const scaledTargets = GROWTH_TREND_POINTS.map((p) => ({
  x: p.x * STAGE_SIZE.width,
  y: p.y * STAGE_SIZE.height,
}));

const peak = scaledTargets[scaledTargets.length - 1];

const graphDrawEnd = PHASE_START.graphDraw + PHASE_DURATIONS.graphDraw;

const LINE_TIMES = [
  0,
  frac(PHASE_START.graphDraw),
  frac(PHASE_START.graphDraw + PHASE_DURATIONS.graphDraw * 0.15),
  frac(graphDrawEnd),
  frac(PHASE_START.converge),
  frac(PHASE_START.converge + PHASE_DURATIONS.converge * 0.6),
  1,
];

const LINE_OPACITY = [0, 0, 0.9, 1, 1, 0.15, 0];
const LINE_PATH_LENGTH = [0, 0, 0.05, 1, 1, 1, 1];

export default function Graph() {
  const fragmentOrigin = useMemo(
    () => ({ x: COIN_REST_POSITION.x, y: COIN_REST_POSITION.y - 40 }),
    [],
  );

  return (
    <svg
      className="absolute inset-0"
      width={STAGE_SIZE.width}
      height={STAGE_SIZE.height}
      viewBox={`0 0 ${STAGE_SIZE.width} ${STAGE_SIZE.height}`}
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      {/* Fragments depart the coin during `fragment`, arrive by end of `graphDraw`. */}
      <FragmentBurst
        origin={fragmentOrigin}
        targets={scaledTargets}
        departStart={PHASE_START.fragment}
        departWindow={PHASE_DURATIONS.fragment}
        arriveBy={graphDrawEnd}
      />

      <motion.path
        d={path.d}
        fill="none"
        stroke={PALETTE.cardGreenDark}
        strokeWidth={3}
        strokeLinecap="round"
        animate={{ opacity: LINE_OPACITY, pathLength: LINE_PATH_LENGTH }}
        transition={{
          duration: LOOP_DURATION,
          times: LINE_TIMES,
          repeat: Infinity,
        }}
      />

      {/* Leading tip on the line — solid accent, no bloom. */}
      <motion.circle
        r={4}
        fill={PALETTE.accent}
        animate={{
          cx: [
            scaledTargets[0].x,
            scaledTargets[0].x,
            scaledTargets[0].x,
            peak.x,
            peak.x,
            peak.x,
            peak.x,
          ],
          cy: [
            scaledTargets[0].y,
            scaledTargets[0].y,
            scaledTargets[0].y,
            peak.y,
            peak.y,
            peak.y,
            peak.y,
          ],
          opacity: [0, 0, 1, 1, 1, 0, 0],
          scale: [0.6, 0.6, 1, 1.15, 1, 0.6, 0.6],
        }}
        transition={{ duration: LOOP_DURATION, times: LINE_TIMES, repeat: Infinity }}
      />

      {/* Peak hold marker. */}
      <motion.circle
        cx={peak.x}
        cy={peak.y}
        r={8}
        fill={PALETTE.accent}
        opacity={0}
        animate={{
          r: [8, 8, 8, 14, 8],
          opacity: [0, 0, 0.35, 0, 0],
        }}
        transition={{
          duration: LOOP_DURATION,
          times: [
            0,
            frac(graphDrawEnd),
            frac(PHASE_START.converge),
            frac(PHASE_START.converge + PHASE_DURATIONS.converge * 0.4),
            1,
          ],
          repeat: Infinity,
        }}
      />
    </svg>
  );
}
