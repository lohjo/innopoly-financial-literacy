import { motion } from "motion/react";
import Coin from "./Coin";
import Graph from "./Graph";
import { PALETTE, STAGE_SIZE } from "./types";

/** Solid card chrome — no glass/blur/sheen. */
export default function GlassCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-[380px] overflow-hidden rounded-[28px] border px-8 py-10"
      style={{
        backgroundColor: PALETTE.surface,
        borderColor: PALETTE.accentSoft,
        boxShadow: "0 8px 24px rgba(20, 83, 45, 0.08)",
      }}
    >
      <div className="relative flex flex-col items-center">
        <div className="relative" style={{ width: STAGE_SIZE.width, height: STAGE_SIZE.height }}>
          <Graph />
          <Coin />
        </div>

        <motion.h1
          className="mt-6 text-2xl font-extrabold tracking-tight"
          style={{ color: PALETTE.textDeep }}
          animate={{ opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          Preparing your lesson
        </motion.h1>

        <p className="mt-2 text-sm font-medium" style={{ color: PALETTE.cardGreenDark }}>
          Great investing starts with great decisions.
        </p>
      </div>
    </motion.div>
  );
}
