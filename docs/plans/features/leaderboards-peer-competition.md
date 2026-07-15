---
title: "Feature: Leaderboards and Peer Competition"
type: feature
status: planning
date: 2026-07-15
origin: docs/plans/origin.md
---

# Feature: Leaderboards and Peer Competition

## Overview

Leaderboards rank users by points earned from completed challenges within a real peer group — friends, a signup cohort, or coworkers — rather than an anonymous global ranking, so progress is visible against people the newgrad actually knows and is motivated to keep pace with. The leaderboard updates as challenges are completed and is a first-class surface in the app, not a buried settings-page stat.

## Why this?

Financial literacy content on its own has no built-in reason to pull a user back the next day; a real-peer leaderboard supplies that reason by turning individual progress into a light social competition, and because the comparison is against people the newgrad actually knows (not strangers), the pressure reads as motivating rather than anxiety-inducing the way a global ranking against thousands of strangers would.

## Open questions

- What defines a "real peer group" at signup — invited friends, a company/cohort code, or an opt-in matching flow — and what happens to a user who has no peers yet?
- Does leaderboard visibility need a privacy control (e.g., opt out of being ranked) given the sensitive nature of financial-progress-as-a-proxy-for-financial-standing?
- Should the leaderboard reset periodically (weekly/monthly) to keep it fair for late joiners, or stay cumulative?
- At what group size does peer pressure stop helping and start feeling discouraging (falling too far behind a large group)?

## Phase tracking (A/B testing)

Ship an MVP leaderboard scoped to invited-friend groups only, then A/B test cohort completion parity (Phase 0 KPI) between users with an active peer group versus a solo control to confirm the leaderboard itself — not just the challenges — drives retention; a follow-up test compares weekly-reset versus cumulative ranking on long-term engagement before locking the default.

| Stage | Description | Mocks |
|---|---|---|
| Friend-invite MVP | User invites friends at signup; leaderboard ranks only that group by points | TBD — see `docs/audit/fingo-references-png/` |
| Solo control A/B | Held-out cohort with challenges but no leaderboard, compared on retention/completion | TBD |
| Reset-cadence test | Weekly-reset ranking vs. cumulative ranking, compared on long-term engagement | TBD |
| Cohort/company codes | Join a leaderboard via an employer or program code instead of individual invites | TBD |
