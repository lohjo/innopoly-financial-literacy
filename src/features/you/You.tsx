import { useNavigate } from "react-router";
import { ChevronRight, User, BarChart3, Trophy, Target, Settings, Bell, HelpCircle, Info, LogOut } from "lucide-react";
import { Card } from "../../components/primitives";
import { useStore } from "../../stores/store";

/* Updated glass palette extracted from the image */
const V = { 
  base: "#EBF5EE",     // Pale minty canvas background
  text: "#1D604E",     // Deep glass emerald for high-contrast headers
  textSoft: "#4E7A6E", // Muted glass tone for subtitles/secondary text
  mid: "#3FA382",      // Primary glass emerald accent
  bright: "#82C2A5"    // Sage green highlight
};

const MENU_TOP = [
  { icon: User, label: "Profile", to: "/you/profile" },
  { icon: BarChart3, label: "Learning stats", to: "/you/progress" },
  { icon: Trophy, label: "Achievements", to: "/you/achievements" },
  { icon: Target, label: "Goals", to: "/you/goals" },
];
const MENU_BOTTOM = [
  { icon: Settings, label: "Settings", to: "/you/settings" },
  { icon: Bell, label: "Notifications", to: "/you/activity" },
  { icon: HelpCircle, label: "Help & support", to: "/you/help" },
  { icon: Info, label: "About", to: "/you/about" },
];

/* Level has no dedicated store field yet — derived from xp until one exists.
   1,500 XP per level is a placeholder; swap in the real curve when defined. */
const XP_PER_LEVEL = 1500;

export function You() {
  const nav = useNavigate();
  const profile = useStore((s) => s.profile);
  const xp = useStore((s) => s.xp);

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const nextLevelXp = level * XP_PER_LEVEL;
  const xpIntoLevel = xp - (level - 1) * XP_PER_LEVEL;
  const levelSpan = XP_PER_LEVEL;

  return (
    <div className="flex flex-col gap-4 p-4 -m-4 min-h-screen" style={{ background: V.base }}>
      <h1 className="text-[22px] font-extrabold" style={{ color: V.text }}>You</h1>

      <Card className="p-5 flex flex-col items-center text-center" style={{ background: "#ffffffb0", border: `1px solid ${V.mid}22` }}>
        <div
          className="rounded-full flex items-center justify-center text-[26px] font-extrabold mb-3"
          style={{ width: 76, height: 76, background: `${V.mid}18`, color: V.mid }}
        >
          {profile?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="text-[17px] font-extrabold" style={{ color: V.text }}>{profile?.name ?? "Your name"}</div>
        <span
          className="text-[11px] font-extrabold px-2.5 py-1 rounded-full mt-2"
          style={{ background: `${V.mid}18`, color: V.mid }}
        >
          ⭐ Level {level}
        </span>
        <div className="w-full mt-3">
          <div className="h-2 rounded-full" style={{ background: "#D3EDE0" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, (xpIntoLevel / levelSpan) * 100)}%`, background: V.mid }}
            />
          </div>
          <div className="flex justify-between text-[11px] mt-1" style={{ color: V.textSoft }}>
            <span>{xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span>
            <span>Next: Level {level + 1}</span>
          </div>
        </div>
      </Card>

      <Card className="p-1.5" style={{ background: "#ffffffb0", border: `1px solid ${V.mid}22` }}>
        {MENU_TOP.map(({ icon: Icon, label, to }) => (
          <button
            key={label}
            onClick={() => nav(to)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left"
          >
            <Icon size={18} color={V.mid} />
            <span className="flex-1 text-[14.5px] font-bold" style={{ color: V.text }}>{label}</span>
            <ChevronRight size={16} color={V.textSoft} />
          </button>
        ))}
      </Card>

      <Card className="p-1.5" style={{ background: "#ffffffb0", border: `1px solid ${V.mid}22` }}>
        {MENU_BOTTOM.map(({ icon: Icon, label, to }) => (
          <button
            key={label}
            onClick={() => nav(to)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left"
          >
            <Icon size={18} color={V.textSoft} />
            <span className="flex-1 text-[14.5px] font-bold" style={{ color: V.text }}>{label}</span>
            <ChevronRight size={16} color={V.textSoft} />
          </button>
        ))}
      </Card>

      <button
        onClick={() => { /* TODO wire real sign-out */ }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14.5px]"
        style={{ background: "#fff", color: "#D64545", border: "1px solid #D6454522" }}
      >
        <LogOut size={16} /> Log out
      </button>
    </div>
  );
}