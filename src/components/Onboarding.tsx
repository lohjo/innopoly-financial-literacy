import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Copy } from "lucide-react";
import { useNavigate } from "react-router";
import { palette } from "./data";
import { PrimaryButton, SecondaryButton } from "./Shell";

// First-paycheck hook (route "/")
export function HookScreen() {
  const nav = useNavigate();
  return (
    <div className="flex flex-col h-full px-6 py-8" style={{ background: palette.green }}>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          style={{ fontSize: 92 }}
          aria-hidden
        >
          🦝
        </motion.div>
        <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 900, lineHeight: 1.15 }}>
          You just got paid. Let's make the first move count.
        </h1>
        <p style={{ color: "#eaffd6", fontSize: 16, fontWeight: 700, maxWidth: 300 }}>
          Two-minute money challenges with real friends. This is a game, not a financial plan.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <PrimaryButton color="#fff" shadow="#c8e6a8" onClick={() => nav("/signup")}>
          <span style={{ color: palette.green }}>Get started</span>
        </PrimaryButton>
        <button
          onClick={() => nav("/learn")}
          style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: 0.5, textTransform: "uppercase", minHeight: 44 }}
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}

// One-screen signup (route "/signup")
export function SignupScreen() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter your name and a valid email to continue.");
      return;
    }
    setError(null);
    nav("/learn?firstRun=1");
  };

  return (
    <div className="flex flex-col h-full px-6 py-6">
      <button onClick={() => nav("/")} aria-label="Back" className="self-start" style={{ minHeight: 44, minWidth: 44 }}>
        <X size={26} color={palette.muted} strokeWidth={3} />
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Create your account</h1>
      <p style={{ color: palette.muted, marginTop: 4, fontWeight: 600 }}>Takes 20 seconds. No card, no bank linking.</p>

      <div className="flex flex-col gap-3 mt-6">
        <Field label="Name" value={name} onChange={setName} placeholder="Alex Chen" />
        <Field label="Email" value={email} onChange={setEmail} placeholder="alex@email.com" type="email" />
        {error && (
          <p role="alert" style={{ color: palette.red, fontSize: 13, fontWeight: 700 }}>
            {error}
          </p>
        )}
      </div>

      <div className="flex-1" />
      <p style={{ color: palette.muted, fontSize: 12, textAlign: "center", marginBottom: 12 }}>
        This is a game, not a financial plan.
      </p>
      <PrimaryButton onClick={submit}>Continue</PrimaryButton>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span style={{ fontSize: 13, fontWeight: 800, color: palette.muted }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none focus:border-[#1cb0f6]"
        style={{
          height: 48,
          borderRadius: 12,
          border: `2px solid ${palette.hairline}`,
          padding: "0 14px",
          fontSize: 16,
          fontWeight: 600,
          color: palette.text,
        }}
      />
    </label>
  );
}

// Invite peer overlay — top-level, focus-trapped, restores focus on close (audit R2/R24)
export function InvitePeerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const invokerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      invokerRef.current = document.activeElement;
      closeRef.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    } else if (invokerRef.current instanceof HTMLElement) {
      invokerRef.current.focus();
    }
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end"
          role="dialog"
          aria-modal="true"
          aria-label="Invite a friend"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={onClose}
        >
          <motion.div
            className="w-full bg-white"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 style={{ fontSize: 22, fontWeight: 900 }}>Invite a friend</h2>
              <button ref={closeRef} onClick={onClose} aria-label="Close" style={{ minHeight: 44, minWidth: 44 }}>
                <X size={24} color={palette.muted} strokeWidth={3} />
              </button>
            </div>
            <p style={{ color: palette.muted, fontWeight: 600, marginBottom: 16 }}>
              Learning is better with people you know. Share your code — they join your leaderboard.
            </p>
            <div
              className="flex items-center justify-between mb-4"
              style={{ background: palette.surface, borderRadius: 12, border: `2px solid ${palette.hairline}`, padding: "12px 16px" }}
            >
              <span className="tnum" style={{ fontWeight: 900, letterSpacing: 2, fontSize: 18 }}>
                FINFY-4823
              </span>
              <button
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="flex items-center gap-1.5"
                style={{ color: palette.blue, fontWeight: 800, fontSize: 13, minHeight: 44 }}
              >
                {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <PrimaryButton onClick={onClose}>Share invite</PrimaryButton>
            <button
              onClick={onClose}
              className="w-full"
              style={{ color: palette.muted, fontWeight: 800, fontSize: 13, textTransform: "uppercase", marginTop: 12, minHeight: 44 }}
            >
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
