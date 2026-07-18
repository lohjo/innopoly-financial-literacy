import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import confetti from "canvas-confetti";
import type { LessonDoc, PuzzleParams } from "./types";
import { detectMisconception, episodeReducer, initEpisode, type EpisodeAction, type EpisodeState } from "./episodeMachine";
import { buildReviewLesson, lessonById } from "../../content/lessons";
import { CHAPTERS } from "../../content/chapters";
import { PrimaryButton, SecondaryButton, SegmentedProgress, Num } from "../../components/primitives";
import { SimulationCanvas } from "../../components/financial/SimulationCanvas";
import { PredictionPanel } from "../../components/financial/PredictionPanel";
import { defaultAnswer, evaluatePuzzle, type SimAnswer } from "../../components/financial/evaluate";
import { copilotReducer, initCopilot, praiseLine, STALL_MS, type CopilotState } from "../copilot/copilotMachine";
import { StudyCopilot } from "../copilot/StudyCopilot";
import { FinnAvatar } from "../copilot/FinnAvatar";
import { getState, recordEvidence, awardXp, touchStreak, setState as setStore, unlockAchievement, useStore } from "../../stores/store";

export function CoursePlayer({ review = false }: { review?: boolean }) {
  const { lessonId, conceptId } = useParams();
  const lesson = useMemo(
    () => (review ? buildReviewLesson(conceptId ?? "") : lessonById(lessonId ?? "")) ?? null,
    [review, lessonId, conceptId],
  );
  const nav = useNavigate();
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: "100dvh" }}>
        <p>That lesson doesn't exist yet.</p>
        <SecondaryButton onClick={() => nav("/journey")}>Back to Journey</SecondaryButton>
      </div>
    );
  }
  return <Player lesson={lesson} review={review} />;
}

function Player({ lesson, review }: { lesson: LessonDoc; review: boolean }) {
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const alreadyCompleted = useStore((s) => s.lessonsCompleted.includes(lesson.id));

  const [episode, rawDispatch] = useReducer(
    (s: EpisodeState, a: EpisodeAction) => episodeReducer(s, a, lesson),
    lesson,
    (l) => initEpisode(l, review ? "review" : "lesson"),
  );
  const [copilot, copilotDispatch] = useReducer(copilotReducer, undefined, initCopilot);
  const [speech, setSpeech] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, SimAnswer>>({});
  const [paramsOverride, setParamsOverride] = useState<Record<string, PuzzleParams>>({});
  const flushedRef = useRef(0);

  const screen = lesson.screens[episode.screenIndex];

  /* --- evidence flush: pending events append to the store ledger as they arrive --- */
  useEffect(() => {
    while (flushedRef.current < episode.pending.length) {
      const e = episode.pending[flushedRef.current++];
      recordEvidence(e);
    }
  }, [episode.pending]);

  /* --- stall timer (spec §2.4: 20s without meaningful input) --- */
  const stallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const armStall = useCallback(
    (hasAttempted: boolean) => {
      if (stallTimer.current) clearTimeout(stallTimer.current);
      stallTimer.current = setTimeout(() => copilotDispatch({ t: "STALL", hasAttempted }), STALL_MS);
    },
    [copilotDispatch],
  );
  useEffect(() => () => { if (stallTimer.current) clearTimeout(stallTimer.current); }, []);

  /* --- screen enter --- */
  useEffect(() => {
    copilotDispatch({ t: "SCREEN_ENTER" });
    if (episode.screenIndex === 0) {
      setSpeech(review ? "Same idea, new numbers. You've got this." : "I'm here if you want a nudge — you do the thinking.");
    } else {
      setSpeech(null);
    }
    if (screen?.kind === "puzzle") armStall(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.screenIndex]);

  /* --- copilot offer speech --- */
  useEffect(() => {
    if (copilot.s === "observing" && copilot.offer > 0) {
      setSpeech(copilot.offer === 1 ? "Stuck? Tap me for a nudge — no answers, promise." : "Want to go one level deeper? Tap me.");
    } else if (copilot.s === "waiting") {
      setSpeech("Take your time. Try one move and see what changes.");
    } else if (copilot.s === "celebrating") {
      setSpeech(praiseLine(episode.screenIndex + lesson.id.length));
      const t = setTimeout(() => copilotDispatch({ t: "CELEBRATE_DONE" }), 1200);
      return () => clearTimeout(t);
    } else if (copilot.s === "observing") {
      // keep prior speech only briefly; clear on plain observing
    }
  }, [copilot, episode.screenIndex, lesson.id]);

  const dispatch = useCallback(
    (a: EpisodeAction) => {
      rawDispatch(a);
      if (a.t === "INTERACT" || a.t === "CHOOSE" || a.t === "PREDICT" || a.t === "REFLECT") {
        copilotDispatch({ t: "ACTION" });
        setSpeech(null);
        if (screen?.kind === "puzzle") armStall(true);
      }
    },
    [rawDispatch, screen, armStall],
  );

  /* --- check handler for puzzles --- */
  const handleCheck = useCallback(() => {
    if (screen?.kind !== "puzzle") return;
    const params = paramsOverride[screen.id] ?? screen.puzzle.params;
    const answer = answers[screen.id] ?? defaultAnswer({ ...screen.puzzle, params });
    const results = evaluatePuzzle({ ...screen.puzzle, params }, answer);
    rawDispatch({ t: "CHECK", results });
    const allPass = results.every((r) => r.pass);
    if (allPass) {
      copilotDispatch({ t: "CHECK_PASS" });
    } else {
      // compute post-check fail counts for the copilot policy
      const failed = results.filter((r) => !r.pass);
      const maxFails = Math.max(...failed.map((r) => (episode.failsByCriterion[r.id] ?? 0) + 1));
      const misId = detectMisconception(
        {
          ...episode,
          failsByCriterion: Object.fromEntries(
            Object.entries({ ...episode.failsByCriterion }).concat(failed.map((r) => [r.id, (episode.failsByCriterion[r.id] ?? 0) + 1])),
          ),
        },
        lesson,
      );
      copilotDispatch({ t: "CHECK_FAIL", sameCriterionFails: maxFails, misconceptionId: misId, hintLevelUsed: episode.hintLevelUsed });
      armStall(true);
    }
  }, [screen, answers, paramsOverride, episode, lesson, armStall]);

  const openHint = useCallback(
    (level: 1 | 2 | 3 | 4) => {
      rawDispatch({ t: "OPEN_HINT", level });
      copilotDispatch({ t: "HELP", nextLevel: level });
      setSpeech(null);
    },
    [rawDispatch],
  );

  const hintDone = useCallback(() => {
    // H4 walkthrough ends with a changed-value retry (spec §2.4): swap in retryParams
    if (copilot.s === "hinting" && copilot.level === 4 && screen?.kind === "puzzle" && screen.puzzle.retryParams) {
      setParamsOverride((p) => ({ ...p, [screen.id]: screen.puzzle.retryParams! }));
      setAnswers((a) => ({ ...a, [screen.id]: defaultAnswer({ ...screen.puzzle, params: screen.puzzle.retryParams! }) }));
      setSpeech("New numbers, same reasoning — this one's all you.");
    }
    copilotDispatch({ t: "HINT_DONE" });
    if (episode.status === "failure") rawDispatch({ t: "RETRY" });
  }, [copilot, screen, episode.status]);

  const activeMisconception =
    copilot.s === "teaching" ? (lesson.misconceptions.find((m) => m.id === copilot.misconceptionId) ?? null) : null;

  const teachDone = useCallback(() => {
    copilotDispatch({ t: "TEACH_DONE" });
    if (episode.status === "failure") rawDispatch({ t: "RETRY" });
  }, [episode.status]);

  /* --- completion --- */
  const finish = useCallback(() => {
    touchStreak();
    if (review) {
      const passed = episode.pending.some((e) => e.type === "review_pass");
      const concept = lesson.concepts[0];
      if (passed) {
        setStore((s) => ({ reviewsDone: { ...s.reviewsDone, [concept]: (s.reviewsDone[concept] ?? 0) + 1 } }));
        awardXp(20);
        unlockAchievement("first-review");
      }
      nav("/practice");
      return;
    }
    const xp = 50 + episode.correctCount * 5;
    awardXp(xp);
    if (!getState().lessonsCompleted.includes(lesson.id)) {
      setStore((s) => ({ lessonsCompleted: [...s.lessonsCompleted, lesson.id] }));
    }
    if (getState().lessonsCompleted.length === 1) unlockAchievement("first-episode");
    if (episode.pending.every((e) => e.type !== "hint_used")) unlockAchievement("unaided-episode");
    const failedScreens = new Set(episode.pending.filter((e) => e.type === "check_fail").map((e) => e.payload.screenId));
    if (episode.pending.some((e) => e.type === "check_pass" && failedScreens.has(e.payload.screenId))) {
      unlockAchievement("courageous-retry");
    }
    if (episode.pending.some((e) => e.type === "hint_used" && e.supportLevel >= 3) && episode.pending.some((e) => e.type === "check_pass")) {
      unlockAchievement("revised-with-evidence");
    }
    recordEvidence({ lessonId: lesson.id, concepts: lesson.concepts, type: "reflection", supportLevel: 0, payload: { kind: "episode_complete", xp } });
  }, [review, episode, lesson, nav]);

  const finishedRef = useRef(false);
  useEffect(() => {
    if (episode.done && !finishedRef.current) {
      finishedRef.current = true;
      finish();
      if (!review && !alreadyCompleted && !reduce) {
        confetti({ particleCount: 24, spread: 70, startVelocity: 28, ticks: 90, origin: { y: 0.7 } });
      }
    }
  }, [episode.done, finish, review, alreadyCompleted, reduce]);

  const exit = () => {
    nav(review ? "/practice" : "/journey");
  };

  /* --- completion screen --- */
  if (episode.done) {
    const hintsUsed = episode.pending.filter((e) => e.type === "hint_used").length;
    const xp = review ? 20 : 50 + episode.correctCount * 5;
    return (
      <div className="flex flex-col items-center px-5 py-10 mx-auto w-full max-w-[430px] gap-5" style={{ minHeight: "100dvh" }}>
        <FinnAvatar expression="celebrating" size={84} />
        <h1 className="text-center">{review ? "Review done" : lesson.title + " — complete"}</h1>
        {/* strict 4-field recap (architecture-plan recap format) */}
        <div className="w-full rounded-[var(--radius-card)] p-4 flex flex-col gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-1)" }}>
          <RecapRow label="What you did" value={review ? `Retrieved ${lesson.concepts[0]} with fresh numbers` : `${episode.correctCount} checks passed across ${lesson.screens.length} screens`} />
          <RecapRow label="Score" value={<Num className="font-extrabold">+{xp} XP</Num>} />
          <RecapRow label="Next step" value={hintsUsed > 0 ? "Try the next one without hints — you're close." : "Unaided run. Review lands in ~2 days to lock it in."} />
          <RecapRow label="Track position" value={`${getState().lessonsCompleted.length} of ${CHAPTERS.reduce((a, c) => a + c.lessons.length, 0)} lessons on the first-paycheck track`} />
          <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Educational examples with fictional values — not financial advice.
          </p>
        </div>
        {!review && lesson.scenarioId && (
          <PrimaryButton tone="video" onClick={() => nav(`/call/${lesson.scenarioId}`)}>
            Rehearse it out loud with Finn
          </PrimaryButton>
        )}
        <PrimaryButton onClick={() => nav(review ? "/practice" : "/today")}>Continue</PrimaryButton>
      </div>
    );
  }

  /* --- main player chrome --- */
  const canContinue =
    screen.kind === "intro" || screen.kind === "concept" || screen.kind === "generalize" || episode.status === "success";

  return (
    <div className="flex flex-col mx-auto w-full max-w-[430px] md:max-w-[640px]" style={{ minHeight: "100dvh" }}>
      <header className="flex items-center gap-3 px-4 py-3">
        <button onClick={exit} aria-label="Exit lesson" className="p-2 -m-2">
          <X size={22} color="var(--muted-foreground)" strokeWidth={2.5} />
        </button>
        <SegmentedProgress total={lesson.screens.length} current={episode.screenIndex + (canContinue ? 1 : 0)} />
      </header>

      <main className="flex-1 px-4 pb-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <ScreenView
              screen={screen}
              episode={episode}
              lesson={lesson}
              answers={answers}
              paramsOverride={paramsOverride}
              onAnswer={(id, a) => {
                setAnswers((prev) => ({ ...prev, [id]: a }));
                dispatch({ t: "INTERACT" });
              }}
              dispatch={dispatch}
              copilot={copilot}
              highlightCriterion={copilot.s === "hinting" && copilot.level === 2 ? (lesson.hintTargets?.[screen.id] ?? null) : null}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* action bar: one primary action per screen (spec §1.2 principle 3) */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="mx-auto w-full max-w-[430px] md:max-w-[640px] px-4 py-3 flex gap-2" style={{ background: "var(--background)", borderTop: "1px solid var(--border)" }}>
          {screen.kind === "puzzle" && episode.status !== "success" && (
            <>
              {episode.status === "failure" && (
                <SecondaryButton onClick={() => openHint(Math.min(4, episode.hintLevelUsed + 1) as 1 | 2 | 3 | 4)} className="!w-auto shrink-0">
                  Get help
                </SecondaryButton>
              )}
              <PrimaryButton
                disabled={episode.status === "idle"}
                onClick={() => {
                  if (episode.status === "failure") rawDispatch({ t: "RETRY" });
                  handleCheck();
                }}
              >
                {episode.status === "failure" ? "Try again" : "Check"}
              </PrimaryButton>
            </>
          )}
          {screen.kind === "quiz" && episode.status !== "success" && (
            <PrimaryButton
              disabled={episode.quizChoice === null}
              onClick={() => {
                if (episode.status === "failure") rawDispatch({ t: "RETRY" });
                rawDispatch({ t: "CHECK_QUIZ" });
                if (episode.quizChoice === screen.answer) copilotDispatch({ t: "CHECK_PASS" });
              }}
            >
              Check
            </PrimaryButton>
          )}
          {canContinue && <PrimaryButton onClick={() => dispatch({ t: "CONTINUE" })}>Continue</PrimaryButton>}
        </div>
      </div>

      {/* Finn dock + sheets */}
      <StudyCopilot
        state={copilot}
        speech={speech}
        lesson={lesson}
        screenId={screen.id}
        hintLevelUsed={episode.hintLevelUsed}
        onOpenHint={openHint}
        onHintDone={hintDone}
        onTeachDone={teachDone}
        misconception={activeMisconception}
      />
    </div>
  );
}

function RecapRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[14px]">
      <span className="font-bold uppercase tracking-wider text-[11px] pt-0.5 shrink-0" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function ScreenView({
  screen,
  episode,
  lesson,
  answers,
  paramsOverride,
  onAnswer,
  dispatch,
  highlightCriterion,
}: {
  screen: LessonDoc["screens"][number];
  episode: EpisodeState;
  lesson: LessonDoc;
  answers: Record<string, SimAnswer>;
  paramsOverride: Record<string, PuzzleParams>;
  onAnswer: (screenId: string, a: SimAnswer) => void;
  dispatch: (a: EpisodeAction) => void;
  copilot: CopilotState;
  highlightCriterion: string | null;
}) {
  switch (screen.kind) {
    case "intro":
      return (
        <div className="flex flex-col items-center gap-5 pt-8 text-center">
          <FinnAvatar expression="curious" size={72} />
          <h1>{screen.title}</h1>
          <p className="text-[15px] max-w-[36ch]" style={{ color: "var(--muted-foreground)" }}>
            {screen.story}
          </p>
        </div>
      );
    case "concept":
      return (
        <div className="flex flex-col gap-3 pt-4">
          <h2>{screen.title}</h2>
          <p className="text-[15px] leading-relaxed">{screen.body}</p>
          {screen.factNote && (
            <p className="text-[11.5px] px-3 py-2 rounded-[10px]" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
              {screen.factNote}
            </p>
          )}
        </div>
      );
    case "predict":
      return (
        <div className="pt-4">
          <PredictionPanel
            prompt={screen.prompt}
            min={screen.min}
            max={screen.max}
            step={screen.step}
            actual={screen.actual}
            explanation={screen.explanation}
            predicted={episode.predicted}
            onPredict={(v) => dispatch({ t: "PREDICT", value: v })}
          />
        </div>
      );
    case "puzzle": {
      const params = paramsOverride[screen.id] ?? screen.puzzle.params;
      const puzzle = { ...screen.puzzle, params };
      const answer = answers[screen.id] ?? defaultAnswer(puzzle);
      return (
        <div className="pt-4">
          <SimulationCanvas
            puzzle={puzzle}
            answer={answer}
            onAnswer={(a) => onAnswer(screen.id, a)}
            status={episode.status}
            criteria={episode.criteria}
            criteriaDetail={episode.criteriaDetail}
            highlightCriterion={highlightCriterion}
          />
        </div>
      );
    }
    case "quiz":
      return (
        <div className="flex flex-col gap-3 pt-4">
          <h2 className="text-[18px]">{screen.prompt}</h2>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label={screen.prompt}>
            {screen.options.map((opt, i) => {
              const selected = episode.quizChoice === i;
              const showResult = episode.status === "success" || episode.status === "failure";
              const isAnswer = i === screen.answer;
              const border = showResult && selected ? (isAnswer ? "var(--success)" : "var(--warning)") : selected ? "var(--brand)" : "var(--border)";
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={selected}
                  disabled={episode.status === "success"}
                  onClick={() => dispatch({ t: "CHOOSE", index: i })}
                  className="text-left text-[14px] px-4 py-3"
                  style={{
                    borderRadius: "var(--radius-action)",
                    border: `2px solid ${border}`,
                    background: selected ? "var(--brand-soft)" : "var(--card)",
                    transition: "border-color var(--dur-instant)",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {(episode.status === "success" || episode.status === "failure") && (
            <div
              className="rounded-[12px] p-3 text-[14px]"
              style={{
                background: episode.status === "success" ? "var(--brand-soft)" : "color-mix(in srgb, var(--warning) 10%, transparent)",
              }}
              role="status"
            >
              <span className="font-bold">{episode.status === "success" ? "Right. " : "Not yet. "}</span>
              {episode.status === "success" ? screen.explanation : "Look again — what does the money actually do?"}
            </div>
          )}
        </div>
      );
    case "reflect":
      return (
        <div className="flex flex-col gap-3 pt-4">
          <h2 className="text-[18px]">{screen.prompt}</h2>
          <div className="flex flex-col gap-2">
            {screen.choices.map((c, i) => {
              const selected = episode.reflectChoice === i;
              return (
                <button
                  key={i}
                  disabled={episode.reflectChoice !== null}
                  onClick={() => dispatch({ t: "REFLECT", index: i })}
                  className="text-left text-[14px] px-4 py-3"
                  style={{
                    borderRadius: "var(--radius-action)",
                    border: `2px solid ${selected ? "var(--brand)" : "var(--border)"}`,
                    background: selected ? "var(--brand-soft)" : "var(--card)",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
          {episode.reflectChoice !== null && (
            <div className="rounded-[12px] p-3 text-[14px]" style={{ background: "var(--brand-soft)" }} role="status">
              {screen.whyBest}
            </div>
          )}
        </div>
      );
    case "generalize":
      return (
        <div className="flex flex-col gap-4 pt-6 items-center text-center">
          <div className="px-5 py-4 rounded-[var(--radius-card)]" style={{ background: "var(--brand-soft)" }}>
            <p className="text-[12px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--brand-hover)" }}>
              Your rule
            </p>
            <h2 style={{ color: "var(--brand-hover)" }}>{screen.rule}</h2>
          </div>
          <p className="text-[15px] max-w-[40ch] text-left leading-relaxed">{screen.body}</p>
        </div>
      );
  }
}
