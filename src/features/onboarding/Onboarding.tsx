import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { PrimaryButton, SecondaryButton } from "../../components/primitives";
import { FinnAvatar } from "../copilot/FinnAvatar";
import { GOALS } from "./goals";
import { setState, now } from "../../stores/store";

type Step = "hook" | "goal" | "name";

/** Onboarding: value-first, account-after-value (mobbin audit — Cleo paycheck framing).
    Three taps: hook → goal → name → straight into the first episode. */
export function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("hook");
  const [goalId, setGoalId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const start = () => {
    setState({
      profile: { name: name.trim() || "friend", goalId: goalId ?? GOALS[0].id, jurisdiction: "SG", createdAt: now() },
    });
    nav("/learn/night-it-lands");
  };

  return (
    <div className="mx-auto w-full max-w-[430px] px-6 py-10 flex flex-col gap-6" style={{ minHeight: "100dvh" }}>
      {step === "hook" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 flex-1">
          <div className="flex flex-col items-center gap-4 pt-10 text-center">
            <FinnAvatar expression="curious" size={110} />
            <h1 className="text-[26px] leading-tight">Your first paycheck just landed. Now what?</h1>
            <p className="text-[15px] max-w-[32ch]" style={{ color: "var(--muted-foreground)" }}>
              Not a course. A safe place to rehearse the money decisions this month is about to throw at you — tonight's routing, the
              friend's trip, the card booth.
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <PrimaryButton onClick={() => setStep("goal")}>Start — it's 4 minutes</PrimaryButton>
            <p className="text-center text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              No account, no bank connection, no email. Everything stays on this device.
            </p>
          </div>
        </motion.div>
      )}

      {step === "goal" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 flex-1">
          <FinnAvatar expression="attentive" size={56} />
          <h2 className="text-[22px]">What should this month get easier?</h2>
          <p className="text-[13.5px] -mt-2" style={{ color: "var(--muted-foreground)" }}>
            One tap. This picks your starting episodes — you can change it anytime, and you'll always see why something was recommended.
          </p>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Your goal">
            {GOALS.map((g) => (
              <button
                key={g.id}
                role="radio"
                aria-checked={goalId === g.id}
                onClick={() => setGoalId(g.id)}
                className="text-left text-[14.5px] px-4 py-3.5 font-bold"
                style={{
                  borderRadius: "var(--radius-action)",
                  border: `2px solid ${goalId === g.id ? "var(--brand)" : "var(--border)"}`,
                  background: goalId === g.id ? "var(--brand-soft)" : "var(--card)",
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="mt-auto">
            <PrimaryButton disabled={goalId === null} onClick={() => setStep("name")}>
              Next
            </PrimaryButton>
          </div>
        </motion.div>
      )}

      {step === "name" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 flex-1">
          <FinnAvatar expression="reassuring" size={56} />
          <h2 className="text-[22px]">What should Finn call you?</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name or nickname"
            aria-label="Your name"
            autoFocus
            className="px-4 text-[15px]"
            style={{ height: 48, borderRadius: "var(--radius-action)", border: "2px solid var(--border)", background: "var(--card)" }}
            onKeyDown={(e) => e.key === "Enter" && start()}
          />
          <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
            Stored only on this device. You can inspect or erase everything Finfy remembers in Settings.
          </p>
          <div className="mt-auto flex flex-col gap-2">
            <PrimaryButton onClick={start}>Start the first episode</PrimaryButton>
            <SecondaryButton onClick={start}>Skip the name</SecondaryButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}
