import { type WFHarnessConfig } from './validators.js';
export declare function createWFHarness<TType extends string, TSubskill extends string = string>(config: WFHarnessConfig<TType, TSubskill>): {
    group1_typeCoverage(): void;
    group2_renderDispatch(): void;
    group3_interactivePayloadShape(): void;
    group4_boundaryCheck(): void;
    group5_conceptConsistency(): void;
    group6_generatorDeterminism(): void;
    group7_schedulerCoverage(): void;
    all(): void;
};
export type { WFHarnessConfig };
//# sourceMappingURL=jest.d.ts.map