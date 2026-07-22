import type { DistributeParams, LessonDoc } from "../../features/learning-episode/types";

const EGG_BUCKETS = [
  { id: "a", label: "Basket A" },
  { id: "b", label: "Basket B" },
  { id: "c", label: "Basket C" },
  { id: "d", label: "Basket D" },
];

const EGG_CHIPS = Array.from({ length: 12 }, (_, i) => ({
  id: `egg-${i + 1}`,
  label: `Egg ${i + 1}`,
  amount: 1,
}));

const MONEY_BUCKETS = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
  { id: "d", label: "D" },
];

const MONEY_CHIPS = Array.from({ length: 10 }, (_, i) => ({
  id: `bill-${i + 1}`,
  label: "$100",
  amount: 100,
}));

const eggsPack: DistributeParams = {
  theme: "eggs",
  chips: EGG_CHIPS,
  buckets: EGG_BUCKETS,
  initial: {},
  targets: { mode: "all-placed" },
  firstPlaceNudge: "Great! Keep going.",
};

/** Second try: Basket B breaks — keep ≥ 8 (at most 4 eggs in B). Different from first observe (fullest). */
const eggsRetry: DistributeParams = {
  theme: "eggs",
  chips: EGG_CHIPS,
  buckets: EGG_BUCKETS,
  initial: {},
  targets: { mode: "min-kept", breakBucketId: "b", minKept: 8 },
  firstPlaceNudge: "Great! Keep going.",
};

const moneyPack: DistributeParams = {
  theme: "money",
  chips: MONEY_CHIPS,
  buckets: MONEY_BUCKETS,
  initial: {},
  targets: { mode: "all-placed" },
  firstPlaceNudge: "Great! Keep going.",
};

/**
 * Discovery Lab — diversification via eggs → baskets → investments.
 * Watch → Copy → Do → Consequence → Retry → Reveal.
 */
export const oneBasket: LessonDoc = {
  id: "one-basket",
  chapterId: "ch-lab",
  title: "One Basket?",
  minutes: 2,
  concepts: ["diversification"],
  screens: [
    {
      kind: "intro",
      id: "intro",
      title: "One Basket?",
      story: "Let's play a quick game.\n\nYour goal is to keep as many eggs safe as possible.",
    },
    {
      kind: "puzzle",
      id: "puzzle-pack-eggs",
      puzzle: {
        id: "pack-eggs",
        prompt: "You have 12 eggs.\n\nDrag the eggs into the baskets below.",
        story: "Pack the eggs — tap an egg, then a basket. (Or tap a basket to send the next egg.)",
        concepts: ["diversification"],
        criteria: [{ id: "all-placed", label: "All 12 eggs are in baskets" }],
        params: { mechanic: "distribute", distribute: eggsPack },
        retryParams: { mechanic: "distribute", distribute: eggsPack },
      },
    },
    {
      kind: "observe",
      id: "observe-first-break",
      title: "Watch what happens...",
      sourceScreenId: "puzzle-pack-eggs",
      shock: { kind: "egg-break", pick: "fullest" },
    },
    {
      kind: "concept",
      id: "one-more-try",
      title: "One more try",
      body: "This time...\n\nCan you save at least 8 eggs?",
    },
    {
      kind: "puzzle",
      id: "puzzle-save-eight",
      puzzle: {
        id: "save-eight",
        prompt: "Can you save at least 8 eggs?",
        story: "One basket will break again — a different one this time. Spread the eggs.",
        concepts: ["diversification"],
        criteria: [{ id: "min-kept", label: "Keep at least 8 eggs when a basket breaks" }],
        params: { mechanic: "distribute", distribute: eggsRetry },
        retryParams: {
          mechanic: "distribute",
          distribute: {
            ...eggsRetry,
            targets: { mode: "min-kept", breakBucketId: "c", minKept: 8 },
          },
        },
      },
    },
    {
      kind: "concept",
      id: "morph",
      title: "Something looks familiar...",
      body: "Each basket slowly changes into an investment.\n\n🧺 → 📈\n\nEach egg becomes money.\n\n🥚 → 💰",
      factNote: "Same move. New labels.",
    },
    {
      kind: "puzzle",
      id: "puzzle-invest",
      puzzle: {
        id: "invest-1000",
        prompt: "Imagine each basket is an investment.\n\nDrag your $1000 into the investments.",
        story: "Tap a $100 bill, then an investment — same interaction as the eggs.",
        concepts: ["diversification"],
        criteria: [{ id: "all-placed", label: "All $1000 is invested" }],
        params: { mechanic: "distribute", distribute: moneyPack },
        retryParams: { mechanic: "distribute", distribute: moneyPack },
      },
    },
    {
      kind: "observe",
      id: "observe-drop",
      title: "One investment drops.",
      sourceScreenId: "puzzle-invest",
      shock: { kind: "portfolio-drop", bucketId: "b", dropRate: 0.4, heavyThreshold: 500 },
    },
    {
      kind: "generalize",
      id: "gen-diversify",
      rule: "You discovered diversification!",
      body: "Putting everything in one place is risky.\n\nSpreading your money reduces the impact if one investment performs badly.",
      skillUnlock: { label: "Diversification", xpNote: "+10 XP" },
    },
  ],
  hints: {
    "puzzle-pack-eggs": [
      "Tap any egg in the pool, then tap a basket to place it.",
      "You can also tap a basket with nothing selected — it takes the next egg from the pool.",
      "Every egg has to leave the pool. Empty baskets are fine — full ones are the risk.",
      "Keep tapping baskets until the pool is empty, then Check.",
    ],
    "puzzle-save-eight": [
      "If one basket holds more than 4 eggs, a break there leaves you under 8.",
      "Aim for a spread — no basket should look overloaded.",
      "People pile into one 'safe' basket. That basket is the one that hurts when it breaks.",
      "Put at most 4 eggs in Basket B (it breaks this round), then Check.",
    ],
    "puzzle-invest": [
      "Same as eggs — tap a bill, then an investment letter.",
      "You have ten $100 bills. All of them need a home.",
      "Parking everything in one letter is the eggs-in-one-basket move again.",
      "Spread the bills across A–D, empty the pool, then Check.",
    ],
  },
  hintTargets: {
    "puzzle-pack-eggs": "all-placed",
    "puzzle-save-eight": "min-kept",
    "puzzle-invest": "all-placed",
  },
  misconceptions: [
    {
      id: "one-safe-basket",
      concept: "diversification",
      signature: { criterionId: "min-kept", minFails: 2 },
      title: "One 'safe' pile",
      wrongModel: "If I pick the right basket, everything will be fine.",
      rightModel: "You don't control which basket breaks — only how many eggs each one holds.",
      testAction: "Cap Basket B at 4 eggs or fewer, spread the rest, then Check.",
    },
  ],
};
