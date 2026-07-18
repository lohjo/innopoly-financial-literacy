/* Motion foundation — durations/easings mirror the CSS tokens in src/styles/theme.css.
   Pure values plus one hook; consumed by learning surfaces (CoursePlayer, primitives). */
import { useReducedMotion } from "motion/react";
import { useStore } from "../stores/store";

/** Seconds, matching --dur-instant/fast/standard/deliberate/expressive. */
export const dur = {
  micro: 0.08,
  hover: 0.14,
  card: 0.22,
  page: 0.36,
  celebrate: 0.52,
} as const;

type Bezier = [number, number, number, number];

/** Matching --ease-enter/exit/state. */
export const ease: Record<"enter" | "exit" | "state", Bezier> = {
  enter: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
  state: [0.2, 0, 0, 1],
};

export const spring = {
  chip: { type: "spring", stiffness: 420, damping: 28 },
} as const;

/** Screen-level enter transition; collapses to a plain fade under reduced motion. */
export function screenEnter(collapse: boolean) {
  return {
    initial: collapse ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: dur.card, ease: ease.enter },
  };
}

/** System reduced-motion preference OR the in-app Settings toggle. */
export function useMotionPrefs() {
  const system = useReducedMotion();
  const inApp = useStore((s) => s.prefs.reduceMotion);
  return { collapse: Boolean(system) || inApp };
}
