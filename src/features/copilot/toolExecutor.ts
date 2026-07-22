/* One seam for every tutor-issued UI command — mocked hints today, the live
   tutor tomorrow. Pure dispatch onto caller-supplied effects; the executor
   never opens sheets on its own and never touches grading state (spec §11.2). */

export type CopilotToolCommand =
  | { type: "highlight_element"; targetId: string }
  | { type: "annotate_target"; targetId: string; note: string }
  | { type: "reveal_hint"; level: 1 | 2 | 3 | 4 }
  | { type: "pose_followup"; text: string }
  | { type: "pulse_tutor" }
  | { type: "clear" };

export type TutorAnnotation = { targetId: string; note: string };

export interface ToolExecutorDeps {
  setHighlight: (targetId: string | null) => void;
  setAnnotation: (annotation: TutorAnnotation | null) => void;
  /** Opens the hint ladder at a level — routed through the copilot machine's HELP path. */
  openHint: (level: 1 | 2 | 3 | 4) => void;
  /** Bubble text only — a follow-up question never auto-opens a sheet. */
  setSpeech: (text: string | null) => void;
  pulse?: () => void;
}

export function executeToolCommand(cmd: CopilotToolCommand, deps: ToolExecutorDeps): void {
  switch (cmd.type) {
    case "highlight_element":
      deps.setHighlight(cmd.targetId);
      return;
    case "annotate_target":
      deps.setHighlight(cmd.targetId);
      deps.setAnnotation({ targetId: cmd.targetId, note: cmd.note });
      return;
    case "reveal_hint":
      deps.openHint(cmd.level);
      return;
    case "pose_followup":
      deps.setSpeech(cmd.text);
      return;
    case "pulse_tutor":
      deps.pulse?.();
      return;
    case "clear":
      deps.setHighlight(null);
      deps.setAnnotation(null);
      return;
  }
}
