# finfy-literacy — Ground-Truth Brief for Skill Authors (2026-07-22)

You are one of several parallel agents authoring ONE skill in a skill library for the
repository at `/home/workspace/finlit-app`. This brief is verified context gathered by
the orchestrator on 2026-07-22. TRUST IT AS A STARTING MAP, but RE-VERIFY every command,
path, flag, and claim you actually put into your skill by inspecting the repo yourself.
Wrong runbooks are worse than none.

## Project identity

- Repo dir: `/home/workspace/finlit-app` (README/docs also call it `innopoly-financial-literacy`;
  package name `finfy-literacy`, product codename **finfy-literacy**, mascot "Finn"/"Finfy").
- Product: Brilliant/Duolingo-style **first-paycheck financial onboarding** app for new
  graduates. Singapore-first (SGD, CPF chapter planned). "I just got my first paycheck
  tonight — what do I actually do?"
- The agent-rules doc of record is `CLAUDE.md` at repo root (last verified 2026-07-18 —
  ALREADY STALE in known ways, see "Doc drift" below). `CLAUDE (1).md` is an identical
  duplicate (verified by diff).
- **No usable git history.** `finlit-app` has no own `.git`; the workspace root repo has
  zero commits. All archaeology must come from dated docs under `docs/`.

## User's Phase-1 answers (fold into everything)

1. Hardest problems are all equally hard; PRIORITY ORDER: **product design first**, then
   **content authoring**, then **live tutor**.
2. Unwritten discipline rule: **NEVER commit (git) without an explicit user request.**
3. Audience: **purely AI sessions (Sonnet-class)** that already know **React 19 and
   Google ADK**. So: don't teach React; DO flag React-18.3-vs-19 deltas and repo-specific
   conventions. Don't teach ADK basics; DO document this repo's specific ADK usage.
4. Costliest past failures: **product & frontend design** (rework, Figma Make export
   wrestling, design-direction churn).
5. "Beyond state of the art" = **the product wedge: first-paycheck onboarding as a
   category** (not the tech stack per se).

## Verified stack + environment (2026-07-22)

- Node v22.23.0, pnpm 11.14.0 (`/usr/bin/pnpm`), bun also installed but **use pnpm** —
  CLAUDE.md says pnpm; package.json has `"pnpm"` field which pnpm 11 warns is ignored
  (harmless warning: `The "pnpm" field in package.json is no longer read by pnpm`).
- Frontend: Vite 6.3.5 (pinned via overrides), React **18.3.1** (NOT 19), TypeScript 5.6
  strict, Tailwind **4.1.12 CSS-first** (no tailwind.config; `@theme` in
  `src/styles/tailwind.css`/`theme.css`), react-router **7.13.0** (declarative, not
  framework mode), motion **12** (`motion/react`), vitest 3.2.4.
- Commands (all verified working 2026-07-22):
  - `pnpm dev` — Vite dev server (default port 5173)
  - `pnpm build` — production build → `dist/`
  - `pnpm typecheck` — `tsc --noEmit`, exit 0 currently
  - `pnpm test` — vitest run; **74 tests in 6 files, all passing**:
    `src/content/scenarios/scenarios.test.ts` (12), `src/content/lessons/content.test.ts` (21),
    `src/features/mastery/mastery.test.ts` (10), `src/components/financial/sim/sim.test.ts` (12),
    `src/features/learning-episode/episodeMachine.test.ts` (9), `src/motion/motion.test.ts` (10).
  - No lint/format/preview scripts exist. Standard validation:
    `pnpm typecheck && pnpm test && pnpm build`.
- tsconfig `exclude`: `src/agents, src/db, src/engine, src/server, src/routes,
  src/summariser, src/tools, src/data, src/lib, src/components/ui` (+ check the file
  yourself for the full list) — these are DRAFT/generated dirs outside typecheck.
- Tutor service (`tutor-service/`): Python 3.12 venv at `tutor-service/.venv`. FastAPI +
  google-adk (>=1.20) + uvicorn. Tests: `cd tutor-service && .venv/bin/python -m pytest -q`
  → **4 passed**. Dockerfile exists (python:3.11-slim, uvicorn on $PORT default 8080).

## Verified architecture (the load-bearing shape)

- **Deterministic core, LLM at the edges** (spec §11.2 in
  `docs/plans/2026-07-17-003-frontend-spec.md`): grading, simulation, rewards, mastery are
  pure deterministic TS. No model calls in those paths. AI seams live behind typed
  modules only.
- Live app surface = `src/main.tsx`, `src/app/` (router.tsx: `/onboarding`, tab shell
  `/today /journey /practice /you/*`, full-screen `/learn/:lessonId`,
  `/review/:conceptId`, `/call/:scenarioId`; lazy chunks for CoursePlayer/VideoCoach/
  Onboarding), `src/features/`, `src/components/`, `src/content/`, `src/stores/`,
  `src/styles/`, `src/motion/`.
- Pure state machines (React-free, unit-tested): `episodeMachine` (lesson episode),
  `copilotMachine` (Finn hint policy: observing/waiting/hinting L1-2/teaching/
  celebrating/suspended; no hint before one substantive attempt), `callMachine` +
  deterministic `debrief` (video-coach rehearsal calls).
- Mastery: BKT-style estimator `src/features/mastery/bkt.ts` (SLIP=0.1, GUESS=0.2,
  P_LEARN=0.35, P_INIT=0.2; evidence-weight blending, weight discounts scaffolded
  evidence, uncertainty = 1/sqrt(n+1)); ledger recompute in `project.ts`; spaced review
  `schedule.ts`: first review due 48–72h after last practice (deterministic hash spread),
  then 7 days.
- Store: `src/stores/store.ts` — single versioned localStorage store, key **`finfy.v1`**,
  `useSyncExternalStore`, append-only evidence ledger, dev-only clock offset for testing
  spaced review. Known-weak note in code ("ponytail:" comments mark known weaknesses —
  grep for `ponytail`): localStorage not IndexedDB; fixed BKT params uncalibrated.
- Content: `src/content/` — 5 lessons in 2 chapters (`ch0-night-it-lands`,
  `ch0-missing-740`, `ch1-fixed-vs-flexible`, `ch1-shock-month`,
  `ch1-minimum-payment-trap`), 3 scenarios (`credit-card-booth`,
  `friend-expensive-weekend`, `offer-clarification`), `buildReviewLesson(concept)`,
  achievements. **Content gates**: `content.test.ts` proves every puzzle solvable by
  brute-force solver over the learner's reachable answer space; `scenarios.test.ts`
  proves scenario graphs fully reachable + terminating. New content MUST keep these green.
- Hints: authored per puzzle screen as exactly 4 levels
  `[H1 nudge, H2 point, H3 misconception, H4 one-step]` (see
  `src/features/learning-episode/types.ts`); H4 has a second param set for
  changed-value retry; evidence records highest hint level used (0 = unaided).
- Sim math: `src/components/financial/sim/` — `flow.ts`, `budget.ts` (zones),
  `minpay.ts`, pure + tested; canvases (FlowCanvas/BudgetCanvas/DebtSimulator) render them.
- Motion: `src/motion/tokens.ts` mirrors CSS custom props in `src/styles/theme.css`
  (dur.micro 0.09, hover 0.22, card 0.35, page 0.5, celebrate ≤0.8; eases enter
  [0.16,1,0.3,1], exit [0.4,0,1,1], state [0.2,0,0,1]); tests pin these bands.
- Design system: jade+ink+warm-paper tokens (`src/styles/theme.css`), shape grammar
  **squircle = tappable action, pill = read-only status** (docs/design-system-2026-07-15.md).
- Fonts: Nunito Sans, Google-hosted (`src/styles/fonts.css`) — must self-host before
  production (documented known gap).

## Live tutor (tutor-service/) — verified 2026-07-22, NOT yet in CLAUDE.md

- `finfy-live-tutor`: single-agent, **hint-only** Gemini Live voice tutor. FastAPI app
  `tutor-service/app/main.py`: `GET /healthz`, `WS /ws/{learner_id}/{session_id}`.
  ADK `LlmAgent` "FinfyTutor", model env `GEMINI_LIVE_MODEL` default
  `gemini-2.5-flash-preview-native-audio-dialog`.
- Defense-in-depth envelope: (1) prompt policy (never give answers/numbers/advice);
  (2) `policy.py` `safe_spoken_hint` — hint must be ONE question, ≤25 words, ends with
  "?", regex-bans answer-shaped words AND digits; fallback question if violated;
  (3) `contracts.py` `validate_context` — accepts learner state only, derives prompt +
  criteria from allowlisted `catalog.py` (prompt injection via context is discarded);
  (4) `agent.py` before/after tool guards — only `render_hint_focus` allowed, only
  actions {highlight_criterion, clear_highlight, pulse_tutor}, criterion must be in
  allowlist.
- Env/config: `TUTOR_ACCESS_TOKEN` (optional shared token), `TUTOR_ALLOWED_ORIGINS`
  (default `http://localhost:5173`), `GEMINI_LIVE_MODEL`; needs a Gemini API key via
  standard google-genai env (verify exact var in code/ADK docs before claiming).
- Frontend wiring: `src/features/copilot/live/useLiveTutor.ts` — env
  `VITE_TUTOR_WS_URL`, `VITE_TUTOR_ACCESS_TOKEN`; audio worklets under
  `public/tutor-worklets/`; used by `StudyCopilot.tsx` / `CoursePlayer.tsx`.

## Draft graveyard (NOT production — do not present as live)

`src/agents/` (Python ADK financial_coordinator sample-style), `src/db/` (Drizzle
leftovers from prior product), `src/server/`, `src/routes/` (empty), `api/index.ts`
(fully commented-out Vercel adapter), `scripts/ablate.ts` (prior-product leftover),
`guidelines/Guidelines.md` (unfilled template), `src/imports/` (generated Figma exports —
never hand-refactor), `src/components/ui/` (shadcn, excluded from typecheck).
Stray file `--full-page` at repo root is an accidental PNG screenshot (agent-browser
artifact) — harmless, do not treat as meaningful.

## Doc corpus (the archaeology source, since there's no git history)

- `docs/plans/origin.md` — original product doc (generic gamified-literacy framing,
  leaderboards + strict-format AI summaries). Still the doc of record for scope.
- `docs/plans/2026-07-16-001-market-gap-requirements.md` — **first-paycheck reframe**,
  explicitly a proposed positioning, NOT yet reconciled with origin.md or
  `finfy-literacy-architecture-plan.md`. Reconciliation is its own explicit task.
- `docs/plans/finfy-literacy-architecture-plan.md` — five-agent summarizer pipeline
  (Sequencer/Scorekeeper/Recap Writer/Standings Framer/Compliance Guardrail) — designed,
  never built.
- `docs/brainstorms/2026-07-20-finfy-literacy-loop-premise-check.md` — premise check:
  single-shot LLM + deterministic scoring vs the five-agent pipeline; proposes per-role
  ablation with fixed sample + shared rubric. THE model of this project's research
  methodology.
- `docs/plans/2026-07-17-001-brilliant-replicate.md` (908 lines) +
  `docs/plans/2026-07-17-003-frontend-spec.md` (914 lines) — the Brilliant-class lesson
  engine spec the 2026-07-18 rebuild implemented (§ numbers cited in code comments refer
  to these).
- `docs/plans/2026-07-17-002-platform-improvements.md` — audit of 10 reference zips;
  caught that 2 "references" were prior exports of this very project (recorded, per the
  discrepancy rule).
- `docs/plans/CURRENT_STATE.md` — dated 2026-07-15, **known-stale on purpose** (claims
  src/ empty); kept as a recorded discrepancy; also documents the prior-product
  ("sensemaking-agents") contamination cleanup.
- `docs/design-system-2026-07-15.md`, `docs/audit/` (Brilliant/Duolingo/Fingo/Mobbin
  reference screenshots + brief), `docs/smoke tests/` (5 PNG smoke screenshots),
  `docs/plans/features/*.md` (5 feature specs), `docs/plans/BRAINSTORM_TEMPLATE.md`,
  `docs/pr1-description.md` (blank PR template), `docs/plans/voice-wiki.md` (deferred
  AI-video-call plan), `docs/plans/finfy-literacy-phase-0-planning.md`,
  `docs/app-editor-agent-editing-design.md` (ChallengeSpec editing spike),
  `docs/solutions/` (empty), `docs/ideation/` (empty).

## Discipline rules (from CLAUDE.md + user)

1. **Never run mutating git commands / never commit without explicit user request.**
2. Inspect files before editing; trust filesystem over docs; when docs conflict with
   filesystem, RECORD the discrepancy, don't silently fix.
3. Preserve behavior unless a behavior change is explicitly requested.
4. `docs/plans/` + `docs/brainstorms/` are design intent, NOT implemented functionality.
5. Deterministic code owns grading/simulation/rewards/mastery — no model calls there.
6. New content must pass content gates (solvable, reachable, terminating).
7. Never rewrite old plans to match a newer reframe; reconciliation is its own task.
8. Concerns stay where they live (features/ machines pure; content in src/content/,
   never hardcoded in components; persistence only via store.ts; tokens in theme.css).
9. No invented backend contracts; no secrets in code; keys from env only.
10. After changes: narrowest relevant validation; report changed files + results.
11. Use pnpm (not npm/bun) for the frontend; tutor-service uses its own venv.

## Skill library — your output target

- Write ONLY inside `/home/workspace/finlit-app/.claude/skills/` — the rest of the repo
  is read-only for you. No mutating git commands anywhere.
- Your skill: `.claude/skills/<skill-name>/SKILL.md`, YAML frontmatter with `name`
  (must equal the directory name) and a trigger-rich `description` (when exactly a model
  should load this skill). Optional `scripts/` dir next to SKILL.md for executable tools.
- Audience: zero-context Sonnet-class AI session that knows React 19 + Google ADK but
  nothing about this repo. Imperative runbook voice. Copy-pasteable commands (relative
  to repo root `/home/workspace/finlit-app` — write commands as if cwd = repo root).
  Define each jargon term once. Tables + checklists over prose. Each skill states when
  NOT to use it and which sibling skill to use instead.
- GROUND TRUTH ONLY: re-verify every command/flag/path/claim against the repo before
  stating it. Date-stamp volatile facts (today: 2026-07-22). End with a
  "Provenance and maintenance" section: one-line re-verification commands for anything
  that may drift.
- No oversell: unproven things labeled open/candidate/hypothesis. Nothing may contradict
  CLAUDE.md; no skill may route around change control.
- Do not cite this brief or any `/home/.z/...` path inside the skill — embed the
  knowledge itself, with repo-relative paths as evidence.

## The full library (so you can cross-reference siblings correctly)

1.  `finfy-change-control` — change classification/gating, non-negotiables + rationale + incidents.
2.  `finfy-debugging-playbook` — symptom→triage for this repo's failure modes.
3.  `finfy-failure-archaeology` — chronicle of investigations/dead-ends/reverts from docs.
4.  `finfy-architecture-contract` — load-bearing design decisions, invariants, weak points.
5.  `finfy-domain-reference` — learning-science + SG-finance theory as used HERE (BKT math, spacing, hint ladder, no-advice compliance).
6.  `finfy-config-and-flags` — every config axis: env vars, tsconfig excludes, pinned versions, dev clock offset; how to add one.
7.  `finfy-build-and-env` — recreate env from scratch; React-18-vs-19 + stack deltas; traps.
8.  `finfy-run-and-validate` — running app+tutor, validation discipline, diagnostics/measurement tools, screenshot smoke tests; ships scripts/.
9.  `finfy-docs-and-writing` — docs of record, plan/brainstorm conventions, templates, house style, discrepancy recording.
10. `finfy-content-authoring` — authoring lessons/scenarios/hints end-to-end against the content gates.
11. `finfy-live-tutor` — the ADK tutor service: envelope, contracts, wiring, safe extension.
12. `finfy-external-positioning` — the wedge claims: proven vs hypothesis; what must be shown before claiming.
13. `finfy-product-design-campaign` — EXECUTABLE decision-gated campaign for the hardest live problem (product/frontend design).
14. `finfy-research-methodology` — evidence bar, premise checks, ablation recipes, proof-not-vibes analysis with worked examples from this repo.
15. `finfy-research-frontier` — first-paycheck-onboarding-as-a-category open problems with falsifiable milestones.