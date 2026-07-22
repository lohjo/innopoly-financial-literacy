import type { LessonDoc } from "../../features/learning-episode/types";

export const missing740: LessonDoc = {
  id: "missing-740",
  chapterId: "ch0",
  title: "The Case of the Missing $740",
  minutes: 3,
  concepts: ["gross-vs-net", "cpf-contribution"],
  screens: [
    {
      kind: "intro",
      id: "intro",
      title: "The Case of the Missing $740",
      story:
        "Your contract says $3,700 a month. Your bank app says $2,960 arrived. Nobody warned you, nobody explained, and $740 is just… gone. Time to read your first payslip like a detective.",
    },
    {
      kind: "quiz",
      id: "quiz-where",
      concept: "gross-vs-net",
      prompt: "Contract: $3,700. Bank: $2,960. Where did the $740 go?",
      options: [
        "Income tax, deducted monthly",
        "Your CPF contribution — 20% of your wage",
        "Bank processing fees",
        "A payroll error you should report",
      ],
      answer: 1,
      explanation:
        "In Singapore, employees under 55 contribute 20% of ordinary wages to CPF — $740 on $3,700. Income tax isn't deducted monthly from your payslip; you're assessed the following year. (Educational example, rates as of 2026 — check CPF Board for current figures.)",
    },
    {
      kind: "concept",
      id: "concept-cpf",
      title: "The money you can't see is still yours",
      body:
        "That $740 didn't vanish — it moved into three accounts you own: Ordinary Account (housing, education), Special Account (retirement), MediSave (healthcare). You can't spend it at a café, but it buys your future flat, compounds for retirement, and pays hospital bills.",
      factNote: "Jurisdiction: SG · educational example · rates as of 2026 · source: CPF Board",
    },
    {
      kind: "predict",
      id: "predict-employer",
      prompt:
        "Here's the part most people miss: your employer pays 17% on top of your salary into your CPF. In total, how much entered your CPF this month?",
      unit: "$",
      min: 700,
      max: 2000,
      step: 10,
      actual: 1369,
      explanation:
        "Your $740 (20%) + your employer's $629 (17% of $3,700) = $1,369 into your accounts. Your real monthly compensation is $4,329 — the payslip just splits it across present-you and future-you.",
      concepts: ["cpf-contribution"],
    },
    {
      kind: "quiz",
      id: "quiz-lost",
      concept: "cpf-contribution",
      prompt: "So — is the $740 lost money?",
      options: [
        "Yes, it's a tax you never see again",
        "Mostly lost, unless you retire in Singapore",
        "No — it's in accounts you own, earmarked for housing, retirement and healthcare",
        "It depends on your employer",
      ],
      answer: 2,
      explanation:
        "It's your money in your accounts — just time-shifted. Treating CPF as \"vanished\" makes offers look worse than they are and hides a third of your real compensation.",
    },
    {
      kind: "generalize",
      id: "gen-payslip",
      rule: "Read offers in total compensation, not take-home.",
      body:
        "Two offers, same $3,700 gross, look identical in the bank app. But CPF, bonuses and benefits change what you actually earn. You can now read a payslip: gross, employee CPF, employer CPF, net. That skill prices every job offer you'll ever compare.",
    },
  ],
  hints: {},
  // tutor "point" targets for the quiz beats (no puzzle screens in this lesson)
  hintTargets: { "quiz-where": "opt-1", "quiz-lost": "opt-2" },
  misconceptions: [],
};
