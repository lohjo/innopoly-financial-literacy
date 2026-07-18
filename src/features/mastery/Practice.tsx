import { useNavigate } from "react-router";
import { Clock, Check } from "lucide-react";
import { Card, Pill, PrimaryButton } from "../../components/primitives";
import { useStore, now } from "../../stores/store";
import { getDueReviews, dueAt, lastPracticedAt } from "./schedule";
import { CONCEPTS, conceptById } from "./concepts";
import { FinnAvatar } from "../copilot/FinnAvatar";

/** Practice: the spaced retrieval queue (spec §6.1). Deterministic due list with reasons. */
export function Practice() {
  const nav = useNavigate();
  const evidence = useStore((s) => s.evidence);
  const reviewsDone = useStore((s) => s.reviewsDone);
  const t = now();

  const due = getDueReviews(evidence, reviewsDone, CONCEPTS.map((c) => c.id), t);
  const upcoming = CONCEPTS.map((c) => {
    const last = lastPracticedAt(evidence, c.id);
    if (last === null) return null;
    const at = dueAt(c.id, last, reviewsDone[c.id] ?? 0);
    return at > t ? { concept: c.id, at } : null;
  })
    .filter((x): x is { concept: string; at: number } => x !== null)
    .sort((a, b) => a.at - b.at);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px]">Practice</h1>
        <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
          Retrieval with fresh numbers is what turns “I understood it” into “I can use it.”
        </p>
      </div>

      {due.length === 0 && upcoming.length === 0 && (
        <Card className="p-6 flex flex-col items-center gap-3 text-center">
          <FinnAvatar expression="neutral" size={64} />
          <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
            Nothing to review yet. Finish a lesson and it lands here about two days later.
          </p>
          <PrimaryButton onClick={() => nav("/journey")}>Go learn something</PrimaryButton>
        </Card>
      )}

      {due.map((d) => {
        const c = conceptById(d.concept);
        return (
          <Card key={d.concept} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={15} color="var(--info)" />
              <Pill tone="info" status>
                Due
              </Pill>
            </div>
            <h3 className="mb-1">{c?.label ?? d.concept}</h3>
            <p className="text-[13px] mb-3" style={{ color: "var(--muted-foreground)" }}>
              {c?.meaning}
            </p>
            <PrimaryButton onClick={() => nav(`/review/${d.concept}`)}>Review now</PrimaryButton>
          </Card>
        );
      })}

      {upcoming.length > 0 && (
        <div>
          <h3 className="mb-2 text-[14px]" style={{ color: "var(--muted-foreground)" }}>
            Scheduled
          </h3>
          <div className="flex flex-col gap-2">
            {upcoming.map((u) => {
              const c = conceptById(u.concept);
              const hours = Math.max(1, Math.round((u.at - t) / 3600000));
              return (
                <Card key={u.concept} className="p-3 flex items-center justify-between">
                  <span className="text-[14px] flex items-center gap-2">
                    <Check size={15} color="var(--success)" /> {c?.label ?? u.concept}
                  </span>
                  <Pill tone="muted">{hours >= 24 ? `in ${Math.round(hours / 24)}d` : `in ${hours}h`}</Pill>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
