/* Best-effort safety self-critique — swallows errors; never blocks Check. */

import { safeSpokenHint } from "../gates";

export type CritiqueResult = {
  ok: boolean;
  notes: string[];
};

/**
 * Non-blocking second look at a spoken candidate. Failures return ok:true with notes
 * so callers never stall the learner path on critique outages.
 */
export async function selfCritiqueSpoken(
  text: string,
  critique?: (text: string) => Promise<string[]>,
): Promise<CritiqueResult> {
  try {
    const notes: string[] = [];
    if (!safeSpokenHint(text)) {
      notes.push("fails local spoken policy");
    }
    if (critique) {
      try {
        const remote = await critique(text);
        notes.push(...remote);
      } catch {
        notes.push("remote critique unavailable");
      }
    }
    return { ok: notes.length === 0, notes };
  } catch {
    return { ok: true, notes: ["critique swallowed"] };
  }
}
