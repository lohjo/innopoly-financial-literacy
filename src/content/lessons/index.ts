import type { ConceptId, LessonDoc, ScreenDoc } from "../../features/learning-episode/types";
import { nightItLands } from "./ch0-night-it-lands";
import { missing740 } from "./ch0-missing-740";
import { fixedVsFlexible } from "./ch1-fixed-vs-flexible";
import { shockMonth } from "./ch1-shock-month";
import { minimumPaymentTrap } from "./ch1-minimum-payment-trap";
import { interestMultiplier } from "./ch-lab-interest-multiplier";
import { oneBasket } from "./ch-lab-one-basket";
import { beatTheMarket } from "./ch-lab-beat-the-market";

export const LESSONS: LessonDoc[] = [
  nightItLands,
  missing740,
  fixedVsFlexible,
  shockMonth,
  minimumPaymentTrap,
  interestMultiplier,
  oneBasket,
  beatTheMarket,
];

export const lessonById = (id: string): LessonDoc | undefined => LESSONS.find((l) => l.id === id);

/** Spaced retrieval builds a one-screen episode with changed values (spec §2.2 step 10):
    puzzle retryParams when authored, else the lesson's quiz for the concept. No hints initially. */
export function buildReviewLesson(concept: ConceptId): LessonDoc | null {
  const source = LESSONS.find((l) => l.concepts.includes(concept) || l.screens.some((s) => s.kind === "quiz" && s.concept === concept));
  if (!source) return null;

  const puzzleScreen = source.screens.find(
    (s): s is Extract<ScreenDoc, { kind: "puzzle" }> => s.kind === "puzzle" && s.puzzle.concepts.includes(concept) && s.puzzle.retryParams !== undefined,
  );
  const quizScreen = source.screens.find(
    (s): s is Extract<ScreenDoc, { kind: "quiz" }> => s.kind === "quiz" && s.concept === concept,
  );

  const screen: ScreenDoc | undefined = puzzleScreen
    ? {
        kind: "puzzle",
        id: `review-${puzzleScreen.id}`,
        puzzle: {
          ...puzzleScreen.puzzle,
          id: `review-${puzzleScreen.puzzle.id}`,
          params: puzzleScreen.puzzle.retryParams!,
          retryParams: undefined,
          story: "Review — same idea, new numbers. No hints this time unless you ask.",
        },
      }
    : quizScreen
      ? { ...quizScreen, id: `review-${quizScreen.id}` }
      : undefined;
  if (!screen) return null;

  return {
    id: `review-${concept}`,
    chapterId: source.chapterId,
    title: `Review: ${source.title}`,
    minutes: 2,
    concepts: [concept],
    screens: [screen],
    hints: puzzleScreen ? { [`review-${puzzleScreen.id}`]: source.hints[puzzleScreen.id] ?? ["Try it unaided first.", "", "", ""] } : {},
    misconceptions: [],
  };
}
