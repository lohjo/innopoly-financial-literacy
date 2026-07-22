# 2026-07-22-004 — Fable5 Master Implementation Plan (P1–P6)

Status: executing (remote session, committed-code subset). Baseline verified at commit `07782a3` (merge of PR #4 "new-question-types"), 91 vitest tests green.

## Goal

Brilliant-class learning interaction on the Finfy jade brand plus a lively Finn tutor seam, phased P1→P6. Grading, simulation, XP, streak, and mastery stay deterministic — no model calls in those paths. Decisions already made by the product owner: all screens follow the Brilliant benchmarks (`docs/audit/brilliant-references-png/`), the Journey path stays, and Home's 7-day progress card is removed in favor of the existing TopBar streak counter.

## Environment split

Two working states exist for this repo:

- **Committed state** (this plan's execution target in remote sessions): everything below under P0–P4 and the mock half of P6.
- **Local-only uncommitted work** on the maintainer's machine: `tutor-service/` (FastAPI WS + ADK Gemini Live), `src/features/copilot/live/` (`useLiveTutor.ts`), `public/tutor-worklets/`, StudyCopilot Ask composer + live command routing, TutorContext publishing from CoursePlayer, `DESIGN.md`. P5 (live tutor trust: voice FSM, transcript accumulation, barge-in, reconnect, debug-log strip) and the live halves of P3/P6 can only run there.

## Phases

- **P0** — this document.
- **P1** — Home: remove 7-day card, add layered Jump-back-in Continue hero; Journey: sticky bottom Start card, reduced-motion ping fix, explicit transitions instead of `transition-all`, ≥40px call-node hit target, press-scale polish. Current-lesson derivation extracted to a shared helper.
- **P2** — shared `BottomSheet` primitive; CoursePlayer exit ✕ opens a confirm sheet instead of navigating immediately. (Ask-drawer chrome: local-only.)
- **P3** — `src/features/copilot/toolExecutor.ts`: typed `CopilotToolCommand` union + pure dispatch, unit-tested; the H2 hint-highlight path routes through it; `data-tutor-target` attributes on criteria rows and quiz options; per-row criterion highlight and quiz-option highlight ring. (TutorContext quiz coverage + `contracts.py` widening: local-only.)
- **P4** — content: minimal `hintTargets` for `ch0-missing-740`; one quiz `hintTargets` entry to exercise the quiz highlight path. Content gates (`content.test.ts`, `scenarios.test.ts`) stay green.
- **P5** — local-only (see environment split). Blocked in remote sessions.
- **P6** — `src/features/copilot/tutorTargets.ts` pure target-resolution mapper + pointer-ring overlay at the target's DOM rect, wired through the executor; FinnAvatar breath/hover/press liveliness gated by reduced-motion. (tutor-service security pass: local-only.)

## Non-goals

Purple/near-black shell; new animation libraries (GSAP/Rive/Pixi/Lenis/Spline/R3F); model calls in grading/sim/XP/streak/mastery; weakening tutor-service policy or allowlists; new backends; rewriting `origin.md` or the architecture plan; retokenizing the collaborator's Journey/Home hex palette; wholesale lesson rewrites; changing timing-mechanic auto-pass behavior.

## Validation contract

Per phase: `pnpm typecheck && pnpm test && pnpm build`. New units: toolExecutor, tutorTargets mapper. Content gates must stay green when content changes. tutor-service pytest applies only where that directory exists (local).

## Recorded discrepancies (record, do not silently fix)

Verified 2026-07-22 against the filesystem at `07782a3`:

1. `CLAUDE.md` says 5 lessons / 61 tests. Actual: 8 lessons across 3 chapters (`ch-lab` first: `interest-multiplier`, `one-basket`, `beat-the-market`; then ch0 ×2, ch1 ×3) and 91 tests.
2. `CLAUDE.md` does not document: the leaderboard feature/route (`src/features/leaderboard/`, `/leaderboard`, bottom nav is now Today/Leaderboard/You), `src/motion/`, or that `Journey` is rendered inside `Home` (`src/features/today/Home.tsx`) while `/journey` remains a standalone route.
3. `docs/plans/CURRENT_STATE.md` (2026-07-15) remains stale, as already noted in CLAUDE.md.
4. Journey/Home (collaborator PR #3) use hardcoded hex palettes rather than `theme.css` tokens — intentional collaborator design, tokenization deferred.
5. On the maintainer's local machine (not this clone): `tutor-service/`, `src/features/copilot/live/`, `public/tutor-worklets/` exist uncommitted; `.gitignore` modified and a Linux-built `.venv/` staged — repo hygiene issue, deliberately untouched here.
