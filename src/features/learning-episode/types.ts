/* Core learning contracts (spec §12.1 shapes, wedge-scale). Pure types — no React. */

export type ConceptId = string;

export type Criterion = { id: string; label: string };
export type CriterionResult = { id: string; pass: boolean; detail?: string };

/* --- Simulation params, one per mechanic --- */

export type FlowBucket = { id: string; label: string; kind: "save" | "fixed" | "flexible" };

export type FlowParams = {
  salary: number;
  buckets: FlowBucket[];
  /** amounts pre-committed (rent etc), keyed by bucket id */
  committed: Record<string, number>;
  /** daily flexible spend drain when unallocated */
  dailyDrain: number;
  days: number;
  /** one-off shock events: day + amount + label */
  events: { day: number; amount: number; label: string }[];
  targets: { savedTarget?: number; bufferLeft?: number };
};

export type ZoneChip = {
  id: string;
  label: string;
  amount: number;
  /** ground truth: can this shrink under a shock without breaking essentials? */
  shrinkable: boolean;
};
export type ZonesParams = {
  income: number;
  chips: ZoneChip[];
  shock: { label: string; amount: number };
  savingsTarget: number;
};

export type MinPayParams = {
  balance: number;
  apr: number; // e.g. 0.26
  minPaymentPct: number; // e.g. 0.03
  minPaymentFloor: number; // e.g. 25
  targets?: { deadlineMonths: number; interestCap: number };
};

export type PuzzleParams =
  | { mechanic: "flow"; flow: FlowParams }
  | { mechanic: "zones"; zones: ZonesParams }
  | { mechanic: "minpay"; minpay: MinPayParams };

export type PuzzleDoc = {
  id: string;
  prompt: string;
  story?: string;
  concepts: ConceptId[];
  criteria: Criterion[];
  params: PuzzleParams;
  /** second param set used for post-walkthrough (H4) changed-value retry */
  retryParams?: PuzzleParams;
};

/* --- Lesson screens --- */

export type QuizScreenDoc = {
  kind: "quiz";
  id: string;
  concept: ConceptId;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type ScreenDoc =
  | { kind: "intro"; id: string; title: string; story: string; art?: string }
  | { kind: "concept"; id: string; title: string; body: string; factNote?: string }
  | {
      kind: "predict";
      id: string;
      prompt: string;
      unit: string;
      min: number;
      max: number;
      step: number;
      /** deterministic actual value revealed after prediction */
      actual: number;
      explanation: string;
      concepts: ConceptId[];
    }
  | { kind: "puzzle"; id: string; puzzle: PuzzleDoc }
  | QuizScreenDoc
  | { kind: "reflect"; id: string; prompt: string; choices: string[]; best: number; whyBest: string }
  | { kind: "generalize"; id: string; rule: string; body: string };

export type MisconceptionCard = {
  id: string;
  concept: ConceptId;
  /** fires when this criterion failed >= minFails across checks */
  signature: { criterionId: string; minFails: number };
  title: string;
  wrongModel: string;
  rightModel: string;
  testAction: string;
};

export type LessonDoc = {
  id: string;
  chapterId: string;
  title: string;
  minutes: number;
  concepts: ConceptId[];
  screens: ScreenDoc[];
  /** authored hints per puzzle screen id: [H1 nudge, H2 point, H3 misconception, H4 one-step] */
  hints: Record<string, [string, string, string, string]>;
  /** H2 "point" target: criterion id to highlight, per puzzle screen id */
  hintTargets?: Record<string, string>;
  misconceptions: MisconceptionCard[];
  /** conversation rehearsal offered after completion */
  scenarioId?: string;
};

export type ChapterDoc = {
  id: string;
  title: string;
  tagline: string;
  lessons: { id: string; title: string; minutes: number }[];
};

/* --- Evidence (append-only ledger, spec §12.1) --- */

export type EvidenceType =
  | "prediction"
  | "check_pass"
  | "check_fail"
  | "hint_used"
  | "quiz_answer"
  | "reflection"
  | "review_pass"
  | "review_fail"
  | "call_move"
  | "call_complete"
  | "mission_done";

export type EvidenceEvent = {
  id: string;
  at: number;
  lessonId?: string;
  scenarioId?: string;
  concepts: ConceptId[];
  type: EvidenceType;
  /** highest hint level used before this evidence (0 = unaided) */
  supportLevel: 0 | 1 | 2 | 3 | 4;
  payload: Record<string, unknown>;
};

/** Mastery evidence weights (spec §2.3 — initial hypotheses). */
export const EVIDENCE_WEIGHTS: Record<number, number> = {
  0: 1.0,
  1: 0.8,
  2: 0.65,
  3: 0.45,
  4: 0.2,
};
export const CALL_MOVE_WEIGHT = 0.9;
