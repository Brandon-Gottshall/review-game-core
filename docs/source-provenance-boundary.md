# Source / Provenance Boundary

This document defines the shared boundary for source honesty and provenance visibility in `review-game-core`.

Core should say what provenance may influence.
Core should not own the provenance labels themselves.

## Purpose

Consumer apps often need to distinguish progress that is:

- imported from another system
- partially derived from incomplete coverage
- blended from multiple sources
- computed from consumer-local heuristics or mappings

That distinction matters for user honesty.

It does not belong inside the shared runtime behavior.

## Core boundary

Core may consume normalized evidence that was derived from provenance-aware inputs.

Examples:

- planning may evaluate count snapshots that were built from imported or blended progress
- readiness may summarize units whose underlying evidence came from multiple consumer-local sources
- workflow or graph surfaces may carry identifiers that help a consumer app reconcile where evidence came from

Core does not interpret those origins as first-class behavior.

Core does not own:

- source inventories
- provenance taxonomies
- learner-facing labels such as `imported`, `partial`, `blended`, `ready`, or `doc_ready`
- badge, tooltip, or legend copy
- study-link surfacing or disclosure UI
- product rules about when provenance should block, warn, or soften a claim

## What provenance may feed

Provenance may feed consumer behavior above core, including:

- whether a product shows a caution, disclosure, or softer label
- whether a rollup is framed as approximate, imported, or mixed
- whether a learner sees drill-down detail before trusting a summary
- whether a consumer app chooses to derive a snapshot at all

Provenance may also be used to derive the inputs that core receives.

That is allowed.

The shared kernels still operate on normalized counts, readiness summaries, session state, or graph projections rather than on provenance labels.

## Honesty rule

Consumer apps must not use core outputs to erase source ambiguity.

If progress is partial, imported, blended, or consumer-derived:

- core planning may still evaluate the resulting normalized snapshot
- core readiness may still summarize the resulting normalized evidence
- consumer UI must keep any stronger source claim or disclaimer above those shared outputs

The existence of a normalized core output does not mean the underlying source should be presented as native, complete, or fully verified.

## Relationship to adjacent contracts

- [`planning-goal-contract.md`](./planning-goal-contract.md) keeps source/provenance overlays above the planning kernel.
- [`readiness-truthfulness.md`](./readiness-truthfulness.md) requires honest presentation when progress is partial, imported, or blended.
- [`core-mechanism-inventory.md`](./core-mechanism-inventory.md) keeps provenance/source overlays consumer-local across the current core families.

This document is the thin seam between those rules:

- provenance may shape consumer-derived inputs
- provenance may shape consumer-facing disclosure
- provenance should not become shared kernel behavior unless multiple consumers converge on a genuinely reusable contract

## Current posture

`review-game-core` does not currently define a provenance type family in code.

That is intentional.

The current shared requirement is boundary honesty, not a centralized label system.
