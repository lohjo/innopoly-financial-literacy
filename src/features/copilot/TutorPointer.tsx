import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { dur, useMotionPrefs } from "../../motion";
import { isOffscreen, notePlacement, resolveTutorSelector, ringFrame, type Frame } from "./tutorTargets";
import type { TutorAnnotation } from "./toolExecutor";

const NOTE_W = 220;
const NOTE_H = 64;

/** Finn's spatial pointer: a ring (and optional note) drawn at the DOM rect of the
    active tutor target. Purely presentational — grading state never lives here. */
export function TutorPointer({ targetId, annotation }: { targetId: string | null; annotation: TutorAnnotation | null }) {
  const { collapse } = useMotionPrefs();
  const [rect, setRect] = useState<Frame | null>(null);

  useEffect(() => {
    if (!targetId) {
      setRect(null);
      return;
    }
    const el = document.querySelector(resolveTutorSelector(targetId));
    if (!(el instanceof HTMLElement)) {
      setRect(null);
      return;
    }
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
    };
    const first = el.getBoundingClientRect();
    if (isOffscreen(first, { width: window.innerWidth, height: window.innerHeight })) {
      el.scrollIntoView({ block: "center", behavior: collapse ? "auto" : "smooth" });
    }
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [targetId, collapse]);

  const ring = rect ? ringFrame(rect) : null;
  const note =
    rect && annotation && annotation.targetId === targetId
      ? notePlacement(rect, { width: window.innerWidth, height: window.innerHeight }, { width: NOTE_W, height: NOTE_H })
      : null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none" aria-hidden={!annotation}>
      <AnimatePresence>
        {ring && (
          <motion.div
            key={targetId}
            initial={{ opacity: 0, scale: collapse ? 1 : 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur.card }}
            className="absolute rounded-[14px]"
            style={{
              left: ring.left,
              top: ring.top,
              width: ring.width,
              height: ring.height,
              border: "2.5px solid var(--info)",
              boxShadow: "0 0 0 4px color-mix(in srgb, var(--info) 18%, transparent)",
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {note && annotation && (
          <motion.div
            key={`${targetId}-note`}
            initial={{ opacity: 0, y: note.side === "below" ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur.card }}
            role="status"
            className="absolute px-3 py-2 text-[13px]"
            style={{
              left: note.left,
              top: note.top,
              maxWidth: NOTE_W,
              background: "var(--card)",
              border: "1px solid color-mix(in srgb, var(--info) 45%, var(--border))",
              borderRadius: 12,
              boxShadow: "var(--shadow-2)",
            }}
          >
            {annotation.note}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
