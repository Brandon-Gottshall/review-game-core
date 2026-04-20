# Question Quality Contract

This document defines the shared question-quality doctrine for `review-game-core`.

It sits underneath consumer copy and above the generic `Question` data shape. Its job is to make the concept-first ladder behaviorally real at the question level.

It is the canonical shared contract for:

- question-quality rubric
- scaffold framing
- concept disclosure
- staged support behavior
- the boundary between teaching and evaluating mastery

It should be read alongside [`product-framing.md`](./product-framing.md), [`guided-repetition-policy.md`](./guided-repetition-policy.md), [`wf-contract.md`](./wf-contract.md), and [`workflow-session-contract.md`](./workflow-session-contract.md).

## Boundary

This contract defines shared doctrine for authored question intent.

It does not define:

- course-specific pedagogy or subject rules
- exact learner-facing copy
- question-pool lint rules for a specific consumer
- renderer-specific UX details
- experiment release gates or per-question WF policy
- persisted-question invalidation behavior

Those concerns may build on this contract, but they are not part of it.

## Core rule

A question is high quality only when the visible task matches the learner's current support level and tests the intended cognitive move without hidden context.

In practice, that means:

- the governing concept should be checkable before heavy execution burden
- setup should be separable from proof when the learner is still acquiring the idea
- support should teach the rule or next move, then fade
- independent mastery should only be claimed when the learner solved without that earlier scaffold
- visible prompts, hints, and state should be sufficient to understand what is being asked

Question quality is not just "is there a correct answer?" It is "does this prompt ask the right thing, at the right support level, with honest disclosure?"

## Relationship to the guided ladder

Question quality inherits the shared concept-first ladder. It does not invent a parallel pedagogy.

The authoring intent by stage is:

1. `Rep 1` recognition
   The learner identifies the concept, rule, pattern, or governing condition. Arithmetic or execution burden should be minimal.
2. `Rep 2` recognition plus setup
   The learner commits to the setup, transformation, or next move. This should still isolate structure over grind.
3. `Rep 3` light application
   The learner performs a smaller or more guided execution step after the concept and structure are already in view.
4. `Rep 4` proof-prep
   Most scaffold is removed. The learner should be close to independent work, but the task may still preserve a small amount of framing.
5. `Rep 5+` hard proof or harder transfer
   The learner solves independently. This is where hard-proof credit and later retention evidence come from.

`Retain` is not a separate question genre. It is the later revisit context in which the same concept returns with less obvious framing, lighter support, or mixed neighboring concepts.

## Shared rubric

High-quality questions should satisfy all of the following.

### 1. Concept-first targeting

The prompt should primarily test the governing idea for the current concept.

- early questions should ask "what rule applies?" or "what setup is valid?" before asking for full execution
- disposable computation should not dominate a recognition or setup task
- if the learner can miss the concept but still pass by pattern-matching the surface form, the question is weak

### 2. Honest scaffold framing

The amount of help in the question should match the job the learner is being asked to do.

- if the question names the rule, highlights the structure, supplies a formula, or narrows the choice space, it is scaffolded
- scaffolded prompts are valid for teaching and early reps
- scaffolded prompts must not be treated as independent mastery evidence
- "hard" mode must be behaviorally real rather than cosmetically harder copy

### 3. Deliberate concept disclosure

Concept disclosure is allowed when the stage calls for it. It should be intentional, not accidental.

- early reps may explicitly name the concept, point at the relevant condition, or foreground the deciding cue
- disclosure should reveal the governing idea, not smuggle in the final answer
- later reps should fade labels, remove overt steering, and rely more on learner recognition
- if the learner needs hidden repo knowledge or unstated classroom conventions to know what the task means, the question fails

### 4. Setup-before-proof separation

A conceptually strong question distinguishes choosing the right move from carrying it out.

- setup questions should test the key transformation, equation, representation, or next step
- proof questions should require the learner to complete the execution without reusing earlier rescue
- final-answer correctness should not be the first place where understanding is checked

### 5. Support that teaches, then fades

Support should repair the missing understanding, not merely restate the prompt.

- explanations, `keyFacts`, formulas, or support copy should clarify why the concept applies
- support should usually reduce ambiguity, surface the next move, or re-anchor the learner on the governing rule
- repeated support should fade across the ladder rather than stay constant
- recovery-light behavior should repair recognition or structure gaps before returning to hard proof

### 6. Visible answerability

The learner should be able to understand the task from the visible product state.

- the prompt should not depend on hidden assumptions, off-screen setup, or unstated symbols
- answer expectations should be interpretable from the question and surrounding visible UI
- if the question is interactive, the required action should still be discoverable from visible cues

### 7. Diagnostic feedback value

Optional teaching fields should improve understanding, not decorate the content.

- `explanation` should explain the rule, decision, or mistake class
- `keyFacts` should surface the minimum useful anchors, not a mini-textbook dump
- `distractors` should reflect plausible wrong structures or common misconceptions when they exist
- feedback should help the learner understand why an answer was right or wrong, especially in non-hard phases

## Teaching vs evaluating mastery

Teaching and mastery evaluation are different jobs. A single question family may support both, but the contract must stay honest about which job is active.

### Teaching / scaffolding

Teaching-mode questions may:

- disclose the concept name or rule
- chunk the problem into intermediate moves
- narrow the decision space
- provide formulas, reminders, or guided prompts
- use post-answer explanation to repair understanding

Passing these questions can move a learner through the early guided ladder. It does not prove independent mastery by itself.

### Evaluating mastery

Mastery questions require the learner to prove understanding without the earlier scaffold.

They should:

- remove overt concept labels and step-by-step rescue
- require the learner to choose and execute the right move independently
- keep correctness criteria unambiguous
- align with the shared hard-attempt and recovery-light policy

Only hard independent success should count as mastery or retention evidence. This follows the shared guided scheduler policy and should not be diluted by supportive copy that effectively answers the question.

## Quality failures

Question quality is weak when any of the following happen:

- the learner must grind through execution before the concept is even identifiable
- the prompt quietly gives away the answer while the product still treats the result as mastery
- the only way to understand the task is hidden context outside the visible product
- a setup question is judged like a proof question
- a proof question still contains enough rescue to remove the independent decision
- support text repeats the prompt without teaching the missing idea
- distractors are arbitrary rather than diagnostic

## Relation to the base question shape

The core `Question` type is intentionally thin. Fields such as:

- `question`
- `correctAnswer`
- `distractors`
- `explanation`
- `keyFacts`
- `formula`
- `interactive`

are content containers, not a guarantee of quality or stage correctness.

This contract supplies the doctrine that should govern how those fields are authored and used.

Consumers may add local metadata for:

- subskills
- support level
- template families
- reveal policies
- grading nuance

But they should not redefine the shared question-quality bar when the doctrine here is sufficient.

## Consumer contract

Core owns:

- the concept-first question-quality rubric
- the scaffold-vs-mastery distinction
- concept-disclosure guidance
- the "teach, then fade" rule
- alignment with the shared guided repetition ladder

Consumers remain responsible for:

- exact prompts, explanations, and support copy
- subject-specific examples and misconception models
- local lint rules and authoring QA
- renderer decisions and shell presentation
- course-specific completion, grading, and release policy
