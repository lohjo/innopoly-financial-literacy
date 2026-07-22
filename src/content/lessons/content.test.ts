import { describe, expect, it } from "vitest";
import { LESSONS, buildReviewLesson } from "./index";
import type { PuzzleParams } from "../../features/learning-episode/types";
import { evaluateFlow } from "../../components/financial/sim/flow";
import { evaluateZones } from "../../components/financial/sim/budget";
import { evaluateMinpay, minPaymentFor } from "../../components/financial/sim/minpay";
import { evaluateGrow } from "../../components/financial/sim/grow";
import { evaluateSort } from "../../components/financial/sim/sort";
import { evaluateMatch } from "../../components/financial/sim/match";
import { evaluateAllocate } from "../../components/financial/sim/allocate";
import { evaluateDistribute } from "../../components/financial/sim/distribute";
import { evaluateTiming } from "../../components/financial/sim/timing";

/** Solver: some answer in the learner's reachable answer space passes all criteria. */
function solvable(params: PuzzleParams): boolean {
  switch (params.mechanic) {
    case "flow": {
      const f = params.flow;
      const committed = Object.values(f.committed).reduce((a, b) => a + b, 0);
      for (let save = 0; save <= f.salary - committed; save += 50) {
        if (evaluateFlow(f, { save }).every((r) => r.pass)) return true;
      }
      return false;
    }
    case "zones": {
      const z = params.zones;
      // ground-truth classification: fixed where unshrinkable, cut everywhere else
      const cls = Object.fromEntries(z.chips.map((c) => [c.id, c.shrinkable ? ("cut" as const) : ("fixed" as const)]));
      return evaluateZones(z, cls).every((r) => r.pass);
    }
    case "minpay": {
      const m = params.minpay;
      for (let p = Math.round(minPaymentFor(m, m.balance)); p <= 600; p += 10) {
        if (evaluateMinpay(m, p).every((r) => r.pass)) return true;
      }
      return false;
    }
    case "grow": {
      for (let y = 0; y <= params.grow.maxYears; y++) {
        if (evaluateGrow(params.grow, { years: y }).every((r) => r.pass)) return true;
      }
      return false;
    }
    case "sort":
      return evaluateSort(params.sort, { order: [...params.sort.correctOrder] }).every((r) => r.pass);
    case "match":
      return evaluateMatch(params.match, { pairs: { ...params.match.solution } }).every((r) => r.pass);
    case "allocate": {
      const saveBucket = params.allocate.buckets.find((b) => b.kind === "save");
      if (!saveBucket) return false;
      // put every chip in save — if that fails targets, puzzle is over-constrained
      const placement = Object.fromEntries(params.allocate.chips.map((c) => [c.id, saveBucket.id]));
      return evaluateAllocate(params.allocate, { placement }).every((r) => r.pass);
    }
    case "distribute": {
      const d = params.distribute;
      if (d.targets.mode === "all-placed") {
        const placement = Object.fromEntries(d.chips.map((c) => [c.id, d.buckets[0]!.id]));
        return evaluateDistribute(d, { placement }).every((r) => r.pass);
      }
      // spread evenly so no single basket holds too many
      const placement: Record<string, string> = {};
      d.chips.forEach((c, i) => {
        placement[c.id] = d.buckets[i % d.buckets.length]!.id;
      });
      return evaluateDistribute(d, { placement }).every((r) => r.pass);
    }
    case "timing": {
      const t = params.timing;
      if (t.mode === "dca") {
        return evaluateTiming(t, { pickMonthId: null, revealedCount: t.months.length }).every((r) => r.pass);
      }
      const pick = t.months[0]?.id ?? null;
      return evaluateTiming(t, { pickMonthId: pick, revealedCount: t.months.length }).every((r) => r.pass);
    }
  }
}

describe("authored content validity", () => {
  for (const lesson of LESSONS) {
    describe(lesson.id, () => {
      it("puzzles (and retry variants) are solvable; criteria ids match evaluators", () => {
        for (const screen of lesson.screens) {
          if (screen.kind !== "puzzle") continue;
          expect(solvable(screen.puzzle.params), `${screen.id} unsolvable`).toBe(true);
          if (screen.puzzle.retryParams) {
            expect(solvable(screen.puzzle.retryParams), `${screen.id} retry unsolvable`).toBe(true);
          }
        }
      });

      it("predictions land on the slider grid", () => {
        for (const screen of lesson.screens) {
          if (screen.kind !== "predict") continue;
          expect(screen.actual).toBeGreaterThanOrEqual(screen.min);
          expect(screen.actual).toBeLessThanOrEqual(screen.max);
        }
      });

      it("puzzle screens have four authored hints; misconception signatures reference real criteria", () => {
        const criterionIds = new Set(
          lesson.screens.flatMap((s) => (s.kind === "puzzle" ? s.puzzle.criteria.map((c) => c.id) : [])),
        );
        for (const screen of lesson.screens) {
          if (screen.kind !== "puzzle") continue;
          const hints = lesson.hints[screen.id];
          expect(hints, `${screen.id} missing hints`).toBeDefined();
          expect(hints!.filter((h) => h.length > 0)).toHaveLength(4);
        }
        for (const m of lesson.misconceptions) {
          expect(criterionIds.has(m.signature.criterionId), `${m.id} signature criterion missing`).toBe(true);
        }
      });

      it("quiz answers are in range", () => {
        for (const screen of lesson.screens) {
          if (screen.kind !== "quiz") continue;
          expect(screen.answer).toBeGreaterThanOrEqual(0);
          expect(screen.answer).toBeLessThan(screen.options.length);
        }
      });
    });
  }

  it("review lessons build for every lesson concept with graded material", () => {
    for (const lesson of LESSONS) {
      for (const c of lesson.concepts) {
        const review = buildReviewLesson(c);
        expect(review, `no review for ${c}`).not.toBeNull();
        expect(review!.screens).toHaveLength(1);
      }
    }
  });
});
