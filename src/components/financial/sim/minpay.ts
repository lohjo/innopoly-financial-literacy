/* Credit-card amortization — pure math (mechanic M3, "The Minimum Payment Trap"). */
import type { CriterionResult, MinPayParams } from "../../../features/learning-episode/types";

export type MonthStep = { month: number; interest: number; principal: number; balance: number; payment: number };

export function minPaymentFor(params: MinPayParams, balance: number): number {
  return Math.max(params.minPaymentFloor, balance * params.minPaymentPct);
}

/** Amortize with a fixed monthly payment (or the card minimum when payment === null). */
export function amortize(params: MinPayParams, payment: number | null, capMonths = 600): MonthStep[] {
  const r = params.apr / 12;
  let balance = params.balance;
  const steps: MonthStep[] = [];
  for (let month = 1; month <= capMonths && balance > 0.005; month++) {
    const interest = balance * r;
    const pay = Math.min(balance + interest, payment ?? minPaymentFor(params, balance));
    if (pay <= interest && balance > 0.005) {
      // payment never clears the debt — record one diverging step and stop
      steps.push({ month, interest: round2(interest), principal: round2(pay - interest), balance: round2(balance + interest - pay), payment: round2(pay) });
      return steps;
    }
    balance = balance + interest - pay;
    steps.push({ month, interest: round2(interest), principal: round2(pay - interest), balance: round2(Math.max(0, balance)), payment: round2(pay) });
  }
  return steps;
}

export function monthsToZero(params: MinPayParams, payment: number | null): number | null {
  const steps = amortize(params, payment);
  const last = steps[steps.length - 1];
  return last && last.balance <= 0.005 ? last.month : null;
}

export function totalInterest(params: MinPayParams, payment: number | null): number {
  return round2(amortize(params, payment).reduce((a, s) => a + s.interest, 0));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** criteria ids: cleared-by-deadline, interest-under-cap */
export function evaluateMinpay(params: MinPayParams, payment: number): CriterionResult[] {
  const targets = params.targets ?? { deadlineMonths: 12, interestCap: Infinity };
  const months = monthsToZero(params, payment);
  const interest = totalInterest(params, payment);
  return [
    {
      id: "cleared-by-deadline",
      pass: months !== null && months <= targets.deadlineMonths,
      detail:
        months === null
          ? "At this payment the balance never reaches zero."
          : `Debt clears in ${months} months — deadline is ${targets.deadlineMonths}.`,
    },
    {
      id: "interest-under-cap",
      pass: months !== null && interest <= targets.interestCap,
      detail: `Total interest paid: $${Math.round(interest)} — cap is $${targets.interestCap}.`,
    },
  ];
}

/* Compounding (salvaged from InteractiveLesson.tsx) — used by Ch0 predict screens. */
export function compound(monthly: number, years: number, annualRatePct: number): { finalValue: number; contributed: number; growth: number; yearly: number[] } {
  const months = years * 12;
  const r = annualRatePct / 100 / 12;
  const yearly: number[] = [];
  let balance = 0;
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) + monthly;
    if (m % 12 === 0) yearly.push(balance);
  }
  const contributed = monthly * months;
  return { finalValue: Math.round(balance), contributed, growth: Math.round(balance - contributed), yearly };
}
