---
title: finfy-literacy component vocabulary — buttons, tabs, chips, tags, badges
type: design-system
status: active
date: 2026-07-15
related_plan: docs/plans/finfy-literacy-phase-0-planning.md
references: docs/audit/mobbin-references-2026-07-15.md
---

# finfy-literacy component vocabulary

A grammar for the small rounded surfaces across finfy-literacy's challenge feed, leaderboard, and AI summary screens. A single challenge card can carry a category tag, a difficulty tag, a LOCKED / ACTIVE / COMPLETED status, and a "Start challenge" button all at once; a leaderboard row a screen over adds a rank chip and, sometimes, a streak-at-risk warning. Reviewed against the local mockup set at `docs/audit/fingo-references-png/`, these surfaces are easy to render as identical rounded rectangles at a similar size and weight — at which point a newgrad can't tell at a glance which one is a button, which one is a read-only state label, and which one is just metadata describing the challenge.

This doc commits to six distinct roles, gives each one a clear visual character, and maps finfy-literacy's screen elements onto those roles.

---

## Mobbin grammar lessons

These specific app screens, gathered in `docs/audit/mobbin-references-2026-07-15.md`, settled the conventions used below:

- **Duolingo** ([screen](https://mobbin.com/screens/6d3327c2-0111-405c-a5db-9ff4f163f077)) — the single-question challenge card carries one solid, high-contrast "Continue" action against otherwise flat body text and a thin progress bar. There is exactly one primary action per screen; everything else recedes.
- **Fingo** ([screen](https://mobbin.com/screens/11cbe662-2840-4c56-9bd6-8c62b32acade)) — the post-lesson results card stacks a low-contrast score badge, a one-line coaching tip, and a tappable "Next up" module card, and the three read as distinct *kinds* of element purely from fill weight and shape. This is the direct model for finfy-literacy's AI summary card.
- **Duolingo** ([screen](https://mobbin.com/screens/3bb8bc70-13f5-4e69-a99a-94dd25e17bda)) — the weekly leaderboard's rank number is bold and leads every row, and the current user's row is pinned and outlined. The number itself is the visual hook, not a generic list index — the model for finfy-literacy's rank chip role below.
- **Mimo** ([screen](https://mobbin.com/screens/17d2479f-0e07-463c-8f43-d216063d8340)) — a low-contrast, non-interactive review badge sits comfortably next to an outlined, interactive "Start now" CTA and reads as a different *kind* of element, not a different *color* of the same element. This is the pattern finfy-literacy's LOCKED / ACTIVE / COMPLETED badges need next to the "Start challenge" CTA on the challenge feed.
- **Gentler Streak** ([screen](https://mobbin.com/screens/edad16c0-6b7c-41a5-8126-9bee3a36d02c)) — a streak-risk banner is a flat, urgent-colored, non-interactive label sitting above a one-tap "do a quick one" CTA; the warning never itself looks tappable, which keeps the recovery action unambiguous. This is the model for finfy-literacy's streak-at-risk status badge.

---

## The shape grammar (most important rule)

The single distinction that resolves every previous confusion:

| Shape | Used for | `border-radius` |
|---|---|---|
| **Squircle** (rounded square) | Anything **you tap** — primary/secondary CTAs, tabs, rank chips | 10 – 14 px (≈30% of element height) |
| **Pill** (fully round) | Anything **you read** — status badges, category and difficulty tags | 999 px (so the ends stay perfectly hemispherical) |

This means: if you see a rounded-rectangle on a finfy-literacy screen, it's a control — tap it. If you see a full pill, it's a label — read it, don't tap it. A newgrad scanning a challenge card full of tags, a status badge, and a CTA learns this in five seconds and never mistakes a "Budgeting" tag for a button again. Inspired by iOS continuous-corner buttons and the absolute-bans section of the impeccable skill.

## The six roles

| # | Role | Shape | Fill | Border | Height | Type | Cursor | Used for |
|---|---|---|---|---|---|---|---|---|
| 1 | **Primary CTA** | Squircle 14 | Solid brand-accent, white text + drop shadow | none | 48 | 15 / 600 | pointer | The single most important action on the screen — "Start challenge", "Continue" on the AI summary card, "Get started" on the single-screen signup |
| 2 | **Secondary CTA** | Squircle 12 | Translucent surface, dark text | 1px low-contrast | 40 | 14 / 600 | pointer | "Skip", "Review answer", "Invite a friend", escape actions and secondary form submits |
| 3 | **Tab** | Squircle 12 | Inactive flat / Active = accent-soft fill + accent text | conditional | 36 | 13.5 / 600 | pointer | Challenge-track filter tabs (Budgeting / Saving / Investing / Credit) on the feed; leaderboard time-range tabs (This week / All time) |
| 4 | **Status badge** | **Pill** 999 | Very low-contrast flat, state-colored | **none** | 24 | 11 / 700 UPPERCASE 0.08em | default | Read-only challenge state: LOCKED / ACTIVE / COMPLETED, and the streak-at-risk warning |
| 5 | **Metadata tag** | **Pill** 999 | Very low-contrast flat | **none** | 24 | 12.5 / 500 | default | Read-only challenge metadata: category tags (Budgeting, Saving, Investing, Credit), difficulty tags (Beginner, Intermediate) |
| 6 | **Rank chip** | Squircle 10 | Flat, leading bold rank number + avatar | accent border on the current user's row | 40 | 14 / 700 tabular numerals | pointer | Leaderboard rows, where the number IS the visual hook — the finfy-literacy counterpart to a numbered nav chip |

### Grammar rules

1. **Shape encodes affordance.** Squircle = tap. Pill = read. This is the headline rule.
2. **Border = secondary visual confirmation of interactivity.** Squircles can have borders or not, but pills never do.
3. **Uppercase + tracking = status, not action.** LOCKED / ACTIVE / COMPLETED and the streak-at-risk badge stay uppercase; "Start challenge" and "Continue" stay sentence case.
4. **Fill weight encodes emphasis.** Solid → outlined → flat. Solid is reserved for the one primary action per screen.
5. **Height encodes hierarchy.** 48 > 40 > 36 > 24. Never use in-between values (e.g. 28 / 30 / 34 / 44) — they blur the steps.
6. **Primary CTA gets a drop shadow.** The single most-important button on a screen lifts off the surface. Secondary CTAs and tabs do not.
7. **Status badges get a state color, not a state shape.** LOCKED, ACTIVE, COMPLETED, and streak-at-risk are all the same pill; only fill and text color change between states — never radius, never height.
8. **Don't morph between shapes on state change.** A tab stays a squircle whether active or inactive; a rank chip stays a squircle whether it's the current user's row or not. Active states change fill / border / elevation, not shape.

---

## Class mapping

finfy-literacy's frontend hasn't shipped yet (`src/` is still scaffolding), so this is a forward mapping rather than a retrofit: the target class names each screen element should carry once built, grounded in the local mockup set at `docs/audit/fingo-references-png/` and the Mobbin lessons above.

| Existing class | Role | Notes |
|---|---|---|
| `.challenge-card__cta` ("Start challenge") | Primary CTA | Challenge feed row's single action |
| `.summary-card__cta` ("Continue") | Primary CTA | AI summary card's one next action, per the strict format in `docs/plans/features/ai-generated-summaries.md` |
| `.onboarding__cta` ("Get started") | Primary CTA | Single-screen signup straight into the first challenge, per `docs/plans/features/onboarding-account-management.md` |
| `.challenge-card__skip`, `.summary-card__secondary-cta` ("Skip", "Review answer") | Secondary CTA | Outlined, escape / secondary actions |
| `.leaderboard__invite-cta` ("Invite a friend") | Secondary CTA | Peer-group invite entry point, per `docs/plans/features/leaderboards-peer-competition.md` |
| `.challenge-feed__track-tab` (Budgeting / Saving / Investing / Credit) | Tab | Filter bar above the challenge feed |
| `.leaderboard__range-tab` (This week / All time) | Tab | Leaderboard time-range switch |
| `.challenge-card__status` (LOCKED / ACTIVE / COMPLETED) | Status badge | Non-interactive; no border, no cursor pointer |
| `.streak__risk-badge` ("Streak at risk") | Status badge | Amber/red state variant; proactive warning per the Gentler Streak lesson above |
| `.challenge-card__category-tag` (Budgeting, Saving, Investing, Credit) | Metadata tag | Flat, no border |
| `.challenge-card__difficulty-tag` (Beginner, Intermediate) | Metadata tag | Flat, no border |
| `.leaderboard-row__rank` (#1, #2, #3…) | Rank chip | Leading number is the hook; accent border only on the signed-in user's own row |

### What's NOT in this vocabulary

- The global bottom tab bar (Home / Challenges / Leaderboard / Profile) is icon-led app chrome with its own always-visible grammar, not a content-level "Tab" role.
- The top-nav streak counter (flame icon + day count, visible from every screen per the Duolingo benchmark above) is persistent chrome, not a Status badge — it is never absent and never state-conditional the way LOCKED / ACTIVE / COMPLETED is.
- The linear progress bar inside an in-progress challenge is a continuous fill indicator, not a squircle or a pill, and has its own fill/motion grammar.
- Modal and sheet close (×) controls are fixed-position chrome, not part of the inline button family above.

---

## Why this matters

Today, a newgrad scrolling the challenge feed mockup sees, in a single card, a vertical stack of:
1. **ACTIVE** — a state label that shouldn't be tappable
2. **Budgeting**, **Beginner** — two metadata tags describing the challenge, not actions
3. **Start challenge** — the one thing on the card that IS tappable
4. **#4** — a teaser of the user's current leaderboard rank, also not tappable from here
5. **Streak at risk** — a proactive warning that can appear near the same card

If all five render as similarly-rounded, similarly-sized, similarly-weighted surfaces, a newgrad has no reliable way to tell which is a button, which is a read-only state, and which is just a stat glanced in passing — exactly the failure mode the shape grammar above is built to prevent. Fix is to commit each one to a role and let the role's shape and fill carry the meaning, not a shared "rounded box" default.

---

## What this doc is NOT

Not a Tailwind preset or a token JSON. finfy-literacy's frontend framework and styling approach aren't locked yet — see the open question in `docs/plans/features/mobile-first-design.md` on native app vs. mobile web vs. responsive web app. This doc is a vocabulary committed in prose, independent of whatever styling system the eventual frontend uses, so implementation can start from a shared reference for what a button, a tab, a badge, and a tag are supposed to look and behave like, rather than re-deriving the six roles from the mockups screen by screen.

A future plan could lift these into design tokens (`--cta-height-primary: 48px` etc.) once the frontend stack is chosen — out of scope here.
