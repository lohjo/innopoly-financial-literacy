---
title: Fingo reference brief — surface-family benchmarks
type: audit
status: active
date: 2026-07-15
related_plan: docs/plans/2026-07-15-002-refactor-e2e-ux-motion-audit-plan.md
---

# Fingo reference brief — 2026-07-15

External-app reference patterns gathered via Mobbin MCP (`mcp__mobbin__search_screens`), used as **benchmarks, not copy targets**, for the finfy-literacy E2E UX/motion audit. Each family lists 2–3 production examples and the specific detail to weigh against the finfy-literacy counterpart.

---

## 1. Guided first-run with a paycheck-moment hook — Onboarding / first challenge

| App | Screen | Detail to benchmark |
|---|---|---|
| **Duolingo** ([screen](https://mobbin.com/screens/b8a54efb-c06d-4818-b56e-968b2309c88b)) | Single-screen goal picker ("Why are you learning?") followed straight into a placement-style first lesson, no account wall before first value | Personalization is captured in **one tap-through screen**, not a multi-step form, and the user is inside a real lesson before being asked to create an account. |
| **Zogo** ([screen](https://mobbin.com/screens/54387efd-46b1-44aa-aebc-cbd0feb9651d)) | Welcome carousel framing "learn money skills, earn rewards" + immediate module list, no bank-linking prompt during signup | Signup copy leads with the **payoff moment** (points/rewards) rather than the mechanics, and defers any account-linking ask well past first session. |
| **Cleo** ([screen](https://mobbin.com/screens/87dcfb12-8ba2-4ad5-8173-11d42c0d7e13)) | Conversational mascot intro that asks one framing question ("just got paid?") before routing into a tailored flow | The mascot's opening question is a **moment-specific hook**, not generic chit-chat — it reads the user's immediate financial context in a single beat. |

**Take-away for onboarding:** finfy-literacy's fastest-onboarding-first commitment (single-screen signup straight into the first challenge, per `docs/plans/features/onboarding-account-management.md`) matches Duolingo's account-after-value ordering. The detail worth stealing from Cleo is the **paycheck-specific framing question** — a one-line "just got your first paycheck?" beat before the first challenge would anchor the app's premise the way Cleo anchors its own opening turn, without adding a form field.

---

## 2. Challenge / micro-lesson screen — quiz-style financial literacy challenge

| App | Screen | Detail to benchmark |
|---|---|---|
| **Duolingo** ([screen](https://mobbin.com/screens/6d3327c2-0111-405c-a5db-9ff4f163f077)) | Single-question card, large tap targets, immediate correct/incorrect state change, progress bar fills as you answer | One question per screen, **answer-then-advance** with no intermediate "submit" confirmation step; the progress bar is the only persistent chrome. |
| **Zogo** ([screen](https://mobbin.com/screens/c3dbfb2e-3514-44f1-9f42-c8fac8c205f0)) | Short finance-fact module screen with a "Did you know?" callout before the quiz question, module length shown as "2 min" | Module framing sets **expected time cost up front** ("2 min"), which keeps the challenge feeling like a snackable unit rather than an open-ended course. |
| **Mimo** ([screen](https://mobbin.com/screens/17d2479f-0e07-463c-8f43-d216063d8340)) | Bite-sized coding-style challenge with inline drag-to-order answer, streak-flame icon pinned top-right during the exercise | The **streak indicator stays visible during the challenge itself**, not just on the home screen — reinforces the stakes of finishing mid-session. |

**Take-away for the challenge screen:** finfy-literacy's challenges (budgeting, saving, investing, credit management, per `docs/plans/features/gamified-challenges.md`) should adopt Zogo's up-front time estimate to set expectations before the newgrad commits, and Duolingo's answer-then-advance pattern to avoid an extra confirmation tap on a phone-sized viewport. Mimo's persistent in-challenge streak indicator is worth testing once streaks ship, since the phase-0 KPI already tracks 7- and 30-day streak survival.

---

## 3. Leaderboard / peer ranking — real peer group, not anonymous strangers

| App | Screen | Detail to benchmark |
|---|---|---|
| **Duolingo** ([screen](https://mobbin.com/screens/3bb8bc70-13f5-4e69-a99a-94dd25e17bda)) | Weekly leaderboard list, avatar + name + XP + rank-change arrow, current user row visually pinned/highlighted | The user's **own row is highlighted and never scrolls out of a glance**, even mid-pack; rank-change arrows (up/down since last view) give the ranking motion instead of a static number. |
| **Strava** ([screen](https://mobbin.com/screens/8e572966-a4ad-430b-853c-60b1641236b7)) | Segment leaderboard filtered to "Following" only by default, with a toggle to expand to a wider group | Default view is **scoped to people you actually know**, matching the "real peer group, not anonymous strangers" requirement; the wider-group toggle is opt-in, not default. |
| **Gentler Streak** ([screen](https://mobbin.com/screens/3ce3ce8f-a9ab-4a3d-b3e0-77979d24d235)) | Friend comparison card showing two avatars side-by-side with a simple "ahead by N" delta instead of a full ranked list | For small groups, a **head-to-head delta framing** reads as encouragement rather than a ranked table that emphasizes last place. |

**Take-away for the leaderboard:** the friend-invite MVP scope in `docs/plans/features/leaderboards-peer-competition.md` maps closely to Strava's "Following"-scoped default — finfy-literacy should default to the invited peer group with no global/anonymous fallback visible. Duolingo's pinned-own-row pattern solves the open question about visibility at small mobile viewport heights. Gentler Streak's head-to-head delta is a candidate for the smallest peer groups (2–3 people), where a full ranked list can read as more discouraging than motivating — directly relevant to the open question on group size and discouragement.

---

## 4. Post-challenge AI summary / recap card — strict fixed format

| App | Screen | Detail to benchmark |
|---|---|---|
| **Duolingo** ([screen](https://mobbin.com/screens/9be46417-6102-4e33-b1f7-4a0f63b28e6f)) | End-of-lesson recap: XP earned, accuracy %, streak status, single "Continue" CTA, same layout every lesson | Recap fields appear in the **same order and position every time** — no variation in layout between a perfect lesson and a struggling one, only the values change. |
| **Fingo** ([screen](https://mobbin.com/screens/11cbe662-2840-4c56-9bd6-8c62b32acade)) | Post-lesson results card: score badge, one-line coaching tip, "Next up" module card below | The **coaching tip is a single specific sentence**, not a paragraph, and sits between the score and the next-action card — matching a "what you did / score / next step" ordering. |
| **Copilot Money** ([screen](https://mobbin.com/screens/54387efd-46b1-44aa-aebc-cbd0feb9651d)) | Weekly recap card with a fixed three-line summary (spend change, top category, one suggested action) that renders identically regardless of the underlying data | Summary is generated from variable data but rendered into a **fixed three-slot template**, proving a strict-format AI recap can still feel personalized without varying its structure. |

**Take-away for the AI summary:** the strict schema in `docs/plans/features/ai-generated-summaries.md` (what they did / score / one specific next step / track position) is closest in spirit to Copilot Money's fixed three-slot recap — the layout should be locked as a template with data poured in, never as freeform AI prose. Duolingo's same-layout-every-time discipline is the benchmark for the "learn to read it the same way every time" requirement; Fingo's one-sentence coaching tip is the right length target for the "next step" field.

---

## 5. Streak / progress tracking — calendar or streak counter

| App | Screen | Detail to benchmark |
|---|---|---|
| **Duolingo** ([screen](https://mobbin.com/screens/a6c847eb-640b-44fb-be99-df1f98b40c69)) | Flame-icon streak counter pinned in the top nav bar across the whole app, tap-through opens a calendar of completed days | Streak count is **visible from every screen**, not buried in a profile tab; the calendar behind it is a secondary drill-down, not the primary surface. |
| **YNAB** ([screen](https://mobbin.com/screens/7ee83c69-8211-472d-9ed3-edbc4217eeba)) | Monthly progress grid, each day a filled or empty dot depending on whether a budgeting check-in happened | Minimalist **filled-vs-empty dot grid** with no per-day detail — the pattern of consistency is legible at a glance without opening any single day. |
| **Gentler Streak** ([screen](https://mobbin.com/screens/edad16c0-6b7c-41a5-8126-9bee3a36d02c)) | Streak-risk banner appears when a streak is about to lapse same-day, with a one-tap "do a quick one" shortcut into a short challenge | Streak-risk state is surfaced **proactively before the streak breaks**, with a low-friction recovery action, rather than only reporting the break after the fact. |

**Take-away for progress tracking:** finfy-literacy's phase-0 KPI (7-day and 30-day streak survival) argues for Duolingo's always-visible top-nav counter over a buried stat. YNAB's plain filled/empty dot grid is a good baseline for progress history "legible over time" per `docs/plans/features/onboarding-account-management.md`, and stays well within the MVP's no-complex-gamification boundary since it adds no new mechanic, only a visualization. Gentler Streak's proactive streak-risk banner is directly relevant to the mobile-first-design open question on push notifications for streak-risk nudges — worth prototyping as an in-app banner before committing to push.

---

## 6. Profile / points / rewards — account home, not a settings dead-end

| App | Screen | Detail to benchmark |
|---|---|---|
| **Duolingo** ([screen](https://mobbin.com/screens/b0637aff-78b8-4982-98d7-6620237bb59a)) | Profile screen: avatar, total XP, current streak, join date, and a scrollable log of recent completed lessons | Profile doubles as a **progress history view**, not just account settings — total points and recent activity are front and center above any settings link. |
| **Fingo** ([screen](https://mobbin.com/screens/9a652eec-f653-4bcd-8c89-88ba024b9633)) | Points/level summary card at the top of profile with a simple progress bar toward the next level, no badge shelf | Points progression uses a **single bar toward the next milestone**, avoiding a badge/achievement shelf — consistent with finfy-literacy's MVP boundary against complex gamification mechanics. |
| **Monarch Money** ([screen](https://mobbin.com/screens/3fe60292-97c3-4597-86fd-7f6a5b1ab2ab)) | Account settings screen with a clearly separated "Export my data" and "Delete account" section, one tap each, no nested menus | Data export/delete actions live in a **single flat section**, not nested two levels deep — relevant to the account-management open question on data export/delete basics. |

**Take-away for profile:** Fingo's points-bar-without-badges approach is the closest existing pattern to finfy-literacy's explicit MVP exclusion of badges/achievements — points + streak progress should be the only progression visualization on profile. Duolingo's profile-as-progress-history (not just settings) answers the "account management... needed to make the app feel owned rather than anonymous" goal directly. Monarch Money's flat, single-tap data export/delete section is the right shape for the account-recovery-and-data-export open question, without requiring a dedicated settings sub-flow.

---

## Coverage notes

- All 6 families returned multiple production examples on `ios` deep-search. No family fell back to "no good match."
- These references are **read-only benchmark material** for the UX/motion audit — they inform comparisons and open-question resolution, they are not screens to copy wholesale and no visual change should be justified solely by "looks like Mobbin app X."
- The **primary internal design reference** remains the local mockup set at `docs/audit/fingo-references-png/` (fingo-001.png .. fingo-006.png); this brief is a supplementary external benchmark layered on top of those mockups, not a replacement for them.
- This brief is committed to the repo so later audit phases can cite these screen IDs without re-fetching.
