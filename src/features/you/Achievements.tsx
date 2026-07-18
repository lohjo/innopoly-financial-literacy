import { useNavigate } from "react-router";
import { Award, ChevronLeft, Lock } from "lucide-react";
import { Card } from "../../components/primitives";
import { useStore } from "../../stores/store";
import { ACHIEVEMENTS } from "../../content/achievements";

/** Process achievements with the behavior that earned them (spec §5.1: process only). */
export function Achievements() {
  const nav = useNavigate();
  const earned = useStore((s) => s.achievements);
  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => nav("/you")} className="flex items-center gap-1 text-[13px] font-bold self-start" style={{ color: "var(--muted-foreground)", minHeight: 44 }}>
        <ChevronLeft size={16} /> You
      </button>
      <div>
        <h1 className="text-[22px]">Achievements</h1>
        <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
          Every badge names something you did — asking, holding, retrying. None are for streaks of luck.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {ACHIEVEMENTS.map((a) => {
          const has = earned.includes(a.id);
          return (
            <Card key={a.id} className="p-4 flex items-start gap-3" style={{ opacity: has ? 1 : 0.6 }}>
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 40, height: 40, background: has ? "var(--brand-soft)" : "var(--muted)", color: has ? "var(--brand-hover)" : "var(--muted-foreground)" }}
              >
                {has ? <Award size={20} /> : <Lock size={16} />}
              </div>
              <div>
                <p className="font-bold text-[15px]">{a.title}</p>
                <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
                  {a.body}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
