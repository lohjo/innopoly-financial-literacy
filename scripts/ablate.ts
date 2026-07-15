#!/usr/bin/env tsx
/**
 * Ablation runner — `pnpm ablate:mirror` or `pnpm ablate:sensemake`.
 *
 * Drives the OpenAI Realtime Mirror + Claude managed-agent Connector path against the seeded
 * multi-student fixture corpus and emits a structured JSON report plus a
 * markdown scaffold under `test/ablation/reports/<date>-realtime-<surface>.json`
 * for human Likert scoring.
 *
 * Per-row semantics:
 *   - Mirror surface: one Mirror call per reflection in scope.
 *   - Sensemake surface: one Mirror call per reflection PLUS one Connector
 *     call per student against that student's most recent reflection (matches
 *     prod's `auto-connector.handler.server.ts`). The deterministic verifier
 *     post-processes Connector output. Cartographer is not invoked — its
 *     cost outweighs the signal at this scale.
 *
 * Live Mirror mode requires `OPENAI_API_KEY`. Sensemake mode also requires
 * `ANTHROPIC_API_KEY` plus the Connector managed-agent binding
 * (`MANAGED_AGENT_CONNECTOR_ID`, `MANAGED_AGENT_ENV_ID`). Without them, the script emits a placeholder
 * JSON + markdown (rows with `error: "no-api-key"`) so CI can verify wiring
 * without burning tokens.
 *
 * Flags:
 *   --surface=<mirror|sensemake>   required.
 *   --student=<id>                 scope to a single student in the seed
 *                                  corpus. If omitted, the run iterates the
 *                                  cross-student union.
 *   --limit=<n>                    cap the number of reflections processed.
 *                                  Default: all rows in scope.
 */