import { AnimatePresence, motion } from "motion/react";
import type { TimingParams } from "../../features/learning-episode/types";
import {
  canAdvanceReveal,
  dcaAverageCost,
  isFullyRevealed,
  lowestMonthId,
  lumpSharePrice,
  revealAfterPick,
} from "./sim/timing";
import { Num, PrimaryButton } from "../primitives";
import { spring, useMotionPrefs } from "../../motion";

const fmtPrice = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });

export type TimingAnswerState = {
  pickMonthId: string | null;
  revealedCount: number;
};

/** Pick a month (or watch DCA buys), then step the market one month at a time. */
export function TimingCanvas({
  params,
  answer,
  onChange,
  disabled = false,
  compareLumpPrice = null,
}: {
  params: TimingParams;
  answer: TimingAnswerState;
  onChange: (next: TimingAnswerState) => void;
  disabled?: boolean;
  /** prior lump-sum buy price for the DCA compare panel */
  compareLumpPrice?: number | null;
}) {
  const { collapse } = useMotionPrefs();
  const lowestId = lowestMonthId(params.months);
  const done = isFullyRevealed(params, answer);
  const monthly = params.monthlyAmount ?? params.budget / Math.max(params.months.length, 1);
  const canNext = !disabled && canAdvanceReveal(params, answer);
  const revealedSlice = params.months.slice(0, answer.revealedCount);
  const lowestRevealedId = revealedSlice.length > 0 ? lowestMonthId(revealedSlice) : null;

  const pick = (monthId: string) => {
    if (disabled || params.mode !== "lump-sum" || answer.pickMonthId) return;
    onChange({
      pickMonthId: monthId,
      revealedCount: revealAfterPick(params.months, monthId),
    });
  };

  const nextMonth = () => {
    if (!canNext) return;
    onChange({
      ...answer,
      revealedCount: Math.min(params.months.length, answer.revealedCount + 1),
    });
  };

  const youPrice =
    compareLumpPrice ??
    lumpSharePrice(params.months, params.compareFallbackMonthId ?? null) ??
    params.months[0]?.price ??
    0;
  const autoPrice = dcaAverageCost(params);

  return (
    <div className="flex flex-col gap-4">
      {params.mode === "lump-sum" && !answer.pickMonthId && (
        <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
          You have <Num className="font-extrabold">${params.budget.toLocaleString("en-US")}</Num>. Tap the month
          you'd invest it all.
        </p>
      )}
      {params.mode === "dca" && answer.revealedCount === 0 && (
        <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
          What if you didn't have to guess? Watch <Num className="font-extrabold">{fmtPrice(monthly)}</Num> land
          every month.
        </p>
      )}

      {/* Month grid / stepped list */}
      <div className="flex flex-col gap-2">
        {params.months.map((m, i) => {
          const visible = i < answer.revealedCount;
          const isPick = answer.pickMonthId === m.id;
          const justRevealed = visible && i === answer.revealedCount - 1;
          const isFinalLowest = done && m.id === lowestId;
          const isNewLowest =
            visible &&
            !done &&
            justRevealed &&
            lowestRevealedId === m.id &&
            answer.revealedCount > 1;
          const prevPrice = i > 0 ? params.months[i - 1]!.price : m.price;
          const trend = m.price < prevPrice ? "down" : m.price > prevPrice ? "up" : "flat";

          if (params.mode === "lump-sum" && !answer.pickMonthId) {
            return (
              <button
                key={m.id}
                type="button"
                disabled={disabled}
                onClick={() => pick(m.id)}
                className="flex items-center justify-between px-4 py-3 text-left"
                style={{
                  borderRadius: "var(--radius-action)",
                  border: "2px solid var(--border)",
                  background: "var(--surface-raised)",
                }}
              >
                <span className="font-extrabold text-[15px]">{m.label}</span>
                <span className="text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}>
                  Tap to buy
                </span>
              </button>
            );
          }

          if (!visible) {
            return (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3 opacity-35"
                style={{
                  borderRadius: "var(--radius-action)",
                  border: "2px dashed var(--border)",
                  background: "var(--card)",
                }}
                aria-hidden
              >
                <span className="font-bold text-[14px]">{m.label}</span>
                <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                  ···
                </span>
              </div>
            );
          }

          return (
            <motion.div
              key={m.id}
              initial={collapse || !justRevealed ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.chip}
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderRadius: "var(--radius-action)",
                border: `2px solid ${isPick ? "var(--brand)" : isFinalLowest || isNewLowest ? "var(--warning)" : "var(--border)"}`,
                background: isPick
                  ? "var(--brand-soft)"
                  : isFinalLowest || isNewLowest
                    ? "color-mix(in srgb, var(--warning) 12%, transparent)"
                    : "var(--card)",
              }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-extrabold text-[15px]">
                  {params.mode === "dca" ? "💰 " : ""}
                  {m.label}
                  {isPick ? "  ← You bought" : ""}
                  {isFinalLowest ? "  ★ Lowest" : isNewLowest ? "  ★ New lowest" : ""}
                </span>
                {justRevealed && i > 0 && params.mode === "lump-sum" && (
                  <span className="text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}>
                    {trend === "down" ? "↓ Dropped" : trend === "up" ? "↑ Climbed" : "→ Flat"}
                  </span>
                )}
              </div>
              <Num className="font-extrabold text-[16px] tnum">{fmtPrice(m.price)}</Num>
            </motion.div>
          );
        })}
      </div>

      {canNext && (
        <PrimaryButton onClick={nextMonth}>
          {params.mode === "dca" && answer.revealedCount === 0
            ? "Start Auto Invest"
            : answer.revealedCount === 0
              ? "Reveal"
              : "Next month"}
        </PrimaryButton>
      )}

      <AnimatePresence>
        {done && (
          <motion.div
            initial={collapse ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div
              className="rounded-[12px] p-3 text-[14px]"
              style={{ background: "var(--brand-soft)" }}
              role="status"
            >
              <p className="font-extrabold mb-1">{params.feedbackTitle}</p>
              <p className="whitespace-pre-line" style={{ color: "var(--foreground)" }}>
                {params.feedbackBody}
              </p>
            </div>

            {params.mode === "dca" && (
              <div className="grid grid-cols-2 gap-3">
                <CompareCard
                  title="You"
                  subtitle="One purchase"
                  detail={`Bought at ${fmtPrice(youPrice)}/share`}
                  price={youPrice}
                  muted
                />
                <CompareCard
                  title="Auto Invest"
                  subtitle={`${params.months.length} purchases`}
                  detail="Bought at many prices"
                  price={autoPrice}
                  highlight
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompareCard({
  title,
  subtitle,
  detail,
  price,
  highlight,
  muted,
}: {
  title: string;
  subtitle: string;
  detail: string;
  price: number;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className="rounded-[var(--radius-card)] p-3 flex flex-col gap-1"
      style={{
        background: highlight ? "var(--brand-soft)" : "var(--surface-raised)",
        border: `1px solid ${highlight ? "var(--brand)" : "var(--border)"}`,
        opacity: muted ? 0.9 : 1,
      }}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
        {title}
      </p>
      <p className="text-[13px] font-extrabold">{subtitle}</p>
      <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
        {detail}
      </p>
      <p className="text-[12px] mt-1" style={{ color: "var(--muted-foreground)" }}>
        Avg price
      </p>
      <Num className={`font-extrabold text-[18px] tnum ${highlight ? "text-[var(--brand-hover)]" : ""}`}>
        {fmtPrice(price)}
        <span className="text-[12px] font-bold">/share</span>
      </Num>
    </div>
  );
}
