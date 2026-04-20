# Workflow Content Invalidation

This document defines the shared invalidation seam for restored `workflow/session` snapshots when authored question content drifts.

It extends the boundary in [`workflow-session-contract.md`](./workflow-session-contract.md) without changing the existing session snapshot envelope.

## Purpose

Persisted workflow state can outlive the authored question it was saved against.

That creates a shared problem:

- a snapshot may still point at the same `currentQuestionId`
- the authored prompt, stages, answer contract, or support copy may have changed
- consumer apps need one common place to record and compare restore identity

Core owns that seam.

Core does not own the policy for every content family.

## Core ownership

`workflow/session` now standardizes an optional content-identity marker inside `SessionSnapshot.metadata`:

- `metadata.contentIdentity.questionId`
- `metadata.contentIdentity.contentId`
- `metadata.contentIdentity.contentVersion`

The shared helpers let consumers:

- stamp a snapshot with `setSessionSnapshotContentIdentity(...)`
- read the persisted marker with `readSessionSnapshotContentIdentity(...)`
- remove the marker with `clearSessionSnapshotContentIdentity(...)`
- compare restored state against current authored identity with `compareSessionSnapshotContentIdentity(...)`

The comparison result intentionally separates:

- `mismatchFields`: both sides supplied a value and the values disagree
- `unknownFields`: the consumer asked to compare a field, but the restored snapshot did not carry a value for it

That distinction is the core seam.

It lets core report hard drift without forcing one universal invalidation policy for legacy or partially stamped snapshots.

## Consumer ownership

Consumers still decide:

- how to compute `contentId`
- what counts as `contentVersion`
- whether `unknownFields` should invalidate older snapshots
- whether to reset, migrate, or partially preserve restored progress
- when to restamp a snapshot after route/question selection

Examples of valid consumer-owned `contentVersion` inputs:

- an authored revision id
- a build hash
- a stable checksum over the learner-visible question contract
- a CMS update token

Core does not choose among those.

## Recommended restore flow

1. Save snapshots with the current question/content identity marker.
2. Restore with `normalizeSessionSnapshot(...)` as usual.
3. Compare the restored marker against the current authored identity.
4. If consumer policy rejects the result, fall back to `resetSessionSnapshot(...)`.
5. Restamp the next persisted snapshot with the current identity.

## Compatibility

The snapshot envelope is unchanged:

- no new top-level `SessionSnapshot` fields were added
- older snapshots still normalize successfully
- legacy snapshots without `metadata.contentIdentity` compare as `unknown`, not as forced mismatches

That keeps restore compatibility intact while giving consumers a shared, testable invalidation seam.
