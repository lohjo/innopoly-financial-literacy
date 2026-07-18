import { describe, expect, it } from "vitest";
import type { FlowParams, MinPayParams, ZonesParams } from "../../../features/learning-episode/types";
import { endOfMonth, evaluateFlow, runFlowMonth } from "./flow";
import { evaluateZones, runShock } from "./budget";
import { amortize, compound, evaluateMinpay, minPaymentFor, monthsToZero, totalInterest } from "./minpay";

const flowParams: FlowParams = {
  salary: 2800,
  buckets: [
    { id: "save", label: "Savings", kind: "save" },
    { id: "rent", label: "Rent", kind: "fixed" },
  ],
  committed: { rent: 800 },
  dailyDrain: 40,
  days: 30,
  events: [{ day: 18, label: "Phone screen cracks", amount: 300 }],
  targets: { savedTarget: 500, bufferLeft: 0 },
};

describe("flow sim", () => {
  it("month runs deterministically, drains daily, applies events", () => {
    const days = runFlowMonth(flowParams, { save: 0 });
    expect(days).toHaveLength(30);
    expect(days[0].spendCash).toBe(2800 - 800 - 40);
    // day 18 includes shock
    expect(days[17].spendCash).toBe(days[16].spendCash - 40 - 300);
  });

  it("over-saving causes borrowing; a valid allocation exists (solver check)", () => {
    const greedy = endOfMonth(flowParams, { save: 2000 });
    expect(greedy.borrowed).toBeGreaterThan(0);
    // authored puzzle must be solvable: some allocation passes all criteria
    const solvable = [500, 400, 450, 300].some((save) => evaluateFlow(flowParams, { save }).every((r) => r.pass));
    expect(solvable).toBe(true);
  });

  it("evaluate reports failed criterion with detail", () => {
    const res = evaluateFlow(flowParams, { save: 2000 });
    const borrowed = res.find((r) => r.id === "never-borrowed");
    expect(borrowed?.pass).toBe(false);
    expect(borrowed?.detail).toMatch(/day \d+/);
  });
});

const zonesParams: ZonesParams = {
  income: 2800,
  chips: [
    { id: "rent", label: "Rent", amount: 800, shrinkable: false },
    { id: "transport", label: "Transport pass", amount: 120, shrinkable: false },
    { id: "food", label: "Eating out", amount: 500, shrinkable: true },
    { id: "subs", label: "Subscriptions", amount: 80, shrinkable: true },
    { id: "shopping", label: "Shopping", amount: 400, shrinkable: true },
  ],
  shock: { label: "dental bill", amount: 400 },
  savingsTarget: 500,
};

describe("zones sim", () => {
  it("fixed chips never absorb the shock", () => {
    const o = runShock(zonesParams, { rent: "cut", transport: "cut" });
    expect(o.refused).toEqual(["rent", "transport"]);
    expect(o.uncovered).toBe(400);
  });

  it("a correct classification exists (solver check)", () => {
    const res = evaluateZones(zonesParams, { rent: "fixed", transport: "fixed", food: "flexible", subs: "cut", shopping: "flexible" });
    expect(res.every((r) => r.pass)).toBe(true);
  });
});

const card: MinPayParams = {
  balance: 3000,
  apr: 0.26,
  minPaymentPct: 0.03,
  minPaymentFloor: 50,
  targets: { deadlineMonths: 12, interestCap: 450 },
};

describe("minpay sim", () => {
  it("minimum payment drags on for years", () => {
    const months = monthsToZero(card, null);
    expect(months).toBeGreaterThan(60);
  });

  it("iterative total matches sum of steps and closed-form sanity", () => {
    const steps = amortize(card, 300);
    const sum = steps.reduce((a, s) => a + s.principal, 0);
    expect(sum).toBeCloseTo(3000, 0);
    // closed-form months n = -log(1 - rB/p)/log(1+r)
    const r = card.apr / 12;
    const n = Math.ceil(-Math.log(1 - (r * 3000) / 300) / Math.log(1 + r));
    expect(monthsToZero(card, 300)).toBe(n);
  });

  it("higher payment strictly reduces total interest", () => {
    expect(totalInterest(card, 400)).toBeLessThan(totalInterest(card, 200));
  });

  it("a payment below first-month interest never clears", () => {
    const belowInterest = 3000 * (0.26 / 12) - 5;
    expect(monthsToZero(card, belowInterest)).toBeNull();
  });

  it("puzzle solvable within authored targets", () => {
    const solvable = [280, 300, 320].some((p) => evaluateMinpay(card, p).every((r) => r.pass));
    expect(solvable).toBe(true);
  });

  it("min payment formula respects floor", () => {
    expect(minPaymentFor(card, 100)).toBe(50);
    expect(minPaymentFor(card, 3000)).toBe(90);
  });

  it("compound math matches salvaged InteractiveLesson behavior", () => {
    const c = compound(200, 20, 8);
    expect(c.contributed).toBe(48000);
    expect(c.finalValue).toBeGreaterThan(100000);
    expect(c.yearly).toHaveLength(20);
  });
});
