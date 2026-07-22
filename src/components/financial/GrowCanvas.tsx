import { motion } from "motion/react";
import type { GrowParams } from "../../features/learning-episode/types";
import { growGap } from "./sim/grow";
import { Num } from "../primitives";
import { dur, ease, useMotionPrefs } from "../../motion";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** Compound-growth explorer: scrub years and watch save vs spend stacks diverge. */
export function GrowCanvas({
  params,
  years,
  onChange,
  disabled = false,
}: {
  params: GrowParams;
  years: number;
  onChange: (years: number) => void;
  disabled?: boolean;
}) {
  const { collapse } = useMotionPrefs();
  const gap = growGap(params, years);
  const maxBar = Math.max(growGap(params, params.maxYears), 1);
  const saveH = Math.max(8, (gap / maxBar) * 160);
  const spendH = 8;
  const hit = gap + 1e-6 >= params.gapTarget;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-center gap-8 px-2" style={{ minHeight: 200 }}>
        <Stack
          label={params.saveLabel}
          height={saveH}
          color="var(--brand)"
          value={gap}
          collapse={collapse}
        />
        <Stack
          label={params.spendLabel}
          height={spendH}
          color="var(--muted-foreground)"
          value={0}
          collapse={collapse}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[13px]">
          <span style={{ color: "var(--muted-foreground)" }}>Years passed</span>
          <Num className="font-extrabold text-[18px] tnum">{years}</Num>
        </div>
        <input
          type="range"
          min={0}
          max={params.maxYears}
          step={1}
          value={years}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Years of monthly saving"
          className="w-full accent-[var(--brand)]"
        />
        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
          <span>0</span>
          <span>{params.maxYears}</span>
        </div>
      </div>

      <div
        className="rounded-[var(--radius-card)] p-3 flex items-center justify-between"
        style={{
          background: hit ? "var(--brand-soft)" : "var(--surface-raised)",
          border: `1px solid ${hit ? "var(--brand)" : "var(--border)"}`,
          transition: "background var(--dur-fast) var(--ease-state), border-color var(--dur-fast) var(--ease-state)",
        }}
        role="status"
      >
        <span className="text-[13px] font-bold" style={{ color: hit ? "var(--brand-hover)" : "var(--muted-foreground)" }}>
          Gap (save − spend)
        </span>
        <Num className={`font-extrabold text-[18px]${hit ? " text-[color:var(--brand-hover)]" : ""}`}>
          {fmt(gap)}
        </Num>
      </div>

      <p className="text-[12px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        Simulated: {fmt(params.monthlySave)}/mo at {(params.annualRate * 100).toFixed(0)}% annual, monthly compounding.
        Scrub until the gap clears {fmt(params.gapTarget)}.
      </p>
    </div>
  );
}

function Stack({
  label,
  height,
  color,
  value,
  collapse,
}: {
  label: string;
  height: number;
  color: string;
  value: number;
  collapse: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 w-[110px]">
      <Num className="text-[13px] font-extrabold tnum">{fmt(value)}</Num>
      <div className="relative w-full flex items-end justify-center" style={{ height: 168 }}>
        <motion.div
          animate={{ height }}
          initial={false}
          transition={collapse ? { duration: 0 } : { duration: dur.card, ease: ease.state }}
          className="w-[72px] rounded-t-[14px]"
          style={{ background: color, boxShadow: "var(--shadow-1)" }}
        />
      </div>
      <span className="text-[11px] font-bold text-center leading-tight" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
    </div>
  );
}
