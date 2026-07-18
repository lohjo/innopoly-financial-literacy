import { useNavigate } from "react-router";
import { Check, Lock, Phone } from "lucide-react";
import { Card, Pill, PrimaryButton } from "../../components/primitives";
import { useStore } from "../../stores/store";
import { CHAPTERS } from "../../content/chapters";
import { lessonById } from "../../content/lessons";
import { scenarioById } from "../../content/scenarios";

/** Journey: the first-paycheck path — weeks and months, not a course catalog (spec §6.1).
    Node grammar (Brilliant course-path reference): done / current / locked. */
export function Journey() {
  const nav = useNavigate();
  const lessonsCompleted = useStore((s) => s.lessonsCompleted);
  const callsCompleted = useStore((s) => s.callsCompleted);

  const flat = CHAPTERS.flatMap((c) => c.lessons.map((l) => l.id));
  const currentId = flat.find((id) => !lessonsCompleted.includes(id));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px]">Your first-paycheck journey</h1>
        <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
          One path, in order. Each stop is a few minutes of doing, not reading.
        </p>
      </div>

      {CHAPTERS.map((chapter) => (
        <section key={chapter.id} aria-label={chapter.title}>
          <Card className="p-4 mb-3" raised>
            <h2 className="text-[17px]">{chapter.title}</h2>
            <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
              {chapter.tagline}
            </p>
          </Card>

          <div className="flex flex-col" role="list">
            {chapter.lessons.map((l, i) => {
              const done = lessonsCompleted.includes(l.id);
              const current = l.id === currentId;
              const locked = !done && !current;
              const doc = lessonById(l.id);
              const scenario = doc?.scenarioId ? scenarioById(doc.scenarioId) : undefined;
              const callDone = scenario && callsCompleted.some((c) => c.scenarioId === scenario.id);
              return (
                <div key={l.id} role="listitem">
                  <div className="flex items-center gap-3 py-2">
                    {/* node: color redundant with icon (spec §6.2 knowledge graph rule) */}
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: 44,
                        height: 44,
                        background: done ? "var(--brand)" : current ? "var(--brand-soft)" : "var(--muted)",
                        border: current ? "2px solid var(--brand)" : "2px solid transparent",
                        color: done ? "var(--primary-foreground)" : current ? "var(--brand-hover)" : "var(--muted-foreground)",
                      }}
                      aria-hidden
                    >
                      {done ? <Check size={20} strokeWidth={3} /> : locked ? <Lock size={16} /> : <span className="font-extrabold">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px]" style={{ color: locked ? "var(--muted-foreground)" : "var(--foreground)" }}>
                        {l.title}
                      </p>
                      <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                        ~{l.minutes} min{done ? " · done" : current ? " · up next" : ""}
                      </p>
                    </div>
                    {current && (
                      <div className="w-[96px]">
                        <PrimaryButton onClick={() => nav(`/learn/${l.id}`)} className="!text-[13px]">
                          Start
                        </PrimaryButton>
                      </div>
                    )}
                    {done && !current && (
                      <button className="text-[13px] font-bold" style={{ color: "var(--brand-hover)", minHeight: 44 }} onClick={() => nav(`/learn/${l.id}`)}>
                        Replay
                      </button>
                    )}
                  </div>

                  {/* interleaved rehearsal node after its lesson (spec: scenario nodes on the path) */}
                  {scenario && done && (
                    <div className="flex items-center gap-3 py-2 pl-6">
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          background: callDone ? "var(--video)" : "color-mix(in srgb, var(--video) 15%, transparent)",
                          color: callDone ? "#fff" : "var(--video)",
                        }}
                        aria-hidden
                      >
                        <Phone size={15} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[14px]">{scenario.title}</p>
                        <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                          rehearsal call{callDone ? " · done — retry any time" : ""}
                        </p>
                      </div>
                      <button className="text-[13px] font-bold" style={{ color: "var(--video)", minHeight: 44 }} onClick={() => nav(`/call/${scenario.id}`)}>
                        {callDone ? "Again" : "Rehearse"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <Card className="p-4">
        <Pill tone="muted" status>
          Coming later
        </Pill>
        <p className="text-[13.5px] mt-2" style={{ color: "var(--muted-foreground)" }}>
          Emergency funds · Taxes · CPF deep-dive · Insurance · Investing · Salary negotiation — the full 13-chapter track from the course
          map lands chapter by chapter.
        </p>
      </Card>
    </div>
  );
}
