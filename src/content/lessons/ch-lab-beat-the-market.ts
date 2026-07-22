import type { LessonDoc, TimingParams } from "../../features/learning-episode/types";

const MONTHS_R1 = [
  { id: "jan", label: "Jan", price: 10 },
  { id: "feb", label: "Feb", price: 14 },
  { id: "mar", label: "Mar", price: 8 },
  { id: "apr", label: "Apr", price: 11 },
  { id: "may", label: "May", price: 9 },
  { id: "jun", label: "Jun", price: 12 },
];

const MONTHS_R2 = [
  { id: "jan", label: "Jan", price: 9 },
  { id: "feb", label: "Feb", price: 11 },
  { id: "mar", label: "Mar", price: 15 },
  { id: "apr", label: "Apr", price: 13 },
  { id: "may", label: "May", price: 7 },
  { id: "jun", label: "Jun", price: 10 },
];

const round1: TimingParams = {
  mode: "lump-sum",
  budget: 1200,
  months: MONTHS_R1,
  feedbackTitle: "Close!",
  feedbackBody: "The price dropped even lower later.",
};

const round2: TimingParams = {
  mode: "lump-sum",
  budget: 1200,
  months: MONTHS_R2,
  feedbackTitle: "The market is unpredictable.",
  feedbackBody: "Even experienced investors can't consistently pick the perfect time.",
};

const round3: TimingParams = {
  mode: "dca",
  budget: 1200,
  monthlyAmount: 200,
  months: MONTHS_R1,
  feedbackTitle: "Bought at many prices.",
  feedbackBody: "Auto Invest didn't need the perfect month — it just showed up every month.",
  compareSourceScreenId: "puzzle-round-1",
  compareFallbackMonthId: "feb",
};

/**
 * Discovery Lab — dollar-cost averaging via try → miss → try → Auto Invest.
 * 3-round Duolingo-style beat under ~3 minutes.
 */
export const beatTheMarket: LessonDoc = {
  id: "beat-the-market",
  chapterId: "ch-lab",
  title: "Can You Beat the Market?",
  minutes: 3,
  concepts: ["dollar-cost-averaging"],
  screens: [
    {
      kind: "intro",
      id: "intro",
      title: "The Market",
      story: "Stocks go up.\n\nStocks go down.\n\nCan you buy at the best time?",
    },
    {
      kind: "puzzle",
      id: "puzzle-round-1",
      puzzle: {
        id: "pick-best-month",
        prompt: "Pick the best month",
        story: "Tap a month, then step forward one month at a time.",
        concepts: ["dollar-cost-averaging"],
        criteria: [{ id: "saw-the-market", label: "See how the year plays out" }],
        params: { mechanic: "timing", timing: round1 },
        retryParams: { mechanic: "timing", timing: round2 },
      },
    },
    {
      kind: "concept",
      id: "one-more-try",
      title: "One more try",
      body: "Think you've got it this time?\n\nA completely different year. Same challenge.",
    },
    {
      kind: "puzzle",
      id: "puzzle-round-2",
      puzzle: {
        id: "pick-again",
        prompt: "Pick the best month",
        story: "New prices. Tap a month, then keep stepping.",
        concepts: ["dollar-cost-averaging"],
        criteria: [{ id: "saw-the-market", label: "See how the year plays out" }],
        params: { mechanic: "timing", timing: round2 },
        retryParams: { mechanic: "timing", timing: round1 },
      },
    },
    {
      kind: "puzzle",
      id: "puzzle-auto-invest",
      puzzle: {
        id: "auto-invest",
        prompt: "Meet Auto Invest",
        story: "What if you didn't have to guess?",
        concepts: ["dollar-cost-averaging"],
        criteria: [{ id: "saw-auto-invest", label: "Watch every monthly buy" }],
        params: { mechanic: "timing", timing: round3 },
        retryParams: { mechanic: "timing", timing: round3 },
      },
    },
    {
      kind: "quiz",
      id: "quiz-why-auto",
      concept: "dollar-cost-averaging",
      prompt: "Why might Auto Invest be helpful?",
      options: [
        "It buys at different prices",
        "It always makes more money",
        "It predicts the market",
      ],
      answer: 0,
      explanation: "By investing regularly, you don't have to guess the perfect time.",
    },
    {
      kind: "generalize",
      id: "gen-dca",
      rule: "Dollar-Cost Averaging",
      body: "Invest a fixed amount regularly instead of trying to time the market.",
      skillUnlock: { label: "Dollar-Cost Averaging", xpNote: "+10 XP" },
    },
  ],
  hints: {
    "puzzle-round-1": [
      "Any month works for this beat — tap one to lock your buy.",
      "After you buy, use Next month to walk the rest of the year.",
      "You're not failing if a later month is cheaper. That's the point.",
      "Tap any month, then keep pressing Next month until June.",
    ],
    "puzzle-round-2": [
      "Fresh prices — don't reuse your last guess as a rule.",
      "Step month by month. Watch for a new low after you buy.",
      "Timing the market twice in a row is the trap, not the skill.",
      "Pick any month, then reveal all the way to June.",
    ],
    "puzzle-auto-invest": [
      "Tap Start Auto Invest, then Next month for each buy.",
      "Every month gets the same dollar amount — no guessing.",
      "Compare your one-shot price to the auto average at the end.",
      "Step through all six months to unlock the comparison.",
    ],
  },
  hintTargets: {
    "puzzle-round-1": "saw-the-market",
    "puzzle-round-2": "saw-the-market",
    "puzzle-auto-invest": "saw-auto-invest",
  },
  misconceptions: [
    {
      id: "perfect-timing",
      concept: "dollar-cost-averaging",
      signature: { criterionId: "saw-the-market", minFails: 2 },
      title: "I can time the bottom",
      wrongModel: "If I pick carefully, I'll catch the lowest month.",
      rightModel: "You only see the lowest after the year finishes — and the next year is different again.",
      testAction: "Finish the step-through, then try Auto Invest on the next screen.",
    },
  ],
};
