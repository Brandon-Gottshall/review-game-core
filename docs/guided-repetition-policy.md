# Guided Repetition Policy

This document defines the shared guided-repetition layer that sits on top of the generic concept scheduler.

It is the canonical concept-first pedagogy for consumer apps that want staged concept acquisition before heavier independent transfer.

## Boundary

The scheduler stack now has two layers:

- `base scheduler`
  Low-level spacing, mastery, retention timing, and subskill evidence primitives.
- `guided scheduler`
  Shared concept-first repetition policy built on top of the base scheduler.

Planning stays separate.

- Planning decides which track, exam, or study goal should be frontmost.
- Guided repetition decides how an individual concept should be taught and revisited once that concept is selected.

Planning does not own recognition/setup/proof sequencing, recovery-light routing, or hard-attempt policy.

## Canonical ladder

The shared guided ladder is:

1. `Rep 1`
   Recognition.
2. `Rep 2`
   Recognition plus setup.
3. `Rep 3`
   Light application.
4. `Rep 4`
   Proof-prep or near-independent work.
5. `Rep 5+`
   Hard proof or harder transfer.

Policy defaults:

- `LIGHT_REP_TARGET = 4`
- `HARD_REP_TARGET = 2`
- `HARD_ATTEMPT_LIMIT = 3`
- `HARD_FAILURE_RECOVERY_LIGHTS = 2`

Only hard independent solves count toward mastery and later retention.

Supported or recovery-light passes can move a concept through the early ladder, but they do not award hard-proof credit.

## Recovery semantics

When a hard repetition is missed:

- the concept queues `2` lighter repair reps
- the recovery phase becomes `recovery-light`
- support mode is recorded as one of:
  - `same-concept-recovery`
  - `support-concept-recovery`

Consumer apps are expected to make hard mode behaviorally real:

- suppress hints or step-by-step rescue while the hard rep is live
- enforce the hard attempt cap
- explain the recovery queue in visible learner language

Core owns the structure of that state. Consumer apps still own the learner-facing copy.

## Selection semantics

The guided picker prioritizes:

1. recovery-due concepts
2. retention-due concepts
3. non-mastered concepts
4. earliest due turn
5. lower repetition index / weaker progress

Selection reasons normalize to:

- `new_concept`
- `guided_mastery`
- `recovery_due`
- `retention_due`
- `weakest_subskill:<subskill or joined subskills>`

Apps should not mint parallel scheduling labels when these shared reasons are enough.

## Persistence and migration

The guided layer is additive. The generic scheduler state still exists underneath it.

If a stored concept already has guided fields, preserve them.

If guided fields are missing, core backfills them from legacy evidence using these heuristics:

- independent proof/pass evidence implies the light ladder has already been cleared
- supported evidence implies the concept has early exposure but not hard mastery
- missing recovery fields default to no queued recovery

Defaults:

- `lightPassCount = 0` unless legacy evidence implies otherwise
- `hardPassCount = independent proof/pass count`, capped by `HARD_REP_TARGET`
- `recoveryLightRemaining = 0`
- `recoverySupportMode = none`

## Migration note for consumers

If a consumer currently wraps only the generic scheduler:

1. keep the base schedule state as-is
2. switch concept progress storage to `GuidedConceptProgressState`
3. compute per-question repetition metadata from `getConceptRepetitionPlan`
4. grade outcomes through `applyGuidedConceptOutcome`
5. use `pickNextGuidedConceptId` instead of re-implementing the concept-first ladder locally

Keep consumer-local concerns outside core, such as:

- mixed-concept prerequisite rules
- launcher or goal copy
- course-specific completion logic
- app-specific UI wording and telemetry labels

## Consumer contract

Core guarantees:

- canonical repetition phases
- recovery-light semantics
- standardized selection reasons
- consistent hard-proof mastery and retention counting

Consumers remain responsible for:

- question content and template selection
- UI copy and disclosure
- route/launcher decisions
- app-specific goal policies
