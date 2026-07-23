import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "../../components/primitives";
import { useStore } from "../../stores/store";

const MOCK_LEADERBOARD = [
  { name: "Sarah Wong", xp: 2150, rank: 2 },
  { name: "Ethan Lim", xp: 2450, rank: 1 },
  { name: "Alex Chen", xp: 1250, rank: 3, me: true },
  { name: "Lucas Tan", xp: 980, rank: 4 },
  { name: "Hannah Lee", xp: 870, rank: 5 },
  { name: "Jason Ng", xp: 760, rank: 6 },
  { name: "Wei En", xp: 680, rank: 7 },
  { name: "Nicole Yap", xp: 590, rank: 8 },
  { name: "Ryan Ho", xp: 520, rank: 9 },
  { name: "Celeste Lim", xp: 480, rank: 10 },
];

export function Leaderboard() {
  const [period, setPeriod] = useState("This week");
  const podium = MOCK_LEADERBOARD.filter((p) => p.rank <= 3).sort((a, b) => a.rank - b.rank);
  const rest = MOCK_LEADERBOARD.filter((p) => p.rank > 3);
  const podiumOrder = [podium.find(p => p.rank === 2), podium.find(p => p.rank === 1), podium.find(p => p.rank === 3)];

  return (
    <div className="flex flex-col gap-4 p-4 -m-4 min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold" style={{ color: "var(--foreground)" }}>Leaderboard</h1>
        <button
          className="flex items-center gap-1 text-[13px] font-bold px-3 py-1.5 rounded-full shadow-sm"
          style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          {period} <ChevronDown size={14} />
        </button>
      </div>

      {/* Podium Section (Top 3) */}
      <div className="flex items-end justify-center gap-3 py-2">
        {podiumOrder.map((p, i) => p && (
          <div key={p.name} className="flex flex-col items-center gap-1.5" style={{ order: i === 1 ? 0 : i }}>
            {p.rank === 1 && <span className="text-[18px]">👑</span>}
            <div
              className="rounded-full flex items-center justify-center font-extrabold shadow-sm"
              style={{
                width: p.rank === 1 ? 64 : 52,
                height: p.rank === 1 ? 64 : 52,
                background: p.rank === 1 ? "var(--brand)" : p.rank === 2 ? "var(--brand-hover)" : "var(--muted)",
                color: p.rank === 3 ? "var(--foreground)" : "var(--primary-foreground)",
                fontSize: p.rank === 1 ? 22 : 18,
              }}
            >
              {p.name[0]}
            </div>
            <span
              className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
              style={{
                background: p.rank === 1 ? "var(--brand-soft)" : "var(--muted)",
                color: "var(--foreground)",
              }}
            >
              {p.rank}
            </span>
            <span className="text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{p.name}</span>
            <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{p.xp.toLocaleString()} XP</span>
          </div>
        ))}
      </div>

      {/* Ranks 4–10 List Card */}
      <Card className="p-2 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {rest.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors"
            style={p.me ? { background: "var(--brand-soft)" } : undefined}
          >
            <span className="text-[13px] font-bold w-5 text-center" style={{ color: "var(--muted-foreground)" }}>{p.rank}</span>
            <div
              className="rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
              style={{ width: 34, height: 34, background: "var(--muted)", color: "var(--foreground)" }}
            >
              {p.name[0]}
            </div>
            <span className="flex-1 text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{p.name}</span>
            <span className="text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>{p.xp.toLocaleString()} XP</span>
          </div>
        ))}
      </Card>
    </div>
  );
}