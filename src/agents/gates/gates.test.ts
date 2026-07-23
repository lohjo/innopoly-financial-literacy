import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  acceptSpokenFollowup,
  alignHintCandidate,
  applyValidatedHighlight,
  authoredHintFor,
  FALLBACK_QUESTION,
  gradePuzzle,
  outcomeFromGrade,
  outcomeFromStatus,
  safeSpokenHint,
  validateUiHighlight,
} from "./index";
import type { PuzzleDoc } from "./grading";

const HERE = dirname(fileURLToPath(import.meta.url));

describe("ui_highlight gate", () => {
  it("accepts allowlisted criterion and returns selector via injected resolver", () => {
    const resolve = vi.fn((id: string) => `[data-tutor-target="${id}"]`);
    const result = validateUiHighlight(
      { action: "highlight_criterion", criterionId: "saved-target" },
      ["saved-target", "never-borrowed"],
      resolve,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.command).toEqual({ action: "highlight_criterion", criterionId: "saved-target" });
      expect(result.selector).toBe('[data-tutor-target="saved-target"]');
    }
    expect(resolve).toHaveBeenCalledWith("saved-target");
  });

  it("rejects off-allowlist criterion before any UI write", () => {
    const setHighlight = vi.fn();
    const result = applyValidatedHighlight(
      { action: "highlight_criterion", criterionId: "injected" },
      ["saved-target"],
      setHighlight,
      (id) => id,
    );
    expect(result.ok).toBe(false);
    expect(setHighlight).not.toHaveBeenCalled();
  });

  it("clear_highlight nulls highlight; pulse never sets criterion", () => {
    const setHighlight = vi.fn();
    expect(applyValidatedHighlight({ action: "clear_highlight" }, [], setHighlight).ok).toBe(true);
    expect(setHighlight).toHaveBeenCalledWith(null);
    setHighlight.mockClear();
    expect(applyValidatedHighlight({ action: "pulse_tutor" }, ["saved-target"], setHighlight).ok).toBe(true);
    expect(setHighlight).not.toHaveBeenCalled();
  });
});

describe("hint_rubric_alignment gate", () => {
  it("mirrors safe_spoken_hint policy", () => {
    expect(safeSpokenHint(FALLBACK_QUESTION)).toBe(true);
    expect(safeSpokenHint("Which visible criterion would you test next?")).toBe(true);
    for (const unsafe of [
      "Choose $500.",
      "The answer is saved-target?",
      "Set the payment to 285?",
      "Which value is 500?",
    ]) {
      expect(safeSpokenHint(unsafe)).toBe(false);
    }
  });

  it("returns authored ladder text", () => {
    const hints = { "puzzle-route": ["nudge", "point", "idea", "step"] as [string, string, string, string] };
    const h2 = authoredHintFor(hints, "puzzle-route", 2);
    expect(h2).toEqual({ ok: true, text: "point", level: 2, criterionId: null, source: "authored" });
  });

  it("rejects generative candidate with off-failed criterion or digits", () => {
    const badCrit = acceptSpokenFollowup("Which criterion still looks unmet?", {
      criterionId: "never-borrowed",
      failedCriteria: ["saved-target"],
      allowedCriteria: ["saved-target", "never-borrowed"],
    });
    expect(badCrit.ok).toBe(false);

    const badDigits = acceptSpokenFollowup("Which value is 500?", {
      criterionId: "saved-target",
      failedCriteria: ["saved-target"],
      allowedCriteria: ["saved-target"],
    });
    expect(badDigits.ok).toBe(false);

    const ok = acceptSpokenFollowup("Which criterion still looks unmet?", {
      criterionId: "saved-target",
      failedCriteria: ["saved-target"],
      allowedCriteria: ["saved-target", "never-borrowed"],
    });
    expect(ok.ok).toBe(true);
  });

  it("allows authored alignment without spoken policy", () => {
    const result = alignHintCandidate({
      text: "Route at least $500 to savings before the month drains.",
      level: 3,
      failedCriteria: ["saved-target"],
      allowedCriteria: ["saved-target"],
      requireSpokenPolicy: false,
    });
    expect(result.ok).toBe(true);
  });
});

describe("grading + outcome_response gates", () => {
  const puzzle = {
    id: "p",
    prompt: "route",
    concepts: ["pay-yourself-first"],
    criteria: [
      { id: "saved-target", label: "save" },
      { id: "never-borrowed", label: "buffer" },
    ],
    params: {
      mechanic: "flow" as const,
      flow: {
        salary: 3000,
        buckets: [
          { id: "save", label: "Save", kind: "save" as const },
          { id: "rent", label: "Rent", kind: "fixed" as const },
          { id: "flex", label: "Flex", kind: "flexible" as const },
        ],
        committed: { rent: 800 },
        dailyDrain: 40,
        days: 30,
        events: [],
        targets: { savedTarget: 500 },
      },
    },
  } satisfies PuzzleDoc;

  it("grades via evaluatePuzzle facade", () => {
    const fail = gradePuzzle(puzzle, { mechanic: "flow", alloc: { save: 0 } });
    expect(fail.some((r) => !r.pass)).toBe(true);
    const pass = gradePuzzle(puzzle, { mechanic: "flow", alloc: { save: 500 } });
    // buffer may still fail depending on drain — at least saved-target should pass
    expect(pass.find((r) => r.id === "saved-target")?.pass).toBe(true);
  });

  it("maps grade results to success/failure without store writes", () => {
    expect(outcomeFromGrade([{ id: "a", pass: true }])).toEqual({
      mode: "success",
      failedCriteria: [],
      speechMode: "celebrate",
    });
    expect(outcomeFromGrade([{ id: "a", pass: false }, { id: "b", pass: true }])).toEqual({
      mode: "failure",
      failedCriteria: ["a"],
      speechMode: "socratic",
    });
    expect(outcomeFromGrade(null).mode).toBe("coaching");
    expect(outcomeFromStatus("failure", ["saved-target"]).speechMode).toBe("socratic");
  });
});

describe("gate module purity invariants", () => {
  it("gate modules do not import model SDKs, keys, or store writers", () => {
    const files = readdirSync(HERE).filter((f: string) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
    const bannedImport = [
      /from\s+["']@google\/genai["']/,
      /from\s+["']openai["']/,
      /from\s+["']@anthropic/,
      /from\s+["'][^"']*stores\/store["']/,
      /\bawardXp\b/,
      /\brecordEvidence\b/,
      /\bGEMINI_API_KEY\b/,
      /\bOPENAI_API_KEY\b/,
      /\bANTHROPIC_API_KEY\b/,
    ];
    for (const file of files) {
      const src = readFileSync(join(HERE, file), "utf8");
      for (const pattern of bannedImport) {
        expect(src, `${file} must not match ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
