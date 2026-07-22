/* Multi-bucket distribute grader + shock math. Pure. */
import type { DistributeParams, ObserveShock } from "../../../features/learning-episode/types";

export type DistributeAnswer = { placement: Record<string, string> };

export function totalAmount(params: Pick<DistributeParams, "chips">): number {
  return params.chips.reduce((s, c) => s + c.amount, 0);
}

export function amountInBucket(
  params: Pick<DistributeParams, "chips">,
  placement: Record<string, string>,
  bucketId: string,
): number {
  return params.chips.reduce((s, c) => (placement[c.id] === bucketId ? s + c.amount : s), 0);
}

export function allPlaced(params: Pick<DistributeParams, "chips">, placement: Record<string, string>): boolean {
  return params.chips.every((c) => Boolean(placement[c.id]));
}

export function keptAfterBreak(
  params: Pick<DistributeParams, "chips">,
  placement: Record<string, string>,
  breakBucketId: string,
): { lost: number; kept: number; total: number } {
  const total = totalAmount(params);
  const lost = amountInBucket(params, placement, breakBucketId);
  return { lost, kept: total - lost, total };
}

export function evaluateDistribute(
  params: DistributeParams,
  answer: DistributeAnswer,
): { id: string; pass: boolean; detail?: string }[] {
  const placed = allPlaced(params, answer.placement);
  if (params.targets.mode === "all-placed") {
    return [
      {
        id: "all-placed",
        pass: placed,
        detail: placed ? undefined : "Place every unit into a basket before checking.",
      },
    ];
  }

  const { breakBucketId, minKept } = params.targets;
  if (!placed) {
    return [
      {
        id: "min-kept",
        pass: false,
        detail: "Place every egg into a basket before checking.",
      },
    ];
  }
  const { kept, lost } = keptAfterBreak(params, answer.placement, breakBucketId);
  const pass = kept + 1e-6 >= minKept;
  return [
    {
      id: "min-kept",
      pass,
      detail: pass
        ? undefined
        : `That basket held ${lost} — you kept ${kept}, need at least ${minKept}. Spread them out.`,
    },
  ];
}

/** Deterministic break target for observe beats. */
export function pickBreakBucket(
  params: Pick<DistributeParams, "chips" | "buckets">,
  placement: Record<string, string>,
  shock: Extract<ObserveShock, { kind: "egg-break" }>,
): string {
  if (shock.pick === "fixed") return shock.bucketId;

  const exclude = shock.excludeBucketId;
  let bestId = params.buckets[0]?.id ?? "";
  let bestAmt = -1;
  for (const b of params.buckets) {
    if (exclude && b.id === exclude) continue;
    const amt = amountInBucket(params, placement, b.id);
    if (amt > bestAmt) {
      bestAmt = amt;
      bestId = b.id;
    }
  }
  // if everything was in the excluded basket, fall back to that basket
  if (bestAmt <= 0 && exclude) {
    return exclude;
  }
  return bestId;
}

export function portfolioAfterDrop(
  params: Pick<DistributeParams, "chips">,
  placement: Record<string, string>,
  shock: Extract<ObserveShock, { kind: "portfolio-drop" }>,
): { loss: number; total: number; inBucket: number; heavy: boolean } {
  const start = totalAmount(params);
  const inBucket = amountInBucket(params, placement, shock.bucketId);
  const loss = inBucket * shock.dropRate;
  return {
    loss,
    total: start - loss,
    inBucket,
    heavy: inBucket + 1e-6 >= shock.heavyThreshold,
  };
}
