// src/features/home/Home.tsx
import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import { Card } from "../../components/primitives";
import { useStore } from "../../stores/store";
import { Journey } from "../mastery/Journey"; // Keep Journey cleanly isolated!

export function Home() {
  const nav = useNavigate();
  const profile = useStore((s) => s.profile);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    /* Screen height strictly locked to 100vh */
    <div className="flex flex-col h-screen overflow-hidden p-4 -m-4" style={{ background: "var(--background)" }}>

      {/* FIXED TOP HEADER (Greeting + 7-Day Progress) */}
      <div className="shrink-0 z-30 flex flex-col gap-3 pb-5 shadow-sm" style={{ background: "var(--background)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold" style={{ color: "var(--foreground)" }}>
              {profile?.name ? `Good morning, ${profile.name}! 👋` : "Good morning! 👋"}
            </h1>
            <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Keep learning, keep growing.</p>
          </div>
          <button
            onClick={() => nav("/notifications")}
            aria-label="Notifications"
            className="flex items-center justify-center rounded-full shadow-sm"
            style={{ width: 40, height: 40, background: "var(--card)" }}
          >
            <Bell size={18} color="var(--brand)" />
          </button>
        </div>

        <Card className="p-3.5 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="text-[12.5px] font-bold mb-2.5" style={{ color: "var(--foreground)" }}>7 day progress</div>
          <div className="flex items-center justify-between">
            {days.map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <div
                  className="flex items-center justify-center rounded-full text-[11px] font-bold"
                  style={{
                    width: 26, height: 26,
                    background: i <= dayIndex ? "var(--brand)" : "var(--muted)",
                    color: i <= dayIndex ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {i <= dayIndex ? "✓" : ""}
                </div>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{d}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ISOLATED SCROLLVIEW: Houses Journey without rewriting its 300+ lines */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 pt-3 pb-6">
        <Journey />
      </div>

    </div>
  );
}