import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, ChevronUp, Lock, Phone, Star, Sparkles, Moon } from "lucide-react";
import { useStore } from "../../stores/store";
import { CHAPTERS } from "../../content/chapters";
import { lessonById } from "../../content/lessons";
import { scenarioById } from "../../content/scenarios";
import { useMotionPrefs } from "../../motion";
import { PrimaryButton } from "../../components/primitives";
import { currentLessonId } from "./currentLesson";

const NODE_GAP_Y = 115; // Generous vertical gap so nodes don't stack
const NODE_D = 48;     // Compact circle node size
const CALL_D = 40;     // Compact phone call node size (≥40px hit target)
const OFFSET_FRACTIONS = [0, 0.25, 0.35, 0.20, 0, -0.20, -0.35, -0.25]; // Wide curve swing

const FLAVORS = [
  { a: "#6ED98E", b: "#2FA85E" },
  { a: "#8FE0A8", b: "#3CB86E" },
  { a: "#5FCB8A", b: "#248C52" },
  { a: "#A3E8B8", b: "#4CC17E" },
  { a: "#7BD99C", b: "#33A362" },
];

type Step =
  | { kind: "lesson"; id: string; title: string; minutes: number; index: number }
  | { kind: "call"; id: string; title: string; lessonId: string };

function buildSteps(chapter: (typeof CHAPTERS)[number]): Step[] {
  const steps: Step[] = [];
  chapter.lessons.forEach((l, i) => {
    steps.push({ kind: "lesson", id: l.id, title: l.title, minutes: l.minutes, index: i });
    const doc = lessonById(l.id);
    if (doc?.scenarioId) {
      const scenario = scenarioById(doc.scenarioId);
      if (scenario) steps.push({ kind: "call", id: scenario.id, title: scenario.title, lessonId: l.id });
    }
  });
  return steps;
}

function usePath(steps: Step[], width: number) {
  return useMemo(() => {
    const points = steps.map((s, i) => ({
      x: width / 2 + OFFSET_FRACTIONS[i % OFFSET_FRACTIONS.length] * width,
      y: i * NODE_GAP_Y + NODE_D / 2 + 45, // Top padding ensures node 1 stays clearly below header
    }));
    let d = "";
    points.forEach((p, i) => {
      if (i === 0) { d += `M ${p.x} ${p.y} `; return; }
      const prev = points[i - 1];
      const midY = (prev.y + p.y) / 2;
      d += `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y} `;
    });
    const height = points.length ? points[points.length - 1].y + NODE_D + 35 : 0;
    return { points, d, height };
  }, [steps, width]);
}

/* Background Scenery: Uses a 4x3 non-overlapping grid with randomized internal offsets */
function Scenery({ seed, height, width }: { seed: number; height: number; width: number }) {
  const items = useMemo(() => {
    const rand = (n: number) => {
      const x = Math.sin(seed * 999 + n * 37.7) * 10000;
      return x - Math.floor(x);
    };

    const rows = 4;
    const cols = 3;
    const result = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const size = 12 + rand(index + 20) * 14;
        const shapeType = index % 6; // Cycles 1 shape type sequentially

        // Cell math ensures zero overlapping shapes
        const leftPercent = (c / cols) * 80 + 10 + (rand(index + 5) * 12 - 6);
        const topPx = (r / rows) * (height - 60) + 30 + (rand(index + 15) * 20 - 10);

        result.push({
          left: Math.max(5, Math.min(85, leftPercent)),
          top: topPx,
          size,
          shapeType,
          opacity: 0.22 + rand(index + 40) * 0.25,
        });
      }
    }

    return result;
  }, [seed, height, width]);

  return (
    <>
      {items.map((it, i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center pointer-events-none"
          style={{
            left: `${it.left}%`,
            top: it.top,
            opacity: it.opacity,
          }}
        >
          {/* Shape 1: Star */}
          {it.shapeType === 0 && <Star size={it.size} color="#ffffff" fill="#ffffff" />}

          {/* Shape 2: Sparkles */}
          {it.shapeType === 1 && <Sparkles size={it.size * 1.2} color="#ffffff" />}

          {/* Shape 3: Moon */}
          {it.shapeType === 2 && <Moon size={it.size} color="#ffffff" fill="#ffffff" />}

          {/* Shape 4: 4-Point Diamond Star */}
          {it.shapeType === 3 && (
            <svg width={it.size} height={it.size} viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          )}

          {/* Shape 5: Hollow Glass Ring */}
          {it.shapeType === 4 && (
            <svg width={it.size} height={it.size} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" stroke="#ffffff" strokeWidth="2.5" fill="none" />
            </svg>
          )}

          {/* Shape 6: Glass Cloud Pill */}
          {it.shapeType === 5 && (
            <div
              style={{
                width: it.size * 1.8,
                height: it.size * 0.85,
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.7)",
                boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
              }}
            />
          )}
        </div>
      ))}
    </>
  );
}

export function ChapterPath({
  chapter,
  chapterIndex,
  lessonsCompleted,
  callsCompleted,
  currentId,
  nav,
}: {
  chapter: (typeof CHAPTERS)[number];
  chapterIndex: number;
  lessonsCompleted: string[];
  callsCompleted: { scenarioId: string }[];
  currentId: string | undefined;
  nav: ReturnType<typeof useNavigate>;
}) {
  const steps = buildSteps(chapter);
  const { collapse } = useMotionPrefs();

  const headerRef = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState(340);
  
  useLayoutEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  const { points, d, height } = usePath(steps, width);

  const chapterLessonIds = chapter.lessons.map((l) => l.id);
  const hasCurrent = currentId ? chapterLessonIds.includes(currentId) : false;
  const currentLesson = hasCurrent ? chapter.lessons.find((l) => l.id === currentId) : undefined;
  const chapterDone = chapterLessonIds.every((id) => lessonsCompleted.includes(id));
  const [open, setOpen] = useState(hasCurrent || (!chapterDone && chapterIndex === 0));

  return (
    <div className="relative w-full">
      {/* Glossy Liquid Glass Chapter Header Pill */}
      <div className="sticky top-0 z-20 w-full">
        <button
          ref={headerRef}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="w-full text-left px-5 py-4 relative overflow-hidden transition-[border-radius] duration-300 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #5ECB8D 0%, #30A35C 100%)",
            border: "1.5px solid rgba(255, 255, 255, 0.65)",
            borderBottom: open ? "none" : "1.5px solid rgba(255, 255, 255, 0.65)",
            borderRadius: open ? "28px 28px 0 0" : "28px",
            boxShadow: "0 8px 24px -6px rgba(40, 140, 80, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
          }}
        >
          <div 
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full pointer-events-none" 
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)" }} 
          />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="min-w-0 pr-2">
              <h2 className="text-[18px] font-extrabold text-white tracking-tight drop-shadow-sm">
                {chapter.title}
              </h2>
              <p className="text-[12px] mt-0.5 font-bold text-emerald-100 opacity-95 leading-snug">
                {chapter.tagline}
              </p>
            </div>

            <div
              className="flex items-center justify-center rounded-full shrink-0 shadow-inner"
              style={{
                width: 36,
                height: 36,
                background: "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
              }}
            >
              {open ? (
                <ChevronUp size={20} color="#ffffff" strokeWidth={3} />
              ) : (
                <ChevronDown size={20} color="#ffffff" strokeWidth={3} />
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Accordion Liquid Glass Lesson Body Container */}
      <div
        className="w-full relative z-0 overflow-hidden transition-[height] duration-450 ease-[cubic-bezier(.22,1,.36,1)]"
        style={{ height: open ? height : 0 }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{
            height,
            background: "linear-gradient(180deg, rgba(180, 235, 198, 0.85) 0%, rgba(145, 215, 170, 0.8) 50%, rgba(115, 195, 145, 0.8) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderLeft: "1.5px solid rgba(255, 255, 255, 0.65)",
            borderRight: "1.5px solid rgba(255, 255, 255, 0.65)",
            borderBottom: "1.5px solid rgba(255, 255, 255, 0.65)",
            borderRadius: "0 0 28px 28px",
            boxShadow: "0 12px 28px -10px rgba(35, 110, 65, 0.25)",
          }}
        >
          <Scenery seed={chapterIndex + 1} height={height} width={width} />

          <svg width={width} height={height} className="absolute inset-0 w-full h-full pointer-events-none">
            <path d={d} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.45} />
            <path d={d} fill="none" stroke="#3DA366" strokeWidth={4} strokeDasharray="1 14" strokeLinecap="round" opacity={0.75} />
          </svg>

          {steps.map((step, i) => {
            const p = points[i];

            if (step.kind === "call") {
              const done = callsCompleted.some((c) => c.scenarioId === step.id);
              return (
                <motion.button
                  key={step.id}
                  onClick={() => nav(`/call/${step.id}`)}
                  whileTap={collapse ? undefined : { scale: 0.96 }}
                  className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 z-0"
                  style={{ left: p.x, top: p.y, width: CALL_D + 90 }}
                >
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: CALL_D, height: CALL_D,
                      background: done ? "linear-gradient(135deg, rgba(94,224,140,.95), rgba(36,140,82,.95))" : "linear-gradient(135deg, rgba(255,255,255,.95), rgba(230,255,235,.9))",
                      boxShadow: done ? "0 4px 10px -3px rgba(36,140,82,.5)" : "0 3px 8px -2px rgba(94,224,140,.35)",
                      border: "2px solid rgba(255,255,255,.9)",
                    }}
                  >
                    <Phone size={15} color={done ? "#fff" : "#2FA85E"} />
                  </div>
                  <span className="text-[10px] font-extrabold text-center leading-tight px-1.5 py-0.5 rounded-full shadow-sm" style={{ color: "#0F4A26", background: "#ffffffdd" }}>
                    {step.title}
                  </span>
                </motion.button>
              );
            }

            const done = lessonsCompleted.includes(step.id);
            const current = step.id === currentId;
            const locked = !done && !current;
            const flavor = FLAVORS[step.index % FLAVORS.length];
            const size = current ? NODE_D + 8 : NODE_D;

            return (
              <motion.button
                key={step.id}
                disabled={locked}
                onClick={() => nav(`/learn/${step.id}`)}
                whileTap={locked || collapse ? undefined : { scale: 0.96 }}
                className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 z-0"
                style={{ left: p.x, top: p.y, width: size + 100 }}
              >
                {current && (
                  // reduced motion: same ring, just static (no ping)
                  <div className={`absolute rounded-full pointer-events-none ${collapse ? "" : "animate-ping"}`} style={{ width: size + 10, height: size + 10, top: -5, left: "calc(50% - " + (size + 10)/2 + "px)", background: `${flavor.a}66` }} />
                )}
                <div
                  className="relative flex items-center justify-center rounded-full shrink-0 font-extrabold text-[15px]"
                  style={{
                    width: size, height: size,
                    background: locked
                      ? "linear-gradient(180deg, rgba(230,238,232,0.85), rgba(200,215,205,0.85))"
                      : `linear-gradient(180deg, ${flavor.a}, ${flavor.b})`,
                    color: locked ? "#7A8F82" : "#fff",
                    border: "3px solid #ffffff",
                    boxShadow: locked
                      ? "0 3px 8px -2px rgba(0,0,0,.1)"
                      : `0 6px 14px -4px ${flavor.b}aa, inset 0 1.5px 3px rgba(255,255,255,0.4)`,
                  }}
                >
                  <div className="absolute rounded-full pointer-events-none" style={{ width: "55%", height: "30%", top: "12%", left: "22%", background: "#ffffff40" }} />
                  {done ? <Check size={18} strokeWidth={3.5} /> : locked ? <Lock size={15} /> : step.index + 1}
                </div>
                <span
                  className="text-[10.5px] font-extrabold text-center leading-tight px-2 py-0.5 rounded-full shadow-sm"
                  style={{ color: "#0F4A26", background: locked ? "#ffffffaa" : "#ffffffee", opacity: locked ? 0.75 : 1 }}
                >
                  {step.title}
                </span>
                {current && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm" style={{ background: flavor.a, color: "#fff" }}>
                    ★ START · ~{step.minutes} MIN
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sticky Start card: persists while the current lesson's chapter is open
          (Brilliant path grammar — the next action is always one tap away). */}
      <AnimatePresence>
        {open && hasCurrent && currentLesson && (
          <motion.div
            initial={collapse ? { opacity: 0 } : { opacity: 0, y: 64 }}
            animate={{ opacity: 1, y: 0 }}
            exit={collapse ? { opacity: 0 } : { opacity: 0, y: 64 }}
            transition={collapse ? { duration: 0.08 } : { type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 z-30 pointer-events-none"
            style={{ bottom: "calc(72px + env(safe-area-inset-bottom))" }}
          >
            <div
              className="pointer-events-auto mx-auto w-full max-w-[430px] md:max-w-[720px] px-4 py-3 flex items-center gap-3 rounded-[var(--radius-card)] shadow-lg"
              style={{ background: "var(--card)", border: "1px solid var(--border)", maxWidth: "min(430px, calc(100% - 32px))" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                  Up next · ~{currentLesson.minutes} min
                </p>
                <p className="text-[14px] font-extrabold truncate" style={{ color: "var(--foreground)" }}>
                  {currentLesson.title}
                </p>
              </div>
              <PrimaryButton className="!w-auto shrink-0 px-5" onClick={() => nav(`/learn/${currentLesson.id}`)}>
                Start
              </PrimaryButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Journey() {
  const nav = useNavigate();
  const lessonsCompleted = useStore((s) => s.lessonsCompleted);
  const callsCompleted = useStore((s) => s.callsCompleted);

  const currentId = currentLessonId(lessonsCompleted);

  return (
    <div className="flex flex-col gap-4 w-full">
      {CHAPTERS.map((chapter, ci) => (
        <section key={chapter.id} aria-label={chapter.title} className="w-full">
          <ChapterPath
            chapter={chapter}
            chapterIndex={ci}
            lessonsCompleted={lessonsCompleted}
            callsCompleted={callsCompleted}
            currentId={currentId}
            nav={nav}
          />
        </section>
      ))}
    </div>
  );
}