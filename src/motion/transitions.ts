/* Reusable motion presets. Every one collapses when `collapse` (OS reduced
   motion or in-app pref) is on — the UI state still changes, just without
   travel or repetition. */

import { dur, ease, spring } from "./tokens";

export function pressSpring(collapse: boolean): {
  whileTap?: { scale: number };
  transition: object;
} {
  return collapse
    ? { transition: { duration: 0 } }
    : { whileTap: { scale: 0.96 }, transition: spring.tap };
}

export function hoverLift(collapse: boolean): {
  whileHover?: { y: number; boxShadow: string };
  transition: { duration: number; ease: [number, number, number, number] };
} {
  return collapse
    ? { transition: { duration: 0, ease: ease.state } }
    : {
        whileHover: { y: -2, boxShadow: "0 10px 24px -14px rgba(23, 33, 29, 0.25)" },
        transition: { duration: dur.hover, ease: ease.state },
      };
}

export function cardEnter(collapse: boolean, delay = 0) {
  return collapse
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: dur.card, ease: ease.enter, delay },
      };
}

export function screenEnter(collapse: boolean) {
  return collapse
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: dur.page, ease: ease.enter },
      };
}

/** Soft 2s glow loop for the single "current" affordance on a screen.
    `frames` lets a caller supply its own extruded base shadow so the pulse
    layers onto it instead of the default current-node shadow. */
export function glowPulse(
  collapse: boolean,
  frames?: { rest: string; peak: string },
): {
  animate?: { boxShadow: string[] };
  transition?: { duration: number; repeat: number; repeatType: "mirror"; ease: "easeInOut" };
} {
  if (collapse) return {};
  const rest = frames?.rest ?? "0 5px 0 #d8e0da, 0 10px 18px rgba(23, 33, 29, 0.12), 0 0 0 3px rgba(8, 126, 104, 0.16)";
  const peak = frames?.peak ?? "0 5px 0 #d8e0da, 0 10px 18px rgba(23, 33, 29, 0.12), 0 0 0 9px rgba(8, 126, 104, 0.04)";
  return {
    animate: { boxShadow: [rest, peak] },
    transition: { duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
  };
}

/** Near-still float for hero illustrations (1–3px / 6s). */
export function heroFloat(collapse: boolean): {
  animate?: { y: number[] };
  transition?: { duration: number; repeat: number; ease: "easeInOut" };
} {
  if (collapse) return {};
  return {
    animate: { y: [0, -3, 0] },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  };
}
