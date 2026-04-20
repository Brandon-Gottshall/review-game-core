# Planning Rollup Boundary

This document defines the thin shared contract for using section, objective, topic, or similar rollups as inputs into planning in `review-game-core`.

The core rule is simple:

> planning consumes normalized counts, not course topology

Consumer apps may organize progress by sections, objectives, topics, proofs, or other local units. Core planning should only see the resulting count snapshot.

## Purpose

The planning layer answers:

> Given an ordered plan and count-based evidence, what should the learner work on next?

It does not answer:

- what the authoritative course hierarchy is
- which unit taxonomy a product should use
- whether a counted unit represents deep mastery
- how a dashboard should visualize rollups

## Valid normalized rollup

A section/objective/topic rollup is a valid planning input only when it can be reduced honestly to a `GoalPhaseSnapshot`.

That means:

- the snapshot belongs to one explicit `phaseId`
- the snapshot uses the matching `trackId` for that phase
- `completedUnits` is a non-negative integer
- `totalUnits` is a non-negative integer
- the denominator is a real, named set of units inside the consumer's scope
- the numerator is derived from one consistent completion rule across that denominator
- each counted unit contributes at most once to the snapshot
- the snapshot can be rebuilt from consumer-owned source data rather than ad hoc UI math

If a consumer cannot say what the units are, what the denominator is, or why a unit counts as complete, it does not yet have a valid normalized rollup.

## Unit-agnostic contract

Planning stays agnostic to whether the counted units are:

- topics
- sections
- objectives
- lessons
- proofs
- exercises

Those names are consumer vocabulary. Core only requires that they normalize into honest counts.

This is why `GoalPhaseSnapshot` stays count-shaped:

- `completedUnits`
- `totalUnits`
- phase identity
- track identity

It does not embed section trees, objective catalogs, or course-specific labels.

## Relationship to readiness

Readiness and planning are adjacent, but they are not the same surface.

- readiness publishes normalized summary signals such as `ReadinessScore`, `PhaseState`, and approximate rollups
- planning consumes count snapshots such as `completedUnits` and `totalUnits`

Consumers should not turn readiness percentages or aggregate readiness scores directly into planning counts.

Examples of invalid planning inputs:

- using `74% ready` as if it were `14.8/20 units complete`
- averaging section readiness scores and treating the result as completed-unit evidence
- converting a heuristic phase like `practicing` into a completed count without a separate consumer rule

If a consumer wants readiness to influence count completion, that policy remains local. Planning should receive only the resulting count snapshot, not the intermediate heuristic.

## Truthfulness constraints

This boundary inherits the rules in [`readiness-truthfulness.md`](./readiness-truthfulness.md).

Count rollups may support claims such as:

- `3/5 sections complete`
- `12/20 objectives done for this phase`
- `this plan phase is complete`

They do not automatically support claims such as:

- `60% of the course is mastered`
- `the learner understands 12/20 objectives deeply`
- `every section inside this phase is equally strong`

Planning completion is a count/result claim, not a blanket mastery claim.

If a consumer uses stronger words such as `mastered`, that stronger label must be justified by the consumer's own unit rule, not by planning's count surface alone.

## What core may expose generically

Core may expose generic rollup support only when it stays topology-agnostic.

That includes:

- `GoalPhaseSnapshot` as the normalized planning input
- `GoalPhaseState` and `GoalPlanEvaluation` as normalized planning output
- validation of count integrity, phase identity, track identity, and completion semantics
- generic helper functions, if added, that accept caller-provided unit ids or unit states and return plain counts or snapshots

Any shared helper in this area should operate on explicit caller-supplied units. It should not require core to know what a section, objective, or topic means in a specific course.

## What stays consumer-local

Consumers remain responsible for:

- defining the actual hierarchy: exams, sections, objectives, topics, or other units
- mapping concepts, questions, proofs, or attempts onto those units
- deciding what makes a unit count as complete or mastered
- resolving overlap and deduplication when multiple local structures reference the same underlying work
- choosing whether a phase should count sections, objectives, topics, or another unit family
- handling imported, partial, manual, or provenance-sensitive progress states
- learner-facing labels, legends, charts, drill-downs, and copy

Core should not own official course topology, course titles, section ordering, objective definitions, or consumer-specific completion heuristics.

## Example normalization path

A consumer may own a hierarchy like:

- Exam 1
- 5 sections
- 24 topics

If that consumer decides the planning phase for `exam-1` should count completed sections, it may locally derive:

- which 5 sections belong to the phase
- what rule makes a section count as complete
- how overlapping topic evidence resolves into one section result

It then emits a plain snapshot such as:

```ts
{
  phaseId: 'exam-1',
  trackId: 'exam',
  completedUnits: 3,
  totalUnits: 5,
}
```

Planning can evaluate that snapshot without knowing anything about the section titles, topic tree, or mastery logic behind it.

## Boundary summary

Section/objective/topic rollups belong in core only as a normalization seam.

Core owns:

- count-shaped planning inputs and outputs
- deterministic planning evaluation
- validation rules for honest snapshots

Consumers own:

- topology
- unit meaning
- completion policy
- stronger mastery narratives
- presentation
