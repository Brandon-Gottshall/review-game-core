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

function createBaseConfig(): WFHarnessConfig<ToyType> {
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
  };
}

describe('validateAll', () => {
  it('passes all 6 groups for a well-formed toy config', () => {
    const results = validateAll(createBaseConfig());

    expect(results.every(result => result.passed)).toBe(true);
    expect(groupValidationResults(results).map(group => group.group)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(groupValidationResults(results).map(group => group.name)).toEqual([
      WF_GROUP_NAMES[1],
      WF_GROUP_NAMES[2],
      WF_GROUP_NAMES[3],
      WF_GROUP_NAMES[4],
      WF_GROUP_NAMES[5],
      WF_GROUP_NAMES[6],
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

describe('createWFHarness(vitest)', () => {
  createWFHarness(createBaseConfig()).all();
});
