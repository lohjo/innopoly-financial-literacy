/** 4-point verbal confidence scale (spec: no false 0-100 precision; separate from competence). */
const LEVELS = ["Just guessing", "Not sure", "Fairly sure", "Certain"];

export function ConfidenceMeter({
  value,
  onChange,
  label = "How confident are you?",
}: {
  value: number | null;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-[14px] font-bold mb-1">{label}</legend>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {LEVELS.map((l, i) => {
          const selected = value === i;
          return (
            <button
              key={l}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(i)}
              className="flex-1 text-[12.5px] font-bold px-1"
              style={{
                minHeight: 44,
                borderRadius: 12,
                border: `2px solid ${selected ? "var(--brand)" : "var(--border)"}`,
                background: selected ? "var(--brand-soft)" : "var(--card)",
                color: selected ? "var(--brand-hover)" : "var(--muted-foreground)",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
