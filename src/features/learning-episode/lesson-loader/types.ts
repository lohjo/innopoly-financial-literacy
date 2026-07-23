/**
 * Shared types and timing constants for the loading sequence.
 *
 * The entire animation is driven off a single phase timeline so that every
 * component (Coin, Particles, Graph) can react to the same clock instead of
 * each running its own independent loop. This is what keeps the sequence
 * feeling like one continuous motion instead of three stitched-together
 * effects.
 */

/** The five beats of the story: Save -> (release) -> Invest -> Growth -> (compound back to Save). */
export type LoadingPhase =
  | 'coinDrop'
  | 'coinSettle'
  | 'fragment'
  | 'graphDraw'
  | 'converge';

/** Ordered list of phases, used to derive absolute start times. */
export const PHASE_ORDER: readonly LoadingPhase[] = [
  'coinDrop',
  'coinSettle',
  'fragment',
  'graphDraw',
  'converge',
] as const;

/**
 * Duration of each phase in seconds. Tuned so the full loop lands in the
 * 2.5-3s window requested. Values are named constants rather than inline
 * magic numbers so timing can be tuned from one place.
 */
export const PHASE_DURATIONS: Record<LoadingPhase, number> = {
  coinDrop: 0.55, // fall + impact
  coinSettle: 0.45, // secondary bounce settle + brief hold/rotation
  fragment: 0.5, // coin breaks apart, particles release
  graphDraw: 0.85, // particles travel and draw the graph line
  converge: 0.35, // graph peak condenses back into a coin
};

/** Total loop duration in seconds, derived from the phase durations. */
export const LOOP_DURATION = PHASE_ORDER.reduce(
  (sum, phase) => sum + PHASE_DURATIONS[phase],
  0,
);

/** Absolute start time (in seconds, from loop start) for each phase. */
export const PHASE_START: Record<LoadingPhase, number> = PHASE_ORDER.reduce(
  (acc, phase, index) => {
    const previous = PHASE_ORDER[index - 1];
    acc[phase] = index === 0 ? 0 : acc[previous] + PHASE_DURATIONS[previous];
    return acc;
  },
  {} as Record<LoadingPhase, number>,
);

/** A single point in the growth graph, expressed in a 0-1 normalized viewBox. */
export interface GraphPoint {
  x: number;
  y: number;
}

/** Static, generated growth path the particles will trace and the SVG line will draw. */
export interface GraphPath {
  points: readonly GraphPoint[];
  /** Precomputed SVG path `d` attribute for the line. */
  d: string;
}

/** A single ambient background particle (unrelated to the coin-fragment particles). */
export interface AmbientParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

/** A single coin-fragment particle that travels from the coin's position to a graph point. */
export interface FragmentParticle {
  id: number;
  /** Origin offset from the coin's center, in px. */
  originX: number;
  originY: number;
  /** Destination graph point this fragment travels to, in the graph's local SVG space. */
  target: GraphPoint;
  /** Stagger delay within the fragment/graphDraw phases, in seconds. */
  delay: number;
  size: number;
}

/**
 * Shared color tokens so every component pulls from one palette.
 *
 * Matched to the host app's light mint/green learning-app theme: soft mint
 * background, deep forest-green headline text, bright green accent circles,
 * and a gold coin that reads as "value" against the green field.
 */
/**
 * Normalized (0-1) control points describing the growth trend line: a
 * gentle dip (representing the initial "invest" uncertainty) followed by a
 * confident upward climb. Shared by Graph (draws the line) and Particles
 * (travels toward these exact points) so the two never drift out of sync.
 */
export const GROWTH_TREND_POINTS: readonly GraphPoint[] = [
  { x: 0, y: 0.72 },
  { x: 0.18, y: 0.8 },
  { x: 0.38, y: 0.6 },
  { x: 0.58, y: 0.66 },
  { x: 0.76, y: 0.32 },
  { x: 1, y: 0.08 },
];

/**
 * Builds a smooth SVG path `d` string through the given normalized points,
 * scaled to a viewBox of `width` x `height`. Uses Catmull-Rom-to-Bezier
 * conversion for a natural curve rather than sharp line segments between
 * points - this is what makes the graph read as an organic trend rather
 * than a jagged data plot.
 */
export function buildSmoothPath(
  points: readonly GraphPoint[],
  width: number,
  height: number,
): GraphPath {
  const scaled = points.map((p) => ({ x: p.x * width, y: p.y * height }));

  if (scaled.length < 2) {
    return { points, d: '' };
  }

  let d = `M ${scaled[0].x} ${scaled[0].y}`;

  for (let i = 0; i < scaled.length - 1; i++) {
    const p0 = scaled[i - 1] ?? scaled[i];
    const p1 = scaled[i];
    const p2 = scaled[i + 1];
    const p3 = scaled[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return { points, d };
}

/**
 * Shared local coordinate space for the coin/graph stage. Both Coin and
 * Graph position themselves within a container of this exact size so that
 * "the coin's resting spot" and "the graph's final point" can be expressed
 * as plain pixel coordinates that line up between components, without
 * either one needing to measure the other via refs.
 */
export const STAGE_SIZE = { width: 260, height: 150 } as const;

/** Coin's resting position within the stage, in stage-local px. */
export const COIN_REST_POSITION = {
  x: STAGE_SIZE.width / 2,
  y: STAGE_SIZE.height - 6,
};

export const PALETTE = {
  background: '#F2FBF5',
  surface: '#FFFFFF',
  textDeep: '#14532D',
  cardGreenDark: '#1B7A4B',
  cardGreenLight: '#86E3AE',
  accent: '#22C55E',
  accentSoft: '#BBF7D0',
  coinHighlight: '#FFF7D6',
  coinCore: '#FBBF24',
  coinShadowDeep: '#92400E',
  mint: '#4ADE80',
  teal: '#2DD4BF',
  glowWhite: 'rgba(255,255,255,0.9)',
} as const;
