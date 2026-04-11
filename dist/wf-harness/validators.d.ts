import type { ConceptNode } from '../concept/index.js';
import type { Generator } from '../generator/index.js';
import type { Question } from '../question/index.js';
import { type PracticeOutcome, type SchedulerPolicy, type SchedulerPolicyConfig, type SubskillUpdate } from '../scheduler/index.js';
export interface WFHarnessPayloadSpec {
    payloadKey: string;
    requiredKeys: readonly string[];
}
export interface SchedulerStateExpectation {
    conceptId: string;
    path: string;
    expected: unknown;
}
export type SchedulerTransitionStep<TSubskill extends string = string> = {
    kind: 'outcome';
    conceptId: string;
    currentTurn: number;
    outcome: PracticeOutcome;
    subskillUpdates?: readonly SubskillUpdate<TSubskill>[];
} | {
    kind: 'supplemental';
    conceptId: string;
    currentTurn: number;
    wasClean?: boolean;
    subskillUpdates?: readonly SubskillUpdate<TSubskill>[];
};
export interface SchedulerTransitionScenario<TSubskill extends string = string> {
    name: string;
    initialStored?: unknown;
    steps: readonly SchedulerTransitionStep<TSubskill>[];
    expectations: readonly SchedulerStateExpectation[];
}
export interface SchedulerSelectionScenario<TSubskill extends string = string> {
    name: string;
    initialStored?: unknown;
    steps?: readonly SchedulerTransitionStep<TSubskill>[];
    nextTurn: number;
    expectedConceptId: string;
    eligibleConceptIds?: readonly string[];
}
export interface WFHarnessSchedulerConfig<TSubskill extends string = string> {
    policy?: SchedulerPolicy<TSubskill> | SchedulerPolicyConfig<TSubskill>;
    transitionScenarios?: readonly SchedulerTransitionScenario<TSubskill>[];
    selectionScenarios?: readonly SchedulerSelectionScenario<TSubskill>[];
}
export interface WFHarnessConfig<TType extends string = string, TSubskill extends string = string> {
    registeredTypes: readonly TType[];
    renderInteractiveCases: readonly TType[];
    interactivePayloadMap: Partial<Record<TType, WFHarnessPayloadSpec>>;
    questionPool: readonly Question<TType>[];
    conceptTree: readonly ConceptNode[];
    generators: readonly Generator<Question<TType>>[];
    quizClientPath?: string;
    renderPatternFor?: (type: string) => RegExp;
    scheduler?: WFHarnessSchedulerConfig<TSubskill>;
}
export interface ValidationResult {
    group: number;
    name: string;
    passed: boolean;
    failures: string[];
}
export interface ValidationGroup {
    group: number;
    name: string;
    results: ValidationResult[];
}
export declare const WF_GROUP_NAMES: {
    readonly 1: "Question type coverage";
    readonly 2: "Render dispatch coverage";
    readonly 3: "Interactive payload shape";
    readonly 4: "Boundary check";
    readonly 5: "Concept consistency";
    readonly 6: "Generator determinism";
    readonly 7: "Scheduler coverage";
};
export declare const WF_SAMPLE_SEEDS: readonly [1, 42, 100, 2024, 99999];
export declare function validateTypeCoverage<TType extends string, TSubskill extends string = string>(config: WFHarnessConfig<TType, TSubskill>): ValidationResult[];
export declare function validateRenderDispatch<TType extends string, TSubskill extends string = string>(config: WFHarnessConfig<TType, TSubskill>): ValidationResult[];
export declare function validateInteractivePayloadShape<TType extends string, TSubskill extends string = string>(config: WFHarnessConfig<TType, TSubskill>): ValidationResult[];
export declare function validateBoundaryCheck<TType extends string, TSubskill extends string = string>(config: WFHarnessConfig<TType, TSubskill>): ValidationResult[];
export declare function validateConceptConsistency<TType extends string, TSubskill extends string = string>(config: WFHarnessConfig<TType, TSubskill>): ValidationResult[];
export declare function validateGeneratorDeterminism<TType extends string, TSubskill extends string = string>(config: WFHarnessConfig<TType, TSubskill>): ValidationResult[];
export declare function validateSchedulerHarness<TType extends string, TSubskill extends string = string>(config: WFHarnessConfig<TType, TSubskill>): ValidationResult[];
export declare function validateAll<TType extends string, TSubskill extends string = string>(config: WFHarnessConfig<TType, TSubskill>): ValidationResult[];
export declare function groupValidationResults(results: readonly ValidationResult[]): ValidationGroup[];
//# sourceMappingURL=validators.d.ts.map