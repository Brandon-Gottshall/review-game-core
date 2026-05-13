# Workflow Session Contract

This document defines the canonical ownership boundary for the workflow/session layer in `review-game-core`.

The current shared modules are:

- `workflow/quiz-engine`
- `workflow/session`
- `workflow/persistence`
- `workflow/debug`
- `workflow/rendering`

These modules work together. Consumer apps should treat them as one contract, not as unrelated helpers.

## Purpose

The workflow layer gives consumer apps a deterministic quiz-turn state machine plus the session/debug seams needed to:

- route into a turn
- restore persisted state
- reset cleanly
- force deterministic browser/debug entry
- keep consumer shells presentation-focused

## Ownership boundary

Core owns:

- quiz-turn phase vocabulary
- deterministic turn transitions
- session identity and snapshot shape
- storage-key and persistence record helpers
- debug query parsing and route construction
- snapshot normalization/reset helpers

Consumer apps own:

- page layout and shell composition
- route selection at the app level
- question picking policies above the engine
- product copy and visual disclosure
- restore invalidation policy above the shared content-identity seam

## Quiz-turn phases

The shared quiz engine uses the canonical phase union:

- `routing`
- `question`
- `staged-answer`
- `support`
- `recovery`
- `complete`

Consumer apps may render these phases however they want.

They should not invent parallel workflow states when the shared phase vocabulary is sufficient.

## Session identity

`workflow/session` defines the stable identity inputs used across restore and storage seams:

- `sessionId`
- optional `learnerId`
- optional `anonymousId`

The core contract intentionally distinguishes:

- email-like learner ids
- anonymous browser ids

That lets consumer apps bind saved state either to a learner identity or to an anonymous session without changing the snapshot format.

## Snapshot contract

The canonical `SessionSnapshot` stores:

- version
- session identity
- created / updated timestamps
- route
- current concept id
- current question id
- completion flag
- opaque `state`
- opaque `metadata`

Core guarantees that snapshot helpers can:

- create a well-formed baseline snapshot
- normalize unknown or partial input into a snapshot
- reset a snapshot while preserving the envelope
- carry an optional content-identity marker inside `metadata`

Core does not guarantee that arbitrary consumer state inside `state` or `metadata` is semantically valid.

That remains consumer-owned.

When a consumer persists quiz-turn state, it should store the serializable quiz-engine authority in `state.workflow` by using:

- `createQuizEngineSnapshot(...)`
- `restoreQuizEngineState(...)`

That keeps the authoritative phase, stage index, support/recovery state, completion state, and staged answers in the shared workflow contract instead of in app-specific phase metadata.

Consumers may keep legacy partial workflow records readable by passing them through `restoreQuizEngineState(...)` with a valid fallback derived from their current question/checkpoint state.

## Persistence seam

`workflow/persistence` owns:

- persistence record shape
- key-building helpers
- memory adapter for deterministic tests
- optional hydrate/sync hooks

Core does not mandate local storage, remote storage, or a specific sync policy.

It only standardizes the seam so consumer apps do not reinvent persistence glue for every workflow.

## Debug seam

`workflow/debug` owns the deterministic query contract used for regression/debug routes.

The shared fields include:

- `wf`
- `seed`
- `route`
- `concept`
- `question`
- `section`
- `stage`
- `answer`
- `restore`
- `support`
- `session`
- `learner`

Core guarantees:

- parsing from search params or records
- normalization into a stable debug state
- query-string building
- deterministic debug-route construction

Consumer apps decide:

- which debug values are honored
- which app routes expose them
- whether they are public, internal, or test-only

## Restore and reset semantics

The workflow contract assumes:

- restore should preserve the shared envelope when possible
- reset should clear route/question/concept progress cleanly
- sync operations should not silently lose counters or completed-question history

If a consumer app detects that restored content is stale or invalid, it may fall back to reset behavior.

The shared seam is now:

- `metadata.contentIdentity`
- `readSessionSnapshotContentIdentity(...)`
- `setSessionSnapshotContentIdentity(...)`
- `clearSessionSnapshotContentIdentity(...)`
- `compareSessionSnapshotContentIdentity(...)`

Core standardizes how restore identity is recorded and compared.

Consumer apps still decide whether an `unknown` or mismatched field should trigger reset, migration, or partial preservation.

See [`workflow-content-invalidation.md`](./workflow-content-invalidation.md) for the canonical boundary.

## Rendering boundary

`workflow/rendering` standardizes renderer registration and missing-renderer detection.

Core owns:

- renderer registry helpers
- missing-type checks

Consumer apps own:

- the actual renderer components
- how a renderer appears in the shell

## Testing expectations

The shared workflow contract should always be defended by deterministic tests for:

- session storage keys and identity normalization
- snapshot create / normalize / reset behavior
- debug param parsing and route construction
- quiz-engine routing, staged progress, support, recovery, and completion
- restore/sync edge cases that matter to the shared envelope

Consumer repos should add browser regression and WF coverage on top of this contract, not instead of it.
