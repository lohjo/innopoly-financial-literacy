/* Market-timing / DCA graders + price math. Pure. */
import type { TimingMonth, TimingParams } from "../../../features/learning-episode/types";

export type TimingAnswer = {
  /** lump-sum: chosen month id; dca: null */
  pickMonthId: string | null;
  /** how many months are visible (0 = none; months.length = fully revealed) */
  revealedCount: number;
};

export function lowestMonthId(months: TimingMonth[]): string {
  let best = months[0]!;
  for (const m of months) {
    if (m.price < best.price) best = m;
  }
  return best.id;
}

export function monthIndex(months: TimingMonth[], id: string): number {
  return months.findIndex((m) => m.id === id);
}

/** Arithmetic mean of monthly prices — simple visual average used in copy. */
export function arithmeticMeanPrice(months: TimingMonth[]): number {
  if (months.length === 0) return 0;
  return months.reduce((s, m) => s + m.price, 0) / months.length;
}

/**
 * True DCA average cost per share: fixed dollars each month → more shares when cheap.
 * monthlyAmount defaults to budget / n.
 */
export function dcaAverageCost(params: Pick<TimingParams, "budget" | "months" | "monthlyAmount">): number {
  const n = params.months.length;
  if (n === 0) return 0;
  const monthly = params.monthlyAmount ?? params.budget / n;
  let shares = 0;
  for (const m of params.months) {
    if (m.price <= 0) continue;
    shares += monthly / m.price;
  }
  const spent = monthly * n;
  return shares > 0 ? spent / shares : 0;
}

export function lumpSharePrice(months: TimingMonth[], pickMonthId: string | null): number | null {
  if (!pickMonthId) return null;
  return months.find((m) => m.id === pickMonthId)?.price ?? null;
}

/** Initial reveal after a lump-sum pick: show every month through the pick (past + buy). */
export function revealAfterPick(months: TimingMonth[], pickMonthId: string): number {
  const idx = monthIndex(months, pickMonthId);
  return idx < 0 ? 0 : idx + 1;
}

export function isFullyRevealed(params: Pick<TimingParams, "months">, answer: TimingAnswer): boolean {
  return answer.revealedCount >= params.months.length;
}

export function canAdvanceReveal(params: Pick<TimingParams, "months" | "mode">, answer: TimingAnswer): boolean {
  if (params.mode === "lump-sum" && !answer.pickMonthId) return false;
  return answer.revealedCount < params.months.length;
}

export function evaluateTiming(
  params: TimingParams,
  answer: TimingAnswer,
): { id: string; pass: boolean; detail?: string }[] {
  if (params.mode === "lump-sum") {
    const picked = Boolean(answer.pickMonthId);
    const revealed = isFullyRevealed(params, answer);
    return [
      {
        id: "saw-the-market",
        pass: picked && revealed,
        detail: !picked
          ? "Tap a month to invest, then step through the year."
          : revealed
            ? undefined
            : "Keep tapping Next month — see where the price goes.",
      },
    ];
  }

  const revealed = isFullyRevealed(params, answer);
  return [
    {
      id: "saw-auto-invest",
      pass: revealed,
      detail: revealed ? undefined : "Step through each month to watch Auto Invest buy.",
    },
  ];
}
