# WF Report — 2026-04-16 (clarity rewrite)

Entry URL: `http://127.0.0.1:3456/`

Persona: engineer trying to decide whether `review-game-core` is a real package with usable workflow primitives or just abstract package framing.

## Checklist Results

| Checklist item | Outcome | Visible path taken | Where confusion happened | Exact user-facing text or state | Issue class |
| --- | --- | --- | --- | --- | --- |
| Entry | pass | `/` | None | Hero headline: "Build review games without rewriting routing, retries, and spaced review." | UX/discoverability |
| Interpretation | pass | `/` | None | Hero body states the package is "the decision layer behind the course apps in this workspace." | UX/discoverability |
| Task Progression | pass | `/` | None | Spotlight states "six named states: route, question, staged answer, support, recovery, complete." | workflow logic |
| Routing | pass | `/` -> `/docs` via `Read the docs` | None | Docs index loads with heading `Introduction`. | UX/discoverability |
| Routing | pass | `/` -> `/showcase/features` via `See real examples` | None | Feature gallery loads and exposes module example pages. | UX/discoverability |
| Completion | pass | `/showcase/features` | None | The route lands on a concrete examples index instead of a vague marketing dead end. | UX/discoverability |

## Notes

- This pass focused on copy clarity and route discoverability after the homepage rewrite.
- The homepage now makes three concrete claims in the first viewport:
  - it is a shared TypeScript package for review-game apps
  - it owns workflow decisions rather than consumer UI
  - a learner turn moves through six named states
- Browser checks were run against the already-running local Next dev server for this app on port `3456` because the repo-local Playwright config expects port `3210` and cannot start a second `next dev` instance for the same directory.
