import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Info } from "lucide-react";
import { palette, quizQuestions } from "./data";
import { ChunkyButton } from "./Shell";

export function QuizScreen({
  hearts,
  onLoseHeart,
  onExit,
  onComplete,
}: {
  hearts: number;
  onLoseHeart: () => void;
  onExit: () => void;
  onComplete: (correct: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showExplain, setShowExplain] = useState(false);

  const q = quizQuestions[idx];
  const isCorrect = selected === q.answer;
  const progress = ((idx + (checked ? 1 : 0)) / quizQuestions.length) * 100;

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
    else onLoseHeart();
  };

  const handleContinue = () => {
    if (idx + 1 >= quizQuestions.length) {
      onComplete(correctCount);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setChecked(false);
    setShowExplain(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header: close + progress + hearts */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={onExit}>
          <X size={26} color={palette.subtext} strokeWidth={3} />
        </button>
        <div className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: palette.border }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: palette.green }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 18 }}>❤️</span>
          <span style={{ fontWeight: 800, color: palette.red }}>{hearts}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pt-2 overflow-y-auto">
        <p style={{ fontWeight: 900, fontSize: 24, color: palette.text }}>Question {idx + 1}</p>
        <p style={{ fontSize: 18, color: palette.subtext, marginTop: 6, marginBottom: 22, lineHeight: 1.4 }}>
          {q.prompt}
        </p>

        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => {
            const chosen = selected === i;
            let border = palette.border;
            let bg = palette.card;
            let text = palette.text;
            if (checked) {
              if (i === q.answer) {
                border = palette.green;
                bg = "rgba(88,204,2,0.15)";
                text = palette.greenText;
              } else if (chosen) {
                border = palette.red;
                bg = "rgba(255,75,75,0.12)";
                text = palette.red;
              }
            } else if (chosen) {
              border = palette.blue;
              bg = "rgba(28,176,246,0.12)";
              text = palette.blue;
            }
            return (
              <motion.button
                key={i}
                whileTap={checked ? undefined : { scale: 0.98 }}
                onClick={() => !checked && setSelected(i)}
                className="flex items-center justify-between rounded-2xl px-4 py-4 text-left"
                style={{ background: bg, border: `2px solid ${border}` }}
              >
                <span style={{ fontWeight: 700, fontSize: 16, color: text }}>{opt}</span>
                {checked && i === q.answer && <Check size={20} color={palette.green} strokeWidth={3} />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer feedback */}
      <div
        style={{
          background: checked ? (isCorrect ? "rgba(88,204,2,0.12)" : "rgba(255,75,75,0.10)") : "transparent",
          borderTop: checked ? `2px solid ${isCorrect ? "rgba(88,204,2,0.3)" : "rgba(255,75,75,0.3)"}` : "none",
        }}
        className="px-5 py-4"
      >
        <AnimatePresence>
          {checked && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <Check size={22} color={palette.green} strokeWidth={3} />
                  ) : (
                    <X size={22} color={palette.red} strokeWidth={3} />
                  )}
                  <span style={{ fontWeight: 900, fontSize: 18, color: isCorrect ? palette.greenText : palette.red }}>
                    {isCorrect ? "Nicely done!" : "Not quite"}
                  </span>
                </div>
                <button
                  onClick={() => setShowExplain((s) => !s)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ background: palette.blue }}
                >
                  <Info size={15} color="#fff" strokeWidth={3} />
                  <span style={{ fontWeight: 800, fontSize: 12, color: "#fff" }}>Explanation</span>
                </button>
              </div>
              <AnimatePresence>
                {showExplain && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ color: palette.subtext, fontSize: 14, marginTop: 8, lineHeight: 1.4 }}
                  >
                    {q.explanation}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {checked ? (
          <ChunkyButton
            onClick={handleContinue}
            color={isCorrect ? palette.green : palette.red}
            shadow={isCorrect ? palette.greenDark : "#cc3a3a"}
          >
            Continue
          </ChunkyButton>
        ) : (
          <ChunkyButton onClick={handleCheck} disabled={selected === null}>
            Check
          </ChunkyButton>
        )}
      </div>
    </div>
  );
}
