import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles } from "lucide-react";
import { palette } from "./data";
import { Mascot, ChunkyButton } from "./Shell";

type Msg = { role: "finn" | "you"; text: string };

// Strict-format summary the "AI" always returns.
function buildSummary(topic: string) {
  const t = topic.trim() || "your recent lessons";
  return `📌 TOPIC: ${t}

🔑 KEY TAKEAWAYS
1. Start early — time in the market beats timing the market.
2. Diversify across stocks, bonds & funds to lower risk.
3. Automate a fixed monthly amount (dollar-cost averaging).

💡 DO THIS NEXT
• Set aside 15% of your first paycheck.
• Open a low-cost index fund.

⚠️ WATCH OUT FOR
• High fees quietly eat long-term returns.`;
}

const mockAnswers: Record<string, string> = {
  default:
    "Great question! In short: invest consistently, keep costs low, and give it time. Want me to summarise a topic in the strict format? Tap a chip below 👇",
  compound:
    "Compounding is earning returns on your returns. $200/mo at 8% for 30 years becomes ~$298k — and you only put in $72k. The rest is compounding 🪄.",
  budget:
    "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings & investing. On your first paycheck, pay your future self first.",
};

export function StudyBuddy() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "finn", text: "Hey, I'm Finn — your AI study buddy 🦝. Ask me anything about money, or get a strict-format summary." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const reply = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      const lower = text.toLowerCase();
      let answer = mockAnswers.default;
      if (lower.startsWith("summar") || lower.includes("summary of")) answer = buildSummary(text.replace(/summari[sz]e|summary of/gi, ""));
      else if (lower.includes("compound")) answer = mockAnswers.compound;
      else if (lower.includes("budget") || lower.includes("50/30/20")) answer = mockAnswers.budget;
      setMessages((m) => [...m, { role: "finn", text: answer }]);
      setTyping(false);
    }, 700);
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "you", text }]);
    setInput("");
    reply(text);
  };

  const chips = ["Summarise: Investing Basics", "Explain compounding", "Help me budget"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `2px solid ${palette.border}` }}>
        <Mascot size={42} />
        <div>
          <p style={{ fontWeight: 900, color: palette.text, fontSize: 18, display: "flex", alignItems: "center", gap: 6 }}>
            Finn AI <Sparkles size={16} color={palette.purple} />
          </p>
          <p style={{ color: palette.greenText, fontSize: 12, fontWeight: 700 }}>● online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "you" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="rounded-2xl px-4 py-3 max-w-[85%]"
              style={{
                background: m.role === "you" ? palette.blue : palette.card,
                border: `2px solid ${m.role === "you" ? palette.blueDark : palette.purpleDark}`,
                color: palette.text,
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 flex gap-1" style={{ background: palette.card, border: `2px solid ${palette.purpleDark}` }}>
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="rounded-full"
                    style={{ width: 7, height: 7, background: palette.purple }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2" style={{ scrollbarWidth: "none" }}>
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              className="shrink-0 rounded-full px-3 py-1.5"
              style={{ background: "rgba(206,130,255,0.14)", border: `1.5px solid ${palette.purpleDark}`, color: palette.purple, fontSize: 12, fontWeight: 700 }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask Finn about money…"
            className="flex-1 rounded-full px-4 py-3 outline-none"
            style={{ background: palette.card, border: `2px solid ${palette.border}`, color: palette.text, fontSize: 14 }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => send(input)}
            className="rounded-full flex items-center justify-center shrink-0"
            style={{ width: 46, height: 46, background: palette.green }}
          >
            <Send size={20} color="#fff" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
