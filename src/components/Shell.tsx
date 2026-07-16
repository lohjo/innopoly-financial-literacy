import { ReactNode } from "react";
import { motion } from "motion/react";
import { GraduationCap, Trophy, Flame, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { palette } from "./data";

export type Stats = { points: number; streak: number; avatar: string };

// --- Numeric text with tabular figures (audit R7) ---
export function Num({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`tnum ${className}`}>{children}</span>;
}

// --- Shape grammar: squircle = interactive, pill = read-only ---
export function PrimaryButton({
  children,
  onClick,
  color = palette.green,
  shadow = palette.greenShadow,
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  shadow?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.12 }}
      onClick={disabled ? undefined : onClick}
      className="w-full select-none"
      style={{
        height: 48,
        borderRadius: 14,
        background: disabled ? palette.hairline : color,
        color: disabled ? palette.muted : "#fff",
        boxShadow: disabled ? "none" : `0 4px 0 ${shadow}`,
        fontWeight: 800,
        fontSize: 15,
        letterSpacing: 0.4,
        textTransform: "uppercase",
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
  color = palette.blue,
}: {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      className="w-full select-none bg-white"
      style={{
        minHeight: 40,
        borderRadius: 12,
        border: `2px solid ${palette.hairline}`,
        color,
        fontWeight: 800,
        fontSize: 14,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        padding: "0 16px",
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

// Read-only status / metadata pill (never interactive, uppercase for status)
export function Pill({
  children,
  color = palette.muted,
  bg,
  icon,
  status = false,
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
  icon?: ReactNode;
  status?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1"
      style={{
        height: 24,
        borderRadius: 999,
        padding: "0 10px",
        background: bg ?? palette.surface,
        color,
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: status ? 0.6 : 0.2,
        textTransform: status ? "uppercase" : "none",
        lineHeight: 1,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

// Shared elevation surface used by feed / leaderboard / recap / profile (audit R4)
export function Card({
  children,
  className = "",
  style,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: palette.card,
        border: `2px solid ${palette.hairline}`,
        borderRadius: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// --- Persistent top bar: points + streak + avatar ---
export function TopBar({ stats }: { stats: Stats }) {
  return (
    <div
      className="flex items-center justify-between px-4"
      style={{ height: 52, borderBottom: `2px solid ${palette.hairline}`, background: "#fff" }}
    >
      <div className="flex items-center gap-1.5">
        <Flame size={22} color={palette.orange} fill={palette.orange} strokeWidth={1.5} />
        <Num className="font-extrabold" >
          <span style={{ color: palette.orange, fontWeight: 800, fontSize: 16 }}>{stats.streak}</span>
        </Num>
      </div>
      <div className="flex items-center gap-1.5" aria-label="points">
        <span style={{ fontSize: 18 }}>⭐</span>
        <Num>
          <span style={{ color: palette.gold, fontWeight: 800, fontSize: 16 }}>{stats.points.toLocaleString()}</span>
        </Num>
      </div>
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 34, height: 34, background: palette.surface, border: `2px solid ${palette.hairline}`, fontSize: 18 }}
      >
        {stats.avatar}
      </div>
    </div>
  );
}

// --- Bottom navigation: Learn / Leaderboard / Progress / Profile ---
const NAV = [
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/leaderboard", label: "Ranks", icon: Trophy },
  { to: "/progress", label: "Progress", icon: Flame },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <div
      className="flex items-stretch justify-around"
      style={{ borderTop: `2px solid ${palette.hairline}`, background: "#fff", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname.startsWith(to);
        return (
          <button
            key={to}
            onClick={() => nav(to)}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-0.5 flex-1"
            style={{ minHeight: 56, background: active ? palette.blueSoft : "transparent" }}
          >
            <Icon size={24} color={active ? palette.blue : palette.muted} strokeWidth={active ? 2.6 : 2} />
            <span style={{ fontSize: 10, fontWeight: 800, color: active ? palette.blue : palette.muted, letterSpacing: 0.3 }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// --- Phone frame: centers a 390-wide mobile viewport on desktop ---
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#e9eef2", fontFamily: "'Nunito', sans-serif" }}
    >
      <div
        className="relative flex flex-col overflow-hidden w-full sm:w-[390px] sm:my-6 sm:rounded-[40px]"
        style={{
          height: "100dvh",
          maxHeight: "844px",
          background: palette.bg,
          color: palette.text,
          boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
