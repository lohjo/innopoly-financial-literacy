/* XP economy — single source for the award in finish(), the recap line,
   and the live session counter in the player header. Deterministic (spec §11.2). */

export const SCREEN_XP = 5;
export const BASE_LESSON_XP = 50;
export const REVIEW_XP = 20;

/** Visual in-lesson counter: XP earned so far this session. */
export function sessionXp(correctCount: number): number {
  return correctCount * SCREEN_XP;
}

/** Total awarded on lesson completion. */
export function lessonXp(correctCount: number): number {
  return BASE_LESSON_XP + correctCount * SCREEN_XP;
}
