/* Scenario contracts: controlled partially-observable state machine, not a free role prompt (spec §4.5). */
import type { ConceptId } from "../learning-episode/types";

export type RubricDimension = "reasoning" | "information" | "decision" | "communication" | "resilience";

export const RUBRIC_DIMENSIONS: { id: RubricDimension; label: string }[] = [
  { id: "reasoning", label: "Financial reasoning" },
  { id: "information", label: "Information gathering" },
  { id: "decision", label: "Decision quality" },
  { id: "communication", label: "Communication" },
  { id: "resilience", label: "Resilience" },
];

export type RubricLevel = "Emerging" | "Developing" | "Ready" | "Strong";

export type Move = { dimension: RubricDimension; label: string };

export type ChoiceQuality = "strong" | "ok" | "weak";

export type ScenarioChoice = {
  id: string;
  label: string;
  /** free-text keyword matcher for the typed input path */
  keywords?: string[];
  next: string; // node id | "end:goal_met" | "end:impasse"
  quality: ChoiceQuality;
  moves: Move[];
};

export type ScenarioNode = {
  id: string;
  say: string;
  /** authored private coaching shown only in the pause overlay */
  coachHint: string;
  /** two strategies offered on "What should I say?" (spec §4.4) */
  strategies?: [string, string];
  pressure?: "urgency" | "guilt" | "anchoring" | "social-proof";
  choices: ScenarioChoice[];
};

export type ScenarioSpec = {
  id: string;
  title: string;
  jurisdiction: "SG";
  role: { name: string; descriptor: string; goal: string };
  learnerGoal: string;
  concepts: ConceptId[];
  facts: string[];
  successCriteria: string[];
  entryNodeId: string;
  nodes: ScenarioNode[];
  /** which lesson to suggest replaying if the call goes badly */
  relatedLessonId?: string;
};
