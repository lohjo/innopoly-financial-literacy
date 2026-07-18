/* Real-world missions: low-risk offline actions, self-reported (spec §2.1 real-world readiness).
   No transaction verification, ever. */
export type Mission = {
  id: string;
  title: string;
  body: string;
  /** which lesson unlocks it */
  afterLesson: string;
  concepts: string[];
};

export const MISSIONS: Mission[] = [
  {
    id: "routing-checklist",
    title: "Write your payday routing checklist",
    body: "Three lines, your numbers: how much routes to savings the night pay lands, what's committed, what's left per day. Stick it where you'll see it on payday.",
    afterLesson: "night-it-lands",
    concepts: ["pay-yourself-first"],
  },
  {
    id: "read-payslip",
    title: "Read your real payslip",
    body: "Find gross, employee CPF, employer CPF, and net on your own payslip. If any line doesn't match what you expect, write down the question to ask HR.",
    afterLesson: "missing-740",
    concepts: ["gross-vs-net", "cpf-contribution"],
  },
  {
    id: "flex-audit",
    title: "Label your real month",
    body: "List your five biggest monthly costs and mark each Fixed or Flexible. Add up the flexible half — that number is your real shock absorber.",
    afterLesson: "fixed-vs-flexible",
    concepts: ["fixed-vs-flexible"],
  },
];

export function nextMission(lessonsCompleted: string[], missionsDone: string[]): Mission | null {
  return MISSIONS.find((m) => lessonsCompleted.includes(m.afterLesson) && !missionsDone.includes(m.id)) ?? null;
}
