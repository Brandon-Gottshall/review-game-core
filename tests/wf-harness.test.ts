import { describe, expect, it } from 'vitest';

import type { ConceptTree } from '../src/concept/index.js';
import type { Generator } from '../src/generator/index.js';
import type { Question } from '../src/question/index.js';
import {
  WF_GROUP_NAMES,
  groupValidationResults,
  validateAll,
  validateConceptConsistency,
  validateGeneratorDeterminism,
  validateInteractivePayloadShape,
  validateSchedulerHarness,
  type WFHarnessConfig,
} from '../src/wf-harness/validators.js';
import { createWFHarness } from '../src/wf-harness/vitest.js';

type ToyType = 'vocabulary' | 'trace_variables' | 'predict_output';
type ToyQuestion = Question<ToyType>;

const conceptTree: ConceptTree = [
  {
    id: 'basics',
    name: 'Basics',
    description: 'Foundations',
    prerequisites: [],
    questionIds: ['q-vocab'],
  },
  {
    id: 'loops',
    name: 'Loops',
    description: 'Tracing and output',
    prerequisites: ['basics'],
    questionIds: ['q-trace', 'q-output'],
  },
];

function createQuestionPool(): ToyQuestion[] {
  return [
    {
      id: 'q-vocab',
      type: 'vocabulary',
      concept: 'basics',
      question: 'What does CPU stand for?',
      correctAnswer: 'Central Processing Unit',
      distractors: ['Central Power Unit', 'Computer Process Utility'],
    },
    {
      id: 'q-trace',
      type: 'trace_variables',
      concept: 'loops',
      question: 'Trace the loop values.',
      correctAnswer: 'x = 3',
      interactive: {
        variantData: {
          code: 'let x = 0; for (let i = 0; i < 3; i++) x++;',
          finalValues: { x: 3 },
        },
      },
    },
    {
      id: 'q-output',
      type: 'predict_output',
      concept: 'loops',
      question: 'Predict the output.',
      correctAnswer: '3',
      interactive: {
        outputData: {
          code: 'console.log(1 + 2);',
          expectedOutput: '3',
        },
      },
    },
  ];
}

function createGenerator(): Generator<ToyQuestion> {
  return {
    id: 'toy-trace-generator',
    concept: 'loops',
    type: 'trace_variables',
    generate(seed: number) {
      return {
        id: `generated-trace-${seed}`,
        type: 'trace_variables',
        concept: 'loops',
        question: `Trace seed ${seed}`,
        correctAnswer: String(seed % 4),
        interactive: {
          variantData: {
            code: `let x = ${seed % 4};`,
            finalValues: { x: seed % 4 },
          },
        },
      };
    },
  };
}

function createBaseConfig(): WFHarnessConfig<ToyType, 'recognition' | 'structure'> {
  return {
    registeredTypes: ['vocabulary', 'trace_variables', 'predict_output'],
    renderInteractiveCases: ['trace_variables', 'predict_output'],
    interactivePayloadMap: {
      trace_variables: {
        payloadKey: 'variantData',
        requiredKeys: ['code', 'finalValues'],
      },
      predict_output: {
        payloadKey: 'outputData',
        requiredKeys: ['code', 'expectedOutput'],
      },
    },
    questionPool: createQuestionPool(),
    conceptTree,
    generators: [createGenerator()],
    quizClientPath: 'tests/fixtures/toy-quiz-client.tsx',
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
          name: 'independent solve records spacing and subskill evidence',
          initialStored: {
            basics: {
              nextEligibleTurn: 9,
            },
          },
          steps: [
            {
              kind: 'outcome',
              conceptId: 'basics',
              currentTurn: 1,
              outcome: 'independent_correct',
              subskillUpdates: [
                {
                  subskill: 'recognition',
                  attempts: 1,
                  cleanPasses: 1,
                  supportedPasses: 0,
                  misses: 0,
                  lastMissedTurn: null,
                },
              ],
            },
          ],
          expectations: [
            { conceptId: 'basics', path: 'independentPassCount', expected: 1 },
            { conceptId: 'basics', path: 'nextEligibleTurn', expected: 4 },
            { conceptId: 'basics', path: 'recoveryDue', expected: false },
            {
              conceptId: 'basics',
              path: 'subskillStats.recognition.cleanPasses',
              expected: 1,
            },
          ],
        },
      ],
      selectionScenarios: [
        {
          name: 'recovery-due concept beats retention-due concept',
          initialStored: {
            basics: {
              independentPassCount: 3,
              nextEligibleTurn: 9,
              retentionCheckEligibleTurn: 5,
              retentionCheckPassed: false,
            },
            loops: {
              recoveryDue: true,
              nextEligibleTurn: 2,
            },
          },
          nextTurn: 5,
          expectedConceptId: 'loops',
        },
      ],
    },
  };
}

describe('validateAll', () => {
  it('passes all 6 groups for a well-formed toy config', () => {
    const results = validateAll(createBaseConfig());

    expect(results.every(result => result.passed)).toBe(true);
    expect(groupValidationResults(results).map(group => group.group)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(groupValidationResults(results).map(group => group.name)).toEqual([
      WF_GROUP_NAMES[1],
      WF_GROUP_NAMES[2],
      WF_GROUP_NAMES[3],
      WF_GROUP_NAMES[4],
      WF_GROUP_NAMES[5],
      WF_GROUP_NAMES[6],
      WF_GROUP_NAMES[7],
    ]);
  });
});

describe('validateConceptConsistency', () => {
  it('fails when a question references a concept missing from the tree', () => {
    const config = createBaseConfig();
    config.questionPool = config.questionPool.map(question =>
      question.id === 'q-output'
        ? { ...question, concept: 'ghost-concept' }
        : question
    );

    const results = validateConceptConsistency(config);
    const conceptResult = results.find(result =>
      result.name.includes('question.concept resolves')
    );

    expect(conceptResult?.passed).toBe(false);
    expect(conceptResult?.failures).toEqual([
      "q-output: concept 'ghost-concept' does not exist in conceptTree",
    ]);
  });
});

describe('validateInteractivePayloadShape', () => {
  it('fails when an interactive payload is missing required data', () => {
    const config = createBaseConfig();
    config.questionPool = config.questionPool.map(question =>
      question.id === 'q-trace'
        ? {
            ...question,
            interactive: {
              variantData: {
                code: '',
                finalValues: {},
              },
            },
          }
        : question
    );

    const results = validateInteractivePayloadShape(config);
    const requiredKeysResult = results.find(result =>
      result.name.includes('includes all required keys')
    );

    expect(requiredKeysResult?.passed).toBe(false);
    expect(requiredKeysResult?.failures).toEqual([
      'q-trace: interactive.variantData is missing code, finalValues',
    ]);
  });
});

describe('validateGeneratorDeterminism', () => {
  it('fails when a generator is not deterministic for the same seed', () => {
    let nonce = 0;
    const config = createBaseConfig();
    config.generators = [
      {
        id: 'non-deterministic',
        concept: 'loops',
        type: 'trace_variables',
        generate(seed: number) {
          nonce += 1;
          return {
            id: `non-deterministic-${seed}-${nonce}`,
            type: 'trace_variables',
            concept: 'loops',
            question: `Question ${seed}`,
            correctAnswer: String(seed),
          };
        },
      },
    ];

    const results = validateGeneratorDeterminism(config);
    const determinismResult = results.find(result =>
      result.name.includes('same seed produces deep-equal')
    );

    expect(determinismResult?.passed).toBe(false);
    expect(determinismResult?.failures.some(failure => failure.includes('non-deterministic'))).toBe(
      true
    );
  });
});

describe('validateSchedulerHarness', () => {
  it('fails when a scheduler scenario expectation does not match the final state', () => {
    const config = createBaseConfig();
    config.scheduler = {
      ...config.scheduler,
      transitionScenarios: [
        {
          name: 'wrong expectation',
          steps: [
            {
              kind: 'outcome',
              conceptId: 'basics',
              currentTurn: 1,
              outcome: 'independent_correct',
            },
          ],
          expectations: [
            { conceptId: 'basics', path: 'independentPassCount', expected: 2 },
          ],
        },
      ],
    };

    const results = validateSchedulerHarness(config);
    const transitionResult = results.find(result =>
      result.name.includes('transition scenarios match expected state')
    );

    expect(transitionResult?.passed).toBe(false);
    expect(transitionResult?.failures).toEqual([
      'wrong expectation: basics.independentPassCount expected 2 but found 1',
    ]);
  });
});

describe('createWFHarness(vitest)', () => {
  createWFHarness(createBaseConfig()).all();
});
