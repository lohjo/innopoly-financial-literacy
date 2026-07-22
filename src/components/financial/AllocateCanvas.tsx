import { motion } from "motion/react";
import type { AllocateParams } from "../../features/learning-episode/types";
import { sumInKind } from "./sim/allocate";
import { Num } from "../primitives";
import { spring, useMotionPrefs } from "../../motion";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** Tap a chip, then a column — route paycheck atoms Save-first vs Leftover. */
export function AllocateCanvas({
  params,
  placement,
  onChange,
  disabled = false,
}: {
  params: AllocateParams;
  placement: Record<string, string>;
  onChange: (placement: Record<string, string>) => void;
  disabled?: boolean;
}) {
  const { collapse } = useMotionPrefs();
  const saved = sumInKind(params, placement, "save");
  const spent = sumInKind(params, placement, "spend");
  const unplaced = params.chips.filter((c) => !placement[c.id]);

  const moveTo = (chipId: string, bucketId: string) => {
    if (disabled) return;
    onChange({ ...placement, [chipId]: bucketId });
  };

  return (
    <div className="flex flex-col gap-4">
      {unplaced.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Paycheck chips — tap a column below to place
          </p>
          <div className="flex flex-wrap gap-2">
            {unplaced.map((chip) => (
              <Chip key={chip.id} label={chip.label} amount={chip.amount} muted />
            ))}
          </div>
          <div className="flex gap-2">
            {params.buckets.map((b) => (
              <button
                key={`park-${b.id}`}
                type="button"
                disabled={disabled || unplaced.length === 0}
                onClick={() => {
                  const first = unplaced[0];
                  if (first) moveTo(first.id, b.id);
                }}
                className="flex-1 text-[12px] font-bold py-2"
                style={{
                  borderRadius: "var(--radius-action)",
                  border: "2px dashed var(--border)",
                  background: "var(--surface-raised)",
                }}
              >
                Send next → {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {params.buckets.map((bucket) => {
          const chips = params.chips.filter((c) => placement[c.id] === bucket.id);
          const isSave = bucket.kind === "save";
          return (
            <div
              key={bucket.id}
              className="flex flex-col gap-2 p-3 min-h-[160px]"
              style={{
                borderRadius: "var(--radius-card)",
                border: `2px solid ${isSave ? "var(--brand)" : "var(--border)"}`,
                background: isSave ? "var(--brand-soft)" : "var(--surface-raised)",
              }}
            >
              <p className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: isSave ? "var(--brand-hover)" : "var(--muted-foreground)" }}>
                {bucket.label}
              </p>
              <div className="flex flex-col gap-2 flex-1">
                {chips.map((chip) => (
                  <motion.button
                    key={chip.id}
                    type="button"
                    layout={!collapse}
                    transition={spring.chip}
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      const other = params.buckets.find((b) => b.id !== bucket.id);
                      if (other) moveTo(chip.id, other.id);
                    }}
                    aria-label={`${chip.label} ${fmt(chip.amount)}. Tap to move.`}
                    className="text-left"
                  >
                    <Chip label={chip.label} amount={chip.amount} />
                  </motion.button>
                ))}
                {chips.length === 0 && (
                  <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
                    Empty
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 text-[13px]">
        <div className="flex-1 rounded-[var(--radius-card)] p-3" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Save-first</p>
          <Num className={`font-extrabold text-[18px]${saved >= params.targets.minSave ? " text-[color:var(--success)]" : ""}`}>
            {fmt(saved)}
          </Num>
        </div>
        <div className="flex-1 rounded-[var(--radius-card)] p-3" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Leftover (at risk)</p>
          <Num className="font-extrabold text-[18px] text-[color:var(--warning)]">
            {fmt(spent)}
          </Num>
        </div>
      </div>

      {params.evaporateNote && (
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {params.evaporateNote}
        </p>
      )}
    </div>
  );
}

function Chip({ label, amount, muted }: { label: string; amount: number; muted?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2 text-[13px] font-bold w-full"
      style={{
        borderRadius: "var(--radius-action)",
        border: "1px solid var(--border)",
        background: muted ? "var(--muted)" : "var(--card)",
        opacity: muted ? 0.85 : 1,
      }}
    >
      <span>{label}</span>
      <Num>{fmt(amount)}</Num>
    </div>
  );
}
