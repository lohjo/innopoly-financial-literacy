---
title: "Feature: Mobile-First Design"
type: feature
status: planning
date: 2026-07-15
origin: docs/plans/origin.md
---

# Feature: Mobile-First Design

## Overview

Mobile-first design means finfy-literacy's challenge feed, leaderboard, and AI summary screens are designed and built for a phone-sized viewport first, with layout, tap targets, and session length all tuned for the way a newgrad actually uses the app — short sessions, one-handed, often between other tasks — rather than adapted down from a desktop-first design.

## Why this?

Newgrads are overwhelmingly likely to reach for their phone, not a laptop, when they have a few free minutes to knock out a challenge; a mobile-first product matches that real usage pattern, and because challenges are already designed to be short, a mobile-first layout reinforces the same "quick session" product logic instead of fighting it with desktop-scaled text, dense layouts, or interactions that assume a mouse and a large screen.

## Open questions

- Native app, mobile web, or a responsive web app that's mobile-first but also usable on desktop — which does the MVP target?
- What is the minimum session length the core loop (pick challenge → complete → see summary → check leaderboard) needs to fit into on a phone?
- Do push notifications belong in the MVP for streak-risk nudges, or is that a follow-up once the core loop is validated?
- How does the leaderboard scale visually on a small screen once peer groups grow beyond a handful of people?

## Phase tracking (A/B testing)

Ship the MVP as a mobile-first responsive web app to validate the product loop fastest, then A/B test session-length variants (challenge card density, single-question vs. multi-question challenges) against completion rate on mobile before deciding whether a native app is warranted; a later phase tests push-notification streak reminders against a no-notification control on D7/D30 retention.

| Stage | Description | Mocks |
|---|---|---|
| Mobile-first responsive web MVP | Phone-tuned layout for challenge feed, leaderboard, and summary screens | TBD — see `docs/audit/fingo-references-png/` |
| Session-density A/B | Card density / question-count variants compared on mobile completion rate | TBD |
| Push-notification test | Streak-risk push reminders vs. no-notification control, compared on D7/D30 | TBD |
| Native app evaluation | Decision point on native (iOS/Android) build once web MVP validates the loop | TBD |
