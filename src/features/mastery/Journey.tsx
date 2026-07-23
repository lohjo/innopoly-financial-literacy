import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, Lock, Phone, Star } from "lucide-react";
import { useStore } from "../../stores/store";
import { CHAPTERS } from "../../content/chapters";
import { lessonById } from "../../content/lessons";
import { scenarioById } from "../../content/scenarios";
import { CylinderNode, TouchRipple, CHARACTER_IMAGES, Scenery } from "./JourneyDecor";

const NODE_GAP_Y = 120;
const NODE_D = 56;
const CALL_D = 40;
const OFFSET_FRACTIONS = [0, 0.25, 0.35, 0.20, 0, -0.20, -0.35, -0.25];

const SPRING_CURTAIN = { type: "spring" as const, stiffness: 280, damping: 32 };
const SPRING_PRESS = { type: "spring" as const, stiffness: 420, damping: 18 };
const SPRING_POP = { type: "spring" as const, stiffness: 340, damping: 20 };
const SPRING_CHEVRON = { type: "spring" as const, stiffness: 300, damping: 22 };

const FLAVORS = [
  { a: "var(--brand)", b: "var(--brand-hover)" },
  { a: "var(--success)", b: "var(--brand-hover)" },
  { a: "var(--brand)", b: "var(--success)" },
  { a: "var(--brand-hover)", b: "var(--brand)" },
  { a: "var(--success)", b: "var(--brand)" },
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
      y: i * NODE_GAP_Y + NODE_D / 2 + 50,
    }));
    let d = "";
    points.forEach((p, i) => {
      if (i === 0) { d += `M ${p.x} ${p.y} `; return; }
      const prev = points[i - 1];
      const midY = (prev.y + p.y) / 2;
      d += `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y} `;
    });
    const height = points.length ? points[points.length - 1].y + NODE_D + 40 : 0;
    return { points, d, height };
  }, [steps, width]);
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

  const pathRef = useRef<SVGPathElement>(null);
  const [pawPoints, setPawPoints] = useState<{ x: number; y: number; angle: number }[]>([]);

  useLayoutEffect(() => {
    if (!pathRef.current || !d) return;
    const el = pathRef.current;
    const total = el.getTotalLength();
    if (!total) return;
    const spacing = 22;
    const count = Math.floor(total / spacing);
    const pts: { x: number; y: number; angle: number }[] = [];
    for (let i = 1; i < count; i++) {
      const len = i * spacing;
      const p = el.getPointAtLength(len);
      const pBefore = el.getPointAtLength(Math.max(0, len - 1));
      const pAfter = el.getPointAtLength(Math.min(total, len + 1));
      const angle = (Math.atan2(pAfter.y - pBefore.y, pAfter.x - pBefore.x) * 180) / Math.PI + 90;
      pts.push({ x: p.x, y: p.y, angle });
    }
    setPawPoints(pts);
  }, [d]);

  const chapterLessonIds = chapter.lessons.map((l) => l.id);
  const hasCurrent = currentId ? chapterLessonIds.includes(currentId) : false;
  const chapterDone = chapterLessonIds.every((id) => lessonsCompleted.includes(id));
  const [open, setOpen] = useState(hasCurrent || (!chapterDone && chapterIndex === 0));

  return (
    <div className="relative w-full overflow-hidden">
      <div className="sticky top-0 z-20 w-full">
        <TouchRipple color="rgba(255,255,255,.4)">
          <motion.button
            ref={headerRef}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            whileTap={{ scale: 0.985 }}
            transition={SPRING_PRESS}
            className="w-full text-left px-5 py-4 relative shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-hover) 100%)",
              border: "1.5px solid rgba(255, 255, 255, 0.65)",
              borderBottom: open ? "none" : "1.5px solid rgba(255, 255, 255, 0.65)",
              borderRadius: open ? "28px 28px 0 0" : "28px",
              boxShadow: "0 8px 24px -6px color-mix(in srgb, var(--brand-hover) 40%, transparent), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
            }}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)" }} />
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="min-w-0 pr-2">
                <h2 className="text-[18px] font-extrabold tracking-tight drop-shadow-sm" style={{ color: "var(--primary-foreground)" }}>
                  {chapter.title}
                </h2>
                <p className="text-[12px] mt-0.5 font-bold opacity-95 leading-snug" style={{ color: "var(--primary-foreground)" }}>
                  {chapter.tagline}
                </p>
              </div>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={SPRING_CHEVRON}
                className="flex items-center justify-center rounded-full shrink-0 shadow-inner"
                style={{ width: 36, height: 36, background: "rgba(255, 255, 255, 0.3)", backdropFilter: "blur(4px)", border: "1px solid rgba(255, 255, 255, 0.5)" }}
              >
                <ChevronDown size={20} color="var(--primary-foreground)" strokeWidth={3} />
              </motion.div>
            </div>
          </motion.button>
        </TouchRipple>
      </div>

      <motion.div className="w-full relative z-0 overflow-hidden" animate={{ height: open ? height : 0 }} transition={SPRING_CURTAIN}>
        <div
          className="relative w-full overflow-hidden"
          style={{
            height,
            background: "color-mix(in srgb, var(--brand) 18%, var(--background))",
            borderLeft: "1.5px solid var(--border)",
            borderRight: "1.5px solid var(--border)",
            borderBottom: "1.5px solid var(--border)",
            borderRadius: "0 0 28px 28px",
            boxShadow: "0 12px 28px -10px rgba(0,0,0,.12)",
          }}
        >
          <Scenery seed={chapterIndex + 1} height={height} width={width} />

          <svg width={width} height={height} className="absolute inset-0 w-full h-full pointer-events-none">
            <path ref={pathRef} d={d} fill="none" stroke="none" />
            {pawPoints.map((pt, idx) => (
              <g key={idx} transform={`translate(${pt.x}, ${pt.y}) rotate(${pt.angle}) scale(${idx % 2 === 0 ? 1 : -1}, 1)`} opacity={0.55}>
                <ellipse cx="0" cy="0" rx="4.2" ry="5.2" fill="var(--muted-foreground)" />
                <ellipse cx="-4" cy="-6" rx="1.6" ry="2" fill="var(--muted-foreground)" />
                <ellipse cx="0" cy="-7.5" rx="1.6" ry="2" fill="var(--muted-foreground)" />
                <ellipse cx="4" cy="-6" rx="1.6" ry="2" fill="var(--muted-foreground)" />
              </g>
            ))}
          </svg>

          {points.length > 0 && (
            <div
              className="absolute pointer-events-none flex flex-col items-center"
              style={{
                left: Math.max(20, points[Math.floor(points.length / 2)].x - width * 0.72),
                top: points[Math.floor(points.length / 2)].y - 40,
              }}
            >
              <img src={CHARACTER_IMAGES[chapterIndex % CHARACTER_IMAGES.length]} alt="" style={{ width: 84 }} />
            </div>
          )}

          <AnimatePresence>
            {steps.map((step, i) => {
              const p = points[i];

              if (step.kind === "call") {
                const done = callsCompleted.some((c) => c.scenarioId === step.id);
                return (
                  <motion.button
                    key={step.id}
                    onClick={() => nav(`/call/${step.id}`)}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.88 }}
                    transition={{ ...SPRING_POP, delay: i * 0.05 }}
                    className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 z-0"
                    style={{ left: p.x, top: p.y, width: CALL_D + 90 }}
                  >
                    <TouchRipple color="rgba(255,255,255,.4)">
                      <CylinderNode size={CALL_D} colorTop={done ? "var(--video)" : "var(--card)"}>
                        <Phone size={15} color={done ? "var(--primary-foreground)" : "var(--video)"} />
                      </CylinderNode>
                    </TouchRipple>
                    <span className="text-[10px] font-extrabold text-center leading-tight px-1.5 py-0.5 rounded-full shadow-sm" style={{ color: "var(--foreground)", background: "var(--card)" }}>
                      {step.title}
                    </span>
                  </motion.button>
                );
              }

              const done = lessonsCompleted.includes(step.id);
              const current = step.id === currentId;
              const locked = !done && !current;
              const flavor = FLAVORS[step.index % FLAVORS.length];
              const size = current ? NODE_D + 10 : NODE_D;
              const labelOnLeft = OFFSET_FRACTIONS[i % OFFSET_FRACTIONS.length] > 0;

              return (
                <motion.div
                  key={step.id}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...SPRING_POP, delay: i * 0.05 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-0 flex items-center gap-3"
                  style={{ left: p.x, top: p.y, flexDirection: labelOnLeft ? "row-reverse" : "row" }}
                >
                  <button disabled={locked} onClick={() => nav(`/learn/${step.id}`)} className="relative shrink-0">
                    {current && (
                      <motion.div
                        className="absolute rounded-full pointer-events-none"
                        style={{ width: size + 14, height: size + 14, top: -7, left: -7, background: "color-mix(in srgb, var(--brand) 35%, transparent)" }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    {locked ? (
                      <CylinderNode size={size} colorTop="var(--muted)">
                        <Lock size={17} color="var(--muted-foreground)" />
                      </CylinderNode>
                    ) : (
                      <TouchRipple color="rgba(255,255,255,.55)">
                        <CylinderNode size={size} colorTop={flavor.a}>
                          {done ? (
                            <Check size={20} strokeWidth={3.5} color="var(--primary-foreground)" />
                          ) : (
                            <Star size={20} strokeWidth={2.5} color="var(--primary-foreground)" fill="var(--primary-foreground)" />
                          )}
                        </CylinderNode>
                      </TouchRipple>
                    )}
                  </button>

                  <div className="flex flex-col gap-1 shrink-0" style={{ alignItems: labelOnLeft ? "flex-end" : "flex-start", maxWidth: 130 }}>
                    <span
                      className="text-[10.5px] font-extrabold text-center leading-tight px-2 py-0.5 rounded-full shadow-sm"
                      style={{ color: "var(--foreground)", background: "var(--card)", opacity: locked ? 0.7 : 1 }}
                    >
                      {step.title}
                    </span>
                    {current && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm" style={{ background: flavor.a, color: "var(--primary-foreground)" }}>
                        ★ START · ~{step.minutes} MIN
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export function Journey() {
  const nav = useNavigate();
  const lessonsCompleted = useStore((s) => s.lessonsCompleted);
  const callsCompleted = useStore((s) => s.callsCompleted);

  const flat = CHAPTERS.flatMap((c) => c.lessons.map((l) => l.id));
  const currentId = flat.find((id) => !lessonsCompleted.includes(id));

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