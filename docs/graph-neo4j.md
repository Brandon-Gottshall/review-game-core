# Graph Neo4j Runtime

This package includes an optional Neo4j subsystem for projected learning-domain graphs.

## Intended role

Neo4j is used as:

- a query-optimized graph read model
- a reusable domain graph across games
- a substrate for future inference and graph completion

Neo4j is **not** the operational store for:

- learners
- sessions
- raw events
- audit records
- auth or billing data

Those remain better served by the consumer app's operational database.

## Source of truth

In the current architecture:

- authored learning structure remains code-first in TypeScript
- Neo4j is projected from that authored structure
- projection is one-way
- graph state is rebuildable and disposable

## Local runtime

Bring up the official local graph service:

```bash
npm run graph:neo4j:up
```

Environment defaults:

- `NEO4J_URI=bolt://127.0.0.1:7687`
- `NEO4J_USER=neo4j`
- `NEO4J_PASSWORD=review-games-dev`
- `NEO4J_DATABASE=neo4j`

Run a smoke check:

```bash
npm run graph:smoke
```

Shut it down:

```bash
npm run graph:neo4j:down
```

## Graph access rules

All graph reads should go through:

- Cypher as the semantic source of truth
- typed query helpers
- Neo4j value normalization
- Zod-validated result contracts

Avoid:

- OGMs
- raw driver sessions in app code
- letting raw Neo4j `Node` or `Relationship` values leak into domain logic

## Reconciliation model

Projection is reconciled per `gameId`.

Game-scoped nodes and edges:

- are stamped with `gameId`
- are stamped with `projectionId`
- are pruned when stale after a successful projection

Shared canonical nodes:

- are marked `isShared = true`
- are not deleted by a single game's projection run
- can be cleaned only by a separate global maintenance job

