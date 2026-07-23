import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Flame, Home, Trophy, User, Zap } from "lucide-react";
import { Num } from "../components/primitives";
import { useStore } from "../stores/store";
import { FinnButton } from "../features/copilot/FinnButton";
import { applyPaletteClass } from "../styles/theme-registry";

const NAV = [
  { to: "/today", label: "Today", icon: Home },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/you", label: "You", icon: User },
];

function TopBar() {
  const streak = useStore((s) => s.streak.current);
  const xp = useStore((s) => s.xp);
  const name = useStore((s) => s.profile?.name ?? "");
  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{ height: 52, borderBottom: "1px solid var(--border)", background: "var(--card)" }}
    >
      <div className="flex items-center gap-1.5" aria-label={`Streak: ${streak} days`}>
        <Flame size={20} color="var(--warning)" fill={streak > 0 ? "var(--warning)" : "none"} strokeWidth={2} />
        <Num className="font-extrabold text-[15px]" >{streak}</Num>
      </div>
      <div className="flex items-center gap-1.5" aria-label={`${xp} XP`}>
        <Zap size={18} color="var(--brand)" fill="var(--brand)" strokeWidth={1.5} />
        <Num className="font-extrabold text-[15px]">{xp.toLocaleString()}</Num>
      </div>
      <div
        className="flex items-center justify-center rounded-full font-bold text-[13px]"
        style={{ width: 34, height: 34, background: "var(--brand-soft)", color: "var(--brand-hover)", border: "1px solid var(--border)" }}
        aria-hidden
      >
        {name ? name.slice(0, 1).toUpperCase() : "?"}
      </div>
    </header>
  );
}

function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav
      className="flex items-stretch justify-around shrink-0"
      style={{ borderTop: "1px solid var(--border)", background: "var(--card)", paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main"
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
            style={{ minHeight: 56, borderRadius: 12, background: active ? "var(--brand-soft)" : "transparent" }}
          >
            <Icon size={22} color={active ? "var(--brand-hover)" : "var(--muted-foreground)"} strokeWidth={active ? 2.6 : 2} />
            <span
              className="text-[10px] font-bold tracking-wide"
              style={{ color: active ? "var(--brand-hover)" : "var(--muted-foreground)" }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/** Tab layout: TopBar + content + BottomNav. Content column caps at 430px on phone-ish
    screens and widens for md+ (spec §6.3 responsive; no phone frame). */
export function AppShell() {
  const palette = useStore((s) => s.prefs.palette);

  useEffect(() => {
    applyPaletteClass(palette);
  }, [palette]);

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", background: "var(--background)" }}>
      <TopBar />
      <main className="flex-1 w-full max-w-[430px] md:max-w-[720px] mx-auto px-4 py-4 pb-24">
        <Outlet />
      </main>
      <div className="fixed bottom-0 inset-x-0 z-40">
        <div className="relative w-full max-w-[430px] md:max-w-[720px] mx-auto">
          <FinnButton />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}