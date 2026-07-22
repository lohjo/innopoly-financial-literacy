# AGENTS.md

Repository-specific guidance for AI coding agents. See `CLAUDE.md` for the full repository map, product context, and working rules — this file only adds Cursor Cloud environment notes.

## Cursor Cloud specific instructions

This is a **frontend-only** Vite + React 18 + TypeScript app (package name `finfy-literacy`). There is no backend, database, or API keys — all AI behavior is deterministic/mocked and state lives in `localStorage` (`finfy.v1`). Do not invent backend contracts; treat `src/agents/`, `src/db/`, `src/server/`, `src/routes/`, `api/`, and `scripts/ablate.ts` as non-production drafts (per `CLAUDE.md`).

- Package manager is **pnpm** (`pnpm-lock.yaml`). Dependencies are installed by the startup update script, so no manual install is needed at the start of a session.
- Commands (from `package.json`): `pnpm dev` (Vite dev server on `http://localhost:5173/`), `pnpm build`, `pnpm typecheck` (`tsc --noEmit`), `pnpm test` (vitest, 67 tests). There is **no `lint`, `format`, or `preview` script** — standard validation is `pnpm typecheck && pnpm test && pnpm build`.
- Running the app: `pnpm dev` then open `http://localhost:5173/`. A brand-new user (empty localStorage) is redirected to `/onboarding`; completing onboarding creates the profile and launches directly into the first lesson (`/learn/:lessonId`) rather than the `/today` tab. The persistent home is `/today`. To reset to the new-user state, clear localStorage in the browser.
