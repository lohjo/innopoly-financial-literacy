import type { ReactNode } from "react";
import type { ScreenStatus } from "./episodeMachine";
import { dur, useMotionPrefs } from "../../motion";

/* Whole-frame affect for Check surfaces (brilliant-replicate V-pattern):
   the frame — not individual widgets — carries interactive/evaluating/success/failure.
   Color-only + glow; no x-axis motion ever (no shake). */

export type CheckFrameMode = "interactive" | "evaluating" | "success" | "failure";

export function frameMode(status: ScreenStatus, evaluating: boolean): CheckFrameMode {
  if (evaluating || status === "evaluating") return "evaluating";
  if (status === "success") return "success";
  if (status === "failure") return "failure";
  return "interactive";
}

const glow = (color: string) =>
  `0 0 0 4px color-mix(in srgb, ${color} 22%, transparent), 0 8px 28px color-mix(in srgb, ${color} 18%, transparent)`;

const FRAME: Record<CheckFrameMode, { border: string; shadow: string }> = {
  interactive: { border: "var(--border)", shadow: "0 0 0 0 transparent" },
  evaluating: { border: "var(--brand)", shadow: "0 0 0 0 transparent" },
  success: { border: "var(--success)", shadow: glow("var(--success)") },
  failure: { border: "var(--warning)", shadow: glow("var(--warning)") },
};

export function CheckFrame({ mode, children }: { mode: CheckFrameMode; children: ReactNode }) {
  const { collapse } = useMotionPrefs();
  const f = FRAME[mode];
  return (
    <div
      className="rounded-[var(--radius-card)] p-3"
      aria-busy={mode === "evaluating"}
      style={{
        border: `2px solid ${f.border}`,
        boxShadow: f.shadow,
        pointerEvents: mode === "evaluating" ? "none" : undefined,
        // CSS transitions interpolate color-mix() shadows reliably (motion's string interpolator does not)
        transition: collapse ? "none" : `border-color ${dur.card}s var(--ease-state), box-shadow ${dur.card}s var(--ease-state)`,
      }}
    >
      {children}
    </div>
  );
}
