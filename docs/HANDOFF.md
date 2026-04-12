# Handoff: review-game-core v0.1.0

**Date:** 2026-04-10
**From:** Claude (Brandon's session)
**To:** Codex or next agent

## What exists

Four commits on `main` in `/Users/brandon/code/review-game-core`:

| Hash | Message | What landed |
|------|---------|-------------|
| `b4527fb` | `chore: scaffold package + design doc` | package.json (ESM, source-only), tsconfig, vitest.config, .gitignore, README, design doc |
| `b9fa90a` | `feat(question): base Question + InteractiveData types` | `src/question/index.ts` — generic `Question<TType>`, open `InteractiveData`, `isQuestionOfType()` |
| `a07f3dd` | `feat(concept): ConceptNode + mastery/unlock/populate + tests` | `src/concept/index.ts` + `tests/concept.test.ts` (15 tests) |
| `2f25fed` | `feat(generator): mulberry32 + Generator interface + tests` | `src/generator/index.ts` + `tests/generator.test.ts` (11 tests) |

**All 26 self-tests pass.** Typecheck clean.

**No GitHub repo exists yet.** It was planned for C7. Create it with:
```sh
gh repo create Brandon-Gottshall/review-game-core --private --source=. --push
```

## What remains

Three commits to finish the package, then three to migrate the CS consumer:

### C5: Pure WF validators (the big one)

Create `src/wf-harness/validators.ts` — framework-agnostic validation functions that return result records (no `describe`/`it`/`expect`).

**Config interface:**
```ts
export interface WFHarnessConfig<TType extends string> {
  registeredTypes: readonly TType[];
  renderInteractiveCases: readonly TType[];
  interactivePayloadMap: Partial<Record<TType, {
    payloadKey: string;
    requiredKeys: readonly string[];
  }>>;
  questionPool: Question<TType>[];
  conceptTree: ConceptNode[];
  generators: Generator[];
  quizClientPath?: string;           // relative to process.cwd()
  renderPatternFor?: (type: string) => RegExp;  // override for dispatch pattern
}
```

**Six validation groups to implement:**

1. **Type coverage** — every `q.type` in pool must be in `registeredTypes`. Warn (don't fail) on registered types with zero questions.

2. **Render dispatch** — read `quizClientPath` (if provided), scan for `currentQuestion.type === 'X'` patterns. Verify every `renderInteractiveCases` type has a branch. Verify every branch in the file is a registered type. Skip this group if `quizClientPath` is omitted. Allow `renderPatternFor` to override the default regex.

3. **Interactive payload shape** — for each entry in `interactivePayloadMap` (non-null), verify every question of that type has `interactive[payloadKey]` populated and all `requiredKeys` are present and non-empty.

4. **Boundary check** — interactive-dispatch questions have exactly one matching payload key; non-dispatch questions have none of the payload keys.

5. **Concept consistency** — unique question IDs, required fields non-empty (`id`, `type`, `concept`, `question`, `correctAnswer`), every `q.concept` resolves to a `ConceptNode.id` in the tree.

6. **Generator determinism** — same seed produces deep-equal output (test seeds: `[1, 42, 100, 2024, 99999]`). Every generator emits a question with a valid type and concept. Different seeds produce at least 2 distinct IDs.

**Return type:**
```ts
export interface ValidationResult {
  group: number;
  name: string;
  passed: boolean;
  failures: string[];  // human-readable failure descriptions
}
```

**Reference implementation:** The CS game's existing harness at:
```
/Users/brandon/Library/Mobile Documents/com~apple~CloudDocs/VSU/2026-spring/courses/CS-1301/review_games/cs1301-review-game/__tests__/wf-harness.regression.test.ts
```
This is 357 lines of game-specific constants woven into vitest calls. Extract the logic, parameterize the constants.

**Self-test:** Create `tests/wf-harness.test.ts` that builds a toy config (3 fake question types, 2 concepts, 1 generator) and asserts all 7 groups pass. Also test failure cases (orphan concept, missing payload, non-deterministic generator).

## Workflow boundary

The new `src/workflow/*` modules are pure TS contracts for session state, persistence, deterministic debug routes, quiz-engine transitions, and renderer registries. They define the shared contract that consumer browser WF harnesses exercise, but they do not implement the browser harness itself.

### C6: Test framework adapters

Create two files:

**`src/wf-harness/vitest.ts`:**
```ts
import { describe, it, expect } from 'vitest';
import { validateAll, type WFHarnessConfig } from './validators.js';

export function createWFHarness<TType extends string>(config: WFHarnessConfig<TType>) {
  return {
    group1_typeCoverage() { /* wrap group 1 results in describe/it/expect */ },
    // ... groups 2-7
    all() { /* run all groups */ },
  };
}

export type { WFHarnessConfig };
```

**`src/wf-harness/jest.ts`:** Same API, but imports from `@jest/globals` or uses global `describe`/`it`/`expect`.

Both adapters call the pure validators and wrap each `ValidationResult` in the framework's assertion calls. The adapter's `all()` should register a `describe('WF Harness — Group N: ...')` block per group, with one `it(...)` per validation result.

**Update `src/index.ts`** to re-export from `./wf-harness/validators.js` (types only — the adapters are accessed via subpath exports `./wf-harness/vitest` and `./wf-harness/jest`).

**Update `package.json` exports** — already configured:
```json
"./wf-harness/vitest": { "types": "./src/wf-harness/vitest.ts", "default": "./src/wf-harness/vitest.ts" },
"./wf-harness/jest": { "types": "./src/wf-harness/jest.ts", "default": "./src/wf-harness/jest.ts" }
```

### C7: Tag and publish

```sh
cd /Users/brandon/code/review-game-core
gh repo create Brandon-Gottshall/review-game-core --private --source=. --push
git tag -a v0.1.0 -m "v0.1.0: Question, Concept, Generator, WF Harness"
git push origin v0.1.0
```

### M1-M3: Migrate cs1301-review-game

**Repo path:**
```
/Users/brandon/Library/Mobile Documents/com~apple~CloudDocs/VSU/2026-spring/courses/CS-1301/review_games/cs1301-review-game
```

**M1:** Install the package.
```sh
npm install github:Brandon-Gottshall/review-game-core#v0.1.0
```

**M2:** Adopt core types. In `lib/cs-game-data.ts`:
- Import `Question`, `InteractiveData` from core
- Redefine `CSUnifiedQuestion` as `Question<CSQuestionType> & { chapter: number; ... }`
- Delete duplicated type definitions that now live in core

In `lib/concept-tree.ts`:
- Import `ConceptNode`, `ConceptTree`, `MasteryData`, mastery functions from core
- Delete the local copies; re-export from core if needed for downstream imports
- Keep the actual `conceptTree` data array (CS-specific content stays here)

In `lib/question-generators.ts`:
- Import `mulberry32`, `randInt`, `pick`, `shuffle`, `cleanDistractors`, `Generator` from core
- Delete local copies of those functions
- Keep the 8 CS-specific generator implementations
- Type generators as `Generator<CSUnifiedQuestion>[]`

Run full test suite — all 109 tests must pass.

**M3:** Replace WF harness. Rewrite `__tests__/wf-harness.regression.test.ts` to:
```ts
import { createWFHarness } from '@brandon-gottshall/review-game-core/wf-harness/vitest';
import { unifiedQuestionPool } from '../lib/cs-game-data';
import { conceptTree } from '../lib/concept-tree';
import { generators } from '../lib/question-generators';

createWFHarness({
  registeredTypes: [
    'vocabulary', 'true_false', 'trace_variables', 'predict_output',
    'identify_error', 'complete_code', 'valid_invalid', 'match_definition',
    'code_analysis', 'write_program',
  ],
  renderInteractiveCases: ['trace_variables', 'predict_output', 'write_program'],
  interactivePayloadMap: {
    trace_variables: { payloadKey: 'variantData', requiredKeys: ['code', 'finalValues'] },
    predict_output:  { payloadKey: 'outputData',  requiredKeys: ['code', 'expectedOutput'] },
    write_program:   { payloadKey: 'programData', requiredKeys: ['filename', 'description', 'expectedOutput', 'sampleSolution'] },
  },
  questionPool: unifiedQuestionPool,
  conceptTree,
  generators,
  quizClientPath: 'app/quiz/quiz-client.tsx',
}).all();
```

Pre-commit hook runs full suite. Expect 109+ tests (count may shift if core names tests differently).

## Paused work in cs1301-review-game

Unit 2 content build was paused to prioritize this extraction. Status:

| Step | Status | Notes |
|------|--------|-------|
| A6: WF harness | Done (`187047b`) | 22 tests, 7 groups |
| A1: Java parser Ch3-4 | Done (`5e53712`) | tokens + parser + visitor + 16 new test cases, 109/109 green |
| A2: Concept tree (28 new Ch3-4 nodes) | Not started | |
| A4: 8 new generators | Not started | |
| A3: ~130 Ch3-4 questions | Not started | |
| A5/A7: Bump counts + java-execution tests | Not started | |
| A8/A9: Build, deploy, verify Vercel | Not started | |

Full plan at `/Users/brandon/.claude/plans/toasty-dreaming-octopus.md`.

## Technical notes

- **Source-only package.** No build step, no dist directory. Consumers transpile TS from node_modules. Git-URL installs skip prepublish scripts, so this avoids that footgun entirely.
- **ESM only.** `"type": "module"` in package.json. Import paths use `.js` extensions per Node ESM convention (even for `.ts` source files).
- **Vitest as devDependency.** Only imported inside the vitest adapter. Jest consumers never load it.
- **`quizClientPath` resolves relative to `process.cwd()`.** Document this in tests — the working directory during `vitest run` or `jest` is the consumer project root.
- **`chapter` field.** Made optional in core `Question` type (`chapter?: number`). CS game narrows it to required in its own type.
- **Threshold parameter.** All mastery/unlock functions accept an optional `threshold` argument, defaulting to `MASTERY_THRESHOLD` (0.7). Games that want a different value pass it per-call rather than forking the constant.

## File inventory

```
/Users/brandon/code/review-game-core/
├── .gitignore
├── README.md                              # consumer adoption recipe
├── package.json                           # @brandon-gottshall/review-game-core
├── package-lock.json
├── tsconfig.json
├── vitest.config.ts
├── docs/
│   ├── plans/
│   │   └── 2026-04-09-v0.1-design.md     # approved design doc
│   └── HANDOFF.md                         # this file
├── src/
│   ├── index.ts                           # re-exports question + concept + generator
│   ├── question/
│   │   └── index.ts                       # Question<TType>, InteractiveData, isQuestionOfType
│   ├── concept/
│   │   └── index.ts                       # ConceptNode, mastery math, populate
│   └── generator/
│       └── index.ts                       # mulberry32, Generator<Q>, generateForConcept
├── tests/
│   ├── concept.test.ts                    # 15 tests
│   └── generator.test.ts                  # 11 tests
└── node_modules/                          # vitest + typescript devDeps installed
```

**Missing (to be created in C5-C6):**
```
src/wf-harness/
├── validators.ts    # pure validation logic
├── vitest.ts        # vitest adapter
└── jest.ts          # jest adapter
tests/
└── wf-harness.test.ts
```

## Verification commands

```sh
cd /Users/brandon/code/review-game-core
npx tsc --noEmit          # typecheck
npx vitest run             # 26 tests, all passing

cd "/Users/brandon/Library/Mobile Documents/com~apple~CloudDocs/VSU/2026-spring/courses/CS-1301/review_games/cs1301-review-game"
npx vitest run             # 109 tests, all passing
```

Both require `PATH="/opt/homebrew/bin:/opt/homebrew/opt/java/bin:/usr/bin:/usr/local/bin:$PATH"` (the CS game's java-execution tests need JDK at `/opt/homebrew/opt/java/bin`).
