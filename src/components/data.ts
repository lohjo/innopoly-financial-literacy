// finfy-literacy — seeded data model for the frontend prototype.
// Gamification is limited to POINTS + STREAK + LEADERBOARD RANK (no gems/hearts/badges).

export const palette = {
  bg: "#ffffff",
  surface: "#f7f7f7",
  card: "#ffffff",
  hairline: "#e5e5e5",
  text: "#3c3c3c",
  muted: "#777777",
  green: "#58cc02",
  greenShadow: "#58a700",
  greenSoft: "#d7ffb8",
  blue: "#1cb0f6",
  blueShadow: "#1899d6",
  blueSoft: "#ddf4ff",
  orange: "#ff9600",
  red: "#ff4b4b",
  redSoft: "#ffdfe0",
  purple: "#ce82ff",
  gold: "#ffc800",
};

export type TrackId = "budgeting" | "saving" | "investing" | "credit";
export type Track = { id: TrackId; label: string; emoji: string; color: string };

export const tracks: Track[] = [
  { id: "budgeting", label: "Budgeting", emoji: "🧾", color: "#58cc02" },
  { id: "saving", label: "Saving", emoji: "🐖", color: "#1cb0f6" },
  { id: "investing", label: "Investing", emoji: "📈", color: "#ce82ff" },
  { id: "credit", label: "Credit", emoji: "💳", color: "#ff9600" },
];

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Status = "completed" | "active" | "locked";

export type Question = {
  concept: string; // used for missed-concept tracking
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Challenge = {
  id: string;
  track: TrackId;
  title: string;
  difficulty: Difficulty;
  minutes: number;
  status: Status;
  intro: string;
  questions: Question[];
};

export const challenges: Challenge[] = [
  {
    id: "credit-utilization-101",
    track: "credit",
    title: "Credit Utilization 101",
    difficulty: "Beginner",
    minutes: 2,
    status: "active",
    intro:
      "Your first credit card statement just arrived. In the next 2 minutes you'll learn how much of your limit you should actually use — and why it quietly moves your credit score.",
    questions: [
      {
        concept: "utilization ratio",
        prompt: "Your card limit is $1,000 and your balance is $300. What is your credit utilization?",
        options: ["3%", "30%", "300%"],
        answer: 1,
        explanation: "Utilization = balance ÷ limit = 300 ÷ 1,000 = 30%.",
      },
      {
        concept: "utilization ratio",
        prompt: "Keeping utilization under which threshold is a common rule of thumb for a healthy score?",
        options: ["Under 30%", "Under 70%", "Under 95%"],
        answer: 0,
        explanation: "Staying below ~30% utilization generally helps your credit score.",
      },
      {
        concept: "minimum-payment trap",
        prompt: "Paying only the minimum each month mostly covers ______.",
        options: ["The full balance", "Interest, so the balance barely shrinks", "Nothing at all"],
        answer: 1,
        explanation: "Minimum payments are mostly interest — the principal lingers and costs you more over time.",
      },
      {
        concept: "statement timing",
        prompt: "Utilization is usually reported to bureaus based on your balance on the ______.",
        options: ["Due date", "Statement closing date", "First of the year"],
        answer: 1,
        explanation: "Bureaus typically see the balance on your statement closing date, not the due date.",
      },
      {
        concept: "utilization ratio",
        prompt: "Which action lowers utilization fastest without hurting your score?",
        options: ["Close an old card", "Pay down the balance before the statement closes", "Ignore it"],
        answer: 1,
        explanation: "Paying before the statement closes lowers the reported balance; closing a card can raise utilization.",
      },
      {
        concept: "minimum-payment trap",
        prompt: "Carrying a balance month to month mainly benefits ______.",
        options: ["You, via rewards", "The lender, via interest", "Your credit score"],
        answer: 1,
        explanation: "Interest is the lender's revenue — carrying a balance costs you and doesn't boost your score.",
      },
    ],
  },
  {
    id: "budgeting-first-paycheck",
    track: "budgeting",
    title: "Your First Paycheck",
    difficulty: "Beginner",
    minutes: 2,
    status: "active",
    intro: "You just got paid. Let's split that first paycheck so it works for you, not against you.",
    questions: [
      {
        concept: "50/30/20 rule",
        prompt: "In the 50/30/20 rule, what does the 20% go toward?",
        options: ["Wants", "Needs", "Savings & debt paydown"],
        answer: 2,
        explanation: "50% needs, 30% wants, 20% savings & paying down debt.",
      },
      {
        concept: "pay yourself first",
        prompt: "\"Pay yourself first\" means you ______.",
        options: ["Spend, then save what's left", "Save before you spend", "Only save bonuses"],
        answer: 1,
        explanation: "Move money to savings the moment you're paid, before discretionary spending.",
      },
      {
        concept: "fixed vs variable",
        prompt: "Which of these is a fixed expense?",
        options: ["Rent", "Dining out", "Concert tickets"],
        answer: 0,
        explanation: "Rent is fixed and predictable; dining and entertainment are variable.",
      },
    ],
  },
  {
    id: "emergency-fund",
    track: "saving",
    title: "Build an Emergency Fund",
    difficulty: "Beginner",
    minutes: 3,
    status: "locked",
    intro: "A small cushion keeps a bad week from becoming a bad year.",
    questions: [
      {
        concept: "emergency fund size",
        prompt: "A common starter emergency fund target is ______.",
        options: ["$50", "3–6 months of expenses", "One year of salary"],
        answer: 1,
        explanation: "3–6 months of essential expenses is a widely used target.",
      },
    ],
  },
  {
    id: "compounding-basics",
    track: "investing",
    title: "The Magic of Compounding",
    difficulty: "Intermediate",
    minutes: 3,
    status: "locked",
    intro: "Time is an investor's best friend. See why starting early beats investing more later.",
    questions: [
      {
        concept: "compounding",
        prompt: "Compounding means you earn returns on ______.",
        options: ["Only your deposits", "Your deposits AND past returns", "Only interest rates"],
        answer: 1,
        explanation: "You earn returns on your contributions plus previously earned returns.",
      },
    ],
  },
];

// --- Leaderboard (named invited peers only) ---
export type Player = { id: string; name: string; points: number; streak: number; avatar: string; you?: boolean };
export const peers: Player[] = [
  { id: "priya", name: "Priya", points: 1780, streak: 21, avatar: "🦊" },
  { id: "marcus", name: "Marcus", points: 1750, streak: 14, avatar: "🐼" },
  { id: "you", name: "You", points: 1680, streak: 12, avatar: "🦝", you: true },
  { id: "ava", name: "Ava", points: 1420, streak: 9, avatar: "🐨" },
  { id: "leo", name: "Leo", points: 1180, streak: 5, avatar: "🦁" },
];

// --- Progress (streak history dot grid + points history) ---
export const progress = {
  currentStreak: 12,
  longestStreak: 18,
  atRisk: false,
  // last 14 days activity (true = practiced)
  days: [true, true, false, true, true, true, true, false, true, true, true, true, true, false],
  pointsHistory: [
    { label: "This week", points: 320 },
    { label: "Last week", points: 210 },
    { label: "2 weeks ago", points: 140 },
  ],
  completedCount: 5,
};

// --- Strict 4-field AI recap (deterministic generator) ---
export type Recap = {
  whatYouDid: string;
  score: string;
  nextStep: string;
  trackPosition: string;
  compliance: string;
  fallback?: boolean;
};

export function buildRecap(opts: {
  title: string;
  correct: number;
  total: number;
  points: number;
  missedConcepts: string[];
  fallback?: boolean;
}): Recap {
  const { title, correct, total, points, missedConcepts, fallback } = opts;
  const you = peers.find((p) => p.you)!;
  const ahead = [...peers].sort((a, b) => b.points - a.points).find((p) => p.points > you.points);
  const gap = ahead ? ahead.points - you.points : 0;

  // Pick exactly one next step, grounded in a missed concept (or forward-looking on a perfect score).
  const perfect = correct === total;
  const topMissed = missedConcepts[0];
  const nextStep = perfect
    ? "Perfect run — preview “Build an Emergency Fund” next to keep the momentum going."
    : `Review how ${topMissed} works — it's the concept you missed${
        missedConcepts.length > 1 ? " more than once" : ""
      }.`;

  const trackPosition =
    ahead && gap > 0
      ? `You've completed ${progress.completedCount} challenges this week, up from 2 last week. You're ${gap} points behind ${ahead.name} — one more challenge closes the gap.`
      : `You've completed ${progress.completedCount} challenges this week, up from 2 last week. You're leading your peer group — keep it going.`;

  return {
    whatYouDid: `You completed ${title}.`,
    score: `${correct} of ${total} correct — ${points} points earned.`,
    nextStep,
    trackPosition,
    compliance: "Checked for accuracy — this is education, not advice.",
    fallback,
  };
}

export const trackById = (id: TrackId) => tracks.find((t) => t.id === id)!;
export const challengeById = (id: string) => challenges.find((c) => c.id === id);
