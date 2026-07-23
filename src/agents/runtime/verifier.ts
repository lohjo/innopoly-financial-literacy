/* Deterministic gate between model JSON and narration. Never invents pass/fail. */

import { acceptSpokenFollowup, type OutcomeMode } from "../gates";
import { MissExplainOutputSchema, type MissExplainOutput } from "./schemas";
import type { VerifierResult } from "./types";

const OUTCOME_CLAIM =
  /\b(you (passed|failed|got it right|got it wrong)|award(ed)? (xp|points)|mastery (is|updated)|congratulations,? you (passed|succeeded))\b/i;
const XP_CLAIM = /\b(award|grant|give)\b.{0,24}\b(xp|points|mastery|streak|achievement)/i;

export type MissExplainContext = {
  outcome: OutcomeMode;
  failedCriteria: readonly string[];
  allowedCriteria: readonly string[];
};

/**
 * Verify MissExplainOutput against hint_rubric + outcome_response invariants.
 * Must be called only when outcome.mode === "failure".
 */
export function verifyMissExplain(
  raw: unknown,
  ctx: MissExplainContext,
): VerifierResult<MissExplainOutput> {
  if (ctx.outcome.mode !== "failure") {
    return {
      ok: false,
      reason: "MissExplain only allowed after outcome_response=failure",
      code: "gate_order",
    };
  }

  const parsed = MissExplainOutputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.message, code: "schema" };
  }
  const value = parsed.data;

  if (OUTCOME_CLAIM.test(value.question) || (value.rationale && OUTCOME_CLAIM.test(value.rationale))) {
    return { ok: false, reason: "claims pass/fail contrary to gates", code: "outcome_claim" };
  }
  if (XP_CLAIM.test(value.question) || (value.rationale && XP_CLAIM.test(value.rationale))) {
    return { ok: false, reason: "suggests awarding XP/mastery", code: "xp_claim" };
  }

  const aligned = acceptSpokenFollowup(value.question, {
    criterionId: value.criterionId ?? null,
    failedCriteria: ctx.failedCriteria,
    allowedCriteria: ctx.allowedCriteria,
    level: 1,
  });
  if (!aligned.ok) {
    const code =
      aligned.reason.includes("criterion") ? "criterion" : aligned.reason.includes("digit") || aligned.reason.includes("spoken") ? "policy" : "policy";
    return { ok: false, reason: aligned.reason, code: code === "criterion" ? "criterion" : "policy" };
  }

  return { ok: true, value };
}

/** Parse model text as JSON object (strips optional markdown fences). */
export function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const body = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(body) as unknown;
}
