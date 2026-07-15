---
title: "Feature: AI-Generated Summaries (Strict Format)"
type: feature
status: planning
date: 2026-07-15
origin: docs/plans/origin.md
---

# Feature: AI-Generated Summaries (Strict Format)

## Overview

After every completed challenge, an AI summarizer produces a short recap in a fixed, strict format — what the user did, how they scored, one specific thing to work on next, and where they stand relative to their track — rather than a free-form or conversational response. The strict format is a product commitment, not an implementation detail: the summary must be scannable in a few seconds and consistent enough that a user learns to read it the same way every time.

## Why this?

A points total alone doesn't tell a newgrad what to do differently; a strict-format AI summary turns raw challenge performance into a specific, actionable takeaway every single time, and holding the format fixed (rather than letting the AI write however it wants) is what makes the recap feel trustworthy and fast to parse instead of like a chatbot improvising a new response each time — the same design reasoning that makes a duolingo-style recap screen legible on the first read.

## Open questions

- What is the exact strict-format schema (fields, order, length caps) and who owns changing it once it ships?
- Should the summary ever reference leaderboard standing directly, or stay scoped to the individual's own performance to avoid discouraging framing?
- What is the failure mode when the AI can't produce a confident "next step" (e.g., a perfect score) — a generic congratulatory fallback, or a different next-challenge suggestion?
- Does the summary need a disclaimer boundary given it touches financial topics, even though the MVP is explicitly not offering financial advice?

## Phase tracking (A/B testing)

Ship the strict-format summary as a fixed template first and validate the AI summary engagement rate (Phase 0 KPI) against a control group that sees only a points/score screen with no generated recap; once the format is validated, test variants of the "next step" framing (peer-relative vs. self-relative) to see which drives higher follow-through within 48 hours.

| Stage | Description | Mocks |
|---|---|---|
| Fixed-template MVP | Strict-format recap: what you did / score / one next step / track position | TBD — see `docs/audit/fingo-references-png/` |
| No-summary control A/B | Held-out cohort sees score only, no generated recap, compared on return rate | TBD |
| Next-step framing test | Peer-relative phrasing vs. self-relative phrasing, compared on 48h follow-through | TBD |
| Format schema v2 | Extended fields (e.g., streak-risk warning) once base format is validated | TBD |
