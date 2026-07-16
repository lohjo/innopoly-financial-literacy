# CLAUDE.md

Instructions for Claude Code and compatible coding agents working in this repository.

## Repository identity

- **Repository:** `innopoly-financial-literacy` (product codename: **finfy-literacy**).
- **Product purpose:** a Duolingo-style gamified financial-literacy app for new graduates.
- **Current product reframe (2026-07-16):** first-paycheck financial onboarding for new graduates — "I just received my first paycheck today; what can I actually do tonight?" Short, timely, behavior-oriented challenges rather than a broad course library. See `docs/plans/2026-07-16-001-market-gap-requirements.md`. This reframe is a **proposed positioning**, not yet reconciled with `docs/plans/origin.md` or `docs/plans/finfy-literacy-architecture-plan.md`.
- **What is real vs. draft:** the repository contains a working **frontend scaffold** (Vite + React, exported from Figma Make) and a set of **backend/database/agent draft files that are not wired to anything**. Treat everything outside `src/app/`, `src/components/`, `src/imports/`, `src/styles/`, and `src/main.tsx` as non-production drafts unless you verify otherwise by inspection.

## Verified repository map

Verified by direct inspection on 2026-07-16:

| Path | Verified state |
| --- | --- |
| `src/main.tsx` | Real entry point. Renders `src/app/App.tsx`, imports `src/styles/index.css`. |
| `src/app/` | `App.tsx` is a real, stateful screen-flow component (tabs, lesson flow, stats). `router.tsx` exists but is **empty**. Note: `App.tsx` imports `./components/*`, but components live at `src/components/` — this relative-path discrepancy has not been build-verified; check before relying on the build. |
| `src/components/` | Real frontend screens (`ChallengeFeed`, `QuizScreen`, `LeaderboardScreen` in `Screens.tsx`, `Onboarding`, `StudyBuddy`, etc.) plus `ui/` (shadcn-style primitives) and `figma/` helpers. |
| `src/styles/` | Real global CSS: `index.css`, `globals.css`, `tailwind.css`, `theme.css`, `fonts.css`. |
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

From `package.json` (package name `@figma/my-make-file`, a Figma Make export; `pnpm-workspace.yaml` present, so prefer `pnpm`):

- `pnpm dev` — Vite dev server (`vite`).
- `pnpm build` — production build (`vite build`).

**Missing scripts:** there is no `test`, `lint`, `typecheck`, `format`, or `preview` script. `test/` is empty. Do not invent or assume these exist; if validation is needed, `pnpm build` is currently the only automated check.

Pinned tooling: Vite `6.3.5` (pnpm-overridden), Tailwind `4.1.12`, React declared only as optional peer dependency `18.3.1`.

## Working rules

- Inspect the relevant files before editing them; do not act on documentation claims alone.
- Preserve existing behavior unless the user explicitly requests a behavior change.
- Treat everything under `docs/plans/` and `docs/brainstorms/` as design intent, **not** implemented functionality.
- Treat `src/agents/`, `src/db/`, `src/server/`, `src/routes/`, `api/`, and `scripts/ablate.ts` as non-production drafts unless inspection proves otherwise.
- Do not invent backend contracts, database schemas, environment variables, or integrations. None are live; `src/db/schema.ts` and `api/index.ts` are not contracts.
- Keep concerns where they already live: UI in `src/components/` + `src/app/`, styles in `src/styles/`, generated Figma output in `src/imports/`, agent drafts in `src/agents/`, docs in `docs/`.
- Do not rewrite existing product plans (`docs/plans/origin.md`, `docs/plans/finfy-literacy-architecture-plan.md`, feature specs) merely because a newer plan proposes a reframe; reconciliation is its own explicit task.
- When documentation conflicts with the filesystem (e.g. `CURRENT_STATE.md`), record the discrepancy and use verified repository state as authoritative.
- Never expose or hardcode secrets. API keys referenced by draft code (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.) must come from the environment and must never be committed.
- After changes, run the narrowest relevant validation available (currently `pnpm build` for frontend changes; there is no test suite).
- When finishing a task, report the list of changed files and the validation results (including "no automated validation exists" when true).

Last verified: 2026-07-16
