/* Finn Copilot policy — deterministic intervention selection (spec §3.4, §3.8).
   Pure reducer; timers and rendering live in components. */

export type CopilotState =
  | { s: "idle" }
  | { s: "observing"; offer: 0 | 1 | 2 } // offer > 0: Finn offers (never auto-opens) a hint
  | { s: "waiting" }
  | { s: "hinting"; level: 1 | 2 | 3 | 4 }
  | { s: "teaching"; misconceptionId: string }
  | { s: "celebrating" }
  | { s: "suspended" };

export type CopilotEvent =
  | { t: "SCREEN_ENTER" }
  | { t: "ACTION" }
  | { t: "STALL"; hasAttempted: boolean }
  | { t: "CHECK_FAIL"; sameCriterionFails: number; misconceptionId: string | null; hintLevelUsed: number }
  | { t: "CHECK_PASS" }
  | { t: "HELP"; nextLevel: 1 | 2 | 3 | 4 }
  | { t: "HINT_DONE" }
  | { t: "TEACH_DONE" }
  | { t: "CELEBRATE_DONE" }
  | { t: "SUSPEND" }
  | { t: "RESUME" };

export function initCopilot(): CopilotState {
  return { s: "idle" };
}

export function copilotReducer(state: CopilotState, e: CopilotEvent): CopilotState {
  if (e.t === "SUSPEND") return { s: "suspended" };
  if (state.s === "suspended" && e.t !== "RESUME") return state;

  switch (e.t) {
    case "SCREEN_ENTER":
      return { s: "observing", offer: 0 };
    case "RESUME":
      return { s: "observing", offer: 0 };
    case "ACTION":
      // meaningful interaction clears any pending offer; Finn observes silently
      if (state.s === "observing" || state.s === "waiting") return { s: "observing", offer: 0 };
      return state;
    case "STALL":
      // no hint before one substantive attempt (spec §2.4); with an attempt, offer H1
      if (state.s === "observing") {
        return e.hasAttempted ? { s: "observing", offer: 1 } : { s: "waiting" };
      }
      return state;
    case "CHECK_FAIL": {
      if (state.s === "hinting" || state.s === "teaching") return state;
      // confirmed misconception signature → teach (offered via card, preserves puzzle state)
      if (e.misconceptionId) return { s: "teaching", misconceptionId: e.misconceptionId };
      // two failures on the same criterion → offer next hint level (spec §2.4)
      if (e.sameCriterionFails >= 2) {
        const next = Math.min(2, e.hintLevelUsed + 1) as 1 | 2;
        return { s: "observing", offer: next };
      }
      return { s: "observing", offer: 0 };
    }
    case "CHECK_PASS":
      return { s: "celebrating" };
    case "HELP":
      return { s: "hinting", level: e.nextLevel };
    case "HINT_DONE":
      return { s: "observing", offer: 0 };
    case "TEACH_DONE":
      return { s: "observing", offer: 0 };
    case "CELEBRATE_DONE":
      return { s: "observing", offer: 0 };
    default:
      return state;
  }
}

/* Praise formula: evidence + strategy + transfer (spec §3.1). Deterministic rotation. */
const PRAISE: string[] = [
  "You routed savings before spending — that same order protects every future payday.",
  "You checked the criteria before retrying. That habit works on any financial decision.",
  "You changed one variable and watched what moved. That's how you test any money rule.",
  "You kept the fixed costs honest. That discipline is what makes a budget survive real life.",
];

export function praiseLine(seed: number): string {
  return PRAISE[Math.abs(seed) % PRAISE.length];
}

/** Stall threshold (spec §2.4): 20s without meaningful input. */
export const STALL_MS = 20_000;
