import { describe, expect, it } from "vitest";
import { evaluateGrow, futureValueAnnuity, growGap } from "./grow";
import { evaluateSort } from "./sort";
import { evaluateMatch } from "./match";
import { evaluateAllocate, sumInKind } from "./allocate";
import { evaluateDistribute, keptAfterBreak, pickBreakBucket, portfolioAfterDrop } from "./distribute";
import { dcaAverageCost, evaluateTiming, revealAfterPick } from "./timing";

describe("grow", () => {
  it("computes monthly-compound annuity FV", () => {
    const fv = futureValueAnnuity(200, 0.05, 5);
    expect(Math.round(fv)).toBe(13601);
  });

  it("passes when scrubbed years clear the gap target", () => {
    const params = { monthlySave: 200, annualRate: 0.05, gapTarget: 10000, maxYears: 10 };
    expect(evaluateGrow(params, { years: 3 }).every((r) => r.pass)).toBe(false);
    expect(evaluateGrow(params, { years: 4 }).every((r) => r.pass)).toBe(true);
    expect(growGap(params, 4)).toBeGreaterThanOrEqual(10000);
  });
});

describe("sort", () => {
  it("requires exact order", () => {
    const correct = ["a", "b", "c"];
    expect(evaluateSort({ correctOrder: correct }, { order: ["a", "b", "c"] })[0].pass).toBe(true);
    expect(evaluateSort({ correctOrder: correct }, { order: ["b", "a", "c"] })[0].pass).toBe(false);
  });
});

describe("match", () => {
  it("requires complete correct pairing", () => {
    const params = {
      left: [{ id: "l1" }, { id: "l2" }],
      solution: { l1: "r1", l2: "r2" },
    };
    expect(evaluateMatch(params, { pairs: { l1: "r1" } })[0].pass).toBe(false);
    expect(evaluateMatch(params, { pairs: { l1: "r2", l2: "r1" } })[0].pass).toBe(false);
    expect(evaluateMatch(params, { pairs: { l1: "r1", l2: "r2" } })[0].pass).toBe(true);
  });
});

describe("allocate", () => {
  const base = {
    chips: [
      { id: "a", amount: 200 },
      { id: "b", amount: 180 },
      { id: "c", amount: 100 },
    ],
    buckets: [
      { id: "save", kind: "save" as const },
      { id: "spend", kind: "spend" as const },
    ],
    targets: { minSave: 380 },
  };

  it("sums save-kind chips toward the target", () => {
    const placement = { a: "save", b: "save", c: "spend" };
    expect(sumInKind(base, placement, "save")).toBe(380);
    expect(evaluateAllocate(base, { placement })[0].pass).toBe(true);
    expect(evaluateAllocate(base, { placement: { a: "save", b: "spend", c: "spend" } })[0].pass).toBe(false);
  });
});

describe("distribute", () => {
  const eggs = {
    theme: "eggs" as const,
    chips: Array.from({ length: 12 }, (_, i) => ({ id: `e${i}`, label: "egg", amount: 1 })),
    buckets: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" },
      { id: "d", label: "D" },
    ],
    initial: {},
    targets: { mode: "all-placed" as const },
  };

  it("requires every chip placed for all-placed", () => {
    expect(evaluateDistribute(eggs, { placement: { e0: "a" } })[0].pass).toBe(false);
    const placement = Object.fromEntries(eggs.chips.map((c) => [c.id, "a"]));
    expect(evaluateDistribute(eggs, { placement })[0].pass).toBe(true);
  });

  it("grades min-kept against the breaking basket", () => {
    const params = {
      ...eggs,
      targets: { mode: "min-kept" as const, breakBucketId: "b", minKept: 8 },
    };
    const piled = Object.fromEntries(params.chips.map((c) => [c.id, "b"]));
    expect(evaluateDistribute(params, { placement: piled })[0].pass).toBe(false);

    const spread: Record<string, string> = {};
    params.chips.forEach((c, i) => {
      spread[c.id] = params.buckets[i % 4]!.id;
    });
    expect(keptAfterBreak(params, spread, "b").kept).toBe(9);
    expect(evaluateDistribute(params, { placement: spread })[0].pass).toBe(true);
  });

  it("picks the fullest basket to break", () => {
    const placement = { e0: "a", e1: "a", e2: "b", e3: "c" };
    expect(pickBreakBucket(eggs, placement, { kind: "egg-break", pick: "fullest" })).toBe("a");
  });

  it("drops a proportional share of one investment", () => {
    const money = {
      chips: [
        { id: "1", label: "$500", amount: 500 },
        { id: "2", label: "$500", amount: 500 },
      ],
    };
    const out = portfolioAfterDrop(money, { "1": "b", "2": "a" }, {
      kind: "portfolio-drop",
      bucketId: "b",
      dropRate: 0.4,
      heavyThreshold: 500,
    });
    expect(out.loss).toBe(200);
    expect(out.total).toBe(800);
    expect(out.heavy).toBe(true);
  });
});

describe("timing", () => {
  const months = [
    { id: "jan", label: "Jan", price: 10 },
    { id: "feb", label: "Feb", price: 14 },
    { id: "mar", label: "Mar", price: 8 },
    { id: "apr", label: "Apr", price: 11 },
    { id: "may", label: "May", price: 9 },
    { id: "jun", label: "Jun", price: 12 },
  ];

  it("lump-sum requires a pick and a full reveal", () => {
    const params = {
      mode: "lump-sum" as const,
      budget: 1200,
      months,
      feedbackTitle: "Close!",
      feedbackBody: "Lower later.",
    };
    expect(evaluateTiming(params, { pickMonthId: null, revealedCount: 0 })[0].pass).toBe(false);
    expect(evaluateTiming(params, { pickMonthId: "feb", revealedCount: 2 })[0].pass).toBe(false);
    expect(evaluateTiming(params, { pickMonthId: "feb", revealedCount: 6 })[0].pass).toBe(true);
    expect(revealAfterPick(months, "feb")).toBe(2);
  });

  it("dca passes once every month is revealed", () => {
    const params = {
      mode: "dca" as const,
      budget: 1200,
      monthlyAmount: 200,
      months,
      feedbackTitle: "Done",
      feedbackBody: "Many prices.",
    };
    expect(evaluateTiming(params, { pickMonthId: null, revealedCount: 3 })[0].pass).toBe(false);
    expect(evaluateTiming(params, { pickMonthId: null, revealedCount: 6 })[0].pass).toBe(true);
  });

  it("computes share-weighted DCA average cost", () => {
    const avg = dcaAverageCost({ budget: 1200, monthlyAmount: 200, months });
    // more shares bought in cheap months → avg cost < arithmetic mean (~10.67)
    expect(avg).toBeGreaterThan(10);
    expect(avg).toBeLessThan(10.67);
  });
});
