/* Single localStorage-backed store. Versioned; append-only evidence ledger.
   ponytail: localStorage not IndexedDB — revisit if evidence log grows past a few thousand events. */
import { useSyncExternalStore } from "react";
import type { EvidenceEvent } from "../features/learning-episode/types";

export type Profile = {
  name: string;
  goalId: string;
  jurisdiction: "SG";
  createdAt: number;
};

export type Prefs = {
  captions: boolean;
  reduceMotion: boolean;
  theme: "light" | "dark" | "system";
  palette: "default" | "sunburst" | "glasswing" | "sprout-arcade" | "violet-glass" | "grass-glass";
};

export type CallRecord = {
  scenarioId: string;
  at: number;
  /** rubric levels per dimension: Emerging | Developing | Ready | Strong */
  levels: Record<string, string>;
  branchPath: string[];
};

export type StoreState = {
  v: 1;
  profile: Profile | null;
  prefs: Prefs;
  evidence: EvidenceEvent[];
  xp: number;
  streak: { current: number; lastActiveDay: string | null };
  lessonsCompleted: string[];
  reviewsDone: Record<string, number>; // conceptId -> count of passed reviews
  callsCompleted: CallRecord[];
  achievements: string[];
  missionsDone: string[];
  /** dev-only clock offset for testing spaced review */
  timeOffsetMs: number;
};

const KEY = "finfy.v1";

const DEFAULT: StoreState = {
  v: 1,
  profile: null,
  prefs: { captions: true, reduceMotion: false, theme: "system", palette: "default" },
  evidence: [],
  xp: 0,
  streak: { current: 0, lastActiveDay: null },
  lessonsCompleted: [],
  reviewsDone: {},
  callsCompleted: [],
  achievements: [],
  missionsDone: [],
  timeOffsetMs: 0,
};

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const parsed = JSON.parse(raw) as StoreState;
    if (parsed.v !== 1) return structuredClone(DEFAULT);
    return { ...structuredClone(DEFAULT), ...parsed };
  } catch {
    return structuredClone(DEFAULT);
  }
}

let state: StoreState = typeof localStorage !== "undefined" ? load() : structuredClone(DEFAULT);
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full/denied — keep in-memory */
  }
}

export function setState(patch: Partial<StoreState> | ((s: StoreState) => Partial<StoreState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  persist();
  listeners.forEach((l) => l());
}

export function getState(): StoreState {
  return state;
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

/* --- domain helpers --- */

export function now(): number {
  return Date.now() + state.timeOffsetMs;
}

let evidenceSeq = 0;
export function recordEvidence(e: Omit<EvidenceEvent, "id" | "at">): EvidenceEvent {
  const event: EvidenceEvent = { ...e, id: `ev-${now()}-${evidenceSeq++}`, at: now() };
  setState((s) => ({ evidence: [...s.evidence, event] }));
  return event;
}

function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Streak counts meaningful learning activity days (spec §15.2: episode, not app open). */
export function touchStreak() {
  const today = dayKey(now());
  setState((s) => {
    if (s.streak.lastActiveDay === today) return {};
    const yesterday = dayKey(now() - 86400000);
    const current = s.streak.lastActiveDay === yesterday ? s.streak.current + 1 : 1;
    return { streak: { current, lastActiveDay: today } };
  });
}

export function awardXp(amount: number) {
  setState((s) => ({ xp: s.xp + amount }));
}

export function unlockAchievement(id: string) {
  setState((s) => (s.achievements.includes(id) ? {} : { achievements: [...s.achievements, id] }));
}

export type MemoryClass = "profile" | "evidence" | "preferences" | "progress";

/** Memory inspector reset (spec §3.7: learner control per class). */
export function resetClass(cls: MemoryClass) {
  if (cls === "profile") setState({ profile: null });
  if (cls === "evidence") setState({ evidence: [] });
  if (cls === "preferences") setState({ prefs: structuredClone(DEFAULT.prefs) });
  if (cls === "progress")
    setState({
      xp: 0,
      streak: { current: 0, lastActiveDay: null },
      lessonsCompleted: [],
      reviewsDone: {},
      callsCompleted: [],
      achievements: [],
      missionsDone: [],
    });
}

export function resetAll() {
  state = structuredClone(DEFAULT);
  persist();
  listeners.forEach((l) => l());
}
