---
title: "feat: Discovery Lab — Brilliant-style experimental lesson (Interest Multiplier)"
type: feat
status: implemented
date: 2026-07-22
origin: prompt — senior LX + frontend: one experimental Brilliant-style lesson without touching existing lessons
references:
  - docs/plans/2026-07-17-001-brilliant-replicate.md (§2 learning philosophy: predict → experiment → observe → reflect → generalize)
  - docs/design-system-2026-07-15.md
  - docs/audit/brilliant-references-png/
relationship: >
  Additive proof-of-concept. Does not rewrite origin.md, architecture plan, or any existing LessonDoc.
  Extends PuzzleParams with reusable interact mechanics (sort / match / grow / allocate) so future
  lessons can author Brilliant-class screens without new screen kinds.
---

# Discovery Lab — Brilliant-style experimental lesson

## Summary

v0.1 ships one new showcase lesson, **The Interest Multiplier** (`interest-multiplier`), in a new catalog chapter **Discovery Lab** (`ch-lab`). Existing ch0/ch1 lessons are untouched. The lesson demonstrates discovery-first pedagogy (predict → experiment → observe → reflect → generalize) using new reusable puzzle mechanics instead of a quiz-heavy path.

## Problem Frame

Current wedge lessons already use predict + simulation puzzles, but several screens still read as concept → MCQ → explanation. Product wants a side-by-side comparison: what does a lesson feel like when every graded beat is a manipulative (sort, match, grow, allocate) rather than primarily multiple choice?

## Architecture decision

| Option | Verdict |
| --- | --- |
| New parallel lesson player | Rejected — duplicates CoursePlayer/Finn/CheckFrame |
| New `ScreenDoc` kinds | Deferred — heavier machine + action-bar changes |
| **Extend `PuzzleParams` mechanics** | **Chosen** — reuses Check / criteria / hints / Finn / content solvability gates |

New mechanics (pure evaluators + canvases):

| Mechanic | Interaction | Graded by |
| --- | --- | --- |
| `grow` | Year scrubber; two stacks animate (save vs spend) | Gap between paths ≥ target |
| `sort` | Reorder cards (pointer reorder) | Exact order match |
| `match` | Tap-left then tap-right pairing | All pairs correct |
| `allocate` | Tap chips into Save-first vs Leftover columns | Min routed to save |

Registration stays the same: `LESSONS` + `CHAPTERS`. Journey/Today auto-discover from `CHAPTERS`.

## Placement

- **Chapter:** `ch-lab` — *Discovery Lab* (catalogued first so the POC is immediately reachable; existing ch0/ch1 lesson files untouched).
- **Lesson id:** `interest-multiplier`
- **Concepts:** `interest-multiplier`, `wait-cost` (also registered in `src/features/mastery/concepts.ts`)
- **Deep link:** `/learn/interest-multiplier`

## Interaction flow

```
1. intro        Hook — two friends, same paycheck; different “interest diet”
2. predict      Commit: how big is the 5-year gap? (hypercorrection setup)
3. grow         Experiment: scrub years; watch stacks; hit a gap target
4. sort         Order three money moves by long-run impact
5. match        Pair cause → consequence (debt interest vs savings interest)
6. allocate     Route paycheck chips Save-first vs Leftover; see leftovers evaporate
7. generalize   Name the rule the learner already operated
8. reflect      Soft commitment beat (no quiz)
```

No `quiz` screens — intentional contrast with the existing format.

## Scope Boundaries

- Does not modify existing lesson files or ch0/ch1 chapter entries.
- No backend, no live AI, no bank data.
- Figures are simulated parameters (SGD-flavored amounts), never advice.
- Drag uses Motion `Reorder` / tap-to-assign — HTML5 DnD avoided for mobile.

### Deferred

- Dedicated `ScreenDoc` kinds for free-form labs
- AI-generated parameter variants of these mechanics
- Wire `ConfidenceMeter` into the predict beat

## Output Structure

```
docs/plans/2026-07-22-001-brilliant-lab-lesson.md
src/features/learning-episode/types.ts          # PuzzleParams extensions
src/components/financial/sim/{grow,sort,match,allocate}.ts
src/components/financial/{Grow,Sort,Match,Allocate}Canvas.tsx
src/components/financial/evaluate.ts            # dispatcher
src/components/financial/SimulationCanvas.tsx
src/components/financial/sim/interact.test.ts
src/content/lessons/ch-lab-interest-multiplier.ts
src/content/lessons/index.ts
src/content/lessons/content.test.ts             # solvers for new mechanics
src/content/chapters.ts
src/features/mastery/concepts.ts
```

## Acceptance

- Existing five lessons unchanged (IDs, screens, params).
- New lesson completable end-to-end in CoursePlayer via `/learn/interest-multiplier`.
- Appears on Journey under Discovery Lab; unlocks after ch1 path.
- `pnpm typecheck && pnpm test && pnpm build` green; content solvability + review builders pass for new concepts.
