---
title: "feat: Brilliant-style interactive Financial Literacy course — implementation plan & frontend specification"
type: feat
status: planning
date: 2026-07-18
origin: prompt — Brilliant.org-inspired course designer brief
references:
  - docs/audit/brilliant-references-png/ (Brilliant home + course-path screenshots, 2026-07-18)
  - reference video "2026-07-18 07-27-00.mp4" (full Brilliant session: onboarding → The Scheduling Problem lesson → practice set → streak commitment)
  - https://blog.brilliant.org/hand-crafted-machine-made/ (Brilliant AI game-generation article)
  - docs/plans/2026-07-16-001-market-gap-requirements.md (first-paycheck reframe, MR-1…MR-10)
  - docs/design-system-2026-07-15.md (existing shape grammar: squircle = tap, pill = read)
relationship: >
  Extends the first-paycheck reframe (MR-1..MR-10) with a concrete Brilliant-class lesson engine.
  Does not rewrite origin.md or the architecture plan. Frontend-only specification; no backend,
  bank integration, or personalized financial advice is proposed (MR scope boundaries apply).
---

# Financial Literacy — Brilliant-class Interactive Course

> **Agent prompt (2026-07-22):** For a copy-pasteable **frontend-only recreation** of `docs/audit/brilliant-references-png/`, use [`2026-07-22-002-brilliant-frontend-recreation-prompt.md`](./2026-07-22-002-brilliant-frontend-recreation-prompt.md). This file remains the long-form course/content specification.

**Internal design specification** for product designers, learning scientists, frontend engineers, motion designers, and AI engineers building the flagship onboarding course of finfy-literacy.

**Audience:** new graduates (21–27) receiving their first paycheck. Singapore-first market (CPF chapter; SGD throughout). All figures in lessons are *simulated parameters*, never advice (MR-8, scope boundaries).

---

## Table of contents

1. Product vision
2. Learning philosophy
3. Reference reverse-engineering: what the video actually shows
4. Design-language inference from screenshots
5. Complete course map
6. Lesson specifications (per-chapter flagship lessons)
7. Interactive mechanics library
8. AI-generated learning framework
9. Puzzle generation framework & schema
10. Frontend information architecture
11. Design system
12. Component library
13. Motion specification
14. Technical architecture
15. Wireframes
16. Mobile-first interaction specification
17. Accessibility
18. Gamification & intrinsic motivation
19. Success metrics
20. Engineering roadmap
21. Future expansion

---

## 1. Product vision

**One sentence:** the night your first paycheck lands, this course makes money *manipulable* — you drag it, break it, watch it compound, and walk away with intuitions no article could give you.

Brilliant's insight (from the hand-crafted/machine-made article) is the Mario principle: *you don't get a text box saying "you pressed jump too early" — you fall in the pit and die.* Applied to money: you don't read "emergency funds matter." You skip building one, a simulated laptop dies in month three, and you watch your simulated self swipe a credit card at 26.8% APR. The pit is simulated; the intuition is real.

We are explicitly **not** building:

- a Duolingo clone (streak-first, content-thin, gamification carries the load),
- a Khan Academy clone (video-first, passive),
- an LMS (module → quiz → certificate).

We are building a **manipulative-first lesson engine**: every screen is a small machine the learner operates, with a `Check` button that grades against visible criteria, failure states that show *consequences*, and AI that manufactures infinite parameter variations under human pedagogical direction — exactly the division of labor Brilliant describes: *authors own the learning objective, progression, and aha moment; AI owns technical implementation and variation.*

**Why this wins for first-paycheck users (ties to MR-1/MR-3):** the first paycheck is the one moment finance stops being theoretical. A person holding $3,700 of real money does not want a course library; they want to *rehearse the decision they're about to make tonight*. Interactive simulation is rehearsal. Passive content is not.

---

## 2. Learning philosophy

Five commitments, each traceable to cognitive science and to observable Brilliant behavior in the reference video.

### 2.1 Learn by doing (enactive encoding)

Every concept is taught through manipulation, because motor + visual + semantic encoding produces stronger memory traces than reading alone (dual-coding, Paivio; testing effect, Roediger & Karpicke). Concretely: **no screen in the course may consist of more than 2 short paragraphs without an interaction.** The video shows Brilliant's ratio: even "explanation" screens carry an interactive artifact — the pseudocode reveal appears *below the schedule the learner just solved*, annotating their own actions.

**Enforcement rule for authors:** if a screen can be understood with the hands in the lap, redesign it.

### 2.2 One cognitive idea per screen

Working memory holds ~4 chunks (Cowan, 2001). Each screen teaches exactly one mental model, phrased as a *decision question*, not a topic:

| ❌ Topic | ✅ Screen-sized idea |
|---|---|
| Budgeting | Which expense moves first when income drops? |
| Emergency funds | How many months does this buffer actually buy you? |
| Credit cards | What does "minimum payment" cost over a year? |
| Investing | Which portfolio survives inflation? |
| CPF | Where did the missing $740 of your paycheck go? |

The video confirms Brilliant's granularity: "The Scheduling Problem" spends **four consecutive screens on the same canvas**, escalating one constraint at a time (no conflicts → leave only 2 rejected → accept 3 + none past 3pm → maximize). One idea per screen ≠ one screen per idea.

### 2.3 Progressive discovery: Predict → Experiment → Observe → Reflect → Generalize

The answer is never shown first. The canonical loop per lesson:

```
PREDICT      "Which allocation survives the month?"   (commitment before evidence)
EXPERIMENT   drag / tap / slide on the manipulative
OBSERVE      simulation runs; consequences animate
REFLECT      "Why did the 50/30/20 split fail here?"  (tutor bubble / MCQ)
GENERALIZE   the rule is revealed as a description of what you just did
```

Prediction-before-feedback is the highest-leverage step: committing to a guess creates the hypercorrection effect — confident errors, once corrected, are remembered best (Butterfield & Metcalfe). The video's generalization move is the model: after the learner solves scheduling by hand, Brilliant shows `sort meetings by end / for meeting in meetings…` — *you already executed this algorithm.* Our equivalent: after the learner manually rescues three simulated months, reveal "pay yourself first" as pseudocode of their own behavior.

### 2.4 Immediate, legible feedback

Every interaction mutates visible state within 100ms (perceived instantaneity, Nielsen). Money must be *watchable*: cash flows animate as particles, savings bars grow, interest accretes in ticks, the credit-score dial swings. The video's grading pattern is adopted wholesale: **criteria lists that grade themselves** — the constraint checklist (`→ No conflicts`) flips to `✓` (green) or `✗` (red) per criterion on Check, so feedback is diagnostic, not binary.

### 2.5 Learning through failure (consequence engine, not red X)

Wrong answers trigger *simulated consequences*, then explanation:

```
You bought the new iPhone ($1,600)
  → emergency fund bar drains to $200
  → month 3: clinic bill event card slides in ($480)
  → credit card balance appears, grows at 26.8% APR tick by tick
  → tutor: "The phone didn't cost $1,600. Trace what it actually cost."
```

The video shows Brilliant's failure grammar precisely, and we adopt it: the **entire lesson frame turns amber** (not just the widget), wrong selections re-tint amber, still-valid ones dim to gray, the mascot says "Not quite right," and the actions become `Get help` + `Try again`. Failure is a *mode of the whole surface*, calm and recoverable — never a buzzer. There is no lives/hearts system: retries are free and immediate, because errors *are* the pedagogy; punishing them teaches answer-guessing, not thinking.

---

## 3. Reference reverse-engineering

Frame-by-frame analysis of the 5½-minute reference video (33 sampled frames). This section is the contract for what we replicate: the **interaction model**, not the pixels.

### 3.1 Inventory of observed mechanics

| # | Observed in video | Underlying interaction model | Our adoption |
|---|---|---|---|
| V1 | Lesson opens full-screen inside a rounded "lesson card" frame: `✕` close (top-left), flag/report icon, audio toggle, segmented progress bar top-center, XP/star counter top-right | Lesson player is a *focused modal surface*; chrome minimal and constant | `<CoursePlayer>` shell (§12) with identical chrome |
| V2 | Title screen: illustration + lesson name + one-sentence framing + `Continue` | Low-stakes on-ramp; screen 1 is the only interaction-free screen | `<LessonIntro>` |
| V3 | Prompt + **constraint checklist** (`→ No conflicts`, `→ Leave only 2 rejected meetings`) above a manipulable canvas | Success criteria are a *visible contract* before acting; checklist doubles as rubric | `<CriteriaList>` — core pattern on every puzzle |
| V4 | Canvas: schedule grid; tapping a meeting toggles accept (bright blue) / reject (dim navy); `Start over` reset below | Direct manipulation of binary-state objects; cheap reset invites experimentation | `<SimulationCanvas>` tap-toggle objects |
| V5 | `Check` disabled until first interaction; grades on demand, not per-action | Learner controls when to be judged → safe exploration | `checkable` state machine (§6 template) |
| V6 | **Failure:** whole frame border + glow turns amber; wrong blocks amber, kept-correct dim gray; mascot "Not quite right."; buttons become `Get help` + `Try again` | Failure = surface-wide mode; diagnosis shown *on the artifact*; help is opt-in | Amber failure mode (§11, §13) |
| V7 | **Success:** frame glows green, `Correct! 🎉` bottom-left, criteria flip to green checks, `+15` XP chip pops, `Continue` fills green | Celebration brief, localized, non-blocking | Success mode + `<XPChip>`; confetti rules §13.6 |
| V8 | Same canvas, escalating constraints across 4 screens ("Alright, try this one.", "One more.") | Constraint laddering = difficulty ramp with zero new-UI cost | "Constraint ladder" authoring pattern (§9) |
| V9 | Generalization screen: solved schedule + pseudocode `sort meetings by end…` | Rule revealed as description of the learner's own procedure | `<GeneralizationCard>` ends every lesson |
| V10 | Practice set after lesson: dot progress (●●○), MCQ variants of the same visual, identical Check grammar | Practice = same schema, new parameters, lighter interactions | AI-generated practice sets (§8) |
| V11 | Mascot (green blob) docked bottom-left, speech bubbles, chat + mic buttons | Ambient AI tutor: proactive one-liners, reactive on demand | `<TutorAvatar>` + `<HintPanel>`; voice deferred to v2 |
| V12 | Session end: "Nice work today! Keep it up." + lightning/XP tally animation | Session close ritual — small, not grandiose | `<SessionSummary>` |
| V13 | Streak commitment: 3-day "Great" / 7-day "Amazing" / 14-day "Phenomenal", `Commit to my goal` | Self-set goal commitment (intrinsic > imposed) | Adopted with meaning-guard (§18) |
| V14 | Onboarding: full-bleed serif question, icon chip grid, single `Continue`; "YOUR LEARNING PLAN" white preview cards (`REINFORCE SKILL` tag) | One question per screen; plan preview builds buy-in | `<Onboarding>` rework of existing screen |
| V15 | Home: greeting, "What do you want to learn?" ask bar, energy/streak week widget, small league leaderboard, "Jump back in" hero card + per-level lesson chips | Home = resume-first, social-second | §10 IA |
| V16 | Course page: overview card (22 Lessons · 220 Exercises) + vertical path of 3D disc nodes (done = purple check disc, current = glowing white disc + green gem, locked = gray), sticky `Start` CTA | Path metaphor with exactly one "current" node | `<CoursePath>` |

### 3.2 The five load-bearing patterns

Everything above compresses to five patterns; drop one and it is not Brilliant-class:

1. **Visible contract** — criteria shown before interaction, graded per-criterion after.
2. **Judged on demand** — free manipulation, explicit `Check`, free `Try again`.
3. **Surface-wide affect** — border, glow, buttons, mascot enter success/failure mode together.
4. **Constraint ladder** — one manipulative, many screens, one new constraint each.
5. **Generalize from the learner's own actions** — the rule arrives last, as a mirror.

---

## 4. Design-language inference

From `docs/audit/brilliant-references-png/` (dark Home + course path) and the video (lesson player, onboarding):

- **Near-black canvas, not gray:** app background ≈ `#0A0A0C`; cards `#17171A`–`#1C1C20`, 1px `#2A2A30` borders, generous 20–24px radii. Darkness lets the few saturated accents (purple CTA, green success, lime energy) carry all meaning.
- **One accent per semantic job:** purple = courseware/progress; green = correctness & mascot; lime = energy/XP/streak; amber = "not yet"; **blue = neutral manipulable objects** on canvases. Note: the video's schedule blocks are blue *until grading recolors them* — manipulables must never pre-empt the feedback palette.
- **Two-voice typography:** serif display for big framing questions in onboarding (a "book-like" moment of address); geometric sans for all UI and lesson content. Lesson prose is small and calm (15–16px) — the *canvas* is the loud element, never the text.
- **Soft-3D object language:** path nodes are extruded discs; CTAs have a darker bottom edge (pressable "gummy" feel); illustrations are chunky isometric purple objects. Flat UI, dimensional *objects* — things you touch look touchable.
- **Lesson-player buttons are full pills** (radius 999) whose fill encodes state: white idle → green success → amber `Try again`. See §11.4 for reconciliation with the repo's existing squircle grammar.
- **Progress is ambient and honest:** thin segmented bar (lesson), dots (practice), path discs (course), lightning week-widget (home). Position always visible, never nagging.

---

## 5. Complete course map

**Course:** *Financial Literacy* — 13 chapters, 40 lessons, ~360 exercises (AI-extended). Chapter 1–2 ship in v1 (the "payday night" wedge, MR-1); the rest follow the roadmap (§20).

Narrative spine: the learner plays **their own first year of salaried life**, month by month. Chapters are life events, not textbook units.

| # | Chapter | Screen-sized core question | Mental models built | Top misconceptions attacked | Primary mechanic (→§7) | Flagship component | AI generation surface |
|---|---|---|---|---|---|---|---|
| 0 | Introduction: The Night It Lands | What actually happened when $3,700 appeared? | Money as flows, not a number; stocks vs. flows | "My salary is mine to spend" | Paycheck Waterfall (M1) | `<FlowCanvas>` | salary, deduction rates, currency of story details |
| 1 | Your First Paycheck | Gross → net: where did $740 go? | Deductions as slices; net ≠ gross; payslip literacy | "CPF is a tax I lose" | Payslip Detective (M1 variant) | `<PayslipPuzzle>` | salary bands, deduction line-items, decoy line-items |
| 2 | Budgeting | Which expense moves first? | Fixed vs. flexible; pay-yourself-first; zero-based allocation | "Budget = tracking every coffee" | Budget Sandbox (M2) | `<BudgetCanvas>` | bills, amounts, income shocks, category mixes |
| 3 | Emergency Funds | How many months does this buffer buy? | Runway; liquidity vs. return; probability of shocks | "Insurance/credit card = my emergency fund" | Emergency Scenario Generator (M7) | `<ScenarioGenerator>` | shock events, magnitudes, timing, sequences |
| 4 | Credit Cards | What does "minimum payment" cost in a year? | Compounding against you; utilization; grace period | "Minimum payment = suggested payment" | Credit Card Simulator (M3) | `<DebtSimulator>` | APRs, balances, payment strategies, teaser offers |
| 5 | Taxes | Why doesn't a raise get "eaten by tax"? | Marginal vs. effective rate; brackets as staircase; reliefs | "Entering a higher bracket taxes ALL my income" | Bracket Staircase (M9) | `<BracketStaircase>` | incomes, bracket edges, relief scenarios |
| 6 | CPF | Is the 20% gone, or moved? | Forced savings; OA/SA/MA buckets; employer top-up as invisible raise; long horizons | "CPF money is lost money" | CPF Flow Machine (M1 variant) | `<FlowCanvas>` preset | salaries, allocation ages, horizon lengths |
| 7 | Insurance | What's the price of a $200k risk you can't absorb? | Expected loss vs. catastrophic loss; premiums buy certainty; insure the irreplaceable | "Insurance is a bad bet because I probably won't claim" | Risk Roulette (M7 variant) | `<RiskWheel>` | event probabilities, premiums, coverage tiers |
| 8 | Investing | Which portfolio survives inflation? | Real vs. nominal; risk/return; diversification; time in market | "Investing = picking winning stocks" | Investment Puzzle (M5) + Compound Interest Lab (M4) | `<PortfolioSorter>`, `<CompoundLab>` | return sequences, inflation paths, portfolio mixes |
| 9 | Debt | Which loan do you kill first? | Avalanche vs. snowball; interest as rent on money; good vs. bad leverage | "All debt is equal / all debt is evil" | Debt Stack (M2 variant) | `<DebtStack>` | loan sets (APR, balance, min-payment), windfalls |
| 10 | Lifestyle Inflation | Your raise arrived — who spends it? | Hedonic adaptation; savings-rate > salary; ratcheting costs | "I'll save when I earn more" | Raise Allocator timeline (M6) | `<TimelineCanvas>` | raise sizes, upgrade temptations, 10-yr projections |
| 11 | Salary Negotiation | What does one "yes" compound into? | Anchoring; BATNA; lifetime value of first-offer delta | "Negotiating will make them rescind the offer" | Negotiation Tree (M8) | `<ChoiceGraph>` | employer personas, offer ranges, counter scripts |
| 12 | Long-Term Wealth | What does tonight's decision look like at 65? | Compounding over decades; sequence of habits > windfalls; net-worth trajectory | "Wealth = income" | Financial Timeline (M6) capstone | `<TimelineCanvas>` capstone | life-event decks, market sequences, goal targets |

**Chapter design invariants**

- Every chapter = 2–4 lessons; every lesson = 5–9 screens; every screen = one idea (§2.2).
- Every lesson runs the Predict→…→Generalize loop exactly once at lesson scale, and `Check`-loops many times at screen scale.
- Every chapter ends with a **Consequence Story** (§2.5): a scenario where the learner's earlier wrong choice is allowed to play out safely.
- Misconceptions listed above are *targeted by design*: each has at least one screen engineered so the misconception produces a visible, surprising failure (that's the aha moment — surprise is the trigger for belief revision).

---

## 6. Lesson specifications

Full template applied to each chapter's flagship lesson. (Remaining lessons per chapter are parameter/constraint variations authored via §9; the schema makes them cheap.)

Common state machine (all lessons; matches video V3–V8):

```
IDLE ──interact──▶ DIRTY ──Check──▶ EVALUATING ──all criteria pass──▶ SUCCESS ──Continue──▶ next screen
 ▲                   │                    │
 │                   │                    └─some fail──▶ FAILURE ──Try again──▶ DIRTY (state preserved)
 │                   └─Start over──▶ IDLE                  │
 │                                                        └─Get help──▶ HINT_OPEN ──close──▶ FAILURE
 └────────────────────────────(reset)─────────────────────┘
Check button: disabled in IDLE · enabled in DIRTY · replaced by [Get help][Try again] in FAILURE · [Continue] in SUCCESS
Hints escalate: h1 reframe → h2 point at violated criterion → h3 worked sub-step. Never the answer.
```

Common feedback spec (all lessons; overrides noted per lesson):

- **Success:** frame border+glow → green over 250ms; criteria flip to ✓ with 60ms stagger; `Correct!` + party-popper icon fades in bottom-left; `+n` XP chip springs from Check button to counter (450ms); Continue fills green. Sound: soft two-note rise (~120ms). Confetti only at lesson end, not per screen (§13.6).
- **Failure:** frame → amber over 250ms; offending objects re-tint amber, valid ones dim to 40%; mascot bubble microcopy (varied: "Not quite right." / "Close — one thing's off." / "Worth another look."); buttons swap to `Get help` + `Try again`. Sound: single low soft tone. **Never shake, never buzz** — failure is information.
- **Reflection:** post-success one-liner under the artifact ("Notice: rent didn't move. Fixed costs never do — that's why they're dangerous.").

---

### 6.0 Ch.0 flagship — "The Night It Lands"

**Learning goal (intuition):** a paycheck is not a number, it's a *flow* that must be routed; unrouted money routes itself (to spending).

**Story:** 9:02pm, payday. Phone buzzes: `SALARY CREDIT — $3,700.00`. Three group chats light up: dinner Friday, a BTO-savings meme, an iPhone launch. What do you do *tonight*?

**Interactive puzzle:** Paycheck Waterfall. $3,700 appears as a stream of coin-particles flowing from a "Salary" source at top into one default bucket: **Spending**. Learner drags pipe-junctions to split the stream into buckets (Save, Emergency, Invest, Spend). Buckets fill live; a 30-day fast-forward scrubber shows Spend bucket leaking (daily life costs drain it) while others hold.
Screens: (1) intro; (2) *predict* — "With no routing, how much is left on day 30?" slider guess; (3) watch default flow, compare to guess; (4) add one pipe: route $500 to Save before spending — replay month; (5) constraint ladder: `→ End month ≥ $800 saved` `→ Never let Spend hit $0 before day 30`; (6) generalize.

**State machine deltas:** scrubber disabled during EVALUATING; on FAILURE, the day the Spend bucket hit $0 is pinned with an amber marker (diagnosis on the artifact, V6).

**Feedback:** particle stream is continuous (the money "feels" kinetic); bucket fill levels are the score. Prediction slider ghost stays visible so the observe step *is* the prediction correction (hypercorrection, §2.3).

**AI generation:** salary (band $2.8k–$5.5k), fixed drain rate, temptation events on the scrubber timeline, target thresholds, story texture (chat messages). Solver: trivially verifiable arithmetic → every generated instance auto-validated solvable (§9.4).

**Generalization card:** `route(salary): first save, then spend what remains` shown beside their pipe layout — "You just built pay-yourself-first. Most people run the reverse: spend, then save what remains — you watched what remains: $0."

**Why interactive beats prose here:** "pay yourself first" is a cliché every graduate has heard; hearing it changes nothing. *Watching your own unrouted stream evaporate on a scrubber you control* converts the cliché into a mechanism. The aha is the day-30 comparison against their own optimistic prediction.

---

### 6.1 Ch.1 flagship — "The Case of the Missing $740"

**Learning goal:** read any payslip; know gross→net; feel employer CPF as an invisible raise.

**Story:** your payslip PDF arrives. Contract said $3,700. Bank shows $2,960. Your groupchat: "bro where did $740 go 😭"

**Interactive puzzle:** Payslip Detective. A payslip with **draggable magnifier**; tapping each line item (Basic, Employee CPF 20%, Employer CPF 17%, deductions) flips a card explaining it — but three line items are **decoys** (fake fees). Constraint list: `→ Flag every line that should NOT be there` `→ Rebuild net pay from gross using the tiles` (drag arithmetic tiles: `3700 − 740 = 2960`). Final screen: toggle "Show employer contribution" — total compensation bar grows *above* gross: "$4,329. You were paid more than your contract number."

**State machine:** tap-to-flag toggles; Check grades flags + rebuilt equation separately (two criteria rows).

**Feedback:** flagged decoys stamp `NOT REAL` in red; the employer-CPF reveal uses a 400ms bar-growth with overshoot — this is the chapter's aha and gets the biggest animation in the chapter.

**AI generation:** salary, CPF rates by age band (content team verifies current statutory rates before publish — rates are data, not code), decoy line-items (drawn from a curated decoy bank: "processing fee", "payroll admin"), currency formats. Difficulty = number/subtlety of decoys.

**Why interactive:** payslip literacy taught as reading = forgettable list. Taught as *fraud detection game* = the learner actively interrogates every line, which is exactly the real-world behavior we want on their real payslip this month (MR-3: tied to a live decision).

---

### 6.2 Ch.2 flagship — "The Month That Fights Back"

**Learning goal:** budgets are pre-decisions; flexible expenses are shock absorbers, fixed expenses are commitments; a budget that ignores shocks is fiction.

**Story:** you set your first monthly plan. The month has other ideas.

**Interactive puzzle:** Budget Sandbox (mechanic M2). Expense chips (Rent $900, Transport $128, Food $520, Gym $80, Subscriptions $47, Fun $400…) are dragged into **Fixed / Flexible / Cut** zones; a live savings bar shows `income − committed`. Then the month *runs*: week by week, events fire (birthday dinner $60; shoes sale $120). Mid-month shock: `Income −$300 (unpaid leave)`. Constraint: `→ End the month ≥ $0` `→ Savings ≥ 15%` `→ Rent must be in Fixed` — the learner discovers only Flexible chips can shrink when the shock lands; if they classified Food as Fixed, they're stuck (that *is* the lesson).
Ladder screens: (a) classify only; (b) survive a small shock; (c) survive shock + keep savings ≥15%; (d) *maximize* savings subject to a "quality of life ≥ 3 Fun chips" constraint (teaches budgets aren't austerity).

**State machine:** chips snap to zones (drag on touch, tap-to-cycle zones as accessible alternative); `Start over` restores initial layout; on FAILURE the un-shrinkable chip that blocked survival pulses amber.

**Feedback:** savings bar animates on every drop (≤100ms); week-ticks advance with a soft click; shock events slide in as red-edged cards with 200ms hold *before* their amount applies (dread beat — anticipation is affect, affect is memory).

**AI generation:** chip sets (localized: kopi, GrabFood, Netflix, gym), amounts, shock type/size/timing, constraint thresholds. Solver: greedy check that a valid classification exists with ≥ required slack (auto-reject unsolvable instances).

**Why interactive:** classification-under-shock cannot be experienced in text. The aha is the moment the shock lands and the learner *reaches for a chip that won't shrink* — a felt experience of "fixed costs are dangerous" that transfers to real rent-vs-food decisions.

---

### 6.3 Ch.3 flagship — "Runway"

**Learning goal:** an emergency fund is measured in *months of survival*, not dollars; it converts catastrophes into inconveniences.

**Story:** month 4 of working life. You have $1,800 saved. Life draws three cards from the deck.

**Interactive puzzle:** Emergency Scenario Generator (M7). A face-down event deck (hospital $480 · laptop $1,350 · job loss 2 months · flight home $600 · phone screen $260). Learner first sets a **runway slider** (how many months of expenses to hold) then flips cards one at a time; a resilience meter shows fund absorbing hits — or breaking into a red "debt zone" where the credit-card APR counter from Ch.4 starts ticking (cross-chapter callback). Ladder: (a) fixed deck, find minimum runway that survives; (b) *probabilistic* deck (learner sees event probabilities, must choose runway before random draw — repeatable 10× to feel variance); (c) trade-off screen: every extra month of runway delays an Invest bucket — find the balance satisfying both constraints.

**Feedback:** card flip 300ms; absorbed hit = fund bar dents then settles; breaking hit = bar shatters (400ms) into debt zone. Running it 10× shows *distribution*, not anecdote — variance becomes visible.

**AI generation:** decks, magnitudes, probabilities, learner expense baseline (inherited from their Ch.2 sandbox → continuity), thresholds. Difficulty scales via tail-risk events.

**Why interactive:** probability cannot be read into intuition; it must be *sampled*. Ten fast replays of the same month with different draws is a Monte Carlo the learner runs with their thumb.

---

### 6.4 Ch.4 flagship — "The Minimum Payment Trap"

**Learning goal:** compounding works against you at 26.8% APR; minimum payments mostly pay interest; the statement is a bill for *time*.

**Story:** the iPhone from Ch.0 is back. You swipe. The statement arrives: "Minimum payment due: $52."

**Interactive puzzle:** Credit Card Simulator (M3). A card swipes (satisfying gesture — deliberate design: *the trap must feel good*, that's the point), balance $1,600 appears. A **payment dial** (min $52 ⟷ full $1,600) and a month `▶` button. Each press: interest tick animates *onto* the balance in red, payment subtracts in green; a stacked bar shows each payment splitting into interest-vs-principal. Predict screen first: "Paying minimum only — how many months to zero?" (slider: most guess ~3 yrs; answer ~4.5 yrs and ~$1,050 interest). Ladder: (a) run minimum to month 12, observe balance barely moves; (b) find the payment that clears in 6 months; (c) two cards (18% vs 26.8%) + one $300 windfall — where does it go? (sets up Ch.9 avalanche).

**State machine:** month button is the clock — time only advances when pressed (learner owns the simulation pace); FAILURE mode when constraint `→ Debt-free by month n` missed: the interest-paid counter glows amber and the tutor asks "Where did $612 go?"

**Feedback:** interest ticks have a slot-machine-like accretion sound *for the bank* — subtle, discomforting; the payment-split bar is the diagnostic artifact.

**AI generation:** APRs, balances, minimum-payment formulas, teaser offers ("0% for 3 months, then 28%") as advanced instances. Closed-form amortization → all instances auto-verifiable.

**Why interactive:** everyone "knows" credit interest is bad; nobody feels 4.5 years. The aha is the gap between their slider prediction and the simulated answer — hypercorrection working on a number they'll face within months.

---

### 6.5 Ch.5 flagship — "The Bracket Staircase"

**Learning goal:** marginal ≠ effective; only dollars *above* a threshold are taxed at the higher rate; a raise never reduces take-home.

**Story:** your friend refuses a $200 raise: "it pushes me into the next bracket, I'll earn less."

**Interactive puzzle:** Bracket Staircase (M9). Income is a vertical liquid column pouring over a staircase of brackets; each step tints its slice at its own rate. Learner drags an **income handle** up/down and watches per-bracket tax slices update live; an effective-rate readout (weighted blend) sits beside the top marginal rate. Predict first: "Raise $200 across the threshold — does take-home rise or fall?" Then drag and see. Ladder: (a) find the effective rate at $X; (b) the friend's claim — test it; (c) reliefs: drag a relief block to *lower the liquid level* and watch which bracket's slice shrinks (top one — reliefs are worth your marginal rate).

**Feedback:** each bracket slice fills with its own hue; crossing a threshold makes ONLY the new slice appear above it — the visual *is* the argument. Effective-rate number eases between values (no jumps).

**AI generation:** bracket tables (content-verified per jurisdiction/year — data not code), incomes, relief scenarios, MCQ variants ("Which raise changes your effective rate most?").

**Why interactive:** the bracket misconception survives every article ever written about it because prose describes the staircase; the manipulative lets the learner *pour income over it* and watch the myth fail to happen.

---

### 6.6 Ch.6 flagship — "The Three Buckets You Didn't Know You Had"

**Learning goal:** CPF isn't lost — it's routed into OA/SA/MA buckets with different jobs and horizons; employer contribution is money you'd never see otherwise.

**Story:** continuation of Ch.1: the $740 didn't vanish. Follow it.

**Interactive puzzle:** CPF Flow Machine (FlowCanvas preset). The Ch.0 waterfall re-appears — but now the "deductions" pipe (previously opaque) becomes glass: learner *taps to open it* and sees the stream split into OA / SA / MA with live percentages, plus the employer's separate stream joining in. Interactions: (a) match each bucket to its job (housing / retirement / healthcare) by dragging goal icons onto buckets; (b) horizon scrubber — drag from age 25 → 55 and watch SA compound at its rate vs. a "cash under mattress" ghost bar; (c) constraint puzzle: `→ Fund a $30k housing downpayment at age 30 using the right bucket`.

**Feedback:** opening the opaque pipe is the chapter's aha beat — 500ms glass-reveal animation, the single most theatrical moment in the course (earned: it resolves a mystery planted two chapters earlier).

**AI generation:** salaries, age-banded rates (content-verified), horizon scenarios, goal amounts. **Guard:** simulations state "illustrative rates" — no projections presented as promises (MR scope).

**Why interactive:** CPF resentment is an *opacity* problem. The mechanic is literally de-opacification — you cannot deliver that in text because text cannot be opened.

---

### 6.7 Ch.7 flagship — "The $200,000 Coin Flip"

**Learning goal:** insure catastrophic, self-insure trivial; premiums buy certainty, not profit; expected value is the wrong lens for ruin-sized risks.

**Story:** an agent (friendly, commission-based) offers you four policies over coffee. Which two do you take?

**Interactive puzzle:** Risk Roulette (M7 variant). A wheel of life events with visible probabilities and costs (phone screen 30%/$260 · hospitalization 2%/$40,000 · critical illness 0.5%/$200,000 · flight delay 20%/$300). Learner allocates a limited premium budget across policies, then **spins 20 simulated years** (fast, 200ms/spin after first 3). Two meters: wealth *and* a "wipeout" flag. Ladder: (a) insure everything → watch premiums eat wealth; (b) insure nothing → usually fine, until a 1-in-50 run wipes out (replay makes tail risk visceral); (c) find the allocation surviving 95% of 20-year runs. Generalization: 2×2 grid (frequency × severity) auto-plotted from *their* spin history.

**Feedback:** spins accelerate (first 3 slow with full animation, then time-lapse); wipeout = screen desaturates 60% for 800ms — the strongest negative beat in the course, reserved for the one concept where under-reaction is catastrophic.

**AI generation:** event sets, probabilities, premium menus, decoy policies (overpriced gadget insurance). Monte Carlo validation ensures target allocation exists (§9.4).

**Why interactive:** ruin risk is invisible in expectation and unforgettable in simulation. The learner must *lose a run* to feel why "I probably won't claim" is the wrong frame.

---

### 6.8 Ch.8 flagship — "Which Portfolio Survives?"

**Learning goal:** real returns matter, not nominal; diversification narrows outcomes; time in market beats timing.

**Story:** three colleagues brag about their portfolios. Ten years pass in ten seconds. Who's right?

**Interactive puzzle:** Investment Puzzle (M5) then Compound Interest Lab (M4). Part 1 — **sort** three portfolio cards (100% savings account · 100% single hot stock · diversified index mix) by predicted 10-yr outcome, then run the simulation with inflation ghost-line overlaid; ranking is graded per-criterion (`→ Correct order` `→ Which beat inflation?`). Repeat with a different random seed — the hot stock sometimes wins (honesty about variance; we grade the *reasoning* MCQ, not the lucky seed — process over outcome). Part 2 — the Lab: four controls (monthly contribution slider · years slider · return slider · inflation toggle) driving a live area chart with principal/growth color-split. Constraint screens: `→ Reach $100k real by 40 without contributing > $600/mo` (forces discovering the years lever beats the return lever).

**Feedback:** chart redraws continuously under drag (60fps, memoized series); inflation toggle *deflates* the curve with a sag animation — nominal optimism visibly punctured.

**AI generation:** return sequences (drawn from parameterized distributions, seeds logged for reproducibility), portfolio mixes, constraint targets, reflection MCQs. **Guard:** no real tickers, no named products, historical-style not historical-actual sequences (MR-8: never reward product usage).

**Why interactive:** compounding's exponential shape is precisely what System-1 linear intuition cannot extrapolate. Dragging the years slider and watching the elbow of the curve *move under your finger* is the correction.

---

### 6.9 Ch.9 flagship — "Kill Order"

**Learning goal:** rank debts by APR (avalanche) for math, by balance (snowball) for momentum — and know why you're choosing which.

**Story:** graduation gift: study loan $18k @ 4.5%, credit card $2.2k @ 26.8%, BNPL $600 @ 0% (with a $60 late-fee trap). A $500 windfall arrives monthly.

**Interactive puzzle:** Debt Stack. Three debt towers shrink as the learner drags each month's $500 across them; interest regrows each tick on whatever remains. Ladder: (a) free play 12 months, observe totals; (b) `→ Minimize total interest paid` (avalanche emerges); (c) `→ Zero debts fastest by count` (snowball emerges); (d) trap screen — BNPL's 0% flips to late-fee if ignored past month 3 (teaser terms are contracts, read them).

**Feedback:** each tower's interest regrowth animates as a red drip on month-tick; a running "interest paid" odometer is the score; on Check, per-strategy comparison bars appear (yours vs. avalanche vs. snowball).

**AI generation:** loan sets, windfall sizes, trap terms. Deterministic amortization → auto-validated; difficulty = number of debts + trap subtlety.

**Why interactive:** strategy comparison requires counterfactuals, and counterfactuals require simulation. The learner *plays* both strategies and sees the delta in their own odometer, not in a table someone else computed.

---

### 6.10 Ch.10 flagship — "The Raise That Disappeared"

**Learning goal:** lifestyle ratchets absorb raises silently; savings *rate* is the state variable that matters; upgrades are reversible only before they become baseline.

**Story:** month 14: promotion, +$600/mo. Twelve upgrade cards fan out: condo room +$400 · car +$800 · omakase habit +$150 · better laptop +$60 one-off…

**Interactive puzzle:** Raise Allocator on the TimelineCanvas (M6). Learner drags upgrade cards onto a 10-year timeline; each card permanently raises the expense baseline from its drop point (visualized as a rising floor under the wealth curve). Savings-rate readout updates live. Ladder: (a) spend it all — watch the floor swallow the raise and the wealth curve flatten to pre-raise slope (the title's aha); (b) `→ Keep savings rate ≥ pre-raise level while adding 2 upgrades`; (c) meet a $50k @ 5-yr goal — discover *timing* of upgrades matters, not just count.

**Feedback:** the rising expense floor is drawn as literal rising water under the curve; drop a heavy card and hear a low "thunk" as the floor jumps.

**AI generation:** raise sizes, upgrade decks (localized temptations), goal targets, one-off vs. recurring classification tests.

**Why interactive:** hedonic ratcheting is invisible day-to-day by definition. Compressing 10 years into a scrubbable curve makes the invisible slope difference between 20%→20% and 20%→9% savings rates a *shape you can see*.

---

### 6.11 Ch.11 flagship — "The Ask"

**Learning goal:** negotiation is expected, prepared, and compounding; anchors work; a rescinded offer is rare, an un-negotiated first salary compounds for decades.

**Story:** offer letter: $3,600. Market band you researched: $3,700–$4,100. The hiring manager is typing…

**Interactive puzzle:** Negotiation Tree (M8, `<ChoiceGraph>`). Branching conversation with 3–4 reply choices per node; an **outcome panel** (not a "confidence meter" theatre — panel shows anchor placed, information revealed, relationship temperature) updates per choice. Employer replies are authored templates with AI-filled surface text (§8.4 — bounded generation: the *tree* is hand-designed, the *wording* varies). Failure paths are playable to their ends: accept-first-offer branch jumps to a 10-year compounding coda showing the delta vs. the negotiated branch (ties to Ch.12). Ladder: (a) guided path with hints; (b) same manager persona, no hints; (c) new persona (budget-constrained — teaches asking for non-salary items: sign-on, leave, review-at-6-months).

**State machine:** DAG traversal; visited nodes render as a breadcrumb mini-map (learner can inspect the tree after completion — the *shape* of a negotiation is a generalization artifact).

**Feedback:** choice → manager "typing…" 600–900ms beat (real tension, deliberately not instant); good moves get subtle panel shifts, not jackpot sounds (negotiation is calm).

**AI generation:** personas, offer numbers, reply phrasings, post-hoc "what the manager was thinking" annotations per node (generated against author-written node intents).

**Why interactive:** scripts read in articles evaporate under stress. Branching rehearsal with a responsive counterpart is the closest safe rehearsal to the real conversation — and replaying to explore *rejected* branches teaches the possibility space, which no linear medium can.

---

### 6.12 Ch.12 capstone — "Sixty-Five"

**Learning goal:** integrate everything: early small habits dominate later large windfalls; your financial life is a system you now know how to operate.

**Story:** the full first-year save file — *their own choices* from Chapters 0–11 — loads onto a lifetime timeline.

**Interactive puzzle:** Financial Timeline capstone (M6). A 40-year canvas pre-seeded with their course decisions (Ch.2 savings rate, Ch.3 runway, Ch.8 contribution level, Ch.10 upgrades, Ch.11 negotiated delta). Life-event cards (wedding, BTO, kids, sabbatical, retrenchment at 45, market crash at 52) drag onto the line; net-worth curve re-solves live. Final constraints: `→ Survive the retrenchment without debt` `→ Retire by 62 at 70% expense replacement`. Then the single most important screen in the course: **the ghost curve** — the same 40 years re-simulated with the *default* (no-routing, minimum-payment, un-negotiated) choices from each chapter's failure branch. The gap between the two curves is the course's closing argument, built from the learner's own history.

**AI generation:** event decks, market sequences, replay variants ("re-run your life with a 2008-style crash at 30 vs. 60" — sequence-of-returns intuition).

**Why interactive:** the capstone's aha cannot exist in any other medium because its content *is the learner's own accumulated decisions*. This is the payoff of persisting choice-state across chapters (§14 data model) — the course literally ends by showing you yourself.

---

## 7. Interactive mechanics library

Reusable, parameterizable "game engines." Each is one React component family + one puzzle-schema type (§9); authors and AI compose instances.

| ID | Mechanic | Interaction verbs | Core state | Teaches (transferable model) | Used in |
|---|---|---|---|---|---|
| M1 | **Flow Canvas / Paycheck Waterfall** | drag pipes, tap to open, scrub time | source→bucket graph, flow rates | stocks vs. flows; routing precedes spending | Ch.0, 1, 6 |
| M2 | **Budget Sandbox / Zone Sorter** | drag chips between zones, tap-cycle | chip→zone map, live aggregate | classification under constraints; slack | Ch.2, 9 |
| M3 | **Debt/Credit Simulator** | dial payment, step months | balance, APR, payment split | compounding against you; amortization | Ch.4, 9 |
| M4 | **Compound Interest Lab** | 3 sliders + toggle | contribution/years/return/inflation | exponential vs. linear; real vs. nominal | Ch.8, 12 |
| M5 | **Sorter/Predictor** | rank cards, then simulate | ordering, seeded sim run | prediction → evidence; variance honesty | Ch.8, practice sets |
| M6 | **Timeline Canvas** | drag events onto years, scrub | event list, solved wealth series | long horizons; sequencing; ratchets | Ch.10, 12 |
| M7 | **Scenario/Event Deck** | flip cards, set slider first, respin | deck, probabilities, resilience meter | tail risk; sampling; runway | Ch.3, 7 |
| M8 | **Choice Graph** | tap replies, inspect map | DAG position, outcome panel | branching consequences; rehearsal | Ch.11 |
| M9 | **Staircase/Threshold Visualizer** | drag level handle, drop relief blocks | level vs. bracket table | marginal thinking; thresholds | Ch.5 |

Design rule: **9 mechanics, 40 lessons.** Brilliant's leverage (per the article: weeks on the core game, then AI-generated levels) comes from few deep mechanics × many instances — never one-off widgets per lesson. A new mechanic requires learning-science review; a new *instance* requires only schema + validation.

---

## 8. AI-generated learning framework

Division of labor copied from Brilliant's article, stated as law: **humans author objectives, progressions, mechanics, and aha moments; AI generates instances, variations, surface text, and hints — always machine-validated, always human-spot-reviewed.** "A single wrong problem can shake a learner's confidence or reinforce misconceptions" — correctness is existential, so nothing generated ships without passing a solver.

### 8.1 Parameter generation
Every mechanic exposes a typed parameter space (see schema §9). Generation = LLM proposes parameters inside authored ranges → deterministic solver validates solvability + pedagogical constraints (e.g. "avalanche and snowball orders must differ, else Ch.9 instance is degenerate") → rejected instances regenerate. Target: >90% first-pass validity (Brilliant reported 0%→93% on gear puzzles once representations became LLM-friendly — our schemas are designed LLM-friendly from day one: flat JSON, explicit units, no derived fields).

### 8.2 Scenario variation
Surface narrative (names, merchants, chat messages, employer personas) generated per instance from a tone-guide prompt; numbers come *only* from the validated parameter set (LLM never does arithmetic that reaches the learner). Localization (SG → other markets) is a scenario-variation dimension, with statutory data (CPF/tax tables) held in human-verified data files.

### 8.3 Adaptive hints
Three-tier ladder (reframe → point → worked sub-step) authored per screen as *intents*; AI instantiates them against the learner's actual state ("Your Food chip is in Fixed — can that shrink when income drops?"). Hints reference the learner's artifact, never generic tips. Tier-3 never reveals the final answer (mastery requires the learner closing the loop).

### 8.4 Bounded generation for narrative mechanics
Choice Graph nodes carry author-written `intent` + `constraints`; AI writes only the surface dialogue. The tree topology, outcome logic, and pedagogical beats are code-reviewed content.

### 8.5 Misconception detection
Each screen's failure space is partitioned into named misconception signatures (e.g. Ch.5: chose "take-home falls" → `bracket_cliff_myth`; Ch.4: predicted 3 months → `linear_interest_intuition`). Signatures update the learner model and steer the practice-set generator toward targeted variants (two more bracket problems, not random ones).

### 8.6 Partial credit
Per-criterion grading (V3 pattern) *is* partial credit: 2-of-3 criteria = targeted retry, not global failure. XP scales with criteria met on first Check.

### 8.7 Mastery estimation & knowledge graph
Concept nodes (≈120 across the course, e.g. `marginal_rate`, `liquidity_vs_return`, `apr_compounding`) with prerequisite edges. Per-node mastery via a simple Bayesian Knowledge Tracing update per graded criterion (P(known) updated by slip/guess params per mechanic). Practice-set selection = lowest-mastery nodes due for spaced review (expanding intervals: 1d/3d/7d/21d). The `<KnowledgeGraph>` UI (§12) renders this — collection instinct pointed at *concepts*, not badges (§18).

### 8.8 Personalized follow-ups & reflection
Post-lesson, generator produces 1–3 follow-up MCQs targeting that session's misconception signatures, plus one reflection prompt tying to real life without collecting financial data ("This week, find these three lines on your own payslip" — an action, not advice, MR-3/MR-8 compliant).

### 8.9 Difficulty progression
Difficulty is a computed property of parameters (documented per mechanic: e.g. M2 difficulty = shock size ÷ available slack). Generator targets flow band: retry rate 15–35% per screen (below = boring, above = frustrating); adjusts next-instance difficulty per learner.

### 8.10 Evaluation methodology (per Brilliant's practice)
- Golden set: 50 hand-authored instances per mechanic as regression anchors.
- Auto-evals on every generator/prompt change: solvability %, difficulty-band accuracy, constraint violations, readability.
- Human review: 100% of new *templates*, sampled 5% of instances, 100% of anything flagged by learners (the V1 flag icon feeds this queue).
- Online: A/B new instance pools behind flags; promote on retry-rate + completion parity with golden set.

---

## 9. Puzzle generation framework

### 9.1 Puzzle schema (single source of truth)

```typescript
type PuzzleDoc = {
  id: string;                      // "ch2-l1-s4-v017"
  mechanic: "flow"|"zones"|"debtsim"|"lab"|"sorter"|"timeline"|"deck"|"graph"|"staircase";
  concept: ConceptId[];            // knowledge-graph nodes exercised
  screen: {
    prompt: string;                // one sentence
    story?: string;                // ≤ 2 sentences
    criteria: Criterion[];         // the visible contract (V3)
  };
  params: MechanicParams;          // typed per mechanic; ALL numbers live here
  solution: SolutionSpec;          // solver-produced; grading + hint anchors
  hints: [HintIntent, HintIntent, HintIntent];
  misconceptions: MisconceptionSignature[];  // failure-space partition
  difficulty: number;              // 0..1, computed, not asserted
  provenance: { author: "human"|"ai"; template: string; validatedBy: string; seed?: number };
};

type Criterion = { id: string; label: string; evaluate: EvalRef };  // EvalRef = pure fn name in mechanic engine
```

### 9.2 Authoring pipeline
1. Learning designer writes **template**: mechanic + criteria + param ranges + hint intents + misconception map (this is the hard, human part — Brilliant: "90% design").
2. Generator produces N instances (LLM params + narrative → solver → filters).
3. Golden-set + auto-eval gates (§8.10).
4. Designer playtests sampled instances in an internal player with a param-tweak sidebar (mirrors Brilliant's tweak/playtest/publish loop).
5. Publish to content CDN as versioned JSON; the app renders `PuzzleDoc`s — **content deploys never require app deploys**.

### 9.3 Constraint-ladder authoring (V8)
A lesson is a list of `PuzzleDoc`s sharing `params` lineage with monotonically growing `criteria`. Tooling enforces: same mechanic, ≤1 new criterion per screen, difficulty non-decreasing.

### 9.4 Validation solvers
Each mechanic ships a solver: closed-form (M3/M4/M9), greedy/DP (M2/M5), Monte Carlo with confidence bounds (M6/M7), graph reachability (M8). Solvers also emit `SolutionSpec` used for grading and hint anchoring — grading and generation can never disagree because they share the solver.

---

## 10. Frontend information architecture

```
App shell (tabs, existing Shell.tsx evolves)
├── Home                    — resume-first (V15): greeting · Jump-back-in hero ·
│                             energy/streak week widget · small-league leaderboard (MR-6)
├── Course                  — <CoursePath>: vertical level path, disc nodes (V16),
│                             chapter overview card (lessons/exercise counts)
├── Practice                — spaced-review queue from knowledge graph (§8.7)
├── League                  — small real cohorts only (MR-6); weekly window
└── Profile                 — knowledge graph view, settings, accessibility prefs

CoursePlayer (full-screen route, covers tabs; V1 chrome)
├── screens: Intro → Puzzle×n (ladder) → Generalization → Reflection
├── overlays: HintPanel · TutorAvatar bubbles · SessionSummary · StreakCommit
State: URL = /learn/:courseId/:lessonId/:screenIdx  (refresh-safe, deep-linkable)
```

Navigation rules: the player is modal — no tab bar, exit via `✕` with progress persisted per screen; back = previous screen (allowed; revisiting is learning); practice sets launch from lesson-end or Practice tab into the same player with dot-progress variant (V10).

---

## 11. Design system

Dark-first (matches references); light theme derives by token inversion. All values are CSS custom properties layered on the existing Tailwind 4.1 setup (`src/styles/theme.css`).

### 11.1 Color tokens

```css
/* surfaces */
--bg-app:#0A0A0C; --bg-card:#17171A; --bg-card-raised:#1C1C20; --bg-inset:#101013;
--border-default:#2A2A30; --border-strong:#3A3A42;
/* text */
--text-primary:#F4F4F6; --text-secondary:#A0A0AB; --text-tertiary:#6B6B76;
/* semantic accents — one job each (§4) */
--accent-course:#A06AF8;  --accent-course-deep:#7C3AED;   /* courseware, CTAs, path */
--state-success:#2FD562;  --state-success-glow:rgba(47,213,98,.25);
--state-warning:#E8B93A;  --state-warning-glow:rgba(232,185,58,.22);  /* "not yet" */
--state-danger:#E5484D;                                    /* consequences: debt, decoys */
--energy:#D7F84B;                                          /* XP, streak lightning */
--object-interactive:#4C6EF5; --object-interactive-dim:#27346B;  /* canvas manipulables */
/* money-flow semantics inside canvases */
--flow-in:#2FD562; --flow-out:#E5484D; --flow-saved:#A06AF8; --flow-neutral:#4C6EF5;
```

Rules: manipulables are blue until graded (V4/V6 — feedback colors are reserved); danger red only for simulated consequences, never for learner mistakes (mistakes are amber); energy lime only on XP/streak surfaces.

### 11.2 Typography

- **UI/lesson sans:** Inter (or General Sans), sizes 13 / 15 / 17 / 20 / 24 / 32; lesson prose 15–16px, weight 400–500; prompts 17/600.
- **Display serif:** Source Serif 4 — *only* for onboarding framing questions and chapter title screens (the "moment of address" voice, V14). Never inside puzzles.
- Numbers in simulations: tabular-nums always (values change constantly; no jitter).
- Line length ≤ 34ch on lesson screens (single-idea rule applies to text too).

### 11.3 Spacing, radius, elevation

4-pt base grid; component paddings 12/16/20/24. Radii: cards 20; lesson-player frame 24; canvas objects 8; chips 10; **lesson CTAs pill 999**; app CTAs squircle 14. Elevation on dark = borders + glows, not shadows: raised = `--border-strong`; success/failure modes = 0 0 0 1px state color + 0 0 24px state-glow (the V6/V7 surface-wide affect).

### 11.4 Reconciliation with existing shape grammar
`docs/design-system-2026-07-15.md` (squircle = tap, pill = read) **remains law in the app shell** (feed, leaderboard, profile). Inside the CoursePlayer, the Brilliant-derived grammar overrides: CTAs are pills, and read-only status is conveyed by the criteria list + frame mode instead of pill badges. Rationale: the player is a distinct focused world (V1) with exactly one primary action on screen at all times, so the tap/read disambiguation problem the shape grammar solves does not arise there. This override is scoped by the `.course-player` token layer; document in Storybook.

### 11.5 Iconography & illustration
Icons: Lucide (already in stack), 1.5px stroke, 20/24px. Illustration: chunky soft-3D objects in course-purple family (V16 discs, V2 vignettes) — commission an 8-object base set (paycheck, bucket, card, shield, staircase, seedling→tree for compounding, ladder, mountain-flag) reused across chapters for visual continuity.

### 11.6 Dark/light & theming
Tokens only — no raw hex in components. Light theme: invert surfaces (`#FFFFFF/#F6F6F8`), keep semantic hues, re-tune glows to shadows. The learning-plan white-card style (V14) exists in dark mode as `--bg-card` at +2 elevation with course-purple tags.

---

## 12. Component library

React + TypeScript. Each entry: purpose · key props · states · animation · a11y · composition. All lesson components consume `PuzzleDoc` (§9.1) and report through a single `usePuzzleEngine` hook (state machine of §6).

### `<CoursePlayer>`
- **Purpose:** full-screen lesson shell (V1): chrome (close, flag, audio), `<ProgressStepper>`, XP counter, screen router, mode glow.
- **Props:** `lesson: LessonDoc`, `initialScreen?`, `onExit`, `onComplete`.
- **States:** per-screen engine state (IDLE/DIRTY/EVALUATING/SUCCESS/FAILURE/HINT_OPEN) lifted here to drive frame affect.
- **Anim:** screen transitions = 250ms slide-fade (forward: enter from 24px right); frame mode glow 250ms ease-out.
- **A11y:** `role="dialog" aria-modal`; focus trap; `Esc` = exit confirm; announces screen changes via `aria-live="polite"`.
- **Composition:** `CoursePlayer → (LessonIntro | InteractivePuzzle | GeneralizationCard | ReflectionCard) + HintPanel + TutorAvatar + SessionSummary`.

### `<InteractivePuzzle>`
- **Purpose:** binds one `PuzzleDoc` to its mechanic engine; renders prompt, `<CriteriaList>`, mechanic canvas, action bar.
- **Props:** `doc: PuzzleDoc`, `onResult(result: GradedResult)`.
- **States:** engine states; `dirty` gates Check enablement (V5).
- **Anim:** none of its own (delegates); orchestrates criteria-flip stagger on grade.
- **A11y:** every mechanic must implement the **non-pointer contract**: all drag interactions have tap-cycle or keyboard (arrow/enter) equivalents; canvas exposes a parallel DOM list (`aria-live` off-canvas description of current state, e.g. "Food: Flexible zone, $520").
- **Composition:** `InteractivePuzzle → CriteriaList + SimulationCanvas(mechanic) + ActionBar(Check/TryAgain/GetHelp/Continue) + StartOver`.

### `<CriteriaList>`
- **Purpose:** the visible contract (V3): arrow bullets → ✓/✗ per criterion on grade.
- **Props:** `criteria: Criterion[]`, `results?: Record<id, boolean>`.
- **States:** pending / passed / failed per row.
- **Anim:** flip icon + color 180ms, 60ms stagger; failed rows do not shake.
- **A11y:** `<ul>` with per-row `aria-label` ("criterion met/not met"); grade summary announced once ("2 of 3 criteria met").

### `<SimulationCanvas>` (family: FlowCanvas, BudgetCanvas, DebtSimulator, CompoundLab, PortfolioSorter, TimelineCanvas, ScenarioDeck, ChoiceGraph, BracketStaircase)
- **Purpose:** the manipulative. SVG-first (M1/M4/M6/M9 charts, pipes, staircases); DOM for chips/cards (M2/M5/M7/M8); Canvas2D only for particles (M1 coin-stream) layered under SVG.
- **Props:** `params`, `value` (controlled), `onChange`, `graded?: GradedOverlay`, `disabled`.
- **States:** interactive / evaluating (input locked, 150ms) / graded-overlay (amber/dim recolor, V6).
- **Anim:** object drags follow pointer 1:1; releases spring (stiffness 300, damping 24); value changes ≤100ms to first paint.
- **A11y:** non-pointer contract (above); `prefers-reduced-motion` swaps particles for stepped bar updates.
- **Composition:** registered per `mechanic` key; adding a mechanic = new canvas + solver + schema, nothing else changes.

### `<PredictionPanel>`
- **Purpose:** commitment-before-evidence (§2.3): slider or MCQ guess, locked in before simulation; ghost of the guess persists on the result view.
- **Props:** `kind:"slider"|"choice"`, `range?`, `options?`, `onCommit`.
- **States:** open → committed (immutable badge "Your guess: 3 months").
- **Anim:** commit = stamp-down 200ms; ghost marker drawn on canvas after reveal.
- **A11y:** slider = native `input[type=range]` styled; committed value announced.

### `<HintPanel>` / `<AdaptiveHint>`
- **Purpose:** V6 `Get help`: bottom sheet with escalating tiers (§8.3); tier gate = one attempt between tiers.
- **Props:** `hints`, `learnerState`, `tierUnlocked`.
- **States:** closed / tier1..3; requesting-AI (skeleton shimmer ≤1.5s, canned fallback hint on timeout).
- **Anim:** sheet 300ms ease-out-cubic; never auto-opens (help is opt-in, V6).
- **A11y:** focus moves into sheet; `Esc` closes; hint text announced.

### `<TutorAvatar>`
- **Purpose:** mascot presence (V11): idle animation, contextual one-line bubbles ("Alright, try this one."), entry to chat.
- **Props:** `mood: idle|happy|thinking|concerned`, `line?`, `onOpenChat`.
- **States:** docked / speaking (bubble auto-dismiss 4s) / celebrating.
- **Anim:** blob idle = 3s breathing loop; mood morphs 250ms; bubbles pop 200ms.
- **A11y:** bubbles mirrored to `aria-live="polite"`; decorative blob `aria-hidden`; chat button labeled "Ask the tutor".

### `<GeneralizationCard>` & `<ReflectionCard>`
- **Purpose:** V9 rule-reveal (pseudocode/rule beside the learner's solved artifact) and post-lesson reflection prompt (§8.8).
- **Props:** `rule: RichContent`, `artifactSnapshot`, `prompt?`.
- **Anim:** rule lines type-on 40ms/line (only place with type-on; it's the "mirror" beat).
- **A11y:** code block with `aria-label` plain-language equivalent.

### `<ProgressStepper>`
- **Purpose:** V1 segmented lesson bar / V10 practice dots.
- **Props:** `total`, `current`, `variant:"bar"|"dots"`, `completedColor`.
- **Anim:** segment fill 300ms on advance; never regresses visually on back-nav (position marker moves, fill stays).
- **A11y:** `role="progressbar"` with value text "Screen 4 of 7".

### `<XPChip>` & `<AchievementToast>`
- **Purpose:** V7 `+15` chip flying to counter; V12 session toast ("Nice work today!").
- **Props:** `amount`, `origin` (rect) / `title`, `subtitle`, `icon`.
- **States:** spawn → travel → absorb (counter ticks up).
- **Anim:** chip: 450ms curved path, counter bump 1.1× scale; toast: slide-down, 3.5s dwell.
- **A11y:** amounts aggregated into one polite announcement per screen (no spam).

### `<CoursePath>`
- **Purpose:** V16 vertical path: extruded disc nodes (done/current/locked), level headers, sticky Start card.
- **Props:** `levels`, `progress`, `onSelect`.
- **States:** per-node done/current/locked; current = glow pulse 2s loop.
- **A11y:** ordered list semantics; locked nodes `aria-disabled` with reason ("Complete Budgeting first").

### `<KnowledgeGraph>`
- **Purpose:** profile view of concept mastery (§8.7): nodes sized by mastery, edges = prerequisites; tap node → definition + "practice this" deep link.
- **Props:** `nodes`, `edges`, `mastery: Record<ConceptId, number>`.
- **Anim:** force layout settles once, then static (no perpetual wiggle); mastery changes pulse the node.
- **A11y:** parallel list view (graph is enhancement, list is baseline).

### `<ScenarioGenerator>` / `<ChoiceGraph>` / `<BudgetCanvas>` / `<FinancialSimulator>` …
Covered as `<SimulationCanvas>` mechanics above — they share props contract, engine hook, a11y contract; only internals differ.

---

## 13. Motion specification

Principles: motion explains causality (money moved *because* you dragged), never decorates; every animation has a job; all durations from a fixed scale.

### 13.1 Duration & easing scale
`fast 100ms` (state reflect: bar updates, toggles) · `base 200–250ms` (transitions, mode glows, bubbles) · `deliberate 300–450ms` (card flips, XP travel, reveals) · `theatrical 500–800ms` (once-per-chapter beats: glass-pipe reveal, wipeout desaturation, ghost-curve draw). Easings: `ease-out-cubic` entrances · `ease-in-out` position · springs (300/24) for physical objects only. **Nothing exceeds 800ms; nothing blocks input except EVALUATING (150ms).**

### 13.2 Signature motions
- **Money particles (M1):** 60fps canvas, particle count ∝ dollars (1 per $10, cap 400); reduced-motion: stepped bar fills.
- **Mode glow (V6/V7):** border-color + box-shadow 250ms; whole-frame, GPU-composited (opacity/filter only).
- **Criteria flip:** 180ms per row, 60ms stagger — reads as a checklist being ticked by hand.
- **Interest tick (M3):** red +$ chip drops onto balance, 220ms, with 40ms haptic (mobile).
- **Curve morphs (M4/M6):** d-path interpolation 300ms; inflation sag uses ease-in (weight metaphor).
- **Typing beat (M8):** 600–900ms randomized — the only intentionally slow response in the product.

### 13.3 Loading & skeletons
Lesson JSON prefetches on path-node focus; player opens instantly with screen-1 skeleton (prompt line + canvas block shimmer, 1.2s loop) if needed; AI-hint waits show tutor "thinking" mood, timeout 1.5s → canned hint.

### 13.4 Success/celebration & 13.6 Confetti rules
Per-screen success: glow + chip only (V7 — Brilliant celebrates *quietly* per screen). **Confetti fires only on:** lesson complete, chapter complete, mastery milestone on knowledge graph, capstone ghost-curve reveal. Max once per 5 minutes; 1.2s burst, physics-light, `prefers-reduced-motion` replaces with static starburst + message. Rationale: celebration inflation destroys signal value — scarcity keeps dopamine attached to *learning* events.

### 13.5 Error recovery motion
`Try again` restores DIRTY with the learner's state intact (never wipes their work — reset is a separate explicit `Start over`); amber recolors fade back to interactive blue over 200ms as they re-touch objects (the artifact visibly "forgives").

---

## 14. Technical architecture

Builds on the verified scaffold (Vite 6.3.5 + React 18 + Tailwind 4.1, `src/app/App.tsx` flow). No backend is assumed (CLAUDE.md); v1 is client-only with content JSON + localStorage persistence; a sync API is a clean later addition.

- **Stack:** React 18 + TypeScript strict; Tailwind for layout + token CSS variables; **Framer Motion** for UI/transition/layout animation; **React Spring** only inside canvases needing interruptible physical springs (drag-release); Canvas2D particle layer under SVG scenes; no chart library — simulations are bespoke SVG (charts must be *manipulable*, chart libs fight that).
- **State:** `usePuzzleEngine` = XState-style reducer per screen (finite states of §6 — a real statechart, testable headlessly); Zustand stores for session (XP, streak), learner model (mastery, misconceptions), and content cache. URL owns location (§10).
- **Puzzle engine isolation:** mechanics are pure: `(params, value) → view` and `evaluate(params, value) → GradedResult` with zero React inside evaluation — enables headless golden-set tests (§8.10) and solver reuse (§9.4).
- **Data model (local-first):**
```typescript
LearnerState {
  profile { createdAt, prefs { reducedMotion, sound, haptics } }
  progress { [lessonId]: { screenIdx, results: GradedResult[], completedAt? } }
  choices  { [chapterId]: ChoiceRecord }        // feeds Ch.12 capstone ghost-curve
  mastery  { [conceptId]: { p: number, lastReview, interval } }
  misconceptions { [signature]: count }
  session  { xp, streak, committedGoal }
}
```
  Persist: localStorage v1 (versioned, migratable) → sync endpoint later without shape change.
- **AI pipeline (build-time first):** v1 ships pre-generated instance pools (per §9.2) as static JSON — zero runtime AI dependency, zero hallucination surface, offline-capable. v1.5 adds runtime adaptive hints (server-proxied LLM, strict output schema, canned fallbacks). Runtime AI never produces numbers or grading.
- **Analytics events (schema-first):** `screen_view, interact_first, check_submitted {criteria_results, attempt_n, ms_since_view}, hint_opened {tier}, prediction_committed {value, actual}, start_over, lesson_completed, practice_item {concept, correct}, streak_commit, session_end {xp, screens}` — exactly the inputs §19 metrics need; no PII, no financial data (MR scope).
- **Performance budgets:** lesson JS ≤ 180KB gz (mechanics code-split by `mechanic` key); interaction→paint ≤ 100ms; 60fps drags (transform/opacity only, particles capped, `will-change` on active objects); Lighthouse mobile ≥ 90.
- **Testing:** headless engine tests per mechanic (golden instances → expected grades); Playwright flows (complete Ch.0 lesson happy + failure paths); axe-core a11y CI; visual regression on the design-token layer. (Repo currently has no test script — add `vitest` + `playwright` as part of Phase 1, §20.)

---

## 15. Wireframes

Lesson puzzle screen — mobile 390×844 (chrome, contract, canvas, action bar = V1/V3/V4):

```
┌──────────────────────────────────────┐
│ ✕      ▓▓▓▓▓▓▓░░░░░░░░░   ⚑  15✦   │  chrome + segmented progress
│                                      │
│  Survive the month.                  │  prompt (17/600)
│  → End month ≥ $0                    │  criteria list
│  → Savings ≥ 15%                     │  (arrows → ✓/✗ on Check)
│                                      │
│  ┌────────────────────────────────┐  │
│  │  INCOME  $3,700   SAVED ▓▓░ 9% │  │
│  │  ┌──────┐ ┌──────┐ ┌────────┐  │  │
│  │  │FIXED │ │FLEX  │ │  CUT   │  │  │   BudgetCanvas
│  │  │Rent  │ │Food  │ │ Gym    │  │  │   (chips drag / tap-cycle)
│  │  │$900  │ │$520  │ │ $80    │  │  │
│  │  └──────┘ └──────┘ └────────┘  │  │
│  │   wk1 ── wk2 ── !SHOCK ── wk4  │  │   month scrubber + event
│  └────────────────────────────────┘  │
│              ↺ Start over            │
│ ┌─────┐                              │
│ │ 🟢  │ "Try moving one flexible…"   │  tutor + bubble
│ └─────┘                              │
│  ┌────────────────────────────────┐  │
│  │            Check               │  │  pill CTA (state-colored)
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘

FAILURE mode: frame border+glow amber · Food chip amber · Rent dimmed ·
buttons → [ Get help ] [ Try again ] · bubble "Not quite right."
```

Course path (V16) and home hero follow the screenshots directly:

```
┌─ Course ─────────────┐   ┌─ Home ──────────────────────┐
│ Financial Literacy    │   │ Welcome back, John          │
│ 13 chapters · 360 ex. │   │ ⚡ 4 ─ S Su M T W (week)     │
│  ◉ Your First Paycheck│   │ ┌─ Jump back in ──────────┐ │
│  ◎ Budgeting  ← glow  │   │ │ Budgeting — Level 1     │ │
│  ○ Emergency Funds    │   │ │ [====----] Continue ▶   │ │
│  ○ Credit Cards       │   │ └─────────────────────────┘ │
│ ┌───────────────────┐ │   │ League: #2 of 12 (cohort)   │
│ │ Budgeting  [Start]│ │   └─────────────────────────────┘
│ └───────────────────┘ │
└──────────────────────┘
```

---

## 16. Mobile-first interaction specification

- **Touch targets ≥ 44×44px**; canvas objects ≥ 48px hit area (visual may be smaller).
- **Gestures:** drag = primary manipulation (8px activation threshold, no long-press gate); tap = toggle/select; horizontal scrub on timelines (rubber-band at ends); swipe = *only* the Ch.4 card-swipe set piece (guarded against scroll conflict by full-screen non-scroll canvas). No hidden-gesture functionality — every gesture has a visible-control equivalent.
- **Haptics** (where supported): 10ms light on chip-drop and month-tick; 40ms medium on Check results; none during drags.
- **Layout:** single column ≤ 480px; canvas gets max vertical space, action bar fixed bottom (thumb zone), prompt+criteria collapse to compact rows on short screens; landscape unsupported in player v1 (locked with rotate prompt).
- **Keyboard (desktop/external):** Tab order prompt→criteria→canvas objects→actions; arrows move focused object between zones/values; Enter = Check/Continue; `H` = hint; `Esc` = exit dialog.
- **Offline:** lesson pools cached (content JSON + assets via service worker); full course playable offline; analytics queued.

---

## 17. Accessibility

- **WCAG 2.2 AA** floor. Contrast: all text ≥ 4.5:1 on `--bg-*` (verified per token pair in CI); state colors paired with icons/labels (✓/✗, never color-alone — criteria rows carry both).
- **Non-pointer contract** (§12 `<InteractivePuzzle>`): every mechanic operable via keyboard and via tap-only (no drag-required paths); screen-reader parallel state list per canvas, updated on change, summarized on grade.
- **Reduced motion:** `prefers-reduced-motion` disables particles, springs, confetti, glow pulses; replaces with instant state changes + text confirmations. All learning content survives motion removal (motion explains, but never *solely* carries, meaning — the criteria list is always the ground truth).
- **Sound:** all cues optional (V1 audio toggle persists); no meaning carried by sound alone.
- **Cognitive:** one idea per screen is itself an accessibility feature; plain-language toggle for financial jargon (every term links to a one-line definition sheet); no time pressure anywhere in v1 (speed is never graded — mastery, not reflexes).
- **Dyscalculia support:** numbers always accompanied by proportional visuals (bars/streams); exact arithmetic is never the graded skill (the sim does arithmetic; the learner does judgment).

---

## 18. Gamification

Intrinsic first (competence, autonomy, relatedness — self-determination theory); extrinsic only where it *points at* learning:

- **Mastery:** knowledge-graph nodes lighting up (§8.7) are the primary collection; practice tab shows "concepts due" like a garden to tend (spaced repetition disguised as care).
- **Curiosity loops:** each chapter plants a mystery the next resolves (the $740 → CPF pipes; the iPhone → the trap; the raise → the ratchet). Prediction commitments (§2.3) are micro-bets — the itch to see if you were right is the retention mechanic.
- **Streaks (V13):** self-committed goals (3/7/14) kept, but streak credit requires ≥1 *graded* interaction — opening the app doesn't count; a monthly "streak repair" token de-fangs loss-aversion anxiety. Meaning-guard: if analytics show streak-driven sessions with <2 screens completed, streak weighting is reduced (metric §19).
- **League (MR-6):** small real cohorts (≤15: friends, grad-intake) weekly XP window; solo-first users see personal-best track instead. No global anonymous boards.
- **Challenge modes:** weekly "Payday Drill" (one AI-generated composite scenario, e.g. shock month + card temptation); "Hard mode" replays of completed lessons with tighter constraints.
- **Real-life quests (MR-3, advice-safe):** "Find these 3 lines on your payslip" · "Locate your card's APR in its T&Cs" · "Write down your fixed vs. flexible split" — verifiable-by-self actions, never account-linked, rewarded with XP not financial-product incentives (MR-8).
- **No:** hearts/lives, pay-to-skip, loot boxes, decorative badges without concept meaning.

---

## 19. Success metrics

| Metric | Definition | Healthy band / target |
|---|---|---|
| Screen retry rate | failed Checks ÷ Checks, per screen | 15–35% (flow band, §8.9); outliers → redesign queue |
| Prediction gap | │predicted − actual│ distribution, pre vs. late-course | narrowing over chapters = calibration improving |
| Hint usage | % screens with hint; tier distribution | 10–25%; tier-3 >10% flags too-hard screens |
| Puzzle completion time | median per screen vs. author estimate | 0.5×–2× estimate; monitor tails |
| Lesson completion | started → completed | ≥80% Ch.0–2 |
| Drop-off map | exits per screenIdx | no screen >8% of lesson exits |
| Concept retention | spaced-review accuracy at 7/21 days | ≥70% at 21d on core nodes |
| Replay frequency | voluntary replays + hard-mode entries | directional (curiosity signal) |
| Session shape | screens graded per session; 3–5min sessions (MR-4) | ≥6 graded screens median |
| Streak integrity | % streak-days with ≥2 graded screens | ≥85% (else meaning-guard triggers, §18) |
| Confidence delta | 5-pt self-report pre-course vs. post-chapter | +1 median, paired |
| Real-world behavior (proxy, opt-in survey) | completed real-life quests; self-reported actions (checked payslip, set auto-transfer) | directional only; never account-verified (MR scope) |
| AI content health | generated-instance flag rate vs. golden set | parity; any flagged instance auto-pulled |

Instrumentation: exactly the event schema in §14 — every metric computable from shipped events on day one.

---

## 20. Engineering roadmap

| Phase | Weeks | Scope | Exit criteria |
|---|---|---|---|
| 1. Engine core | 1–4 | Design tokens + player shell (`CoursePlayer`, `ProgressStepper`, `CriteriaList`, action bar, mode affect); `usePuzzleEngine` statechart; `PuzzleDoc` schema + loader; M2 BudgetCanvas end-to-end; vitest+Playwright+axe CI added to repo | Ch.2 flagship playable, both feedback modes, a11y contract met, `pnpm build` green |
| 2. Payday wedge | 5–8 | M1 FlowCanvas (+particles), M3 DebtSimulator; Ch.0, 1, 2, 4 authored (hand-authored instances); hints tier-1/2 static; SessionSummary, XP, home hero, CoursePath | "Payday night" path (Ch.0→4) complete; retry-band + drop-off dashboards live |
| 3. Generation pipeline | 9–12 | Schema-validating generator + solvers (M1–M3), golden sets, authoring playtest tool with param sidebar; practice sets (dot variant); knowledge graph + BKT + spaced review | ≥90% first-pass instance validity; practice tab shipping AI-generated variants |
| 4. Full course | 13–20 | M4–M9 mechanics; Ch.3, 5–11 authored; TutorAvatar with AI adaptive hints (server-proxied, fallbacks); league (small cohorts), streak commit, quests | All 13 chapters; hint p95 latency <1.5s with fallback path proven |
| 5. Capstone & polish | 21–24 | Ch.12 capstone (choice-state ghost-curve); motion polish pass (§13 audit); perf budgets enforced; light theme; offline SW | Full-course completable offline; Lighthouse ≥90; §19 dashboard complete |

Team shape: 2 FE engineers, 1 learning designer, 1 motion/visual designer, 1 AI engineer (from Phase 3). Dependencies: mechanics before chapters that use them; generation pipeline before practice sets; choice-state persistence (Phase 1 data model) before capstone.

---

## 21. Future expansion

- **Market expansion:** CPF chapter swaps for 401(k)/EPF/superannuation via the statutory-data-file layer (§8.2); tax staircase is already table-driven.
- **Voice tutor (V11 mic):** speech in/out on the existing HintPanel contract.
- **Cohort co-op puzzles:** shared BudgetCanvas for flatmate/couple scenarios (relatedness deepening MR-6).
- **Life-event courses:** same engine, new courses — First BTO, First Car, First Kid, First Investment Account (the engine is the asset; courses are content).
- **Author studio:** open the §9 pipeline UI to internal authors → later external educators (marketplace).
- **Longitudinal mode:** monthly "new month, new drill" generated from the learner's mastery profile — the product's steady-state after course completion (MR-5 return loop).
- **Research program:** with opt-in cohorts, validate the MR-10 hypotheses (does paycheck-timing beat generic onboarding?) using §19 instrumentation as the measurement layer.

---

## Appendix: repo integration notes

- This document is design intent (per CLAUDE.md, `docs/plans/` ≠ implemented functionality). Implementation begins at Phase 1 against the existing scaffold: evolve `src/app/App.tsx` flow toward the §10 IA; keep UI in `src/components/`, styles in `src/styles/`; do not touch `src/imports/` (generated).
- Known discrepancy to resolve in Phase 1 (recorded, not fixed here): `App.tsx` imports `./components/*` while components live at `src/components/` (see CLAUDE.md).
- Validation available today: `pnpm build` only; Phase 1 adds vitest/Playwright/axe.
- Statutory figures (CPF rates, tax brackets) are **content data requiring verification** before publish; nothing in this spec asserts current rates.
