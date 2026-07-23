import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { Star, Moon } from "lucide-react";

export const CHARACTER_IMAGES = [
  "/characters/character-1.png",
  "/characters/character-2.png",
  "/characters/character-3.png",
  "/characters/character-4.png",
];

/** Pine-style tree — triangular conifer silhouette, narrowing upward. */
export function Tree({ size = 34, tint = "var(--brand)" }: { size?: number; tint?: string }) {
  const w = size;
  const h = size * 1.6;
  return (
    <svg width={w} height={h} viewBox="0 0 40 64" style={{ opacity: 0.9 }}>
      <ellipse cx="20" cy="60" rx="9" ry="2.5" fill="rgba(0,0,0,.14)" />
      <rect x="17" y="48" width="6" height="12" rx="1.5" fill="color-mix(in srgb, var(--foreground) 40%, transparent)" />
      <polygon points="20,10 34,34 6,34" fill={tint} />
      <polygon points="20,20 31,42 9,42" fill={tint} opacity="0.92" />
      <polygon points="20,30 28,48 12,48" fill={tint} opacity="0.85" />
    </svg>
  );
}

/** Scattered decorative scenery — trees, stars, and moons placed on a
    jittered grid so nothing overlaps. Purely visual, seeded per chapter so
    it's stable across re-renders instead of jumping around. */
export function Scenery({ seed, height, width }: { seed: number; height: number; width: number }) {
  const items = useMemo(() => {
    const rand = (n: number) => {
      const x = Math.sin(seed * 999 + n * 37.7) * 10000;
      return x - Math.floor(x);
    };
    const rows = 4;
    const cols = 3;
    const result: { left: number; top: number; size: number; kind: number; opacity: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const size = 14 + rand(index + 20) * 16;
        const kind = index % 3; // 0 = tree, 1 = star, 2 = moon
        const leftPercent = (c / cols) * 80 + 10 + (rand(index + 5) * 12 - 6);
        const topPx = (r / rows) * Math.max(1, height - 60) + 30 + (rand(index + 15) * 20 - 10);
        result.push({
          left: Math.max(5, Math.min(85, leftPercent)),
          top: topPx,
          size,
          kind,
          opacity: 0.25 + rand(index + 40) * 0.25,
        });
      }
    }
    return result;
  }, [seed, height, width]);

  return (
    <>
      {items.map((it, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: `${it.left}%`, top: it.top, opacity: it.opacity }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: it.opacity, scale: 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 20, delay: 0.1 + i * 0.02 }}
        >
          {it.kind === 0 && <Tree size={it.size} tint={i % 2 === 0 ? "var(--brand)" : "var(--success)"} />}
          {it.kind === 1 && <Star size={it.size} color="var(--card)" fill="var(--card)" />}
          {it.kind === 2 && <Moon size={it.size} color="var(--card)" fill="var(--card)" />}
        </motion.div>
      ))}
    </>
  );
}

const CYLINDER_DEPTH = 8;

export function CylinderNode({
  size,
  colorTop,
  children,
}: {
  size: number;
  colorTop: string;
  colorBase?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: colorTop,
        boxShadow: "0 4px 10px -3px rgba(0,0,0,.2)",
        border: "3px solid var(--card)",
      }}
    >
      {children}
    </div>
  );
}

let rippleIdCounter = 0;
export function TouchRipple({ children, color = "rgba(255,255,255,.55)" }: { children: React.ReactNode; color?: string }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const spawn = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y)) * 2;
    const id = ++rippleIdCounter;
    setRipples((r) => [...r, { id, x, y, size }]);
  };
  return (
    <div className="relative overflow-hidden" style={{ borderRadius: "inherit" }} onPointerDown={spawn}>
      {children}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute rounded-full pointer-events-none"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size, marginLeft: -r.size / 2, marginTop: -r.size / 2, background: color }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            onAnimationComplete={() => setRipples((rs) => rs.filter((x) => x.id !== r.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}