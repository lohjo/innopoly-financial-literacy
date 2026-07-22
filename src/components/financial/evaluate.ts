/* Dispatcher: PuzzleDoc + learner answer -> deterministic criterion results. */
import type { CriterionResult, PuzzleDoc } from "../../features/learning-episode/types";
import { evaluateFlow, type FlowAllocation } from "./sim/flow";
import { evaluateZones, type ZoneClassification } from "./sim/budget";
import { evaluateMinpay, minPaymentFor } from "./sim/minpay";
import { evaluateGrow, type GrowAnswer } from "./sim/grow";
import { evaluateSort, type SortAnswer } from "./sim/sort";
import { evaluateMatch, type MatchAnswer } from "./sim/match";
import { evaluateAllocate, type AllocateAnswer } from "./sim/allocate";
import { evaluateDistribute, type DistributeAnswer } from "./sim/distribute";
import { evaluateTiming, type TimingAnswer } from "./sim/timing";

export type SimAnswer =
  | { mechanic: "flow"; alloc: FlowAllocation }
  | { mechanic: "zones"; cls: ZoneClassification }
  | { mechanic: "minpay"; payment: number }
  | { mechanic: "grow"; years: number }
  | { mechanic: "sort"; order: string[] }
  | { mechanic: "match"; pairs: Record<string, string> }
  | { mechanic: "allocate"; placement: Record<string, string> }
  | { mechanic: "distribute"; placement: Record<string, string> }
  | { mechanic: "timing"; pickMonthId: string | null; revealedCount: number };

export function defaultAnswer(puzzle: PuzzleDoc): SimAnswer {
  const p = puzzle.params;
  switch (p.mechanic) {
    case "flow":
      return { mechanic: "flow", alloc: { save: 0 } };
    case "zones":
      return { mechanic: "zones", cls: {} };
    case "minpay":
      return { mechanic: "minpay", payment: Math.round(minPaymentFor(p.minpay, p.minpay.balance)) };
    case "grow":
      return { mechanic: "grow", years: 0 };
    case "sort":
      return { mechanic: "sort", order: [...p.sort.startOrder] };
    case "match":
      return { mechanic: "match", pairs: {} };
    case "allocate":
      return { mechanic: "allocate", placement: { ...p.allocate.initial } };
    case "distribute":
      return { mechanic: "distribute", placement: { ...p.distribute.initial } };
    case "timing":
      return { mechanic: "timing", pickMonthId: null, revealedCount: 0 };
  }
}

export function evaluatePuzzle(puzzle: PuzzleDoc, answer: SimAnswer): CriterionResult[] {
  const p = puzzle.params;
  if (p.mechanic === "flow" && answer.mechanic === "flow") return evaluateFlow(p.flow, answer.alloc);
  if (p.mechanic === "zones" && answer.mechanic === "zones") return evaluateZones(p.zones, answer.cls);
  if (p.mechanic === "minpay" && answer.mechanic === "minpay") return evaluateMinpay(p.minpay, answer.payment);
  if (p.mechanic === "grow" && answer.mechanic === "grow") return evaluateGrow(p.grow, answer as GrowAnswer);
  if (p.mechanic === "sort" && answer.mechanic === "sort") return evaluateSort(p.sort, answer as SortAnswer);
  if (p.mechanic === "match" && answer.mechanic === "match") return evaluateMatch(p.match, answer as MatchAnswer);
  if (p.mechanic === "allocate" && answer.mechanic === "allocate") return evaluateAllocate(p.allocate, answer as AllocateAnswer);
  if (p.mechanic === "distribute" && answer.mechanic === "distribute") {
    return evaluateDistribute(p.distribute, answer as DistributeAnswer);
  }
  if (p.mechanic === "timing" && answer.mechanic === "timing") {
    return evaluateTiming(p.timing, answer as TimingAnswer);
  }
  throw new Error(`answer mechanic ${answer.mechanic} does not match puzzle ${p.mechanic}`);
}
