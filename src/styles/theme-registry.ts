export type PaletteId = "default" | "sunburst" | "glasswing" | "sprout-arcade" | "violet-glass" | "grass-glass";

export const THEMES: { id: PaletteId; name: string; className: string | null; preview: [string, string] }[] = [
  { id: "default", name: "Jade (default)", className: null, preview: ["#087e64", "#f7f8f3"] },
  { id: "sunburst", name: "Sunburst", className: "theme-sunburst", preview: ["#FF9B3E", "#FFF7ED"] },
  { id: "glasswing", name: "Glasswing", className: "theme-glasswing", preview: ["#8B7CF6", "#F4F2FA"] },
  { id: "sprout-arcade", name: "Sprout Arcade", className: "theme-sprout-arcade", preview: ["#0EA55A", "#14171F"] },
  { id: "violet-glass", name: "Violet Glass", className: "theme-violet-glass", preview: ["#6B3FD6", "#F5F2FF"] },
  { id: "grass-glass", name: "Grass Glass", className: "theme-grass-glass", preview: ["#3FA382", "#EBF5EE"] },
];

export function applyPaletteClass(paletteId: PaletteId) {
  const root = document.documentElement;
  THEMES.forEach((t) => { if (t.className) root.classList.remove(t.className); });
  const theme = THEMES.find((t) => t.id === paletteId);
  if (theme?.className) root.classList.add(theme.className);
}