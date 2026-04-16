# review-game-core v0.3 — Goal Abstraction Family Spec

**Date:** 2026-04-16  
**Status:** Draft  
**Scope:** Document the canonical planning/goal abstraction family, its boundary with scheduler/workflow/graph, the normalization from the vendored `stats` precursor, and the vectors toward the idealized abstraction.

## Summary

The root core is ready for a planning abstraction family, but the abstraction should stay narrow and composable. It should evaluate normalized progress snapshots into recommendation state. It should not become a learner platform, dashboard layer, or course-specific orchestration system.

The target is a shared kernel that is:

- pure and deterministic
- generic over track ids
- count-based rather than concept-specific
- day-granular and local-date aware
- explicit about deadlines, recommendation roles, and active phases

## Canonical family

The canonical planning family is:

- `GoalPlan`
- `GoalPhaseDefinition`
- `GoalPhaseSnapshot`
- `GoalPhaseState`
- `GoalPlanEvaluation`
- `GoalDeadlineBehavior`
- `GoalTimeStatus`
- `GoalRecommendationRole`

The family is centered on phase ordering and normalized progress counts. A plan is a sequence of phases. A phase is a track-scoped recommendation unit. A snapshot is consumer-owned evidence for one phase. Evaluation derives the state that consumer apps need to launch, display, and persist recommendation flow.

## Boundary with adjacent systems

### `scheduler`
`scheduler` owns concept-level evidence, recovery, retention, and next-concept selection. Planning consumes the consumer-side rollup of that evidence. Planning does not re-implement concept spacing or mastery policy.

### `workflow`
`workflow` owns session state, persistence, debug routing, and quiz-engine transitions. Planning does not own routing, screen state, or session envelopes. It only produces recommendation state that workflow can consume.

### `graph`
`graph` owns structure, projection, and rebuildable domain models. Planning may be fed by graph-derived rollups, but the planning API itself remains graph-independent. Graph is an upstream source of counts, not a planning contract.

### app/platform layers
Learner identity, course policy, grade math, source/provenance, and launch UI remain above core. Those layers are allowed to derive snapshots and choose plans, but they do not belong inside the planning kernel.

## Normalization from the vendored `stats` precursor

The vendored `stats` copy is the migration seed. It already proves the shape, but it is app-shaped and must be normalized into root-core vocabulary.

Preserve:

- ordered plan and phase evaluation
- count-based snapshots
- local-date resolution
- explicit deadline behavior
- active-phase derivation
- track-priority derivation

Normalize:

- `GoalPhase` -> `GoalPhaseDefinition`
- `demote_to_catch_up_after_deadline` -> `advance_after_deadline`
- `passed` -> `past_due`
- app-specific helpers such as dashboard copy, track overlays, and exam-order fallback stay outside core

Do not carry forward:

- learner/profile objects
- dashboard copy generation
- exam-pack labels
- UI routing helpers
- progress unit names that imply a specific course topology

## Vectors to the idealized abstraction

### 1. `No planning surface` -> `first-class planning abstraction`
The root core should expose planning as a canonical module, not as scattered app helpers.

### 2. `App-shaped logic` -> `core-shaped vocabulary`
The abstraction should be named for the domain, not for the first consumer that needed it.

### 3. `Feature logic` -> `planning subsystem`
The abstraction should evaluate plans, not merely decorate dashboards.

### 4. `Concrete progress semantics` -> `unit-agnostic rollups`
Planning should consume progress counts only and remain agnostic to whether those counts came from concepts, sections, objectives, or proofs.

### 5. `Implicit deadlines` -> `explicit temporal policy`
Deadline behavior should be an input contract, not a hidden app rule.

### 6. `App-local heuristics` -> `formal recommendation state`
The kernel should publish active phase, catch-up state, queued state, and track priority so consumers do not re-derive the same rules.

### 7. `Entangled composition` -> `clean boundary`
Planning should sit beside scheduler, workflow, and graph, not absorb them.

## Expected evaluation semantics

- missing snapshot => zero progress
- duplicate phase ids => invalid
- duplicate snapshot ids => invalid
- negative counts => invalid
- unknown snapshots => ignored
- `targetCompletedUnits` defaults to `totalUnits`
- `isComplete` means `completedUnits >= targetCompletedUnits`
- `progressRatio` is clamped to `[0, 1]`
- `activePhase` is the `primary` phase, or `null` if all phases are complete
- `trackPriority` is the ordered distinct set of non-complete track ids

## Deliverable shape

The idealized abstraction should be documented as a small kernel API plus a boundary spec:

- canonical types and exports
- evaluation rules
- validation rules
- adjacent system boundaries
- migration mapping from the vendored precursor

That keeps the planning family useful to `stats`, `math1111`, and future consumers without making root core responsible for learner platform behavior.
