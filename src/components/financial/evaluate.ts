/* Dispatcher: PuzzleDoc + learner answer -> deterministic criterion results. */
import type { CriterionResult, PuzzleDoc } from "../../features/learning-episode/types";
import { evaluateFlow, type FlowAllocation } from "./sim/flow";
import { evaluateZones, type ZoneClassification } from "./sim/budget";
import { evaluateMinpay, minPaymentFor } from "./sim/minpay";

export type SimAnswer =
  | { mechanic: "flow"; alloc: FlowAllocation }
  | { mechanic: "zones"; cls: ZoneClassification }
  | { mechanic: "minpay"; payment: number };

export function defaultAnswer(puzzle: PuzzleDoc): SimAnswer {
  const p = puzzle.params;
  switch (p.mechanic) {
    case "flow":
      return { mechanic: "flow", alloc: { save: 0 } };
    case "zones":
      return { mechanic: "zones", cls: {} };
    case "minpay":
      return { mechanic: "minpay", payment: Math.round(minPaymentFor(p.minpay, p.minpay.balance)) };
  }
}

export function evaluatePuzzle(puzzle: PuzzleDoc, answer: SimAnswer): CriterionResult[] {
  const p = puzzle.params;
  if (p.mechanic === "flow" && answer.mechanic === "flow") return evaluateFlow(p.flow, answer.alloc);
  if (p.mechanic === "zones" && answer.mechanic === "zones") return evaluateZones(p.zones, answer.cls);
  if (p.mechanic === "minpay" && answer.mechanic === "minpay") return evaluateMinpay(p.minpay, answer.payment);
  throw new Error(`answer mechanic ${answer.mechanic} does not match puzzle ${p.mechanic}`);
}
