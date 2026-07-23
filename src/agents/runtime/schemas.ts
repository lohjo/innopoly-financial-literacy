import { z } from "zod";

/** Socratic follow-up candidates — only after grading=fail and outcome=failure. */
export const MissExplainOutputSchema = z.object({
  question: z.string().min(8).max(200),
  criterionId: z.string().min(1).optional(),
  rationale: z.string().max(280).optional(),
});

export type MissExplainOutput = z.infer<typeof MissExplainOutputSchema>;

export const SCHEMA_REGISTRY = {
  MissExplainOutput: MissExplainOutputSchema,
} as const;
