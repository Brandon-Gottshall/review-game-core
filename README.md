# @brandon-gottshall/review-game-core

Shared primitives for concept-first review games. Pure logic and types, no UI, and no framework lock-in.

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
- concept scheduling
- planning / goal evaluation
- workflow session, persistence, debug, and quiz-engine helpers
- WF harness validators
- graph contracts, query helpers, and projector interfaces

## Product framing

Consumer apps do not need to present themselves as review-only tools. The stronger default framing is:

> concept-first learning, with review and cram as modes built on top

See [`docs/product-framing.md`](./docs/product-framing.md) for the package position.

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
