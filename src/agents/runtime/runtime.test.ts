import { describe, expect, it } from "vitest";
import { outcomeFromGrade } from "../gates";
import { loadAgentRuntimeConfig } from "./config";
import { runMissExplain } from "./missExplain";
import { fakeTransport, runManagedAgent } from "./runner";
import { MissExplainOutputSchema } from "./schemas";
import { selfCritiqueSpoken } from "./selfCritique";
import { verifyMissExplain } from "./verifier";

const failureResults = [
  { id: "saved-target", pass: false },
  { id: "never-borrowed", pass: true },
];

describe("verifier", () => {
  const outcome = outcomeFromGrade(failureResults);

  it("accepts rubric-aligned Socratic question after failure", () => {
    const result = verifyMissExplain(
      { question: "Which criterion still looks unmet?", criterionId: "saved-target" },
      {
        outcome,
        failedCriteria: outcome.failedCriteria,
        allowedCriteria: ["saved-target", "never-borrowed"],
      },
    );
    expect(result.ok).toBe(true);
  });

  it("rejects when outcome is success", () => {
    const result = verifyMissExplain(
      { question: "Which criterion still looks unmet?" },
      {
        outcome: { mode: "success", failedCriteria: [], speechMode: "celebrate" },
        failedCriteria: [],
        allowedCriteria: ["saved-target"],
      },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("gate_order");
  });

  it("rejects XP / pass claims and off-allowlist criteria", () => {
    const xp = verifyMissExplain(
      { question: "Can I award XP for trying next?" },
      {
        outcome,
        failedCriteria: outcome.failedCriteria,
        allowedCriteria: ["saved-target"],
      },
    );
    expect(xp.ok).toBe(false);

    const badCrit = verifyMissExplain(
      { question: "Which criterion still looks unmet?", criterionId: "injected" },
      {
        outcome,
        failedCriteria: outcome.failedCriteria,
        allowedCriteria: ["saved-target"],
      },
    );
    expect(badCrit.ok).toBe(false);
    if (!badCrit.ok) expect(badCrit.code).toBe("criterion");
  });
});

describe("runManagedAgent fake transport", () => {
  it("returns disabled when feature flag is off", async () => {
    const result = await runManagedAgent(
      { name: "miss_explain", systemPrompt: "x", enabled: false },
      { user: "{}" },
      MissExplainOutputSchema,
      {
        transport: fakeTransport("{}"),
        enabled: false,
        verify: (v) => ({ ok: true, value: v }),
      },
    );
    expect(result.status).toBe("disabled");
  });

  it("accepts valid fake JSON through schema + verifier", async () => {
    const outcome = outcomeFromGrade(failureResults);
    const result = await runManagedAgent(
      { name: "miss_explain", systemPrompt: "x", enabled: true },
      { user: "{}" },
      MissExplainOutputSchema,
      {
        enabled: true,
        transport: fakeTransport(
          JSON.stringify({ question: "What still blocks the month from working?", criterionId: "saved-target" }),
        ),
        verify: (value) =>
          verifyMissExplain(value, {
            outcome,
            failedCriteria: outcome.failedCriteria,
            allowedCriteria: ["saved-target", "never-borrowed"],
          }),
      },
    );
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.value.criterionId).toBe("saved-target");
    }
  });

  it("rejects unsafe fake JSON", async () => {
    const outcome = outcomeFromGrade(failureResults);
    const result = await runManagedAgent(
      { name: "miss_explain", systemPrompt: "x", enabled: true },
      { user: "{}" },
      MissExplainOutputSchema,
      {
        enabled: true,
        transport: fakeTransport(JSON.stringify({ question: "Choose $500 now?", criterionId: "saved-target" })),
        verify: (value) =>
          verifyMissExplain(value, {
            outcome,
            failedCriteria: outcome.failedCriteria,
            allowedCriteria: ["saved-target"],
          }),
      },
    );
    expect(result.status).toBe("rejected");
  });
});

describe("runMissExplain helper", () => {
  it("no-ops without feature flag (production default)", async () => {
    const out = await runMissExplain({
      gradeResults: failureResults,
      allowedCriteria: ["saved-target"],
      prompt: "Route paycheck",
      transport: fakeTransport(JSON.stringify({ question: "Which criterion still looks unmet?" })),
      enabled: false,
    });
    expect(out).toBeNull();
  });

  it("returns verified question when enabled", async () => {
    const out = await runMissExplain({
      gradeResults: failureResults,
      allowedCriteria: ["saved-target", "never-borrowed"],
      prompt: "Route paycheck",
      enabled: true,
      transport: fakeTransport(
        JSON.stringify({ question: "Which criterion still looks unmet?", criterionId: "saved-target" }),
      ),
    });
    expect(out?.question).toMatch(/\?$/);
  });

  it("returns null on success grades even when enabled", async () => {
    const out = await runMissExplain({
      gradeResults: [{ id: "saved-target", pass: true }],
      allowedCriteria: ["saved-target"],
      prompt: "Route",
      enabled: true,
      transport: fakeTransport(JSON.stringify({ question: "Which criterion still looks unmet?" })),
    });
    expect(out).toBeNull();
  });
});

describe("config + selfCritique", () => {
  it("defaults managed agents off", () => {
    expect(loadAgentRuntimeConfig({}).managedAgentsEnabled).toBe(false);
    expect(loadAgentRuntimeConfig({ MANAGED_AGENTS: "true" }).managedAgentsEnabled).toBe(true);
  });

  it("self-critique never throws", async () => {
    const bad = await selfCritiqueSpoken("Choose 1?");
    expect(bad.ok).toBe(false);
    const ok = await selfCritiqueSpoken("Which criterion would you test next?");
    expect(ok.ok).toBe(true);
    const swallowed = await selfCritiqueSpoken("Which criterion would you test next?", async () => {
      throw new Error("boom");
    });
    expect(swallowed.notes.join(" ")).toMatch(/unavailable/);
  });
});
