import { describe, expect, it } from "vitest";
import { afterTool, beforeTool, executeTool, type SessionState } from "./grounding";

function state(allowed: string[]): SessionState {
  return {
    allowed_criteria: allowed,
    lesson_context: {
      lesson_id: "night-it-lands",
      screen_id: "puzzle-route",
      prompt: "Route",
      criteria: allowed.map((id) => ({ id, label: id })),
      status: "failure",
      failed_criteria: allowed.slice(0, 1),
      hint_level: 1,
      learner_text: "",
    },
  };
}

describe("grounding before/after tool (ported)", () => {
  it("rejects unknown tool name", () => {
    expect(beforeTool("award_xp", {}, state([]))).toEqual({
      status: "error",
      message: "Tool is not permitted.",
    });
  });

  it("rejects invalid action and off-allowlist highlight", () => {
    expect(beforeTool("render_hint_focus", { action: "answer" }, state([]))?.status).toBe("error");
    expect(
      beforeTool(
        "render_hint_focus",
        { action: "highlight_criterion", criterion_id: "injected" },
        state(["saved-target"]),
      )?.status,
    ).toBe("error");
  });

  it("accepts highlight within allowlist and pulse/clear", () => {
    expect(
      beforeTool(
        "render_hint_focus",
        { action: "highlight_criterion", criterion_id: "saved-target" },
        state(["saved-target"]),
      ),
    ).toBeNull();
    for (const action of ["pulse_tutor", "clear_highlight"]) {
      expect(beforeTool("render_hint_focus", { action }, state([]))).toBeNull();
    }
  });

  it("rejects criterion_id on non-highlight action", () => {
    expect(
      beforeTool(
        "render_hint_focus",
        { action: "pulse_tutor", criterion_id: "saved-target" },
        state(["saved-target"]),
      )?.status,
    ).toBe("error");
  });

  it("after_tool rejects missing/wrong layer", () => {
    expect(afterTool("render_hint_focus", { status: "success" })?.status).toBe("error");
    expect(
      afterTool("render_hint_focus", {
        status: "success",
        render_command: { layer: "clinical", action: "show" },
      })?.status,
    ).toBe("error");
    expect(
      afterTool("render_hint_focus", {
        status: "success",
        render_command: { layer: "lesson_tutor", action: "pulse_tutor" },
      }),
    ).toBeNull();
  });

  it("executeTool returns render_command for highlight", () => {
    const result = executeTool(
      "render_hint_focus",
      { action: "highlight_criterion", criterion_id: "saved-target" },
      state(["saved-target"]),
    );
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.render_command).toEqual({
        layer: "lesson_tutor",
        action: "highlight_criterion",
        criterion_id: "saved-target",
      });
    }
  });

  it("get_lesson_context is read-only", () => {
    const result = executeTool("get_lesson_context", {}, state(["saved-target"]));
    expect(result.status).toBe("success");
  });
});
