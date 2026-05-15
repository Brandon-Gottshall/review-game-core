# @brandon-gottshall/review-game-core

Shared primitives for concept-first learning and review games. Pure logic and types, no UI, and no framework lock-in.

## Public docs and showcase

The repo now includes a dedicated Next.js site in [`site/`](./site) for:

- a package showcase with real consumer examples
- a feature gallery with worked examples and source excerpts
- the canonical public docs base

The Vercel project for the site is `review-game-core-site`, attached to the `Brandon-Gottshall/review-game-core` repository and intended to build from the `site/` directory.

## Package surface

`review-game-core` currently includes:

- question and concept primitives
- seeded generators
- concept scheduling, including a shared guided repetition layer
- planning / goal evaluation
- workflow session, persistence, debug, and quiz-engine helpers
- WF harness validators, including optional Group 8 question-quality rule builders for deterministic leakage, signal, helper, subskill/goal, validator, and distractor checks
- graph contracts, query helpers, and projector interfaces

## Product framing

Consumer apps do not need to present themselves as review-only tools. The stronger default framing is:

> concept-first learning, with review and cram as modes built on top

See [`docs/product-framing.md`](./docs/product-framing.md) for the package position.

The shared scheduler now also exposes a canonical guided repetition policy:

- `Rep 1`: recognition
- `Rep 2`: recognition + setup
- `Rep 3`: light application
- `Rep 4`: proof-prep / near-independent
- `Rep 5+`: hard proof / harder transfer

That ladder is intentionally separate from planning. Planning decides which track should be frontmost; guided repetition decides how a chosen concept is taught and revisited.

## Breaking contracts

`src/scheduler/phase-state.ts` defines the canonical learner phase vocabulary used by shared readiness, launcher state, and quiz feedback:

- `not_started`
- `learning`
- `practicing`
- `mastered`
- `shaky`
- `tracked_in_quiz`

Treat additions or removals in that union as a breaking change for consumer apps.

## Install

```json
{
  "dependencies": {
    "@brandon-gottshall/review-game-core": "github:Brandon-Gottshall/review-game-core#v0.2.2"
  }
}
```

## Key docs in-repo

- [`docs/product-framing.md`](./docs/product-framing.md)
- [`docs/guided-repetition-policy.md`](./docs/guided-repetition-policy.md)
- [`docs/question-quality-contract.md`](./docs/question-quality-contract.md)
- [`docs/planning-goal-contract.md`](./docs/planning-goal-contract.md)
- [`docs/goal-launcher-congruency.md`](./docs/goal-launcher-congruency.md)
- [`docs/planning-rollup-boundary.md`](./docs/planning-rollup-boundary.md)
- [`docs/readiness-truthfulness.md`](./docs/readiness-truthfulness.md)
- [`docs/wf-contract.md`](./docs/wf-contract.md)
- [`docs/per-question-wf-gating.md`](./docs/per-question-wf-gating.md)
- [`docs/workflow-session-contract.md`](./docs/workflow-session-contract.md)
- [`docs/workflow-content-invalidation.md`](./docs/workflow-content-invalidation.md)
- [`docs/source-provenance-boundary.md`](./docs/source-provenance-boundary.md)
- [`docs/core-mechanism-inventory.md`](./docs/core-mechanism-inventory.md)
- [`docs/saved-plan-seam-evaluation.md`](./docs/saved-plan-seam-evaluation.md)
- [`docs/graph-neo4j.md`](./docs/graph-neo4j.md)
- [`docs/plans/2026-04-16-goal-abstraction-spec.md`](./docs/plans/2026-04-16-goal-abstraction-spec.md)

## Commands

```bash
npm test
npm run build
npm run graph:neo4j:up
npm run graph:smoke
npm run graph:neo4j:down
```

## Stability

`v0.x` is unstable. Pin consumers by tag.

## License

MIT
