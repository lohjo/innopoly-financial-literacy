---
title: "draft: One Basket? — diversification lesson (content draft)"
type: feat
status: implemented
date: 2026-07-22
origin: prompt — guided Watch → Copy → Do → Consequence → Retry → Reveal lesson for diversification
relationship: >
  Implemented as Discovery Lab lesson one-basket alongside interest-multiplier.
  New mechanic distribute + observe screen kind. Exact learner-facing copy preserved;
  product decisions 1–3 locked below (2026-07-22).
proposed:
  chapterId: ch-lab
  lessonId: one-basket
  title: "One Basket?"
  minutes: 2
  concepts: [diversification]
decisions:
  outcomes: computed-from-placement
  drop: proportional-to-amount-in-B
  reward: mastery-plus-generalize-copy
---

# 🥚 Lesson: One Basket?

**Status:** implemented — playable at `/learn/one-basket`.  
**Placement:** Discovery Lab (`ch-lab`) · ~2 min  
**Skill unlock:** Diversification · celebrate copy on generalize (+ real mastery concept)

Pedagogy pattern this draft follows:

| Beat | Role |
| --- | --- |
| 👀 Watch | We show the goal |
| 👉 Copy | We demonstrate the drag |
| 🎮 Do | The learner tries it |
| 💥 See the consequence | Outcome of their placement |
| 🔁 Try again with new knowledge | Clear objective, second attempt |
| 💡 Reveal the financial concept | Metaphor → investments → name the skill |

---

## Screen 1 — Welcome

**Kind (proposed):** `intro`

### 👋 Welcome

**Text**

> Let's play a quick game.

> Your goal is to keep as many eggs safe as possible.

**Button**

**Start**

---

## Screen 2 — Pack the eggs

**Kind (proposed):** guided allocate / distribute (needs demo drag once)

### Pack the eggs

**Text**

> You have **12 eggs**.

> **Drag the eggs into the baskets below.**

*(Animate a hand dragging one egg into a basket once to demonstrate.)*

```text
🧺 Basket A
🧺 Basket B
🧺 Basket C
🧺 Basket D

🥚🥚🥚🥚🥚🥚🥚🥚🥚🥚🥚🥚
```

When they drag the first egg:

✨

> Great! Keep going.

When all eggs are placed:

**Continue**

---

## Screen 3 — Watch what happens...

**Kind (proposed):** consequence / observe (no interaction yet)

### Watch what happens...

*(No interaction yet.)*

One basket starts wobbling.

🫨

💥

It breaks.

Eggs fall out and crack.

---

**Outcome copy is computed** from how many eggs were in the broken basket (see [Locked decisions](#locked-decisions)):

If that basket held all 12:

> You lost **all 12 eggs.**

If that basket held 3 (even spread):

> You saved **9 eggs!**

*(General form: saved = 12 − eggs in broken basket.)*

**Continue**

---

## Screen 4 — One more try

**Kind (proposed):** bridge / concept beat before retry

### One more try

**Text**

> This time...

> **Can you save at least 8 eggs?**

*(The learner now knows the objective.)*

---

## Screen 5 — Second break

**Kind (proposed):** allocate + consequence (graded: ≥ 8 eggs saved)

Basket breaks again.

Different basket this time *(not the same id as Screen 3)*.

**Pass rule:** eggs kept ≥ 8, where kept = 12 − eggs in the broken basket.

If successful (example: broken basket held 2 → kept 10):

🎉

> Nice!

> You kept **10 eggs safe.**

*(Number is live — whatever they actually kept.)*

---

## Screen 6 — Something looks familiar...

**Kind (proposed):** concept / animation-only morph

### Something looks familiar...

*(Animation only.)*

Each basket slowly changes into an investment.

🧺 → 📈

Each egg becomes money.

🥚 → 💰

No interaction.

---

## Screen 7 — Your turn

**Kind (proposed):** guided allocate (money variant; demo drag once)

### Your turn

**Text**

> Imagine each basket is an investment.

> **Drag your $1000 into the investments.**

*(Again, animate one $100 bill being dragged into an investment to teach the interaction.)*

```text
💰 $1000

📈 A
📈 B
📈 C
📈 D
```

---

## Screen 8 — One investment drops

**Kind (proposed):** consequence / observe (live total)

### One investment drops.

📉 Investment B

The total updates live.

**Drop is proportional** to how much of the $1000 sat in B (see [Locked decisions](#locked-decisions)). Author default: B loses **40%** of its share; A/C/D unchanged.

If they invested everything there ($1000 in B → −$400):

😬

> Your portfolio dropped a lot.

If they spread their money (e.g. $250 in B → −$100):

🙂

> Most of your money is still safe.

*(Optional micro-line under the face: **$1000 → $X** with the live total.)*

---

## Screen 9 — You discovered diversification!

**Kind (proposed):** `generalize` (+ skill unlock / XP chrome)

### 🎉 You discovered diversification!

**Text**

> Putting everything in one place is risky.

> Spreading your money reduces the impact if one investment performs badly.

**New Skill Unlocked**

🛡 Diversification

**+10 XP**

*(Reward chrome is copy on this screen for v0 — no new XP economy. Mastery registers concept `diversification` via the evidence ledger like other lessons. See [Locked decisions](#locked-decisions).)*

---

## Why this is stronger

Notice the lesson follows a pattern:

* 👀 **Watch** (we show the goal)
* 👉 **Copy** (we demonstrate the drag)
* 🎮 **Do** (the learner tries it)
* 💥 **See the consequence**
* 🔁 **Try again with new knowledge**
* 💡 **Reveal the financial concept**

This progression is important because it removes uncertainty. A first-time user never has to ask, *"What am I supposed to do?"* The app demonstrates the interaction first, then lets them take over. That's a hallmark of polished learning apps like Duolingo and Brilliant.

---

## Locked decisions

| # | Decision | Choice | Why |
| --- | --- | --- | --- |
| 1 | Egg outcome numbers | **Computed** from placement: one basket breaks; saved/kept = `12 − count(broken)`. Screen 3 picks a break target (prefer a non-empty basket if any). Screen 5 picks a **different** basket id. Pass Screen 5 when kept ≥ 8. Script lines like “saved **9**” / “kept **10**” are examples of even/near-even spreads, not fixed copy. | Fixed numbers break trust the moment the learner’s layout doesn’t match. Computation is the teaching. |
| 2 | Investment B drop | **Proportional**: B loses a fixed fraction of *its* share (default **40%**); other investments unchanged; portfolio total updates live. Branch copy: “dropped a lot” when share-in-B ≥ 50% of $1000; else “most … still safe.” | Same lesson as the eggs — consequence must track what *they* did. |
| 3 | Skill / +10 XP | **Keep celebrate copy** on Screen 9; **no new XP system**. Register `diversification` in mastery concepts + lesson evidence like Interest Multiplier. Defer a dedicated skill-unlock UI. Optional later: process achievement if we want a badge (e.g. reuse “Revised with evidence”). | Repo has BKT mastery + process achievements, not an XP counter. Fake XP chrome without ledger wiring is worse than honest copy + real mastery. |

### Outcome formulas (implement later)

```text
# Eggs (Screens 3 & 5)
brokenBasket = pickBreakTarget(placement, screenRules)
lost  = eggsIn[brokenBasket]
kept  = 12 - lost
# Screen 5 pass ⇔ kept >= 8

# Money (Screen 8)
dropRateB = 0.40
loss     = amountIn["B"] * dropRateB
total    = 1000 - loss
heavyHit = amountIn["B"] >= 500   # drives 😬 vs 🙂 copy
```

---

## Implementation notes (for later — not part of review copy)

These are scaffolding notes only; they do not change the learner-facing text above.

| Screens | Gap vs current player |
| --- | --- |
| 2, 5, 7 | Need multi-bucket **distribute** (eggs / $ chips) + one-shot **demo drag** overlay; current `allocate` is tap-to-flip two columns |
| 3, 5, 8 | Need **consequence** beat (wobble → break / drop, outcome copy from placement) — no ScreenDoc kind for this yet |
| 6 | Need animation-only morph beat (or stretch `concept` with art) |
| 1, 4, 9 | Fit `intro` / short `concept` / `generalize` with existing kinds |
