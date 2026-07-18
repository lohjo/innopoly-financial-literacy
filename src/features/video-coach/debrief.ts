/* Deterministic debrief: walk the taken path, extract 3-5 evidence moments, grade the
   process rubric (spec §4.8/§4.9). No model calls; every claim cites a transcript span. */
import type { CallState, PathEntry } from "./callMachine";
import { nodeById } from "./callMachine";
import type { RubricDimension, RubricLevel, ScenarioSpec } from "./types";
import { RUBRIC_DIMENSIONS } from "./types";

export type DebriefMoment = {
  kind: "decision" | "useful-move" | "missed-opportunity" | "pressure-response";
  title: string;
  transcript: string; // exact learner line
  note: string;
  nodeId: string;
};

export type Debrief = {
  moments: DebriefMoment[];
  rubric: { dimension: RubricDimension; label: string; level: RubricLevel; evidence: string[] }[];
  overall: RubricLevel;
};

export function buildDebrief(scenario: ScenarioSpec, call: CallState): Debrief {
  const moments: DebriefMoment[] = [];
  const path = call.path;

  if (path.length > 0) {
    const first = path[0];
    moments.push({
      kind: "decision",
      title: "Your opening move",
      transcript: learnerLine(call, first),
      note:
        first.choice.quality === "strong"
          ? "You started by controlling the information, not the emotion. That sets the whole conversation's terms."
          : first.choice.quality === "weak"
            ? "The first reply committed you before you had the numbers. Openings that ask beat openings that agree."
            : "A workable opening — asking one clarifying question first would have made it stronger.",
      nodeId: first.nodeId,
    });
  }

  const best = path.find((p) => p.choice.quality === "strong");
  if (best) {
    moments.push({
      kind: "useful-move",
      title: "A move worth keeping",
      transcript: learnerLine(call, best),
      note: `${best.choice.moves.map((m) => m.label).join("; ")}. The same move works in any money conversation — salary, insurance, loans.`,
      nodeId: best.nodeId,
    });
  }

  const missed = path.find((p) => {
    if (p.choice.quality === "strong") return false;
    const node = nodeById(scenario, p.nodeId);
    return node?.choices.some((c) => c.quality === "strong");
  });
  if (missed) {
    const node = nodeById(scenario, missed.nodeId)!;
    const alt = node.choices.find((c) => c.quality === "strong")!;
    moments.push({
      kind: "missed-opportunity",
      title: "One alternative to try",
      transcript: learnerLine(call, missed),
      note: `Another path existed here: "${alt.label}" — ${alt.moves.map((m) => m.label).join("; ")}. Not the answer, a strategy with different trade-offs.`,
      nodeId: missed.nodeId,
    });
  }

  const pressureEntry = path.find((p) => nodeById(scenario, p.nodeId)?.pressure);
  if (pressureEntry) {
    const node = nodeById(scenario, pressureEntry.nodeId)!;
    const held = pressureEntry.choice.quality !== "weak";
    moments.push({
      kind: "pressure-response",
      title: `Under pressure: ${node.pressure}`,
      transcript: learnerLine(call, pressureEntry),
      note: held
        ? `${node.pressure === "urgency" ? "The deadline" : "The push"} was designed to skip your reasoning. You kept your criteria anyway.`
        : `${node.pressure === "urgency" ? "Urgency" : "Social pressure"} worked here — your criteria got dropped the moment the push arrived. Naming the tactic out loud ("if it needs an answer now, it's no") defuses it.`,
      nodeId: pressureEntry.nodeId,
    });
  }

  return { moments, rubric: gradeRubric(call.path), overall: overallLevel(gradeRubric(call.path)) };
}

function learnerLine(call: CallState, entry: PathEntry): string {
  const line = call.transcript.find((t) => t.speaker === "you" && t.nodeId === entry.nodeId);
  return line?.text ?? entry.choice.label;
}

export function gradeRubric(path: PathEntry[]): Debrief["rubric"] {
  return RUBRIC_DIMENSIONS.map(({ id, label }) => {
    const moves = path.flatMap((p) => p.choice.moves.filter((m) => m.dimension === id).map((m) => ({ ...m, quality: p.choice.quality })));
    const strong = moves.filter((m) => m.quality === "strong").length;
    const weak = path.filter((p) => p.choice.quality === "weak" && p.choice.moves.some((m) => m.dimension === id)).length;
    let level: RubricLevel;
    if (strong >= 2 && weak === 0) level = "Strong";
    else if (strong >= 1) level = "Ready";
    else if (moves.length > 0 && weak < moves.length) level = "Developing";
    else level = "Emerging";
    return { dimension: id, label, level, evidence: moves.map((m) => m.label) };
  });
}

const LEVEL_ORDER: RubricLevel[] = ["Emerging", "Developing", "Ready", "Strong"];

function overallLevel(rubric: Debrief["rubric"]): RubricLevel {
  const graded = rubric.filter((r) => r.evidence.length > 0);
  if (graded.length === 0) return "Emerging";
  const avg = graded.reduce((a, r) => a + LEVEL_ORDER.indexOf(r.level), 0) / graded.length;
  return LEVEL_ORDER[Math.round(avg)];
}
