import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Phone, X, Check } from "lucide-react";
import { scenarioById } from "../../content/scenarios";
import type { ScenarioSpec } from "./types";
import { callReducer, initCall, nodeById, type CallState } from "./callMachine";
import { buildDebrief, type Debrief } from "./debrief";
import { PrimaryButton, SecondaryButton, Pill, Num } from "../../components/primitives";
import { FinnAvatar } from "../copilot/FinnAvatar";
import { awardXp, recordEvidence, setState as setStore, touchStreak, unlockAchievement, useStore, now } from "../../stores/store";
import { CALL_MOVE_WEIGHT } from "../learning-episode/types";

export function VideoCoach() {
  const { scenarioId } = useParams();
  const scenario = useMemo(() => scenarioById(scenarioId ?? ""), [scenarioId]);
  const nav = useNavigate();
  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: "100dvh" }}>
        <p>That scenario doesn't exist yet.</p>
        <SecondaryButton onClick={() => nav("/today")}>Back</SecondaryButton>
      </div>
    );
  }
  return <Call scenario={scenario} key={scenario.id} />;
}

const VIDEO_BG = "linear-gradient(180deg, color-mix(in srgb, var(--video) 85%, #000) 0%, color-mix(in srgb, var(--video) 45%, #000) 100%)";

function Call({ scenario }: { scenario: ScenarioSpec }) {
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const [call, dispatch] = useReducer((s: CallState, e: Parameters<typeof callReducer>[1]) => callReducer(s, e, scenario), scenario, initCall);
  const [elapsed, setElapsed] = useState(0);
  const [freeText, setFreeText] = useState("");
  const captions = useStore((s) => s.prefs.captions);

  /* connecting: staged ring, then live (spec §8.2 call connect) */
  useEffect(() => {
    if (call.phase !== "connecting") return;
    const t = setTimeout(() => dispatch({ t: "CONNECTED" }), reduce ? 200 : 1400);
    return () => clearTimeout(t);
  }, [call.phase, reduce]);

  /* elapsed timer during live/paused */
  useEffect(() => {
    if (call.phase !== "live" && call.phase !== "paused") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [call.phase]);

  const node = nodeById(scenario, call.nodeId);

  /* --- BRIEF --- */
  if (call.phase === "brief") {
    return (
      <div className="mx-auto w-full max-w-[430px] px-5 py-8 flex flex-col gap-4" style={{ minHeight: "100dvh" }}>
        <button onClick={() => nav(-1)} aria-label="Close" className="self-start p-2 -m-2">
          <X size={22} color="var(--muted-foreground)" />
        </button>
        <Pill tone="video" status>
          Rehearsal call
        </Pill>
        <h1>{scenario.title}</h1>
        <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
          You'll talk to <span className="font-bold">{scenario.role.name}</span> — {scenario.role.descriptor}.
        </p>
        <div className="rounded-[var(--radius-card)] p-4 flex flex-col gap-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Your goal
          </p>
          <p className="text-[14px]">{scenario.learnerGoal}</p>
        </div>
        <div className="rounded-[var(--radius-card)] p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
            What you know
          </p>
          <ul className="text-[13.5px] flex flex-col gap-1.5 list-disc pl-4">
            {scenario.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[var(--radius-card)] p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
            What good looks like
          </p>
          <ul className="text-[13.5px] flex flex-col gap-1.5 list-disc pl-4">
            {scenario.successCriteria.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="mt-auto">
          <PrimaryButton tone="video" onClick={() => dispatch({ t: "BEGIN" })}>
            Continue
          </PrimaryButton>
        </div>
      </div>
    );
  }

  /* --- CONSENT (honest: text-only build, no fake mic prompt) --- */
  if (call.phase === "consent") {
    return (
      <div className="mx-auto w-full max-w-[430px] px-5 py-8 flex flex-col gap-4" style={{ minHeight: "100dvh" }}>
        <h2>Before the call</h2>
        <div className="rounded-[var(--radius-card)] p-4 flex flex-col gap-3 text-[14px]" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p>
            This rehearsal runs in <span className="font-bold">text mode</span> — you'll reply by tapping or typing. Voice calls aren't wired
            up in this build, so there's no microphone permission to grant.
          </p>
          <p style={{ color: "var(--muted-foreground)" }}>
            Nothing you say is scored on delivery — only your decisions and questions. You can pause or end at any time, with no penalty.
            Your camera is never used.
          </p>
          <p style={{ color: "var(--muted-foreground)" }}>
            The transcript stays on this device and appears in your debrief. Delete it any time from You → Settings.
          </p>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <PrimaryButton tone="video" onClick={() => dispatch({ t: "CONSENT_TEXT" })}>
            Continue with text
          </PrimaryButton>
          <SecondaryButton onClick={() => nav(-1)}>Not now</SecondaryButton>
        </div>
      </div>
    );
  }

  /* --- CONNECTING (Duolingo "Calling..." reference) --- */
  if (call.phase === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center gap-6" style={{ minHeight: "100dvh", background: VIDEO_BG }}>
        <div className="relative flex items-center justify-center">
          {!reduce && (
            <motion.div
              className="absolute rounded-full"
              style={{ width: 140, height: 140, border: "2px solid rgba(255,255,255,0.5)" }}
              animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <RoleAvatar name={scenario.role.name} size={110} speaking={false} />
        </div>
        <p className="text-[20px] font-bold text-white">Calling {scenario.role.name}…</p>
        <button
          onClick={() => nav(-1)}
          aria-label="Cancel call"
          className="flex items-center justify-center rounded-full"
          style={{ width: 56, height: 56, background: "var(--error)" }}
        >
          <Phone size={24} color="#fff" style={{ transform: "rotate(135deg)" }} />
        </button>
      </div>
    );
  }

  /* --- CLOSING: learner summarizes their decision (spec §4.2 Close) --- */
  if (call.phase === "closing") {
    const options =
      call.endReason === "goal_met"
        ? ["I held my plan and offered an alternative that fit it.", "I got the numbers I needed before deciding.", "I kept the relationship and the boundary."]
        : call.endReason === "impasse"
          ? ["The pressure worked on me this time.", "I decided before I had the numbers.", "I dropped my plan to avoid awkwardness."]
          : ["I stepped out — I'll come back to this one."];
    return (
      <div className="mx-auto w-full max-w-[430px] px-5 py-8 flex flex-col gap-4" style={{ minHeight: "100dvh" }}>
        <h2>In one line — what just happened?</h2>
        <p className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>
          Your words, your call. This goes in your debrief, not a score.
        </p>
        <div className="flex flex-col gap-2">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => dispatch({ t: "SUMMARY", text: o })}
              className="text-left text-[14px] px-4 py-3"
              style={{ borderRadius: "var(--radius-action)", border: "2px solid var(--border)", background: "var(--card)" }}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* --- DEBRIEF --- */
  if (call.phase === "debrief") {
    return <DebriefScreen scenario={scenario} call={call} onRetry={() => dispatch({ t: "RESTART" })} />;
  }

  /* --- LIVE / PAUSED --- */
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const paused = call.phase === "paused";
  const lastRoleLine = [...call.transcript].reverse().find((t) => t.speaker === "role");

  return (
    <div className="flex flex-col mx-auto w-full" style={{ minHeight: "100dvh", background: VIDEO_BG }}>
      {/* header: scenario + elapsed; no gamification counters (spec §6.2) */}
      <header className="flex items-center justify-between px-4 py-3 text-white/90">
        <span className="text-[13px] font-bold">{scenario.title}</span>
        <Num className="text-[13px]">{`${mins}:${secs.toString().padStart(2, "0")}`}</Num>
      </header>

      {/* character stage */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 relative">
        <motion.div animate={paused ? { filter: "saturate(0.4)", opacity: 0.7 } : { filter: "saturate(1)", opacity: 1 }} transition={{ duration: 0.22 }}>
          <RoleAvatar name={scenario.role.name} size={130} speaking={!paused} />
        </motion.div>
        <p className="text-white font-bold text-[16px]">{scenario.role.name}</p>

        {/* live caption (captions default on, spec §7.6) */}
        {captions && lastRoleLine && (
          <AnimatePresence mode="wait">
            <motion.div
              key={lastRoleLine.text}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.14 }}
              className="max-w-[340px] px-4 py-3 text-[15px] text-center"
              style={{ background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 16 }}
              role="log"
              aria-live="polite"
            >
              {lastRoleLine.text}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* controls + responses */}
      <div className="px-4 pb-6 pt-3 flex flex-col gap-3" style={{ background: "rgba(0,0,0,0.35)" }}>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ t: paused ? "RESUME" : "PAUSE" })}
              aria-label={paused ? "Resume call" : "Pause for private coaching"}
              className="flex items-center gap-1.5 px-3 text-[13px] font-bold text-white"
              style={{ minHeight: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)" }}
            >
              {paused ? <Check size={16} /> : <Pause size={16} />} {paused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={() => dispatch({ t: "END_EARLY" })}
              aria-label="End scenario"
              className="flex items-center gap-1.5 px-3 text-[13px] font-bold text-white"
              style={{ minHeight: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)" }}
            >
              <Phone size={15} style={{ transform: "rotate(135deg)" }} /> End
            </button>
          </div>
          {/* private Finn — the role character never sees coaching (spec §4.4) */}
          <button
            onClick={() => dispatch({ t: paused ? "RESUME" : "PAUSE" })}
            aria-label="Private coaching from Finn"
            className="rounded-full"
            style={{ background: "var(--card)", padding: 4, border: paused ? "2px solid var(--brand)" : "2px solid transparent" }}
          >
            <FinnAvatar expression={paused ? "reassuring" : "attentive"} size={36} />
          </button>
        </div>

        {!paused && node && (
          <>
            <div className="flex flex-col gap-2" role="group" aria-label="Your reply">
              {node.choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => dispatch({ t: "CHOOSE", choiceId: c.id })}
                  className="text-left text-[14px] px-4 py-3 text-white"
                  style={{ borderRadius: "var(--radius-action)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (freeText.trim()) {
                  dispatch({ t: "FREETEXT", text: freeText.trim() });
                  setFreeText("");
                }
              }}
            >
              <input
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="…or say it your way"
                aria-label="Type your reply"
                className="flex-1 px-4 text-[14px] text-white placeholder-white/50"
                style={{ minHeight: 44, borderRadius: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
              />
              <button type="submit" className="px-4 text-[13px] font-bold text-white" style={{ minHeight: 44, borderRadius: 12, background: "var(--brand)" }}>
                Send
              </button>
            </form>
          </>
        )}
      </div>

      {/* pause = private coach overlay; role frozen + desaturated (spec §8.2) */}
      <AnimatePresence>
        {paused && node && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] p-4 pb-6"
            style={{ background: "var(--card)", borderTopLeftRadius: "var(--radius-sheet)", borderTopRightRadius: "var(--radius-sheet)", boxShadow: "var(--shadow-3)" }}
            role="dialog"
            aria-label="Private coaching"
          >
            <div className="flex items-center gap-2 mb-2">
              <FinnAvatar expression="reassuring" size={32} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Just us — {scenario.role.name} can't hear this
              </span>
            </div>
            <p className="text-[14.5px] mb-3">{node.coachHint}</p>
            {node.strategies && (
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                  Two ways in — you choose
                </p>
                {node.strategies.map((s, i) => (
                  <div key={i} className="text-[13.5px] px-3 py-2 rounded-[12px]" style={{ background: "var(--brand-soft)" }}>
                    {s}
                  </div>
                ))}
              </div>
            )}
            <PrimaryButton
              onClick={() => {
                dispatch({ t: "HINT_USED" });
                dispatch({ t: "RESUME" });
              }}
            >
              Back to the call
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Simple 2D character card — client-rendered, never blocks anything (spec §11.8). */
function RoleAvatar({ name, size, speaking }: { name: string; size: number; speaking: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="flex items-center justify-center rounded-full font-extrabold"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.08))",
        border: "3px solid rgba(255,255,255,0.6)",
        color: "#fff",
        fontSize: size * 0.36,
      }}
      animate={speaking && !reduce ? { scale: [1, 1.02, 1] } : undefined}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      {name.slice(0, 1)}
    </motion.div>
  );
}

const LEVEL_TONE: Record<string, "muted" | "info" | "brand" | "success"> = {
  Emerging: "muted",
  Developing: "info",
  Ready: "brand",
  Strong: "success",
};

function DebriefScreen({ scenario, call, onRetry }: { scenario: ScenarioSpec; call: CallState; onRetry: () => void }) {
  const nav = useNavigate();
  const debrief: Debrief = useMemo(() => buildDebrief(scenario, call), [scenario, call]);
  const recorded = useRef(false);

  /* record evidence once: call_move per decision, call_complete, store record (spec §5.2 video→review handoff) */
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    for (const p of call.path) {
      recordEvidence({
        scenarioId: scenario.id,
        concepts: scenario.concepts,
        type: "call_move",
        supportLevel: call.hintsUsed > 0 ? 1 : 0,
        payload: { quality: p.choice.quality, moves: p.choice.moves.map((m) => m.label), nodeId: p.nodeId, weight: CALL_MOVE_WEIGHT },
      });
    }
    recordEvidence({
      scenarioId: scenario.id,
      concepts: scenario.concepts,
      type: "call_complete",
      supportLevel: 0,
      payload: { endReason: call.endReason, overall: debrief.overall, summary: call.summary },
    });
    setStore((s) => ({
      callsCompleted: [
        ...s.callsCompleted,
        {
          scenarioId: scenario.id,
          at: now(),
          levels: Object.fromEntries(debrief.rubric.map((r) => [r.dimension, r.level])),
          branchPath: call.path.map((p) => `${p.nodeId}:${p.choice.id}`),
        },
      ],
    }));
    touchStreak();
    awardXp(60);
    const labels = call.path.flatMap((p) => (p.choice.quality === "strong" ? p.choice.moves.map((m) => m.label.toLowerCase()) : []));
    if (labels.some((l) => l.includes("total cost"))) unlockAchievement("asked-total-cost");
    if (call.path.some((p) => p.choice.quality !== "weak" && p.choice.moves.some((m) => m.dimension === "resilience"))) unlockAchievement("held-boundary");
  }, [call, scenario, debrief]);

  return (
    <div className="mx-auto w-full max-w-[430px] px-5 py-8 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <FinnAvatar expression={call.endReason === "goal_met" ? "celebrating" : "reassuring"} size={56} />
        <div>
          <h1 className="text-[20px]">Debrief</h1>
          <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            {scenario.title} · {call.endReason === "goal_met" ? "goal reached" : call.endReason === "impasse" ? "didn't land this time — that's what rehearsal is for" : "ended early"}
          </p>
        </div>
      </div>

      {call.summary && (
        <div className="rounded-[var(--radius-card)] p-3 text-[14px]" style={{ background: "var(--brand-soft)" }}>
          <span className="font-bold">Your takeaway: </span>
          {call.summary}
        </div>
      )}

      {/* evidence timeline: 3-5 moments, not every sentence (spec §4.9) */}
      <ol className="flex flex-col gap-3" aria-label="Key moments">
        {debrief.moments.map((m, i) => (
          <li key={i} className="rounded-[var(--radius-card)] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
              {m.title}
            </p>
            <blockquote className="text-[14px] italic mb-2 pl-3" style={{ borderLeft: "3px solid var(--video)" }}>
              “{m.transcript}”
            </blockquote>
            <p className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>
              {m.note}
            </p>
          </li>
        ))}
      </ol>

      {/* process rubric: four visible levels, no centered number (spec §4.8) */}
      <div className="rounded-[var(--radius-card)] p-4" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
        <p className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>
          Process, not personality
        </p>
        <div className="flex flex-col gap-2">
          {debrief.rubric.map((r) => (
            <div key={r.dimension} className="flex items-center justify-between gap-2">
              <span className="text-[13.5px]">{r.label}</span>
              <Pill tone={LEVEL_TONE[r.level]} status>
                {r.level}
              </Pill>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <PrimaryButton tone="video" onClick={onRetry}>
          Try another path
        </PrimaryButton>
        {scenario.relatedLessonId && call.endReason !== "goal_met" && (
          <SecondaryButton onClick={() => nav(`/learn/${scenario.relatedLessonId}`)}>Revisit the lesson behind this</SecondaryButton>
        )}
        <SecondaryButton onClick={() => nav("/today")}>Done</SecondaryButton>
      </div>
    </div>
  );
}
