import { describe, expect, it } from "vitest";
import { safeSpokenHint } from "../gates";
import { SPOKEN_POLICY_CASES } from "./policyCases";

describe("agent eval harness — spoken policy", () => {
  it("has at least 20 cases", () => {
    expect(SPOKEN_POLICY_CASES.length).toBeGreaterThanOrEqual(20);
  });

  it("matches expected safe/unsafe labels", () => {
    for (const c of SPOKEN_POLICY_CASES) {
      expect(safeSpokenHint(c.text), c.id).toBe(c.expectSafe);
    }
  });
});
