import type { LessonDoc } from "../../features/learning-episode/types";

export const shockMonth: LessonDoc = {
  id: "shock-month",
  chapterId: "ch1",
  title: "The Shock Month",
  minutes: 4,
  concepts: ["budget-shock", "fixed-vs-flexible"],
  screens: [
    {
      kind: "intro",
      id: "intro",
      title: "The Shock Month",
      story:
        "Three months in, life tests you: your laptop dies mid-project. $600, needed by Friday. This time you know the drill — but the month is bigger and messier. A plan that only works in a perfect month is not a plan.",
    },
    {
      kind: "predict",
      id: "predict-flex",
      prompt: "Before the shock: if you cut everything cuttable to zero this month, how much could your budget free up?",
      unit: "$",
      min: 200,
      max: 2000,
      step: 50,
      actual: 1250,
      explanation:
        "Groceries $400 + gym $50 + dining $450 + streaming $50 + clothes $300 = $1,250 of true flex capacity. That number — not your salary — is what decides which shocks you survive without borrowing.",
      concepts: ["budget-shock"],
    },
    {
      kind: "puzzle",
      id: "puzzle-shock",
      puzzle: {
        id: "absorb-600",
        prompt: "Absorb the $600 laptop without borrowing — and keep at least $400 saved.",
        concepts: ["budget-shock", "fixed-vs-flexible"],
        criteria: [
          { id: "shock-covered", label: "The $600 laptop is fully covered" },
          { id: "savings-survive", label: "At least $400 still saved this month" },
          { id: "no-fixed-mislabel", label: "Nothing fixed is asked to shrink" },
        ],
        params: {
          mechanic: "zones",
          zones: {
            income: 3000,
            chips: [
              { id: "rent", label: "Rent", amount: 900, shrinkable: false },
              { id: "insurance", label: "Insurance premium", amount: 120, shrinkable: false },
              { id: "groceries", label: "Groceries", amount: 400, shrinkable: true },
              { id: "gym", label: "Gym", amount: 50, shrinkable: true },
              { id: "dining", label: "Dining out", amount: 450, shrinkable: true },
              { id: "streaming", label: "Streaming", amount: 50, shrinkable: true },
              { id: "clothes", label: "Clothes", amount: 300, shrinkable: true },
            ],
            shock: { label: "laptop replacement", amount: 600 },
            savingsTarget: 400,
          },
        },
      },
    },
    {
      kind: "quiz",
      id: "quiz-shock",
      concept: "budget-shock",
      prompt: "What turns a $600 surprise from a debt event into an inconvenience?",
      options: [
        "A higher credit card limit",
        "Flex capacity plus a cash buffer built before the shock",
        "Waiting for the next paycheck",
        "Splitting it across three cards",
      ],
      answer: 1,
      explanation:
        "Cards move the shock into next month with interest attached. Flex capacity and a buffer absorb it this month, at zero cost. That's the whole function of an emergency fund.",
    },
    {
      kind: "generalize",
      id: "gen-shock",
      rule: "Stress-test the month before life does.",
      body:
        "You now run months through shocks on purpose. Before any big commitment — a nicer room, a car, a subscription stack — rerun this test: \"if $600 hits, does this month still work?\" If the answer is no, the commitment costs more than its price tag.",
    },
  ],
  hints: {
    "puzzle-shock": [
      "The laptop needs $600. Where in this month does $600 of give actually exist?",
      "Check the \"fully covered\" criterion: flexible lines give up half, cut lines give up everything. Add up what your current labels actually release.",
      "It's tempting to spread the pain everywhere — including rent and insurance. But they refuse. The $600 must come entirely from groceries, gym, dining, streaming and clothes; cutting the small stuff alone won't reach it.",
      "Set Dining out and Clothes to Cut ($750), Groceries to Flexible ($200). That's $950 released — laptop covered, savings safe. Now I'll change the month and you find the give alone.",
    ],
  },
  hintTargets: { "puzzle-shock": "shock-covered" },
  misconceptions: [
    {
      id: "small-cuts-suffice",
      concept: "budget-shock",
      signature: { criterionId: "shock-covered", minFails: 2 },
      title: "Trimming everywhere covers anything",
      wrongModel: "\"I'll cancel streaming and skip the gym — that should handle it.\" Small painless cuts feel like enough.",
      rightModel: "Streaming + gym free up $100. A $600 shock needs the big flexible lines — dining, clothes, groceries — to bend hard. Match the cut to the size of the shock.",
      testAction: "Test it — cut where the money is",
    },
  ],
};
