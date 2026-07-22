import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { dur, useMotionPrefs } from "../../motion";

/* Shape grammar (design-system-2026-07-15): squircle = tap, pill = read-only. */

export function Num({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`tnum ${className}`}>{children}</span>;
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  tone?: "brand" | "video" | "success";
  className?: string;
}) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { y: 2 }}
      transition={{ duration: 0.08 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full select-none font-bold text-[15px] ${className}`}
      style={{
        height: 48,
        borderRadius: "var(--radius-action)",
        background: disabled ? "var(--muted)" : tone === "video" ? "var(--video)" : tone === "success" ? "var(--success)" : "var(--brand)",
        color: disabled ? "var(--muted-foreground)" : "var(--primary-foreground)",
        boxShadow: disabled ? "none" : "var(--shadow-1)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ y: 1 }}
      transition={{ duration: 0.08 }}
      onClick={onClick}
      className={`w-full select-none font-bold text-[14px] ${className}`}
      style={{
        minHeight: 44,
        borderRadius: 12,
        border: "2px solid var(--border)",
        background: "var(--card)",
        color: "var(--brand)",
        padding: "0 16px",
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

/** Read-only status / metadata pill. Never interactive. */
export function Pill({
  children,
  tone = "muted",
  icon,
  status = false,
}: {
  children: ReactNode;
  tone?: "muted" | "brand" | "info" | "success" | "warning" | "error" | "video";
  icon?: ReactNode;
  status?: boolean;
}) {
  const colors: Record<string, { fg: string; bg: string }> = {
    muted: { fg: "var(--muted-foreground)", bg: "var(--muted)" },
    brand: { fg: "var(--brand-hover)", bg: "var(--brand-soft)" },
    info: { fg: "var(--info)", bg: "color-mix(in srgb, var(--info) 12%, transparent)" },
    success: { fg: "var(--success)", bg: "color-mix(in srgb, var(--success) 12%, transparent)" },
    warning: { fg: "var(--warning)", bg: "color-mix(in srgb, var(--warning) 12%, transparent)" },
    error: { fg: "var(--error)", bg: "color-mix(in srgb, var(--error) 12%, transparent)" },
    video: { fg: "var(--video)", bg: "color-mix(in srgb, var(--video) 12%, transparent)" },
  };
  const c = colors[tone];
  return (
    <span
      className="inline-flex items-center gap-1 shrink-0"
      style={{
        height: 24,
        borderRadius: 999,
        padding: "0 10px",
        background: c.bg,
        color: c.fg,
        fontWeight: status ? 700 : 500,
        fontSize: status ? 11 : 12.5,
        letterSpacing: status ? "0.08em" : 0,
        textTransform: status ? "uppercase" : "none",
        lineHeight: 1,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
  style,
  onClick,
  raised = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  raised?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`${onClick ? "text-left w-full cursor-pointer" : ""} ${className}`}
      style={{
        background: raised ? "var(--surface-raised)" : "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-1)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/** Segmented lesson progress (spec §7.4: segmented for lesson steps). */
export function SegmentedProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1 flex-1" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current} aria-label={`Screen ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-2 flex-1 rounded-full"
          style={{
            background: i < current ? "var(--brand)" : "var(--muted)",
            transition: "background var(--dur-fast) var(--ease-state)",
          }}
        />
      ))}
    </div>
  );
}

export type CriterionState = "pending" | "pass" | "fail";

/** Visible success criteria (brilliant-replicate "visible contract").
    celebrate: stagger-flips the rows on pass (skipped under reduced motion). */
export function CriteriaList({
  items,
  celebrate = false,
  highlightId = null,
}: {
  items: { id: string; label: string; state: CriterionState; detail?: string }[];
  celebrate?: boolean;
  /** Tutor "point to what matters": ring the one row Finn is talking about. */
  highlightId?: string | null;
}) {
  const { collapse } = useMotionPrefs();
  const flip = celebrate && !collapse;
  return (
    <ul className="flex flex-col gap-1.5" aria-label="Success criteria">
      {items.map((c, i) => (
        <motion.li
          key={c.id}
          className="flex items-start gap-2 text-[14px] rounded-[8px] -mx-1 px-1"
          data-criterion={c.id}
          data-tutor-target={c.id}
          animate={flip ? { rotateX: [0, -80, 0] } : undefined}
          transition={flip ? { delay: i * 0.06, duration: dur.card } : undefined}
          style={
            highlightId === c.id
              ? {
                  background: "color-mix(in srgb, var(--info) 10%, transparent)",
                  boxShadow: "0 0 0 2px color-mix(in srgb, var(--info) 55%, transparent)",
                }
              : undefined
          }
        >
          <span
            className="mt-0.5 inline-flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 18,
              height: 18,
              background:
                c.state === "pass"
                  ? "color-mix(in srgb, var(--success) 15%, transparent)"
                  : c.state === "fail"
                    ? "color-mix(in srgb, var(--warning) 18%, transparent)"
                    : "var(--muted)",
              color: c.state === "pass" ? "var(--success)" : c.state === "fail" ? "var(--warning)" : "var(--muted-foreground)",
            }}
            aria-hidden
          >
            {c.state === "pass" ? <Check size={12} strokeWidth={3} /> : c.state === "fail" ? <X size={12} strokeWidth={3} /> : null}
          </span>
          <span style={{ color: c.state === "fail" ? "var(--warning)" : "var(--foreground)" }}>
            {c.label}
            {c.state === "fail" && c.detail ? (
              <span className="block text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                {c.detail}
              </span>
            ) : null}
            <span className="sr-only">{c.state === "pass" ? " — passed" : c.state === "fail" ? " — not yet" : ""}</span>
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
