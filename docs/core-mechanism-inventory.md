# Core Mechanism Inventory

This document is the compact canonical inventory for migration and adoption work in `review-game-core`.

Use it to answer three questions:

1. which mechanism family already has a shared home in core
2. what a consumer app should normalize into that family
3. what should stay consumer-local even after adoption

This is intentionally not a rollout plan, PR sequence, or repo-by-repo choreography guide. It is the boundary map.

## How to use this inventory

- Start from the mechanism you already have in a consumer repo, not from the app's current folder layout.
- Normalize app-shaped evidence and state into the narrow shared core seam.
- Keep learner-platform behavior, product copy, and course-specific policy above core unless the contract below says otherwise.

## Mechanism table

| Mechanism family | Normalize into core | Core currently owns | Keep consumer-local | Canon docs |
| --- | --- | --- | --- | --- |
| Content primitives (`question`, `concept`, `generator`) | Authored questions, concept trees, and seeded generation inputs should conform to the shared content and generator shapes. | Question/concept primitives, seeded generator contracts, reusable authored-shape helpers. | Course-specific content inventories, renderer unions, answer wording, pedagogy text, grading nuance beyond shared contracts. | [`README.md`](../README.md), [`site/content/docs/quick-start.mdx`](../site/content/docs/quick-start.mdx) |
| Scheduler (`base` + `guided`) | Per-concept outcomes and progress should normalize into scheduler state and, when adopting the shared ladder, guided repetition state. | Spacing, mastery timing, recovery/retention mechanics, guided repetition phases, hard-attempt policy, selection reasons. | Prerequisite gating, launcher framing, special completion rules, product copy about mastery or support. | [`guided-repetition-policy.md`](./guided-repetition-policy.md), [`product-framing.md`](./product-framing.md) |
| Planning / goal family | Concept/section/objective/exam progress should roll up into count-based `GoalPhaseSnapshot` inputs. | Ordered phase evaluation, deadline behavior, recommendation roles, active-phase derivation, track priority. | Learner identity, grade thresholds, provenance/source overlays, plan labels, launcher CTAs, course policy. | [`planning-goal-contract.md`](./planning-goal-contract.md), [`goal-launcher-congruency.md`](./goal-launcher-congruency.md), [`planning-rollup-boundary.md`](./planning-rollup-boundary.md), [`source-provenance-boundary.md`](./source-provenance-boundary.md), [`plans/2026-04-16-goal-abstraction-spec.md`](./plans/2026-04-16-goal-abstraction-spec.md) |
| Workflow / session family | Route/session/debug state should normalize into the shared session envelope, quiz phases, persistence seam, debug query contract, and content-identity comparison seam. | Quiz-turn phase vocabulary, deterministic transitions, session identity, snapshot normalization/reset, persistence helpers, debug query parsing/building, renderer registration seam, restore content-identity comparison. | App shell composition, top-level routing, question-picking strategy above the engine, learner-facing copy, invalidation policy above the shared seam. | [`workflow-session-contract.md`](./workflow-session-contract.md), [`workflow-content-invalidation.md`](./workflow-content-invalidation.md), [`wf-contract.md`](./wf-contract.md) |
| Graph read model | Authored structure should project into rebuildable graph records and typed query results, not app-shaped runtime objects. | Projection model, typed query boundary, Neo4j value normalization, game-scoped reconciliation, rebuildable read-model doctrine. | Operational learner data, auth/billing data, source overlays, app-specific topology meaning, irreversible state. | [`graph-neo4j.md`](./graph-neo4j.md) |
| WF doctrine and validation | Browser and content checks should split into deterministic regression/validators versus low-context WF evidence. | WF pass/fail doctrine, debug-route compatibility for regression, validator seams for authored payload quality and scheduler invariants. | Concrete WF checklists, personas, credentials, screenshots/artifacts, final pass/fail on a consumer product flow. | [`wf-contract.md`](./wf-contract.md) |

## Canonical normalization maps

The common migration moves are:

- App-specific recommendation logic -> `GoalPlan` + `GoalPhaseSnapshot` + `evaluateGoalPlan(...)`
- Concept, section, or objective rollups -> count-based planning snapshots rather than app-local dashboard state
- Consumer-local repetition ladders -> guided scheduler state and selection reasons
- Ad hoc turn/session glue -> `workflow/session`, `workflow/persistence`, and `workflow/debug`
- Direct graph-driver values or app-shaped graph objects -> typed query helpers and normalized graph values
- Repo-owned browser harnesses used as the only quality gate -> regression coverage plus a separate low-context WF pass

## Current-to-ideal vectors

The preferred migration direction is:

- app-shaped heuristics -> core-shaped vocabulary
- implicit behavior -> explicit contracts
- mixed UI + policy logic -> pure shared kernels with consumer adapters
- route-specific debug tricks -> standardized debug seams
- product-specific evidence objects -> normalized counts, progress state, or projection inputs

If a candidate mechanism cannot survive that normalization without carrying course copy, learner-platform policy, or rollout-specific assumptions, it probably does not belong in core yet.

## Adoption guidance

Adopt one family at a time.

- If multiple games need the same deterministic rule, normalize it into the existing core family before adding more consumer-local variants.
- If consumer repos only share labels or rough intent, keep the behavior local and document the seam instead of forcing a premature runtime abstraction.
- Prefer feeding core with normalized inputs over moving full consumer subsystems into the package.
- Treat the canon docs as the ownership source of truth; use plan docs and repo history as migration rationale only.

## Deferred seams

Some adjacent ideas are intentionally documented without being promoted into shared runtime ownership yet.

- [`saved-plan-seam-evaluation.md`](./saved-plan-seam-evaluation.md) records why reusable learner saved plans still need second-consumer proof before they should become a core seam.

## Non-goals

This inventory does not define:

- repo-specific rollout order
- PR splitting strategy
- preview or deployment choreography
- which consumer repo should migrate first

Those are delivery concerns above the shared mechanism boundary.
