# ADR 0001: Standardize On Tailwind v4

## Status

Accepted on April 19, 2026.

## Decision

`review-games` standardizes on Tailwind v4 and distributes the shared design tokens from `@brandon-gottshall/review-game-core/theme.css`.

Every app imports the shared preset with:

```css
@import "tailwindcss";
@import "@brandon-gottshall/review-game-core/theme.css";
```

Dark mode is class/data driven through `[data-theme="dark"]` so the apps can keep the existing theme-toggle contract while moving to a single shared token source.

## Why v4

- Astronomy and CS already ship on Tailwind v4, so v4 is the smallest move to convergence.
- Next.js 16 and React 19 fit the CSS-first v4 model cleanly.
- The shared preset needs to live in `review-game-core`, and v4 lets that be a single exported CSS file instead of a JS config chain in every app.
- The apps already have large global stylesheets; v4 makes incremental coexistence easier while those files are reduced over time.

## Rejected alternatives

### Tailwind v3 preset

Rejected because it would require:

- `tailwind.config.*` in every app
- JS preset wiring in every consumer
- a split styling model between the existing v4 apps and the migrating apps

That adds configuration overhead without solving a concrete compatibility problem.

### Mixed v3/v4 stack

Rejected because it would create two token distribution paths, two debugging paths, and two onboarding stories inside the same workspace.

## Consequences

- `review-game-core` exports `theme.css` as a package file, not as compiled JS.
- The shared UI package consumes the v4 token names directly.
- 1111 and stats add Tailwind v4 and keep legacy CSS in place during migration.
- Astronomy and CS keep their app-specific escape-hatch CSS and animations, but move onto the shared token import.
