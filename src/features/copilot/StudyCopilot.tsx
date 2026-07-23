import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mic, MicOff, MessageCircle } from "lucide-react";
import type { LessonDoc, MisconceptionCard as MisconceptionCardType } from "../learning-episode/types";
import { FinnAvatar, type FinnExpression } from "./FinnAvatar";
import type { CopilotState } from "./copilotMachine";
import { PrimaryButton, SecondaryButton } from "../../components/primitives";
import { useLiveTutor, type TutorContext } from "./live/useLiveTutor";

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

function liveExpression(
  status: ReturnType<typeof useLiveTutor>["status"],
  pulsing: boolean,
  fallback: FinnExpression,
): FinnExpression {
  if (pulsing) return "curious";
  if (status === "listening") return "listening";
  if (status === "speaking") return "speaking";
  if (status === "connecting") return "attentive";
  return fallback;
}

function liveStatusLabel(
  status: ReturnType<typeof useLiveTutor>["status"],
  voicePhase: ReturnType<typeof useLiveTutor>["voicePhase"],
): string | null {
  // Prefer Clicky-shaped phase labels when Live is active.
  if (status === "error") return "Unavailable";
  if (status === "idle") return null;
  switch (voicePhase) {
    case "listening":
      return "Listening…";
    case "processing":
      return "Thinking…";
    case "responding":
      return "Finn is talking";
    default:
      return status === "ready" ? "Ready" : status === "connecting" ? "Connecting…" : null;
  }
}

/** Finn's in-lesson dock: avatar + speech + optional live tutor + hint ladder + misconception card.
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
  tutorContext,
  onHighlightCriterion,
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
  tutorContext?: TutorContext;
  onHighlightCriterion?: (criterionId: string | null) => void;
}) {
  const hints = lesson.hints[screenId];
  const sheetsOpen = state.s === "hinting" || state.s === "teaching";
  const [askOpen, setAskOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [pulsing, setPulsing] = useState(false);

  const onCommand = useCallback(
    (command: { action?: string; criterion_id?: string }) => {
      if (command.action === "highlight_criterion" && command.criterion_id) {
        onHighlightCriterion?.(command.criterion_id);
        return;
      }
      if (command.action === "clear_highlight") {
        onHighlightCriterion?.(null);
        return;
      }
      if (command.action === "pulse_tutor") {
        setPulsing(true);
        window.setTimeout(() => setPulsing(false), 900);
      }
    },
    [onHighlightCriterion],
  );

  const onBargeIn = useCallback(() => {
    // Clear in-flight authored bubble; Live transcript clears inside the hook.
    // Do not touch grading — barge-in is UI-only (Clicky cancel pattern).
  }, []);

  const {
    available,
    status,
    voicePhase,
    error,
    transcript,
    activate,
    ask,
    setContext,
    stopListening,
    startListening,
  } = useLiveTutor({ onCommand, onBargeIn });

  useEffect(() => {
    if (tutorContext) setContext(tutorContext);
  }, [setContext, tutorContext]);

  useEffect(() => {
    if (sheetsOpen) {
      setAskOpen(false);
      stopListening();
    }
  }, [sheetsOpen, stopListening]);

  // celebrating auto-clears ≤1.2s upstream; teaching renders card below
  useEffect(() => {
    if (state.s === "teaching" && !misconception) onTeachDone();
  }, [state.s, misconception, onTeachDone]);

  const bubbleText = error ?? transcript ?? speech;
  const statusLabel = available ? liveStatusLabel(status, voicePhase) : null;
  const expression = liveExpression(status, pulsing, expressionFor(state));

  const openAsk = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7311/ingest/486d08cc-3083-4d81-8021-ba3cd5c51498',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9556f0'},body:JSON.stringify({sessionId:'9556f0',runId:'post-fix',hypothesisId:'A',location:'StudyCopilot.tsx:openAsk',message:'openAsk → activate',data:{status},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setAskOpen(true);
    await activate();
  }, [activate, status]);

  const toggleMic = useCallback(async () => {
    if (status === "listening") {
      stopListening();
      return;
    }
    await startListening();
  }, [status, startListening, stopListening]);

  const submitAsk = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const content = draft.trim();
      if (!content) return;
      // #region agent log
      fetch('http://127.0.0.1:7311/ingest/486d08cc-3083-4d81-8021-ba3cd5c51498',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9556f0'},body:JSON.stringify({sessionId:'9556f0',runId:'post-fix',hypothesisId:'A',location:'StudyCopilot.tsx:submitAsk',message:'submitAsk → activate then ask',data:{status,contentLen:content.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      await activate();
      if (ask(content)) {
        setDraft("");
        setAskOpen(false);
      }
    },
    [draft, activate, ask, status],
  );

  return (
    <>
      {/* dock: bottom-left companion (spec §3.3 surface model; Brilliant V11: chat + mic) */}
      <div className="fixed left-3 bottom-20 z-40 flex items-end gap-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-1.5">
          <motion.button
            type="button"
            whileTap={available ? { scale: 0.96 } : undefined}
            transition={{ duration: 0.08 }}
            onClick={() => {
              if (!available || sheetsOpen) return;
              void openAsk();
            }}
            aria-label={available ? "Ask Finn" : "Finn"}
            className="relative"
            style={{
              borderRadius: "var(--radius-action)",
              boxShadow: pulsing ? "0 0 0 6px color-mix(in srgb, var(--brand) 28%, transparent)" : undefined,
              transition: "box-shadow var(--dur-standard) var(--ease-state)",
            }}
          >
            <FinnAvatar expression={expression} size={48} />
          </motion.button>
          {statusLabel && status !== "idle" && (
            <span
              className="px-2 text-[10px] font-bold uppercase tracking-wider"
              style={{
                height: 20,
                lineHeight: "20px",
                borderRadius: 999,
                background: "var(--card)",
                color: status === "error" ? "var(--warning)" : "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}
            >
              {statusLabel}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 items-start">
          <AnimatePresence>
            {bubbleText && (
              <motion.div
                key={bubbleText}
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
                  color: error ? "var(--warning)" : undefined,
                }}
                role="status"
              >
                {bubbleText}
              </motion.div>
            )}
          </AnimatePresence>

          {available && !sheetsOpen && (
            <div className="pointer-events-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void toggleMic()}
                aria-label={status === "listening" ? "Stop listening" : "Talk to Finn"}
                aria-pressed={status === "listening"}
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-action)",
                  background: status === "listening" ? "var(--brand)" : "var(--card)",
                  color: status === "listening" ? "var(--primary-foreground)" : "var(--brand)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-1)",
                  cursor: "pointer",
                }}
              >
                {status === "listening" ? <MicOff size={18} strokeWidth={2.5} /> : <Mic size={18} strokeWidth={2.5} />}
              </button>
              <button
                type="button"
                onClick={() => void openAsk()}
                aria-label="Type a question for Finn"
                aria-expanded={askOpen}
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-action)",
                  background: askOpen ? "var(--brand-soft)" : "var(--card)",
                  color: "var(--brand)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-1)",
                  cursor: "pointer",
                }}
              >
                <MessageCircle size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* live text ask — compact composer above the action bar */}
      <AnimatePresence>
        {askOpen && available && !sheetsOpen && (
          <motion.form
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={(event) => void submitAsk(event)}
            className="fixed inset-x-0 z-[45] mx-auto max-w-[430px] px-4"
            style={{ bottom: 88 }}
            aria-label="Ask Finn a question"
          >
            <div
              className="flex gap-2 p-2"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-2)",
              }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 500))}
                placeholder="Ask a guiding question…"
                maxLength={500}
                className="flex-1 min-w-0 px-3 text-[14px] outline-none"
                style={{
                  height: 40,
                  borderRadius: 12,
                  background: "transparent",
                  color: "var(--foreground)",
                }}
              />
              <button
                type="button"
                onClick={() => setAskOpen(false)}
                className="shrink-0 select-none font-bold text-[14px] px-3"
                style={{
                  minHeight: 40,
                  borderRadius: 12,
                  border: "2px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--brand)",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <PrimaryButton type="submit" disabled={!draft.trim()} className="!w-auto shrink-0 !h-10 !px-4 !text-[14px]">
                Ask
              </PrimaryButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

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
