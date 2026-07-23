/* Gate 1 — ui_highlight: validate allowlisted criterion → DOM selector.
   Target *choice* is never model-owned; Live may only *request* an id that passes here. */

import { resolveTutorSelector } from "../../features/copilot/tutorTargets";
import type { UiHighlightResult } from "./types";

export type UiHighlightRequest =
  | { action: "highlight_criterion"; criterionId: string }
  | { action: "clear_highlight" }
  | { action: "pulse_tutor" };

export type ResolveSelector = (targetId: string) => string;

const ALLOWED_ACTIONS = new Set(["highlight_criterion", "clear_highlight", "pulse_tutor"]);

/**
 * Validate a highlight/pulse/clear request against the visible criterion allowlist.
 * Inject `resolveSelector` in unit tests to avoid DOM dependence.
 */
export function validateUiHighlight(
  request: UiHighlightRequest,
  allowedCriterionIds: readonly string[],
  resolveSelector: ResolveSelector = resolveTutorSelector,
): UiHighlightResult {
  if (!ALLOWED_ACTIONS.has(request.action)) {
    return { ok: false, reason: "unsupported tutor render action" };
  }

  if (request.action === "highlight_criterion") {
    const id = request.criterionId?.trim();
    if (!id) return { ok: false, reason: "highlight_criterion requires criterion_id" };
    if (!allowedCriterionIds.includes(id)) {
      return { ok: false, reason: "Criterion is not visible in this lesson." };
    }
    return {
      ok: true,
      command: { action: "highlight_criterion", criterionId: id },
      selector: resolveSelector(id),
    };
  }

  if (request.action === "clear_highlight") {
    return { ok: true, command: { action: "clear_highlight" } };
  }

  return { ok: true, command: { action: "pulse_tutor" } };
}

/**
 * Apply a validated highlight to the UI seam. Callers must pass validation first —
 * this helper re-validates so setHighlight never runs on an off-allowlist id.
 */
export function applyValidatedHighlight(
  request: UiHighlightRequest,
  allowedCriterionIds: readonly string[],
  setHighlight: (targetId: string | null) => void,
  resolveSelector: ResolveSelector = resolveTutorSelector,
): UiHighlightResult {
  const result = validateUiHighlight(request, allowedCriterionIds, resolveSelector);
  if (!result.ok) return result;
  if (result.command.action === "highlight_criterion") {
    setHighlight(result.command.criterionId);
  } else if (result.command.action === "clear_highlight") {
    setHighlight(null);
  }
  return result;
}
