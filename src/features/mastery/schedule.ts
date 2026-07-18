/* Spaced retrieval scheduling: first review due 48–72h after last practice (spec §2.2 step 10),
   subsequent reviews at 7 days. Deterministic — no randomness (concept id hash spreads the window). */
import type { ConceptId, EvidenceEvent } from "../learning-episode/types";

const HOUR = 3600_000;
const DAY = 24 * HOUR;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** last time a concept produced graded practice evidence */
export function lastPracticedAt(evidence: EvidenceEvent[], concept: ConceptId): number | null {
  let last: number | null = null;
  for (const e of evidence) {
    if (!e.concepts.includes(concept)) continue;
    if (e.type === "check_pass" || e.type === "quiz_answer" || e.type === "review_pass" || e.type === "call_move") {
      last = e.at;
    }
  }
  return last;
}

export function dueAt(concept: ConceptId, lastPractice: number, passedReviews: number): number {
  if (passedReviews === 0) return lastPractice + 48 * HOUR + (hash(concept) % 24) * HOUR;
  return lastPractice + 7 * DAY;
}

export type DueReview = { concept: ConceptId; dueSince: number };

export function getDueReviews(
  evidence: EvidenceEvent[],
  reviewsDone: Record<string, number>,
  concepts: ConceptId[],
  now: number,
): DueReview[] {
  const due: DueReview[] = [];
  for (const c of concepts) {
    const last = lastPracticedAt(evidence, c);
    if (last === null) continue;
    const at = dueAt(c, last, reviewsDone[c] ?? 0);
    if (now >= at) due.push({ concept: c, dueSince: at });
  }
  return due.sort((a, b) => a.dueSince - b.dueSince);
}
