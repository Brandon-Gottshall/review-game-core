# Goal Launcher Congruency

This document defines the thin shared boundary between planning recommendation state and learner-facing launcher or goal-coach surfaces in `review-game-core`.

It is a boundary contract, not a product spec for any one consumer app.

It should be read alongside [`planning-goal-contract.md`](./planning-goal-contract.md), [`readiness-truthfulness.md`](./readiness-truthfulness.md), and [`product-framing.md`](./product-framing.md).

## Purpose

The planning layer already publishes a stable recommendation vocabulary:

- `primary`
- `catch_up`
- `queued`
- `complete`
- `trackPriority`

Consumer apps still need to decide how that recommendation appears in:

- launchers
- goal-coach summaries
- chooser rows
- session-progress hints
- saved-goal editing surfaces

This contract exists so those surfaces can stay congruent with the planning kernel without collapsing into one shared UI.

## Boundary

Planning owns recommendation truth.

Launcher and goal-coach surfaces own presentation, composition, and interaction.

That means core planning may determine:

- which phase is currently `primary`
- which incomplete phases are `catch_up`
- which later phases remain `queued`
- which phases are `complete` for planning purposes
- the ordered `trackPriority` list of non-complete tracks

But planning does not determine:

- which card, row, or CTA is visually largest
- whether the product leads with a launcher, coach card, dashboard, or course hierarchy
- exact button wording
- whether a current in-progress session is emphasized over a recommendation
- how a reusable saved plan is edited or persisted
- whether the learner is allowed to override the recommended track

## Congruency rule

A launcher or goal-coach surface is congruent when it presents planning output honestly and does not imply stronger or different kernel state than the evaluator actually returned.

In practice:

- if a phase is `primary`, the product may present it as the recommended next phase
- if a phase is `catch_up`, the product may present it as overdue or earlier work that still needs attention
- if a phase is `queued`, the product may present it as upcoming rather than current
- if a phase is `complete`, the product may present it as planning-complete, but not as broader mastery unless another contract justifies that claim
- if `trackPriority` lists tracks in a specific order, the product may use that order as a default recommendation sequence

The launcher becomes incongruent when it:

- labels a `queued` phase as the current recommended work without a consumer-owned override explanation
- hides `catch_up` state and implies no earlier unfinished work exists
- treats `complete` as proof of deep understanding rather than planning completion
- claims a planner chose something that was actually selected by local UI heuristics or manual learner choice

## Shared planning-driven semantics

### `primary`

`primary` is the planner's current recommendation target.

Launchers and goal-coach surfaces may use it for:

- default "work on this next" callouts
- default highlighted track or phase
- chooser preselection
- recommendation summaries

It is recommendation state, not route state. Planning does not say the learner is already in that flow.

### `catch_up`

`catch_up` means an earlier incomplete phase still matters after the planner advanced to a later incomplete phase because of explicit deadline behavior.

Consumer surfaces may:

- show it as overdue or behind
- keep it visible near the recommendation
- let the learner jump back to it

Consumer surfaces should not:

- silently flatten it into `queued`
- imply it disappeared from the plan
- present the later `primary` phase as if no earlier incomplete work remains

### `queued`

`queued` means incomplete but not currently frontmost.

Consumer surfaces may:

- show it as upcoming
- collapse it behind the recommended work
- include it in secondary ordering

They should not present it as active planner advice unless that change is explicitly consumer-owned and clearly separate from planner output.

### `complete`

`complete` means complete for planning purposes under the count-based target for that phase.

This is useful for:

- dimming or closing a launcher section
- showing completed tracks or phases
- removing a track from default `trackPriority`

It does not, by itself, justify stronger claims such as:

- full subject mastery
- exam readiness
- durable retention

Those stronger claims are governed by other contracts or consumer-local policy.

### `trackPriority`

`trackPriority` is the ordered distinct list of non-complete track ids derived from recommendation role and plan order.

It is appropriate for:

- chooser defaults
- launcher ordering
- recommendation summaries
- "up next" sequencing

It is not a mandatory UI layout contract. Consumers may still:

- group tracks differently
- show manual sorting controls
- place non-planning surfaces ahead of the launcher

as long as they do not misstate what the planner recommended.

## Current-session boundary

Planning recommendation is not the same thing as current-session state.

An in-progress session belongs to the workflow/session layer and consumer shell, not to planning.

That means a consumer app may choose to emphasize:

- `resume what you already started`
- `follow the current planner recommendation`
- both, with explicit separation

All three are valid. The requirement is honesty about which is which.

If the current in-progress session differs from the planner's `primary` recommendation, a congruent product should distinguish:

- current session
- recommended next work

It should not imply they are the same unless they actually are the same.

## Goal-coach boundary

A goal coach is any learner-facing surface that explains or summarizes what to work on next.

Core owns the vocabulary it may speak from planning:

- `primary`
- `catch_up`
- `queued`
- `complete`
- `trackPriority`

Consumers own:

- whether the coach is conversational, terse, or dashboard-like
- whether it shows one recommendation or several
- whether it explains deadlines in plain language or compact badges
- how much surrounding readiness or progress detail it shows

The coach may translate planner state into learner-facing copy. It must not silently upgrade planner output into stronger pedagogical or predictive claims.

## Launcher composition boundary

Launchers and chooser rows are consumer-owned composition surfaces.

The planning kernel does not decide:

- whether the launcher is a flat list, grouped hierarchy, or card stack
- whether sections, topics, exams, or tracks are all shown together
- whether recommended work appears above readiness summaries or below them
- whether a consumer app includes quick actions, pinned items, or manual browse modes

The kernel does provide the stable semantics those surfaces may consume.

This is the intended relationship for UI shells such as:

- planner cards
- hierarchy rows
- session-progress cards
- recommendation banners

Those surfaces may all coexist, but they should read from the same planning truth instead of re-deriving recommendation state ad hoc.

## Saved-plan editing boundary

Reusable saved-plan editing is not part of the planning kernel and is not standardized by this contract.

Consumer apps remain responsible for:

- plan creation and editing flows
- deadline inputs
- saved readiness floors or thresholds
- candidate unit selection
- persistence shape for saved plans
- overwrite, clear, and edit semantics

Planning may evaluate the resulting snapshots and phase definitions once they exist.

It does not own the authoring or storage UX for those plans.

## Truthfulness requirements

This contract inherits the readiness and planning truthfulness rules.

Launcher and goal-coach surfaces may truthfully say things like:

- this track is the current planner recommendation
- this earlier phase still needs catch-up work
- these tracks are next in priority order
- this phase is complete for planning purposes

They should not say things like:

- this is definitely the best learning path in a holistic sense
- this completed phase proves mastery or exam readiness
- there is no unfinished earlier work when the planner returned `catch_up`
- the learner's current session is the recommendation when it is only the resumed session

## Consumer contract

Core owns:

- the recommendation-state vocabulary
- the distinction between `primary`, `catch_up`, `queued`, and `complete`
- `trackPriority` as a stable chooser-order signal
- the requirement that launcher and coach surfaces stay semantically congruent with planning output

Consumers remain responsible for:

- launcher composition and layout
- CTA wording and visual emphasis
- current-session versus recommendation prioritization
- saved-plan creation, editing, and persistence
- manual override flows and chooser interactions
- surrounding copy, badges, summaries, and course-specific presentation
