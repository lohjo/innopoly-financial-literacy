# How an agent edits the challenge spec — design spike

> Status: design spike, drafted 2026-07-15, at commit `c8f29fc` ("Initial commit" — the repository's
> only commit as of writing).
> This is a **contract**, not an implementation. It defines which semantic operations an agent could
> call to edit a `ChallengeSpec`, their shape, how they validate, and how an agent invokes them. No
> production operation library, CLI, or agent/MCP binding is shipped here.
>
> Source of truth read while writing this: `docs/plans/origin.md`,
> `docs/plans/finfy-literacy-phase-0-planning.md`, `docs/plans/features/gamified-challenges.md`,
> `docs/plans/features/ai-generated-summaries.md`, `docs/plans/features/leaderboards-peer-competition.md`,
> `docs/plans/CURRENT_STATE.md` (all current as of `c8f29fc`, 2026-07-15). No `ChallengeSpec`
> implementation exists anywhere in this repository to cite — `src/` is empty and there is no
> `package.json`, `tsconfig.json`, or framework scaffold (`docs/plans/CURRENT_STATE.md`). The module
> layout named below (`challengeSpec.ts`, `scoring.ts`, `commandStack.ts`) is **proposed**, not shipped;
> see the consumption-gap blocker under [Agent binding options](#agent-binding-options).

## Goal & non-goals

**Goal.** Define a deliberate, reviewable contract for *agent-driven challenge-content editing*: a
small set of **pure, immutable** semantic operations `(spec, args) => ChallengeSpec`, a **headless
runner** (`applyOps`) that applies a batch of them and re-validates, and a recommendation for how an
agent **invokes** that runner once a core exists. Each operation is written so that, whenever a real
content-editing core gets built, the eventual implementation is "wrap, don't reinvent."

Why start with the spec, not the engine:

- A `ChallengeSpec` as pure JSON (no UI framework, no database driver, no network imports) is the
  right durable contract regardless of which client or backend eventually renders and serves it — the
  stack for finfy-literacy is not yet decided (`docs/plans/finfy-literacy.md` is currently unrewritten
  placeholder content; see `docs/plans/CURRENT_STATE.md`), so this contract is deliberately
  framework-agnostic.
- Keying `answerKey` and `scoringRubric.perQuestionWeight` by `Question.id` rather than array position
  is the one identity decision that has to be right from the first line of implementation code, because
  every downstream feature — scoring, the AI-generated summary, leaderboard points — reads through it.
- A `status: draft | published` field gives content authors a review gate for free. This is the direct
  mechanism for the open question `docs/plans/features/gamified-challenges.md` raises under its
  "Content scale-out" phase-tracking row — *"hand-authored, AI-generated and reviewed, or a hybrid —
  and what's the review bar before content ships?"* — an agent (or a human) can freely edit a `draft`
  challenge, and `publishChallenge` is the review bar.

**Non-goals (explicitly out of scope for the build this spike feeds, and for this spike itself):**

- No production `challengeOps.ts` operation module. The op table below is a *specification*, not code.
- No MCP server, managed-agent prompt, or tool binding wired up.
- No change to any application code — there is none in this repository to change (`src/` is empty).
- **No in-product runtime agent editing.** No challenge engine of any kind exists yet to consume a
  `ChallengeSpec` (see [Agent binding options](#agent-binding-options) — the *consumption gap*), so an
  agent editing a live challenge in-product is blocked regardless of this contract.
- Not designing the **runtime scoring engine** — how a user's submitted answers are turned into a live
  `score` number during a challenge attempt. This contract only defines the `answerKey` and
  `scoringRubric` shapes that a future scoring engine would read; it does not specify the scoring
  algorithm itself.
- Not designing the **AI-generated summary** content (`docs/plans/features/ai-generated-summaries.md`
  owns that). This contract only supplies the `pointValue` and score inputs that summary consumes.

## The spec contract

The durable artifact an agent reads and writes is the `ChallengeSpec`:

```ts
export interface ChallengeSpec {
  version: 1
  id: string                      // stable content id, e.g. "budgeting-001"; set once, never reassigned
  title: string
  category: ChallengeCategory     // 'budgeting' | 'saving' | 'investing' | 'credit'
  difficulty: Difficulty          // 'easy' | 'medium' | 'hard'
  pointValue: number              // points a full-credit completion awards on the leaderboard
  questions: Question[]           // ordered question bank; array order is the on-screen sequence
  answerKey: AnswerKey            // Question.id -> correct answer(s); keyed by id, never by position
  scoringRubric: ScoringRubric    // how raw answers become a score + pass/fail
  status: ChallengeStatus         // 'draft' | 'published'
}

type ChallengeCategory = 'budgeting' | 'saving' | 'investing' | 'credit'
type Difficulty = 'easy' | 'medium' | 'hard'
type ChallengeStatus = 'draft' | 'published'

interface Question {
  id: string                      // stable id, e.g. "q_4f2a"; addressed by id, never by array index
  prompt: string
  type: QuestionType
  options?: QuestionOption[]      // required for multiple_choice / multi_select / true_false
  explanation?: string            // shown after answering; feeds the AI summary's "why" (see
                                   // docs/plans/features/ai-generated-summaries.md)
}

type QuestionType = 'multiple_choice' | 'multi_select' | 'numeric_input' | 'true_false'

interface QuestionOption { id: string; label: string }

// Keyed by Question.id. Values are option ids for choice-type questions, or a single
// normalized numeric string (e.g. "1600") for numeric_input.
type AnswerKey = Record<string, string[]>

interface ScoringRubric {
  method: 'all_or_nothing' | 'partial_credit' | 'weighted'
  passThreshold: number           // 0..1 — fraction of achievable credit required to "pass"
  perQuestionWeight?: Record<string, number>  // only read when method === 'weighted'; keyed by Question.id
}
```

**Identity & ordering.** `questions[]` order is the on-screen sequence a user answers in — array
position carries meaning (it's the "coordinate" `reorderQuestions` changes) — but a question's
**identity** is its `id`, not its position. `answerKey` and `scoringRubric.perQuestionWeight` are both
keyed by `Question.id`, never by index. This is the load-bearing design decision in this contract:
deleting or reordering a question must never silently detach its correct answer or its weight from the
wrong prompt, which an index-keyed design would risk on *every* `removeQuestion` (every key after the
removed index would need renumbering, and a missed renumber silently re-keys the wrong answer to the
wrong question). Because of this, `reorderQuestions` only ever touches `questions[]`; `answerKey` and
`perQuestionWeight` are untouched by a reorder.

This contract does not define how a raw `score` is computed from `answerKey` plus a user's submitted
answers at attempt time — that is the runtime scoring engine's job (see Goal & non-goals). This spec
only guarantees the rubric and answer key are structurally addressable by that engine once it exists.

This is the **only** shape ops produce. Every op returns a value that must round-trip through the
proposed structural validator (see [Validation & verification](#validation--verification)) unchanged
in structure.

## Operation vocabulary

Each op is **pure and immutable**: signature `(spec: ChallengeSpec, args) => ChallengeSpec`. It
returns a **new** spec and must **never** mutate its input (nor any nested array/object shared with the
input). Ops never throw for *domain* rejections — they either return a corrected spec, or the runner
records an error and skips the op (see [Headless runner design](#headless-runner-design)). Ops only
assume their input is already a valid spec; the runner re-validates the *output*.

| Op | Args | Semantics | Reuses (existing primitive) |
|---|---|---|---|
| `addQuestion` | `{ id?, prompt, type, options?, explanation? }` | Append a new question to `questions[]`; allocates `id` via the id primitive when the caller omits one. | array append copy (`[...questions, q]`); proposed `newId('q')` stable-id allocator. |
| `updateQuestion` | `{ id, patch: Partial<Omit<Question,'id'>> }` | Patch named fields of the question with id `id` (prompt / type / options / explanation); position and `id` unchanged. | `questions.map` immutable copy; object spread `{ ...question, ...patch }`. |
| `removeQuestion` | `{ id }` | Remove the question with id `id` from `questions[]`; delete its `answerKey[id]` entry and its `perQuestionWeight[id]` entry (if any). | `questions.filter` + key-omit copy of `answerKey` / `perQuestionWeight`; guard mirrors the proposed validator's "≥ 3 questions" rule. |
| `reorderQuestions` | `{ order: string[] }` | Rewrite `questions[]` in the given id order; `answerKey` / `perQuestionWeight` untouched (keyed by id, not position). | proposed `reindexQuestions(questions, order)` — **on a cloned array** (immutability hazard, see below). |
| `setAnswerKey` | `{ questionId, correctAnswer: string[] }` | Set/replace the correct-answer entry for one question. | object spread patch: `{ ...answerKey, [questionId]: correctAnswer }`. |
| `setDifficulty` | `{ difficulty }` | Set the challenge's difficulty tier (`easy` \| `medium` \| `hard`). | field-set spread `{ ...spec, difficulty }`. |
| `setCategory` | `{ category }` | Set the challenge's category tag (`budgeting` \| `saving` \| `investing` \| `credit`). | field-set spread `{ ...spec, category }`. |
| `setPointValue` | `{ pointValue }` | Set the points a full-credit completion awards on the leaderboard. | field-set spread; positive-integer guard. |
| `setScoringRubric` | `Partial<ScoringRubric>` | Patch named rubric fields, leave the rest. | object spread `{ ...spec.scoringRubric, ...patch }` (mirrors `updateQuestion`). |
| `publishChallenge` | `{}` | Flip `status` to `'published'` after passing the publish-time gate. | field-set spread `{ ...spec, status: 'published' }` + the proposed structural validator run in **publish mode**. |
| `unpublishChallenge` | `{}` | Flip `status` back to `'draft'`; no gate (relaxing a constraint is always safe). | field-set spread `{ ...spec, status: 'draft' }`. |

That is **11 ops**, each citing a reuse source. Per-op contract notes:

- **`addQuestion`** — *Pre*: `type` is a known `QuestionType`. *Rejects*: unknown `type`. *Invalid?*
  Structurally fine either way — a choice-type question added with zero `options` is a **semantic**
  gap the publish gate catches, not this op (a question can be added skeleton-first and filled in via
  `updateQuestion` next). The optional client-supplied `id` is the escape hatch for same-batch
  dependent ops (e.g., `addQuestion` immediately followed by `setAnswerKey` for the question it just
  created) — see [Open questions](#open-questions).
- **`updateQuestion`** — *Pre*: `id` exists in `questions[]`. *Rejects*: unknown `id`. *Invalid?* A
  `patch.type` change that leaves `options` shaped for the old type (e.g., `numeric_input` →
  `multiple_choice` without supplying new `options`) is accepted structurally but flagged by the
  publish gate. `patch` can never contain `id` (enforced by the `Omit`).
- **`removeQuestion`** — *Pre*: `questions.length > 3` (post-removal count stays ≥ 3). **Rejects when
  the result would drop below 3** — a content convention adopted for this contract, not yet a stated
  product requirement (flagged in Open questions), chosen because a 1–2 question "challenge" doesn't
  produce a score meaningful enough for the leaderboard or for the AI summary's "how they scored"
  field. Also strips now-orphaned `answerKey` / `perQuestionWeight` entries so a later
  `publishChallenge` never sees dangling keys.
- **`reorderQuestions`** — *Pre*: `order` is a permutation of the current `questions[].map(q => q.id)`
  (same set, no duplicates, no drops). *Rejects*: an `order` that adds, drops, or duplicates an id.
  *Invalid?* No — structurally always produces a valid `Question[]`, but a stale `order` array
  (computed before a concurrent `addQuestion` / `removeQuestion` in the same batch) silently reorders
  the wrong subset; the runner should re-derive "current ids" immediately before applying this op, not
  trust a caller-cached list.
  **IMMUTABILITY (critical):** the proposed `reindexQuestions` primitive (a bulk-reposition helper
  anticipated for a future content-import/reorder utility) is documented as mutating its input array
  in place. To stay pure, the op MUST clone first:
  ```ts
  const questions = spec.questions.map(q => ({ ...q }))   // copy BEFORE reindexing
  reindexQuestions(questions, args.order)                  // mutates the copy only
  return { ...spec, questions }
  ```
  Cloning the array of question objects is sufficient — `answerKey`, `scoringRubric`, and every other
  top-level field are untouched and may be shared by reference.
- **`setAnswerKey`** — *Pre*: `questionId` exists in `questions[]`; `correctAnswer` is a non-empty
  string array. *Rejects*: unknown `questionId`; empty `correctAnswer`. *Invalid?* Structurally fine,
  but this op does **not** check that every id in `correctAnswer` actually exists among that question's
  own `options[]` — referential integrity is a semantic check deferred to the publish gate (see
  [Validation & verification](#validation--verification)), the same way the coastline-editing precedent
  this contract's format is drawn from defers self-intersection checks past the individual op.
- **`setDifficulty`** — *Pre*: `difficulty` is one of the three valid tiers. *Rejects*: any other
  string. *Invalid?* No — a closed enum, structurally guarded entirely by the op itself; nothing is
  left for the validator to catch.
- **`setCategory`** — same shape as `setDifficulty`: a closed four-value enum (`budgeting` / `saving` /
  `investing` / `credit` — the exact module tags used in the Phase 0 KPI doc and `origin.md`).
  *Rejects*: any other string, including the longer prose form "credit management" used elsewhere in
  the docs — the enum value is intentionally the short tag, not the prose name.
- **`setPointValue`** — *Pre*: `pointValue` is a finite positive integer. *Rejects*: `≤ 0`,
  non-integer, non-finite. *Invalid?* No — guarded, though the *product's* intended range (e.g., a
  10–50 band for the fixed-track MVP) isn't fixed anywhere in the product docs yet; this op accepts any
  positive integer and leaves range convention as an authoring-time editorial call, not a structural
  one.
- **`setScoringRubric`** — *Pre*: every provided field is well-typed (`method` in the closed enum;
  `passThreshold` finite; `perQuestionWeight` values finite if present). *Rejects*: malformed field
  values. *Invalid?* No structurally, but two semantic foot-guns the op doesn't catch: `passThreshold`
  outside `(0, 1]` is accepted here but meaningless to a scoring engine (`0` always passes; negative or
  `> 1` never/always passes in a confusing way); `method: 'weighted'` with a `perQuestionWeight` that
  doesn't cover every current question id silently under-weights the missing ones. Both are candidate
  publish-gate checks (below).
- **`publishChallenge`** — *Pre*: the full publish-time gate passes — `questions.length ≥ 3`; every
  question has an `answerKey` entry; every `answerKey` id exists among that question's own `options`
  for choice types; `category` and `difficulty` are set; `pointValue > 0`; `passThreshold ∈ (0, 1]`;
  a `weighted` rubric's `perQuestionWeight` covers every current question id. *Rejects*: any gate
  failure, collected as one message per failed check so an agent sees the whole list in one round-trip,
  not one at a time. *Invalid?* By construction, no — a spec that passes `publishChallenge` is scorable
  end-to-end.
- **`unpublishChallenge`** — *Pre*: none. *Rejects*: nothing. *Invalid?* No — moving a challenge back
  to `draft` can never make an already-valid structure invalid; it only changes what gate the *next*
  edit needs to clear.

**Minimality.** This set is intentionally small: question-bank edits (add / update / remove / reorder),
the answer-key patch, three challenge-level field setters (difficulty / category / point value), a
rubric patch, and the two status transitions. It covers every field of `ChallengeSpec` and follows a
strict "one op, one concern" discipline — `addQuestion` deliberately does not also accept a
`correctAnswer`, so a same-batch `setAnswerKey` is always the explicit second step, not an implicit side
effect.

## Immutability & undo model

**Immutable ops.** Every op returns a new spec; the previous spec object is never mutated. This makes
ops trivially composable (`reduce` a list of ops over a spec) and trivially undoable (keep the prior
reference).

**Undo via a content command stack.** No `commandStack.ts`-equivalent exists in this repository yet
(see [Headless runner design](#headless-runner-design)), but once a content-editor UI exists, the same
"record already-applied commands" shape applies directly:

```ts
setSpec(next)
stack.push({
  label: 'setAnswerKey',
  do:   () => setSpec(next),   // redo: re-point state at the new spec
  undo: () => setSpec(prev),   // undo: re-point state at the old spec
})
```

Because specs are immutable, `do` / `undo` are just reference swaps — no inverse-operation math. This
matters more here than it might look: an inverse for `removeQuestion` would otherwise require
reconstructing a deleted question's full option list, explanation text, and answer key from nothing.
The immutable model sidesteps that entirely by keeping the pre-removal spec object around.

**Batch undo.** The headless runner (below) applies a *list* of ops as one logical edit. For
interactive use that batch should push **one** command whose `undo` restores the pre-batch spec, so a
single Ctrl-Z reverts the whole agent turn rather than one question edit at a time. (The headless CLI
doesn't use the stack at all — it just writes the final spec.)

## Headless runner design

> **Specification only.** The shapes below are the contract for a future build, not shipped code.

**Op input format.** A JSON array of tagged ops — the wire format an agent emits:

```json
[
  { "op": "addQuestion", "id": "q_50_30_20", "prompt": "You take home $3,200/month. Using the 50/30/20 rule, how much should go to needs?", "type": "numeric_input", "explanation": "50% of $3,200 = $1,600." },
  { "op": "setAnswerKey", "questionId": "q_50_30_20", "correctAnswer": ["1600"] },
  { "op": "setDifficulty", "difficulty": "medium" },
  { "op": "publishChallenge" }
]
```

Each object has a required `op` discriminator; remaining keys are that op's args (for
`setScoringRubric` the args ARE the partial rubric, minus `op`).

**Core function shape:**

```ts
function applyOps(
  spec: ChallengeSpec,
  ops: OpInput[],
): { spec: ChallengeSpec; errors: OpError[] }
```

- Folds the ops over the spec: `result = ops.reduce(apply, spec)`.
- **Never throws mid-batch.** An unknown `op` name or a failed precondition is **collected into
  `errors`** (`{ index, op, message }`) and that op is **skipped** — the fold continues from the last
  good spec. This lets an agent see *all* problems in one round-trip instead of one-at-a-time.
- After the fold, the result spec is **re-validated** (see below). A validation failure is appended to
  `errors`; the caller decides whether to write a spec that has errors (the CLI refuses — below).
- The returned `spec` is always a valid-by-construction object when `errors` is empty.

**Thin CLI wrapper** (the near-term agent entry point — see
[Agent binding options](#agent-binding-options)):

```
applyOps <spec.json> <ops.json> [--out out.json] [--mode draft|publish]
  1. read + deserializeSpec(spec.json)        → starting spec (throws → exit 2, "bad input spec")
  2. JSON.parse(ops.json)                     → op list
  3. { spec, errors } = applyOps(spec, ops)
  4. if errors.length → print each to stderr, exit 1, write NOTHING
  5. validateSpecObject(spec, { mode })       → re-validate output; publish mode also runs the
                                                 semantic publish-time gate (belt-and-braces; applyOps
                                                 already ran it for a publishChallenge op)
  6. write serializeSpec(spec) to --out (or stdout)
```

The CLI is the only place that touches the filesystem, so `applyOps` and the ops stay pure and
unit-testable. It is meant to be a **wrapper around a future pure core**, not a new engine in itself.

**Headless entry-point caveat.** This repository currently ships **no runtime at all** — no
`package.json`, no `tsconfig.json`, no framework scaffold; `src/` is empty
(`docs/plans/CURRENT_STATE.md`). A Node CLI for `applyOps` therefore has two prerequisites that precede
this contract, not one: (1) a chosen language and runtime for the pure content core — TypeScript is
assumed throughout this document as the most likely choice given the product's mobile-first web target,
but that choice is **not yet made** (`docs/plans/finfy-literacy.md` is currently unrewritten placeholder
content, not an implementation plan); and (2) the pure `challengeSpec.ts`-equivalent module actually
being written. Until both land, this section describes the shape the runner should take once a core
exists, not a runnable command.

## Validation & verification

**Hard requirement.** Every spec the runner emits MUST pass a canonical structural validator before it
is written or persisted. No such validator exists as code yet (see the caveat above); this document
specifies its contract as `deserializeSpec(json)` / `validateSpecObject(obj)` — a throws-on-bad-input
function, matching the shape a typical content-import validator takes — so that whichever core gets
built has a spec to implement against, rather than inventing its own ad hoc checks.

**What the structural validator must check:** `version === 1`; `id` and `title` are non-empty strings;
`category`, `difficulty`, and `status` are each one of their closed enum values; `pointValue` is a
finite positive integer; `questions` is an array of well-shaped `Question` objects (`id`, `prompt`,
`type`, and `options` present only for choice-type questions); `answerKey` values are non-empty string
arrays; `scoringRubric.method` is one of its enum values and `passThreshold` is a finite number.

**What it does NOT check** (candidate extra checks, only relevant at `publishChallenge` time):

| Candidate check | Structurally caught? | Recommendation |
|---|---|---|
| **Answer-key coverage** — every question has an `answerKey` entry | No | **Add at the publish gate only.** A `draft` challenge is allowed to have unanswered questions mid-authoring; a `published` one is not. |
| **Answer-key referential integrity** — `correctAnswer` ids exist among that question's own `options` | No | **Add at the publish gate.** A dangling correct-answer id makes the question unscorable; this is the closest analog to a self-intersecting shape — not fatal to store, but must not ship. |
| **`passThreshold` within `(0, 1]`** | No — only "finite number" is checked | **Add** a small semantic check. `0`, negative, or `> 1` values are structurally fine numbers but produce a meaningless pass condition. |
| **Minimum question count (`≥ 3`)** | No — an empty `questions[]` is a structurally valid array | **Add at the publish gate.** `removeQuestion` already enforces this at the op level (see per-op notes); the publish gate re-checks it for specs assembled by other means (e.g., a bulk import). |
| **Duplicate `Question.id` values** | No | **Add** — a duplicate id silently corrupts `answerKey` / `perQuestionWeight` addressing (the second write for that id wins, the first becomes unreachable). Cheap to check: `new Set(questions.map(q => q.id)).size === questions.length`. |
| **Weighted-rubric coverage** — `perQuestionWeight` has an entry for every question id when `method === 'weighted'` | No | **Add at the publish gate**, conditional on `method === 'weighted'`. A missing entry silently zero-weights that question rather than failing loudly. |

Recommendation: keep the **structural validator as the hard gate** for every write, draft or
published, and run the **semantic / publish-gate checks** above only when `publishChallenge` is called.
Do **not** fold the publish-gate checks into the structural validator itself — keeping them separate is
what lets a `draft` challenge stay editable mid-authoring (missing answer keys, sub-3 question count,
unset difficulty) without constantly failing validation on every intermediate save.

## Agent binding options

How does an agent actually *invoke* `applyOps`? Three options, analyzed:

**(a) CLI invoked by a coding agent (e.g. Claude Code) — RECOMMENDED, build-next.**
A coding agent reads `spec.json`, writes an `ops.json` (or the runner accepts inline ops), runs the
CLI wrapper, and reads back the validated spec (or the `errors`). This is the lowest-risk path once a
content-editing core exists: no server, no schema-registration step, no hosted infrastructure — just a
pure function and a thin file-reading wrapper around it. The prerequisite is not "zero product changes"
the way it would be against an existing codebase; it is the pure core described in
[Headless runner design](#headless-runner-design) actually being written. Relative to (b) and (c), it
is still the smallest addition on top of that prerequisite — no server, no engine, no schema work.

**(b) MCP tool wrapping `applyOps` — PREMATURE.**
An MCP server could expose `applyOps` (and a `describeChallenge` read tool) so any MCP-capable agent
edits the spec without shell access. Technically clean — it's the same pure core behind a tool schema —
but **premature**: it adds a server to build, host, and version before the op vocabulary has been
proven through real use via (a). Build it only once the CLI has validated the op set and an actual
consumer wants tool-based access. No new capability over (a) for the current need — just a different
transport.

**(c) In-product managed-agent tool — BLOCKED.**
Wiring an in-product agent tool so a *live* challenge in the finfy-literacy app responds to agent
edits is **blocked on the consumption gap** and is the most premature of the three.

> **CONSUMPTION-GAP BLOCKER (named explicitly).** There is no challenge engine, no runtime, no mobile
> client, and no persistence layer anywhere in this repository. `src/` is an empty directory; there is
> no `package.json`, `tsconfig.json`, or any framework scaffold (`docs/plans/CURRENT_STATE.md`). This is
> a stronger blocker than a typical "the engine exists but doesn't read the new format yet" gap: **there
> is currently no engine of any kind for a `ChallengeSpec` to be consumed by.** Until a
> challenge-delivery surface exists and is built to read `ChallengeSpec` at runtime, no in-product agent
> edit — however well-designed the op contract — can affect what a newgrad actually sees. This blocker
> is independent of the op vocabulary: even a perfect `applyOps` only produces a JSON file that nothing
> in the product reads yet. (If `docs/plans/finfy-literacy.md` is rewritten with a concrete stack choice,
> or an actual `src/` implementation lands, this section must be revisited.)

**Recommendation:** ship the **CLI path (a)** first, once the pure `ChallengeSpec` core exists. Defer
**(b)** until the op vocabulary is proven and a tool-based consumer exists. Treat **(c)** as gated
behind two separate prerequisites — a chosen implementation stack (a rewritten
`docs/plans/finfy-literacy.md`) *and* a built challenge-delivery engine — and do not start it until both
land.

## Open questions

1. **Same-batch id dependency.** `addQuestion` without a client-supplied `id` produces a
   runner-allocated id the caller doesn't know until the batch returns, but `setAnswerKey` in the same
   batch needs that id. Require callers to always pass a client-supplied `id` to `addQuestion` when a
   same-batch `setAnswerKey` follows it (current recommendation, used in the example above), or have the
   runner return intermediate ids after each op rather than only at the end? Revisit if agents find
   id-allocation friction in practice.
2. **Answer-key referential integrity timing.** Should `setAnswerKey` reject an option id that doesn't
   exist among the question's own `options[]` immediately, or defer entirely to the `publishChallenge`
   gate (current design)? Deferring is friendlier for out-of-order authoring (set the answer before
   finishing the options) but lets a draft sit in a broken state indefinitely. Likely a warning at edit
   time, hard gate at publish — needs a decision.
3. **Numeric-input answer normalization.** `AnswerKey` stores numeric answers as a single normalized
   string (e.g., `"1600"`). What normalization rule — currency-symbol stripping, decimal rounding, a
   tolerance band for "close enough" budgeting math — does the runtime scoring engine apply? Out of
   scope for this spec-editing contract, but the rubric needs to name the rule it assumes, or an
   agent-authored numeric question is unscorable in practice.
4. **How does an agent *perceive* the current challenge to decide edits?** It needs to read state
   before writing ops. Candidates: (i) a **textual summary** (category, difficulty, question count,
   rubric method, publish status); (ii) a **full JSON dump**; (iii) a **rendered preview** (not
   available headlessly until a client exists). A `describeChallenge(spec) → text` read-side companion
   to `applyOps` is likely the first thing a real build needs, and pairs with binding option (b)'s read
   tool.
5. **Field-based vs. semantic ops.** The proposed set is field-based (`setDifficulty`, `addQuestion`
   with raw args). An agent authoring content from a topic prompt — "add a question about the 50/30/20
   rule" — may reason better in **semantic** terms than in raw op args. Do we layer a semantic
   vocabulary that *compiles down* to these ops (an LLM step that turns "add a 50/30/20 question" into a
   well-formed `addQuestion` + `setAnswerKey` pair), or keep the op surface field-based and let the
   calling agent do that translation itself? Affects both the op surface and Q4's perception layer.
6. **Op batch atomicity & partial application.** The current design **skips** bad ops and applies the
   rest (collecting `errors`). Is "apply the good ones" or "all-or-nothing (reject the whole batch on
   any error)" the right default for an agent turn? All-or-nothing is safer given that
   `publishChallenge`'s gate is the one place partial application could ship an unscorable challenge;
   partial-apply is friendlier for iterative agent authoring. Likely a CLI flag (`--atomic`), default
   undecided.
7. **Category / difficulty taxonomy ownership.** This contract treats `category` and `difficulty` as
   fixed four- and three-value enums. `docs/plans/features/gamified-challenges.md`'s open questions ask
   whether difficulty should eventually adapt per-user and whether categories grow as content scales
   out (its "Content scale-out" phase-tracking row). If either taxonomy grows or an adaptive-difficulty
   variant ships, every op that references the enum (`setCategory`, `setDifficulty`, the publish gate)
   needs to move in lockstep with wherever that taxonomy is ultimately owned.
