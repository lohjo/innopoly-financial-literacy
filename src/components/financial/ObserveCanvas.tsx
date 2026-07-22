import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { DistributeParams, ObserveShock } from "../../features/learning-episode/types";
import {
  amountInBucket,
  pickBreakBucket,
  portfolioAfterDrop,
  keptAfterBreak,
  totalAmount,
} from "./sim/distribute";
import { Num } from "../primitives";
import { dur, ease, useMotionPrefs } from "../../motion";

/** Watch-only consequence: egg basket breaks or one investment drops. */
export function ObserveCanvas({
  title,
  params,
  placement,
  shock,
}: {
  title: string;
  params: DistributeParams;
  placement: Record<string, string>;
  shock: ObserveShock;
}) {
  const { collapse } = useMotionPrefs();
  const [phase, setPhase] = useState<"idle" | "wobble" | "break" | "done">(collapse ? "done" : "idle");

  const breakBucketId = useMemo(() => {
    if (shock.kind === "egg-break") return pickBreakBucket(params, placement, shock);
    return shock.bucketId;
  }, [params, placement, shock]);

  const eggStats = shock.kind === "egg-break" ? keptAfterBreak(params, placement, breakBucketId) : null;
  const moneyStats =
    shock.kind === "portfolio-drop" ? portfolioAfterDrop(params, placement, shock) : null;

  useEffect(() => {
    if (collapse) return;
    const t1 = setTimeout(() => setPhase("wobble"), 400);
    const t2 = setTimeout(() => setPhase("break"), 1400);
    const t3 = setTimeout(() => setPhase("done"), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [collapse]);

  const isMoney = shock.kind === "portfolio-drop";

  return (
    <div className="flex flex-col gap-5 pt-4">
      <h2 className="text-[18px]">{title}</h2>
      <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
        {isMoney ? "One investment drops." : "Watch what happens..."}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {params.buckets.map((bucket) => {
          const amt = amountInBucket(params, placement, bucket.id);
          const hit = bucket.id === breakBucketId && (phase === "break" || phase === "done" || phase === "wobble");
          const broken = bucket.id === breakBucketId && (phase === "break" || phase === "done");
          const emoji = isMoney
            ? broken
              ? "📉"
              : "📈"
            : broken
              ? "💥"
              : hit
                ? "🫨"
                : "🧺";
          return (
            <motion.div
              key={bucket.id}
              animate={
                hit && phase === "wobble" && !collapse
                  ? { x: [0, -5, 5, -4, 4, 0], rotate: [0, -3, 3, -2, 2, 0] }
                  : broken && !collapse
                    ? { scale: [1, 0.96, 1] }
                    : undefined
              }
              transition={{ duration: 0.55, ease: ease.state }}
              className="flex flex-col gap-2 p-3 min-h-[100px]"
              style={{
                borderRadius: "var(--radius-card)",
                border: `2px solid ${broken ? "var(--warning)" : "var(--border)"}`,
                background: broken
                  ? "color-mix(in srgb, var(--warning) 12%, transparent)"
                  : "var(--surface-raised)",
              }}
            >
              <p className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                {emoji} {bucket.label}
              </p>
              <Num className="text-[16px] font-extrabold">
                {isMoney ? `$${Math.round(amt).toLocaleString("en-US")}` : `${amt} eggs`}
              </Num>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {(phase === "done" || collapse) && eggStats && (
          <motion.div
            key="egg-out"
            initial={collapse ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.card, ease: ease.state }}
            className="rounded-[12px] p-4 text-[15px]"
            style={{ background: eggStats.lost >= eggStats.total ? "color-mix(in srgb, var(--warning) 14%, transparent)" : "var(--brand-soft)" }}
            role="status"
          >
            {eggStats.lost >= eggStats.total ? (
              <p>
                You lost <Num className="font-extrabold">all {eggStats.total} eggs.</Num>
              </p>
            ) : (
              <p>
                You saved <Num className="font-extrabold">{eggStats.kept} eggs!</Num>
              </p>
            )}
          </motion.div>
        )}
        {(phase === "done" || collapse) && moneyStats && (
          <motion.div
            key="money-out"
            initial={collapse ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.card, ease: ease.state }}
            className="rounded-[12px] p-4 text-[15px] flex flex-col gap-2"
            style={{ background: moneyStats.heavy ? "color-mix(in srgb, var(--warning) 14%, transparent)" : "var(--brand-soft)" }}
            role="status"
          >
            <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              📉 Investment {breakBucketId.toUpperCase()}
            </p>
            <p className="text-[22px] font-extrabold">
              {moneyStats.heavy ? "😬" : "🙂"}{" "}
              <Num>
                ${totalAmount(params).toLocaleString("en-US")} → ${Math.round(moneyStats.total).toLocaleString("en-US")}
              </Num>
            </p>
            <p>
              {moneyStats.heavy
                ? "Your portfolio dropped a lot."
                : "Most of your money is still safe."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
