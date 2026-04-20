# Planning / Goal Contract

This document defines the canonical planning boundary in `review-game-core`.

The planning layer is a pure evaluator. It turns normalized progress counts into recommendation state. It does not own learner-platform behavior, workflow state, or course-specific policy.

## Shared family

The canonical planning family is:

- `GoalPlan`
- `GoalPhaseDefinition`
- `GoalPhaseSnapshot`
- `GoalPhaseState`
- `GoalPlanEvaluation`
- `GoalDeadlineBehavior`
- `GoalTimeStatus`
- `GoalRecommendationRole`

These types live in `src/goal/index.ts`.

## Purpose

Planning exists so multiple consumer apps can answer the same question with one deterministic kernel:

> Given an ordered plan and count-based evidence, what should the learner work on next?

Core planning owns:

- ordered phases within a plan
- day-granular deadline evaluation
- count-based completion targets
- active-phase derivation
- recommendation roles and track priority

Planning does not own:

- learner identity
- grade math
- launcher copy
- routing or screen state
- source/provenance overlays
- concept pedagogy

## Boundary with adjacent systems

`scheduler` owns concept-level evidence, repetition ladders, recovery, and next-concept selection.

Planning consumes rolled-up counts from that layer. It does not re-implement mastery or spacing policy.

`workflow` owns session state, persistence, debug routing, and quiz-turn transitions.

Planning may tell a consumer app which track or phase is primary, but it does not own route selection or session envelopes.

`graph` owns rebuildable structure and typed read models.

Planning may consume counts derived from graph-backed queries, but the planning API stays graph-independent.

## Core semantics

The planning contract assumes:

- progress is count-based
- dates are local-date strings in `YYYY-MM-DD`
- missing snapshots default to zero progress
- unknown snapshots are ignored
- `targetCompletedUnits` defaults to `totalUnits`
- `progressRatio` is clamped to `[0, 1]`
- `isComplete` means `completedUnits >= targetCompletedUnits`

The evaluator should reject malformed inputs such as:

- duplicate phase ids
- duplicate snapshot ids
- negative counts
- invalid local-date strings
- snapshot track mismatches for a phase

## Recommendation roles

The shared recommendation roles are:

- `primary`
- `catch_up`
- `queued`
- `complete`

These roles are the stable planning output that consumer apps should render and interpret.

If a consumer app needs additional display nuance, it should derive that above core instead of minting parallel planning state inside the kernel.

## Deadline behavior

The shared deadline behaviors are:

- `stay_primary_until_complete`
- `advance_after_deadline`

This keeps time policy explicit.

Core planning decides whether a phase remains primary, becomes catch-up work, or yields to a later incomplete phase. Consumer apps should not hide deadline semantics in launcher copy or app-local heuristics when the shared policy is sufficient.

## Track priority

Planning publishes an ordered `trackPriority` list derived from recommendation roles and plan order.

That output is meant for:

- launch recommendations
- chooser defaults
- “work on this next” presentation

It is not a promise about UI layout or marketing copy.

## What stays above core

Consumer apps remain responsible for:

- defining which plans exist
- deriving count snapshots from concepts, sections, objectives, or other local units
- choosing how recommendation state appears in the launcher
- labeling phases in learner-facing copy
- carrying provenance/source labels

## Migration note

This contract is the stable kernel form of the earlier goal-abstraction draft in `docs/plans/2026-04-16-goal-abstraction-spec.md`.

That draft still contains the fuller migration rationale from vendored `stats` code. This document is the shorter canon contract consumer repos should target.
