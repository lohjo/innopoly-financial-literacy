# finfy-literacy: Newgrad Financial Literacy and Multi-Agent Architecture Plan

Codename: **finfy-literacy**

One-line pitch: **finfy-literacy helps newgrads turn their first paycheck into lasting financial habits through gamified challenges, real-peer leaderboards, and a strict-format AI recap after every challenge.**

## Product Judgment

This should not be another budgeting spreadsheet template, a static financial-literacy blog, or a bank onboarding funnel wrapped in quizzes.

The stronger product is a **gamified financial-habit loop**: newgrads complete short, duolingo-style challenges on budgeting, saving, investing, and credit management; compete on a leaderboard shared with a real peer group; and receive an AI-generated recap in a strict, predictable format after every challenge.

The product must be honest about its advisory boundaries. It is not a licensed financial planner, it does not connect to real bank or brokerage accounts, and it does not generate personalized investment or tax recommendations. It is **gamified financial education, not financial advice**.

Core principle:

> Newgrads complete short challenges, compete against real peers they know, and get a strict-format AI recap that tells them exactly what to do next.

## Target User

Primary user: **newgrads who just received their first paycheck** and want a fast, engaging way to build responsible financial habits.

First recommended wedge: **newgrads in their first 1–3 months of full-time employment who have not yet set up a budget, an emergency fund, or a habit of checking their credit** — the window where the first paycheck is still a fresh, motivating event rather than routine.

Why this wedge:

- The first paycheck is the single most motivated moment a newgrad will have for learning financial literacy; wait even a few months and the moment cools into routine.
- This group has a real, immediate need (they now have money to manage) but rarely has a habit or a resource that matches how they actually consume content — short, mobile, social.
- Most existing financial literacy resources (bank blog posts, PDFs, one-off workshops) are dry, generic, and not built to be revisited, so they don't survive contact with a newgrad's attention span.
- A gamified, duolingo-style format converts a one-off resource into a daily habit loop by pairing short lessons with immediate points, streaks, and peer visibility.
- Peer groups already exist for this cohort — college friends, a new-hire cohort, coworkers — which makes a real-peer leaderboard easy to seed without cold-starting a social graph.

Secondary future use cases:

- **Financial literacy for high school students**: adapting the challenge library and difficulty curve for a pre-employment audience, ahead of their first job or first bank account.
- **AI video call**: a live, conversational version of the finfy mascot that talks a user through a challenge or a recap the way a knowledgeable friend would, instead of a text-only interaction.

## Financial Literacy Context

Personal-finance literacy for a first-job newgrad already has a well-worn practical arc, even if no single existing resource packages it well:

1. **Understand your paycheck** — gross vs. net, withholdings, benefits deductions, pay cadence.
2. **Build a budget you'll actually keep** — needs vs. wants, a simple allocation framework (for example, 50/30/20), fixed vs. variable spending.
3. **Save before you spend** — emergency fund basics, automating a transfer, why "pay yourself first" works.
4. **Manage credit responsibly** — how utilization and payment history drive a credit score, the minimum-payment trap, why a first credit card is a tool, not free money.
5. **Start investing early** — the basic mechanics of compounding, employer retirement matching, and why time in the market matters more than timing it.

Bank financial-wellness content, the CFPB, and NFEC-style curricula already cover this ground. The opportunity for finfy-literacy is not to replace that material — it's to become the engaging front door to it:

> First paycheck → a short, game-like challenge → one concrete habit formed → confidence to go deeper into real financial decisions later.

## Core Promise

**Turn a first paycheck into a lasting financial habit.**

More complete version:

> Complete short, gamified challenges on budgeting, saving, investing, and credit. finfy-literacy tracks your progress against a real peer group, and after every challenge, an AI recap tells you exactly what you did, how you scored, and the one thing to do next.

## Positioning

Bad positioning:

> "AI gives newgrads a personalized financial plan."

Better positioning:

> "A gamified way for newgrads to build financial literacy habits, one short challenge at a time."

Best current positioning:

> "A Duolingo-style financial literacy game where newgrads complete challenges, compete on a leaderboard with people they actually know, and get a strict-format AI recap that turns a score into a next step."

## Scope Boundary

### In scope for hackathon MVP

- Gamified financial literacy challenges covering budgeting, saving, investing, and credit management, sequenced into a fixed track.
- Points earned per completed challenge and a visible daily streak.
- Leaderboards scoped to a real peer group — invited friends, cohort, or coworkers — never an anonymous global ranking.
- AI-generated summaries in a strict, fixed format after every challenge: what the user did, their score, one specific next step, and their track position.
- A compliance/guardrail pass on every AI summary before it is shown, enforcing the format and blocking advice-like language.
- Simple onboarding: fast signup, straight into the first challenge, minimal profile fields.
- Basic account management: profile, settings, and a visible history of completed challenges.
- Mobile-first responsive design tuned for short, one-handed sessions.

### Out of scope for MVP

- Personalized financial planning tools or licensed financial advice.
- Integration with banks, brokerages, or other financial institutions for real account data or transactions.
- Advanced analytics or reporting dashboards for users or administrators.
- Social features beyond the leaderboard itself — no messaging, comments, or forums.
- Monetization or premium features.
- Extensive localization or translation beyond English.
- Complex gamification mechanics — badges, achievement trees, or cosmetic rewards — beyond points, streaks, and leaderboards.

## Trust Model

This cannot be framed as a personalized financial advisor, because the product has no licensed advisory relationship with the user and no view into their actual accounts.

Use this model instead:

> **Gamified financial education with an explicit non-advice boundary.**

### Educational Content Layer

- Content is generic, curriculum-based financial literacy education, not personalized advice.
- No real bank or brokerage connection; the product never sees the user's actual balances, income, or transactions.
- Challenge content and every AI summary are checked against a fixed compliance boundary before a user sees them (see Compliance Guardrail).

### Peer & Leaderboard Layer

- The leaderboard exposes points, streaks, and rank only — never balances, income, debt amounts, or challenge answers.
- Peer group membership is opt-in (friends, cohort, coworkers), not open discovery of random users.
- The user controls whether they are visible on a leaderboard at all.

### Escalation Layer (light touch)

- The product does not diagnose financial hardship or crisis, but recognizes a narrow set of textual signals in free-response challenge fields (for example, mentions of predatory lending, inability to pay rent, or debt collection harassment).
- When detected, the response is a static, pre-approved referral card pointing to appropriate resources — never an AI-generated financial or emotional response.
- This is not a monitored or clinically staffed feature; it is a scoped, low-stakes safety net, detailed further in Support & Escalation below.

Opening copy should be calm and explicit:

> "finfy is a financial literacy game, not a financial advisor. Challenges, scores, and AI recaps are for learning only. If you're dealing with a financial emergency, we'll point you to real help — we won't try to solve it ourselves."

## Core User Flow

1. A newgrad signs up shortly after their first paycheck lands, through a single-screen onboarding flow.
2. The newgrad is dropped directly into a challenge feed rather than a lesson catalog or a settings screen.
3. The Sequencer selects the newgrad's next challenge based on track position, prior performance, and time since their last session.
4. The newgrad opens the challenge and completes it in a few minutes — a short quiz, a mini budgeting exercise, or a scenario decision.
5. The Scorekeeper grades the completed attempt and converts it into structured signals: score, points earned, missed concepts, and streak status.
6. The Recap Writer turns those signals into a draft summary in the strict four-field format.
7. The Standings Framer computes the newgrad's position within their peer group and drafts a non-discouraging standings line.
8. The Compliance Guardrail checks the combined draft for format compliance, advice-like language, and escalation signals before anything is shown.
9. The newgrad sees their points update on the leaderboard and reads the strict-format AI recap on the same screen.
10. The newgrad can tap into the leaderboard to see where they stand against their real peer group by name, not by anonymous rank.
11. A streak indicator and the Recap Writer's "next step" pull the newgrad back the next day to protect their streak and act on the suggestion.
12. Over weeks, completed challenges accumulate into a visible track record the newgrad can point to as evidence of real financial-literacy progress.

## First Paycheck Hook

The product should open with a moment, not a form.

Do not start with:

- A multi-page financial-health questionnaire.
- A mandatory bank-account link.
- A dense "financial literacy 101" lesson before the user has done anything.

Start with:

> "You just got paid. Let's make the first move count — one two-minute challenge."

The onboarding hook is a single, concrete first challenge tied to the paycheck-just-landed moment (for example, "Read your first payslip" or "Where should your first $500 go?"), not a generic welcome tour. The newgrad completes it, earns their first points, and sees the leaderboard and AI recap before they have filled in more than a name and an optional peer invite.

Only after that first completed challenge does the product ask for anything else — inviting peers into a leaderboard group, picking an industry for later personalization, enabling notifications for streak reminders.

Product principle:

> The hook is a completed challenge, not a filled-out form.

## Demo Scenario

Newgrad has three seeded prior challenge attempts:

1. "Reading Your First Payslip" — 6/6 correct, 60 points, completed on signup day.
2. "50/30/20 Budgeting Basics" — 4/5 correct, missed the "needs vs. wants" classification question, 40 points.
3. "Building a Starter Emergency Fund" — 5/5 correct, 50 points, completed two days later.

New challenge just completed: "Credit Utilization 101," a six-question quiz on how credit utilization affects a credit score.

Attempt result: 4/6 correct. Missed the utilization-ratio calculation question and the minimum-payment-trap question.

finfy-literacy output:

- **Sequencer:** "Next up in your credit track: Credit Utilization 101. You're due for this one — it's been three days since your last credit-track challenge."
- **Scorekeeper:** `{ score: 4, max_score: 6, points_earned: 40, missed_concepts: ["utilization ratio calculation", "minimum-payment trap"], streak_status: "day 6, active" }`
- **Recap Writer:**
  - What you did: "You completed Credit Utilization 101."
  - Score: "4 / 6 correct — 40 points earned."
  - Next step: "Review how utilization ratio is calculated — it's the concept you missed twice. Try the flashcard drill before your next credit challenge."
  - Track position: *(filled in by Standings Framer, below)*
- **Standings Framer:** "You've completed 4 challenges this week, up from 2 last week. You're 30 points behind Marcus in your group — one more challenge closes the gap."
- **Compliance Guardrail:** `{ "approved_for_display": true, "requires_rewrite": false, "advice_language_flag": "none", "format_violation": "none", "escalation_flag": "none", "rewrite_notes": [] }`

## Agent Architecture

### 1. Sequencer

Role: Owns the challenge queue and the overall run choreography — decides what a newgrad sees next and which other agents need to run.

Core question:

> "What's the next challenge that keeps this newgrad progressing without losing them?"

Responsibilities:

- picks the next challenge from the track based on track position, last completed challenge, and elapsed time since last session
- decides whether the newgrad is due for a review challenge (revisiting a previously missed concept) or the next new challenge
- flags streak-risk — the newgrad hasn't opened the app today and their streak is about to lapse — and decides whether a nudge is warranted
- triggers the Scorekeeper once a challenge attempt is submitted
- triggers the Recap Writer, Standings Framer, and Compliance Guardrail in sequence after scoring
- assembles the final screen the newgrad sees: the challenge feed, or the post-challenge recap
- keeps the loop fast — no agent hand-off should read as more than a second or two of delay in the UI

Visible UI examples:

- "Loading your next challenge…"
- "Checking your answers…"
- "Writing your recap…"
- "Checking your recap before we show it to you…"

### 2. Scorekeeper

Role: Reads one completed challenge attempt and converts it into structured, gradeable signals.

Core question:

> "What did the newgrad actually get right, wrong, or skip in this attempt?"

Looks for:

- correct vs. incorrect answers, including partial credit on multi-part budgeting exercises
- time taken relative to the challenge's expected length
- hints used or answers changed before submission
- which specific concept each missed question maps to (for example, "utilization ratio" or "needs vs. wants")
- whether this is a first attempt or a retry of a previously failed challenge
- current streak status after this attempt

The Scorekeeper does not write user-facing language. It emits a structured signal object consumed by the Recap Writer and the Standings Framer.

Output format:

- `score` / `max_score`
- `points_earned`
- `missed_concepts` (list)
- `time_taken_seconds`
- `attempt_number`
- `streak_status`

### 3. Recap Writer

Role: Turns the Scorekeeper's structured signals into the strict, fixed-format AI summary — the product's core "AI summarizes with a strict format" mechanic.

Core question:

> "What is the one specific thing this newgrad should do differently next time?"

Responsibilities:

- writes a one-line neutral recap of what the user did ("You completed Credit Utilization 101")
- states the score plainly, with no editorializing
- picks exactly one next step, drawn from the missed concepts — never a generic "keep learning!"
- when the attempt was a clean pass with no missed concepts, falls back to a forward-looking next step (for example, "preview the next challenge in this track") rather than leaving the field empty
- pulls in the Standings Framer's line for the track-position field
- never varies the four-field order or invents a fifth field

Output format (matches the product's strict schema exactly):

- **What you did**
- **Score**
- **Next step**
- **Track position**

### 4. Standings Framer

Role: Computes the newgrad's position within their real peer group and frames it in language that motivates rather than discourages.

Core question:

> "How do I show this newgrad where they stand against people they know, without making them feel like they're losing?"

Looks for:

- rank and point gap within the peer group
- whether the gap is closing or widening since the last challenge
- how long the newgrad has been in the peer group (a two-day-old member shouldn't be framed the same as a two-month veteran)
- peer group size — a three-person group and a forty-person group need different framing
- whether the newgrad is currently in first place, in which case standings should reinforce rather than manufacture pressure

The Standings Framer defaults to self-relative framing ("You've completed 2 more challenges than last week") and only adds peer-relative framing when it is genuinely motivating ("You're 30 points behind Marcus — one more challenge closes the gap"). It never states a raw last-place rank without a path forward.

Output format:

- `self_relative_line`
- `peer_relative_line` (nullable — omitted when it would read as discouraging)
- `rank`
- `peer_group_size`

### 5. Compliance Guardrail

Role: Evaluates every draft recap for format compliance, advice-like language, and escalation signals before the newgrad ever sees it.

Core question:

> "Does this recap teach a concept, or does it cross into advice?"

The Compliance Guardrail runs after the Recap Writer and Standings Framer, and before display.

Checks:

- **Format compliance:** all four fields present, in order, within length caps; no extra fields.
- **Advice-language check:** flags and rewrites anything that reads as a personalized financial, investment, tax, or legal recommendation (for example, "you should put $200 into VOO" becomes "index funds are one way people invest for retirement — this challenge covers how they work").
- **Evidence grounding:** the next step must trace to a missed concept in this attempt or track, never an invented claim about the user's finances.
- **Tone check:** not shaming, not falsely certain, not overly clinical.
- **Escalation-signal check:** scans free-response fields for a narrow set of financial-distress or predatory-debt signals (see Support & Escalation) and routes to a static referral card instead of letting the AI respond.

Output:

```json
{
  "approved_for_display": true,
  "requires_rewrite": false,
  "advice_language_flag": "none | soft_rewrite | blocked",
  "format_violation": "none | missing_field | extra_field | length_exceeded",
  "escalation_flag": "none | support_referral_suggested",
  "rewrite_notes": []
}
```

Visible user-facing note:

> "Checked for accuracy and to make sure this is education, not advice."

Keep the Compliance Guardrail's presence reassuring, not alarming.

## Support & Escalation

finfy-literacy has no licensed advisor and no human counselor in the loop by default. This section stays deliberately light — proportionate to a gamified education product, not a crisis-response system.

### Normal Operation

- All learning content and recaps are generic and curriculum-based; there is no "share this with a human" flow because there is no advisor relationship to share it into.
- A future coach or mentor layer (for example, an employer-sponsored financial wellness program) would sit here — out of scope for MVP.

### Signal Detection

A small number of challenges include a free-response field (for example, "What's one financial worry from this week?"). The Compliance Guardrail scans these responses for a narrow, pre-defined set of categories:

- predatory lending or loan-shark language
- inability to make rent, utility, or minimum debt payments
- debt collection harassment
- explicit financial-crisis language

### Escalation Response

- Detection triggers a static, pre-approved referral card — never an AI-generated response — pointing to appropriate resources (for example, CFPB complaint tools, NFCC-affiliated nonprofit credit counseling, or 988 where distress language crosses into personal-safety territory).
- The referral card is shown to the user only; there is no routing to a human reviewer, employer, or third party in the MVP.
- The event is logged as a category and timestamp only, never the raw free-response text, so the team can tune detection categories over time.
- The product is explicit that this is a referral, not intervention: "We're not able to help with this directly, but here's who can."

This keeps the product honest about what it can and cannot do without building a support operation a hackathon-stage team cannot actually staff.

## Technical Architecture and Data Model

The product should keep the challenge-to-recap loop fast and make the advice boundary explicit at the data layer, not just in the prompt.

Recommended runtime shape:

> Next.js PWA → Vercel AI SDK streaming route → Convex data/actions → Trigger.dev or Inngest background job (scoring + recap generation) → Compliance Guardrail evaluation → Convex commit → live UI update (points, streak, leaderboard) → Langfuse trace

Agents may reason and propose writes. The application owns persistence, the points ledger, leaderboard computation, and compliance artifacts.

### Recommended data tables

Do not store challenge content, attempt data, generated recaps, and compliance decisions in one large object. Split raw attempt data, scoring, generated summaries, standings, and compliance/escalation artifacts.

#### `users`

- `id`
- `display_name`
- `email`
- `signup_context`: `first_paycheck | later | demo_profile`
- `employment_track`: nullable, populated only if personalization ships
- `created_at`

#### `peer_groups`

- `id`
- `name`
- `invite_code`
- `created_by_user_id`
- `created_at`

#### `peer_group_memberships`

- `id`
- `peer_group_id`
- `user_id`
- `visible_on_leaderboard`: boolean
- `joined_at`

#### `challenges`

Static, seeded content — not user-authored.

- `id`
- `track`: `budgeting | saving | investing | credit`
- `title`
- `type`: `quiz | budgeting_exercise | scenario`
- `difficulty`: `intro | core | stretch`
- `order_index`
- `content_json`
- `created_at`

#### `challenge_attempts`

Append-only record of what a user actually did.

- `id`
- `user_id`
- `challenge_id`
- `answers_json`
- `status`: `in_progress | completed | abandoned`
- `started_at`
- `completed_at`

#### `agent_runs`

Every sequencing, scoring, recap, and compliance run should be traceable.

- `id`
- `user_id`
- `challenge_attempt_id`
- `run_type`: `sequencing | scoring | recap_generation | standings_framing | compliance_eval`
- `model_provider`
- `model_name`
- `prompt_version`
- `status`: `running | completed | failed | blocked_by_compliance`
- `langfuse_trace_id`: nullable
- `created_at`

#### `scored_attempts`

The Scorekeeper's structured output.

- `id`
- `challenge_attempt_id`
- `agent_run_id`
- `score`
- `max_score`
- `points_earned`
- `missed_concepts_json`
- `time_taken_seconds`
- `created_at`

#### `ai_summaries`

The strict-format artifact shown to the user.

- `id`
- `challenge_attempt_id`
- `agent_run_id`
- `what_you_did`
- `score_line`
- `next_step`
- `track_position`
- `compliance_status`: `draft | approved | rewritten | blocked`
- `created_at`

#### `points_ledger`

Append-only; leaderboard totals are derived from this, never mutated in place.

- `id`
- `user_id`
- `challenge_attempt_id`
- `points_delta`
- `reason`: `challenge_completed | streak_bonus | correction`
- `created_at`

#### `streaks`

- `id`
- `user_id`
- `current_streak`
- `longest_streak`
- `last_active_date`
- `streak_freeze_available`: boolean

#### `compliance_flags`

- `id`
- `user_id`
- `ai_summary_id`: nullable
- `category`: `advice_language | format_violation | escalation_signal`
- `severity`: `none | soft_rewrite | blocked`
- `rationale`
- `resolution_status`: `auto_resolved | needs_review`
- `created_at`

#### `support_referrals`

Minimal, category-only escalation artifact — no raw free-response text retained.

- `id`
- `user_id`
- `trigger_category`: `predatory_debt | payment_distress | collections_harassment | crisis_language | other`
- `referral_shown`: boolean
- `created_at`

### Tool boundary

Expose only narrow typed tools to agents:

- `getUserChallengeHistory`
- `getNextChallengeCandidates`
- `recordChallengeAttempt`
- `scoreChallengeAttempt`
- `draftRecapSummary`
- `computeStandings`
- `runComplianceEval`
- `commitPointsLedger`
- `flagComplianceIssue`
- `showSupportReferral`

Avoid generic filesystem, shell, browser, or unrestricted database tools in the user-facing runtime.

## MVP Feature Set

### Must-have

1. Challenge feed
   - fixed track covering budgeting, saving, investing, and credit
   - Sequencer picks the next challenge automatically

2. Challenge completion and scoring
   - quiz and short budgeting-exercise formats
   - Scorekeeper grades immediately on submit

3. Points and streaks
   - points awarded per completed challenge
   - daily streak counter with a visible at-risk state

4. Real-peer leaderboard
   - invite-based peer group at or shortly after onboarding
   - rank, points, and streak visible; no raw financial data

5. Strict-format AI recap
   - Recap Writer produces the four-field summary after every challenge
   - Standings Framer supplies the track-position field

6. Compliance Guardrail pass
   - runs on every recap before display
   - blocks or rewrites advice-like language and enforces the format

7. Fast onboarding
   - single-screen signup straight into the first challenge
   - peer invite offered, not required, before the first challenge

8. Basic account management
   - profile, settings, and a history of completed challenges

9. Mobile-first responsive layout
   - challenge feed, leaderboard, and recap screens tuned for a phone-sized viewport and short sessions

### Nice-to-have

- Job/industry personalization step feeding a customized track.
- Adaptive difficulty within a track based on demonstrated accuracy.
- Push notifications for streak-risk reminders.
- Weekly-reset leaderboard option alongside cumulative ranking.
- Support-referral card for financial-distress signals.
- Exportable progress history.
- Cohort or employer join codes instead of individual invites.

## Recommended Hackathon Stack

Use a TypeScript-first stack. The product needs fast UX iteration, streaming AI responses, a reliable points ledger, and auditable compliance checks more than it needs a heavyweight autonomous-agent platform or a real financial-data integration layer.

### Primary recommendation

- **App framework:** React + Vite, built mobile-first as a responsive web app (PWA)
- **UI:** Tailwind + shadcn/ui
- **AI streaming:** Vercel AI SDK
- **Agent loop:** Vercel AI SDK `ToolLoopAgent` or a small custom bounded loop per challenge attempt
- **Model providers:** Anthropic and/or OpenAI through Vercel AI SDK providers
- **Database / realtime backend:** Convex, for the points ledger, leaderboard, and live UI updates
- **Background jobs:** Trigger.dev or Inngest for scoring and recap generation off the request path
- **Observability / eval traces:** Langfuse
- **Retrieval:** none required for MVP — challenge content is seeded and static, not searched

### Why this stack

- **Vercel AI SDK** gives the best Next.js streaming and provider abstraction for generating the recap in real time.
- **Convex** gives fast realtime state for the leaderboard — points changing live as peers complete challenges — plus server actions and simple persistence without heavy backend setup.
- **Trigger.dev / Inngest** keeps scoring and recap generation out of the request path so the challenge-completion screen stays fast.
- **Langfuse** makes agent runs, prompt versions, and Compliance Guardrail decisions inspectable — useful both for debugging and for demonstrating the compliance boundary to judges.

### What not to use first

- Do not start with a real bank or brokerage integration (for example, Plaid). The MVP is explicitly scoped to have no institution integration, and adding one burns hackathon time on compliance and auth instead of the core loop.
- Do not start with a native mobile app. The mobile-first design doc scopes the MVP to a responsive web app; native is a later evaluation, not a build target now.
- Do not start with LangGraph unless the team already knows it. The agent chain here — Sequencer → Scorekeeper → Recap Writer → Standings Framer → Compliance Guardrail — is a short bounded pipeline, not a long-running stateful graph.
- Do not build a custom leaderboard ranking service from scratch before validating the loop. Derive rank from the points ledger with a simple query first.

### Later alternatives

- **Mastra:** a reasonable TypeScript-native upgrade if the agent pipeline grows built-in workflows, evals, and memory needs.
- **Supabase/Postgres:** worth it later if row-level security, SQL reporting, or an eventual employer/cohort admin view matter more than hackathon speed.
- **Plaid or similar:** only once the product intentionally moves past the MVP's explicit no-institution-integration boundary, with the compliance and consent work that requires.

For the hackathon, do not overbuild infrastructure. Make the challenge loop, the strict-format recap, and the compliance boundary legible.

## Implementation Plan

### Phase 1: Product Skeleton

Goal: Make the loop understandable before making it intelligent.

Tasks:

1. Initialize React + Vite app with Tailwind and shadcn/ui, mobile-first breakpoints from the start.
2. Add a Convex project and seed one demo user profile.
3. Create an intro screen with one sentence: "You just got paid. Let's make the first move count."
4. Add the non-advice disclosure.
5. Seed 4–6 challenges covering budgeting, saving, investing, and credit.
6. Build the challenge feed screen and a static leaderboard screen with seeded peers.
7. Build a placeholder recap screen showing the four-field strict format with static text.

Validation:

- A judge should understand the product in 20 seconds without explanation.
- A newgrad should immediately understand this is a game, not a financial advisor.

### Phase 2: Onboarding + First Challenge

Goal: Make the first session fast and get the newgrad to a completed challenge within minutes.

Tasks:

1. Build a single-screen signup (name, email or social login).
2. Route straight into the seeded first challenge — no profile questionnaire first.
3. Offer a peer-invite step after the first challenge, not before.
4. Track time-to-first-challenge as an analytics event.

Validation:

- Time-to-first-challenge should be measured in minutes, not screens.
- The peer-invite step should feel optional, not gating.

### Phase 3: Challenge Engine + Scoring

Goal: Turn a completed challenge into structured, gradeable signals.

Tasks:

1. Save each challenge attempt immediately to Convex `challenge_attempts`.
2. Run the Scorekeeper on submit: grade answers, compute score and points, identify missed concepts.
3. Write results to `scored_attempts`.
4. Commit points to the append-only `points_ledger`.
5. Update `streaks` on completion.

Validation:

- Score and points should be visible instantly on submit, with no perceptible lag before Phase 4 kicks in.

### Phase 4: Strict-Format AI Recap

Goal: Turn scoring signals into the product's core deliverable — the strict-format recap.

Tasks:

1. Send `scored_attempts` output to a Next.js streaming route using the Vercel AI SDK.
2. Run the Recap Writer to draft the four-field summary.
3. Run the Standings Framer to compute and draft the track-position field.
4. Save the draft to `ai_summaries` with `compliance_status: draft`.
5. Display the recap as a fixed-layout card — never a free-form chat bubble.

Validation:

- Every recap should render the same four fields in the same order regardless of challenge type or score.
- Output should reference specifics from the attempt (missed concept, points), not generic praise.

### Phase 5: Leaderboard + Peer Standings

Goal: Show compounding social value across sessions.

Tasks:

1. Build peer group creation and invite-code join flow.
2. Compute leaderboard rank live from `points_ledger` and `peer_group_memberships`.
3. Wire the Standings Framer's self-relative and peer-relative lines into both the recap card and a dedicated leaderboard screen.
4. Seed 3–5 demo peers with attempt history so the leaderboard has real movement in a demo.

Validation:

- The app should be able to say something like "You're 2 challenges ahead of last week" using real seeded data.

### Phase 6: Compliance Guardrail

Goal: Make the recap trustworthy and keep it inside the non-advice boundary.

Tasks:

1. Run the Compliance Guardrail on every draft `ai_summary` before display.
2. Emit the structured compliance JSON: format compliance, advice-language flag, escalation flag, rewrite notes.
3. Auto-rewrite soft violations (for example, overly directive language) and re-check.
4. Block and regenerate on hard violations rather than showing an unapproved recap.
5. Wire the escalation-signal check to the free-response fields and the static referral card.
6. Send Langfuse trace metadata for every run, including prompt version and compliance result.

Validation:

- No recap should reach the screen without a passing Compliance Guardrail run.
- At least one demo path should show a soft-rewrite example without making the demo feel alarming.

### Phase 7: Streaks & Retention Loop

Goal: Make the daily-return mechanic real, not decorative.

Tasks:

1. Add a visible streak indicator and an at-risk state (for example, "your streak ends in 4 hours").
2. Add one streak-freeze allowance to reduce anxiety around missing a single day.
3. If time allows, add a push or email nudge for streak-risk.

Validation:

- The at-risk state should be noticeable without being alarming or shame-based.

### Phase 8: Demo Polish

Goal: Make the challenge-to-recap loop memorable.

Tasks:

1. Animate the transition from "Checking your answers…" through to the recap card.
2. Show the Sequencer choosing the next challenge visibly, not silently.
3. Show the leaderboard updating live as a seeded peer "completes" a challenge during the demo.
4. Show one compliance rewrite example alongside a clean pass.
5. Add a one-tap "share my streak" or "invite a peer" action.

Validation:

- The demo should make the audience feel: "This is a game with a real compliance boundary, not a chatbot bolted onto a quiz."

## Example Output Format

After a completed challenge, show:

### What you did

Neutral statement of the challenge completed (for example, "You completed Credit Utilization 101.")

### Score

Plain score statement (for example, "4 / 6 correct — 40 points earned.")

### Next step

One specific, concept-grounded action (for example, "Review how utilization ratio is calculated — it's the concept you missed twice.")

### Track position

Self-relative and, when motivating, peer-relative standing (for example, "You've now completed 5 challenges this week, up from 2 last week. You're 30 points behind Marcus — one more challenge closes the gap.")

### Compliance note

A short, reassuring line that the recap was checked (for example, "Checked for accuracy — this is education, not advice.")

## Safety, Ethics, and Trust

This product touches personal finances, self-comparison against peers, and money-related stress. It must be careful even without handling real account data.

Rules:

- Never claim to be a licensed financial advisor or imply the recap is personalized financial advice.
- Never generate a personalized dollar-amount recommendation tied to the user's real income, debt, or accounts — the product doesn't have that data, and shouldn't invent it.
- Never let the leaderboard expose balances, debt, income, or raw challenge answers — points, streaks, and rank only.
- Never use last place or a widening gap as the entire framing of a standings line without a path forward.
- Always keep the four-field recap format fixed; never let a single response deviate into free-form chat.
- Always route detected financial-distress signals to a static referral, never an AI-generated response.
- Make it clear, upfront, that the product does not connect to real bank or brokerage accounts.

Recommended user-facing copy:

> "This is a game, not a financial plan. Your recap is here to teach one concept at a time — not to tell you what to do with your actual money."

Recommended non-advice boundary copy:

> "finfy is a financial literacy game, not a licensed advisor. If you're dealing with a real financial emergency, we'll point you to real help — we won't try to solve it ourselves."

## Hackathon Judging Angle

Why this can win:

- It has a clear, universal human moment: the first paycheck.
- It uses a multi-agent pipeline for a real reason — sequencing, scoring, writing, framing, and compliance are genuinely different jobs — not decoration.
- It creates a daily-return mechanic (streaks plus a real-peer leaderboard) that most financial-literacy content completely lacks.
- The strict-format recap is a legible, demoable "aha" — the same four fields, every time, immediately trustworthy.
- It draws a credible non-advice boundary instead of pretending to be a financial planner, which is the difference between a toy demo and something a compliance-aware judge will take seriously.

Judge-friendly sentence:

> "Most financial literacy apps start with content. finfy-literacy starts with the one day a newgrad is actually motivated — the first paycheck — and turns that into a daily habit with a strict-format AI recap and a real-peer leaderboard."

## Risks

### Risk 1: It reads like a generic budgeting app

Mitigation: Lead the demo with the gamified loop (points, streak, real-peer leaderboard) and the strict-format recap, not with static lesson content.

### Risk 2: The leaderboard feels discouraging or exposes financial shame

Mitigation: Points, streaks, and rank only — never balances or debt. The Standings Framer defaults to self-relative framing and never states a raw last-place rank without a path forward.

### Risk 3: The AI recap drifts into financial advice

Mitigation: The Compliance Guardrail runs on every recap, enforces the fixed schema, and blocks or rewrites advice-like or personalized-dollar-amount language before display.

### Risk 4: Cold-start peer groups — a newgrad has no peers yet

Mitigation: Offer the peer-invite step after the first challenge, not as a gate before it; fall back to a default cohort or a solo-with-streak experience until peers join.

### Risk 5: Content feels generic instead of relevant to the newgrad's actual job

Mitigation: Ship the fixed track first to validate the format, then A/B test job/industry personalization per the Phase 0 Custom Courses track.

### Risk 6: Streaks create anxiety or burnout instead of habit

Mitigation: Include a streak-freeze allowance and gentle at-risk messaging instead of guilt-based copy.

### Risk 7: Financial-distress signals get mishandled

Mitigation: Detection routes only to a static, pre-approved referral card — never an AI-generated response — and the scope is disclosed upfront as a referral, not intervention.

## Open Questions

1. What is the exact strict-format schema (field lengths, whether track position always includes a peer-relative line) and who owns changing it once it ships?
2. Should difficulty adapt to demonstrated performance, or stay on a fixed track through the MVP?
3. What defines a "real peer group" at signup, and what happens to a newgrad who has no peers yet?
4. Does the leaderboard need a visibility opt-out given the sensitivity of financial-progress-as-proxy-for-financial-standing?
5. Should the leaderboard reset periodically to stay fair for late joiners, or stay cumulative?
6. What is the minimum viable onboarding — email/social login only, or a lightweight job/industry step to seed personalization?
7. What exact detection categories and referral resources belong in the Support & Escalation layer for a hackathon-stage demo?

## Recommended Next Step

Build a thin vertical slice around one newgrad:

1. Non-advice disclosure on first open.
2. Single-screen signup straight into the first seeded challenge.
3. Challenge completion with Scorekeeper grading.
4. Strict-format recap from the Recap Writer.
5. Seeded peer group with 3–5 demo peers and a live leaderboard.
6. Standings Framer's self-relative and peer-relative lines.
7. Compliance Guardrail pass, including one visible soft-rewrite example.
8. Streak indicator with an at-risk state.
9. One next-day return moment — streak protection or the recap's next step.

Do not build a job/industry personalization layer first. Do not build bank integration first. The winning demo is the moment a newgrad completes a two-minute challenge and immediately gets a specific, trustworthy recap and sees themselves move on a leaderboard against people they actually know.
