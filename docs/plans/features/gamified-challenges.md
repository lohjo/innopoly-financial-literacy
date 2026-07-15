---
title: "Feature: Gamified Financial Literacy Challenges"
type: feature
status: planning
date: 2026-07-15
origin: docs/plans/origin.md
---

# Feature: Gamified Financial Literacy Challenges

## Overview

Gamified financial literacy challenges are the core content unit of finfy-literacy: short, duolingo-style lessons and quizzes covering budgeting, saving, investing, and credit management, each completable in a few minutes and structured to award points on completion. Challenges are sequenced into tracks so a newgrad starts with immediately-applicable material (how to read a payslip, set up a first budget) before progressing into more involved topics, and every challenge ends in a concrete, checkable action rather than passive reading.

## Why this?

Newgrads getting their first paycheck are at the single most motivated moment they will ever be for learning financial literacy, but the resources available to them today are dry, generic, and easy to abandon after one session; turning that content into short, game-like challenges with immediate feedback converts a one-off resource into a habit-forming loop, and because each challenge is small it lowers the activation energy needed to start versus a traditional course or article.

## Open questions

- What is the right challenge length (30 seconds vs. 2 minutes vs. 5 minutes) to maximize completion without feeling trivial?
- Should challenge difficulty adapt to a user's demonstrated performance, or stay on a fixed track for the MVP?
- How much real financial data (payslip, bank connection) should a challenge ever ask for, given the MVP's explicit no-institution-integration boundary?
- Where does new challenge content come from at scale — hand-authored, AI-generated and reviewed, or a hybrid — and what's the review bar before content ships?

## Phase tracking (A/B testing)

Ship a fixed-track MVP first (one linear sequence covering budgeting, saving, investing, and credit) to validate that the challenge format itself drives completion; then A/B test a personalized-track variant (per Custom Courses in Phase 0) against the fixed track on completion rate and D7 retention before deciding whether adaptive sequencing is worth the added complexity; a later phase tests challenge length variants (short vs. long) against the same completion metrics to tune the format itself.

| Stage | Description | Mocks |
|---|---|---|
| Fixed-track MVP | One linear sequence of budgeting/saving/investing/credit challenges, same for every user | TBD — see `docs/audit/fingo-references-png/` |
| Personalization A/B | Split traffic between fixed track and job/industry-personalized track, compare completion + retention | TBD |
| Adaptive difficulty | Challenge difficulty responds to a user's demonstrated accuracy within a track | TBD |
| Content scale-out | Hand-authored core track supplemented by reviewed AI-generated challenges | TBD |
