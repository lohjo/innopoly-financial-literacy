import type { LessonDoc } from "../../features/learning-episode/types";

export const minimumPaymentTrap: LessonDoc = {
  id: "minimum-payment-trap",
  chapterId: "ch1",
  title: "The Minimum Payment Trap",
  minutes: 4,
  concepts: ["minimum-payment", "apr-total-cost"],
  screens: [
    {
      kind: "intro",
      id: "intro",
      title: "The Minimum Payment Trap",
      story:
        "The booth outside the MRT gave you a card, a free tumbler, and a $3,000 balance three months later. The statement highlights one friendly number: \"Minimum payment: $90.\" It fits your budget perfectly. That's the trap.",
    },
    {
      kind: "predict",
      id: "predict-months",
      prompt: "Paying a steady $90 a month on $3,000 at 26% APR — how many months until the balance hits zero?",
      unit: " months",
      min: 6,
      max: 120,
      step: 6,
      actual: 60,
      explanation:
        "Five years. $3,000 ÷ $90 says 33 months — but most of each early payment is eaten by interest, not the balance. The friendly number is designed to keep the debt alive.",
      concepts: ["minimum-payment"],
    },
    {
      kind: "puzzle",
      id: "puzzle-payoff",
      puzzle: {
        id: "clear-in-12",
        prompt: "Find a monthly payment that clears the card within 12 months and keeps total interest under $450.",
        concepts: ["minimum-payment", "apr-total-cost"],
        criteria: [
          { id: "cleared-by-deadline", label: "Balance hits zero within 12 months" },
          { id: "interest-under-cap", label: "Total interest stays under $450" },
        ],
        params: {
          mechanic: "minpay",
          minpay: { balance: 3000, apr: 0.26, minPaymentPct: 0.03, minPaymentFloor: 50, targets: { deadlineMonths: 12, interestCap: 450 } },
        },
        retryParams: {
          mechanic: "minpay",
          minpay: { balance: 4500, apr: 0.24, minPaymentPct: 0.03, minPaymentFloor: 50, targets: { deadlineMonths: 15, interestCap: 750 } },
        },
      },
    },
    {
      kind: "quiz",
      id: "quiz-apr",
      concept: "apr-total-cost",
      prompt: "Two ways to borrow $3,000: A) \"only $90/month!\" B) \"$285/month for 12 months.\" How do you compare them?",
      options: [
        "A is better — the monthly payment is smaller",
        "B is better — bigger payments always win",
        "Compute each option's total paid over its full life, then compare",
        "They're the same $3,000 either way",
      ],
      answer: 2,
      explanation:
        "Only total cost over time tells the truth: A costs roughly $5,400 across five years; B about $3,420 in one. The monthly figure is marketing; the total is math.",
    },
    {
      kind: "generalize",
      id: "gen-total-cost",
      rule: "Always ask for the total cost.",
      body:
        "\"What will I have paid in total by the end?\" — one question that deflates minimum payments, BNPL instalments, car loans and phone plans alike. If the seller can't or won't answer it, that silence is the answer.",
    },
    {
      kind: "reflect",
      id: "reflect-trap",
      prompt: "The booth's pitch was \"just $90 a month — anyone can afford that.\" What was the pitch really selling?",
      choices: [
        "Convenient repayment flexibility",
        "Five years of interest dressed as affordability",
        "A genuinely cheap way to borrow",
      ],
      best: 1,
      whyBest: "The $90 wasn't designed to fit your budget — it was designed to maximize the months the balance survives. Affordable-sounding and expensive are not opposites.",
    },
  ],
  hints: {
    "puzzle-payoff": [
      "Slide the payment and watch the two number cards. Which one moves the way you need, and which barely moves at first?",
      "Look at the interest slice (amber) in the first months of the chart. Until your payment towers over that slice, the balance barely falls — that's what the 12-month criterion is fighting.",
      "The tempting model: \"any payment above the minimum makes steady progress.\" Reality: at 26% APR, $3,000 generates about $65 of interest in month one — only the part of your payment above that touches the balance. Small increases mostly feed interest.",
      "Set the payment to $300: the balance clears in 11 months with about $390 interest. Then I'll raise the balance and you find the payment that beats the new deadline yourself.",
    ],
  },
  hintTargets: { "puzzle-payoff": "cleared-by-deadline" },
  misconceptions: [
    {
      id: "minimum-payment-clears-debt",
      concept: "minimum-payment",
      signature: { criterionId: "cleared-by-deadline", minFails: 2 },
      title: "The minimum payment pays off the card",
      wrongModel: "\"I'm paying every month, so the debt is shrinking.\" The minimum feels like progress because it's a payment.",
      rightModel: "The minimum is calibrated to mostly cover interest. At $90 on $3,000, you're renting the debt for five years — the balance falls only when payments far exceed the monthly interest.",
      testAction: "Test it — push the payment past the interest",
    },
  ],
  scenarioId: "credit-card-booth",
};
