import type { PuzzleDoc } from "../../features/learning-episode/types";
import type { ScreenStatus } from "../../features/learning-episode/episodeMachine";
import { CriteriaList, type CriterionState } from "../primitives";
import { FlowCanvas } from "./FlowCanvas";
import { BudgetCanvas } from "./BudgetCanvas";
import { DebtSimulator } from "./DebtSimulator";
import { GrowCanvas } from "./GrowCanvas";
import { SortCanvas } from "./SortCanvas";
import { MatchCanvas } from "./MatchCanvas";
import { AllocateCanvas } from "./AllocateCanvas";
import { DistributeCanvas } from "./DistributeCanvas";
import { TimingCanvas } from "./TimingCanvas";
import type { SimAnswer } from "./evaluate";

/** Shared puzzle shell: prompt, visible criteria contract, mechanic canvas.
    Surface-wide affect lives on the wrapping CheckFrame (learning-episode), not here. */
export function SimulationCanvas({
  puzzle,
  answer,
  onAnswer,
  status,
  criteria,
  criteriaDetail,
  highlightCriterion,
  compareLumpPrice = null,
}: {
  puzzle: PuzzleDoc;
  answer: SimAnswer;
  onAnswer: (a: SimAnswer) => void;
  status: ScreenStatus;
  criteria: Record<string, CriterionState>;
  criteriaDetail: Record<string, string>;
  highlightCriterion?: string | null;
  /** timing/dca: prior lump-sum buy price for the compare panel */
  compareLumpPrice?: number | null;
}) {
  const p = puzzle.params;
  const locked = status === "success";

  return (
    <div className="flex flex-col gap-4">
      {puzzle.story && (
        <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
          {puzzle.story}
        </p>
      )}
      <h2 className="text-[18px]">{puzzle.prompt}</h2>

      {/* timing beats hide the criteria strip — discovery, not a graded checklist */}
      {p.mechanic !== "timing" && (
        <div
          className="rounded-[var(--radius-card)] p-3"
          style={{
            border: `2px solid ${highlightCriterion ? "var(--info)" : "var(--border)"}`,
            background: "var(--surface-raised)",
            transition: "border-color var(--dur-fast) var(--ease-state)",
          }}
        >
          <CriteriaList
            celebrate={status === "success"}
            items={puzzle.criteria.map((c) => ({
              id: c.id,
              label: c.label,
              state: criteria[c.id] ?? "pending",
              detail: criteriaDetail[c.id],
            }))}
          />
        </div>
      )}

      <div
        className="rounded-[var(--radius-card)] p-4"
        style={{
          border: "2px solid var(--border)",
          background: "var(--card)",
        }}
      >
        {p.mechanic === "flow" && answer.mechanic === "flow" && (
          <FlowCanvas params={p.flow} alloc={answer.alloc} onChange={(alloc) => onAnswer({ mechanic: "flow", alloc })} disabled={locked} />
        )}
        {p.mechanic === "zones" && answer.mechanic === "zones" && (
          <BudgetCanvas params={p.zones} cls={answer.cls} onChange={(cls) => onAnswer({ mechanic: "zones", cls })} disabled={locked} />
        )}
        {p.mechanic === "minpay" && answer.mechanic === "minpay" && (
          <DebtSimulator params={p.minpay} payment={answer.payment} onChange={(payment) => onAnswer({ mechanic: "minpay", payment })} disabled={locked} />
        )}
        {p.mechanic === "grow" && answer.mechanic === "grow" && (
          <GrowCanvas params={p.grow} years={answer.years} onChange={(years) => onAnswer({ mechanic: "grow", years })} disabled={locked} />
        )}
        {p.mechanic === "sort" && answer.mechanic === "sort" && (
          <SortCanvas params={p.sort} order={answer.order} onChange={(order) => onAnswer({ mechanic: "sort", order })} disabled={locked} />
        )}
        {p.mechanic === "match" && answer.mechanic === "match" && (
          <MatchCanvas params={p.match} pairs={answer.pairs} onChange={(pairs) => onAnswer({ mechanic: "match", pairs })} disabled={locked} />
        )}
        {p.mechanic === "allocate" && answer.mechanic === "allocate" && (
          <AllocateCanvas
            params={p.allocate}
            placement={answer.placement}
            onChange={(placement) => onAnswer({ mechanic: "allocate", placement })}
            disabled={locked}
          />
        )}
        {p.mechanic === "distribute" && answer.mechanic === "distribute" && (
          <DistributeCanvas
            params={p.distribute}
            placement={answer.placement}
            onChange={(placement) => onAnswer({ mechanic: "distribute", placement })}
            disabled={locked}
            showShock={locked && p.distribute.targets.mode === "min-kept"}
          />
        )}
        {p.mechanic === "timing" && answer.mechanic === "timing" && (
          <TimingCanvas
            params={p.timing}
            answer={{ pickMonthId: answer.pickMonthId, revealedCount: answer.revealedCount }}
            onChange={(next) => onAnswer({ mechanic: "timing", ...next })}
            disabled={locked}
            compareLumpPrice={compareLumpPrice}
          />
        )}
      </div>
    </div>
  );
}
