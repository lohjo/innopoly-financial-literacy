import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));

describe("tutor server architecture", () => {
  it("does not import awardXp, recordEvidence, or store writers", () => {
    const files = readdirSync(HERE).filter((f: string) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
    for (const file of files) {
      const src = readFileSync(join(HERE, file), "utf8");
      expect(src, file).not.toMatch(/\bawardXp\b/);
      expect(src, file).not.toMatch(/\brecordEvidence\b/);
      expect(src, file).not.toMatch(/stores\/store/);
      expect(src, file).not.toMatch(/evaluatePuzzle/);
    }
  });
});
