/* Optional generative helper: Socratic follow-up after failure outcome only. */

import { outcomeFromGrade, type OutcomeMode } from "../gates";
import type { CriterionResult } from "../gates";
import { loadAgentRuntimeConfig } from "./config";
import { runManagedAgent, stubTransport } from "./runner";
import { MissExplainOutputSchema, type MissExplainOutput } from "./schemas";
import type { ManagedAgentTransport } from "./types";
import { verifyMissExplain } from "./verifier";

export const MISS_EXPLAIN_SYSTEM = `You are Finn, a hint-only literacy tutor.
Return JSON: {"question":"...","criterionId":"<optional failed id>","rationale":"optional"}.
Rules: one warm Socratic question ≤25 words ending with ?. No digits, no answers, no XP/mastery talk.
Refer only to failed criteria ids supplied by the user payload.`;

export async function runMissExplain(input: {
  gradeResults: CriterionResult[];
  allowedCriteria: string[];
  prompt: string;
  transport?: ManagedAgentTransport;
  /** Override feature flag (tests). */
  enabled?: boolean;
}): Promise<MissExplainOutput | null> {
  const outcome: OutcomeMode = outcomeFromGrade(input.gradeResults);
  if (outcome.mode !== "failure") return null;

  const config = loadAgentRuntimeConfig();
  const enabled = input.enabled ?? config.managedAgentsEnabled;
  if (!enabled) return null;

  const result = await runManagedAgent(
    { name: "miss_explain", systemPrompt: MISS_EXPLAIN_SYSTEM, enabled },
    {
      user: JSON.stringify({
        prompt: input.prompt,
        failedCriteria: outcome.failedCriteria,
        allowedCriteria: input.allowedCriteria,
        outcome: outcome.mode,
      }),
      jsonSchemaHint: '{"question":"string","criterionId":"string?","rationale":"string?"}',
    },
    MissExplainOutputSchema,
    {
      transport: input.transport ?? stubTransport,
      enabled,
      verify: (value) =>
        verifyMissExplain(value, {
          outcome,
          failedCriteria: outcome.failedCriteria,
          allowedCriteria: input.allowedCriteria,
        }),
    },
  );

  return result.status === "ok" ? result.value : null;
}
