import { useState } from "react";
import { motion } from "motion/react";
import { Lock, Check, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { palette, tracks, challenges, trackById, Challenge, Difficulty } from "./data";
import { Card, Pill } from "./Shell";

const diffColor: Record<Difficulty, string> = {
  Beginner: palette.green,
  Intermediate: palette.orange,
  Advanced: palette.red,
};

function StatusBadge({ status }: { status: Challenge["status"] }) {
  if (status === "completed")
    return (
      <Pill status bg={palette.greenSoft} color={palette.greenShadow} icon={<Check size={12} strokeWidth={3} />}>
        Completed
      </Pill>
    );
  if (status === "locked")
    return (
      <Pill status bg={palette.surface} color={palette.muted} icon={<Lock size={11} strokeWidth={3} />}>
        Locked
      </Pill>
    );
  return (
    <Pill status bg={palette.blueSoft} color={palette.blueShadow}>
      Active
    </Pill>
  );
}

function ChallengeCard({ c, onOpen }: { c: Challenge; onOpen: () => void }) {
  const track = trackById(c.track);
  const locked = c.status === "locked";
  return (
    <motion.div whileTap={locked ? undefined : { scale: 0.98 }} transition={{ duration: 0.12 }}>
      <Card
        onClick={locked ? undefined : onOpen}
        style={{
          padding: 14,
          cursor: locked ? "not-allowed" : "pointer",
          // locked uses a scrim + reduced elevation, not just color (audit R4/accessibility)
          opacity: locked ? 0.72 : 1,
          boxShadow: locked ? "none" : "0 2px 0 rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: locked ? palette.surface : `${track.color}22`,
              border: `2px solid ${locked ? palette.hairline : track.color}`,
              fontSize: 26,
              filter: locked ? "grayscale(1)" : "none",
            }}
            aria-hidden
          >
            {track.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Pill bg={`${track.color}1f`} color={track.color}>
                {track.label}
              </Pill>
              <Pill color={diffColor[c.difficulty]} bg={`${diffColor[c.difficulty]}1f`}>
                {c.difficulty}
              </Pill>
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: palette.text }}>{c.title}</p>
            <div className="flex items-center gap-1 mt-0.5" style={{ color: palette.muted }}>
              <Clock size={13} strokeWidth={2.5} />
              <span className="tnum" style={{ fontSize: 12, fontWeight: 700 }}>
                {c.minutes} min
              </span>
            </div>
          </div>
          {locked ? (
            <Lock size={20} color={palette.muted} />
          ) : (
            <ChevronRight size={22} color={palette.muted} strokeWidth={2.5} />
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={c.status} />
        </div>
      </Card>
    </motion.div>
  );
}

export function ChallengeFeed() {
  const nav = useNavigate();
  const [active, setActive] = useState<string>("all");
  const filtered = active === "all" ? challenges : challenges.filter((c) => c.track === active);

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Learn</h1>

      {/* Track tabs (36px squircle) */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: "none" }}>
        <Tab label="All" activeColor={palette.text} active={active === "all"} onClick={() => setActive("all")} />
        {tracks.map((t) => (
          <Tab key={t.id} label={t.label} emoji={t.emoji} activeColor={t.color} active={active === t.id} onClick={() => setActive(t.id)} />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((c) => (
          <ChallengeCard key={c.id} c={c} onOpen={() => nav(`/challenge/${c.id}`)} />
        ))}
      </div>
    </div>
  );
}

function Tab({
  label,
  emoji,
  active,
  activeColor,
  onClick,
}: {
  label: string;
  emoji?: string;
  active: boolean;
  activeColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 inline-flex items-center gap-1.5"
      style={{
        height: 36,
        borderRadius: 12,
        padding: "0 14px",
        background: active ? `${activeColor}1f` : "#fff",
        border: `2px solid ${active ? activeColor : palette.hairline}`,
        color: active ? activeColor : palette.muted,
        fontWeight: 800,
        fontSize: 13,
      }}
    >
      {emoji && <span aria-hidden>{emoji}</span>}
      {label}
    </button>
  );
}
