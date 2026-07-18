import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { Card, Pill } from "../../components/primitives";
import { useStore } from "../../stores/store";
import { projectMastery } from "../mastery/project";
import { masteryBand } from "../mastery/bkt";
import { CONCEPTS } from "../mastery/concepts";
import { CHAPTERS } from "../../content/chapters";

const BAND_META = {
  ready: { label: "Ready to learn", tone: "muted" as const },
  learning: { label: "Learning", tone: "info" as const },
  durable: { label: "Durable", tone: "success" as const },
};

/** Progress: mastery per concept with uncertainty + inspectable evidence — "Why this estimate?"
    (spec §3.7 mastery memory, §6.2). Private by default; no leaderboard here. */
export function Progress() {
  const nav = useNavigate();
  const evidence = useStore((s) => s.evidence);
  const mastery = projectMastery(evidence);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => nav("/you")} className="flex items-center gap-1 text-[13px] font-bold self-start" style={{ color: "var(--muted-foreground)", minHeight: 44 }}>
        <ChevronLeft size={16} /> You
      </button>
      <div>
        <h1 className="text-[22px]">Progress</h1>
        <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
          Learning evidence, not vanity counts. Dashed ring = still uncertain.
        </p>
      </div>

      {CHAPTERS.map((ch) => {
        const concepts = CONCEPTS.filter((c) => c.chapterId === ch.id);
        if (concepts.length === 0) return null;
        return (
          <section key={ch.id} aria-label={ch.title}>
            <h3 className="text-[13px] mb-2" style={{ color: "var(--muted-foreground)" }}>
              {ch.title}
            </h3>
            <div className="flex flex-col gap-2">
              {concepts.map((c) => {
                const m = mastery[c.id];
                const band = m ? masteryBand(m) : "ready";
                const meta = BAND_META[band];
                const uncertain = m ? m.uncertainty > 0.45 : true;
                const pct = m ? Math.round(m.pKnown * 100) : 0;
                const conceptEvidence = evidence.filter((e) => e.concepts.includes(c.id) && e.type !== "reflection").slice(-4).reverse();
                const open = openId === c.id;
                return (
                  <Card key={c.id} className="p-3">
                    <button className="w-full flex items-center gap-3 text-left" onClick={() => setOpenId(open ? null : c.id)} aria-expanded={open}>
                      {/* mastery ring; dashed when uncertain (spec §6.2) */}
                      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden className="shrink-0">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--muted)" strokeWidth="4" />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke={band === "durable" ? "var(--success)" : "var(--brand)"}
                          strokeWidth="4"
                          strokeDasharray={uncertain ? `${(pct / 100) * 100.5 * 0.6} 6` : `${(pct / 100) * 100.5} 200`}
                          strokeLinecap="round"
                          transform="rotate(-90 20 20)"
                        />
                        <text x="20" y="24" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--foreground)">
                          {m ? pct : "–"}
                        </text>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[14px]">{c.label}</p>
                        <p className="text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>
                          {c.meaning}
                        </p>
                      </div>
                      <Pill tone={meta.tone} status>
                        {meta.label}
                      </Pill>
                      <ChevronDown size={16} color="var(--muted-foreground)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform var(--dur-fast)" }} />
                    </button>
                    {open && (
                      <div className="mt-3 pt-3 text-[12.5px] flex flex-col gap-1.5" style={{ borderTop: "1px solid var(--border)" }}>
                        <p className="font-bold text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                          Why this estimate
                        </p>
                        {m ? (
                          <>
                            <p style={{ color: "var(--muted-foreground)" }}>
                              {m.evidenceCount} evidence event{m.evidenceCount === 1 ? "" : "s"} · uncertainty {Math.round(m.uncertainty * 100)}% ·
                              recalculated from the full ledger, never set by an AI.
                            </p>
                            {conceptEvidence.map((e) => (
                              <p key={e.id}>
                                • {e.type.replace("_", " ")}
                                {e.supportLevel > 0 ? ` (hint ${e.supportLevel} used — counts less)` : ""}
                              </p>
                            ))}
                          </>
                        ) : (
                          <p style={{ color: "var(--muted-foreground)" }}>No evidence yet — nothing counted from just reading.</p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
