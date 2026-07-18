/* Mastery projection: full recompute from the append-only evidence ledger (spec §11.4).
   Rebuildable — algorithm changes are auditable, the LLM never sets mastery. */
import type { ConceptId, EvidenceEvent } from "../learning-episode/types";
import { CALL_MOVE_WEIGHT, EVIDENCE_WEIGHTS } from "../learning-episode/types";
import { initMastery, updateMastery, type Mastery } from "./bkt";

/** correct/weight extraction per evidence type; null = no mastery effect (passive events). */
function interpret(e: EvidenceEvent): { correct: boolean; weight: number } | null {
  switch (e.type) {
    case "check_pass":
      return { correct: true, weight: EVIDENCE_WEIGHTS[e.supportLevel] };
    case "check_fail":
      return { correct: false, weight: EVIDENCE_WEIGHTS[e.supportLevel] };
    case "review_pass":
      // unaided delayed retrieval — strongest evidence
      return { correct: true, weight: 1.0 };
    case "review_fail":
      return { correct: false, weight: 1.0 };
    case "quiz_answer":
      return { correct: e.payload.correct === true, weight: EVIDENCE_WEIGHTS[e.supportLevel] };
    case "call_move":
      return { correct: e.payload.quality === "strong", weight: CALL_MOVE_WEIGHT };
    default:
      return null; // prediction, hint_used, reflection, call_complete, mission_done
  }
}

export function projectMastery(evidence: EvidenceEvent[]): Record<ConceptId, Mastery> {
  const out: Record<ConceptId, Mastery> = {};
  for (const e of evidence) {
    const obs = interpret(e);
    if (!obs) continue;
    for (const c of e.concepts) {
      out[c] = updateMastery(out[c] ?? initMastery(), obs.correct, obs.weight, e.at);
    }
  }
  return out;
}
