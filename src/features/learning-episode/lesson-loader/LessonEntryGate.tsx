import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { dur, ease, useMotionPrefs } from "../../../motion";
import LessonLoadingScreen from "./LoadingScreen";
import { LOOP_DURATION } from "./types";

/**
 * Shows the lesson loading story once on entry, then fades out so the
 * CoursePlayer underneath is revealed. Skipped under reduced motion.
 * Also used as the Suspense fallback for /learn and /review chunk loads.
 */
export function LessonEntryGate({ children }: { children: ReactNode }) {
  const { collapse } = useMotionPrefs();
  const [ready, setReady] = useState(collapse);

  useEffect(() => {
    if (collapse) {
      setReady(true);
      return;
    }
    const t = setTimeout(() => setReady(true), Math.round(LOOP_DURATION * 1000));
    return () => clearTimeout(t);
  }, [collapse]);

  return (
    <>
      {children}
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="lesson-loader"
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur.page, ease: ease.exit }}
            aria-hidden={false}
          >
            <LessonLoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
