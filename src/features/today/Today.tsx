import { useNavigate } from "react-router";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Card, Pill, PrimaryButton, Num } from "../../components/primitives";
import { recordEvidence, awardXp, setState, touchStreak, useStore, now, unlockAchievement } from "../../stores/store";
import { CHAPTERS } from "../../content/chapters";
import { lessonById } from "../../content/lessons";
import { getDueReviews } from "../mastery/schedule";
import { projectMastery } from "../mastery/project";
import { masteryBand } from "../mastery/bkt";
import { CONCEPTS, conceptById } from "../mastery/concepts";
import { nextMission } from "../missions/missions";
import { GOALS } from "../onboarding/goals";

const ALL_LESSONS = CHAPTERS.flatMap((c) => c.lessons.map((l) => ({ ...l, chapterId: c.id, chapterTitle: c.title })));

/** Today: resume-first plan — one continue card, due review, one mission, weekly summary.
    No infinite feed (spec §6.2). */
export function Today() {
  const nav = useNavigate();
  const profile = useStore((s) => s.profile);
  const lessonsCompleted = useStore((s) => s.lessonsCompleted);
  const missionsDone = useStore((s) => s.missionsDone);
  const evidence = useStore((s) => s.evidence);
  const reviewsDone = useStore((s) => s.reviewsDone);

  const nextLesson = ALL_LESSONS.find((l) => !lessonsCompleted.includes(l.id));
  const due = getDueReviews(evidence, reviewsDone, CONCEPTS.map((c) => c.id), now());
  const mission = nextMission(lessonsCompleted, missionsDone);
  const mastery = projectMastery(evidence);
  const durable = Object.values(mastery).filter((m) => masteryBand(m) === "durable").length;
  const learning = Object.values(mastery).filter((m) => masteryBand(m) === "learning").length;
  const goal = GOALS.find((g) => g.id === profile?.goalId);
  const scenarioNext = nextLesson ? lessonById(nextLesson.id)?.scenarioId : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px]">
          {profile?.name ? `Hey ${profile.name}.` : "Hey."}
        </h1>
        <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
          {nextLesson ? "Your paycheck plan continues." : "Track complete — reviews keep it durable."}
        </p>
      </div>

      {/* resume card with visible reason (spec §2.2 step 1: why this episode) */}
      {nextLesson && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-1">
            <Pill tone="brand" status>
              Continue
            </Pill>
            <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              ~{nextLesson.minutes} min
            </span>
          </div>
          <h2 className="text-[18px] mb-1">{nextLesson.title}</h2>
          <p className="text-[13px] mb-3" style={{ color: "var(--muted-foreground)" }}>
            {nextLesson.chapterTitle}
            {goal ? ` · Goal: ${goal.short} · Evidence: your onboarding answer` : ""}
          </p>
          <PrimaryButton onClick={() => nav(`/learn/${nextLesson.id}`)}>Resume</PrimaryButton>
        </Card>
      )}

      {/* due retrieval */}
      {due.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} color="var(--info)" />
            <span className="text-[14px] font-bold">Due now</span>
            <Pill tone="info">{due.length} review{due.length > 1 ? "s" : ""}</Pill>
          </div>
          <p className="text-[13px] mb-3" style={{ color: "var(--muted-foreground)" }}>
            {conceptById(due[0].concept)?.label} — new numbers, no hints. This is what makes it stick.
          </p>
          <PrimaryButton onClick={() => nav(`/review/${due[0].concept}`)}>Start review</PrimaryButton>
        </Card>
      )}

      {/* one mission */}
      {mission && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-1">
            <Pill tone="warning" status>
              Mission
            </Pill>
            <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              real life · self-reported
            </span>
          </div>
          <h3 className="mb-1">{mission.title}</h3>
          <p className="text-[13.5px] mb-3" style={{ color: "var(--muted-foreground)" }}>
            {mission.body}
          </p>
          <button
            className="flex items-center gap-2 text-[14px] font-bold"
            style={{ color: "var(--brand-hover)", minHeight: 44 }}
            onClick={() => {
              setState((s) => ({ missionsDone: [...s.missionsDone, mission.id] }));
              recordEvidence({ concepts: mission.concepts, type: "mission_done", supportLevel: 0, payload: { missionId: mission.id } });
              awardXp(15);
              touchStreak();
              unlockAchievement("first-mission");
            }}
          >
            <CheckCircle2 size={18} /> I did this
          </button>
        </Card>
      )}

      {/* weekly mastery summary strip */}
      <Card className="p-4" raised>
        <div className="flex items-center justify-between">
          <div className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            <Num className="font-extrabold text-[17px]">{durable}</Num> concept{durable === 1 ? "" : "s"} durable ·{" "}
            <Num className="font-extrabold text-[17px]">{learning}</Num> in progress
          </div>
          <button
            onClick={() => nav("/you/progress")}
            className="flex items-center gap-1 text-[13px] font-bold"
            style={{ color: "var(--brand-hover)", minHeight: 44 }}
          >
            Why? <ArrowRight size={14} />
          </button>
        </div>
      </Card>

      {/* optional rehearsal */}
      {scenarioNext === undefined && lessonsCompleted.length > 0 && lessonById(lessonsCompleted[lessonsCompleted.length - 1])?.scenarioId && (
        <Card className="p-4">
          <Pill tone="video" status>
            Rehearse
          </Pill>
          <p className="text-[14px] my-2">Practice saying it out loud — a real conversation, safe stakes.</p>
          <PrimaryButton tone="video" onClick={() => nav(`/call/${lessonById(lessonsCompleted[lessonsCompleted.length - 1])!.scenarioId}`)}>
            Start rehearsal
          </PrimaryButton>
        </Card>
      )}
    </div>
  );
}
