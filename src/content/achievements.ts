/* Process achievements only — no vanity badges (spec §5.1). Each names an observable behavior. */
export type AchievementDef = { id: string; title: string; body: string };

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-episode", title: "Showed up", body: "Completed your first learning episode." },
  { id: "unaided-episode", title: "Did the thinking", body: "Finished an episode without opening a single hint." },
  { id: "asked-total-cost", title: "Asked for the total cost", body: "In a live conversation, you asked what it costs in total — the question that deflates every sales pitch." },
  { id: "held-boundary", title: "Held a boundary", body: "Kept your criteria through pressure in a rehearsal call." },
  { id: "first-mission", title: "Took it offline", body: "Completed a real-world mission and reported back." },
  { id: "revised-with-evidence", title: "Revised with evidence", body: "Changed your model after seeing the consequences — the core move of learning." },
  { id: "first-review", title: "Came back for it", body: "Passed a spaced review days after learning — that's what makes it durable." },
  { id: "courageous-retry", title: "Courageous retry", body: "Failed, retried, and passed on the same criteria." },
];

export const achievementById = (id: string): AchievementDef | undefined => ACHIEVEMENTS.find((a) => a.id === id);
