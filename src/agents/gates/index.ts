export type {
  GateCriterion,
  GateSnapshot,
  LessonRuntimeSnapshot,
  LessonStatus,
  OutcomeMode,
  OutcomeSpeechMode,
  UiHighlightAction,
  UiHighlightResult,
} from "./types";

export {
  validateUiHighlight,
  applyValidatedHighlight,
  type UiHighlightRequest,
  type ResolveSelector,
} from "./uiHighlight";

export {
  FALLBACK_QUESTION,
  safeSpokenHint,
  authoredHintFor,
  alignHintCandidate,
  acceptSpokenFollowup,
  type HintLevel,
  type AlignedHint,
} from "./hintRubric";

export {
  gradePuzzle,
  evaluatePuzzle,
  defaultAnswer,
  allCriteriaPass,
  failedCriterionIds,
  type SimAnswer,
  type CriterionResult,
  type PuzzleDoc,
} from "./grading";

export { outcomeFromGrade, outcomeFromStatus } from "./outcomeResponse";
