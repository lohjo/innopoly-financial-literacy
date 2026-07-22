// src/features/home/Home.tsx
import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import { motion } from "motion/react";
import { PrimaryButton, Pill } from "../../components/primitives";
import { useStore } from "../../stores/store";
import { useMotionPrefs } from "../../motion";
import { Journey } from "../mastery/Journey"; // Keep Journey cleanly isolated!
import { currentLessonInfo } from "../mastery/currentLesson";

const V = {
  base: "#EBF5EE",
  text: "#1D604E",
  textSoft: "#4E7A6E",
  mid: "#3FA382",
};

/** Layered "Jump back in" hero: stacked-card look with the current lesson and
    one primary Continue action (streak lives in the TopBar, not here). */
function ContinueHero() {
  const nav = useNavigate();
  const { collapse } = useMotionPrefs();
  const lessonsCompleted = useStore((s) => s.lessonsCompleted);
  const info = currentLessonInfo(lessonsCompleted);
  if (!info) return null;

  const fresh = lessonsCompleted.length === 0;
  return (
    <div className="relative">
      {/* offset shadow card behind — layered stack look */}
      <div
        aria-hidden
        className="absolute inset-x-2 -bottom-1.5 top-3 rounded-[var(--radius-card)]"
        style={{ background: "color-mix(in srgb, var(--brand) 30%, transparent)" }}
      />
      <motion.div
        whileTap={collapse ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.08 }}
        className="relative rounded-[var(--radius-card)] p-4 flex flex-col gap-3"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-2, var(--shadow-1))",
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            {fresh ? "Start here" : "Jump back in"}
          </span>
          <Pill tone="brand">{info.chapter.title}</Pill>
        </div>
        <h2 className="text-[18px] font-extrabold leading-snug" style={{ color: "var(--foreground)" }}>
          {info.lesson.title}
        </h2>
        <PrimaryButton onClick={() => nav(`/learn/${info.lesson.id}`)}>
          {fresh ? "Start your first lesson" : `Continue · ~${info.lesson.minutes} min`}
        </PrimaryButton>
      </motion.div>
    </div>
  );
}

export function Home() {
  const nav = useNavigate();
  const profile = useStore((s) => s.profile);

  return (
    /* Screen height strictly locked to 100vh */
    <div className="flex flex-col h-screen overflow-hidden p-4 -m-4" style={{ background: V.base }}>

      {/* FIXED TOP HEADER (Greeting + Continue hero) */}
      <div className="shrink-0 z-30 flex flex-col gap-3 pb-2 shadow-sm" style={{ background: V.base }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold" style={{ color: V.text }}>
              {profile?.name ? `Good morning, ${profile.name}! 👋` : "Good morning! 👋"}
            </h1>
            <p className="text-[13px]" style={{ color: V.textSoft }}>Keep learning, keep growing.</p>
          </div>
          <button
            onClick={() => nav("/notifications")}
            aria-label="Notifications"
            className="flex items-center justify-center rounded-full shadow-sm"
            style={{ width: 40, height: 40, background: "#ffffff99" }}
          >
            <Bell size={18} color={V.mid} />
          </button>
        </div>

        <ContinueHero />
      </div>

      {/* ISOLATED SCROLLVIEW: Houses Journey without rewriting its 300+ lines */}
      <div className="flex-1 overflow-y-auto pr-1 pt-2 pb-6">
        <Journey />
      </div>

    </div>
  );
}
