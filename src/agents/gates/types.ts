/* Learner-state snapshots the tutor may *read*. Never secrets, never XP/mastery writes. */

export type LessonStatus = "idle" | "dirty" | "evaluating" | "success" | "failure";

export type GateCriterion = {
  id: string;
  label: string;
  state: "pending" | "pass" | "fail";
};

/** Runtime lesson view for gates + Live context (extends TutorContext shape). */
export type LessonRuntimeSnapshot = {
  lessonId: string;
  screenId: string;
  prompt: string;
  criteria: GateCriterion[];
  status: LessonStatus;
  failedCriteria: string[];
  /** Live ladder H0–H2; authored H3–H4 remain StudyCopilot UI-only. */
  hintLevel: 0 | 1 | 2;
};

/** Full gate bus snapshot including active spatial focus. */
export type GateSnapshot = LessonRuntimeSnapshot & {
  activeHighlightId: string | null;
};

export type OutcomeSpeechMode = "celebrate" | "socratic" | "quiet";

export type OutcomeMode = {
  mode: "success" | "failure" | "coaching";
  failedCriteria: string[];
  speechMode: OutcomeSpeechMode;
};

export type UiHighlightAction =
  | { action: "highlight_criterion"; criterionId: string }
  | { action: "clear_highlight" }
  | { action: "pulse_tutor" };

export type UiHighlightResult =
  | { ok: true; command: UiHighlightAction; selector?: string }
  | { ok: false; reason: string };
