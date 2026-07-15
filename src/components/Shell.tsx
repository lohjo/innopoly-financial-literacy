import { motion } from "motion/react";
import { Home, Swords, Trophy, User, Sparkles } from "lucide-react";
import { palette } from "./data";

export type Stats = {
  streak: number;
  bananas: number;
  gems: number;
  hearts: number;
};

export type Tab = "home" | "quest" | "leaderboard" | "profile" | "buddy";

// Cute finfy mascot — a friendly raccoon in a colored ring.
export function Mascot({ size = 48, mood = "🦝" }: { size?: number; mood?: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(160deg,#2a3d46,#1c2b33)",
        border: `2px solid ${palette.green}`,
        fontSize: size * 0.55,
        lineHeight: 1,
      }}
    >
      <span>{mood}</span>
    </div>
  );
}

function Counter({ emoji, value, color }: { emoji: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center gap-[5px]">
      <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
      <span style={{ color, fontWeight: 800, fontSize: 16 }}>{value}</span>
    </div>
  );
}

export function TopBar({ stats }: { stats: Stats }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{ borderBottom: `2px solid ${palette.border}` }}
    >
      <Counter emoji="🔥" value={stats.streak} color={palette.orange} />
      <Counter emoji="🍌" value={stats.bananas} color={palette.gold} />
      <Counter emoji="💎" value={stats.gems} color={palette.blue} />
      <Counter emoji="❤️" value={stats.hearts} color={palette.red} />
    </div>
  );
}

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "quest", label: "Quests", icon: Swords },
    { id: "buddy", label: "Finn AI", icon: Sparkles },
    { id: "leaderboard", label: "Ranks", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <div
      className="flex items-stretch justify-around px-1 py-2"
      style={{ borderTop: `2px solid ${palette.border}`, background: palette.bgDeep }}
    >
      {items.map((it) => {
        const active = tab === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 flex-1 transition-colors"
            style={{ background: active ? "rgba(88,204,2,0.12)" : "transparent" }}
          >
            <Icon size={22} color={active ? palette.green : palette.subtext} strokeWidth={active ? 2.6 : 2} />
            <span style={{ fontSize: 11, fontWeight: 700, color: active ? palette.green : palette.subtext }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Chunky Duolingo-style 3D button.
export function ChunkyButton({
  children,
  onClick,
  color = palette.green,
  shadow = palette.greenDark,
  disabled = false,
  textColor = "#ffffff",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  shadow?: string;
  disabled?: boolean;
  textColor?: string;
}) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { y: 3, boxShadow: `0 0px 0 ${shadow}` }}
      onClick={disabled ? undefined : onClick}
      className="w-full rounded-2xl px-6 py-3.5 select-none"
      style={{
        background: disabled ? palette.border : color,
        boxShadow: disabled ? "none" : `0 4px 0 ${shadow}`,
        color: disabled ? palette.subtext : textColor,
        fontWeight: 800,
        fontSize: 16,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}
