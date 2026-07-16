---
title: "feat: first-paycheck financial onboarding market gap"
type: feat
status: planning
date: 2026-07-16
origin: prompt_003 inline shift brief
---

# feat: first-paycheck financial onboarding market gap

> **Target repo:** this repo (`innopoly-financial-literacy`). App code lives under `src/` (frontend scaffold only); backend/database/agent paths (`src/db/`, `src/agents/`, `src/server/`, `src/routes/`, `api/`) contain drafts or placeholders, not implemented functionality.
>
> **Plan relationship:** this document's scope contract is the inline market-gap brief supplied with prompt_003 (the `<shift>` brief), not a `docs/brainstorms/` file. It proposes a **product-positioning reframe** — from generic "gamified financial literacy" to **first-paycheck financial onboarding for new graduates**. Existing documents, including `docs/plans/origin.md` and `docs/plans/finfy-literacy-architecture-plan.md`, remain unchanged by this task. Later work must reconcile those documents with this reframe before any implementation plan is treated as current. This document does not imply that a backend exists; the current repository contains frontend code plus backend/database/agent drafts only.

## Summary

This planning document reframes finfy-literacy's wedge from broad gamified financial education to a single high-leverage moment: the first paycheck. The target user is a new graduate transitioning from student to salaried adult, and the product's job is to answer "I just got my first salary — what should I actually do tonight / this week?" through short, behavior-oriented challenges, small-group peer accountability, and structured AI feedback. The deliverable of this task is documentation only (this file and the repository `CLAUDE.md`); no code, schema, or backend behavior is created or implied. The central positioning ("the Duolingo for your first paycheck") is a **product hypothesis** that must be validated before it is treated as proven.

---

## Problem Frame

**Whose problem:** new graduates receiving their first salary, who want to make responsible early financial decisions but face resources that are long-form, passive, product-centric, or aimed at people who already have savings and habits.

**User-supplied market claim (from the shift brief):** the "financial literacy" category is crowded (education sites, budgeting apps, banking apps, investing apps, influencers, corporate wellness), yet none of these is explicitly designed around "I just got my first salary — what should I do this week?" The brief's competitor table (Investopedia/NGPF, YNAB/Monarch/PocketGuard, DBS/OCBC/UOB/Revolut, Syfe/Endowus/StashAway, influencer content, workplace seminars) is supplied analysis, not independently verified competitive research.

**Why now (product hypothesis):** the first paycheck is claimed to be a "teachable moment" with unusually high receptiveness — finance stops being theoretical the day money arrives. Supporting citations exist in the brief (see Context & Research) but are **evidence requiring verification**, not established facts.

**Relationship to the existing product frame:** `docs/plans/origin.md` already targets "newgrads getting their first paycheck," so this reframe sharpens rather than contradicts the existing target user. What changes is the primary framing: from a course-library-like challenge catalog toward timing-driven financial *onboarding* — the sequence of actions in the first months of salaried life.

---

## Requirements

The supplied shift brief has no requirement IDs, so market-gap requirements are derived here as `MR-n`. Each requirement is a product/experience requirement traceable to a specific gap or direction in the brief. None prescribes backend implementation. **Constraint on all MRs:** the product must not give personalized financial advice, must not integrate with banks or brokerages, and must not present itself as a financial planner.

- **MR-1 — First-paycheck timing is the primary wedge.** The product experience must be organized around the moment of receiving the first paycheck (e.g. "what to do tonight / this week / this month"), not around a topic catalog. *Traceable to:* brief's core framing and Gap 7 ("I received $3,700 today — what should I actually do tonight?") and Gap 10 (teachable moment). *Status:* direction already established in `origin.md` (first-paycheck newgrads); the timing-first experience design is **must validate**.

- **MR-2 — Target life stage is the student-to-salaried-adult transition.** Content and onboarding must address the "financial onboarding" question set of the first ~6 months of working life (saving rate, emergency fund, credit, insurance, CPF, lifestyle inflation), scoped to the user's life stage rather than general finance. *Traceable to:* Gap 1. *Status:* target user already established; the transition-sequence content model is **must validate**. The CPF item implies a Singapore-market assumption — see Open Questions.

- **MR-3 — Action-oriented micro-learning, not long-form education.** Each unit of the product must be a short, decision-connected challenge ("do/decide this"), not a video, article, module, or course. *Traceable to:* Gap 2 and Gap 9. *Status:* gamified-challenge direction already established in existing feature specs (`docs/plans/features/gamified-challenges.md`); the action-orientation (tied to a real, current decision) is **must validate**.

- **MR-4 — 3–5 minute session model (hypothesis).** A session should be completable in roughly 3–5 minutes. This is a **product hypothesis**, not a validated fact — the brief asserts fit with Gen-Z micro-learning patterns but supplies no session-length research specific to this product. *Traceable to:* Gap 2 ("Spend 3 minutes") and Gap 9. *Status:* **must validate** (target duration, completion rates, and whether 3–5 minutes is enough for a meaningful financial action).

- **MR-5 — Return motivation and habit formation.** The product must be designed for "learn → return tomorrow," with a repeatable loop (challenge → immediate score → peer ranking → next challenge) rather than "lesson → quiz → certificate → done." *Traceable to:* Gap 3. *Status:* loop shape already established in existing plans; its effectiveness for retention is **must validate**. The brief itself notes (user-supplied claim citing gamification literature) that poorly designed gamification can encourage superficial engagement — disconfirmation criteria belong in validation.

- **MR-6 — Small-group peer accountability.** Leaderboards and competition must run within real, small peer groups (friend groups, graduate cohorts, internship cohorts, university cohorts, company intakes), not anonymous global pools. *Traceable to:* Gap 4 ("a leaderboard among 12 friends is psychologically very different from one among 500,000 strangers" — user-supplied claim). *Status:* peer-leaderboard direction already established (`docs/plans/features/leaderboards-peer-competition.md`); small-real-group superiority is **must validate**.

- **MR-7 — Structured, concise AI feedback.** Post-challenge AI output must follow a fixed, constrained format (challenge, score, what you did well, one improvement, one next action, leaderboard position) and must not free-form ramble. *Traceable to:* Gap 5. *Status:* strict-format AI summary already established (`docs/plans/features/ai-generated-summaries.md`); the specific six-part recap shape is a **product hypothesis** to validate. The "one next action" must remain educational/behavioral, never personalized financial advice (see constraint above).

- **MR-8 — Reward learning, not financial-product usage.** Points, streaks, and rewards must be tied to demonstrated understanding and sound trade-off recognition (budgeting correctly, appropriate savings allocations, understanding credit) — never to deposits, transactions, investing volume, or any financial-product action. *Traceable to:* Gap 8, including its user-supplied warning (citing SSRN literature, verification pending) that product-tied gamification can create overconfidence and excess risk-taking. *Status:* **already established as a design principle** by this document; the incentive design details are **must validate**.

- **MR-9 — Pre-budgeting-layer positioning.** The product positions *before* budgeting apps in the user journey: it builds the goals, categories, and habits that budgeting apps assume users already have ("Duolingo before essays; Notion before project management"). It does not compete with YNAB-class tools on tracking. *Traceable to:* Gap 6. *Status:* **product hypothesis, must validate** — including whether users graduate from finfy to a budgeting tool and whether that hand-off is a feature or a churn risk.

- **MR-10 — Validate the market gap before treating the positioning as proven.** Before any implementation plan adopts "the Duolingo for your first paycheck" as established positioning, the team must run explicit validation: verify the brief's citations, test the first-paycheck wedge with real new graduates, and confirm the competitor-gap table against current competitor capabilities. Until then, all of Gaps 1–10 are **user-supplied market claims or product hypotheses**. *Traceable to:* the entire brief (which is analysis, not user research). *Status:* **must validate** by definition.

**Actors:** new graduate (primary user); peer group members (cohort/friends); AI recap generator (product component, draft only); product team (validation owner).

**Acceptance examples:**

- **Happy path:** A new graduate receives their first salary this week, opens the app, and is offered a first-paycheck-timed challenge (e.g. allocating a hypothetical paycheck across save/spend/emergency-fund buckets). They complete it in under 5 minutes, receive an immediate score, see their rank among their ~12-person peer group, and get a six-part structured recap ending in one concrete educational next action. They return the next day for the follow-up challenge. (Exercises MR-1 through MR-7.)
- **Edge case:** A user joins with no peer group (no cohort code, no friends on the app). The experience must still work solo — challenges, scores, and recaps function without a leaderboard, and the product invites (but does not require) forming or joining a group. Rewards still accrue from learning only (MR-8), and no financial-product action is ever prompted.
- **Failure / disconfirmation case:** Validation (MR-10) finds that first-paycheck timing does not outperform generic onboarding — e.g. test users engage no more when challenges are paycheck-timed, or the cited "teachable moment" evidence does not hold up on verification. In that case the reframe is rejected or revised: this document's status moves out of `planning`, and existing plans (`origin.md`, architecture plan) are *not* rewritten around the unproven wedge. A disconfirmed hypothesis must be recorded, not silently dropped.

---

## Scope Boundaries

- **No personalized financial advice.** The product educates about categories of action; it never tells a specific user what to do with their specific money.
- **No bank, brokerage, CPF, or payroll integration.** No account linking, no transaction reading, no execution of financial actions.
- **No claim of being a financial planner** or any regulated advisory service, in product copy or positioning.
- **No backend implementation is proposed by this document.** `src/db/`, `src/agents/`, `src/server/`, `src/routes/`, and `api/` remain drafts/placeholders; this plan creates documentation only.
- **No rewrite of existing plans.** `docs/plans/origin.md`, `docs/plans/finfy-literacy-architecture-plan.md`, `docs/plans/finfy-literacy.md`, and the feature specs are intentionally left untouched.
- **No invented market data.** Numbers such as "$3,700" and "12 friends vs 500,000 strangers" are illustrative figures from the supplied brief, not research findings.

### Deferred to Follow-Up Work

- Reconciliation pass: align `origin.md`, the architecture plan, and the five feature specs with this reframe (or record its rejection) before any implementation unit is scheduled.
- Validation study design for MR-10 (method, sample, disconfirmation thresholds).
- Market-scoping decision (Singapore-first vs. broader; the CPF mention implies Singapore).
- Update or supersede the stale `docs/plans/CURRENT_STATE.md` (out of scope here; this task modifies no existing file).

---

## Context & Research

### Relevant Code and Patterns

- `src/app/App.tsx`, `src/components/` — the existing frontend scaffold already implements a Duolingo-style tab/lesson/quiz/leaderboard flow, which is compatible with (but not evidence for) this reframe.
- `docs/plans/origin.md` — already names first-paycheck newgrads as the target user; this document sharpens the wedge rather than introducing a new audience.
- `docs/plans/features/*.md` — the five MVP feature specs (gamified challenges, leaderboards, AI summaries, onboarding, mobile-first) map cleanly onto MR-3, MR-6, MR-7.
- `docs/plans/CURRENT_STATE.md` — **stale**: it describes `src/` as empty and docs as untracked; the filesystem shows a committed frontend scaffold and a clean git status. Verified filesystem state is authoritative.
- `src/db/`, `src/agents/`, `api/index.ts`, `scripts/ablate.ts` — drafts or prior-product leftovers; nothing in this document depends on them.

### Institutional Learnings

- `docs/brainstorms/2026-07-20-finfy-literacy-loop-premise-check.md` questions whether the five-agent summariser pipeline is over-built for MVP — relevant to MR-7's "concise, constrained" requirement.
- The repository's own history (prior-product leftovers in `src/db/` and `scripts/`) is a standing reminder to label draft material explicitly, which this document does.

### External References

All of the following are **evidence requiring verification** — they were supplied with the brief and have not been independently checked; verification is pending for each. Tracking parameters have been removed.

- **User-supplied market claim (timeliness of financial education):** financial education is most effective when timely and connected to decisions being made. Source: https://doi.org/10.1080/00220485.2026.2695905 (Next Gen Personal Finance program effectiveness). Verification pending.
- **User-supplied market claim (gamification efficacy and risks):** points, leaderboards, and immediate feedback generally improve engagement and can improve financial literacy; poorly designed systems can encourage superficial engagement or risky behavior. Source: https://www.sciencedirect.com/science/article/abs/pii/S2214635026000420 (systematic review, gamification in finance). Verification pending.
- **User-supplied market claim (gamification tied to financial products):** gamification tied directly to financial products can create overconfidence or encourage excessive risk-taking. Source: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6528739 (play-to-learn FinTech apps, Gen Z, India). Verification pending.
- **User-supplied market claim (game-based learning outcomes):** game-based financial education improves knowledge and satisfaction versus traditional approaches. Source: https://www.sciencedirect.com/science/article/abs/pii/S1875952124002647 (game-based financial literacy for Gen Z). Verification pending.
- **User-supplied market claim (teachable moment):** people are naturally receptive to guidance at moments like first payroll receipt. Source: https://www.nber.org/papers/w28249 (learning to navigate a new financial technology — payroll accounts). Verification pending.

**Research questions** (open, feeding MR-10 validation):

- Does first-paycheck timing measurably increase engagement or behavior change versus untimed delivery of the same content?
- Is 3–5 minutes sufficient for a challenge that changes an actual decision, or only for knowledge checks?
- Do small real-peer leaderboards outperform solo or anonymous modes for this audience, and at what group size?
- Does the competitor-gap table hold against competitors' *current* capabilities (banking apps in particular ship education features frequently)?
- What fraction of target users can even be reached in their first-paycheck week, and through which channel?

---

## Key Technical Decisions

Mostly not applicable at this planning stage — this is a positioning/requirements document and deliberately makes no implementation decisions (stack, schema, agent pipeline, or API shape). Two documentation-level decisions are locked here:

1. **Documentation-only scope.** This task produces exactly two files (`CLAUDE.md` and this document) and modifies nothing else, so the reframe can be evaluated without disturbing existing plans. Affects MR-10.
2. **Hypothesis labeling discipline.** Every market claim in this document carries one of the labels *User-supplied market claim*, *Evidence requiring verification*, *Product hypothesis*, or *Research question*; future edits must preserve this labeling until verification lands. Affects all MRs.

---

## Open Questions

### Resolved During Planning

- Whether this reframe contradicts `origin.md`: it does not — the target user is unchanged; the wedge framing sharpens from "gamified challenges" to "paycheck-timed onboarding."
- Whether backend drafts constrain this plan: they do not — all are unwired drafts; nothing here depends on them.

### Deferred to Implementation (or later planning)

- **Market scope:** is the first market Singapore (CPF, DBS/OCBC/UOB references suggest it)? Could not be inferred definitively from the repository.
- **Cohort mechanics:** how peer groups form (invite codes, university/employer partnerships) and minimum viable group size.
- **Validation method for MR-10:** interviews vs. landing-page test vs. prototype study, and who owns it.
- **Naming:** repository says `innopoly-financial-literacy`, docs say `finfy-literacy`, brief says "Finfy" — canonical product name unresolved.
- **Session-length instrumentation:** how the 3–5 minute hypothesis (MR-4) will be measured once a build exists.
- **Hand-off posture (MR-9):** whether "graduating" users to budgeting apps is embraced (partnerships) or treated as churn.

---

## Output Structure

This task creates documentation only. No application, backend, or data files are created by this plan.

```
.
├── CLAUDE.md                                            # repo instructions for coding agents (created by this task)
└── docs/
    └── plans/
        └── 2026-07-16-001-market-gap-requirements.md    # this document (created by this task)
```

The tree is a scope declaration, not a constraint. All other paths shown elsewhere in this document (`src/`, `api/`, etc.) already exist and are untouched.

---

## High-Level Technical Design

Not applicable at this planning stage. This document defines market positioning and product/experience requirements only; producing a technical design now would require inventing backend architecture that does not exist (the repository's backend/database/agent paths are unwired drafts). A high-level design belongs to the follow-up reconciliation and implementation plans, after MR-10 validation determines whether the first-paycheck positioning survives.

The only design-shaped artifact worth stating is the proposed experience loop, carried verbatim from the shift brief as a **product hypothesis**:

```
Challenge → Immediate score → Peer ranking → Structured AI recap → Next challenge → Repeat
```
