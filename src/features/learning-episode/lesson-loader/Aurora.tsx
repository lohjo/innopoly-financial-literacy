import { motion } from "motion/react";
import { PALETTE } from "./types";

/**
 * Soft solid color fields behind the card (no blur bloom / aurora glow).
 */

interface FieldConfig {
  className: string;
  color: string;
  animate: { x?: number[]; y?: number[]; scale?: number[] };
  duration: number;
}

const FIELDS: readonly FieldConfig[] = [
  {
    className: "absolute -left-24 top-24 h-72 w-72 rounded-full",
    color: PALETTE.accentSoft,
    animate: { x: [0, 40, 0], y: [0, 20, 0] },
    duration: 14,
  },
  {
    className: "absolute right-[-80px] top-[-60px] h-80 w-80 rounded-full",
    color: "#D1FAE5",
    animate: { x: [0, -30, 0] },
    duration: 18,
  },
  {
    className: "absolute bottom-[-80px] left-1/3 h-64 w-64 rounded-full",
    color: "#C6F6D5",
    animate: { y: [0, -24, 0] },
    duration: 16,
  },
];

const FIELD_OPACITY = 0.55;

export default function Aurora() {
  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      {FIELDS.map((field, index) => (
        <motion.div
          key={index}
          className={field.className}
          style={{ backgroundColor: field.color, opacity: FIELD_OPACITY }}
          animate={field.animate}
          transition={{
            duration: field.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
