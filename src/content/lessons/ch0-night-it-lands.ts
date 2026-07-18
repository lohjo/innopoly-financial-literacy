import type { LessonDoc } from "../../features/learning-episode/types";

export const nightItLands: LessonDoc = {
  id: "night-it-lands",
  chapterId: "ch0",
  title: "The Night It Lands",
  minutes: 4,
  concepts: ["pay-yourself-first", "emergency-buffer"],
  screens: [
    {
      kind: "intro",
      id: "intro",
      title: "The Night It Lands",
      story:
        "It's the last Friday of the month. Your phone buzzes: $2,800 just landed — your first real paycheck. Rent is due, friends are already making weekend plans, and a small voice says \"save something.\" Can you keep the month solvent?",
    },
    {
      kind: "predict",
      id: "predict-leftover",
      prompt:
        "Rent is $800 and you spend about $40 a day. If you change nothing and just live off the account, how much is left on day 30?",
      unit: "$",
      min: 0,
      max: 2000,
      step: 50,
      actual: 800,
      explanation:
        "$2,800 − $800 rent − ($40 × 30 days) = $800 left. But that's a perfect month: no phone screens crack, no birthdays, no surprises. Whatever survives by accident isn't savings — it's leftovers.",
      concepts: ["pay-yourself-first"],
    },
    {
      kind: "concept",
      id: "concept-pyf",
      title: "Pay yourself first",
      body:
        "Money routed to savings on payday gets saved. Money left in the spending account gets spent — research on mental accounting shows leftover money quietly disappears into daily life. The move: route a fixed amount to savings the night the paycheck lands, before the month starts eating it.",
    },
    {
      kind: "puzzle",
      id: "puzzle-route",
      puzzle: {
        id: "route-first-paycheck",
        prompt: "Route your paycheck so the month survives — and $500 actually gets saved.",
        story: "Same month, one twist: on day 18 your phone screen cracks. $300, non-negotiable.",
        concepts: ["pay-yourself-first", "emergency-buffer"],
        criteria: [
          { id: "saved-target", label: "At least $500 routed to savings" },
          { id: "never-borrowed", label: "Spending money never hits zero" },
        ],
        params: {
          mechanic: "flow",
          flow: {
            salary: 2800,
            buckets: [
              { id: "save", label: "Savings", kind: "save" },
              { id: "rent", label: "Rent", kind: "fixed" },
            ],
            committed: { rent: 800 },
            dailyDrain: 40,
            days: 30,
            events: [{ day: 18, label: "Phone screen cracks", amount: 300 }],
            targets: { savedTarget: 500 },
          },
        },
        retryParams: {
          mechanic: "flow",
          flow: {
            salary: 3200,
            buckets: [
              { id: "save", label: "Savings", kind: "save" },
              { id: "rent", label: "Rent", kind: "fixed" },
            ],
            committed: { rent: 950 },
            dailyDrain: 45,
            days: 30,
            events: [{ day: 12, label: "Laptop charger dies", amount: 90 }],
            targets: { savedTarget: 700 },
          },
        },
      },
    },
    {
      kind: "quiz",
      id: "quiz-pyf",
      concept: "pay-yourself-first",
      prompt: "Why route savings on payday instead of saving \"whatever's left\" at month end?",
      options: [
        "Banks pay more interest early in the month",
        "Leftover money reliably gets spent — routing first makes saving the default",
        "It looks better on a bank statement",
        "You can't transfer money at month end",
      ],
      answer: 1,
      explanation:
        "The order is the mechanism: what's routed first is protected from the month. \"Save what's left\" usually means saving nothing, because spending expands to fill the account.",
    },
    {
      kind: "generalize",
      id: "gen-pyf",
      rule: "Route first, spend what remains.",
      body:
        "You just did it: savings moved the night pay landed, and the month — shock included — ran on the rest. The same one move works at $2,800 or $28,000, for savings, investments, or debt payments. Decide the split once, on payday, not thirty times across the month.",
    },
    {
      kind: "reflect",
      id: "reflect-pyf",
      prompt: "A friend says they'll \"start saving once spending settles down.\" What did this month show?",
      choices: [
        "They should wait for a calmer month",
        "Spending never settles — routing first is what makes room for it",
        "They just need a higher salary",
      ],
      best: 1,
      whyBest: "There is no calm month. The shock came anyway; the routed $500 survived because it left the spending pool before the month could touch it.",
    },
  ],
  hints: {
    "puzzle-route": [
      "Run the month once and look at the chart: which day did spending money get dangerously low, and what happened just before?",
      "Look at the \"Spending money never hits zero\" criterion against day 18. The shock costs $300 — your leftover after savings and rent has to absorb both the daily $40 and that spike.",
      "It's tempting to treat the whole $2,800 as spendable and save the maximum. But rent is committed, days drain $40 each, and the shock takes $300. Only what's left after those is really yours to route: $2,800 − $800 − $1,200 − $300 = $500.",
      "Set savings to exactly $500 — salary minus rent minus daily spending minus the shock. Watch the chart just clear zero. Then I'll change the numbers and you do the same reasoning alone.",
    ],
  },
  hintTargets: { "puzzle-route": "never-borrowed" },
  misconceptions: [
    {
      id: "salary-is-spendable",
      concept: "pay-yourself-first",
      signature: { criterionId: "never-borrowed", minFails: 2 },
      title: "The whole paycheck feels spendable",
      wrongModel: "\"$2,800 landed, so I can allocate $2,800.\" Committed costs and daily life feel like they'll sort themselves out.",
      rightModel: "Only salary minus committed costs minus realistic daily spending is yours to route. This month that's $500 — the rest is already spoken for.",
      testAction: "Test it — set savings to what's truly free",
    },
  ],
  scenarioId: "friend-expensive-weekend",
};
