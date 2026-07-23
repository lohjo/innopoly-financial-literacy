/* Gate 3 — grading: thin facade over evaluatePuzzle. Sync, pure, never model-backed. */

export {
  evaluatePuzzle,
  defaultAnswer,
  type SimAnswer,
} from "../../components/financial/evaluate";

export type { CriterionResult, PuzzleDoc } from "../../features/learning-episode/types";

import { evaluatePuzzle, type SimAnswer } from "../../components/financial/evaluate";
import type { CriterionResult, PuzzleDoc } from "../../features/learning-episode/types";

/** Named gate entry — identical semantics to evaluatePuzzle. */
export function gradePuzzle(puzzle: PuzzleDoc, answer: SimAnswer): CriterionResult[] {
  return evaluatePuzzle(puzzle, answer);
}

export function allCriteriaPass(results: CriterionResult[]): boolean {
  return results.length > 0 && results.every((r) => r.pass);
}

export function failedCriterionIds(results: CriterionResult[]): string[] {
  return results.filter((r) => !r.pass).map((r) => r.id);
}
