import { Reorder, useDragControls } from "motion/react";
import { GripVertical } from "lucide-react";
import type { SortParams } from "../../features/learning-episode/types";
import { spring, useMotionPrefs } from "../../motion";

/** Rankable card list — drag (or keyboard via buttons) to order by long-run impact. */
export function SortCanvas({
  params,
  order,
  onChange,
  disabled = false,
}: {
  params: SortParams;
  order: string[];
  onChange: (order: string[]) => void;
  disabled?: boolean;
}) {
  const { collapse } = useMotionPrefs();
  const byId = Object.fromEntries(params.items.map((i) => [i.id, i]));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
        Drag to rank — strongest long-run impact on top
      </p>
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={(next) => {
          if (!disabled) onChange(next);
        }}
        className="flex flex-col gap-2 list-none m-0 p-0"
        as="ul"
      >
        {order.map((id, index) => {
          const item = byId[id];
          if (!item) return null;
          return (
            <SortRow
              key={id}
              id={id}
              index={index}
              last={index === order.length - 1}
              label={item.label}
              detail={item.detail}
              disabled={disabled}
              collapse={collapse}
              onMove={(dir) => {
                if (disabled) return;
                const next = [...order];
                const j = index + dir;
                if (j < 0 || j >= next.length) return;
                const tmp = next[index];
                next[index] = next[j];
                next[j] = tmp;
                onChange(next);
              }}
            />
          );
        })}
      </Reorder.Group>
    </div>
  );
}

function SortRow({
  id,
  index,
  last,
  label,
  detail,
  disabled,
  collapse,
  onMove,
}: {
  id: string;
  index: number;
  last: boolean;
  label: string;
  detail?: string;
  disabled: boolean;
  collapse: boolean;
  onMove: (dir: -1 | 1) => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      as="li"
      className="flex items-stretch gap-2"
      style={{ listStyle: "none" }}
      transition={collapse ? { duration: 0 } : spring.chip}
    >
      <div
        className="flex-1 flex items-center gap-3 px-3 py-3"
        style={{
          borderRadius: "var(--radius-action)",
          border: "2px solid var(--border)",
          background: "var(--card)",
          touchAction: "none",
        }}
      >
        <span
          className="inline-flex items-center justify-center shrink-0 text-[12px] font-extrabold tnum"
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "var(--brand-soft)",
            color: "var(--brand-hover)",
          }}
          aria-hidden
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold leading-snug">{label}</p>
          {detail && (
            <p className="text-[12px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {detail}
            </p>
          )}
        </div>
        {!disabled && (
          <button
            type="button"
            aria-label={`Drag to reorder: ${label}`}
            className="shrink-0 p-1"
            style={{ color: "var(--muted-foreground)", cursor: "grab" }}
            onPointerDown={(e) => controls.start(e)}
          >
            <GripVertical size={18} />
          </button>
        )}
      </div>
      {!disabled && (
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            aria-label={`Move ${label} up`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className="px-2 text-[12px] font-bold"
            style={{
              height: 28,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface-raised)",
              opacity: index === 0 ? 0.4 : 1,
            }}
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Move ${label} down`}
            disabled={last}
            onClick={() => onMove(1)}
            className="px-2 text-[12px] font-bold"
            style={{
              height: 28,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface-raised)",
              opacity: last ? 0.4 : 1,
            }}
          >
            ↓
          </button>
        </div>
      )}
    </Reorder.Item>
  );
}
