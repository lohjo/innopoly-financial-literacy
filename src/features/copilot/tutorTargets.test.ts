import { describe, expect, it } from "vitest";
import { isOffscreen, notePlacement, resolveTutorSelector, ringFrame } from "./tutorTargets";

describe("resolveTutorSelector", () => {
  it("builds an attribute selector for plain ids", () => {
    expect(resolveTutorSelector("never-borrowed")).toBe('[data-tutor-target="never-borrowed"]');
    expect(resolveTutorSelector("opt-2")).toBe('[data-tutor-target="opt-2"]');
  });

  it("escapes quotes and backslashes", () => {
    expect(resolveTutorSelector('a"b\\c')).toBe('[data-tutor-target="a\\"b\\\\c"]');
  });
});

describe("ringFrame", () => {
  it("pads the rect symmetrically", () => {
    expect(ringFrame({ left: 100, top: 50, width: 200, height: 40 })).toEqual({
      left: 94,
      top: 44,
      width: 212,
      height: 52,
    });
  });
});

describe("notePlacement", () => {
  const viewport = { width: 400, height: 800 };
  const note = { width: 200, height: 60 };

  it("places the note below the target when there is room", () => {
    const p = notePlacement({ left: 50, top: 100, width: 200, height: 40 }, viewport, note);
    expect(p.side).toBe("below");
    expect(p.top).toBe(150);
    expect(p.left).toBe(50);
  });

  it("flips above when the target sits near the bottom", () => {
    const p = notePlacement({ left: 50, top: 740, width: 200, height: 40 }, viewport, note);
    expect(p.side).toBe("above");
    expect(p.top).toBe(740 - 10 - 60);
  });

  it("clamps horizontally to the viewport gutter", () => {
    const p = notePlacement({ left: 350, top: 100, width: 40, height: 40 }, viewport, note);
    expect(p.left).toBe(400 - 200 - 8);
    const q = notePlacement({ left: -30, top: 100, width: 40, height: 40 }, viewport, note);
    expect(q.left).toBe(8);
  });
});

describe("isOffscreen", () => {
  const viewport = { width: 400, height: 800 };
  it("detects rects scrolled past either edge", () => {
    expect(isOffscreen({ left: 0, top: -100, width: 100, height: 50 }, viewport)).toBe(true);
    expect(isOffscreen({ left: 0, top: 900, width: 100, height: 50 }, viewport)).toBe(true);
    expect(isOffscreen({ left: 0, top: 300, width: 100, height: 50 }, viewport)).toBe(false);
  });
});
