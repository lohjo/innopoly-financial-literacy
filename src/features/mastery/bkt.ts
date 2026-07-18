/* Bayesian Knowledge Tracing-style estimator (spec §11.4). Pure math, no React.
   ponytail: fixed slip/guess/learn params — calibrate against delayed post-tests when data exists. */

export type Mastery = {
  pKnown: number;
  uncertainty: number; // 0..1, high = dashed ring in UI
  evidenceCount: number;
  lastAt: number;
};

const SLIP = 0.1;
const GUESS = 0.2;
const P_LEARN = 0.35;
const P_INIT = 0.2;

export function initMastery(): Mastery {
  return { pKnown: P_INIT, uncertainty: 1, evidenceCount: 0, lastAt: 0 };
}

/**
 * One evidence update. `weight` in (0..1] discounts scaffolded evidence
 * (spec §2.3: unaided 1.0 … walkthrough 0.2). Low weight moves the estimate less.
 */
export function updateMastery(prev: Mastery, correct: boolean, weight: number, at: number): Mastery {
  const p = prev.pKnown;
  const posterior = correct
    ? (p * (1 - SLIP)) / (p * (1 - SLIP) + (1 - p) * GUESS)
    : (p * SLIP) / (p * SLIP + (1 - p) * (1 - GUESS));
  // blend toward posterior by evidence weight
  let next = p + weight * (posterior - p);
  // learning happens on successful practice only
  if (correct) next = next + (1 - next) * P_LEARN * weight;
  const evidenceCount = prev.evidenceCount + 1;
  return {
    pKnown: clamp01(next),
    uncertainty: 1 / Math.sqrt(evidenceCount + 1),
    evidenceCount,
    lastAt: at,
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

export type MasteryBand = "ready" | "learning" | "durable";

/** Knowledge-graph node states (spec §6.2): ready / learning / durable. */
export function masteryBand(m: Mastery): MasteryBand {
  if (m.evidenceCount === 0) return "ready";
  if (m.pKnown >= 0.8 && m.uncertainty <= 0.45) return "durable";
  return "learning";
}
