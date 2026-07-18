import { describe, expect, it } from "vitest";
import { BASE_LESSON_XP, lessonXp, REVIEW_XP, SCREEN_XP, sessionXp } from "./xp";
import { frameMode } from "./CheckFrame";

describe("xp", () => {
  it("matches the pre-refactor award formulas", () => {
    expect(lessonXp(0)).toBe(50);
    expect(lessonXp(3)).toBe(65);
    expect(REVIEW_XP).toBe(20);
    expect(BASE_LESSON_XP + 4 * SCREEN_XP).toBe(lessonXp(4));
  });

  it("session counter derives from correctCount", () => {
    expect(sessionXp(0)).toBe(0);
    expect(sessionXp(2)).toBe(10);
  });
});

describe("frameMode", () => {
  it("maps status × evaluating to frame modes", () => {
    const cases: [Parameters<typeof frameMode>, ReturnType<typeof frameMode>][] = [
      [["idle", false], "interactive"],
      [["dirty", false], "interactive"],
      [["dirty", true], "evaluating"],
      [["evaluating", false], "evaluating"],
      [["success", false], "success"],
      [["success", true], "evaluating"],
      [["failure", false], "failure"],
      [["failure", true], "evaluating"],
    ];
    for (const [[status, evaluating], expected] of cases) {
      expect(frameMode(status, evaluating)).toBe(expected);
    }
  });
});
