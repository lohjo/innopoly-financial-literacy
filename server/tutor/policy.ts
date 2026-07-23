/* Spoken hint policy + Buddy-style injection prefilter — equal/stricter than Python. */

export const FALLBACK_QUESTION = "Which visible criterion would you test next?";

const DISALLOWED =
  /\b(answer|correct|choose|select|set|enter|the value is|the payment is|which value is|you should|do this|\d)\b/i;

/** Instruction-injection / role-override prefilter on learner text. */
const INJECTION =
  /\b(ignore (all |any )?(previous|prior|above) (instructions|rules)|system prompt|you are now|act as|jailbreak|reveal (the )?(answer|solution|prompt)|developer mode)\b/i;

export function safeSpokenHint(text: string): boolean {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.split(" ").length > 25) return false;
  if ((normalized.match(/\?/g) ?? []).length !== 1 || !normalized.endsWith("?")) return false;
  return !DISALLOWED.test(normalized);
}

export type InjectionCheck =
  | { ok: true; text: string }
  | { ok: false; reason: string };

export function filterLearnerText(raw: string): InjectionCheck {
  const text = raw.trim().slice(0, 500);
  if (!text) return { ok: false, reason: "empty" };
  if (INJECTION.test(text)) {
    return { ok: false, reason: "injection_prefilter" };
  }
  return { ok: true, text };
}
