import type { ChapterDoc } from "../features/learning-episode/types";

/* Course map (brilliant-replicate §course-map, wedge slice: Ch0 + Ch1). */
export const CHAPTERS: ChapterDoc[] = [
  {
    id: "ch0",
    title: "The Night It Lands",
    tagline: "Your first paycheck arrived. What happens tonight decides the month.",
    lessons: [
      { id: "night-it-lands", title: "The Night It Lands", minutes: 4 },
      { id: "missing-740", title: "The Case of the Missing $740", minutes: 3 },
    ],
  },
  {
    id: "ch1",
    title: "Keeping the Month Alive",
    tagline: "Budgets that survive contact with reality — and the trap that eats paychecks.",
    lessons: [
      { id: "fixed-vs-flexible", title: "What Won't Bend", minutes: 3 },
      { id: "shock-month", title: "The Shock Month", minutes: 4 },
      { id: "minimum-payment-trap", title: "The Minimum Payment Trap", minutes: 4 },
    ],
  },
];
