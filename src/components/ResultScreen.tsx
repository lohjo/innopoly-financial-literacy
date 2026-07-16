import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { Flame, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";
import { palette, buildRecap, challengeById, Recap } from "./data";
import { PrimaryButton, SecondaryButton, Card } from "./Shell";

type ResultState = {
  correct: number;
  total: number;
  points: number;
  missed: string[];
  title: string;
};

export function ResultScreen({
  streak,
  onInvite,
}: {
  streak: number;
  onInvite: () => void;
}) {
  const nav = useNavigate();
  const { id = "" } = useParams();
  const loc = useLocation();
  const reduce = useReducedMotion();

  const state = loc.state as ResultState | null;
  // Direct navigation (no state) => deterministic fallback with identical geometry.
  const fallback = !state;
  const title = state?.title ?? challengeById(id)?.title ?? "this challenge";
  const correct = state?.correct ?? 4;
  const total = state?.total ?? 6;
  const points = state?.points ?? 40;
  const missed = state?.missed ?? ["utilization ratio", "minimum-payment trap"];

  // Reveal timeline: hidden before first paint -> points -> streak -> recap (audit R23/R1)
  const [stage, setStage] = useState(0); // 0 hidden, 1 points, 2 streak, 3 recap-skeleton, 4 recap-ready
  const [recap, setRecap] = useState<Recap | null>(null);

  useEffect(() => {
    const built = buildRecap({ title, correct, total, points, missedConcepts: missed, fallback });
    if (reduce) {
      setRecap(built);
      setStage(4);
      return;
    }
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.3 }, colors: [palette.green, palette.gold, palette.blue] });
    const t1 = setTimeout(() => setStage(1), 60);
    const t2 = setTimeout(() => setStage(2), 500);
    const t3 = setTimeout(() => setStage(3), 950);
    const t4 = setTimeout(() => {
      setRecap(built);
      setStage(4);
    }, 1700);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
      {/* Celebration */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.7 }}
          animate={stage >= 1 ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          style={{ fontSize: 30, fontWeight: 900, color: palette.green }}
        >
          {correct === total ? "Perfect!" : "Challenge complete!"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={stage >= 1 ? { opacity: 1, y: 0 } : {}}
          className="flex items-center justify-center gap-6 mt-4"
        >
          <div className="flex flex-col items-center">
            <span style={{ fontSize: 28 }} aria-hidden>⭐</span>
            <span className="tnum" style={{ fontWeight: 900, fontSize: 22, color: palette.gold }}>
              +{points}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: palette.muted, textTransform: "uppercase" }}>Points</span>
          </div>
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={stage >= 2 ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
          >
            <Flame size={30} color={palette.orange} fill={palette.orange} strokeWidth={1.5} />
            <span className="tnum" style={{ fontWeight: 900, fontSize: 22, color: palette.orange }}>
              {streak}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: palette.muted, textTransform: "uppercase" }}>Day streak</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Strict four-field recap card */}
      <div className="mt-6 flex-1">
        <RecapCard recap={stage >= 4 ? recap : null} skeleton={stage === 3 || (stage < 4 && !reduce)} reduce={!!reduce} />
      </div>

      <div className="flex flex-col gap-3 mt-6">
        <PrimaryButton onClick={() => nav("/leaderboard", { state: { justEarned: points } })}>
          See leaderboard
        </PrimaryButton>
        <SecondaryButton onClick={onInvite}>Invite a friend</SecondaryButton>
        <button
          onClick={() => nav("/learn")}
          style={{ color: palette.muted, fontWeight: 800, fontSize: 13, textTransform: "uppercase", minHeight: 44 }}
        >
          Back to Learn
        </button>
      </div>
    </div>
  );
}

const FIELDS: { key: keyof Recap; label: string }[] = [
  { key: "whatYouDid", label: "What you did" },
  { key: "score", label: "Score" },
  { key: "nextStep", label: "Next step" },
  { key: "trackPosition", label: "Track position" },
];

function RecapCard({ recap, skeleton, reduce }: { recap: Recap | null; skeleton: boolean; reduce: boolean }) {
  // Identical geometry across loading / ready / fallback states (audit R8/R9 for summaries).
  return (
    <Card style={{ padding: 18 }}>
      <div className="flex items-center gap-2 mb-4">
        <span
          className="flex items-center justify-center rounded-full"
          style={{ width: 26, height: 26, background: palette.blueSoft, fontSize: 14 }}
          aria-hidden
        >
          🦝
        </span>
        <span style={{ fontWeight: 900, fontSize: 15 }}>Your recap</span>
        {recap?.fallback && (
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: palette.muted, textTransform: "uppercase" }}>
            Offline summary
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {FIELDS.map((f, i) => (
          <div key={f.key}>
            <p style={{ fontSize: 11, fontWeight: 900, color: palette.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {f.label}
            </p>
            {recap ? (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : i * 0.07, duration: 0.2 }}
                style={{ fontSize: 15, fontWeight: 600, color: palette.text, lineHeight: 1.45 }}
                className={f.key === "score" ? "tnum" : ""}
              >
                {recap[f.key] as string}
              </motion.p>
            ) : (
              <SkeletonLines count={f.key === "trackPosition" ? 2 : 1} />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-5 pt-4" style={{ borderTop: `2px solid ${palette.hairline}` }}>
        <ShieldCheck size={15} color={palette.muted} />
        <span style={{ fontSize: 12, color: palette.muted, fontWeight: 600 }}>
          {recap ? recap.compliance : "Checking for accuracy…"}
        </span>
      </div>
    </Card>
  );
}

function SkeletonLines({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          style={{ height: 14, borderRadius: 7, background: palette.hairline, width: i === count - 1 ? "70%" : "100%" }}
        />
      ))}
    </div>
  );
}
