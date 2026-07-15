# PR description template

> Template for finfy-literacy's first (and future flag-gated) pull requests. Copy this file,
> fill in every `<placeholder>`, and delete this notice. Do not fill in placeholders with
> invented history — every bracketed value below must come from a real commit, a real test
> run, or a real reviewed output before this file is used as an actual PR description.
> Structural reference: `docs/plans/origin.md` (product ground truth), the relevant
> `docs/plans/features/*.md` spec, and this PR's implementation plan.

## Summary

<One-to-two sentence description of what this PR ships for finfy-literacy — e.g. "Ships the
MVP challenge engine (budgeting/saving/investing/credit modules), points + streak tracking,
real-peer leaderboard ranking, and the strict-format AI-generated post-challenge summary,"
or a narrower slice of that core loop if this PR covers less.> Built against
`<path to this PR's implementation plan>`.

- **Flag-gated rollout.** `<FEATURE_FLAG_ENV_VAR>=true` flips <production traffic / a specific
  cohort or peer group> onto <the new system, e.g. the AI-generated-summary pipeline, the new
  leaderboard ranking logic>; `false` keeps <the fallback behavior, e.g. the previous
  static end-of-challenge screen>. Feature flag stays in code so rollback during the
  observation window is a redeploy, not a revert.
- **Validation gate passed** (plan `<plan-doc-path>` §<section>). <Describe what was
  validated and how — e.g. "AI-generated summary rubric review: <N>/<N> post-challenge
  summaries parsed into the strict format cleanly, <N>/<N> sampled summaries passed manual
  rubric review across format-compliance, specificity of the next step, and tone.">
  See "Validation gate results" below.
- **PR 2 follow-up** opens as a draft against this branch to <cleanup task, e.g. remove the
  fallback summary path, delete the flag, remove a temporary scoring stub> once the
  observation window clears. <Optional forcing function — e.g. "A day-<N> CI guard fails the
  build on <date> if `<FEATURE_FLAG_ENV_VAR>` is still referenced in `<file path>`, forcing
  a decision to either ship PR 2 or explicitly extend the deadline.">

Plan: `<path to this PR's implementation plan, e.g. docs/plans/_archive/<date>-<seq>-<slug>-plan.md>`

## Step-by-step changes

| Step | Commit | What |
|------|--------|------|
| 1 | `<commit-hash>` | <step description> |
| 2 | `<commit-hash>` | <step description> |
| 3 | `<commit-hash>` | <step description> |
| ... | `<commit-hash>` | <step description> |
| N | `<commit-hash>` | <step description> |

## Validation gate results

<Rename the two subsections below to match what this PR actually validates. The
dimension/score table suits a rubric-scored output (most likely the AI-generated summary,
per `docs/plans/features/ai-generated-summaries.md`'s strict-format commitment). The
Output/Verdict/note table suits a set of individually reviewed generated artifacts (e.g. a
batch of sampled challenge summaries, or a batch of leaderboard-ranking edge cases).>

**<Component, e.g. AI-generated summary> — <N>/<N> reviewed samples pass.** <One sentence on
sample size and how samples were selected, e.g. "<N> summaries generated across the
budgeting/saving/investing/credit tracks; sample below assessed against the strict-format
rubric.">

| Dimension | Score |
|---|---:|
| <dimension, e.g. format compliance> | <score> |
| <dimension, e.g. specificity of next step> | <score> |
| <dimension, e.g. tone / anti-discouragement> | <score> |
| <dimension, e.g. accuracy vs. no-advice boundary> | <score> |

**<Component, e.g. leaderboard ranking> — <N>/<N> outputs reviewed (<N> pass, <N> concern).**
<One sentence of context, e.g. what fixture or peer-group data the outputs were generated
against, and what's still open.>

| Output | Verdict | One-line note |
|---|---|---|
| `<output-id>` | <pass / concern / fail> | <one-line note> |
| `<output-id>` | <pass / concern / fail> | <one-line note> |
| `<output-id>` | <pass / concern / fail> | <one-line note> |
| `<output-id>` | <pass / concern / fail> | <one-line note> |

<Optional caveat paragraph — e.g. "<N>th sample hit a parse failure pre-fix; the fix landed
in `<commit-hash>` but the output was not re-validated. Per plan §<section> we have <N>
reviewed outputs vs. the planned <N>.">

## What ships with this PR (PR 1)

- All Step 1–N commits.
- `<workflow file path, e.g. .github/workflows/<name>.yml>` shipped — <what it does, e.g.
  fails on `<date>` if `<FEATURE_FLAG_ENV_VAR>` is still referenced in `<file path>`>.
- **<Behavior, e.g. AI summary generation / leaderboard ranking> flips when**
  `<FEATURE_FLAG_ENV_VAR>=true` is set in `<deploy platform>` env vars
  (<environments, e.g. production + preview>). The PR merge itself does not change
  <behavior/traffic routing>.

## What does NOT ship with this PR

Deferred to PR 2 (cleanup, opens as draft same day):
- <item, e.g. removal of the fallback/legacy code path>
- <item, e.g. deletion of a temporary compatibility shim>
- <item, e.g. `<FEATURE_FLAG_ENV_VAR>` feature flag removal from `<config file>`>
- <item, e.g. `<workflow file path>` deletion (its job is done)>

Deferred to follow-up PRs (plan `<plan-doc-path>` §<section>):
- <item, e.g. adaptive/personalized challenge tracks (see `docs/plans/features/gamified-challenges.md`)>
- <item, e.g. weekly-reset vs. cumulative leaderboard A/B (see `docs/plans/features/leaderboards-peer-competition.md`)>
- <item, e.g. next-step framing A/B for the AI summary (see `docs/plans/features/ai-generated-summaries.md`)>
- <item, e.g. push-notification streak-risk reminders (see `docs/plans/features/mobile-first-design.md`)>
- <item — see `docs/followups.md`>

## Rollback procedure

**Pre-PR-2 window:**
- Set `<FEATURE_FLAG_ENV_VAR>=false` in `<deploy platform>` env vars and redeploy.
- <Old/fallback code path> is still present and functional behind the flag.
- <Any additive infra, e.g. new tables, new env vars> stays in place (additive; no rollback needed).

**Post-PR-2:**
- `git revert` of PR 2 + forward-fix of any drift in `<file path>` against `<file path>`.

## Test plan

- [ ] **CI green** — `<test command(s), e.g. pnpm typecheck / pnpm lint / pnpm test>`
      (<pass/skip counts>; CI runs <any env-gated tests> against `<environment>`).
- [ ] **`<deploy platform>` env vars set** — `<FEATURE_FLAG_ENV_VAR>=true` on
      `<environments>`; all `<related env var names>` populated.
- [ ] **Smoke against `<environment>`** — sign up as a new user, complete one challenge from
      each in-scope track, confirm points and streak update, confirm the peer leaderboard
      reflects the new score, confirm the AI-generated summary renders in the strict format
      (what they did / score / one next step / track position).
- [ ] **PR 2 draft opened against this branch** within 24h of PR 1 merge.
- [ ] **`<guard/deadline name>` verified inactive pre-deadline** by inspecting workflow
      output on this PR's CI run.

## `<Deploy platform>` env var change required at merge time

```
<FEATURE_FLAG_ENV_VAR>=true                 # <environments, e.g. production + preview>
<AI_PROVIDER_API_KEY>=<value>                # if not already set
<DATABASE_URL_ENV_VAR>=<value>               # <pooled/direct/etc.>
<LEADERBOARD_OR_OTHER_SERVICE_ENV_VAR>=<value>
<AUTH_PROVIDER_ENV_VAR>=<value>              # if not already set
```

See `<env setup doc path, e.g. docs/env-setup.md>` for the full walkthrough.
