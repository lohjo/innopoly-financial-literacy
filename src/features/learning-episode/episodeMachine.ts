/* Episode state machine — pure reducer, no React, no side effects.
   Check-button grammar (brilliant-replicate §6): idle → dirty → evaluating → success | failure. */
import type { ConceptId, CriterionResult, EvidenceEvent, LessonDoc, ScreenDoc } from "./types";

export type ScreenStatus = "idle" | "dirty" | "evaluating" | "success" | "failure";
export type PendingEvidence = Omit<EvidenceEvent, "id" | "at">;

export type EpisodeMode = "lesson" | "review";

export type EpisodeState = {
  lessonId: string;
  mode: EpisodeMode;
  screenIndex: number;
  status: ScreenStatus;
  /** cumulative failed checks per criterion across the current puzzle screen */
  failsByCriterion: Record<string, number>;
  checksFailed: number;
  hintLevelUsed: 0 | 1 | 2 | 3 | 4;
  criteria: Record<string, "pending" | "pass" | "fail">;
  criteriaDetail: Record<string, string>;
  predicted: number | null;
  quizChoice: number | null;
  reflectChoice: number | null;
  correctCount: number;
  /** evidence collected this episode; flushed by the caller on exit/complete */
  pending: PendingEvidence[];
  done: boolean;
};

export type EpisodeAction =
  | { t: "INTERACT" }
  | { t: "CHECK"; results: CriterionResult[] }
  | { t: "RETRY" }
  | { t: "OPEN_HINT"; level: 1 | 2 | 3 | 4 }
  | { t: "PREDICT"; value: number }
  | { t: "CHOOSE"; index: number }
  | { t: "CHECK_QUIZ" }
  | { t: "REFLECT"; index: number }
  | { t: "CONTINUE" };

export function initEpisode(lesson: LessonDoc, mode: EpisodeMode = "lesson"): EpisodeState {
  return {
    lessonId: lesson.id,
    mode,
    screenIndex: 0,
    status: "idle",
    failsByCriterion: {},
    checksFailed: 0,
    hintLevelUsed: 0,
    criteria: initCriteria(lesson.screens[0]),
    criteriaDetail: {},
    predicted: null,
    quizChoice: null,
    reflectChoice: null,
    correctCount: 0,
    pending: [],
    done: false,
  };
}

function initCriteria(screen: ScreenDoc | undefined): EpisodeState["criteria"] {
  if (!screen || screen.kind !== "puzzle") return {};
  return Object.fromEntries(screen.puzzle.criteria.map((c) => [c.id, "pending" as const]));
}

function screenConcepts(screen: ScreenDoc, lesson: LessonDoc): ConceptId[] {
  switch (screen.kind) {
    case "puzzle":
      return screen.puzzle.concepts;
    case "quiz":
      return [screen.concept];
    case "predict":
      return screen.concepts;
    default:
      return lesson.concepts;
  }
}

export function episodeReducer(state: EpisodeState, action: EpisodeAction, lesson: LessonDoc): EpisodeState {
  const screen = lesson.screens[state.screenIndex];
  if (!screen || state.done) return state;
  const concepts = screenConcepts(screen, lesson);

  switch (action.t) {
    case "INTERACT": {
      if (state.status === "idle" || state.status === "failure") {
        return { ...state, status: "dirty" };
      }
      return state;
    }

    case "CHECK": {
      if (screen.kind !== "puzzle") return state;
      const allPass = action.results.every((r) => r.pass);
      const criteria = { ...state.criteria };
      const criteriaDetail = { ...state.criteriaDetail };
      const failsByCriterion = { ...state.failsByCriterion };
      for (const r of action.results) {
        criteria[r.id] = r.pass ? "pass" : "fail";
        if (!r.pass) {
          failsByCriterion[r.id] = (failsByCriterion[r.id] ?? 0) + 1;
          if (r.detail) criteriaDetail[r.id] = r.detail;
        }
      }
      const evidence: PendingEvidence = {
        lessonId: lesson.id,
        concepts,
        type: allPass
          ? state.mode === "review"
            ? "review_pass"
            : "check_pass"
          : state.mode === "review"
            ? "review_fail"
            : "check_fail",
        supportLevel: state.hintLevelUsed,
        payload: {
          screenId: screen.id,
          failed: action.results.filter((r) => !r.pass).map((r) => r.id),
        },
      };
      return {
        ...state,
        status: allPass ? "success" : "failure",
        criteria,
        criteriaDetail,
        failsByCriterion,
        checksFailed: allPass ? state.checksFailed : state.checksFailed + 1,
        correctCount: allPass ? state.correctCount + 1 : state.correctCount,
        pending: [...state.pending, evidence],
      };
    }

    case "RETRY": {
      if (state.status !== "failure") return state;
      return { ...state, status: "dirty" };
    }

    case "OPEN_HINT": {
      if (action.level <= state.hintLevelUsed) return state;
      const evidence: PendingEvidence = {
        lessonId: lesson.id,
        concepts,
        type: "hint_used",
        supportLevel: action.level,
        payload: { screenId: screen.id, level: action.level },
      };
      return { ...state, hintLevelUsed: action.level, pending: [...state.pending, evidence] };
    }

    case "PREDICT": {
      if (screen.kind !== "predict" || state.predicted !== null) return state;
      const evidence: PendingEvidence = {
        lessonId: lesson.id,
        concepts,
        type: "prediction",
        supportLevel: 0,
        payload: { screenId: screen.id, predicted: action.value, actual: screen.actual },
      };
      return { ...state, predicted: action.value, status: "success", pending: [...state.pending, evidence] };
    }

    case "CHOOSE": {
      if (screen.kind !== "quiz" || state.status === "success") return state;
      return { ...state, quizChoice: action.index, status: "dirty" };
    }

    case "CHECK_QUIZ": {
      if (screen.kind !== "quiz" || state.quizChoice === null) return state;
      const correct = state.quizChoice === screen.answer;
      const evidence: PendingEvidence = {
        lessonId: lesson.id,
        concepts,
        type: state.mode === "review" ? (correct ? "review_pass" : "review_fail") : "quiz_answer",
        supportLevel: state.hintLevelUsed,
        payload: { screenId: screen.id, choice: state.quizChoice, correct },
      };
      return {
        ...state,
        status: correct ? "success" : "failure",
        checksFailed: correct ? state.checksFailed : state.checksFailed + 1,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
        pending: [...state.pending, evidence],
      };
    }

    case "REFLECT": {
      if (screen.kind !== "reflect") return state;
      const evidence: PendingEvidence = {
        lessonId: lesson.id,
        concepts,
        type: "reflection",
        supportLevel: 0,
        payload: { screenId: screen.id, choice: action.index, best: screen.best },
      };
      return { ...state, reflectChoice: action.index, status: "success", pending: [...state.pending, evidence] };
    }

    case "CONTINUE": {
      // intro/concept/generalize screens advance freely; interactive screens require success
      const freeAdvance = screen.kind === "intro" || screen.kind === "concept" || screen.kind === "generalize";
      if (!freeAdvance && state.status !== "success") return state;
      const nextIndex = state.screenIndex + 1;
      if (nextIndex >= lesson.screens.length) {
        return { ...state, done: true };
      }
      return {
        ...state,
        screenIndex: nextIndex,
        status: "idle",
        failsByCriterion: {},
        checksFailed: 0,
        hintLevelUsed: 0,
        criteria: initCriteria(lesson.screens[nextIndex]),
        criteriaDetail: {},
        predicted: null,
        quizChoice: null,
        reflectChoice: null,
      };
    }
  }
}

/** Misconception detection: authored signature — criterion failed >= minFails (spec §3.6). */
export function detectMisconception(state: EpisodeState, lesson: LessonDoc): string | null {
  for (const m of lesson.misconceptions) {
    if ((state.failsByCriterion[m.signature.criterionId] ?? 0) >= m.signature.minFails) return m.id;
  }
  return null;
}
