import { motion } from "motion/react";
import {
  COIN_REST_POSITION,
  GROWTH_TREND_POINTS,
  LOOP_DURATION,
  PALETTE,
  PHASE_DURATIONS,
  PHASE_START,
  STAGE_SIZE,
} from "./types";

/**
 * Coin — solid fill, no specular / bloom. Story timing unchanged.
 */

const frac = (seconds: number) => seconds / LOOP_DURATION;

const peak = GROWTH_TREND_POINTS[GROWTH_TREND_POINTS.length - 1];
const peakX = peak.x * STAGE_SIZE.width;
const peakY = peak.y * STAGE_SIZE.height;
const offsetX = peakX - COIN_REST_POSITION.x;
const offsetY = peakY - COIN_REST_POSITION.y;

const TIMES = [
  0,
  frac(PHASE_DURATIONS.coinDrop * 0.5),
  frac(PHASE_START.coinSettle),
  frac(PHASE_START.coinSettle + PHASE_DURATIONS.coinSettle * 0.6),
  frac(PHASE_START.fragment),
  frac(PHASE_START.graphDraw),
  frac(PHASE_START.converge + PHASE_DURATIONS.converge * 0.55),
  frac(PHASE_START.converge + PHASE_DURATIONS.converge * 0.92),
  1,
];

const X = [0, 0, 0, 0, 0, offsetX, offsetX * 0.25, offsetX * 0.02, 0];
const Y = [0, -14, 0, 0, 0, offsetY, offsetY * 0.2, -6, 0];
const SCALE = [1, 1.06, 1, 1, 1, 0.15, 0.6, 1.08, 1];
const OPACITY = [1, 1, 1, 1, 1, 0, 0.9, 1, 1];
const ROTATE_Y = [0, 0, 0, 180, 360, 360, 630, 700, 720];
const SCALE_Y = [1, 0.9, 1, 1, 1, 1, 0.9, 0.82, 1];
const SCALE_X = [1, 1.08, 1, 1, 1, 1, 1.05, 1.15, 1];

const IDLE_WINDOW = PHASE_DURATIONS.coinDrop + PHASE_DURATIONS.coinSettle;

export default function Coin() {
  return (
    <div
      className="absolute"
      style={{
        left: COIN_REST_POSITION.x,
        top: COIN_REST_POSITION.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <motion.div
        className="loading-contact-shadow absolute h-3 w-16 rounded-full"
        style={{ left: "50%", top: 4, transform: "translateX(-50%)" }}
        animate={{
          scaleX: [0.6, 0.85, 1, 1, 1, 0.3, 0.7, 1.15, 0.6],
          opacity: [0.35, 0.28, 0.35, 0.35, 0.35, 0.05, 0.15, 0.4, 0.35],
        }}
        transition={{ duration: LOOP_DURATION, times: TIMES, repeat: Infinity }}
      />

      <motion.div
        className="absolute rounded-full border"
        style={{
          left: "50%",
          bottom: 0,
          width: 56,
          height: 56,
          borderColor: PALETTE.cardGreenDark,
          opacity: 0.25,
          transform: "translate(-50%, 50%)",
        }}
        animate={{ scale: [0, 2.4], opacity: [0.35, 0] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: Math.max(IDLE_WINDOW - 1, 0.2),
          ease: "easeOut",
        }}
      />

      <motion.div
        className="relative h-20 w-20 rounded-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          x: X,
          y: Y,
          scale: SCALE,
          opacity: OPACITY,
          rotateY: ROTATE_Y,
          scaleY: SCALE_Y,
          scaleX: SCALE_X,
        }}
        transition={{ duration: LOOP_DURATION, times: TIMES, repeat: Infinity }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: PALETTE.coinCore }}
        />
        <div
          className="absolute inset-[6px] rounded-full border-2"
          style={{ borderColor: PALETTE.coinShadowDeep, opacity: 0.35 }}
        />
        <div
          className="absolute inset-[22px] rounded-full"
          style={{ backgroundColor: PALETTE.coinShadowDeep, opacity: 0.2 }}
        />
      </motion.div>
    </div>
  );
}
