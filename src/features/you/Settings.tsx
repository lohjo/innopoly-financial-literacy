import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Clock } from "lucide-react";
import { Card, SecondaryButton } from "../../components/primitives";
import { resetAll, resetClass, setState, useStore, type MemoryClass } from "../../stores/store";

const MEMORY_CLASSES: { id: MemoryClass; label: string; desc: string }[] = [
  { id: "profile", label: "Profile", desc: "your name, goal and jurisdiction" },
  { id: "evidence", label: "Learning evidence", desc: "every puzzle, quiz, review and call decision — mastery recalculates from this" },
  { id: "progress", label: "Progress & rewards", desc: "XP, streak, completed lessons, calls, achievements" },
  { id: "preferences", label: "Preferences", desc: "captions, motion, theme" },
];

/** Settings: preferences + the memory inspector — inspect and reset per class (spec §3.7).
    Includes the dev-only clock for testing spaced review. */
export function Settings() {
  const nav = useNavigate();
  const prefs = useStore((s) => s.prefs);
  const evidenceCount = useStore((s) => s.evidence.length);
  const timeOffset = useStore((s) => s.timeOffsetMs);
  const [confirming, setConfirming] = useState<MemoryClass | "all" | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => nav("/you")} className="flex items-center gap-1 text-[13px] font-bold self-start" style={{ color: "var(--muted-foreground)", minHeight: 44 }}>
        <ChevronLeft size={16} /> You
      </button>
      <h1 className="text-[22px]">Settings</h1>

      <Card className="p-4 flex flex-col gap-3">
        <p className="font-bold text-[14px]">Accessibility & media</p>
        <label className="flex items-center justify-between text-[14px]" style={{ minHeight: 44 }}>
          <span>Captions in calls</span>
          <input type="checkbox" checked={prefs.captions} onChange={(e) => setState((s) => ({ prefs: { ...s.prefs, captions: e.target.checked } }))} style={{ width: 20, height: 20, accentColor: "var(--brand)" }} />
        </label>
        <p className="text-[12px] -mt-2" style={{ color: "var(--muted-foreground)" }}>
          Reduced motion follows your system setting automatically.
        </p>
      </Card>

      {/* memory inspector (spec §3.7: inspect / reset per class) */}
      <Card className="p-4 flex flex-col gap-3">
        <p className="font-bold text-[14px]">What Finfy remembers</p>
        <p className="text-[12.5px] -mt-1" style={{ color: "var(--muted-foreground)" }}>
          Everything lives on this device. Raw audio and video are never recorded; nothing here is inferred about your emotions, wealth, or
          identity. Reset any class — mastery just recalculates from what remains.
        </p>
        {MEMORY_CLASSES.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 py-1" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex-1">
              <p className="text-[14px] font-bold">
                {m.label}
                {m.id === "evidence" ? ` (${evidenceCount} events)` : ""}
              </p>
              <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                {m.desc}
              </p>
            </div>
            {confirming === m.id ? (
              <div className="flex gap-2">
                <button className="text-[12.5px] font-bold px-2" style={{ color: "var(--error)", minHeight: 44 }} onClick={() => { resetClass(m.id); setConfirming(null); }}>
                  Confirm
                </button>
                <button className="text-[12.5px] font-bold px-2" style={{ color: "var(--muted-foreground)", minHeight: 44 }} onClick={() => setConfirming(null)}>
                  Keep
                </button>
              </div>
            ) : (
              <button className="text-[12.5px] font-bold px-2" style={{ color: "var(--error)", minHeight: 44 }} onClick={() => setConfirming(m.id)}>
                Reset
              </button>
            )}
          </div>
        ))}
        <div style={{ borderTop: "1px solid var(--border)" }} className="pt-3">
          {confirming === "all" ? (
            <div className="flex gap-2">
              <SecondaryButton onClick={() => { resetAll(); setConfirming(null); nav("/"); }}>Yes, erase everything</SecondaryButton>
              <SecondaryButton onClick={() => setConfirming(null)}>Keep my data</SecondaryButton>
            </div>
          ) : (
            <SecondaryButton onClick={() => setConfirming("all")}>Erase everything and start over</SecondaryButton>
          )}
        </div>
      </Card>

      {import.meta.env.DEV && (
        <Card className="p-4 flex flex-col gap-2" raised>
          <p className="font-bold text-[13px] flex items-center gap-2">
            <Clock size={15} /> Dev clock (testing spaced review)
          </p>
          <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
            Offset: +{Math.round(timeOffset / 3600000)}h
          </p>
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setState((s) => ({ timeOffsetMs: s.timeOffsetMs + 72 * 3600000 }))}>+72h</SecondaryButton>
            <SecondaryButton onClick={() => setState({ timeOffsetMs: 0 })}>Reset clock</SecondaryButton>
          </div>
        </Card>
      )}

      <p className="text-[11.5px] px-1" style={{ color: "var(--muted-foreground)" }}>
        Finfy is gamified financial education with fictional values — it never gives personalized financial advice, never asks for account
        credentials, and never connects to your bank, CPF or payroll.
      </p>
    </div>
  );
}
