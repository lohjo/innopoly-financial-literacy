/* Gate 4 — outcome_response: pure mode selection from grade results.
   Never writes the evidence ledger, rewards, or mastery. Live may only narrate within the chosen mode. */

import type { CriterionResult } from "../../features/learning-episode/types";
import type { LessonStatus, OutcomeMode } from "./types";
import { failedCriterionIds } from "./grading";

/**
 * Map a Check grade result → UI/Finn speech mode.
 * Without a Check result, stay in coaching (Ask-without-Check).
 */
export function outcomeFromGrade(results: CriterionResult[] | null | undefined): OutcomeMode {
  if (!results || results.length === 0) {
    return { mode: "coaching", failedCriteria: [], speechMode: "socratic" };
  }
  const failed = failedCriterionIds(results);
  if (failed.length === 0) {
    return { mode: "success", failedCriteria: [], speechMode: "celebrate" };
  }
  return { mode: "failure", failedCriteria: failed, speechMode: "socratic" };
}

/** Derive outcome from episode status when results are not re-supplied. */
export function outcomeFromStatus(
  status: LessonStatus,
  failedCriteria: readonly string[] = [],
): OutcomeMode {
  if (status === "success") {
    return { mode: "success", failedCriteria: [], speechMode: "celebrate" };
  }
  if (status === "failure") {
    return {
      mode: "failure",
      failedCriteria: [...failedCriteria],
      speechMode: "socratic",
    };
  }
  return { mode: "coaching", failedCriteria: [...failedCriteria], speechMode: "socratic" };
}
