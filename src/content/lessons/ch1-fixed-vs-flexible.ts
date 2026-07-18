import type { LessonDoc } from "../../features/learning-episode/types";

export const fixedVsFlexible: LessonDoc = {
  id: "fixed-vs-flexible",
  chapterId: "ch1",
  title: "What Won't Bend",
  minutes: 3,
  concepts: ["fixed-vs-flexible"],
  screens: [
    {
      kind: "intro",
      id: "intro",
      title: "What Won't Bend",
      story:
        "A $400 dental bill just appeared. Your budget looks full — rent, transport, food, subscriptions, shopping. Something has to give. The question is: which of these can actually give?",
    },
    {
      kind: "concept",
      id: "concept-fvf",
      title: "Fixed vs flexible",
      body:
        "Fixed costs have contracts and consequences behind them — rent, insurance, a transport pass you prepaid. They will not shrink this month no matter how much you want them to. Flexible costs — eating out, shopping, subscriptions — can bend or be cut. A budget's real strength is how much of it can flex when it must.",
    },
    {
      kind: "puzzle",
      id: "puzzle-zones",
      puzzle: {
        id: "classify-costs",
        prompt: "Classify each cost, then absorb the $400 dental bill without touching your savings target.",
        concepts: ["fixed-vs-flexible"],
        criteria: [
          { id: "shock-covered", label: "The dental bill is fully covered" },
          { id: "savings-survive", label: "At least $500 still saved this month" },
          { id: "no-fixed-mislabel", label: "Nothing fixed is asked to shrink" },
        ],
        params: {
          mechanic: "zones",
          zones: {
            income: 2800,
            chips: [
              { id: "rent", label: "Rent", amount: 800, shrinkable: false },
              { id: "transport", label: "Transport pass", amount: 120, shrinkable: false },
              { id: "food", label: "Eating out", amount: 500, shrinkable: true },
              { id: "subs", label: "Subscriptions", amount: 80, shrinkable: true },
              { id: "shopping", label: "Shopping", amount: 400, shrinkable: true },
            ],
            shock: { label: "dental bill", amount: 400 },
            savingsTarget: 500,
          },
        },
        retryParams: {
          mechanic: "zones",
          zones: {
            income: 3100,
            chips: [
              { id: "rent", label: "Rent", amount: 950, shrinkable: false },
              { id: "insurance", label: "Insurance premium", amount: 150, shrinkable: false },
              { id: "dining", label: "Dining out", amount: 450, shrinkable: true },
              { id: "gym", label: "Gym", amount: 80, shrinkable: true },
              { id: "clothes", label: "Clothes", amount: 350, shrinkable: true },
            ],
            shock: { label: "vet bill", amount: 500 },
            savingsTarget: 600,
          },
        },
      },
    },
    {
      kind: "quiz",
      id: "quiz-fvf",
      concept: "fixed-vs-flexible",
      prompt: "Why does labeling rent \"flexible\" break a budget?",
      options: [
        "Landlords sometimes give discounts, so it's fine",
        "The plan counts on money that reality will never release",
        "Rent is usually too small to matter",
        "It doesn't — all categories compress under pressure",
      ],
      answer: 1,
      explanation:
        "A shock plan built on shrinking rent is fiction: the contract doesn't care about your month. Plans only work when the flexing happens where flexing is possible.",
    },
    {
      kind: "generalize",
      id: "gen-fvf",
      rule: "Know your flex capacity before you need it.",
      body:
        "You just measured it: your flexible costs are the true shock absorber of your month. Keep fixed costs low and the absorber stays big. This is why \"cheap rent, expensive coffee\" beats \"expensive rent, no coffee\" — one of those you can undo next week.",
    },
  ],
  hints: {
    "puzzle-zones": [
      "Ask of each cost: if I had to pay this bill tomorrow, could this line actually give me money back this month?",
      "Look at the \"Nothing fixed is asked to shrink\" criterion. Rent and the transport pass have contracts behind them — tapping them to Flexible doesn't make them so.",
      "The tempting model: under pressure, every category compresses a little. Reality: fixed costs refuse entirely, so the whole $400 must come from the genuinely flexible lines — eating out, subscriptions, shopping.",
      "Mark Rent and Transport pass as Fixed, set Subscriptions to Cut, and Eating out and Shopping to Flexible. Watch the bill get covered. Then I'll change the costs and you classify alone.",
    ],
  },
  hintTargets: { "puzzle-zones": "no-fixed-mislabel" },
  misconceptions: [
    {
      id: "all-categories-compressible",
      concept: "fixed-vs-flexible",
      signature: { criterionId: "no-fixed-mislabel", minFails: 2 },
      title: "Everything shrinks under pressure",
      wrongModel: "\"If money gets tight, I'll just spend a bit less on everything — including rent and the pass.\"",
      rightModel: "Fixed costs are contractual: they take their full amount or default. Only flexible costs can absorb a shock, so that's where the whole bill lands.",
      testAction: "Test it — flex only the flexible",
    },
  ],
};
