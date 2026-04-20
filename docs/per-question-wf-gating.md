# Per-Question WF Gating

This document defines the canonical gate for experimental or LLM-variant questions before learner exposure in `review-game-core`.

`review-game-core` already supports served-question metadata, workflow interventions, deterministic validators, and shared WF doctrine. This policy defines how those pieces relate when a consumer wants to show a learner a question that is not simply the stable canonical authored version.

## Scope

This gate applies when a served question materially changes the learner-facing question compared with the canonical or previously approved version.

Typical triggers:

- LLM-authored or LLM-rewritten question text
- alternate distractors, explanations, or scaffold wording produced by an experiment arm
- generated variants whose prompt or payload can materially change what the learner sees
- intervention treatments that swap the served question, not just internal metadata

This gate does not apply to:

- telemetry-only metadata
- storage or schema changes with no learner-facing effect
- invisible implementation changes that do not alter the served question contract

If an LLM materially shaped the learner-visible question, treat that question as experimental by default until this gate is satisfied.

## Core rule

A gated question variant is not eligible for ordinary learner exposure unless all of the following are true:

1. the learner can see that the question is experimental, variant, or otherwise non-canonical at the point of use
2. deterministic evidence shows the question is well-formed and renderable
3. targeted WF evidence shows a low-context browser agent can interpret and complete the question, or meaningfully fail it, using visible product cues only

If any of those are missing, failed, or stale, the variant should be treated as unavailable for normal learner traffic.

## Visible experiment disclosure

Served-question metadata is useful, but metadata alone is not disclosure.

Shared fields such as:

- `experimentKey`
- `experimentArm`
- `exposureId`
- `sourceQuestionId`
- `questionOrigin`

can help consumers trace what was served through `workflow/interventions`, but they do not satisfy the learner-facing requirement by themselves.

Core owns the rule that a gated question must have visible disclosure that is:

- present on the actual learner-facing question surface
- visible while the learner is answering or reviewing that question
- understandable without opening developer tools, logs, or hidden menus

Consumer apps own:

- the exact wording
- the visual treatment
- whether they say `experimental`, `preview`, `alternate wording`, `AI-assisted`, or similar language
- any extra provenance details beyond the shared minimum

## Required evidence before exposure

Before a gated variant reaches ordinary learner traffic, the evidence should identify:

- the source or canonical question, when one exists
- the specific served question or variant actually shown to the learner

Minimum evidence layers:

- `Deterministic well-formedness`
  The question must pass the applicable structural checks for required fields, concept linkage, registered type coverage, render dispatch, interactive payload shape, and generator determinism where relevant. The shared `wf-harness` validators are part of this layer.
- `Targeted browser validation`
  A low-context browser agent must see the actual question UI, the visible experiment disclosure, and the real answer, support, recovery, and completion behavior for that question.
- `Failure capture`
  If the run fails, the evidence must record the visible confusion, misleading state, or runtime break that blocked the question. Failed variants stay gated.

This document does not define rollout percentages, sample sizes, signoff roles, or subject-specific quality thresholds.

## Relationship to WF

Per-question gating is adjacent to, not a replacement for, the shared [WF contract](./wf-contract.md).

- Repo-owned browser harnesses and deterministic validators are regression evidence, not proof that a gated question is WF-safe for learners.
- A whole-product WF pass does not automatically approve every new experimental or LLM-derived question variant.
- A targeted per-question WF checklist may explicitly use a direct-entry path when the purpose is to evaluate the question itself before public exposure. That proves the question is understandable once shown. It does not prove launcher or route discoverability.
- Once a gated variant becomes part of a real learner workflow, ordinary workflow-level WF still judges whether the surrounding product path is discoverable, recoverable, and finishable.

For per-question gating, the targeted WF checklist should cover the question-level surfaces that matter to learner success, including when applicable:

- visible experiment disclosure
- question interpretation
- staged answering or progression
- wrong-answer recovery or support behavior
- visible completion or review meaning

## Failure behavior before learner exposure

If gating evidence is missing, failed, or no longer trustworthy, the system should behave as though the variant is unavailable.

That means:

- do not silently serve the variant in ordinary learner flow
- do not rely on hidden cohort assignment or telemetry metadata as a substitute for visible disclosure
- route to a safe fallback such as the canonical question, a holdback path, or an internal-only testing surface

Core owns that safety rule. Consumer apps own the exact fallback behavior and route choice.

## Ownership boundary

Core owns:

- the doctrine that experimental or LLM-variant questions need visible disclosure before learner exposure
- the distinction between deterministic validation and WF evidence
- the requirement that failed or unevidenced variants stay gated
- shared served-question metadata seams that help trace which question was actually shown

Consumer apps own:

- variant prompt design and generation strategy
- subject-specific adjudication of pedagogical quality
- rollout thresholds, cohort sizing, and release operations
- learner-facing copy and visual design
- concrete fallback routing when a gated variant is withheld

## Adjacent but separate

This document does not standardize:

- the full question-authoring or scaffold-quality rubric
- persisted-question invalidation rules when content changes after storage
- app-specific release workflow or approval ceremony

Those are adjacent boundaries and should not be smuggled into the per-question WF gate.
