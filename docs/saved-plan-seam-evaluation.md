# Saved-Plan Seam Evaluation

This document evaluates whether reusable learner saved plans are ready for shared runtime ownership in `review-game-core`.

Short answer: not yet.

The current evidence supports a boundary note, not a promoted core seam.

## Current shared base

`review-game-core` already has a stable planning kernel:

- `GoalPlan`
- `GoalPhaseDefinition`
- `GoalPhaseSnapshot`
- `GoalPlanEvaluation`
- deadline behavior and recommendation roles

That kernel is intentionally pure. It evaluates ordered plan progress from normalized counts. See [planning-goal-contract.md](./planning-goal-contract.md).

Core also has a presentational goal-planner shell in `src/ui/goal-planner.tsx`.

That UI proves there is learner-facing demand for:

- saving a goal plan
- editing it later
- changing deadlines or thresholds
- toggling candidate units
- showing a live recommendation against the current selection

But that shell is not yet a shared persistence contract.

## What is not shared yet

Reusable learner saved plans are not just `GoalPlan` plus storage.

A real saved-plan seam would need shared answers for questions such as:

- what exactly is being saved: a canonical `GoalPlan`, a learner-authored overlay, unit selections, score inputs, or all of them
- whether the saved object is a draft, active plan, preset, override, or historical snapshot
- how saved plans bind to learner identity, anonymous sessions, or course context
- whether saved scores are durable evidence, temporary planner inputs, or UI-only overrides
- whether editing a saved plan mutates the same record, creates a new revision, or replaces the active choice

None of those semantics are canonical in core today.

## Why this is not ready for promotion

The current shared planning contract explicitly keeps these concerns above core:

- learner identity
- launcher/UI behavior
- provenance/source overlays
- app-specific policy

Reusable saved plans sit directly inside those consumer-owned concerns.

The only concrete evidence in core right now is:

- a pure evaluator over count-based snapshots
- a generic planner card with fields like readiness target, deadline, selected units, optional saved score inputs, and save/clear actions

That is enough to justify a reusable UI shell and planning kernel.

It is not enough to justify:

- a shared saved-plan record schema
- a storage adapter contract
- plan revision semantics
- cross-app restore/migration rules

Promoting a runtime seam now would force one consumer's product assumptions into core.

## Recommendation

Keep reusable learner saved plans as `boundary only` for now.

Core should not yet own:

- saved-plan persistence models
- storage keys or sync behavior
- active/draft/archive lifecycle semantics
- saved-score durability rules
- learner-facing save/edit/replace flows

Consumer apps should continue to:

- define what a saved plan means in that product
- decide whether plan inputs are advisory, authoritative, or temporary
- choose how saved plans bind to learner/session identity
- own plan edit history, overwrite behavior, and UI recovery

## What evidence would justify promotion later

This should only move toward shared runtime ownership if there is real second-consumer convergence.

The minimum convincing evidence is:

- `Second-consumer reuse`
  A second consumer app needs learner-saved plans, not just planning evaluation, and its durable shape is materially the same.
- `Stable object semantics`
  Both consumers agree on what the saved record represents: for example a selected plan template plus learner overrides, rather than unrelated product-specific objects with the same label.
- `Shared lifecycle`
  Both consumers need the same basic save/edit/clear/replace behavior and do not diverge on draft vs active vs historical semantics.
- `Identity/storage convergence`
  Both consumers can use the same binding model for learner identity or anonymous sessions without app-local hacks dominating the record shape.
- `Migration pressure`
  At least one real migration or restore problem appears because saved-plan data cannot move cleanly between implementations without a normalized seam.

Without those signals, a core abstraction would be speculative.

## If promotion ever becomes justified

The first promoted seam should stay narrow.

A reasonable first step would be:

- a small saved-plan record type that references existing planning primitives
- optional helper validation/normalization
- no mandated UI
- no claim that core owns learner storage policy

It should not begin as:

- a full planner subsystem
- a course-specific unit-selection model
- a universal score-entry workflow
- an opinionated persistence product

## Current boundary

Core owns:

- deterministic plan evaluation
- shared planning vocabulary
- reusable planner presentation primitives when helpful

Core does not yet own:

- reusable learner saved-plan persistence
- saved-plan lifecycle semantics
- learner storage or sync policy
- override meaning for planner inputs such as saved scores

## Conclusion

Reusable learner saved plans are adjacent to the planning kernel, but they are not yet proven to be a shared kernel themselves.

The honest status is:

- keep planning evaluation in core
- keep saved-plan behavior local
- revisit only after a second consumer demonstrates the same durable saved-plan shape and lifecycle
