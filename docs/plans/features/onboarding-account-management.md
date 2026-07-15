---
title: "Feature: User Onboarding and Account Management"
type: feature
status: planning
date: 2026-07-15
origin: docs/plans/origin.md
---

# Feature: User Onboarding and Account Management

## Overview

Onboarding is the simple, low-friction signup flow that takes a newgrad from opening the app to completing their first challenge in a few minutes, capturing only the minimum account information needed to personalize the experience (name, and enough context to route them into a relevant challenge track) and deferring anything heavier. Account management covers the ongoing basics — profile, settings, progress history — needed to make the app feel owned rather than anonymous.

## Why this?

The moment a newgrad opens the app right after their first paycheck is a narrow window of motivation, and a heavy signup form (long questionnaires, mandatory bank linking, dense onboarding lessons) burns that window before the newgrad ever reaches the part of the product that hooks them; a fast, minimal onboarding gets them into the challenge-and-leaderboard loop while the motivation is still fresh, and account management exists so returning users have a stable, personal home rather than starting from scratch each session.

## Open questions

- What is the minimum viable signup — email/social login only, or does it need a lightweight profile step (job type, pay cadence) to seed personalization?
- How does the peer-group/leaderboard invite step fit into onboarding without adding friction before the first challenge?
- What account recovery and data-export basics are required even for an MVP, given the product handles financial-adjacent personal data?
- Does onboarding need a distinct "first paycheck" framing/moment, or should it work equally well for a newgrad who signs up weeks after their first paycheck?

## Phase tracking (A/B testing)

Ship the fastest possible MVP onboarding (single-screen signup straight into the first challenge) and measure time-to-first-challenge (Phase 0 KPI) as the primary signal; A/B test inserting a lightweight personalization step (job type/industry) before the first challenge against the bare-minimum flow to see whether the added friction is offset by better challenge relevance and later retention.

| Stage | Description | Mocks |
|---|---|---|
| Single-screen MVP | Email/social signup, straight into first challenge, no profile step | TBD — see `docs/audit/fingo-references-png/` |
| Personalization-step A/B | Adds one job/industry question before first challenge, compared on time-to-first-challenge + later relevance | TBD |
| Peer-invite integration | Leaderboard peer-group invite woven into onboarding vs. offered post-first-challenge | TBD |
| Account management basics | Profile, settings, progress history, data export/delete | TBD |
