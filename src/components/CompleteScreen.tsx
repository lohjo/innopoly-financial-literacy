import { useEffect } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { palette, leaderboard } from "./data";
import { ChunkyButton } from "./Shell";

export function CompleteScreen({
  bananas,
  gems,
  onHome,
  onContinue,
}: {
  bananas: number;
  gems: number;
  onHome: () => void;
  onContinue: () => void;
}) {
  useEffect(() => {
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.35 }, colors: [palette.green, palette.gold, palette.blue] });
  }, []);

  const you = leaderboard.find((p) => p.you)!;

  return (
    <div className="flex flex-col h-full px-6 py-8 overflow-y-auto">
      <div className="flex items-center justify-center gap-3 mb-4" style={{ fontSize: 42 }}>
        <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>💎</motion.span>
        <motion.span animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} style={{ fontSize: 56 }}>💎</motion.span>
        <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} style={{ opacity: 0.4 }}>💎</motion.span>
      </div>

      <motion.h1
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        style={{ fontWeight: 900, fontSize: 40, color: palette.blue, textAlign: "center" }}
      >
        Wow!
      </motion.h1>
      <p style={{ textAlign: "center", color: palette.subtext, marginTop: 4 }}>You earned</p>

      <div className="flex items-center justify-center gap-6 my-4">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 26 }}>🍌</span>
          <span style={{ fontWeight: 900, fontSize: 24, color: palette.gold }}>+{bananas}</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 26 }}>💎</span>
          <span style={{ fontWeight: 900, fontSize: 24, color: palette.blue }}>+{gems}</span>
        </div>
      </div>

      <div className="mt-2 mb-6">
        <ChunkyButton onClick={onContinue}>Continue</ChunkyButton>
        <button
          onClick={onHome}
          className="w-full mt-3"
          style={{ fontWeight: 800, color: palette.subtext, letterSpacing: 1, textTransform: "uppercase", fontSize: 14 }}
        >
          Back to Home
        </button>
      </div>

      <p style={{ color: palette.subtext, fontSize: 13, marginBottom: 8 }}>Your leaderboard position</p>
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: palette.card, border: `2px solid ${palette.border}` }}
      >
        <span style={{ fontSize: 26 }}>{you.avatar}</span>
        <span className="flex-1" style={{ fontWeight: 800, color: palette.text }}>{you.name}</span>
        <span style={{ fontWeight: 800, color: palette.gold }}>{you.xp} 🍌</span>
      </div>

      <p style={{ color: palette.subtext, fontSize: 13, textAlign: "center", marginTop: 20 }}>
        How did you like this lesson?
      </p>
      <div className="flex items-center justify-center gap-8 mt-3" style={{ fontSize: 34 }}>
        <button className="transition-transform hover:scale-125">😐</button>
        <button className="transition-transform hover:scale-125">🙂</button>
        <button className="transition-transform hover:scale-125">😍</button>
      </div>
    </div>
  );
}
