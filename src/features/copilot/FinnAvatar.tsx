import { motion } from "motion/react";
import { useMotionPrefs } from "../../motion";

export type FinnExpression =
  | "neutral"
  | "attentive"
  | "curious"
  | "thinking"
  | "concerned"
  | "reassuring"
  | "celebrating"
  | "speaking"
  | "listening";

/** Original 2D vector Finn — raccoon, resourceful not wealthy (spec §3.2).
    Expression = eyes + brows + mouth + ear tilt. No coins, no money bags. */
export function FinnAvatar({
  expression = "neutral",
  size = 48,
}: {
  expression?: FinnExpression;
  size?: number;
}) {
  // honors the in-app Settings toggle as well as the OS preference
  const reduce = useMotionPrefs().collapse;
  const e = expression;

  // ear tilt: listening/curious tilt slightly
  const earTilt = e === "listening" || e === "curious" ? 8 : 0;
  // brows
  const browY = e === "curious" || e === "celebrating" ? -2 : e === "concerned" ? 1.5 : 0;
  // eyes: thinking looks aside; celebrating closes happily
  const pupilX = e === "thinking" ? 2.5 : 0;
  const eyesClosed = e === "celebrating";
  // mouth
  const mouth =
    e === "celebrating" || e === "reassuring"
      ? "M 38 62 Q 50 72 62 62" // wide smile
      : e === "concerned"
        ? "M 40 66 Q 50 62 60 66" // slight frown
        : e === "speaking"
          ? "M 42 62 Q 50 70 58 62 Q 50 66 42 62" // open
          : "M 42 64 Q 50 69 58 64"; // soft smile

  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`Finn, ${e}`}
      animate={
        reduce
          ? undefined
          : e === "celebrating"
            ? { y: [0, -8, 0] }
            : { y: [0, -2, 0], scale: [1, 1.015, 1] } // idle breath
      }
      transition={
        reduce
          ? undefined
          : e === "celebrating"
            ? { duration: 0.52, ease: "easeOut" }
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {/* ears */}
      <motion.g animate={{ rotate: earTilt }} style={{ originX: "50%", originY: "60%" }} transition={{ duration: 0.22 }}>
        <path d="M 22 30 L 30 8 L 44 24 Z" fill="#4A5568" />
        <path d="M 78 30 L 70 8 L 56 24 Z" fill="#4A5568" />
        <path d="M 26 27 L 31 14 L 40 24 Z" fill="#2D3748" />
        <path d="M 74 27 L 69 14 L 60 24 Z" fill="#2D3748" />
      </motion.g>
      {/* head */}
      <ellipse cx="50" cy="52" rx="34" ry="32" fill="#6B7A8C" />
      {/* face lighter patch */}
      <ellipse cx="50" cy="58" rx="26" ry="22" fill="#E8EDF2" />
      {/* mask band */}
      <path d="M 16 44 Q 50 34 84 44 L 84 54 Q 66 48 58 50 Q 50 60 42 50 Q 34 48 16 54 Z" fill="#2D3748" />
      {/* eyes within mask */}
      <g>
        <ellipse cx="36" cy="47" rx="7" ry={eyesClosed ? 0.8 : 6.5} fill="#fff" />
        <ellipse cx="64" cy="47" rx="7" ry={eyesClosed ? 0.8 : 6.5} fill="#fff" />
        {!eyesClosed && (
          <>
            <circle cx={36 + pupilX} cy="47.5" r="3" fill="#17211D" />
            <circle cx={64 + pupilX} cy="47.5" r="3" fill="#17211D" />
            <circle cx={37 + pupilX} cy="46.3" r="1" fill="#fff" />
            <circle cx={65 + pupilX} cy="46.3" r="1" fill="#fff" />
          </>
        )}
      </g>
      {/* brows */}
      <g transform={`translate(0 ${browY})`}>
        <path d="M 29 38 Q 36 35 43 38" stroke="#17211D" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 57 38 Q 64 35 71 38" stroke="#17211D" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      {/* snout + nose */}
      <ellipse cx="50" cy="58" rx="8" ry="6" fill="#fff" />
      <ellipse cx="50" cy="56" rx="3.4" ry="2.6" fill="#17211D" />
      {/* mouth */}
      <path d={mouth} stroke="#17211D" strokeWidth="2" fill={e === "speaking" ? "#17211D" : "none"} strokeLinecap="round" />
      {/* cheek stripes */}
      <path d="M 20 58 Q 24 60 22 64" stroke="#4A5568" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 80 58 Q 76 60 78 64" stroke="#4A5568" strokeWidth="2" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}
