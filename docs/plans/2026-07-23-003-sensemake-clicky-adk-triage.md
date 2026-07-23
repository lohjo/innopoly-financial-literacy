# 2026-07-23-003 — Final triage vs SenseMake + Clicky + ADK/Gemini Live

References (public GitHub, inspected 2026-07-23):

- [String-dxd/sensemaking-agents](https://github.com/String-dxd/sensemaking-agents) — SenseMake (`runManagedAgent`, Zod, deterministic `verifier.ts`, prompt files, fake transport)
- [farzaa/clicky](https://github.com/farzaa/clicky) (`main`) — voice FSM `idle|listening|processing|responding`, spatial pointing, barge-in (user said “clickt-main”; no public `clickt-main` repo found — Clicky `main` is the match)
- This repo’s Live root: **Google ADK + Gemini Live** in `tutor-service/` (kept), with TS twin `server/tutor/` using `@google/genai` Live + ADK-shaped grounding (deny-by-default tools, before/after validation, session `lesson_context`)

## Decision: keep ADK + Gemini Live pattern

| Layer | Keep | Do not |
| --- | --- | --- |
| Conversational root | Gemini Live (audio/text) via **ADK `run_live`** (`tutor-service`) or TS `@google/genai` Live twin | Silero/Pipecat second voice stack |
| Tool grounding | Allowlisted UI tools only + before/after guards (ADK callbacks / TS `grounding.ts`) | Model invents pass/fail, XP, mastery |
| Generative helpers | SenseMake `runManagedAgent` → Zod → verifier → narrate | Helpers that skip gates |
| Pointing | Clicky *intent* via **DOM/`data-tutor-target`** (`TutorPointer`) | Screenshot `[POINT:x,y]` pixels |

`TUTOR_RUNTIME=adk|ts` selects the Live process. Default: `adk` when `tutor-service/.venv` exists, else `ts`.

## Triage table

| Pattern | Source | Finfy status | Action |
| --- | --- | --- | --- |
| Realtime conversational root + tools | ADK Live / Gemini Live | Python ADK kept; TS twin mirrors tools+grounding | **KEEP** both; ADK is canonical pattern |
| Deny-by-default tool args + after-tool layer check | ADK `before_tool`/`after_tool` | Ported in `server/tutor/grounding.ts` | **KEEP** |
| `runManagedAgent` + fake transport | SenseMake `runner.ts` | `src/agents/runtime/runner.ts` | **KEEP** (feature-flagged off) |
| Deterministic verifier before side-effects | SenseMake `verifier.ts` | `src/agents/runtime/verifier.ts` + gates | **KEEP** |
| Prompt-as-file | SenseMake `*.prompt.md` | `src/agents/prompts/` | **KEEP** |
| Voice FSM idle→listening→processing→responding | Clicky `CompanionVoiceState` | Mapped onto Live statuses as `voicePhase` | **ALIGN** (this change) |
| Barge-in cancels in-flight UI | Clicky | Clear transcript/highlight pulse on new listen/ask | **ALIGN** (this change) |
| Spatial point + ring | Clicky overlay | `TutorPointer` DOM ring (not pixels) | **KEEP** (web-native) |
| Screenshot POINT tags | Clicky | Rejected for web literacy UI | **DEFER / refuse** |
| Postgres memory / withStudent | SenseMake | Out of scope | **DEFER** |
| Brokerage ADK AgentTools | `_draft_python/finfy-agent` | Quarantined | **KEEP quarantined** |

## Gap fixes in this pass

1. Dev default `VITE_TUTOR_WS_URL` → Vite `/tutor-ws` proxy so StudyCopilot Ask/Mic appear without a hand-written `.env`.
2. Clicky `voicePhase` export + barge-in clear on new listen/ask.
3. On Check failure, gate `ui_highlight` rings first failed criterion (outcome→highlight), clear on success.
4. `pnpm run dev` honors `TUTOR_RUNTIME=adk|ts` (ADK Python when venv present).
5. Soften `tutor-service` docs: ADK path supported, not deleted.

## Manual proof

Record StudyCopilot: lesson → Finn dock → Ask / hints → Check fail → criterion ring.
