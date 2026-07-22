import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppShell } from "./AppShell";
import { useStore } from "../stores/store";

const CoursePlayer = lazy(() =>
  import("../features/learning-episode/CoursePlayer").then((m) => ({ default: m.CoursePlayer })),
);
const VideoCoach = lazy(() => import("../features/video-coach/VideoCoach").then((m) => ({ default: m.VideoCoach })));
const Onboarding = lazy(() => import("../features/onboarding/Onboarding").then((m) => ({ default: m.Onboarding })));

import { Home } from "../features/today/Home";
import { Leaderboard } from "../features/leaderboard/Leaderboard";
import { Journey } from "../features/mastery/Journey";
import { Practice } from "../features/mastery/Practice";
import { You } from "../features/you/You";
import { Progress } from "../features/you/Progress";
import { Achievements } from "../features/you/Achievements";
import { Settings } from "../features/you/Settings";
import { Activity } from "../features/you/Activity";

function Landing() {
  const hasProfile = useStore((s) => s.profile !== null);
  return <Navigate to={hasProfile ? "/today" : "/onboarding"} replace />;
}

function FullScreenFallback() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: "100dvh" }}>
      <div
        className="rounded-full animate-pulse"
        style={{ width: 40, height: 40, border: "3px solid var(--brand-soft)", borderTopColor: "var(--brand)" }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/onboarding"
          element={
            <Suspense fallback={<FullScreenFallback />}>
              <Onboarding />
            </Suspense>
          }
        />
        <Route element={<AppShell />}>
          <Route path="/today" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/you" element={<You />} />
          <Route path="/you/progress" element={<Progress />} />
          <Route path="/you/achievements" element={<Achievements />} />
          <Route path="/you/settings" element={<Settings />} />
          <Route path="/you/activity" element={<Activity />} />
        </Route>
        <Route
          path="/learn/:lessonId"
          element={
            <Suspense fallback={<FullScreenFallback />}>
              <CoursePlayer />
            </Suspense>
          }
        />
        <Route
          path="/review/:conceptId"
          element={
            <Suspense fallback={<FullScreenFallback />}>
              <CoursePlayer review />
            </Suspense>
          }
        />
        <Route
          path="/call/:scenarioId"
          element={
            <Suspense fallback={<FullScreenFallback />}>
              <VideoCoach />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}