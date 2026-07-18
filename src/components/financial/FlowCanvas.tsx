import { useMemo } from "react";
import type { FlowParams } from "../../features/learning-episode/types";
import { runFlowMonth, type FlowAllocation } from "./sim/flow";
import { Num } from "../primitives";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** Paycheck routing canvas: route salary on payday, watch the month run day by day.
    Slider is the accessible baseline (spec §7.6 form alternative is the implementation). */
export function FlowCanvas({
  params,
  alloc,
  onChange,
  disabled = false,
}: {
  params: FlowParams;
  alloc: FlowAllocation;
  onChange: (a: FlowAllocation) => void;
  disabled?: boolean;
}) {
  const save = alloc["save"] ?? 0;
  const committedTotal = Object.values(params.committed).reduce((a, b) => a + b, 0);
  const spendPool = params.salary - save - committedTotal;
  const days = useMemo(() => runFlowMonth(params, alloc), [params, alloc]);
  const maxCash = Math.max(...days.map((d) => d.spendCash), 1);
  const borrowed = days[days.length - 1]?.borrowed ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* payday routing */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[14px]">
          <span className="font-bold">Payday: <Num>{fmt(params.salary)}</Num> lands</span>
        </div>
        <div className="flex gap-2 flex-wrap text-[13px]">
          {params.buckets
            .filter((b) => b.kind === "fixed")
            .map((b) => (
              <span
                key={b.id}
                className="px-2.5 py-1 rounded-full"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                {b.label} {fmt(params.committed[b.id] ?? 0)} · fixed
              </span>
            ))}
        </div>
        <label className="flex flex-col gap-1 text-[14px]">
          <span className="flex justify-between">
            <span className="font-bold" style={{ color: "var(--brand-hover)" }}>
              Route to savings first
            </span>
            <Num className="font-extrabold">{fmt(save)}</Num>
          </span>
          <input
            type="range"
            min={0}
            max={params.salary - committedTotal}
            step={50}
            value={save}
            disabled={disabled}
            onChange={(e) => onChange({ ...alloc, save: Number(e.target.value) })}
            style={{ accentColor: "var(--brand)" }}
            aria-label="Amount routed to savings on payday"
          />
        </label>
        <div className="flex justify-between text-[13px]" style={{ color: "var(--muted-foreground)" }}>
          <span>Left for the month:</span>
          <Num className="font-bold" >{fmt(spendPool)}</Num>
        </div>
      </div>

      {/* month trajectory */}
      <div>
        <p className="text-[12.5px] mb-1" style={{ color: "var(--muted-foreground)" }}>
          Spending money, day by day
        </p>
        <div className="flex items-end gap-[2px] h-24" role="img" aria-label={`Daily spending money. ${borrowed > 0 ? `Runs out and borrows ${fmt(borrowed)}.` : "Stays above zero all month."}`}>
          {days.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full" title={`Day ${d.day}: ${fmt(d.spendCash)}${d.event ? ` — ${d.event.label} (-${fmt(d.event.amount)})` : ""}`}>
              <div
                className="w-full rounded-t-[2px]"
                style={{
                  height: `${Math.max(2, (d.spendCash / maxCash) * 100)}%`,
                  background: d.borrowed > 0 ? "var(--error)" : d.event ? "var(--warning)" : "var(--brand)",
                  opacity: d.borrowed > 0 ? 0.9 : 0.75,
                  transition: "height var(--dur-fast) var(--ease-state)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          <span>Day 1</span>
          {params.events.map((e) => (
            <span key={e.day} style={{ color: "var(--warning)" }}>
              Day {e.day}: {e.label} −{fmt(e.amount)}
            </span>
          ))}
          <span>Day {params.days}</span>
        </div>
        {borrowed > 0 && (
          <p className="text-[13px] font-bold mt-1" style={{ color: "var(--error)" }}>
            You ran out and borrowed {fmt(borrowed)}.
          </p>
        )}
      </div>
    </div>
  );
}
