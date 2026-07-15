import { motion } from "motion/react";
import { Search } from "lucide-react";
import { palette, categories, units, Unit } from "./data";

function CategoryChip({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 w-[74px]">
      <div
        className="flex items-center justify-center rounded-2xl w-[64px] h-[64px]"
        style={{ background: palette.cardAlt, border: `2px solid ${color}`, fontSize: 30 }}
      >
        {emoji}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: palette.subtext, textAlign: "center", lineHeight: 1.2 }}>
        {label}
      </span>
    </div>
  );
}

function UnitRow({ unit, onOpen }: { unit: Unit; onOpen: (u: Unit) => void }) {
  const locked = unit.progress === 0;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen(unit)}
      className="flex items-center gap-3 w-full rounded-2xl px-3 py-3 text-left"
      style={{
        background: locked ? palette.card : "rgba(88,204,2,0.10)",
        border: `2px solid ${locked ? palette.border : "rgba(88,204,2,0.4)"}`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full shrink-0 w-[44px] h-[44px]"
        style={{ background: palette.cardAlt, border: `2px solid ${unit.color}`, fontSize: 22 }}
      >
        {unit.emoji}
      </div>
      <span className="flex-1" style={{ fontWeight: 800, fontSize: 16, color: locked ? palette.subtext : palette.text }}>
        {unit.title}
      </span>
      <span style={{ fontWeight: 800, fontSize: 15, color: locked ? palette.subtext : palette.greenText }}>
        {unit.progress}%
      </span>
    </motion.button>
  );
}

export function ExploreScreen({ onOpenUnit }: { onOpenUnit: (u: Unit) => void }) {
  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <div className="flex items-center justify-between">
        <h2 style={{ fontWeight: 900, fontSize: 26, color: palette.text }}>Explore</h2>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: palette.green }}
        >
          <Search size={16} color="#fff" strokeWidth={3} />
          <span style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>Search</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1" style={{ scrollbarWidth: "none" }}>
        {categories.map((c) => (
          <CategoryChip key={c.id} {...c} />
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {units.map((u) => (
          <UnitRow key={u.id} unit={u} onOpen={onOpenUnit} />
        ))}
      </div>
    </div>
  );
}
