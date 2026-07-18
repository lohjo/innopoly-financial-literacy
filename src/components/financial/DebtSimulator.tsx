import { useMemo } from "react";
import type { MinPayParams } from "../../features/learning-episode/types";
import { amortize, minPaymentFor, monthsToZero, totalInterest } from "./sim/minpay";
import { Num } from "../primitives";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** Debt payoff dial: choose a monthly payment, watch interest vs principal and time-to-zero. */
export function DebtSimulator({
  params,
  payment,
  onChange,
  disabled = false,
}: {
  params: MinPayParams;
  payment: number;
  onChange: (p: number) => void;
  disabled?: boolean;
}) {
  const minPay = Math.round(minPaymentFor(params, params.balance));
  const months = useMemo(() => monthsToZero(params, payment), [params, payment]);
  const interest = useMemo(() => totalInterest(params, payment), [params, payment]);
  const steps = useMemo(() => amortize(params, payment).slice(0, 12), [params, payment]);
  const maxPay = Math.max(...steps.map((s) => s.payment), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-[14px]">
        <span className="font-bold">Card balance: <Num>{fmt(params.balance)}</Num></span>
        <span style={{ color: "var(--muted-foreground)" }}>{Math.round(params.apr * 100)}% APR</span>
      </div>

      <label className="flex flex-col gap-1 text-[14px]">
        <span className="flex justify-between">
          <span className="font-bold" style={{ color: "var(--brand-hover)" }}>Monthly payment</span>
          <Num className="font-extrabold">{fmt(payment)}</Num>
        </span>
        <input
          type="range"
          min={minPay}
          max={600}
          step={10}
          value={payment}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ accentColor: "var(--brand)" }}
          aria-label="Monthly payment amount"
        />
        <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
          Card minimum: {fmt(minPay)}
        </span>
      </label>

      <div className="flex gap-3 text-[13px]">
        <div className="flex-1 rounded-[var(--radius-card)] p-3" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Debt-free in</p>
          <Num className="font-extrabold text-[18px]">
            <span style={{ color: months !== null && months <= 12 ? "var(--success)" : "var(--warning)" }}>
              {months === null ? "never" : months > 24 ? `${Math.floor(months / 12)}+ years` : `${months} months`}
            </span>
          </Num>
        </div>
        <div className="flex-1 rounded-[var(--radius-card)] p-3" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Total interest paid</p>
          <Num className="font-extrabold text-[18px]">
            <span style={{ color: months === null ? "var(--error)" : "var(--foreground)" }}>{months === null ? "∞" : fmt(interest)}</span>
          </Num>
        </div>
      </div>

      <div>
        <p className="text-[12.5px] mb-1" style={{ color: "var(--muted-foreground)" }}>
          Where each of your first 12 payments goes
        </p>
        <div className="flex items-end gap-[3px] h-24" role="img" aria-label={`First year of payments. ${months === null ? "Payment barely covers interest — the balance never falls." : "Principal share grows as the balance falls."}`}>
          {steps.map((s) => {
            const h = (s.payment / maxPay) * 100;
            const interestShare = s.payment > 0 ? s.interest / s.payment : 0;
            return (
              <div key={s.month} className="flex-1 flex flex-col justify-end h-full" title={`Month ${s.month}: ${fmt(s.interest)} interest, ${fmt(Math.max(0, s.principal))} principal`}>
                <div className="w-full flex flex-col rounded-t-[3px] overflow-hidden" style={{ height: `${h}%` }}>
                  <div style={{ height: `${interestShare * 100}%`, background: "var(--warning)" }} />
                  <div style={{ flex: 1, background: "var(--brand)" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-[2px]" style={{ background: "var(--warning)" }} /> interest
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-[2px]" style={{ background: "var(--brand)" }} /> principal
          </span>
        </div>
      </div>
    </div>
  );
}
