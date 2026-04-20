# Product Framing

`review-game-core` is the package name and implementation lineage. It should not be read as a rule that every consumer app built on top of it is a review-only product.

The stronger default framing is a shared family of concept-learning products that may teach, guide, test, repair, retain, or compress learning with one kernel.

## Core position

The best default interpretation is:

> a shared concept-learning kernel, with review as one mode built on top

The canonical family now has distinct adjacent contracts:

- `graph`
  Owns authored structure and rebuildable read models.
- `planning`
  Turns normalized progress snapshots into recommendation state such as `primary`, `catch_up`, `queued`, and `complete`.
- `guided repetition`
  Owns concept-level teaching, support fade, hard-proof mastery, recovery-light routing, and retention timing once a concept is selected.
- `workflow/session`
  Owns deterministic turn phases, persistence, restore/reset behavior, and debug seams.
- `WF`
  Owns the workflow-completeness doctrine for whether a real user-facing flow is discoverable and finishable without repo context.

That separation is the product framing. The core is shared infrastructure for a family of learner-facing products, not a single review UI with extra helpers attached.

## Canonical learner arc

Once planning selects what should be frontmost, guided repetition owns how the concept is taught and revisited.

The shared ladder is concept-first:

1. `Recognize`
2. `Structure`
3. `Apply`
4. `Proof-prep`
5. `Prove` and later `Retain`

Consumer apps may render or label those steps differently, but the policy stays the same:

- teach the governing concept before heavier independent proof
- fade support as the learner demonstrates more control
- count hard independent work toward mastery
- use lighter repair after hard misses
- revisit mastered concepts later through retention

Review and cram still fit this model. They are valid consumer modes or labels built on top of the shared guided ladder, not the only valid reading of the package.

## Planning boundary

Planning and guided repetition are adjacent but different responsibilities.

- Planning answers: which track or goal should be primary right now?
- Guided repetition answers: once a concept is selected, should the learner recognize it, structure it, apply it, prove it independently, or repair it after a hard miss?

The planning layer should not absorb:

- repetition-phase sequencing
- hard-attempt limits
- recovery-light routing
- mastery counting rules for hard independent solves
- launcher copy or route decisions

Those now live in the shared guided scheduler policy or in the consumer shell, not in planning.

## Workflow and WF boundary

The workflow/session layer is the runtime envelope around learner progress through a task.

It standardizes:

- staged turn phases
- session identity
- persistence and restore/reset seams
- deterministic debug routing

That layer is not the same thing as `WF`.

`WF` is the shared doctrine for user-facing completeness:

- deterministic browser harnesses and debug routes count as `Regression`
- a workflow is only `WF complete` when a low-context browser agent can enter from the real entry path, discover how to proceed, recover when needed, and complete or clearly fail using visible product cues

This distinction matters for product framing because the kernel is not only trying to be correct. It is trying to support products that are actually usable without hidden knowledge.

## Naming guidance for consumer apps

Consumer repos should choose product language that matches the learner-facing reality.

Prefer:

- `learn`
- `practice`
- `build`
- `prove`
- `master`
- `quick test prep` or `cram` for explicit compression modes

Avoid using `review` as the only label when the primary flow is actually instructional.

## Content guidance

Consumer content should assume:

- concept recognition comes before arithmetic burden
- setup questions test the key move, not disposable computation
- final answers are proof of understanding, not the first place understanding is checked
- help text should teach, then fade

## Product boundary

This document does not redefine every consumer app. Some repos may still be straightforward review tools.

It does define the stronger general pattern for the shared core:

- the package supports a shared family of concept-learning products, not only review flows
- the guided ladder is shared kernel policy, not a consumer-specific habit
- the planning family is a pure recommendation boundary, not a learner platform
- workflow/session is the runtime shell around turns and persistence, not a substitute for WF
- WF remains the separate proof that a low-context user can actually use the visible product
- "review game" is lineage, not the only valid consumer framing
