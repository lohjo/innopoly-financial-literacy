import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Live / tool path architecture guards", () => {
  it("useLiveTutor does not import awardXp or recordEvidence", () => {
    const src = read("src/features/copilot/live/useLiveTutor.ts");
    expect(src).not.toMatch(/awardXp/);
    expect(src).not.toMatch(/recordEvidence/);
    expect(src).not.toMatch(/evaluatePuzzle/);
  });

  it("toolExecutor does not import grading or store writers", () => {
    const src = read("src/features/copilot/toolExecutor.ts");
    expect(src).not.toMatch(/awardXp/);
    expect(src).not.toMatch(/recordEvidence/);
    expect(src).not.toMatch(/evaluatePuzzle/);
    expect(src).not.toMatch(/from ["'].*stores\/store/);
  });

  it("highlight apply path validates via uiHighlight before setHighlight", () => {
    const src = read("src/agents/gates/uiHighlight.ts");
    expect(src).toMatch(/validateUiHighlight/);
    expect(src).toMatch(/setHighlight/);
    // setHighlight only after ok path
    expect(src.indexOf("if (!result.ok)")).toBeLessThan(src.lastIndexOf("setHighlight("));
  });
});
