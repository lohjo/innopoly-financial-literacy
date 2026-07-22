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

/** Compound-growth explorer: scrub years, compare save-path vs spend-path stacks. */
export type GrowParams = {
  monthlySave: number;
  annualRate: number;
  maxYears: number;
  saveLabel: string;
  spendLabel: string;
  /** pass when FV(save) − FV(spend) at chosen years ≥ gapTarget */
  gapTarget: number;
};

/** Rank items top→bottom (e.g. highest long-run impact first). */
export type SortParams = {
  items: { id: string; label: string; detail?: string }[];
  /** ground-truth order, best/first at index 0 */
  correctOrder: string[];
  /** starting order shown to the learner (usually shuffled) */
  startOrder: string[];
};

/** Tap-to-pair left items with right outcomes. */
export type MatchParams = {
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
  /** leftId → rightId */
  solution: Record<string, string>;
};

/** Route paycheck chips into buckets (Save-first vs Leftover). */
export type AllocateParams = {
  chips: { id: string; label: string; amount: number }[];
  buckets: { id: string; label: string; kind: "save" | "spend" }[];
  /** chipId → bucketId starting placement */
  initial: Record<string, string>;
  targets: { minSave: number };
  /** optional story line shown under the columns after a check failure context */
  evaporateNote?: string;
};

/** Spread units (eggs / cash chips) across many baskets or investments. */
export type DistributeParams = {
  /** Visual theme for chips + buckets */
  theme: "eggs" | "money";
  chips: { id: string; label: string; amount: number }[];
  buckets: { id: string; label: string }[];
  /** chipId → bucketId; missing keys start in the pool */
  initial: Record<string, string>;
  targets:
    | { mode: "all-placed" }
    | {
        mode: "min-kept";
        /** which basket breaks on Check — kept = total − amount in this bucket */
        breakBucketId: string;
        minKept: number;
      };
  /** shown once after the first chip is placed */
  firstPlaceNudge?: string;
};

/** Market-timing beat: pick a month (lump sum) or watch fixed monthly buys (DCA). */
export type TimingMonth = { id: string; label: string; price: number };
export type TimingParams = {
  mode: "lump-sum" | "dca";
  /** total cash available (lump = all at once; dca = monthlyAmount × months) */
  budget: number;
  months: TimingMonth[];
  /** shown after every month has been revealed */
  feedbackTitle: string;
  feedbackBody: string;
  /** dca: dollars invested each month (defaults to budget / months.length) */
  monthlyAmount?: number;
  /** dca compare: prior lump-sum screen whose pick supplies the "You" price */
  compareSourceScreenId?: string;
  /** dca compare fallback month id when no prior pick is available */
  compareFallbackMonthId?: string;
};

export type PuzzleParams =
  | { mechanic: "flow"; flow: FlowParams }
  | { mechanic: "zones"; zones: ZonesParams }
  | { mechanic: "minpay"; minpay: MinPayParams }
  | { mechanic: "grow"; grow: GrowParams }
  | { mechanic: "sort"; sort: SortParams }
  | { mechanic: "match"; match: MatchParams }
  | { mechanic: "allocate"; allocate: AllocateParams }
  | { mechanic: "distribute"; distribute: DistributeParams }
  | { mechanic: "timing"; timing: TimingParams };

/** Consequence beat driven by a prior distribute puzzle's placement. */
export type ObserveShock =
  | {
      kind: "egg-break";
      /** pick fullest non-empty basket; fall back to first bucket */
      pick: "fullest";
      /** optional: never break this basket (second try uses a different one) */
      excludeBucketId?: string;
    }
  | {
      kind: "egg-break";
      pick: "fixed";
      bucketId: string;
    }
  | {
      kind: "portfolio-drop";
      bucketId: string;
      /** fraction of that bucket's share lost (e.g. 0.4) */
      dropRate: number;
      /** amount-in-bucket ≥ this → "dropped a lot" copy */
      heavyThreshold: number;
    };

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
  | {
      kind: "observe";
      id: string;
      title: string;
      /** prior puzzle screen whose distribute placement drives the shock */
      sourceScreenId: string;
      shock: ObserveShock;
    }
  | {
      kind: "generalize";
      id: string;
      rule: string;
      body: string;
      /** celebrate chrome (copy only — XP still awarded via lesson finish) */
      skillUnlock?: { label: string; xpNote: string };
    };

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
  /** H2 "point" target per screen id: a criterion id (puzzles) or "opt-N" (quiz options) */
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
