# Shared UI Boundaries

Shared UI in `review-game-core` is opt-in per surface. It is not a mandate to migrate every consumer view into core components.

## Stable For Consumers

- Theme and identity utilities exposed through `@brandon-gottshall/review-game-core/ui`.
- Course hierarchy rows when a consumer already has a `CourseHierarchy` and `ReadinessScore` map.
- Goal roadmap cards when a consumer already uses the core planning/goal kernel.

## Optional Or Pilot Surfaces

- App-specific launcher layouts.
- Quiz shells with local calculator, intervention, or route policy.
- Any surface whose copy carries course-specific pedagogy or institutional framing.

## Adoption Rule

Adopt one shared surface at a time. Before adoption, keep the app-local workflow evidence clear:

- existing logic tests still pass
- existing browser harness paths still pass
- low-context WF is rerun if discoverability, naming, order, recovery, persistence, or completion semantics changed

## Readiness Copy Boundary

Shared UI may display normalized readiness and phase signals, but it must not imply exact mastery, pass probability, or a grade forecast. Prefer labels such as `readiness signal`, `progress signal`, or `readiness score` over copy that reads like a precise percentage of readiness.
