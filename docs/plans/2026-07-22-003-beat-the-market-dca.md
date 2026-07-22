---
title: "feat: Discovery Lab — Can You Beat the Market? (dollar-cost averaging)"
type: feat
status: implemented
date: 2026-07-22
origin: prompt — 3-round Duolingo-style DCA lesson with stepped month reveal
relationship: >
  Additive Discovery Lab lesson beat-the-market alongside interest-multiplier and one-basket.
  New reusable PuzzleParams mechanic timing (lump-sum pick + step reveal, and dca watch + compare).
  Existing ch0/ch1 and prior lab lessons untouched.
proposed:
  chapterId: ch-lab
  lessonId: beat-the-market
  title: "Can You Beat the Market?"
  minutes: 3
  concepts: [dollar-cost-averaging]
---

# Lesson: Can You Beat the Market?

**Status:** implemented — playable at `/learn/beat-the-market`.  
**Placement:** Discovery Lab (`ch-lab`) · ~3 min  
**Skill unlock:** Dollar-Cost Averaging

## Pedagogy

| Round | Role |
| --- | --- |
| Intro | Hook — can you buy at the best time? |
| Round 1 | Lump-sum pick → step the year → miss the low |
| Round 2 | New series, same trap |
| Round 3 | Auto Invest ($200/mo) → compare avg cost vs your pick |
| Quiz | Why Auto Invest helps |
| Generalize | Name dollar-cost averaging |

Key UX (locked): **6-step animation**, not a full-graph dump. After a pick, learner taps **Next month** and feels the suspense of a later low.

## Architecture

Extends `PuzzleParams` with `mechanic: "timing"`:

- `lump-sum` — tap a month, reveal through pick, then step remaining months
- `dca` — step monthly buys, then You vs Auto Invest avg-cost compare

CoursePlayer auto-passes timing puzzles when the reveal completes (no Check chrome; Continue after feedback). DCA compare pulls the prior lump pick via `compareSourceScreenId`.

## Files

```
docs/plans/2026-07-22-003-beat-the-market-dca.md
src/features/learning-episode/types.ts
src/components/financial/sim/timing.ts
src/components/financial/TimingCanvas.tsx
src/components/financial/{evaluate,SimulationCanvas}.ts(x)
src/features/learning-episode/CoursePlayer.tsx
src/content/lessons/ch-lab-beat-the-market.ts
src/content/lessons/{index,content.test}.ts
src/content/chapters.ts
src/features/mastery/concepts.ts
src/components/financial/sim/interact.test.ts
```

## Acceptance

- Prior lessons unchanged by id/screens.
- `pnpm typecheck && pnpm test && pnpm build` green.
- Content solvability gate covers `timing`.
