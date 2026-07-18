import { useState } from "react";
import { FinnAvatar } from "./FinnAvatar";

/** Contextual Finn entry point in the app shell (spec §6.1: help button, not a fifth tab).
    Outside a lesson it offers general help actions; contextual copilot lives in CoursePlayer. */
export function FinnButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open Finn"
        aria-expanded={open}
        className="absolute right-4 flex items-center justify-center"
        style={{
          bottom: 12,
          width: 48,
          height: 48,
          borderRadius: "var(--radius-action)",
          background: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <FinnAvatar expression={open ? "attentive" : "neutral"} size={38} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Finn help"
          className="absolute right-4 p-4 w-[260px]"
          style={{
            bottom: 68,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          <p className="text-[14px] font-bold mb-1">Hi, I'm Finn.</p>
          <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            Open a lesson or a rehearsal call and I can nudge you, point to what matters, or explain a term — right where you're working.
          </p>
        </div>
      )}
    </>
  );
}
