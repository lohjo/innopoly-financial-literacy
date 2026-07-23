import { LESSON_CATALOG } from "./catalog";

export const VALID_ACTIONS = new Set(["highlight_criterion", "clear_highlight", "pulse_tutor"]);
export const VALID_STATUSES = new Set(["idle", "dirty", "evaluating", "success", "failure"]);

export type TutorRenderCommand = {
  layer: "lesson_tutor";
  action: string;
  criterion_id?: string;
};

export type ValidatedLessonContext = {
  lesson_id: string;
  screen_id: string;
  prompt: string;
  criteria: { id: string; label: string }[];
  status: string;
  failed_criteria: string[];
  hint_level: number;
  learner_text: string;
};

export function makeRenderCommand(action: string, criterionId?: string | null): TutorRenderCommand {
  if (!VALID_ACTIONS.has(action)) throw new Error("unsupported tutor render action");
  if (action === "highlight_criterion" && !criterionId) {
    throw new Error("highlight_criterion requires criterion_id");
  }
  if (action !== "highlight_criterion" && criterionId != null) {
    throw new Error("only highlight_criterion accepts criterion_id");
  }
  const command: TutorRenderCommand = { layer: "lesson_tutor", action };
  if (criterionId) command.criterion_id = criterionId;
  return command;
}

/** Accept learner state only; derive prompt/criteria from allowlisted catalog. */
export function validateContext(value: unknown): ValidatedLessonContext {
  if (!value || typeof value !== "object") throw new Error("context must be an object");
  const v = value as Record<string, unknown>;
  const lessonId = v.lesson_id;
  const screenId = v.screen_id;
  const status = v.status;
  if (typeof lessonId !== "string" || typeof screenId !== "string") {
    throw new Error("lesson_id and screen_id are required strings");
  }
  if (!VALID_STATUSES.has(String(status))) throw new Error("invalid lesson status");

  const screen = LESSON_CATALOG[lessonId]?.[screenId];
  if (!screen) throw new Error("lesson screen is not tutor-enabled");

  const criteria = screen.criteria;
  const criterionIds = new Set(criteria.map((c) => c.id));
  const failed = v.failed_criteria ?? [];
  if (!Array.isArray(failed) || failed.some((item) => typeof item !== "string" || !criterionIds.has(item))) {
    throw new Error("failed criteria do not match the lesson");
  }

  let hintLevel = v.hint_level ?? 0;
  if (typeof hintLevel === "number" && Number.isInteger(hintLevel) === false && Number.isInteger(Number(hintLevel))) {
    hintLevel = Number(hintLevel);
  }
  if (typeof hintLevel !== "number" || !Number.isInteger(hintLevel) || hintLevel < 0 || hintLevel > 2) {
    throw new Error("invalid hint level");
  }

  return {
    lesson_id: lessonId,
    screen_id: screenId,
    prompt: screen.prompt,
    criteria,
    status: String(status),
    failed_criteria: failed as string[],
    hint_level: hintLevel,
    learner_text: "",
  };
}
