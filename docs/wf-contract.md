# WF Contract

This document defines `WF` as the shared workflow-completeness contract for consumer apps built on top of `review-game-core`.

`WF` is not a synonym for:

- unit tests
- integration tests
- deterministic browser regression
- repo-context QA

Those are still required where appropriate.

`WF` means:

- low-context browser-agent validation against the real product
- checklist-driven task execution
- discoverability and completion validation
- visible-state and recovery validation

## Core rule

A user-facing task is not `WF complete` unless a low-context browser agent can:

1. enter the product from the real entry point
2. discover how to start the intended task
3. progress through the workflow using only visible product cues
4. complete the task, or hit an explicitly expected failure that the product clearly explains

If the workflow works only with hidden repo knowledge, it is not `WF complete`.

## Pass / fail bar

A WF run fails when any of the following happen:

- the agent cannot discover how to start
- the agent completes the wrong workflow believing it is correct
- the agent gets stuck without a visible recovery path
- visible state is misleading or stale
- completion is ambiguous or falsely implied
- the task depends on hidden routes or private implementation context that was not provided in the checklist

## Evidence expectations

Each WF run should capture:

- the checklist item
- `pass`, `fail`, or `partial`
- the visible path taken
- where confusion or hesitation happened
- the exact user-facing text or visible state that drove the result
- screenshots or video when helpful

Severity should use the shared workflow scale:

- `P0` workflow blocked
- `P1` severe confusion or likely user failure
- `P2` recoverable friction / major clarity issue
- `P3` polish issue

## Relationship to deterministic browser coverage

Repo-owned browser harnesses are not WF by themselves.

They are the `Regression` layer:

- fixed routes
- fixed fixtures
- exact assertions
- deterministic state checks

WF is the separate layer that proves a capable but uninformed user can actually use the product.

Both layers are valuable:

- regression proves the app still behaves as built
- WF proves the built thing is discoverable and finishable

## Relationship to the core WF harness

`review-game-core` ships a deterministic validator surface through:

- `wf-harness/validators`
- `wf-harness/vitest`
- `wf-harness/jest`

That harness validates authored question pools, render dispatch, payload shape, generator determinism, and scheduler invariants.

Those validators are part of the `Logic` / `Regression` stack, not proof of WF completion.

They help consumer repos keep the product well-formed enough to make WF meaningful, but they do not replace a low-context browser-agent pass.

## Deterministic workflow-debug contract

Consumer repos may expose deterministic debug routes and query flags such as:

- `wf=1`
- seeded concept/question selection
- restore forcing
- support forcing

These routes are useful because they let regression coverage and debugging reach known states quickly.

They do not change the WF standard.

When a workflow-affecting change ships, WF should still validate the real visible path unless the checklist explicitly calls for a hidden debug route.

## When WF is required

WF is required whenever a user-facing change affects:

- launcher or entry flow
- routing into the intended task
- multi-step progression
- recovery/support behavior
- persistence/restore
- calculator/tool shells
- completion semantics
- naming or discoverability

## What core owns

`review-game-core` owns the doctrine and supporting utilities that make WF practical:

- the policy language in this contract
- deterministic workflow helpers such as `workflow/debug`
- well-formedness validators that protect regression quality

Consumer repos remain responsible for:

- the actual WF checklist
- browser-agent prompt setup
- credentials or persona setup
- screenshots and run artifacts
- the final user-facing pass/fail call for a concrete workflow
