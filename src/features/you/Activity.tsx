import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { BookOpen, ChevronLeft, Phone } from "lucide-react";
import { Card, Pill } from "../../components/primitives";
import { useStore } from "../../stores/store";
import { lessonById } from "../../content/lessons";
import { scenarioById } from "../../content/scenarios";

/** Activity history: episodes and calls (spec §6.1 You > Activity). */
export function Activity() {
  const nav = useNavigate();
  const lessonsCompleted = useStore((s) => s.lessonsCompleted);
  const calls = useStore((s) => s.callsCompleted);

  const items: { at: number; node: ReactNode }[] = [
    ...lessonsCompleted.map((id, i) => ({
      at: i, // completion order; lesson evidence carries true timestamps
      node: (
        <Card key={`l-${id}`} className="p-3 flex items-center gap-3">
          <BookOpen size={18} color="var(--brand-hover)" />
          <div className="flex-1">
            <p className="font-bold text-[14px]">{lessonById(id)?.title ?? id}</p>
            <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              lesson episode
            </p>
          </div>
          <button className="text-[13px] font-bold" style={{ color: "var(--brand-hover)", minHeight: 44 }} onClick={() => nav(`/learn/${id}`)}>
            Replay
          </button>
        </Card>
      ),
    })),
    ...calls.map((c, i) => ({
      at: 1000 + i,
      node: (
        <Card key={`c-${c.scenarioId}-${c.at}`} className="p-3 flex items-center gap-3">
          <Phone size={18} color="var(--video)" />
          <div className="flex-1">
            <p className="font-bold text-[14px]">{scenarioById(c.scenarioId)?.title ?? c.scenarioId}</p>
            <div className="flex gap-1 flex-wrap mt-0.5">
              {Object.entries(c.levels).slice(0, 3).map(([dim, level]) => (
                <Pill key={dim} tone="video">
                  {dim}: {level}
                </Pill>
              ))}
            </div>
          </div>
          <button className="text-[13px] font-bold" style={{ color: "var(--video)", minHeight: 44 }} onClick={() => nav(`/call/${c.scenarioId}`)}>
            Retry
          </button>
        </Card>
      ),
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => nav("/you")} className="flex items-center gap-1 text-[13px] font-bold self-start" style={{ color: "var(--muted-foreground)", minHeight: 44 }}>
        <ChevronLeft size={16} /> You
      </button>
      <h1 className="text-[22px]">Activity</h1>
      {items.length === 0 ? (
        <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
          Nothing yet — your first episode will land here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">{items.map((i) => i.node)}</div>
      )}
    </div>
  );
}
