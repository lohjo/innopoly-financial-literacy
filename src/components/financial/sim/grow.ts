/* Future value of a monthly contribution with monthly compounding. Pure math. */
export type GrowAnswer = { years: number };

export function futureValueAnnuity(monthly: number, annualRate: number, years: number): number {
  if (years <= 0 || monthly <= 0) return 0;
  const r = annualRate / 12;
  const n = Math.round(years * 12);
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r);
}

export function growGap(params: { monthlySave: number; annualRate: number }, years: number): number {
  return futureValueAnnuity(params.monthlySave, params.annualRate, years);
}

export function evaluateGrow(
  params: { monthlySave: number; annualRate: number; gapTarget: number; maxYears: number },
  answer: GrowAnswer,
): { id: string; pass: boolean; detail?: string }[] {
  const years = Math.max(0, Math.min(params.maxYears, answer.years));
  const gap = growGap(params, years);
  const pass = gap + 1e-6 >= params.gapTarget;
  return [
    {
      id: "gap-target",
      pass,
      detail: pass
        ? undefined
        : `At ${years} year${years === 1 ? "" : "s"} the gap is about $${Math.round(gap).toLocaleString("en-US")} — keep scrubbing.`,
    },
  ];
}
