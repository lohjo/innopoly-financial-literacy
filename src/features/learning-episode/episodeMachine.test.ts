import { describe, expect, it } from "vitest";
import { detectMisconception, episodeReducer, initEpisode, type EpisodeState } from "./episodeMachine";
import type { LessonDoc } from "./types";

const lesson: LessonDoc = {
  id: "test-lesson",
  chapterId: "ch0",
  title: "Test",
  minutes: 3,
  concepts: ["a"],
  screens: [
    { kind: "intro", id: "s0", title: "Hi", story: "Story" },
    {
      kind: "puzzle",
      id: "s1",
      puzzle: {
        id: "p1",
        prompt: "Do it",
        concepts: ["a"],
        criteria: [
          { id: "c1", label: "First" },
          { id: "c2", label: "Second" },
        ],
        params: { mechanic: "minpay", minpay: { balance: 1000, apr: 0.26, minPaymentPct: 0.03, minPaymentFloor: 25 } },
      },
    },
    { kind: "quiz", id: "s2", concept: "a", prompt: "?", options: ["x", "y"], answer: 1, explanation: "because" },
  ],
  hints: { s1: ["h1", "h2", "h3", "h4"] },
  misconceptions: [
    {
      id: "m1",
      concept: "a",
      signature: { criterionId: "c1", minFails: 2 },
      title: "t",
      wrongModel: "w",
      rightModel: "r",
      testAction: "test",
    },
  ],
};

function run(actions: Parameters<typeof episodeReducer>[1][], from?: EpisodeState): EpisodeState {
  let s = from ?? initEpisode(lesson);
  for (const a of actions) s = episodeReducer(s, a, lesson);
  return s;
}

describe("episodeMachine", () => {
  it("intro advances freely; puzzle requires success", () => {
    let s = run([{ t: "CONTINUE" }]);
    expect(s.screenIndex).toBe(1);
    s = run([{ t: "CONTINUE" }], s); // puzzle, no success yet
    expect(s.screenIndex).toBe(1);
  });

  it("check pass/fail transitions and evidence", () => {
    let s = run([{ t: "CONTINUE" }, { t: "INTERACT" }]);
    expect(s.status).toBe("dirty");
    s = run([{ t: "CHECK", results: [{ id: "c1", pass: false }, { id: "c2", pass: true }] }], s);
    expect(s.status).toBe("failure");
    expect(s.criteria).toEqual({ c1: "fail", c2: "pass" });
    expect(s.pending.at(-1)?.type).toBe("check_fail");
    s = run([{ t: "RETRY" }, { t: "CHECK", results: [{ id: "c1", pass: true }, { id: "c2", pass: true }] }], s);
    expect(s.status).toBe("success");
    expect(s.pending.at(-1)?.type).toBe("check_pass");
    expect(s.pending.at(-1)?.supportLevel).toBe(0);
  });

  it("hint use discounts subsequent evidence", () => {
    let s = run([{ t: "CONTINUE" }, { t: "INTERACT" }, { t: "OPEN_HINT", level: 2 }]);
    expect(s.hintLevelUsed).toBe(2);
    s = run([{ t: "CHECK", results: [{ id: "c1", pass: true }, { id: "c2", pass: true }] }], s);
    expect(s.pending.at(-1)?.supportLevel).toBe(2);
  });

  it("misconception fires after authored minFails", () => {
    let s = run([{ t: "CONTINUE" }, { t: "INTERACT" }]);
    const fail = { t: "CHECK" as const, results: [{ id: "c1", pass: false }, { id: "c2", pass: true }] };
    s = run([fail], s);
    expect(detectMisconception(s, lesson)).toBeNull();
    s = run([{ t: "RETRY" }, fail], s);
    expect(detectMisconception(s, lesson)).toBe("m1");
  });

  it("hint level resets between screens; quiz + done", () => {
    let s = run([
      { t: "CONTINUE" },
      { t: "INTERACT" },
      { t: "OPEN_HINT", level: 3 },
      { t: "CHECK", results: [{ id: "c1", pass: true }, { id: "c2", pass: true }] },
      { t: "CONTINUE" },
    ]);
    expect(s.screenIndex).toBe(2);
    expect(s.hintLevelUsed).toBe(0);
    s = run([{ t: "CHOOSE", index: 1 }, { t: "CHECK_QUIZ" }], s);
    expect(s.status).toBe("success");
    expect(s.pending.at(-1)?.payload.correct).toBe(true);
    s = run([{ t: "CONTINUE" }], s);
    expect(s.done).toBe(true);
  });

  it("review mode emits review evidence", () => {
    let s = initEpisode(lesson, "review");
    s = run([{ t: "CONTINUE" }, { t: "INTERACT" }, { t: "CHECK", results: [{ id: "c1", pass: true }, { id: "c2", pass: true }] }], s);
    expect(s.pending.at(-1)?.type).toBe("review_pass");
  });
});
