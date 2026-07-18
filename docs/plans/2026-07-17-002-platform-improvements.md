---
title: "feat: Platform improvements (gamification, challenge model, StudyBuddy companion, coordinator wiring)"
type: feat
status: planning
date: 2026-07-18
origin: prompt — Research other financial-literacy apps for gamification, challenge model, StudyBuddy companion, and coordinator wiring
---

## Zips unpacked (into `references-innopoly/`)

10 zips pulled from the finance/literacy-named set. **2 turned out to be prior exports of finfy-literacy itself** — `Gamified Financial Literacy App.zip` and `(1).zip` both contain `@figma/my-make-file`, the same `fingo-*` image assets, same `src/app`/`src/imports`/`src/styles` layout as this repo. Not external inspiration — flagging per CLAUDE.md's "record discrepancies" rule. Not analyzed further (could be diffed against current `main` separately if you want to see what changed, but that's a different task).

The 7 real references:

| Project | What it actually is | Stack |
|---|---|---|
| **MoneyMind** | AI personal-finance co-pilot, chat-first, proactive nudges. **No gamification.** | Next.js/FastAPI/LangGraph/Gemini/MongoDB |
| **finLife** | Pixel-art financial-life simulator (childhood→retirement), Emergent.sh-generated | Expo/React Native, local-only |
| **Finsage** | Budgeting/savings/debt app for Indian students, real wired backend | React+Express+Mongo+Groq+Expo mobile |
| **tradewizard-ai** | AI prediction-market trading platform. Domain mismatch, but strong process patterns | Next.js/AWS CDK/Aurora Postgres |
| **EQUINOX-FLOW** | Relocation-planning "digital twin" demo, mostly mock data | Next.js/FastAPI/LangGraph |
| **Buddy** | ADHD executive-function voice assistant (Telegram/ElevenLabs) | Python/FastAPI/faster-whisper |
| **ai-onboarding-service(-frontend)** | Corporate HR onboarding (mentor↔new-hire), name-match is a false cognate but UX transfers well | FastAPI/Postgres+pgvector, Next.js |

## Concrete suggestions, grouped

**1. Gamification mechanics** (currently finfy-literacy has `LeaderboardScreen`/`Screens.tsx` but streak/badge logic isn't verified wired)
- Steal the schema shape from Finsage `backend/models/GoalGamification.js`: `earnedBadges[]` + `streaks` map + `totalMilestonesReached` — simpler than the stale Drizzle draft in `src/db/schema.ts`.
- Steal streak-increment logic from finLife `frontend/src/game/streaks.ts` (`computeNewStreak`) — gates on a pending-date pair so same-day double-counting can't happen.
- Steal the "AI optional, deterministic fallback always present" pattern from Finsage `backend/controllers/goalAnalysisController.js:86-102` — badge/reward logic never hard-depends on an LLM call succeeding.
- Steal task-complete celebration from ai-onboarding-service-frontend `TaskCompleteOverlay.tsx` (confetti + spring checkmark, auto-dismiss 2.4s) — direct fit for finfy-literacy's `ResultScreen.tsx`.
- Steal the streak badge widget from ai-onboarding-service-frontend `arena/StreakBadge.tsx` — ~35 lines, flame icon + count, drop-in for `LeaderboardScreen`/`Screens.tsx`.

**2. Challenge/content data model** (`src/components/data.ts`, `ChallengeFeed.tsx`, `QuizScreen.tsx`)
- finLife's `frontend/src/game/types.ts` `Choice`/`Scenario` shape bundles `delta` (stat deltas), `consequenceText`, and a `concept` tag per choice — richer than a flat right/wrong quiz answer, worth adopting for `LessonContent.tsx`/`QuizScreen.tsx`.
- finLife's `scoring.ts` adaptive-remediation logic (`computeFinancialHealthScore` → inject 0-4 bonus scenarios) — maps directly onto the "first-paycheck" reframe: adapt challenge difficulty to a running behavior score instead of a fixed sequence.
- MoneyMind's propose→pending→accept/decline→outcome lifecycle (`agent/tools/propose_intervention.py`) — turns `ChallengeFeed` cards from static quiz items into accept/decline nudges with measured outcomes.

**3. StudyBuddy companion** (`src/components/StudyBuddy.tsx`, currently unwired)
- Buddy's `brain.py` three-tier reply chain (real LLM → static canned fallback) — lets StudyBuddy demo convincingly today with zero backend, swap in real API later without touching UI.
- Buddy's persona prompt style — "1-3 short spoken sentences, acknowledge then one concrete next micro-step, no lists" — matches the "what can I do tonight?" reframe almost exactly.
- Buddy's README principle: "a dropped task is data, not a failure" — don't shame missed challenges/streaks, log them neutrally.
- ai-onboarding-service's "Arena" roleplay feature (`arena/ChatThread.tsx`, `MessageCoachPanel.tsx`, `SkillRadar.tsx`) — richest single idea found: simulate a scenario ("negotiate rent," "decline a bad purchase") with live AI coaching + skill scoring. Most work to port, highest payoff.

**4. Wiring the dormant `src/agents/financial_coordinator` (Google ADK draft)**
- EQUINOX-FLOW `core/agents/graph.py`/`state.py` — state-threaded graph, one node per specialist, aggregator node synthesizes final output. Translate the *separation-of-concerns shape* to ADK primitives, not the LangGraph API itself.
- tradewizard-ai's deterministic-vs-LLM staging principle (`infra/services/analysis-lambda/stages/`) — keep scoring/streak logic deterministic, reserve LLM calls for judgment/narrative only.
- EQUINOX-FLOW's graceful mock fallback (`app/api/agents/route.ts:74-81`) — if no API key, return `{mock:true}` and the frontend falls back to a canned script transparently. Directly reusable so the app demos fully without secrets configured.
- ai-onboarding-service's AI-artifact review lifecycle (`proposed→reviewed→applied` on `onboarding_plan.py`) — never auto-apply AI output silently; solid low-risk model if the coordinator ever generates personalized challenges.

**5. Backend/schema, if `src/db`/`src/server`/`src/routes` ever get built**
- ai-onboarding-service `app/models/onboarding_task.py` — plain columns (`success_criteria`, `status`, `priority`, `task_type`), far simpler than the current stale Drizzle draft.
- MoneyMind `docs/data-model.md` — clean transactions/goals/budgets schema with inline "why" comments (soft-delete via `deleted_at`, idempotent `source` field).
- tradewizard-ai `infra/sql/001-schema.sql` — idempotent `CREATE TABLE IF NOT EXISTS` + exception-guarded `ALTER TABLE` blocks, single-file schema that runs safely against fresh or existing DBs.
- ai-onboarding-service's router-per-resource FastAPI structure (`app/api/routes/*.py`) — boring, clean reference for the currently-empty `src/routes/`.

**6. Process/docs**
- tradewizard-ai's `.kiro/specs/*/` spec format (WHEN/IF/THE...SHALL acceptance criteria, tasks.md citing requirement IDs) — could tighten `docs/plans/` before implementation.
- finLife's living-PRD changelog habit (`memory/PRD.md`, dated delta entries) — cheap fix for `docs/plans/CURRENT_STATE.md`, which CLAUDE.md already flags as stale.

## Explicitly skip
Group/split-expense features (Finsage), stock recommendations, WhatsApp/Telegram bot plumbing, full multi-agent self-healing mesh (Buddy infra), AWS CDK/29-Lambda trading infra (tradewizard-ai), pgvector RAG pipeline (ai-onboarding-service), India-specific life-stage content (finLife) — all orthogonal to a frontend-only, first-paycheck-focused scaffold; porting them would be scope creep against CLAUDE.md's "preserve existing behavior" / "don't invent backend contracts" rules.

None of this touched finfy-literacy's own files — pure research. Say which item(s) to implement and I'll scope it against the actual current code.