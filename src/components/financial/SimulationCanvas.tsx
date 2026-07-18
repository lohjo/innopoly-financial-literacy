import type { PuzzleDoc } from "../../features/learning-episode/types";
import type { ScreenStatus } from "../../features/learning-episode/episodeMachine";
import { CriteriaList, type CriterionState } from "../primitives";
import { FlowCanvas } from "./FlowCanvas";
import { BudgetCanvas } from "./BudgetCanvas";
import { DebtSimulator } from "./DebtSimulator";
import type { SimAnswer } from "./evaluate";

/** Shared puzzle shell: prompt, visible criteria contract, mechanic canvas.
    Surface-wide affect (brilliant-replicate V-pattern): frame turns amber on "not yet", green on pass. */
export function SimulationCanvas({
  puzzle,
  answer,
  onAnswer,
  status,
  criteria,
  criteriaDetail,
  highlightCriterion,
}: {
  puzzle: PuzzleDoc;
  answer: SimAnswer;
  onAnswer: (a: SimAnswer) => void;
  status: ScreenStatus;
  criteria: Record<string, CriterionState>;
  criteriaDetail: Record<string, string>;
  highlightCriterion?: string | null;
}) {
  const frame =
    status === "success"
      ? "var(--success)"
      : status === "failure"
        ? "var(--warning)"
        : "var(--border)";
  const p = puzzle.params;

  return (
    <div className="flex flex-col gap-4">
      {puzzle.story && (
        <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
          {puzzle.story}
        </p>
      )}
      <h2 className="text-[18px]">{puzzle.prompt}</h2>

      <div
        className="rounded-[var(--radius-card)] p-3"
        style={{
          border: `2px solid ${highlightCriterion ? "var(--info)" : "var(--border)"}`,
          background: "var(--surface-raised)",
          transition: "border-color var(--dur-fast) var(--ease-state)",
        }}
      >
        <CriteriaList
          items={puzzle.criteria.map((c) => ({
            id: c.id,
            label: c.label,
            state: criteria[c.id] ?? "pending",
            detail: criteriaDetail[c.id],
          }))}
        />
      </div>

      <div
        className="rounded-[var(--radius-card)] p-4"
        style={{
          border: `2px solid ${frame}`,
          background: "var(--card)",
          transition: "border-color var(--dur-standard) var(--ease-state)",
        }}
      >
        {p.mechanic === "flow" && answer.mechanic === "flow" && (
          <FlowCanvas params={p.flow} alloc={answer.alloc} onChange={(alloc) => onAnswer({ mechanic: "flow", alloc })} disabled={status === "success"} />
        )}
        {p.mechanic === "zones" && answer.mechanic === "zones" && (
          <BudgetCanvas params={p.zones} cls={answer.cls} onChange={(cls) => onAnswer({ mechanic: "zones", cls })} disabled={status === "success"} />
        )}
        {p.mechanic === "minpay" && answer.mechanic === "minpay" && (
          <DebtSimulator params={p.minpay} payment={answer.payment} onChange={(payment) => onAnswer({ mechanic: "minpay", payment })} disabled={status === "success"} />
        )}
      </div>
    </div>
  );
}
