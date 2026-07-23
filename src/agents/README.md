# Agents — Finfy literacy tutor path

## Production (TypeScript)

| Path | Role |
| --- | --- |
| `gates/` | Deterministic tutor reaction bus: `ui_highlight` → `hint_rubric_alignment` → `grading` → `outcome_response`. Pure TS; no model imports; never writes XP/mastery. |
| `runtime/` | Optional generative helpers via `runManagedAgent` + Zod + `verifier`. Fake-transport tested; **off by default**. |
| `prompts/` | Prompt-as-file sources for helpers. |
| `../server/tutor/` (repo root `server/tutor/`) | Live tutor HTTP/WS server (Gemini Live root). Started by `pnpm run dev`. |

**Invariant:** Gemini Live may talk/listen/narrate and request allowlisted UI highlights only. Pass/fail, criterion choice, hint–rubric fit, and outcome mode are code-owned gates. Simulation / XP / mastery stay product cores outside the Live toolbelt.

Plan: `docs/plans/2026-07-23-002-ts-agent-infra-implementation-plan.md`.

## Draft quarantine (do not wire)

| Path | Fact |
| --- | --- |
| `_draft_python/finfy-agent/` | Former Google ADK brokerage `financial_coordinator` + analyst AgentTools. **Wrong product surface** for this literacy app. |
| `_draft_python/eval/`, `_draft_python/tests/` | Python ADK eval leftovers. |

Do **not** import these from `src/app`, `src/features`, or `server/tutor`. Delete only with explicit approval (kept for archaeology / pattern mining).

## Deprecated Python Live tutor

`tutor-service/` (repo root) is the previous FastAPI+ADK Live tutor. Retained as **rollback** if the TS server breaks — see plan §9. Prefer `server/tutor/`.
