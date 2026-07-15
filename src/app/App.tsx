import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { palette, Unit } from "../components/data";
import { TopBar, BottomNav, Tab, Stats } from "../components/Shell";
import { ExploreScreen } from "../components/ExploreScreen";
import { LessonContent, StoryLesson } from "../components/LessonContent";
import { QuizScreen } from "../components/QuizScreen";
import { InteractiveLesson } from "../components/InteractiveLesson";
import { CompleteScreen } from "../components/CompleteScreen";
import { LeaderboardScreen, DailyQuestScreen, ProfileScreen } from "../components/Screens";
import { StudyBuddy } from "../components/StudyBuddy";

// Lesson flow: which step of a lesson we're in.
type Flow = null | "content" | "quiz" | "story" | "interactive" | "complete";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [flow, setFlow] = useState<Flow>(null);
  const [stats, setStats] = useState<Stats>({ streak: 12, bananas: 558, gems: 54, hearts: 5 });
  const [reward, setReward] = useState({ bananas: 40, gems: 2 });

  const loseHeart = () => setStats((s) => ({ ...s, hearts: Math.max(0, s.hearts - 1) }));

  const openUnit = (u: Unit) => {
    if (u.progress === 0 && u.id !== "fundamental" && u.id !== "shenanigans" && u.id !== "compound") {
      // locked ones still previewable in this demo — open by kind
    }
    if (u.kind === "story") setFlow("story");
    else if (u.kind === "interactive") setFlow("interactive");
    else setFlow("content"); // quiz units start with a teaching slide then the quiz
  };

  const finishLesson = (earnedBananas = 40, earnedGems = 2) => {
    setReward({ bananas: earnedBananas, gems: earnedGems });
    setStats((s) => ({ ...s, bananas: s.bananas + earnedBananas, gems: s.gems + earnedGems }));
    setFlow("complete");
  };

  const exitFlow = () => setFlow(null);

  const renderTab = () => {
    switch (tab) {
      case "home":
        return <ExploreScreen onOpenUnit={openUnit} />;
      case "quest":
        return <DailyQuestScreen />;
      case "leaderboard":
        return <LeaderboardScreen />;
      case "profile":
        return <ProfileScreen stats={stats} />;
      case "buddy":
        return <StudyBuddy />;
    }
  };

  const inFlow = flow !== null;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: "radial-gradient(circle at 50% 0%, #1c2b33, #0b1216)",
        padding: "0",
      }}
    >
      {/* Phone frame */}
      <div
        className="relative flex flex-col overflow-hidden w-full sm:w-[420px] sm:my-6 sm:rounded-[44px]"
        style={{
          height: "100dvh",
          maxHeight: "900px",
          background: palette.bg,
          color: palette.text,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          border: `1px solid ${palette.border}`,
        }}
      >
        {inFlow ? (
          <div className="flex-1 min-h-0">
            {flow === "content" && (
              <LessonContent onExit={exitFlow} onDone={() => setFlow("quiz")} />
            )}
            {flow === "quiz" && (
              <QuizScreen
                hearts={stats.hearts}
                onLoseHeart={loseHeart}
                onExit={exitFlow}
                onComplete={(correct) => finishLesson(20 + correct * 10, 2)}
              />
            )}
            {flow === "story" && (
              <StoryLesson hearts={stats.hearts} onLoseHeart={loseHeart} onExit={exitFlow} onDone={() => finishLesson(30, 1)} />
            )}
            {flow === "interactive" && (
              <InteractiveLesson onExit={exitFlow} onDone={() => finishLesson(35, 3)} />
            )}
            {flow === "complete" && (
              <CompleteScreen
                bananas={reward.bananas}
                gems={reward.gems}
                onHome={exitFlow}
                onContinue={exitFlow}
              />
            )}
          </div>
        ) : (
          <>
            <TopBar stats={stats} />
            <div className="flex-1 min-h-0 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  {renderTab()}
                </motion.div>
              </AnimatePresence>
            </div>
            <BottomNav tab={tab} onChange={setTab} />
          </>
        )}
      </div>
    </div>
  );
}
