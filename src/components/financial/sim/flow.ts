/* Paycheck flow simulation — pure math (mechanic M1, brilliant-replicate).
   Deterministic: application code owns simulation and grading (spec §11.2). */
import type { CriterionResult, FlowParams } from "../../../features/learning-episode/types";

export type FlowAllocation = Record<string, number>; // bucketId -> amount routed on payday

export type DayState = {
  day: number;
  spendCash: number; // money left in the spending pool
  savings: number;
  event?: { label: string; amount: number };
  borrowed: number; // cumulative shortfall covered by "borrowing"
};

/** Run the month day by day. Unallocated salary stays in the spending pool and drains daily. */
export function runFlowMonth(params: FlowParams, alloc: FlowAllocation): DayState[] {
  const save = alloc["save"] ?? 0;
  const committedTotal = Object.values(params.committed).reduce((a, b) => a + b, 0);
  let spendCash = params.salary - save - committedTotal;
  let savings = save;
  let borrowed = 0;
  const days: DayState[] = [];
  for (let day = 1; day <= params.days; day++) {
    spendCash -= params.dailyDrain;
    const event = params.events.find((e) => e.day === day);
    if (event) spendCash -= event.amount;
    if (spendCash < 0) {
      borrowed += -spendCash;
      spendCash = 0;
    }
    days.push({ day, spendCash: Math.round(spendCash), savings, event: event ? { label: event.label, amount: event.amount } : undefined, borrowed: Math.round(borrowed) });
  }
  return days;
}

export function endOfMonth(params: FlowParams, alloc: FlowAllocation) {
  const days = runFlowMonth(params, alloc);
  const last = days[days.length - 1];
  return { savings: last.savings, spendCash: last.spendCash, borrowed: last.borrowed, firstBrokeDay: days.find((d) => d.borrowed > 0)?.day ?? null };
}

/** criteria ids: saved-target, never-borrowed, buffer-left */
export function evaluateFlow(params: FlowParams, alloc: FlowAllocation): CriterionResult[] {
  const targets = params.targets;
  const end = endOfMonth(params, alloc);
  const out: CriterionResult[] = [];
  if (targets.savedTarget !== undefined) {
    out.push({
      id: "saved-target",
      pass: end.savings >= targets.savedTarget,
      detail: `You routed $${end.savings} to savings — target was $${targets.savedTarget}.`,
    });
  }
  out.push({
    id: "never-borrowed",
    pass: end.borrowed === 0,
    detail: end.firstBrokeDay ? `Spending money ran out on day ${end.firstBrokeDay}; you borrowed $${end.borrowed}.` : undefined,
  });
  if (targets.bufferLeft !== undefined) {
    out.push({
      id: "buffer-left",
      pass: end.spendCash >= targets.bufferLeft,
      detail: `$${end.spendCash} left in spending at month end — keep at least $${targets.bufferLeft}.`,
    });
  }
  return out;
}
