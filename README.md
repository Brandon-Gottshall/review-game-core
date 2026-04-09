# @brandon-gottshall/review-game-core

Shared primitives for concept-tree review games. Pure logic and types — zero runtime dependencies, no UI, no framework lock-in.

## What's inside (v0.1)

- **Question types** — generic `Question<TType>` + open `InteractiveData` bag
- **Concept tree** — `ConceptNode`, mastery math, prerequisite unlock logic
- **Generators** — `mulberry32` seeded PRNG + `Generator<Q>` interface
- **WF harness** — framework-agnostic validators for 6 well-formedness groups, with `vitest` and `jest` adapters

## Install

```jsonc
// package.json
{
  "dependencies": {
    "@brandon-gottshall/review-game-core": "github:Brandon-Gottshall/review-game-core#v0.1.0"
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
}).all();
```

## Usage — WF harness (jest)

Identical API; import from `/wf-harness/jest` instead.

## Stability

v0.x is unstable. Each new game onboarded to the package may trigger breaking minor bumps. Pin by tag.

## License

MIT
