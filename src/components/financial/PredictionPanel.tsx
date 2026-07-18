import { useState } from "react";
import { Num, PrimaryButton } from "../primitives";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** Prediction before evidence (spec §2.2 step 2). Ghost marker keeps the learner's guess
    visible after the reveal so the gap itself teaches. */
export function PredictionPanel({
  prompt,
  min,
  max,
  step,
  actual,
  explanation,
  predicted,
  onPredict,
}: {
  prompt: string;
  min: number;
  max: number;
  step: number;
  actual: number;
  explanation: string;
  predicted: number | null;
  onPredict: (v: number) => void;
}) {
  const [value, setValue] = useState(Math.round((min + max) / 2 / step) * step);
  const locked = predicted !== null;
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[18px]">{prompt}</h2>
      <div className="rounded-[var(--radius-card)] p-4" style={{ border: "2px solid var(--border)", background: "var(--card)" }}>
        <div className="relative pt-8 pb-2">
          {locked && (
            <>
              <div className="absolute top-0 -translate-x-1/2 text-[12px] font-bold" style={{ left: pos(predicted), color: "var(--muted-foreground)" }}>
                you: {fmt(predicted)}
              </div>
              <div className="absolute top-0 -translate-x-1/2 text-[12px] font-bold" style={{ left: pos(actual), color: "var(--brand-hover)", marginTop: 16 }}>
                actual: {fmt(actual)}
              </div>
            </>
          )}
          <input
            type="range"
            className="w-full"
            min={min}
            max={max}
            step={step}
            value={locked ? predicted : value}
            disabled={locked}
            onChange={(e) => setValue(Number(e.target.value))}
            style={{ accentColor: "var(--brand)" }}
            aria-label={prompt}
          />
          <div className="flex justify-between text-[12px]" style={{ color: "var(--muted-foreground)" }}>
            <Num>{fmt(min)}</Num>
            {!locked && <Num className="font-extrabold text-[15px]">{fmt(value)}</Num>}
            <Num>{fmt(max)}</Num>
          </div>
        </div>
        {locked && (
          <p className="text-[14px] mt-2" style={{ color: "var(--foreground)" }}>
            {explanation}
          </p>
        )}
      </div>
      {!locked && <PrimaryButton onClick={() => onPredict(value)}>Lock in my prediction</PrimaryButton>}
    </div>
  );
}
