# Readiness / Progress Truthfulness

This document defines the canonical claims boundary for readiness scores, phase labels, and normalized progress counts in `review-game-core`.

These surfaces exist to support recommendation, routing, and user-facing summary state across consumer apps. They are useful abstractions, but they are not psychometric instruments and they are not permission to overclaim.

## Shared surfaces

Core currently exposes two adjacent families of summary evidence:

- `readiness`
  `ReadinessScore` publishes a normalized `score`, a `PhaseState`, and recency/due metadata for a unit or rollup.
- `planning progress`
  Goal planning consumes normalized counts such as `completedUnits`, `totalUnits`, and `targetCompletedUnits` and turns them into recommendation state.

Both are deliberately simplified.

They answer questions like:

- how far along is this unit or track, in normalized core terms?
- what seems due, active, or complete?
- what should the learner probably work on next?

They do not, by themselves, answer questions like:

- will the learner pass an exam?
- how durable is transfer to unseen problems?
- how much understanding exists beyond the counted units?
- how trustworthy is a mixed rollup as a statement about every child?

## Phase-state truth

The shared `PhaseState` surface is categorical, not scientific precision.

- `not_started` means no meaningful progress has been recorded yet.
- `learning` means early exposure or supported progress exists.
- `practicing` means the unit is active and underway, but not yet stable mastery.
- `mastered` means the underlying unit-level rules say mastery was reached.
- `shaky` means instability or struggle is visible.
- `tracked_in_quiz` means the unit has quiz-tracked evidence, not that it is understood.

Consumer apps may relabel these states for learner-facing copy, but they must not upgrade their meaning. A softer label is acceptable. A stronger claim is not.

## What products may claim

- A unit or rollup has a normalized readiness score on a `0-100` scale.
- A unit is currently `learning`, `practicing`, `mastered`, `shaky`, or `tracked_in_quiz`.
- `X/Y` topics, sections, objectives, or other named units meet a consumer-defined criterion, as long as the named unit and criterion are real.
- A track or phase is `primary`, `catch_up`, `queued`, or `complete` according to the planning evaluator.
- A rollup has recent activity or an upcoming due item according to its published timestamps.

## What products may not claim

- That a readiness score is a grade prediction, pass probability, percentile, or measurement of certainty.
- That a rollup score proves every child is equally strong.
- That count completion is the same thing as understanding, transfer, retention, or course mastery.
- That `tracked_in_quiz` or `learning` means the learner knows the concept.
- That small score deltas reflect meaningful learner change on their own.

## No fake precision

Even though readiness is exposed as an integer, it should be treated as a coarse signal.

- Do not add decimal places.
- Do not imply that `67` and `68` reflect a meaningful scientific distinction.
- Do not rank or market tiny score deltas as precise improvement.
- If a consumer renders the score as a percent, the surrounding copy should still frame it as readiness or progress, not certainty.
- Broad bands, trend language, or phase/state language are usually more honest than highly exact phrasing.

## Approximate rollup honesty

`aggregateReadiness` is an approximate rollup, not a new source of ground truth.

Its current semantics are intentionally summary-shaped:

- `score` is the average of child scores.
- `phase` is a heuristic rollup derived from child `PhaseState` values and the average score.
- `lastPracticedAt` is the latest child practice timestamp.
- `dueAt` is the earliest child due timestamp.

That means aggregate readiness may support claims such as:

- overall readiness is around this level
- at least one child is due soon
- this parent area was practiced recently
- all children are mastered, if and only if the rollup phase is `mastered` because every child is `mastered`

It does not support claims such as:

- every child sits at the rollup score
- no weak pockets remain inside the rollup
- the learner is uniformly ready across the entire parent scope

## Count vs mastery boundary

Normalized counts are honest about coverage, not depth.

A consumer may truthfully say:

- `3/5 sections mastered`
- `12/20 units complete`
- `this phase is complete for planning purposes`

Those statements remain count claims.

They do not automatically mean:

- the learner can solve unseen variants
- the learner will retain the material later
- the course, exam, or subject is mastered in a holistic sense
- every uncounted or partially counted child is safe to ignore

When a consumer promotes a count into a stronger mastery statement, that stronger statement must be justified by consumer-local rules outside the core rollup itself.

## What stays consumer-owned

Core defines the truth boundary, not the presentation layer.

Consumers remain responsible for:

- visual design, charts, bars, dots, and dashboard layout
- learner-facing labels and explanatory copy
- which unit names are counted: topics, sections, objectives, exams, tracks, or other local scopes
- course-specific completion thresholds and when a unit counts as complete or mastered
- legends, tooltips, drill-downs, and copy that explains approximation
- provenance or source disclosures when progress is partial, imported, or blended

Consumer freedom stops where overclaiming begins. Apps may choose different visuals and tone, but they must keep the underlying promise no stronger than the normalized readiness and count surfaces actually justify.
