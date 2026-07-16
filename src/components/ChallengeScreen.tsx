import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, AlertCircle, Flame, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { palette, challengeById } from "./data";
import { PrimaryButton } from "./Shell";

export function ChallengeScreen({
  streak,
  onComplete,
}: {
  streak: number;
  onComplete: (points: number) => void;
}) {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const challenge = challengeById(id);

  const [phase, setPhase] = useState<"intro" | "quiz">("intro");
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);

  if (!challenge) {
    return (
      <div className="p-6">
        <p>Challenge not found.</p>
        <button onClick={() => nav("/learn")} style={{ color: palette.blue, fontWeight: 800 }}>Back to Learn</button>
      </div>
    );
  }

  const total = challenge.questions.length;
  const q = challenge.questions[qi];
  const isCorrect = selected === q?.answer;
  const progressPct = phase === "intro" ? 0 : ((qi + (checked ? 1 : 0)) / total) * 100;

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
    else setMissed((m) => [...m, q.concept]);
  };

  const cont = () => {
    if (qi + 1 >= total) {
      // correctCount already includes this question (updated in check()).
      // Points: 10 per correct -> 40 for 4/6 (demo target).
      const points = correctCount * 10;
      onComplete(points);
      nav(`/result/${id}`, {
        state: { correct: correctCount, total, points, missed, title: challenge.title },
      });
      return;
    }
    setQi((i) => i + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header: close + progress + streak (visible during challenge) */}
      <div className="flex items-center gap-3 px-4" style={{ height: 56 }}>
        <button onClick={() => nav("/learn")} aria-label="Exit challenge" style={{ minHeight: 44, minWidth: 44 }}>
          <X size={24} color={palette.muted} strokeWidth={3} />
        </button>
        <div className="flex-1 rounded-full overflow-hidden" style={{ height: 14, background: palette.hairline }}>
          <motion.div
            style={{ height: "100%", borderRadius: 999, background: palette.green }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="flex items-center gap-1" aria-label="streak">
          <Flame size={20} color={palette.orange} fill={palette.orange} strokeWidth={1.5} />
          <span className="tnum" style={{ fontWeight: 800, color: palette.orange }}>{streak}</span>
        </div>
      </div>

      {phase === "intro" ? (
        <IntroBody challenge={challenge} onStart={() => setPhase("quiz")} />
      ) : (
        <>
          <div className="flex-1 px-5 pt-2 overflow-y-auto">
            <p style={{ fontWeight: 900, fontSize: 13, color: palette.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Question <span className="tnum">{qi + 1}</span> of <span className="tnum">{total}</span>
            </p>
            <h1 style={{ fontWeight: 800, fontSize: 22, marginTop: 8, marginBottom: 22, lineHeight: 1.3 }}>{q.prompt}</h1>

            <div className="flex flex-col gap-3">
              {q.options.map((opt, i) => {
                const chosen = selected === i;
                let border = palette.hairline;
                let bg = "#fff";
                let text = palette.text;
                if (checked) {
                  if (i === q.answer) { border = palette.green; bg = palette.greenSoft; text = palette.greenShadow; }
                  else if (chosen) { border = palette.red; bg = palette.redSoft; text = palette.red; }
                } else if (chosen) { border = palette.blue; bg = palette.blueSoft; text = palette.blueShadow; }
                return (
                  <motion.button
                    key={i}
                    whileTap={checked ? undefined : { scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => !checked && setSelected(i)}
                    className="flex items-center justify-between text-left"
                    style={{ minHeight: 56, borderRadius: 14, border: `2px solid ${border}`, background: bg, padding: "0 16px" }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 16, color: text }}>{opt}</span>
                    {checked && i === q.answer && <Check size={20} color={palette.green} strokeWidth={3} />}
                    {checked && chosen && i !== q.answer && <X size={20} color={palette.red} strokeWidth={3} />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Sticky feedback tray */}
          <FeedbackTray
            checked={checked}
            correct={isCorrect}
            explanation={q.explanation}
            selected={selected}
            onCheck={check}
            onContinue={cont}
            last={qi + 1 >= total}
          />
        </>
      )}
    </div>
  );
}

function IntroBody({ challenge, onStart }: { challenge: ReturnType<typeof challengeById> & object; onStart: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 py-4">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <span style={{ fontSize: 72 }} aria-hidden>🦝</span>
        <h1 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2 }}>{challenge.title}</h1>
        <div className="flex items-center gap-1.5" style={{ color: palette.muted, fontWeight: 700 }}>
          <Clock size={15} strokeWidth={2.5} />
          <span className="tnum">{challenge.minutes} min</span>
          <span>·</span>
          <span className="tnum">{challenge.questions.length} questions</span>
        </div>
        <p style={{ color: palette.muted, fontSize: 16, lineHeight: 1.5, maxWidth: 320 }}>{challenge.intro}</p>
      </div>
      <PrimaryButton onClick={onStart}>Start challenge</PrimaryButton>
    </div>
  );
}

function FeedbackTray({
  checked,
  correct,
  explanation,
  selected,
  onCheck,
  onContinue,
  last,
}: {
  checked: boolean;
  correct: boolean;
  explanation: string;
  selected: number | null;
  onCheck: () => void;
  onContinue: () => void;
  last: boolean;
}) {
  return (
    <div
      className="px-5 py-4"
      style={{
        background: checked ? (correct ? palette.greenSoft : palette.redSoft) : "#fff",
        borderTop: `2px solid ${checked ? (correct ? "#a6e772" : "#ffb3b3") : palette.hairline}`,
      }}
    >
      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <motion.span
                initial={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                className="inline-flex"
              >
                {correct ? (
                  <Check size={22} color={palette.greenShadow} strokeWidth={3} />
                ) : (
                  <AlertCircle size={22} color={palette.red} strokeWidth={3} />
                )}
              </motion.span>
              <span style={{ fontWeight: 900, fontSize: 17, color: correct ? palette.greenShadow : palette.red }}>
                {correct ? "Nicely done!" : "Not quite"}
              </span>
            </div>
            <p style={{ color: correct ? "#3d7a00" : "#a33", fontSize: 14, lineHeight: 1.4 }}>{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {checked ? (
        <PrimaryButton
          onClick={onContinue}
          color={correct ? palette.green : palette.red}
          shadow={correct ? palette.greenShadow : "#cc3a3a"}
        >
          {last ? "See results" : "Continue"}
        </PrimaryButton>
      ) : (
        <PrimaryButton onClick={onCheck} disabled={selected === null}>
          Check
        </PrimaryButton>
      )}
    </div>
  );
}
