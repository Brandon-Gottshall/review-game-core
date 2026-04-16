# Product Framing

This package is named `review-game-core`, but consumer apps built on top of it do not need to be framed as review-only products.

In practice, a strong consumer may be doing something more valuable:

- teaching the governing concept first
- checking the learner's setup and decision path
- asking for independent proof only after the concept is understood
- adapting support level as mastery changes

## Core position

The best default interpretation is:

> concept-first learning, with review and cram as modes built on top

That framing extends to the planning layer as well. The core does not treat planning as a learner platform or a UI affordance; it treats it as a derived abstraction family that converts normalized progress snapshots into recommendation state.

That means a question flow should usually behave like this:

1. `Recognize`
   The learner identifies the concept, rule, or condition that governs the problem.
2. `Structure`
   The learner commits to the setup, transformation, or next move.
3. `Prove`
   The learner performs the math, logic, or execution without the earlier scaffolding.
4. `Retain`
   The system revisits the concept later with lighter support and mixed context.

This package already fits that shape well:

- concept trees define what is being learned
- schedulers decide when support/retry/review should occur
- workflow helpers support staged checkpoints, persistence, recovery, and deterministic browser validation
- planning helpers define which track or phase should be primary, catch-up, queued, or complete

## Naming guidance for consumer apps

Consumer repos should choose product language that matches the learner-facing reality.

Prefer:

- `learn`
- `practice`
- `build`
- `prove`
- `master`
- `quick test prep` or `cram` for explicit compression modes

Avoid using `review` as the only label when the primary flow is actually instructional.

## Content guidance

Consumer content should assume:

- concept recognition comes before arithmetic burden
- setup questions test the key move, not disposable computation
- final answers are proof of understanding, not the first place understanding is checked
- help text should teach, then fade

## Product boundary

This document does not redefine every consumer app. Some repos may still be straightforward review tools.

It does define the stronger general pattern for the shared core:

- the package supports adaptive, staged, concept-first learning
- "review game" is the implementation lineage, not the only valid product framing
- the planning/goal family is a shared abstraction boundary, not a consumer-specific dashboard
- scheduler, workflow, and graph stay adjacent to planning, not absorbed by it
