import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { DistributeParams } from "../../features/learning-episode/types";
import { amountInBucket, allPlaced, keptAfterBreak, totalAmount } from "./sim/distribute";
import { Num } from "../primitives";
import { spring, useMotionPrefs } from "../../motion";

const moneyFmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** Tap a pool chip (or select), then a basket — multi-bucket distribute for eggs / cash. */
export function DistributeCanvas({
  params,
  placement,
  onChange,
  disabled = false,
  showShock = false,
}: {
  params: DistributeParams;
  placement: Record<string, string>;
  onChange: (placement: Record<string, string>) => void;
  disabled?: boolean;
  /** after a successful Check with min-kept targets, reveal the break */
  showShock?: boolean;
}) {
  const { collapse } = useMotionPrefs();
  const [selected, setSelected] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const placedOnce = useRef(false);
  const [demoPulse, setDemoPulse] = useState(!collapse);

  const pool = params.chips.filter((c) => !placement[c.id]);
  const placedCount = params.chips.length - pool.length;
  const isMoney = params.theme === "money";
  const total = totalAmount(params);

  useEffect(() => {
    if (collapse || placedCount > 0) {
      setDemoPulse(false);
      return;
    }
    const t = setTimeout(() => setDemoPulse(false), 2200);
    return () => clearTimeout(t);
  }, [collapse, placedCount]);

  const moveTo = (chipId: string, bucketId: string) => {
    if (disabled) return;
    const next = { ...placement, [chipId]: bucketId };
    onChange(next);
    setSelected(null);
    if (!placedOnce.current) {
      placedOnce.current = true;
      if (params.firstPlaceNudge) setNudge(true);
    }
  };

  const breakId = params.targets.mode === "min-kept" ? params.targets.breakBucketId : null;
  const shockStats =
    showShock && breakId ? keptAfterBreak(params, placement, breakId) : null;

  return (
    <div className="flex flex-col gap-4">
      {pool.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            {isMoney
              ? `Tap a bill, then an investment — ${moneyFmt(total)} to place`
              : `Tap an egg, then a basket — ${pool.length} left in the pool`}
          </p>
          <div className="flex flex-wrap gap-2" role="list">
            {pool.map((chip, i) => {
              const isSelected = selected === chip.id;
              const demo = demoPulse && i === 0;
              return (
                <motion.button
                  key={chip.id}
                  type="button"
                  role="listitem"
                  disabled={disabled}
                  animate={demo && !collapse ? { y: [0, -6, 0], scale: [1, 1.06, 1] } : undefined}
                  transition={demo ? { duration: 0.9, repeat: 1 } : spring.chip}
                  onClick={() => {
                    if (disabled) return;
                    setSelected(isSelected ? null : chip.id);
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${chip.label}. ${isSelected ? "Selected" : "Tap to select"}, then tap a basket.`}
                  className="px-3 py-2 text-[13px] font-bold"
                  style={{
                    borderRadius: "var(--radius-action)",
                    border: `2px solid ${isSelected ? "var(--brand)" : "var(--border)"}`,
                    background: isSelected ? "var(--brand-soft)" : "var(--card)",
                    boxShadow: demo ? "var(--shadow-1)" : undefined,
                  }}
                >
                  {isMoney ? chip.label : "🥚"}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {nudge && params.firstPlaceNudge && placedCount > 0 && placedCount < params.chips.length && (
          <motion.p
            initial={collapse ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[14px] font-bold"
            style={{ color: "var(--brand-hover)" }}
            role="status"
          >
            ✨ {params.firstPlaceNudge}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        {params.buckets.map((bucket) => {
          const chips = params.chips.filter((c) => placement[c.id] === bucket.id);
          const amt = amountInBucket(params, placement, bucket.id);
          const isBroken = showShock && breakId === bucket.id;
          const emoji = isMoney ? (isBroken ? "📉" : "📈") : isBroken ? "💥" : "🧺";
          return (
            <motion.button
              key={bucket.id}
              type="button"
              disabled={disabled && !showShock}
              animate={
                isBroken && !collapse
                  ? { x: [0, -4, 4, -3, 3, 0], rotate: [0, -2, 2, -1, 1, 0] }
                  : undefined
              }
              transition={isBroken ? { duration: 0.55 } : undefined}
              onClick={() => {
                if (disabled || showShock) return;
                if (selected) {
                  moveTo(selected, bucket.id);
                  return;
                }
                if (pool[0]) moveTo(pool[0].id, bucket.id);
              }}
              aria-label={`${bucket.label}. ${isMoney ? moneyFmt(amt) : `${chips.length} eggs`}. Tap to place selected unit.`}
              className="flex flex-col gap-2 p-3 min-h-[120px] text-left"
              style={{
                borderRadius: "var(--radius-card)",
                border: `2px solid ${isBroken ? "var(--warning)" : selected ? "var(--brand)" : "var(--border)"}`,
                background: isBroken
                  ? "color-mix(in srgb, var(--warning) 12%, transparent)"
                  : "var(--surface-raised)",
              }}
            >
              <p className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                {emoji} {bucket.label}
              </p>
              <div className="flex flex-wrap gap-1 flex-1 content-start">
                {chips.map((chip) => (
                  <motion.span
                    key={chip.id}
                    layout={!collapse}
                    transition={spring.chip}
                    className="inline-flex items-center justify-center text-[13px] font-bold px-2 py-1"
                    style={{
                      borderRadius: "var(--radius-action)",
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      opacity: isBroken ? 0.45 : 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (disabled || showShock) return;
                      // return chip to pool by clearing placement
                      const next = { ...placement };
                      delete next[chip.id];
                      onChange(next);
                      setSelected(chip.id);
                    }}
                  >
                    {isMoney ? chip.label : "🥚"}
                  </motion.span>
                ))}
                {chips.length === 0 && (
                  <span className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
                    Empty
                  </span>
                )}
              </div>
              <Num className={`text-[13px] font-extrabold${isBroken ? " text-[color:var(--warning)]" : ""}`}>
                {isMoney ? moneyFmt(amt) : `${chips.length}`}
              </Num>
            </motion.button>
          );
        })}
      </div>

      {isMoney && (
        <div className="rounded-[var(--radius-card)] p-3" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
            Placed
          </p>
          <Num className="font-extrabold text-[18px]">
            {moneyFmt(total - pool.reduce((s, c) => s + c.amount, 0))} / {moneyFmt(total)}
          </Num>
        </div>
      )}

      {!isMoney && allPlaced(params, placement) && !showShock && (
        <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
          All eggs packed — Check when ready.
        </p>
      )}

      <AnimatePresence>
        {shockStats && (
          <motion.div
            initial={collapse ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[12px] p-3 text-[14px]"
            style={{ background: "var(--brand-soft)" }}
            role="status"
          >
            {shockStats.kept >= (params.targets.mode === "min-kept" ? params.targets.minKept : 0) ? (
              <>
                <span className="font-bold">🎉 Nice!</span>
                <p className="mt-1">
                  You kept <Num className="font-extrabold">{shockStats.kept}</Num> eggs safe.
                </p>
              </>
            ) : (
              <>
                <span className="font-bold">That basket broke.</span>
                <p className="mt-1">
                  You kept <Num className="font-extrabold">{shockStats.kept}</Num> — need more spread.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
