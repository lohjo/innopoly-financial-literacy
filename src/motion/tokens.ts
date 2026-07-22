/* Motion tokens — canonical motion scale (plan 001 §13.1). Mirrors the CSS
   custom properties in src/styles/theme.css; Motion needs numeric values, so
   this file is the single source of truth. Keep both in sync. */

export const dur = {
  /** tap compress, toggles (spec: 80–100ms) */
  micro: 0.09,
  /** card lift (spec: 220ms) */
  hover: 0.22,
  /** sheet / card enter (spec: 350ms) */
  card: 0.35,
  /** screen change (spec: 500ms, max y 20–24px) */
  page: 0.5,
  /** XP flight, lesson complete (spec: ≤800ms) */
  celebrate: 0.8,
} as const;

export const ease = {
  /** --ease-enter */
  enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** --ease-exit */
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  /** --ease-state */
  state: [0.2, 0, 0, 1] as [number, number, number, number],
} as const;

export const spring = {
  /** button press spring-back */
  tap: { type: "spring", stiffness: 600, damping: 35 } as const,
  /** XP chip flight landing */
  chip: { type: "spring", stiffness: 380, damping: 26 } as const,
};
