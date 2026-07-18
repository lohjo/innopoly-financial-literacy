import type { ZonesParams } from "../../features/learning-episode/types";
import { runShock, type ZoneClass, type ZoneClassification } from "./sim/budget";
import { Num } from "../primitives";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

const ZONE_META: Record<ZoneClass, { label: string; fg: string; bg: string }> = {
  fixed: { label: "Fixed", fg: "var(--muted-foreground)", bg: "var(--muted)" },
  flexible: { label: "Flexible", fg: "var(--info)", bg: "color-mix(in srgb, var(--info) 12%, transparent)" },
  cut: { label: "Cut this month", fg: "var(--warning)", bg: "color-mix(in srgb, var(--warning) 15%, transparent)" },
};

const NEXT: Record<ZoneClass, ZoneClass> = { fixed: "flexible", flexible: "cut", cut: "fixed" };

/** Budget zones: tap each cost chip to classify it, then see whether the shock is absorbed. */
export function BudgetCanvas({
  params,
  cls,
  onChange,
  disabled = false,
}: {
  params: ZonesParams;
  cls: ZoneClassification;
  onChange: (c: ZoneClassification) => void;
  disabled?: boolean;
}) {
  const outcome = runShock(params, cls);
  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-[var(--radius-card)] p-3 text-[14px] flex items-center justify-between"
        style={{ background: "color-mix(in srgb, var(--warning) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--warning) 30%, transparent)" }}
      >
        <span className="font-bold" style={{ color: "var(--warning)" }}>
          Shock: {params.shock.label}
        </span>
        <Num className="font-extrabold" >{fmt(params.shock.amount)}</Num>
      </div>

      <div className="flex flex-col gap-2" role="group" aria-label="Monthly costs — tap to classify">
        {params.chips.map((chip) => {
          const zone = cls[chip.id] ?? "fixed";
          const meta = ZONE_META[zone];
          return (
            <button
              key={chip.id}
              disabled={disabled}
              onClick={() => onChange({ ...cls, [chip.id]: NEXT[zone] })}
              className="flex items-center justify-between px-3 text-[14px]"
              aria-label={`${chip.label}, ${fmt(chip.amount)}, classified ${meta.label}. Tap to change.`}
              style={{
                height: 48,
                borderRadius: "var(--radius-action)",
                background: "var(--card)",
                border: "1px solid var(--border)",
                cursor: disabled ? "default" : "pointer",
              }}
            >
              <span className="font-bold">{chip.label}</span>
              <span className="flex items-center gap-2">
                <Num>{fmt(chip.amount)}</Num>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: meta.fg, background: meta.bg }}
                >
                  {meta.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 text-[13px]">
        <div className="flex-1 rounded-[var(--radius-card)] p-3" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Shock still unpaid</p>
          <Num className="font-extrabold text-[18px]">
            <span style={{ color: outcome.uncovered > 0 ? "var(--warning)" : "var(--success)" }}>{fmt(outcome.uncovered)}</span>
          </Num>
        </div>
        <div className="flex-1 rounded-[var(--radius-card)] p-3" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Saved after shock</p>
          <Num className="font-extrabold text-[18px]">
            <span style={{ color: outcome.savedAfterShock >= params.savingsTarget ? "var(--success)" : "var(--warning)" }}>
              {fmt(outcome.savedAfterShock)}
            </span>
          </Num>
        </div>
      </div>
    </div>
  );
}
