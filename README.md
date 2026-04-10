# @brandon-gottshall/review-game-core

Shared primitives for concept-tree review games. Pure logic and types — zero runtime dependencies, no UI, no framework lock-in.

## What's inside (v0.2)

- **Question types** — generic `Question<TType>` + open `InteractiveData` bag
- **Concept tree** — `ConceptNode`, mastery math, prerequisite unlock logic
- **Scheduler** — policy-driven concept scheduling, retention, recovery, and next-concept selection
- **Generators** — `mulberry32` seeded PRNG + `Generator<Q>` interface
- **WF harness** — framework-agnostic validators for 7 well-formedness groups, with `vitest` and `jest` adapters

## Install

```jsonc
// package.json
{
  "dependencies": {
    "@brandon-gottshall/review-game-core": "github:Brandon-Gottshall/review-game-core#v0.2.0"
  }
}
```

Source-only package — consumer transpiles. No build step, no dist.

## Usage — types

```ts
import type { Question, ConceptNode } from '@brandon-gottshall/review-game-core';

type MyGameType = 'vocab' | 'trace' | 'predict';
interface MyInteractive { traceData?: { /* ... */ }; }

export type MyQuestion = Question<MyGameType> & { interactive?: MyInteractive };
```

## Usage — scheduler

```ts
import {
  applyConceptOutcome,
  buildInitialConceptSchedule,
  createSchedulerPolicy,
  pickNextConceptId,
} from '@brandon-gottshall/review-game-core';

const policy = createSchedulerPolicy({
  masteryTarget: 3,
  subskillIds: ['recognition', 'structure'] as const,
});

let schedule = buildInitialConceptSchedule(['loops', 'arrays'], policy);
schedule = applyConceptOutcome(schedule, 'loops', 'independent_correct', 1, { policy });

const nextConceptId = pickNextConceptId(schedule, 4, { policy });
```

The scheduler is deliberately policy-only. Consumers supply any prerequisite gating through `pickNextConceptId({ isEligible })` and own their own UI/status text.

## Usage — WF harness (vitest)

```ts
import { createWFHarness } from '@brandon-gottshall/review-game-core/wf-harness/vitest';
import { questionPool } from './data';
import { conceptTree } from './concepts';
import { generators } from './generators';

createWFHarness({
  registeredTypes: ['vocab', 'trace', 'predict'],
  renderInteractiveCases: ['trace', 'predict'],
  interactivePayloadMap: {
    trace:   { payloadKey: 'traceData',   requiredKeys: ['steps'] },
    predict: { payloadKey: 'predictData', requiredKeys: ['expected'] },
    vocab: null,
  },
  questionPool,
  conceptTree,
  generators,
  quizClientPath: 'app/quiz/quiz-client.tsx',
  scheduler: {
    policy: {
      masteryTarget: 3,
      independentGaps: [2, 5, 8],
      supportedGap: 1,
      failureGap: 1,
      subskillIds: ['recognition', 'structure'],
    },
    transitionScenarios: [
      {
        name: 'first clean pass spaces the concept',
        steps: [
          { kind: 'outcome', conceptId: 'basics', currentTurn: 1, outcome: 'independent_correct' },
        ],
        expectations: [
          { conceptId: 'basics', path: 'independentPassCount', expected: 1 },
          { conceptId: 'basics', path: 'nextEligibleTurn', expected: 4 },
        ],
      },
    ],
  },
}).all();
```

## Usage — WF harness (jest)

Identical API; import from `/wf-harness/jest` instead.

## Stability

v0.x is unstable. Each new game onboarded to the package may trigger breaking minor bumps. Pin by tag.

## License

MIT
