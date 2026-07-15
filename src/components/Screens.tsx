import { motion } from "motion/react";
import { Flame, Zap, Diamond, Settings } from "lucide-react";
import { palette, leaderboard, dailyQuests } from "./data";
import { Stats } from "./Shell";

const medal = ["🥇", "🥈", "🥉"];

export function LeaderboardScreen() {
  const sorted = [...leaderboard].sort((a, b) => b.xp - a.xp);
  return (
    <div className="px-5 py-5">
      <h2 style={{ fontWeight: 900, fontSize: 26, color: palette.text }}>Silver League</h2>
      <p style={{ color: palette.subtext, fontSize: 14, marginTop: 2, marginBottom: 18 }}>
        Top 3 advance to the Gold League · 4 days left
      </p>
      <div className="flex flex-col gap-2">
        {sorted.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: p.you ? "rgba(88,204,2,0.12)" : palette.card,
              border: `2px solid ${p.you ? palette.green : palette.border}`,
            }}
          >
            <span style={{ width: 26, textAlign: "center", fontWeight: 900, color: palette.subtext, fontSize: 16 }}>
              {i < 3 ? medal[i] : i + 1}
            </span>
            <span style={{ fontSize: 24 }}>{p.avatar}</span>
            <span className="flex-1" style={{ fontWeight: 800, color: p.you ? palette.greenText : palette.text }}>
              {p.name}
            </span>
            <span style={{ fontWeight: 800, color: palette.gold }}>{p.xp} 🍌</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DailyQuestScreen() {
  return (
    <div className="px-5 py-5">
      <h2 style={{ fontWeight: 900, fontSize: 26, color: palette.text }}>Daily Quests</h2>
      <p style={{ color: palette.subtext, fontSize: 14, marginTop: 2, marginBottom: 18 }}>
        Complete quests to earn bonus gems 💎
      </p>
      <div className="flex flex-col gap-3">
        {dailyQuests.map((q) => {
          const pct = Math.min(100, (q.current / q.goal) * 100);
          const done = q.current >= q.goal;
          return (
            <div key={q.id} className="rounded-2xl p-4" style={{ background: palette.card, border: `2px solid ${palette.border}` }}>
              <div className="flex items-center gap-3 mb-2.5">
                <span style={{ fontSize: 26 }}>{q.emoji}</span>
                <span className="flex-1" style={{ fontWeight: 800, color: palette.text }}>{q.label}</span>
                <span style={{ fontWeight: 800, color: palette.blue }}>+{q.reward} 💎</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: palette.border }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: done ? palette.green : palette.gold }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: palette.subtext }}>
                  {q.current}/{q.goal}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProfileScreen({ stats }: { stats: Stats }) {
  const items = [
    { icon: Flame, label: "Day streak", value: stats.streak, color: palette.orange },
    { icon: Zap, label: "Total XP", value: 1720, color: palette.gold },
    { icon: Diamond, label: "Gems", value: stats.gems, color: palette.blue },
  ];
  const achievements = [
    { emoji: "🌱", label: "First Steps", sub: "Complete 1 lesson" },
    { emoji: "🔥", label: "On Fire", sub: "7-day streak" },
    { emoji: "🧠", label: "Quick Learner", sub: "5 perfect quizzes" },
    { emoji: "💎", label: "Gem Hunter", sub: "Earn 50 gems" },
  ];
  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 72, height: 72, background: palette.cardAlt, border: `3px solid ${palette.green}`, fontSize: 38 }}
        >
          🦝
        </div>
        <div className="flex-1">
          <h2 style={{ fontWeight: 900, fontSize: 22, color: palette.text }}>Alex Chen</h2>
          <p style={{ color: palette.subtext, fontSize: 14 }}>New grad · joined July 2026</p>
        </div>
        <Settings size={22} color={palette.subtext} />
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="rounded-2xl p-3 flex flex-col items-center gap-1" style={{ background: palette.card, border: `2px solid ${palette.border}` }}>
              <Icon size={20} color={it.color} />
              <span style={{ fontWeight: 900, fontSize: 18, color: palette.text }}>{it.value}</span>
              <span style={{ fontSize: 11, color: palette.subtext, textAlign: "center" }}>{it.label}</span>
            </div>
          );
        })}
      </div>

      <h3 style={{ fontWeight: 800, fontSize: 18, color: palette.text, marginBottom: 12 }}>Achievements</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {achievements.map((a) => (
          <div key={a.label} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: palette.card, border: `2px solid ${palette.border}` }}>
            <span style={{ fontSize: 30 }}>{a.emoji}</span>
            <div>
              <p style={{ fontWeight: 800, color: palette.text, fontSize: 14 }}>{a.label}</p>
              <p style={{ color: palette.subtext, fontSize: 11 }}>{a.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
