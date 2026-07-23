/* Gate 2 — hint_rubric_alignment: authored hints + Socratic policy.
   Spoken phrasing helpers may run only AFTER this gate accepts a candidate. */

export const FALLBACK_QUESTION = "Which visible criterion would you test next?";

const DISALLOWED = /\b(answer|correct|choose|select|set|enter|the value is|the payment is|which value is|you should|do this|\d)\b/i;

export type HintLevel = 1 | 2 | 3 | 4;

export type AlignedHint =
  | { ok: true; text: string; level: HintLevel; criterionId: string | null; source: "authored" | "candidate" }
  | { ok: false; reason: string };

/** Parity with tutor-service `safe_spoken_hint` — one short Socratic question, no digits/answers. */
export function safeSpokenHint(text: string): boolean {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.split(" ").length > 25) return false;
  if ((normalized.match(/\?/g) ?? []).length !== 1 || !normalized.endsWith("?")) return false;
  return !DISALLOWED.test(normalized);
}

/**
 * Pick the authored hint for a screen + ladder level.
 * H1–H4 are lesson.hints[screenId]; Live voice uses ≤ H2.
 */
export function authoredHintFor(
  hints: Record<string, [string, string, string, string]> | undefined,
  screenId: string,
  level: HintLevel,
): AlignedHint {
  const ladder = hints?.[screenId];
  if (!ladder) return { ok: false, reason: "no authored hints for screen" };
  const text = ladder[level - 1];
  if (!text?.trim()) return { ok: false, reason: "empty authored hint" };
  return { ok: true, text, level, criterionId: null, source: "authored" };
}

/**
 * Align a model (or authored) spoken candidate to failed/allowlisted criteria.
 * Rejects misaligned criterion ids and unsafe spoken text for generative candidates.
 */
export function alignHintCandidate(input: {
  text: string;
  level: HintLevel;
  criterionId?: string | null;
  failedCriteria: readonly string[];
  allowedCriteria: readonly string[];
  /** When true, enforce safeSpokenHint (generative path). Authored UI hints may skip. */
  requireSpokenPolicy?: boolean;
}): AlignedHint {
  const allowed = new Set(input.allowedCriteria);
  const failed = new Set(input.failedCriteria);
  const criterionId = input.criterionId ?? null;

  if (criterionId !== null) {
    if (!allowed.has(criterionId)) {
      return { ok: false, reason: "criterion outside allowlist" };
    }
    // Prefer failed criteria when Check has produced failures; coaching may still highlight any allowlisted id.
    if (failed.size > 0 && !failed.has(criterionId)) {
      return { ok: false, reason: "criterion not in failed set" };
    }
  }

  const text = input.text.trim().replace(/\s+/g, " ");
  if (!text) return { ok: false, reason: "empty hint" };

  if (input.requireSpokenPolicy) {
    if (!safeSpokenHint(text)) return { ok: false, reason: "fails spoken hint policy" };
  }

  return {
    ok: true,
    text,
    level: input.level,
    criterionId,
    source: input.requireSpokenPolicy ? "candidate" : "authored",
  };
}

/** Convenience: validate a generative Socratic follow-up after failure outcome. */
export function acceptSpokenFollowup(
  text: string,
  opts: {
    criterionId?: string | null;
    failedCriteria: readonly string[];
    allowedCriteria: readonly string[];
    level?: HintLevel;
  },
): AlignedHint {
  return alignHintCandidate({
    text,
    level: opts.level ?? 1,
    criterionId: opts.criterionId,
    failedCriteria: opts.failedCriteria,
    allowedCriteria: opts.allowedCriteria,
    requireSpokenPolicy: true,
  });
}
