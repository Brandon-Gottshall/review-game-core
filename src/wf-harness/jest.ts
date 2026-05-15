import {
  groupValidationResults,
  validateAll,
  validateBoundaryCheck,
  validateConceptConsistency,
  validateGeneratorDeterminism,
  validateInteractivePayloadShape,
  validateQuestionQuality,
  validateRenderDispatch,
  validateSchedulerHarness,
  validateTypeCoverage,
  type ValidationResult,
  type WFHarnessConfig,
} from './validators.js';

function assertValidationResult(result: ValidationResult): void {
  if (result.passed && result.failures.length > 0) {
    console.info(`[wf-harness] ${result.name}: ${result.failures.join(' | ')}`);
  }

  if (!result.passed) {
    throw new Error(result.failures.join('\n') || `${result.name} failed`);
  }

  expect(result.passed).toBe(true);
}

function registerResults(results: ValidationResult[]): void {
  for (const group of groupValidationResults(results)) {
    describe(`WF Harness — Group ${group.group}: ${group.name}`, () => {
      for (const result of group.results) {
        it(result.name, () => {
          assertValidationResult(result);
        });
      }
    });
  }
}

export function createWFHarness<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
) {
  return {
    group1_typeCoverage() {
      registerResults(validateTypeCoverage(config));
    },
    group2_renderDispatch() {
      registerResults(validateRenderDispatch(config));
    },
    group3_interactivePayloadShape() {
      registerResults(validateInteractivePayloadShape(config));
    },
    group4_boundaryCheck() {
      registerResults(validateBoundaryCheck(config));
    },
    group5_conceptConsistency() {
      registerResults(validateConceptConsistency(config));
    },
    group6_generatorDeterminism() {
      registerResults(validateGeneratorDeterminism(config));
    },
    group7_schedulerCoverage() {
      registerResults(validateSchedulerHarness(config));
    },
    group8_questionQuality() {
      registerResults(validateQuestionQuality(config));
    },
    all() {
      registerResults(validateAll(config));
    },
  };
}

export type { WFHarnessConfig };
