import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { palette } from "./data";
import { ChunkyButton } from "./Shell";

// Brilliant-style interactive lesson: feel compounding & dollar-cost averaging
// by dragging the inputs and watching the outcome update live.
export function InteractiveLesson({ onExit, onDone }: { onExit: () => void; onDone: () => void }) {
  const [monthly, setMonthly] = useState(200);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8);

  const { finalValue, contributed, growth, points, max } = useMemo(() => {
    const months = years * 12;
    const r = rate / 100 / 12;
    const pts: number[] = [];
    let balance = 0;
    for (let m = 1; m <= months; m++) {
      balance = balance * (1 + r) + monthly;
      if (m % 12 === 0) pts.push(balance);
    }
    const contributed = monthly * months;
    return {
      finalValue: Math.round(balance),
      contributed,
      growth: Math.round(balance - contributed),
      points: pts,
      max: Math.max(...pts, 1),
    };
  }, [monthly, years, rate]);

  const fmt = (n: number) => "$" + n.toLocaleString("en-US");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={onExit}>
          <X size={26} color={palette.subtext} strokeWidth={3} />
        </button>
        <span style={{ fontWeight: 800, color: palette.text, fontSize: 18 }}>The Magic of Compounding</span>
      </div>

      <div className="flex-1 px-5 py-2 overflow-y-auto">
        <p style={{ color: palette.subtext, fontSize: 15, lineHeight: 1.5, marginBottom: 18 }}>
          Invest a little every month and let time do the heavy lifting. Drag the sliders and watch your money grow. 🪄
        </p>

        {/* Result card */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: palette.card, border: `2px solid ${palette.border}` }}>
          <p style={{ color: palette.subtext, fontSize: 13 }}>After {years} years you'd have</p>
          <motion.p key={finalValue} initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ fontWeight: 900, fontSize: 34, color: palette.green }}>
            {fmt(finalValue)}
          </motion.p>

          {/* Bar chart */}
          <div className="flex items-end gap-1 h-[110px] mt-4">
            {points.map((p, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t"
                style={{ background: `linear-gradient(${palette.green},${palette.greenDark})` }}
                animate={{ height: `${(p / max) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />
            ))}
          </div>

          <div className="flex justify-between mt-3 text-center">
            <div>
              <p style={{ color: palette.subtext, fontSize: 12 }}>You put in</p>
              <p style={{ fontWeight: 800, color: palette.text }}>{fmt(contributed)}</p>
            </div>
            <div>
              <p style={{ color: palette.subtext, fontSize: 12 }}>Compound growth</p>
              <p style={{ fontWeight: 800, color: palette.gold }}>{fmt(growth)}</p>
            </div>
          </div>
        </div>

        <Slider label="Monthly investment" value={monthly} min={50} max={1000} step={50} suffix="/mo" onChange={setMonthly} format={fmt} />
        <Slider label="Time invested" value={years} min={1} max={40} step={1} suffix=" yrs" onChange={setYears} />
        <Slider label="Expected return" value={rate} min={2} max={14} step={1} suffix="%" onChange={setRate} />
      </div>

      <div className="px-5 py-4">
        <ChunkyButton onClick={onDone}>Got it!</ChunkyButton>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
  format?: (n: number) => string;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span style={{ color: palette.subtext, fontSize: 14, fontWeight: 700 }}>{label}</span>
        <span style={{ color: palette.text, fontSize: 14, fontWeight: 800 }}>
          {format ? format(value) : value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: palette.green }}
      />
    </div>
  );
}
