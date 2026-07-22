/* Single gate for all motion: collapses when the OS asks for reduced motion
   OR the in-app reduceMotion pref is on. Subscribes to the store narrowly so
   primitives don't re-render on unrelated state changes. */

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { getState, subscribe } from "../stores/store";

export function useMotionPrefs(): { collapse: boolean } {
  const system = useReducedMotion() ?? false;
  const pref = useSyncExternalStore(subscribe, () => getState().prefs.reduceMotion);
  return { collapse: system || pref };
}
