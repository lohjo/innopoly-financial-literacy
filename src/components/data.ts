// finfy-literacy — data model for the gamified financial literacy app.

export const palette = {
  bg: "#131f24",
  bgDeep: "#0e181c",
  card: "#1c2b33",
  cardAlt: "#202f36",
  border: "#37464f",
  green: "#58cc02",
  greenDark: "#46a302",
  greenText: "#79b933",
  blue: "#1cb0f6",
  blueDark: "#1899d6",
  red: "#ff4b4b",
  gold: "#ffc800",
  orange: "#ff9600",
  purple: "#ce82ff",
  purpleDark: "#a568cc",
  text: "#ffffff",
  subtext: "#93a4ad",
};

export type Category = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

export const categories: Category[] = [
  { id: "investing", label: "Investing", emoji: "💰", color: "#58cc02" },
  { id: "fixed-income", label: "Fixed Income", emoji: "🏦", color: "#1cb0f6" },
  { id: "economics", label: "Economics", emoji: "🌍", color: "#ce82ff" },
  { id: "personal", label: "Personal Finance", emoji: "💳", color: "#ff9600" },
  { id: "credit", label: "Credit", emoji: "📊", color: "#ff4b4b" },
];

export type Unit = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  progress: number; // 0 - 100
  kind: "story" | "quiz" | "interactive";
};

export const units: Unit[] = [
  { id: "start", title: "Start Here", emoji: "🌱", color: "#58cc02", progress: 100, kind: "story" },
  { id: "basics", title: "Investing Basics", emoji: "💡", color: "#58cc02", progress: 83, kind: "quiz" },
  { id: "strategies", title: "Investing Strategies", emoji: "😎", color: "#58cc02", progress: 40, kind: "interactive" },
  { id: "mutual", title: "Mutual Funds", emoji: "💵", color: "#46a302", progress: 4, kind: "quiz" },
  { id: "fundamental", title: "Fundamental Analysis", emoji: "🔬", color: "#37464f", progress: 0, kind: "story" },
  { id: "shenanigans", title: "Financial Shenanigans", emoji: "🏴‍☠️", color: "#37464f", progress: 0, kind: "quiz" },
  { id: "compound", title: "The Magic of Compounding", emoji: "🪄", color: "#37464f", progress: 0, kind: "interactive" },
];

// --- Story / lesson content (swipe-through slides) ---
export type Slide = { title: string; body: string };

export const storySlides: Slide[] = [
  {
    title: "What is a Stock or an Equity Share?",
    body: "When you buy a stock, you are buying a small piece of ownership in a company.",
  },
  {
    title: "You own a slice 🍕",
    body: "Let's say you buy one stock of Tesla Inc. This means you actually own 0.0000001% of it. Just like Elon Musk, you too own some part of Tesla! Only, you own a little less than him 😅.",
  },
  {
    title: "Why do companies sell stock?",
    body: "Companies sell shares to raise money — to build factories, hire people, or grow. In return, shareholders get a stake in the company's future profits.",
  },
  {
    title: "How do you make money?",
    body: "Two ways: the share price goes up (capital gains), or the company pays you a slice of its profit (dividends). Both reward patient, long-term owners.",
  },
];

// --- Quiz content ---
export type Question = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const quizQuestions: Question[] = [
  {
    prompt: "What does buying a stock actually give you?",
    options: ["A loan to the company", "Ownership in the company", "A fixed monthly payment"],
    answer: 1,
    explanation: "A stock (equity share) represents partial ownership in a company — not a loan.",
  },
  {
    prompt: "Money a company pays shareholders from its profits is called a ______.",
    options: ["Coupon", "Dividend", "Premium"],
    answer: 1,
    explanation: "Dividends are periodic payments made to shareholders from company profits.",
  },
  {
    prompt: "The company gets listed on the stock exchange after ______.",
    options: ["Rights Issue", "IPO", "FPO"],
    answer: 1,
    explanation: "An IPO (Initial Public Offering) is the first time a company sells shares to the public.",
  },
  {
    prompt: "Which investment is generally considered the most volatile?",
    options: ["Government bonds", "Fixed deposits", "Stocks"],
    answer: 2,
    explanation: "Stocks fluctuate the most in the short term, but historically reward long-term investors.",
  },
];

// --- Story lesson (chat + image choice) ---
export type ChatLine = { speaker: "finn" | "you"; text: string };
export const storyChat: ChatLine[] = [
  { speaker: "finn", text: "You just got your first paycheck 🎉 What should you do with the extra cash?" },
  { speaker: "you", text: "Then go for stocks! Even if they fall, there's time to bounce back." },
  { speaker: "finn", text: "But I am not okay taking a lot of risks." },
  { speaker: "you", text: "Then invest more in bonds or fixed deposits." },
];

export const storyChoice = {
  prompt: "Who should invest in stocks more?",
  options: [
    { id: "retiree", label: "Retiree", emoji: "🧓", correct: false },
    { id: "grad", label: "Young graduate", emoji: "🧑‍💻", correct: true },
  ],
  explanation: "A young graduate has decades to ride out market ups and downs, so they can take more equity risk.",
};

// --- Leaderboard ---
export type Player = { name: string; xp: number; avatar: string; you?: boolean };
export const leaderboard: Player[] = [
  { name: "Priya", xp: 2480, avatar: "🦊" },
  { name: "Marcus", xp: 2210, avatar: "🐼" },
  { name: "Spongebob", xp: 1960, avatar: "🧽" },
  { name: "You", xp: 1720, avatar: "🦝", you: true },
  { name: "Ava", xp: 1540, avatar: "🐨" },
  { name: "Leo", xp: 1320, avatar: "🦁" },
  { name: "Mia", xp: 1180, avatar: "🐸" },
  { name: "Noah", xp: 940, avatar: "🐧" },
];

// --- Daily quests ---
export type Quest = { id: string; label: string; emoji: string; current: number; goal: number; reward: number };
export const dailyQuests: Quest[] = [
  { id: "xp", label: "Earn 40 XP", emoji: "⚡", current: 30, goal: 40, reward: 20 },
  { id: "lessons", label: "Complete 2 lessons", emoji: "📚", current: 1, goal: 2, reward: 15 },
  { id: "perfect", label: "Get a perfect quiz score", emoji: "🎯", current: 0, goal: 1, reward: 30 },
];
