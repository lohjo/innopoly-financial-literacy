import { useNavigate } from "react-router";
import { Award, ChevronRight, History, LineChart, Settings as SettingsIcon } from "lucide-react";
import { Card, Num, Pill } from "../../components/primitives";
import { useStore } from "../../stores/store";
import { FinnAvatar } from "../copilot/FinnAvatar";
import { GOALS } from "../onboarding/goals";
import { peers } from "./peers";

/** You hub: identity, goal, links, small league card (leaderboard separate from learning evidence,
    never includes call scores — spec §6.2). */
export function You() {
  const nav = useNavigate();
  const profile = useStore((s) => s.profile);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak.current);
  const achievements = useStore((s) => s.achievements);
  const goal = GOALS.find((g) => g.id === profile?.goalId);

  const rows = [
    { to: "/you/progress", icon: LineChart, label: "Progress", sub: "mastery with evidence, not vanity counts" },
    { to: "/you/achievements", icon: Award, label: "Achievements", sub: `${achievements.length} process badges` },
    { to: "/you/activity", icon: History, label: "Activity", sub: "episodes and calls" },
    { to: "/you/settings", icon: SettingsIcon, label: "Settings", sub: "privacy, memory, accessibility" },
  ];

  const you = { name: profile?.name || "You", points: xp };
  const board = [...peers.map((p) => ({ name: p.name, points: p.points, you: false })), { ...you, you: true }]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="rounded-full p-1" style={{ background: "var(--brand-soft)" }}>
          <FinnAvatar expression="neutral" size={56} />
        </div>
        <div>
          <h1 className="text-[20px]">{profile?.name || "New graduate"}</h1>
          <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            {goal ? `Goal: ${goal.label}` : "No goal picked yet"}
          </p>
          <div className="flex gap-2 mt-1">
            <Pill tone="brand">
              <Num>{xp}</Num>&nbsp;XP
            </Pill>
            <Pill tone="warning">
              <Num>{streak}</Num>&nbsp;day streak
            </Pill>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map(({ to, icon: Icon, label, sub }) => (
          <Card key={to} className="p-4 flex items-center gap-3" onClick={() => nav(to)}>
            <Icon size={20} color="var(--brand-hover)" />
            <div className="flex-1">
              <p className="font-bold text-[15px]">{label}</p>
              <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                {sub}
              </p>
            </div>
            <ChevronRight size={18} color="var(--muted-foreground)" />
          </Card>
        ))}
      </div>

      {/* league: separate surface, XP only (spec §6.2) */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-[14px]">Cohort league</p>
          <Pill tone="muted">weekly XP</Pill>
        </div>
        <div className="flex flex-col gap-1">
          {board.map((p, i) => (
            <div
              key={p.name + i}
              className="flex items-center gap-3 px-2 py-1.5 rounded-[10px]"
              style={{ background: p.you ? "var(--brand-soft)" : "transparent" }}
            >
              <span
                className="flex items-center justify-center font-extrabold text-[12px] tnum shrink-0"
                style={{ width: 24, height: 24, borderRadius: 10, background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-[14px] font-bold">{p.you ? `${p.name} (you)` : p.name}</span>
              <Num className="text-[13px] font-bold">{p.points.toLocaleString()}</Num>
            </div>
          ))}
        </div>
        <p className="text-[11.5px] mt-2" style={{ color: "var(--muted-foreground)" }}>
          Rehearsal-call results never appear here.
        </p>
      </Card>
    </div>
  );
}
