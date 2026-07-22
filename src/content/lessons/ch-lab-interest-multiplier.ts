import type { LessonDoc } from "../../features/learning-episode/types";

/**
 * Experimental Brilliant-style showcase (Discovery Lab).
 * Discovery loop: predict → grow → sort → match → allocate → generalize → reflect.
 * No quiz screens — intentional contrast with the ch0/ch1 format.
 */
export const interestMultiplier: LessonDoc = {
  id: "interest-multiplier",
  chapterId: "ch-lab",
  title: "The Interest Multiplier",
  minutes: 5,
  concepts: ["interest-multiplier", "wait-cost"],
  screens: [
    {
      kind: "intro",
      id: "intro",
      title: "The Interest Multiplier",
      story:
        "Maya and Jordan both clear $2,800 a month. Maya routes $200 to savings the night payday lands. Jordan swears he'll save 'whatever's left.' Five years later, one of them has a quiet pile of money. The other has a story. You're about to feel why — before we name the rule.",
    },
    {
      kind: "predict",
      id: "predict-gap",
      prompt:
        "Maya saves $200 every month at a simulated 5% annual return. Jordan saves $0. After 5 years, about how much more does Maya have?",
      unit: "$",
      min: 0,
      max: 20000,
      step: 200,
      actual: 13600,
      explanation:
        "About $13,600. Not because Maya is 'disciplined' in the abstract — because $200 kept meeting interest, month after month, while Jordan's leftovers never showed up for duty.",
      concepts: ["interest-multiplier", "wait-cost"],
    },
    {
      kind: "puzzle",
      id: "puzzle-grow",
      puzzle: {
        id: "grow-gap",
        prompt: "Scrub the years. Make Maya's stack beat Jordan's by at least $10,000.",
        story: "Watch the stacks — don't calculate. Find the year where the gap clears the target, then Check.",
        concepts: ["interest-multiplier"],
        criteria: [{ id: "gap-target", label: "Gap reaches at least $10,000" }],
        params: {
          mechanic: "grow",
          grow: {
            monthlySave: 200,
            annualRate: 0.05,
            maxYears: 10,
            saveLabel: "Maya (save-first)",
            spendLabel: "Jordan (leftovers)",
            gapTarget: 10000,
          },
        },
        retryParams: {
          mechanic: "grow",
          grow: {
            monthlySave: 150,
            annualRate: 0.05,
            maxYears: 12,
            saveLabel: "Save-first path",
            spendLabel: "Leftover path",
            gapTarget: 9000,
          },
        },
      },
    },
    {
      kind: "puzzle",
      id: "puzzle-sort",
      puzzle: {
        id: "sort-impact",
        prompt: "Rank these moves by long-run impact — strongest on top.",
        story: "Urgency and impact are not the same thing. Drag (or use the arrows) until the order feels right.",
        concepts: ["interest-multiplier", "wait-cost"],
        criteria: [{ id: "order-correct", label: "Ranked by long-run impact" }],
        params: {
          mechanic: "sort",
          sort: {
            items: [
              {
                id: "auto-save",
                label: "Auto-route $200 to savings on payday",
                detail: "Shows up every month whether you feel rich or not.",
              },
              {
                id: "extra-card",
                label: "Pay more than the minimum on a 26% APR card",
                detail: "Stops interest from multiplying against you.",
              },
              {
                id: "one-coffee",
                label: "Skip one $8 coffee this week",
                detail: "Nice — but a one-off doesn't compound.",
              },
            ],
            correctOrder: ["auto-save", "extra-card", "one-coffee"],
            startOrder: ["one-coffee", "auto-save", "extra-card"],
          },
        },
      },
    },
    {
      kind: "puzzle",
      id: "puzzle-match",
      puzzle: {
        id: "match-interest-diet",
        prompt: "Pair each money habit with what interest does to it.",
        story: "Interest is not moral. It multiplies whatever you feed it — debt or savings.",
        concepts: ["interest-multiplier"],
        criteria: [{ id: "all-matched", label: "Every habit paired correctly" }],
        params: {
          mechanic: "match",
          match: {
            left: [
              { id: "unpaid-card", label: "Carrying an unpaid card balance" },
              { id: "auto-route", label: "Auto-routing savings on payday" },
              { id: "checking-leftover", label: "Leaving 'whatever's left' in checking" },
            ],
            right: [
              { id: "against", label: "Interest works against you" },
              { id: "for-you", label: "Interest works for you" },
              { id: "nothing", label: "Interest finds almost nothing to grow" },
            ],
            solution: {
              "unpaid-card": "against",
              "auto-route": "for-you",
              "checking-leftover": "nothing",
            },
          },
        },
      },
    },
    {
      kind: "puzzle",
      id: "puzzle-allocate",
      puzzle: {
        id: "allocate-tonight",
        prompt: "Route at least $380 to Save-first tonight — before the month starts nibbling.",
        story: "Tap a chip to flip it between columns. Leftovers look available… until they evaporate into daily life.",
        concepts: ["wait-cost"],
        criteria: [{ id: "min-save", label: "At least $380 in Save-first" }],
        params: {
          mechanic: "allocate",
          allocate: {
            chips: [
              { id: "rent", label: "Rent", amount: 900 },
              { id: "seed", label: "Savings seed", amount: 200 },
              { id: "buffer", label: "Buffer top-up", amount: 180 },
              { id: "groceries", label: "Groceries", amount: 350 },
              { id: "fun", label: "Weekend plans", amount: 120 },
            ],
            buckets: [
              { id: "save", label: "Save-first", kind: "save" },
              { id: "spend", label: "Leftover", kind: "spend" },
            ],
            initial: {
              rent: "spend",
              seed: "spend",
              buffer: "spend",
              groceries: "spend",
              fun: "spend",
            },
            targets: { minSave: 380 },
            evaporateNote:
              "Simulated month: money left in Leftover tends to get spent. Money in Save-first is what interest can actually multiply.",
          },
        },
        retryParams: {
          mechanic: "allocate",
          allocate: {
            chips: [
              { id: "rent", label: "Rent", amount: 950 },
              { id: "seed", label: "Savings seed", amount: 250 },
              { id: "buffer", label: "Buffer top-up", amount: 150 },
              { id: "transit", label: "Transit", amount: 120 },
              { id: "fun", label: "Friends' dinner", amount: 90 },
            ],
            buckets: [
              { id: "save", label: "Save-first", kind: "save" },
              { id: "spend", label: "Leftover", kind: "spend" },
            ],
            initial: {
              rent: "spend",
              seed: "spend",
              buffer: "spend",
              transit: "spend",
              fun: "spend",
            },
            targets: { minSave: 400 },
            evaporateNote: "Same idea, new numbers — route before the month decides for you.",
          },
        },
      },
    },
    {
      kind: "generalize",
      id: "gen-multiplier",
      rule: "Interest multiplies whatever you feed it.",
      body:
        "You just watched a gap open because one path kept feeding interest and the other didn't. Debt interest multiplies balances you leave unpaid. Savings interest multiplies amounts you actually park. Waiting to 'see what's left' usually feeds interest nothing — and the cost of that wait is visible once you scrub the years.",
    },
    {
      kind: "reflect",
      id: "reflect-tonight",
      prompt: "Tonight, which move most changes what interest gets to multiply?",
      choices: [
        "Route a fixed amount to savings the night payday lands",
        "Promise yourself you'll save whatever is left on day 28",
        "Wait until you 'feel more settled' next quarter",
      ],
      best: 0,
      whyBest:
        "A fixed route shows up for interest every month. Leftovers and 'later' usually don't — which is the wait cost you just felt on the scrubber.",
    },
  ],
  hints: {
    "puzzle-grow": [
      "Try year 3, then year 5 — watch how the gap accelerates, not just adds.",
      "The criterion cares about the gap number under the stacks, not the year label alone.",
      "People often expect linear growth. Compounding bends the curve up — that's why early years feel slow.",
      "Park the scrubber at year 4 or later so the gap clears $10,000, then Check.",
    ],
    "puzzle-sort": [
      "Ask: which move still matters in year 5 if you only do it once vs every month?",
      "The top card should be the one that feeds interest every single payday.",
      "A one-off coffee skip is real — it just doesn't compound like a monthly route or crushing high APR.",
      "Top → bottom: auto-route savings, then extra card payment, then the one coffee.",
    ],
    "puzzle-match": [
      "Interest doesn't care about intentions — only about the balance it can touch.",
      "Start with the unpaid card: what does interest do to a balance you leave sitting?",
      "Leftovers in checking usually never become a balance that earns — so interest finds almost nothing.",
      "Unpaid card → against you; auto-route → for you; leftovers → almost nothing.",
    ],
    "puzzle-allocate": [
      "You need $380 in Save-first — the savings seed plus the buffer top-up get you there.",
      "Tap a chip in Leftover to flip it into Save-first.",
      "Rent and groceries can stay in Leftover for this puzzle; the criterion is about what you route to multiply.",
      "Move Savings seed ($200) and Buffer top-up ($180) into Save-first, then Check.",
    ],
  },
  hintTargets: {
    "puzzle-grow": "gap-target",
    "puzzle-sort": "order-correct",
    "puzzle-match": "all-matched",
    "puzzle-allocate": "min-save",
  },
  misconceptions: [
    {
      id: "linear-gap",
      concept: "interest-multiplier",
      signature: { criterionId: "gap-target", minFails: 2 },
      title: "Expecting a straight line",
      wrongModel: "Each year should add the same chunk, so year 3 ought to be enough.",
      rightModel: "Interest pays on interest — later years add more than early ones. Scrub further.",
      testAction: "Move the scrubber past year 4 and watch the gap jump, then Check again.",
    },
    {
      id: "urgency-equals-impact",
      concept: "wait-cost",
      signature: { criterionId: "order-correct", minFails: 2 },
      title: "Confusing urgency with impact",
      wrongModel: "The small, visible cut must matter most because I can do it today.",
      rightModel: "Long-run impact belongs to moves that repeat or stop high-rate multiplication.",
      testAction: "Put the monthly auto-route on top and re-check.",
    },
  ],
};
