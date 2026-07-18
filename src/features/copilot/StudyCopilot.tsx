import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LessonDoc, MisconceptionCard as MisconceptionCardType } from "../learning-episode/types";
import { FinnAvatar, type FinnExpression } from "./FinnAvatar";
import type { CopilotState } from "./copilotMachine";
import { PrimaryButton, SecondaryButton } from "../../components/primitives";

const HINT_NAMES = ["Nudge me", "Point to what matters", "Explain the idea", "Show one step"] as const;

function expressionFor(state: CopilotState): FinnExpression {
  switch (state.s) {
    case "idle":
      return "neutral";
    case "observing":
      return state.offer > 0 ? "curious" : "attentive";
    case "waiting":
      return "attentive";
    case "hinting":
      return "thinking";
    case "teaching":
      return "reassuring";
    case "celebrating":
      return "celebrating";
    case "suspended":
      return "neutral";
  }
}

/** Finn's in-lesson dock: avatar + speech + hint ladder + misconception card.
    All ordinary pedagogy is offered, never forced (spec §3.4). */
export function StudyCopilot({
  state,
  speech,
  lesson,
  screenId,
  hintLevelUsed,
  onOpenHint,
  onHintDone,
  onTeachDone,
  misconception,
}: {
  state: CopilotState;
  speech: string | null;
  lesson: LessonDoc;
  screenId: string;
  hintLevelUsed: number;
  onOpenHint: (level: 1 | 2 | 3 | 4) => void;
  onHintDone: () => void;
  onTeachDone: () => void;
  misconception: MisconceptionCardType | null;
}) {
  const hints = lesson.hints[screenId];
  const nextLevel = Math.min(4, hintLevelUsed + 1) as 1 | 2 | 3 | 4;

  // celebrating auto-clears ≤1.2s upstream; teaching renders card below
  useEffect(() => {
    if (state.s === "teaching" && !misconception) onTeachDone();
  }, [state.s, misconception, onTeachDone]);

  return (
    <>
      {/* dock: bottom-left companion (spec §3.3 surface model) */}
      <div className="fixed left-3 bottom-20 z-40 flex items-end gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          <FinnAvatar expression={expressionFor(state)} size={48} />
        </div>
        <AnimatePresence>
          {speech && (
            <motion.div
              key={speech}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto max-w-[240px] px-3 py-2 text-[13px]"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                borderBottomLeftRadius: 4,
                boxShadow: "var(--shadow-1)",
              }}
              role="status"
            >
              {speech}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* hint ladder sheet */}
      <AnimatePresence>
        {state.s === "hinting" && hints && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] p-4 pb-6"
            style={{
              background: "var(--card)",
              borderTopLeftRadius: "var(--radius-sheet)",
              borderTopRightRadius: "var(--radius-sheet)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-3)",
            }}
            role="dialog"
            aria-label={`Hint level ${state.level}: ${HINT_NAMES[state.level - 1]}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FinnAvatar expression="thinking" size={32} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Hint {state.level} · {HINT_NAMES[state.level - 1]}
              </span>
            </div>
            <p className="text-[15px] mb-4">{hints[state.level - 1]}</p>
            {state.level < 4 ? (
              <div className="flex gap-2">
                <SecondaryButton onClick={() => onOpenHint(Math.min(4, state.level + 1) as 1 | 2 | 3 | 4)}>
                  I need more
                </SecondaryButton>
                <PrimaryButton onClick={onHintDone}>Let me try</PrimaryButton>
              </div>
            ) : (
              <PrimaryButton onClick={onHintDone}>Got it — I'll retry with new numbers</PrimaryButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* misconception card (spec §3.5 H3 surface: stable sheet, puzzle state preserved) */}
      <AnimatePresence>
        {state.s === "teaching" && misconception && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] p-4 pb-6"
            style={{
              background: "var(--card)",
              borderTopLeftRadius: "var(--radius-sheet)",
              borderTopRightRadius: "var(--radius-sheet)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-3)",
            }}
            role="dialog"
            aria-label={`An idea worth revisiting: ${misconception.title}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FinnAvatar expression="reassuring" size={32} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                An idea worth revisiting
              </span>
            </div>
            <h3 className="text-[16px] mb-2">{misconception.title}</h3>
            <div className="flex flex-col gap-2 mb-4 text-[14px]">
              <div className="rounded-[12px] p-3" style={{ background: "color-mix(in srgb, var(--warning) 10%, transparent)" }}>
                <span className="font-bold" style={{ color: "var(--warning)" }}>The tempting model: </span>
                {misconception.wrongModel}
              </div>
              <div className="rounded-[12px] p-3" style={{ background: "var(--brand-soft)" }}>
                <span className="font-bold" style={{ color: "var(--brand-hover)" }}>What actually happens: </span>
                {misconception.rightModel}
              </div>
            </div>
            <PrimaryButton onClick={onTeachDone}>{misconception.testAction}</PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
