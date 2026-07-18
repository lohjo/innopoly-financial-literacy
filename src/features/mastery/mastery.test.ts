import { describe, expect, it } from "vitest";
import { initMastery, updateMastery, masteryBand } from "./bkt";
import { projectMastery } from "./project";
import { dueAt, getDueReviews } from "./schedule";
import type { EvidenceEvent } from "../learning-episode/types";

const HOUR = 3600_000;

describe("bkt", () => {
  it("correct evidence never lowers pKnown", () => {
    let m = initMastery();
    for (let i = 0; i < 20; i++) {
      const next = updateMastery(m, true, 1.0, i);
      expect(next.pKnown).toBeGreaterThanOrEqual(m.pKnown);
      m = next;
    }
    expect(m.pKnown).toBeGreaterThan(0.95);
  });

  it("lower weight moves the estimate less", () => {
    const m = initMastery();
    const full = updateMastery(m, true, 1.0, 0);
    const scaffolded = updateMastery(m, true, 0.2, 0);
    expect(full.pKnown).toBeGreaterThan(scaffolded.pKnown);
    expect(scaffolded.pKnown).toBeGreaterThan(m.pKnown);
  });

  it("wrong evidence lowers pKnown", () => {
    const m = updateMastery(initMastery(), true, 1.0, 0);
    const after = updateMastery(m, false, 1.0, 1);
    expect(after.pKnown).toBeLessThan(m.pKnown);
  });

  it("uncertainty shrinks with evidence", () => {
    let m = initMastery();
    const u0 = m.uncertainty;
    m = updateMastery(m, true, 1.0, 0);
    m = updateMastery(m, true, 1.0, 1);
    expect(m.uncertainty).toBeLessThan(u0);
  });

  it("bands: fresh=ready, practiced-strong=durable", () => {
    let m = initMastery();
    expect(masteryBand(m)).toBe("ready");
    for (let i = 0; i < 6; i++) m = updateMastery(m, true, 1.0, i);
    expect(masteryBand(m)).toBe("durable");
  });
});

function ev(partial: Partial<EvidenceEvent> & Pick<EvidenceEvent, "type" | "concepts" | "at">): EvidenceEvent {
  return { id: `e${partial.at}`, supportLevel: 0, payload: {}, ...partial };
}

describe("projection", () => {
  it("is deterministic and ignores passive events", () => {
    const evidence: EvidenceEvent[] = [
      ev({ type: "check_pass", concepts: ["a"], at: 1 }),
      ev({ type: "hint_used", concepts: ["a"], at: 2, supportLevel: 2 }),
      ev({ type: "reflection", concepts: ["a"], at: 3 }),
      ev({ type: "quiz_answer", concepts: ["a"], at: 4, payload: { correct: true } }),
    ];
    const p1 = projectMastery(evidence);
    const p2 = projectMastery(evidence);
    expect(p1).toEqual(p2);
    expect(p1["a"].evidenceCount).toBe(2); // hint + reflection don't count
  });

  it("call strong move counts as correct at 0.9 weight", () => {
    const strong = projectMastery([ev({ type: "call_move", concepts: ["a"], at: 1, payload: { quality: "strong" } })]);
    const weak = projectMastery([ev({ type: "call_move", concepts: ["a"], at: 1, payload: { quality: "weak" } })]);
    expect(strong["a"].pKnown).toBeGreaterThan(weak["a"].pKnown);
  });
});

describe("schedule", () => {
  it("first review lands in the 48-72h window", () => {
    const at = dueAt("some-concept", 0, 0);
    expect(at).toBeGreaterThanOrEqual(48 * HOUR);
    expect(at).toBeLessThan(72 * HOUR);
  });

  it("nothing due immediately after practice; due after 72h", () => {
    const evidence = [ev({ type: "check_pass", concepts: ["a"], at: 1000 })];
    expect(getDueReviews(evidence, {}, ["a"], 1000 + HOUR)).toHaveLength(0);
    expect(getDueReviews(evidence, {}, ["a"], 1000 + 72 * HOUR)).toHaveLength(1);
  });

  it("passed review pushes to 7d", () => {
    const evidence = [
      ev({ type: "check_pass", concepts: ["a"], at: 0 }),
      ev({ type: "review_pass", concepts: ["a"], at: 60 * HOUR }),
    ];
    expect(getDueReviews(evidence, { a: 1 }, ["a"], 60 * HOUR + 3 * 24 * HOUR)).toHaveLength(0);
    expect(getDueReviews(evidence, { a: 1 }, ["a"], 60 * HOUR + 8 * 24 * HOUR)).toHaveLength(1);
  });
});
