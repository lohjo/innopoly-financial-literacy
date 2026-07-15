---
title: "finfy-literacy — Phase 0: Planning"
type: planning
status: active
date: 2026-07-15
origin: docs/plans/origin.md
---

# finfy-literacy — Phase 0: Planning

## KPIs

One-liner: **finfy-literacy succeeds when newgrads keep coming back to build real financial habits, not just finish lessons.**

Measurable, impactful metrics:

- **D1 / D7 / D30 retention** — % of newgrads who complete at least one challenge on day 1, and who return on day 7 and day 30 after signup.
- **Streak survival rate** — % of users who maintain an active streak past 7 days and past 30 days; median streak length at 90 days.
- **Challenge completion turnover rate** — % of started challenges that are finished, broken out by module (budgeting, saving, investing, credit).
- **Leaderboard engagement rate** — % of active users who view or interact with a leaderboard at least once per week.
- **AI summary engagement rate** — % of users who open their post-challenge AI summary and act on its "next step" within 48 hours.
- **Cohort completion parity** — variance in completion rate within a peer leaderboard group, as a proxy for whether peer visibility is actually pulling people along versus just decorating the screen.
- **Time-to-first-challenge** — median minutes from account creation to first challenge completion (onboarding friction).
- **Self-reported behavior change** — % of users who report taking a real financial action (opened a savings account, set a budget, checked a credit report) attributable to a challenge.
- **Return rate after first-paycheck trigger** — % of users who signed up around a first-paycheck moment and are still active 60 days later.
- **Referral / invite rate** — % of users who invite at least one peer into their leaderboard group.

## User journey

1. A newgrad signs up right after their first paycheck lands and is dropped straight into a feed of short, gamified financial literacy challenges covering budgeting, saving, investing, and credit.
2. They pick a challenge, complete it in a few minutes, and immediately earn points that move them up a leaderboard shared with a real peer group — friends, cohort-mates, or coworkers.
3. Right after finishing, an AI summarizer hands back a short, strictly-formatted recap: what they did well, one thing to work on next, and where they stand.
4. Watching peers climb the leaderboard pulls them back the next day to protect their streak and close the gap with a friend, turning financial learning into a daily habit instead of a one-off resource.
5. Weeks of completed challenges accumulate into a visible track record of financial literacy progress the newgrad can point to, build on, and eventually extend into deeper, real-money decisions.

## Feature expansion

- **Challenges** — bite-sized, duolingo-style lessons and quizzes on budgeting, saving, investing, and credit management; sequenced so early wins build confidence before harder material.
- **Leaderboards** — real peer-group rankings (not anonymous global boards) that make progress socially visible and create light competitive pressure to keep going.
- **Progress tracking** — streaks, points, and a visible history of completed challenges that make the newgrad's improvement legible over time.
- **AI-generated summaries** — a strict-format recap after every challenge that turns raw performance into a specific, actionable takeaway instead of a vague "nice job."
- **Onboarding & account management** — a fast, low-friction signup that gets a newgrad into their first challenge within minutes of opening the app.

Full elaboration of each feature (overview, rationale, open questions, and rollout/A-B-testing plan) lives in `docs/plans/features/`.

## Tracking success

### MVP

**In-app feature:** the core loop — pick a challenge, complete it, see points move on a real-peer leaderboard, get a strict-format AI recap.

**Pain point eliminated:** existing financial literacy resources are dry, generic, and easy to abandon; newgrads have the motivation right after their first paycheck but no engaging way to act on it.

Questions to ask:
- What is the turnover rate of course completion?
- What percentage of newgrads complete their first challenge within 24 hours of signup?
- How many challenges does the median user complete before dropping off, and where does drop-off cluster?
- Does the presence of a real-peer leaderboard measurably change completion rate versus a solo control group?

### Custom courses

**In-app feature:** challenge tracks personalized to the newgrad's actual first-job context — industry, pay cadence, region-specific tax/benefits content — instead of one generic curriculum.

**Pain point eliminated:** generic financial advice doesn't match a newgrad's specific situation, so it feels irrelevant and gets skipped.

Questions to ask:
- Do people complete more courses when content feels relevant to their specific job or situation?
- If people learn relevant information, will they return for future learning?
- Does personalized content increase leaderboard engagement compared to generic content?
- Do newgrads on a customized track report higher confidence in their financial decisions than those on the generic track?

### Advanced financial learning

**In-app feature:** deeper elective modules (investing fundamentals, credit-building, tax optimization) unlocked after MVP mastery, with a path toward connecting learning to real financial products or services.

**Pain point eliminated:** newgrads plateau after the basics with nowhere to go deeper, and no bridge from "I learned this" to "I did this."

Questions to ask:
- Do people pay for financial services?
- Do they use what they learned in real-life scenarios, or revert to old habits?
- Is the content people are actually researching different enough from what we assumed they wanted that we can significantly improve our lessons?
- If people are paying, do they return to the platform more often?
