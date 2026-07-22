import { CHAPTERS } from "../../content/chapters";

/** First not-yet-completed lesson in chapter order — the "current" lesson
    everywhere (Journey path glow, Home continue hero). */
export function currentLessonId(lessonsCompleted: string[]): string | undefined {
  return CHAPTERS.flatMap((c) => c.lessons.map((l) => l.id)).find((id) => !lessonsCompleted.includes(id));
}

/** Current lesson plus its chapter, for surfaces that show both (Home hero). */
export function currentLessonInfo(lessonsCompleted: string[]) {
  for (const chapter of CHAPTERS) {
    const lesson = chapter.lessons.find((l) => !lessonsCompleted.includes(l.id));
    if (lesson) return { chapter, lesson };
  }
  return null;
}
