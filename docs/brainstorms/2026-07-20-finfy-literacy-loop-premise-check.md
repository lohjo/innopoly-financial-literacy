---
date: 2026-07-20
topic: finfy-literacy-loop-premise-check
---

# finfy-literacy — Loop Premise Check: Single-Shot vs. Multi-Agent Summarizer

## Summary

This is a premise check on `docs/plans/finfy-literacy-architecture-plan.md`'s five-role agent pipeline (Sequencer, Scorekeeper, Recap Writer, Standings Framer, Compliance Guardrail): does finfy-literacy's core loop — challenge → points → leaderboard → strict-format AI summary — actually need that many chained LLM roles, or does a single-shot LLM call against a strict output schema, backed by deterministic grading and a deterministic rule-check, clear the hackathon MVP bar just as well? The user-facing payload is small and fixed: a four-field recap (what you did / score / next step / track position) plus a pass/fail compliance decision. A per-role, evidence-based ablation comparing a single-shot summarizer candidate against the architecture plan's multi-agent candidate — run over a fixed sample of scored challenge attempts before the MVP implementation plan locks the pipeline shape — is the falsifiable validation gate proposed here.

---

## Problem Frame

`docs/plans/finfy-literacy-architecture-plan.md` already specifies a five-agent pipeline for the challenge-to-recap loop: Sequencer picks the next challenge, Scorekeeper grades the attempt, Recap Writer drafts the strict four-field summary, Standings Framer drafts the track-position line, and Compliance Guardrail checks the combined draft before display (see that doc's "Agent Architecture" section). That is a fully specified design, not a placeholder — but it was never tested against the question the product's own scope boundary implies: `docs/plans/origin.md` explicitly excludes "advanced analytics and reporting" and "complex gamification mechanics" from the MVP on the grounds of keeping the build simple, and the Phase 0 doc (`docs/plans/finfy-literacy-phase-0-planning.md`) frames the MVP as validating the core loop itself before anything else. Five chained agent calls to produce one small, fixed JSON object is exactly the kind of complexity that scope boundary would normally screen out if it weren't dressed up as "the architecture."

Not every role in that pipeline obviously needs to be an LLM call, let alone a separate one. Sequencer's job — pick the next challenge from track position and elapsed time — is queue logic. Scorekeeper's job — grade an attempt against an answer key, compute points, identify missed concepts — is deterministic scoring logic for the MVP's quiz and budgeting-exercise challenge types (`docs/plans/features/gamified-challenges.md`). Standings Framer's job is mostly arithmetic (rank, point gap) with a templated framing choice layered on top. Only Recap Writer's job — turning structured signals into readable prose within a fixed schema — is inherently a natural-language generation task, and Compliance Guardrail's advice-language and tone checks are the only other role that plausibly benefits from an LLM's judgment rather than a fixed rule set.

That asymmetry is the actual premise worth testing: not "multi-agent vs. single call" as a binary, but which of the five architecture-plan roles need to be LLM calls at all, and among those that do, whether they need to be separate calls with separate context windows (the architecture plan's design) or can be collapsed into one call that receives all the structured inputs at once and returns the full strict-format object plus a compliance self-check, validated afterward by a deterministic rule-checker. `docs/plans/features/ai-generated-summaries.md`'s own open questions ("what is the failure mode when the AI can't produce a confident next step") and `docs/plans/features/leaderboards-peer-competition.md`'s open questions (framing thresholds, group-size sensitivity) are answerable either way — this brainstorm does not resolve them, it scopes how many LLM calls and how much architecture the MVP needs before those questions get answered in an implementation plan.

---

## Key Flows

- F1. **Challenge completion and strict-format summary.**
  - **Trigger:** A newgrad submits a completed challenge attempt (quiz or budgeting exercise).
  - **Actors:** Newgrad; deterministic grading logic; one of two candidate summarizer pipelines — the architecture plan's Recap Writer → Standings Framer → Compliance Guardrail chain, or a single-shot summarizer call.
  - **Steps:** (1) Application logic grades the attempt deterministically against the challenge's answer key, producing score, points earned, missed concepts, and streak status — no LLM call involved. (2) **Multi-agent candidate:** Recap Writer drafts the four-field recap from those signals; Standings Framer separately drafts the track-position line from a deterministically computed rank/gap; Compliance Guardrail evaluates the combined draft and approves, rewrites, or blocks it. (3) **Single-shot candidate:** one LLM call receives the same structured signals plus the deterministically computed standings snapshot and the compliance rules as instructions, and returns the full four-field JSON object in one pass; a deterministic rule-checker (schema shape, banned-phrase list, field-length caps) validates the response afterward, with the LLM re-invoked only on a validation failure. (4) The app renders whichever candidate's output passed validation as a fixed-layout recap card.
  - **Outcome:** The newgrad sees a strict four-field recap and an updated leaderboard position in the same session, produced by exactly one of the two candidate pipelines — never both, and never a hybrid the user can tell apart.
  - **Covered by:** R2, R3, R5, R6, R7, R8, R9

- F2. **Leaderboard update and peer-comparison nudge.**
  - **Trigger:** The newgrad's points ledger changes on challenge completion, changing their rank within their peer group.
  - **Actors:** Newgrad; peer group members whose completions also move the shared ledger; Standings Framer (multi-agent candidate) or the standings clause of the single-shot call.
  - **Steps:** (1) The points ledger updates append-only on challenge completion — deterministic, no LLM involved (`docs/plans/finfy-literacy-architecture-plan.md`'s `points_ledger` table). (2) Rank and point gap within the peer group are computed deterministically from the ledger. (3) A framing line is generated: self-relative always, peer-relative only when it reads as motivating rather than discouraging (per the architecture plan's Standings Framer role). Generating that line is the only non-deterministic step in this flow, and it is a candidate for LLM generation in both pipelines — either as its own call (multi-agent) or as one field the single-shot call fills alongside the other three. (4) The nudge line surfaces both inside the recap card and on the leaderboard screen.
  - **Outcome:** The newgrad sees a motivating, non-discouraging standings line alongside their numeric leaderboard position, sourced from real peer data — never balances, income, or debt.
  - **Covered by:** R10, R11, R12, R13

- F3. **Ablation: single-shot vs. multi-agent summarizer output quality.**
  - **Trigger:** Manually invoked once both candidate pipelines are implementable, before the MVP implementation plan locks the pipeline shape for Phase 4 ("Strict-Format AI Recap" in `docs/plans/finfy-literacy-architecture-plan.md`'s Implementation Plan).
  - **Actors:** Builder/operator running the ablation.
  - **Steps:** (1) Assemble a fixed sample of scored challenge attempts covering a clean pass, a single missed concept, multiple missed concepts, a streak-at-risk case, and at least one free-response attempt carrying a synthetic escalation signal. (2) Run the multi-agent candidate (Scorekeeper output → Recap Writer → Standings Framer → Compliance Guardrail) over the sample; record output, latency, token cost, and guardrail catch rate per attempt. (3) Run the single-shot candidate (deterministic scorer → one summarizer call → deterministic rule-checker) over the same sample; record the same metrics. (4) Score both candidates against a shared rubric — format compliance, advice-language leakage, next-step groundedness, standings tone, latency, token cost — at the hackathon-credible bar (judge plus friendly tester). (5) Decide, per role, whether it ships as a separate LLM call, folds into the single-shot call, or runs as deterministic logic with no LLM at all.
  - **Outcome:** A documented, per-role decision — not just a pipeline-level verdict — that the MVP implementation plan can build against without re-opening the multi-agent-vs-single-shot question mid-build.
  - **Covered by:** R1, R4, R14, R15, R16, R17

---

## Requirements

**Architecture shape**
- R1. The MVP ships exactly one production summarizer pipeline, chosen via the F3 ablation — either the five-role pipeline in `docs/plans/finfy-literacy-architecture-plan.md`, a single-shot pipeline, or a named hybrid — never both candidates running in parallel in production.
- R2. Deterministic, well-defined logic — challenge grading against an answer key, points arithmetic, streak-state transitions, rank computation — is never delegated to an LLM call in either candidate pipeline. LLM calls are reserved for natural-language synthesis (the recap's prose, the standings framing line) and, optionally, advice-language judgment.
- R3. Whichever pipeline ships, its output is validated against the strict four-field JSON schema (what you did / score / next step / track position) by a deterministic check before display — never accepted on an LLM's self-report that its own output is compliant.
- R4. The compliance boundary — format compliance, advice-language check, escalation-signal check — runs on every recap before display regardless of which candidate pipeline produced the draft. The ablation may change how many LLM calls implement that boundary; it does not remove the boundary itself.

**Challenge-to-summary loop**
- R5. Challenge grading (score, missed concepts, points, streak status) is computed and available as structured input before any summarizer call runs, in both candidate pipelines.
- R6. The recap's "next step" field must trace to a missed concept from the current attempt or the newgrad's track history. When an attempt has no missed concepts (a clean pass), the field falls back to a forward-looking suggestion (for example, previewing the next challenge) — never an invented missed concept and never a personalized financial recommendation.
- R7. The four-field order — what you did / score / next step / track position — is fixed and identical regardless of challenge type, score, or which candidate pipeline generated it.
- R8. The newgrad sees the completed recap within a bounded latency budget after submitting a challenge attempt. The exact budget is a planning concern, but both candidates are measured against the same budget in the F3 ablation so latency is a comparable axis, not an afterthought.
- R9. No AI-generated recap, in either candidate pipeline, may include a personalized dollar-amount recommendation, an implied bank or brokerage connection, or other advice-like language, consistent with `docs/plans/origin.md`'s exclusion of financial planning tools and institution integration from the MVP.

**Leaderboard & peer nudge**
- R10. Leaderboard rank and point gap are computed deterministically from the points ledger in both candidate pipelines; only the framing line (self-relative or peer-relative) is a candidate for LLM generation.
- R11. Peer-relative framing is included only when it is genuinely motivating (a closing, achievable gap); a raw last-place rank is never shown without an accompanying self-relative line, in either candidate pipeline.
- R12. Data exposed to any summarizer call, single-shot or multi-agent, is limited to points, streak, and rank — never balances, income, debt, or another peer's raw challenge answers, matching the leaderboard's data boundary in `docs/plans/features/leaderboards-peer-competition.md`.
- R13. The standings line ships as part of the same recap render as the other three fields; it is not a separately timed or independently loading UI element that could desync from the rest of the recap.

**Falsifiable validation gate**
- R14. The premise — that the architecture plan's five-role pipeline is load-bearing over a single-shot call — is validated only via an explicit ablation run on a fixed sample of scored attempts, before the pipeline choice is locked into the MVP implementation plan.
- R15. The ablation evaluates both candidates against the same fixed sample and the same rubric (format compliance, advice-language leakage, next-step groundedness, standings tone, latency, token cost), so results are directly comparable rather than anecdotal.
- R16. The ablation's evaluation bar is the hackathon-credible bar (judge plus friendly tester), not a compliance-reviewed production bar. A production-grade evaluation bar is a separate, later validation, not a deliverable of this brainstorm.
- R17. The ablation's output is a per-role decision, not only a pipeline-level verdict — it must be possible to conclude, for example, "single-shot recap generation, but keep the compliance check as a separate deterministic rule pass" rather than only "multi-agent wins" or "single-shot wins" wholesale.

---

## Acceptance Examples

- AE1. **Covers R2, R5.** Given a challenge attempt is submitted, when grading runs, then score, points, missed concepts, and streak status are computed by deterministic application logic — not an LLM call — before any summarizer candidate is invoked, in both the single-shot and multi-agent pipelines.
- AE2. **Covers R3, R7.** Given either candidate pipeline produces a draft recap, when the draft is validated, then a deterministic schema check confirms exactly four fields in the fixed order, with no missing or extra fields, before the recap is marked eligible for display.
- AE3. **Covers R6, R9.** Given a newgrad's attempt has zero missed concepts, when the recap is generated, then the next-step field contains a forward-looking suggestion (such as a preview of the next challenge) rather than an invented missed concept or a personalized financial recommendation, in either candidate pipeline.
- AE4. **Covers R11, R12.** Given a newgrad is in last place within a five-person peer group, when the standings line is generated, then the output includes a self-relative line and either omits the peer-relative line or pairs it with an achievable path forward, and contains no balance, income, or debt figures for any peer.
- AE5. **Covers R14, R15, R16.** Given both candidate pipelines are implemented against the same fixed sample of scored attempts, when the ablation is run, then it produces per-candidate scores on the shared rubric (format compliance, advice-language leakage, next-step groundedness, standings tone, latency, token cost), evaluated at the hackathon-credible bar, without needing to re-litigate which premise is being tested.
- AE6. **Covers R4, R17.** Given the ablation concludes that single-shot recap generation is sufficient, when the MVP's compliance boundary is scoped, then the resulting decision explicitly states whether the compliance check remains a separate deterministic rule pass, a separate LLM call, or both in sequence — rather than silently folding it into the single-shot call with no documented reasoning.

---

## Success Criteria

- A reader can stop here and start an implementation plan without inventing which of the architecture plan's five roles are LLM calls versus deterministic logic, the strict-format schema's shape, whether the compliance boundary survives regardless of pipeline choice, or the ablation's shape.
- Each of the product's stated constraints — hackathon MVP timeline (`docs/plans/finfy-literacy-architecture-plan.md`'s Implementation Plan), the strict fixed recap format (`docs/plans/features/ai-generated-summaries.md`), and the non-advice boundary (`docs/plans/origin.md`'s out-of-scope list) — is addressable by at least one explicit decision in this doc, with the trade-off named.
- The falsifiable test is specific enough that a reasonable engineer could execute it before the MVP implementation plan locks the pipeline shape, and produce a defensible per-role decision without re-opening which premise is being tested.
- A future reviewer can compare this doc against `docs/plans/finfy-literacy-architecture-plan.md` and identify exactly which of its five roles this brainstorm treats as provisional pending the ablation, versus fixed regardless of outcome — the strict schema, the four-field order, and the compliance boundary's existence are fixed; which roles run as separate LLM calls is provisional.

---

## Scope Boundaries

- Financial planning tools or personalized financial advice — out of scope regardless of which candidate pipeline ships, per `docs/plans/origin.md`.
- Bank or brokerage integration — unaffected by this premise check; neither candidate pipeline reads real account data.
- Advanced analytics or reporting dashboards — out of scope; the ablation's own metrics (latency, cost, rubric scores) are a build-time artifact used to make one decision, not a shipped analytics feature.
- Social features beyond the leaderboard — unaffected; neither candidate changes the leaderboard's messaging- and forum-free scope.
- Complex gamification mechanics (badges, achievement trees, cosmetic rewards) — unaffected by this premise check; neither candidate pipeline touches gamification mechanics beyond points, streaks, and leaderboards.
- Monetization or premium features — unaffected.
- A third, fully deterministic (no-LLM) recap candidate — explicitly excluded from the ablation. `docs/plans/origin.md`'s MVP scope names "AI-generated summaries" as a required feature; testing a no-LLM candidate would answer a different question (does the product need AI at all) than the one asked here (does it need multi-agent AI).
- Rewriting `docs/plans/finfy-literacy-architecture-plan.md` itself — a separate task. This brainstorm treats that document as an input to compare against, not a file this brainstorm edits.
- Per-role model or provider selection, and latency-vs-quality tuning — a planning concern once the ablation's per-role decision is in hand, not resolved here.
- Whether the Sequencer's challenge-selection logic needs to be LLM-driven — out of scope for this premise check. Sequencer is queue/state logic and is already assumed deterministic under R2; if that assumption turns out wrong, it is a separate brainstorm.
- Redesigning the leaderboard's framing rules (exact self-relative/peer-relative thresholds) — left to `docs/plans/features/leaderboards-peer-competition.md`'s open questions; this brainstorm only decides which pipeline generates whatever framing rules are eventually specified.

---

## Key Decisions

- **Deterministic logic never becomes an LLM call, in either candidate.** Rationale: grading, points arithmetic, and rank computation are well-defined operations with a single correct answer; delegating them to an LLM only adds cost, latency, and a new failure mode with no product benefit.
- **The strict four-field schema and its fixed field order are locked regardless of the ablation's outcome.** Rationale: the strict format is a stated product commitment tracked as its own Phase 0 KPI (AI summary engagement rate) — the ablation is not licensed to relitigate it, only to decide which pipeline produces it.
- **The compliance boundary always runs, whichever pipeline wins.** Rationale: the non-advice boundary is a trust commitment independent of implementation efficiency; dropping it because a single-shot call is cheaper would trade product safety for hackathon convenience.
- **The ablation is scored per-role, not pipeline-wide.** Rationale: a single pipeline-level verdict would obscure the more useful finding — for example, that recap-writing benefits from a dedicated LLM call while standings framing does not — and a per-role decision lets the MVP mix deterministic and LLM steps deliberately instead of all-or-nothing.
- **The evaluation bar for this ablation is the hackathon-credible bar, not a production compliance bar.** Rationale: the MVP timeline in `docs/plans/finfy-literacy-architecture-plan.md` is a hackathon build; over-indexing on a production-grade compliance review here would spend build time this premise check isn't meant to spend.
- **A third, fully deterministic no-LLM recap candidate is excluded from the ablation.** Rationale: `docs/plans/origin.md`'s MVP scope explicitly names AI-generated summaries as a required feature; testing a no-LLM candidate would answer whether the product needs AI at all, which is a different and already-settled question from whether it needs multi-agent AI.
- **Exactly one pipeline ships to production, not a permanent dual-path system.** Rationale: running both candidates in production indefinitely doubles the surface area to maintain and debug, which a hackathon-stage team has no operational capacity to support.

---

## Dependencies / Assumptions

- Assumes challenge grading can be fully deterministic for the MVP's challenge types (quiz, budgeting exercise) per `docs/plans/finfy-literacy-architecture-plan.md`'s Scorekeeper description. If a future challenge type requires subjective grading (for example, open-ended scenario responses), R2 may not hold for that challenge type and would need its own decision.
- Assumes the LLM provider(s) selected for the MVP (per the architecture plan's stack recommendation of Vercel AI SDK with Anthropic and/or OpenAI providers) support structured or strict JSON output reliably enough that schema-validation failures are rare in both candidates. If structured-output reliability differs meaningfully between one large call and several smaller calls, that reliability delta is itself an ablation input, not an assumption to route around.
- Assumes a fixed sample of scored challenge attempts — spanning score levels, missed-concept patterns, and at least one synthetic escalation-signal case — can be assembled or seeded before the ablation runs. The ablation cannot execute without this sample existing.
- Assumes the hackathon timeline allows implementing both candidate pipelines far enough to compare them, even if only one ships to the demo. If timeline pressure forces skipping one candidate's implementation, the ablation degrades to a design review rather than a measured comparison, and the resulting decision should say so explicitly rather than presenting a design review as a measured result.
- Assumes the Compliance Guardrail's escalation-signal check (financial-distress language in free-response fields, per the architecture plan's Support & Escalation section) is testable within the ablation using synthetic examples, without needing real user-submitted distress language.

---

## Outstanding Questions

### Resolve Before Planning

- [Affects R1, R14] Who runs the ablation and on what timeline — a pre-build spike that gates the MVP implementation plan's Phase 4 ("Strict-Format AI Recap"), or does the MVP default to the architecture plan's five-role pipeline and the ablation runs after the hackathon build, mirroring a ship-first-validate-after pattern? This determines whether the ablation is a blocking gate or a post-hoc review.
- [Affects R1] If the ablation cannot finish before the implementation plan is written, what pipeline should the plan default to — the five-role architecture-plan pipeline (currently the only fully specified design) or a single-shot placeholder pending the ablation's result?

### Deferred to Planning

- [Affects R8][Technical] The exact latency budget for the challenge-to-recap loop — the architecture plan's Phase 3/4 validation only says "no perceptible lag"; a number is needed to make R8 measurable in the ablation.
- [Affects R15][Needs research] The ablation's scoring method — a human judge scoring against the hackathon-credible bar, an LLM-judge pass, or both in combination.
- [Affects R6][Needs research] A fallback next-step content library for clean-pass attempts, covering all four challenge tracks (budgeting, saving, investing, credit) — needed regardless of which candidate pipeline wins.
- [Affects R16] The exact production/v1 evaluation bar this ablation explicitly does not need to meet, so a future team does not mistake this hackathon-bar ablation for a production sign-off.
- [Affects R2, R5][Technical] Whether any MVP challenge type needs LLM-assisted grading rather than deterministic answer-key grading — particularly free-response fields used for escalation-signal detection.
- [Affects R11][Needs research] The exact self-relative / peer-relative framing rules referenced by the architecture plan's Standings Framer role — this brainstorm assumes the framing logic is portable between candidates but does not specify its content, which is `docs/plans/features/leaderboards-peer-competition.md`'s open question to resolve.
- [Affects R4, R17][Technical] If the ablation concludes the compliance check should stay a separate step, whether it runs as a deterministic rule-checker, a separate LLM call, or a deterministic pass with an LLM fallback only on ambiguous cases.
- [Affects R1][Needs research] Per-role model and provider choice, referencing the architecture plan's stack recommendation — cost and latency budgets per candidate are inputs to the ablation, not resolved here.
