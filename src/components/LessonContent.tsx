import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Volume2, Check } from "lucide-react";
import { palette, storySlides, storyChat, storyChoice } from "./data";
import { ChunkyButton, Mascot } from "./Shell";

// Swipe-through teaching slides ("Short, bite-sized lessons that work")
export function LessonContent({ onExit, onDone }: { onExit: () => void; onDone: () => void }) {
  const [i, setI] = useState(0);
  const slide = storySlides[i];
  const last = i === storySlides.length - 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4" style={{ background: palette.green }}>
        <button onClick={onExit}>
          <X size={24} color="#fff" strokeWidth={3} />
        </button>
        <span style={{ fontWeight: 800, color: "#fff", fontSize: 18 }}>Stocks</span>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <h1 style={{ fontWeight: 900, fontSize: 26, color: palette.text, lineHeight: 1.2 }}>{slide.title}</h1>
            <p style={{ fontSize: 17, color: palette.subtext, marginTop: 18, lineHeight: 1.6 }}>{slide.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-6 pt-3">
        <div className="flex items-center justify-center gap-2 mb-5">
          {storySlides.map((_, s) => (
            <div
              key={s}
              className="rounded-full transition-all"
              style={{
                width: s === i ? 22 : 8,
                height: 8,
                background: s <= i ? palette.green : palette.border,
              }}
            />
          ))}
        </div>
        <ChunkyButton onClick={() => (last ? onDone() : setI(i + 1))}>
          <span className="inline-flex items-center gap-2 justify-center">
            {last ? "Start Quiz" : "Next"} <ArrowRight size={18} strokeWidth={3} />
          </span>
        </ChunkyButton>
      </div>
    </div>
  );
}

// Story lesson: dialogue bubbles + an image/choice question
export function StoryLesson({
  hearts,
  onLoseHeart,
  onExit,
  onDone,
}: {
  hearts: number;
  onLoseHeart: () => void;
  onExit: () => void;
  onDone: () => void;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const picked = storyChoice.options.find((o) => o.id === choice);
  const correct = picked?.correct;

  const handleCheck = () => {
    setChecked(true);
    if (!correct) onLoseHeart();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={onExit}>
          <X size={26} color={palette.subtext} strokeWidth={3} />
        </button>
        <div className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: palette.border }}>
          <div className="h-full rounded-full" style={{ background: palette.green, width: checked ? "100%" : "70%" }} />
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 18 }}>❤️</span>
          <span style={{ fontWeight: 800, color: palette.red }}>{hearts}</span>
        </div>
      </div>

      <div className="flex-1 px-5 py-3 overflow-y-auto flex flex-col gap-3">
        {storyChat.map((line, idx) => (
          <div key={idx} className={`flex items-end gap-2 ${line.speaker === "you" ? "flex-row-reverse" : ""}`}>
            <Mascot size={38} mood={line.speaker === "finn" ? "🦝" : "🧑"} />
            <div
              className="rounded-2xl px-4 py-3 max-w-[78%] flex items-start gap-2"
              style={{
                background: palette.card,
                border: `2px solid ${line.speaker === "you" ? palette.blue : palette.border}`,
              }}
            >
              <Volume2 size={16} color={palette.blue} className="mt-0.5 shrink-0" />
              <span style={{ color: palette.text, fontSize: 15, lineHeight: 1.4 }}>{line.text}</span>
            </div>
          </div>
        ))}

        <p style={{ fontWeight: 900, fontSize: 19, color: palette.text, marginTop: 10 }}>{storyChoice.prompt}</p>
        <div className="grid grid-cols-2 gap-3">
          {storyChoice.options.map((o) => {
            const sel = choice === o.id;
            let border = palette.border;
            if (checked && o.correct) border = palette.green;
            else if (checked && sel && !o.correct) border = palette.red;
            else if (sel) border = palette.blue;
            return (
              <button
                key={o.id}
                onClick={() => !checked && setChoice(o.id)}
                className="rounded-2xl p-4 flex flex-col items-center gap-2"
                style={{ background: palette.card, border: `3px solid ${border}` }}
              >
                <span style={{ fontSize: 48 }}>{o.emoji}</span>
                <span style={{ fontWeight: 800, color: palette.text, fontSize: 15 }}>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="px-5 py-4"
        style={{
          background: checked ? (correct ? "rgba(88,204,2,0.12)" : "rgba(255,75,75,0.10)") : "transparent",
          borderTop: checked ? `2px solid ${correct ? "rgba(88,204,2,0.3)" : "rgba(255,75,75,0.3)"}` : "none",
        }}
      >
        {checked && (
          <div className="flex items-center gap-2 mb-3">
            <Check size={20} color={correct ? palette.green : palette.red} strokeWidth={3} />
            <span style={{ fontWeight: 800, color: correct ? palette.greenText : palette.red, fontSize: 15 }}>
              {correct ? "Nicely done!" : storyChoice.explanation}
            </span>
          </div>
        )}
        {checked ? (
          <ChunkyButton onClick={onDone}>Continue</ChunkyButton>
        ) : (
          <ChunkyButton onClick={handleCheck} disabled={choice === null}>
            Check
          </ChunkyButton>
        )}
      </div>
    </div>
  );
}
