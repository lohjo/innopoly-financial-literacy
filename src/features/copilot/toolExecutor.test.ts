import { describe, expect, it, vi } from "vitest";
import { executeToolCommand, type ToolExecutorDeps } from "./toolExecutor";

function makeDeps(): ToolExecutorDeps & { [K in keyof ToolExecutorDeps]-?: ReturnType<typeof vi.fn> } {
  return {
    setHighlight: vi.fn(),
    setAnnotation: vi.fn(),
    openHint: vi.fn(),
    setSpeech: vi.fn(),
    pulse: vi.fn(),
  };
}

describe("executeToolCommand", () => {
  it("highlight_element sets the highlight and nothing else", () => {
    const deps = makeDeps();
    executeToolCommand({ type: "highlight_element", targetId: "never-borrowed" }, deps);
    expect(deps.setHighlight).toHaveBeenCalledWith("never-borrowed");
    expect(deps.setAnnotation).not.toHaveBeenCalled();
    expect(deps.openHint).not.toHaveBeenCalled();
    expect(deps.setSpeech).not.toHaveBeenCalled();
  });

  it("annotate_target highlights and annotates the same target", () => {
    const deps = makeDeps();
    executeToolCommand({ type: "annotate_target", targetId: "opt-1", note: "Look here" }, deps);
    expect(deps.setHighlight).toHaveBeenCalledWith("opt-1");
    expect(deps.setAnnotation).toHaveBeenCalledWith({ targetId: "opt-1", note: "Look here" });
  });

  it("reveal_hint routes through openHint with the level", () => {
    const deps = makeDeps();
    executeToolCommand({ type: "reveal_hint", level: 2 }, deps);
    expect(deps.openHint).toHaveBeenCalledWith(2);
    expect(deps.setHighlight).not.toHaveBeenCalled();
  });

  it("pose_followup only sets bubble speech — never opens a sheet", () => {
    const deps = makeDeps();
    executeToolCommand({ type: "pose_followup", text: "What changes if rent is fixed?" }, deps);
    expect(deps.setSpeech).toHaveBeenCalledWith("What changes if rent is fixed?");
    expect(deps.openHint).not.toHaveBeenCalled();
  });

  it("pulse_tutor is a no-op when no pulse effect is provided", () => {
    const deps = makeDeps();
    const { pulse: _pulse, ...withoutPulse } = deps;
    expect(() => executeToolCommand({ type: "pulse_tutor" }, withoutPulse)).not.toThrow();
    executeToolCommand({ type: "pulse_tutor" }, deps);
    expect(deps.pulse).toHaveBeenCalledOnce();
  });

  it("clear resets highlight and annotation but leaves speech alone", () => {
    const deps = makeDeps();
    executeToolCommand({ type: "clear" }, deps);
    expect(deps.setHighlight).toHaveBeenCalledWith(null);
    expect(deps.setAnnotation).toHaveBeenCalledWith(null);
    expect(deps.setSpeech).not.toHaveBeenCalled();
  });
});
