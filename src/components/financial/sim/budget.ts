/* Budget zones simulation — pure math (mechanic M2). Fixed chips refuse to shrink under a shock. */
import type { CriterionResult, ZonesParams } from "../../../features/learning-episode/types";

export type ZoneClass = "fixed" | "flexible" | "cut";
export type ZoneClassification = Record<string, ZoneClass>; // chipId -> learner's classification

export type ShockOutcome = {
  /** amount the shock still needs after flexing classified-flexible/cut chips */
  uncovered: number;
  savedAfterShock: number;
  /** chips the learner marked flexible/cut that are actually fixed (refused to shrink) */
  refused: string[];
};

const FLEX_RATE = 0.5; // flexible chips can give up half in a pinch
const CUT_RATE = 1.0; // cut chips give up everything

export function runShock(params: ZonesParams, cls: ZoneClassification): ShockOutcome {
  let available = 0;
  const refused: string[] = [];
  for (const chip of params.chips) {
    const c = cls[chip.id] ?? "fixed";
    if (c === "fixed") continue;
    if (!chip.shrinkable) {
      refused.push(chip.id);
      continue; // reality: this cost cannot shrink no matter the label
    }
    available += chip.amount * (c === "cut" ? CUT_RATE : FLEX_RATE);
  }
  const uncovered = Math.max(0, params.shock.amount - available);
  const spent = params.chips.reduce((a, c) => a + c.amount, 0);
  const baseline = params.income - spent;
  const savedAfterShock = Math.round(baseline - uncovered);
  return { uncovered: Math.round(uncovered), savedAfterShock, refused };
}

/** criteria ids: shock-covered, savings-survive, no-fixed-mislabel */
export function evaluateZones(params: ZonesParams, cls: ZoneClassification): CriterionResult[] {
  const o = runShock(params, cls);
  const refusedLabels = o.refused.map((id) => params.chips.find((c) => c.id === id)?.label ?? id);
  return [
    {
      id: "shock-covered",
      pass: o.uncovered === 0,
      detail: o.uncovered > 0 ? `$${o.uncovered} of the ${params.shock.label} is still unpaid.` : undefined,
    },
    {
      id: "savings-survive",
      pass: o.savedAfterShock >= params.savingsTarget,
      detail: `$${o.savedAfterShock} saved after the shock — target $${params.savingsTarget}.`,
    },
    {
      id: "no-fixed-mislabel",
      pass: o.refused.length === 0,
      detail: o.refused.length ? `${refusedLabels.join(", ")} won't shrink — ${refusedLabels.length > 1 ? "they are" : "it is"} fixed.` : undefined,
    },
  ];
}
