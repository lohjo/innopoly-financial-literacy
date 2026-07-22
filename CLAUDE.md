# CLAUDE.md

Instructions for Claude Code and compatible coding agents working in this repository.

## Repository identity

- **Repository:** `innopoly-financial-literacy` (product codename: **finfy-literacy**).
- **Product purpose:** a Duolingo-style gamified financial-literacy app for new graduates.
- **Current product reframe (2026-07-16):** first-paycheck financial onboarding for new graduates — "I just received my first paycheck today; what can I actually do tonight?" Short, timely, behavior-oriented challenges rather than a broad course library. See `docs/plans/2026-07-16-001-market-gap-requirements.md`. This reframe is a **proposed positioning**, not yet reconciled with `docs/plans/origin.md` or `docs/plans/finfy-literacy-architecture-plan.md`.
- **2026-07-18 rebuild:** the frontend was rebuilt end-to-end against the AI-learning-companion spec (uploaded `109f221d-…ailearningcompanionvideocoach.md`, plus `docs/plans/2026-07-17-001-brilliant-replicate.md` and `docs/design-system-2026-07-15.md`). Working wedge slice: onboarding → 5 authored lessons (2 chapters) with 3 deterministic simulations, Finn copilot (H1–H4 hint ladder, misconception cards), spaced review queue, 3 text-mode rehearsal-call scenarios with rubric debrief, missions, mastery/achievements/settings with memory inspector. All AI behavior is **deterministic/mocked** — no backend, no API keys; state is localStorage (`finfy.v1`).
- **2026-07-22 Discovery Lab POC:** additive Brilliant-style showcase lessons in chapter `ch-lab` (existing ch0/ch1 lessons untouched): `interest-multiplier` (grow/sort/match/allocate), `one-basket` (distribute + observe consequence beats for diversification), and `beat-the-market` (timing mechanic — lump-sum pick with stepped month reveal, then DCA auto-invest compare). Plans: `docs/plans/2026-07-22-001-brilliant-lab-lesson.md`, `docs/plans/2026-07-22-002-one-basket-diversification-draft.md`, `docs/plans/2026-07-22-003-beat-the-market-dca.md`.
- **What is real vs. draft:** everything under `src/app/`, `src/features/`, `src/components/`, `src/content/`, `src/stores/`, `src/styles/`, `src/main.tsx` is the live app. Treat `src/agents/`, `src/db/`, `src/server/`, `src/routes/`, `api/`, `scripts/` as non-production drafts unless inspection proves otherwise.

## Verified repository map

Verified by direct inspection on 2026-07-18 (post-rebuild):

| Path | Verified state |
| --- | --- |
| `src/main.tsx` | Entry point. Renders `src/app/App.tsx` → `AppRouter`, imports `src/styles/index.css`. |
| `src/app/` | `App.tsx` (thin wrapper), `router.tsx` (react-router 7 declarative routes: `/onboarding`, tab shell `/today /journey /practice /you/*`, full-screen `/learn/:lessonId`, `/review/:conceptId`, `/call/:scenarioId`; CoursePlayer/VideoCoach/Onboarding are lazy chunks), `AppShell.tsx` (TopBar/BottomNav/Finn button). |
| `src/features/` | `learning-episode/` (types, pure `episodeMachine` reducer, `CoursePlayer`), `copilot/` (pure `copilotMachine`, `StudyCopilot`, SVG `FinnAvatar`), `video-coach/` (pure `callMachine`, deterministic `debrief`, `VideoCoach`), `mastery/` (BKT `bkt.ts`, `project.ts` ledger recompute, `schedule.ts` 48–72h spacing, Journey/Practice screens), `missions/`, `today/`, `you/` (Progress/Achievements/Settings/Activity/peers), `onboarding/`. Machines and math are React-free and unit-tested. |
| `src/content/` | Authored content: `chapters.ts`, `lessons/` (5 LessonDocs + `buildReviewLesson`), `scenarios/` (3 branch-graph ScenarioSpecs), `achievements.ts`. Guarded by solver/reachability tests in `content.test.ts` / `scenarios.test.ts` — new content must keep them green. |
| `src/components/` | `primitives/` (Button/Pill/Card/SegmentedProgress/CriteriaList — squircle=action, pill=read-only), `financial/` (`sim/` pure math for flow/zones/minpay + FlowCanvas/BudgetCanvas/DebtSimulator/SimulationCanvas/PredictionPanel/ConfidenceMeter), `ui/` (shadcn, excluded from typecheck), `figma/`. Old Figma-Make screens (`Screens.tsx`, `StudyBuddy.tsx`, `Shell.tsx`, `data.ts`, etc.) were **deleted** in the rebuild. |
| `src/stores/` | `store.ts` — versioned localStorage store (`finfy.v1`), `useSyncExternalStore` hook, append-only evidence ledger, per-class memory reset, dev clock offset. |
| `src/styles/` | `index.css` → `fonts.css` (Nunito Sans, Google-hosted — self-host before production), `tailwind.css` (Tailwind 4 CSS-first), `theme.css` (jade+ink+warm-paper tokens per spec §7.2, light + `.dark`, motion/elevation/radius tokens, `@theme inline` mapping). |
| `src/imports/` | Figma-exported frames (`Frame87`, `Frame166`, …) and `fingo-*.png` reference images. Generated assets — do not hand-refactor. |
| `src/agents/` | **Draft, not wired to the app.** Python Google ADK `financial_coordinator` (`gemini-2.5-pro`) with data/trading/execution/risk sub-agents — sample-style code. No Python project config (no `pyproject.toml`/`requirements.txt`) exists in the repo. |
| `src/db/` | **Draft, leftover from a prior product.** Drizzle schema/client/seed referencing `student_id` RLS and a `docs/plans/_archive/...` path that does not exist in this repo. Drizzle is not in `package.json` dependencies. |
| `src/server/` | Empty (`.gitkeep` only). |
| `src/routes/` | Empty (`.gitkeep` only, including `routes/api/`). |
| `src/engine/`, `src/summariser/`, `src/data/`, `src/tools/`, `src/lib/` | Empty or near-empty placeholders (`.gitkeep`; `src/engine/style.css` is orphaned CSS). |
| `api/` | Single file `api/index.ts`, **entirely commented out** (a Vercel adapter for TanStack Start referencing `dist/server/server.js` and a `vercel.json` — neither exists). Non-functional. |
| `docs/` | Real and extensive: `docs/plans/` (product plans, feature specs, `BRAINSTORM_TEMPLATE.md`, `CURRENT_STATE.md`), `docs/brainstorms/`, `docs/audit/` (Fingo/Mobbin references), design-system notes. |
| `scripts/` | `ablate.ts` is a **prior-product leftover** (OpenAI Realtime "Mirror/Connector"; the `pnpm ablate:*` scripts it names do not exist in `package.json`). `managed-agents/` is empty. |
| `test/` | Empty (`.gitkeep` only). |
| `guidelines/` | `Guidelines.md` is an unfilled Figma Make template. |

**Known documentation discrepancy:** `docs/plans/CURRENT_STATE.md` (dated 2026-07-15) claims `src/` is empty and all docs are untracked. Both claims are stale — the frontend scaffold is committed and `git status` is clean. Trust the filesystem, and record (do not silently fix) such discrepancies when you find them.

## Development commands

From `package.json` (package name `finfy-literacy`; use `pnpm`):

- `pnpm dev` — Vite dev server.
- `pnpm build` — production build.
- `pnpm typecheck` — `tsc --noEmit` (strict; `src/components/ui` and draft dirs excluded via `tsconfig.json`).
- `pnpm test` — vitest (61 tests: sim math, episode/copilot/call machines, BKT/scheduling, content solvability, scenario-graph reachability).

**Missing scripts:** no `lint`, `format`, or `preview`. Standard validation after changes: `pnpm typecheck && pnpm test && pnpm build`.

Pinned tooling: Vite `6.3.5` (pnpm-overridden), Tailwind `4.1.12` (CSS-first, no tailwind.config), React `18.3.1` (real dependency since 2026-07-18), react-router `7.13.0`, motion `12`, TypeScript `5.6`, vitest `3`. `pnpm-workspace.yaml` pins `supportedArchitectures` (linux + win32 + darwin).

## Working rules

- Inspect the relevant files before editing them; do not act on documentation claims alone.
- Preserve existing behavior unless the user explicitly requests a behavior change.
- Treat everything under `docs/plans/` and `docs/brainstorms/` as design intent, **not** implemented functionality.
- Treat `src/agents/`, `src/db/`, `src/server/`, `src/routes/`, `api/`, and `scripts/ablate.ts` as non-production drafts unless inspection proves otherwise.
- Do not invent backend contracts, database schemas, environment variables, or integrations. None are live; `src/db/schema.ts` and `api/index.ts` are not contracts.
- Keep concerns where they already live: feature logic in `src/features/` (state machines and money math are pure, React-free, and tested), shared UI in `src/components/primitives` + `src/components/financial`, authored content in `src/content/` (never hardcode lesson/scenario data in components), persistence only via `src/stores/store.ts`, styles/tokens in `src/styles/theme.css`, generated Figma output in `src/imports/`, docs in `docs/`.
- Deterministic code owns grading, simulation, rewards, and mastery (spec §11.2). Do not add model calls into those paths; AI seams belong behind typed service modules.
- New lessons/scenarios must pass the content gates: solvable puzzles (`content.test.ts`) and fully-reachable, terminating scenario graphs (`scenarios.test.ts`).
- Do not rewrite existing product plans (`docs/plans/origin.md`, `docs/plans/finfy-literacy-architecture-plan.md`, feature specs) merely because a newer plan proposes a reframe; reconciliation is its own explicit task.
- When documentation conflicts with the filesystem (e.g. `CURRENT_STATE.md`), record the discrepancy and use verified repository state as authoritative.
- Never expose or hardcode secrets. API keys referenced by draft code (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.) must come from the environment and must never be committed.
- After changes, run the narrowest relevant validation available (`pnpm typecheck && pnpm test && pnpm build`).
- When finishing a task, report the list of changed files and the validation results (including "no automated validation exists" when true).

Last verified: 2026-07-18
