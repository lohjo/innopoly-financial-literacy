import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link2 } from "lucide-react";
import type { MatchParams } from "../../features/learning-episode/types";
import { spring, useMotionPrefs } from "../../motion";

/** Tap a left card, then a right card, to form a pair. Tap a pair again to clear. */
export function MatchCanvas({
  params,
  pairs,
  onChange,
  disabled = false,
}: {
  params: MatchParams;
  pairs: Record<string, string>;
  onChange: (pairs: Record<string, string>) => void;
  disabled?: boolean;
}) {
  const { collapse } = useMotionPrefs();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const selectLeft = (id: string) => {
    if (disabled) return;
    if (pairs[id]) {
      const next = { ...pairs };
      delete next[id];
      onChange(next);
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft(id);
  };

  const selectRight = (id: string) => {
    if (disabled || !selectedLeft) return;
    const owner = Object.entries(pairs).find(([, r]) => r === id)?.[0];
    if (owner !== undefined && owner !== selectedLeft) return;
    onChange({ ...pairs, [selectedLeft]: id });
    setSelectedLeft(null);
  };

  const pairList = Object.entries(pairs);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
        Tap left, then right — tap a paired left card to undo
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2" role="list" aria-label="Causes">
          {params.left.map((item) => {
            const paired = Boolean(pairs[item.id]);
            const active = selectedLeft === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="listitem"
                disabled={disabled}
                onClick={() => selectLeft(item.id)}
                className="text-left text-[13px] px-3 py-3 font-bold"
                style={{
                  borderRadius: "var(--radius-action)",
                  border: `2px solid ${active ? "var(--brand)" : paired ? "var(--success)" : "var(--border)"}`,
                  background: active ? "var(--brand-soft)" : paired ? "color-mix(in srgb, var(--success) 10%, transparent)" : "var(--card)",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2" role="list" aria-label="Outcomes">
          {params.right.map((item) => {
            const owner = Object.entries(pairs).find(([, r]) => r === item.id)?.[0];
            const taken = owner !== undefined;
            const activeTarget = Boolean(selectedLeft) && (!taken || owner === selectedLeft);
            return (
              <button
                key={item.id}
                type="button"
                role="listitem"
                disabled={disabled || !selectedLeft || (taken && owner !== selectedLeft)}
                onClick={() => selectRight(item.id)}
                className="text-left text-[13px] px-3 py-3 font-bold"
                style={{
                  borderRadius: "var(--radius-action)",
                  border: `2px solid ${taken ? "var(--success)" : activeTarget ? "var(--brand)" : "var(--border)"}`,
                  background: taken
                    ? "color-mix(in srgb, var(--success) 10%, transparent)"
                    : activeTarget
                      ? "var(--brand-soft)"
                      : "var(--card)",
                  opacity: selectedLeft && taken && owner !== selectedLeft ? 0.45 : 1,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {pairList.length > 0 && (
          <motion.div
            initial={collapse ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring.chip}
            className="flex flex-col gap-1.5"
            aria-live="polite"
          >
            {pairList.map(([leftId, rightId]) => {
              const left = params.left.find((l) => l.id === leftId)?.label ?? leftId;
              const right = params.right.find((r) => r.id === rightId)?.label ?? rightId;
              return (
                <div
                  key={leftId}
                  className="flex items-center gap-2 text-[12px] px-3 py-2"
                  style={{
                    borderRadius: 12,
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Link2 size={14} style={{ color: "var(--brand)" }} aria-hidden />
                  <span className="font-bold truncate">{left}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>→</span>
                  <span className="truncate" style={{ color: "var(--muted-foreground)" }}>
                    {right}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
