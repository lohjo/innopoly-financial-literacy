# Current State

**Last updated:** 2026-07-22

## Repository Status

- `main` is the integration branch for **finfy-literacy** (repo: `innopoly-financial-literacy`) — a Brilliant/Duolingo-style first-paycheck financial onboarding app for new graduates.
- Shipped wedge (local-first, no production backend): React 18.3 + Vite 6.3.5 + Tailwind 4 CSS-first frontend with deterministic lesson/copilot/call machines, BKT mastery, and `finfy.v1` localStorage persistence.
- Live AI seam (2026-07-22): isolated FastAPI + Google ADK / Gemini Live tutor at `tutor-service/`, wired into the CoursePlayer Finn panel via WebSocket PCM + text.
- Package manager of record: **pnpm** (`pnpm typecheck && pnpm test && pnpm build`). Tutor Python env: single `tutor-service/.venv` (Windows or POSIX — do not create a parallel `.venv-win`).

## Recent PR Status

- PR #1 and PR #3 have landed on `main` (frontend rebuild / journey roadmap docs). Local work since then is largely **uncommitted**: live tutor service + StudyCopilot live path, motion tokens, Brilliant/Quillino reference assets, and shell/nav experiments.

## What shipped / completed (since ~2026-07-22 morning)

### Live Finn tutor (frontend)

- Completed live tutor integration in `StudyCopilot` + `useLiveTutor`: click-to-activate panel, glow / listening / speaking states, typed and microphone input, PCM audio playback, transcript display, and constrained criterion highlighting.
- Audio worklets live under `public/tutor-worklets/` (also legacy `public/pcm-*-processor.js` copies present during transition).
- Env: `VITE_TUTOR_WS_URL`, `VITE_TUTOR_ACCESS_TOKEN` (see root `.env.example` / tutor `.env.example`).

### Deterministic Finn hint policy

- Kept Finn’s deterministic hint ladder to **two non-answer levels** (H1–H2); removed the prior answer-revealing walkthrough stages from the live offer path (`copilotMachine` caps offers at `Math.min(2, …)`).
- Misconception teaching card path remains separate from the live spoken ladder.

### Tutor service (`tutor-service/`)

- Completed the isolated ADK/Gemini Live service: in-memory sessions, validated allowlisted lesson context, origin/token checks, structured trace logging, WebSocket audio/text transport, and non-mutating render tools only (`render_hint_focus` → `highlight_criterion` / `clear_highlight` / `pulse_tutor`).
- Policy envelope: catalog-derived prompts/criteria (`contracts.validate_context`), spoken-hint sanitizer (`policy.safe_spoken_hint`), tool allowlist guards in `agent.py`.
- Added backend safety tests covering context injection rejection, invalid criteria, forbidden render commands, and answer-like hint rejection (`tutor-service/tests/`).
- **Single Python env:** use `tutor-service/.venv` only. Install: `python -m venv tutor-service/.venv` then `tutor-service/.venv/Scripts/python -m pip install -e "tutor-service[test]"` (POSIX: `.venv/bin/python`). Run tests from the service dir: `cd tutor-service && .venv/Scripts/python -m pytest -q`.

### Other relevant changes (last ~14h)

- Motion system scaffold: `src/motion/{tokens,transitions,useMotionPrefs}.ts` + `motion.test.ts` (duration/easing bands aligned to theme tokens).
- Shell / navigation experiments: Today surface as `Home`, dedicated `Leaderboard` feature route; AppShell bottom nav currently Today / Leaderboard / You (Journey/Practice still routed).
- Journey roadmap layout updates (merged via PR #3 docs/UI pass).
- Brilliant reference PNGs reorganized under `docs/audit/brilliant-references-png/{mobile,desktop}/`; Quillino reference screenshot added.
- Ground-truth + agent prompts: `docs/plans/2026-07-22-001-ground-truth-brief.md`, `docs/plans/2026-07-22-001-fable5-brilliant-koji-implementation-prompt.md` (Brilliant UX + Koji Finn plan/implement brief). Placeholder `docs/plans/features/finfy-tutor.md` exists but is empty.
- Playwright added as a frontend `devDependency` for repro/debug scripts (e.g. `scripts/repro-live-tutor.mjs`); not a full CI e2e suite yet.
- `.gitignore` now ignores all `.venv/` trees, `__pycache__`, and `.cursor/` — the accidental Linux root `.venv` that was staged must stay out of git.

## Current Product Shape (verified filesystem)

| Area | State |
| --- | --- |
| Entry | `src/main.tsx` → `src/app/App.tsx` → `AppRouter` |
| Tabs | `/today` (Home), `/leaderboard`, `/you/*`; `/journey` + `/practice` still registered |
| Full-screen | `/learn/:lessonId`, `/review/:conceptId`, `/call/:scenarioId`, `/onboarding` |
| Features | `learning-episode`, `copilot` (+ `live/`), `video-coach`, `mastery`, `missions`, `today`, `you`, `leaderboard`, `onboarding` |
| Content | 5 lessons / 2 chapters, 3 rehearsal scenarios, achievements; content solvability + scenario reachability tests |
| Persistence | `src/stores/store.ts` → `finfy.v1` localStorage |
| Styles | `src/styles/` jade + ink + warm-paper tokens; Nunito Sans |
| Motion | `src/motion/` + theme CSS custom props |
| Live tutor | `tutor-service/` (FastAPI) ↔ `src/features/copilot/live/useLiveTutor.ts` |
| Draft / not product | `src/agents/`, `src/db/`, `src/server/`, `src/routes/`, commented `api/index.ts`, `scripts/ablate.ts` |

**Determinism rule still holds:** grading, sim math, XP/streak, and mastery stay offline-safe and model-free. LLM only at the live-tutor edge behind typed contracts.

## Known gaps / next

- Live tutor Phase 0 trust bugs: missing/partial transcription (bubble sometimes falls back when `transcript` is null); stabilize speech↔UI before glam.
- CLAUDE.md last verified 2026-07-18 — does **not** yet document `tutor-service/` or the live copilot path (trust code + this file).
- E2E Brilliant UX + Koji pointing polish is in progress per `2026-07-22-001-fable5-brilliant-koji-implementation-prompt.md` / the e2e motion audit plan — not closed.
- `docs/plans/features/finfy-tutor.md` needs a real feature write-up.
- No `lint` / `format` / `preview` scripts; no production deploy for tutor-service beyond `Dockerfile`.

## Plan Status (high-signal only)

Treat plans under `docs/plans/` as **design intent**, not proof of implementation, except where this file or the filesystem confirms otherwise.

- `origin.md`, architecture/phase-0 plans, and feature specs — product intent; partially superseded by the 2026-07-18 frontend rebuild + 2026-07-22 live tutor.
- `2026-07-17-001-brilliant-replicate.md`, `2026-07-18-001-ai-copilot.md`, `2026-07-18-002-seamless-brilliant-copilot-agent-prompt.md` — interaction / Finn intent that the live stack is now executing against.
- `2026-07-15-002-refactor-e2e-ux-motion-audit-plan.md` — UX/motion audit contract; still the quality bar for the ongoing e2e polish pass.
- `2026-07-22-001-ground-truth-brief.md` — verified map for skill/agent authors (re-check paths before trusting runbooks).
- `2026-07-22-001-fable5-brilliant-koji-implementation-prompt.md` — active agent prompt for Brilliant + Koji Finn work.
