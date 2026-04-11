import { groupValidationResults, validateAll, validateBoundaryCheck, validateConceptConsistency, validateGeneratorDeterminism, validateInteractivePayloadShape, validateRenderDispatch, validateSchedulerHarness, validateTypeCoverage, } from './validators.js';
function assertValidationResult(result) {
    if (result.passed && result.failures.length > 0) {
        console.info(`[wf-harness] ${result.name}: ${result.failures.join(' | ')}`);
    }
    if (!result.passed) {
        throw new Error(result.failures.join('\n') || `${result.name} failed`);
    }
    expect(result.passed).toBe(true);
}
function registerResults(results) {
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
export function createWFHarness(config) {
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
        all() {
            registerResults(validateAll(config));
        },
    };
}
//# sourceMappingURL=jest.js.map