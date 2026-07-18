/* Call lifecycle — pure reducer (spec §4.3 state machine, text-roleplay path).
   Consent is honest: this build has no microphone pipeline, so the only enabled
   path is "continue with text" — no fake permission prompt. */
import type { ScenarioChoice, ScenarioNode, ScenarioSpec } from "./types";

export type CallPhase = "brief" | "consent" | "connecting" | "live" | "paused" | "closing" | "debrief";

export type TranscriptEntry = {
  speaker: "role" | "you" | "system";
  text: string;
  nodeId?: string;
};

export type PathEntry = {
  nodeId: string;
  choice: ScenarioChoice;
};

export type CallState = {
  phase: CallPhase;
  nodeId: string;
  transcript: TranscriptEntry[];
  path: PathEntry[];
  endReason: "goal_met" | "impasse" | "ended_early" | null;
  hintsUsed: number;
  /** set when free text didn't match — the role asks one clarifying line, then chips */
  clarifying: boolean;
  summary: string | null;
};

export type CallEvent =
  | { t: "BEGIN" } // brief -> consent
  | { t: "CONSENT_TEXT" } // consent -> connecting
  | { t: "CONNECTED" } // connecting -> live (UI timer)
  | { t: "CHOOSE"; choiceId: string }
  | { t: "FREETEXT"; text: string }
  | { t: "PAUSE" }
  | { t: "RESUME" }
  | { t: "HINT_USED" }
  | { t: "END_EARLY" }
  | { t: "SUMMARY"; text: string } // closing -> debrief
  | { t: "RESTART" }; // debrief -> connecting (retry skips brief/consent)

export function initCall(scenario: ScenarioSpec): CallState {
  return {
    phase: "brief",
    nodeId: scenario.entryNodeId,
    transcript: [],
    path: [],
    endReason: null,
    hintsUsed: 0,
    clarifying: false,
    summary: null,
  };
}

export function nodeById(scenario: ScenarioSpec, id: string): ScenarioNode | undefined {
  return scenario.nodes.find((n) => n.id === id);
}

function applyChoice(state: CallState, scenario: ScenarioSpec, choice: ScenarioChoice, spokenText: string): CallState {
  const transcript: TranscriptEntry[] = [...state.transcript, { speaker: "you", text: spokenText, nodeId: state.nodeId }];
  const path = [...state.path, { nodeId: state.nodeId, choice }];
  if (choice.next.startsWith("end:")) {
    return {
      ...state,
      transcript,
      path,
      clarifying: false,
      phase: "closing",
      endReason: choice.next === "end:goal_met" ? "goal_met" : "impasse",
    };
  }
  const nextNode = nodeById(scenario, choice.next);
  return {
    ...state,
    transcript: nextNode ? [...transcript, { speaker: "role", text: nextNode.say, nodeId: nextNode.id }] : transcript,
    path,
    nodeId: choice.next,
    clarifying: false,
  };
}

export function callReducer(state: CallState, e: CallEvent, scenario: ScenarioSpec): CallState {
  switch (e.t) {
    case "BEGIN":
      return state.phase === "brief" ? { ...state, phase: "consent" } : state;
    case "CONSENT_TEXT":
      return state.phase === "consent" ? { ...state, phase: "connecting" } : state;
    case "CONNECTED": {
      if (state.phase !== "connecting") return state;
      const entry = nodeById(scenario, scenario.entryNodeId);
      return {
        ...state,
        phase: "live",
        transcript: entry ? [{ speaker: "role", text: entry.say, nodeId: entry.id }] : [],
      };
    }
    case "CHOOSE": {
      if (state.phase !== "live") return state;
      const node = nodeById(scenario, state.nodeId);
      const choice = node?.choices.find((c) => c.id === e.choiceId);
      if (!node || !choice) return state;
      return applyChoice(state, scenario, choice, choice.label);
    }
    case "FREETEXT": {
      if (state.phase !== "live") return state;
      const node = nodeById(scenario, state.nodeId);
      if (!node) return state;
      const lower = e.text.toLowerCase();
      const match = node.choices.find((c) => c.keywords?.some((k) => lower.includes(k.toLowerCase())));
      if (match) return applyChoice(state, scenario, match, e.text);
      return {
        ...state,
        clarifying: true,
        transcript: [
          ...state.transcript,
          { speaker: "you", text: e.text, nodeId: state.nodeId },
          { speaker: "role", text: "Sorry, what do you mean exactly?", nodeId: state.nodeId },
        ],
      };
    }
    case "PAUSE":
      return state.phase === "live" ? { ...state, phase: "paused" } : state;
    case "RESUME":
      return state.phase === "paused" ? { ...state, phase: "live" } : state;
    case "HINT_USED":
      return { ...state, hintsUsed: state.hintsUsed + 1 };
    case "END_EARLY":
      return state.phase === "live" || state.phase === "paused"
        ? { ...state, phase: "closing", endReason: "ended_early" }
        : state;
    case "SUMMARY":
      return state.phase === "closing" ? { ...state, phase: "debrief", summary: e.text } : state;
    case "RESTART":
      return { ...initCall(scenario), phase: "connecting" };
    default:
      return state;
  }
}
