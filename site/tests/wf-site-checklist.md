# Site WF Checklist

Entry URL: `/`

Persona: engineer evaluating whether `review-game-core` is a usable shared package.

Critical checklist:

- `Entry`: identify what the package is within one screen.
- `Mechanism`: name the six phases of the quiz engine and the mastery threshold (three independent passes) after reading the home page.
- `Routing`: find the docs base without hidden routes.
- `Task Progression`: find one concrete feature example and one consumer example.
- `Interpretation`: understand what the planning / goal family does.
- `Interpretation`: on the workflow-core doc page, see the quiz engine described before the session/debug helpers.
- `Interpretation`: on the WF-harness feature page, see a worked example that comes from the harness itself (a validator call), not from another subsystem.
- `Routing`: move from docs to the related planning feature page.
- `Completion`: understand how to install or start using the package.

Fail conditions:

- the site reads like a generic landing page rather than a package/docs surface
- the user cannot discover docs or examples from `/`
- the user lands on a feature page but cannot tell what is core API versus consumer adapter
- the user reaches docs but cannot tell where to start
- the visitor leaves `/` unable to describe the learning loop the package runs
- a feature page's worked example demonstrates a subsystem other than the one the page is about
