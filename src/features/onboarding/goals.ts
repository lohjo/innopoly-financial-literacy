/* Learner-selected goals — never inferred from accounts (spec §5.1). */
export type Goal = { id: string; label: string; short: string; concepts: string[] };

export const GOALS: Goal[] = [
  {
    id: "first-month-stability",
    label: "Make my first paychecks survive the month",
    short: "first-month stability",
    concepts: ["pay-yourself-first", "fixed-vs-flexible", "budget-shock"],
  },
  {
    id: "understand-payslip",
    label: "Actually understand my payslip and CPF",
    short: "payslip fluency",
    concepts: ["gross-vs-net", "cpf-contribution"],
  },
  {
    id: "avoid-debt-traps",
    label: "Stay out of credit and BNPL traps",
    short: "debt-trap immunity",
    concepts: ["minimum-payment", "apr-total-cost"],
  },
];
