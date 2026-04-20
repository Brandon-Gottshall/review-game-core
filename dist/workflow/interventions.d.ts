export type WorkflowInterventionCohortMode = 'off' | 'randomized' | 'control' | 'treatment';
export type ActiveWorkflowInterventionCohortMode = Exclude<WorkflowInterventionCohortMode, 'off'>;
export type ResolvedWorkflowInterventionArm = 'control' | 'treatment';
export interface WorkflowInterventionResolutionInput {
    sessionId: string;
    currentTurn: number;
    sourceQuestionId: string;
    conceptId: string;
    targetLayer?: string | null;
}
export interface WorkflowInterventionExposureMetadata<TCohortMode extends string = ActiveWorkflowInterventionCohortMode> {
    exposureId: string;
    resolutionKey: string;
    cohortMode: TCohortMode;
    resolvedArm: ResolvedWorkflowInterventionArm;
}
export interface WorkflowInterventionExposureRecord<TExperimentKey extends string = string, TInterventionKind extends string = string, TCohortMode extends string = ActiveWorkflowInterventionCohortMode> extends WorkflowInterventionExposureMetadata<TCohortMode> {
    learnerId: string;
    sessionId: string;
    experimentKey: TExperimentKey;
    conceptId: string;
    sourceQuestionId: string;
    servedQuestionId: string;
    unitId: string;
    sectionId: string;
    targetLayer: string;
    interventionKind: TInterventionKind;
    createdAt: string;
}
export interface WorkflowInterventionExposureStoreInput<TExperimentKey extends string = string, TInterventionKind extends string = string, TCohortMode extends string = ActiveWorkflowInterventionCohortMode> {
    learnerId: string;
    sessionId: string;
    experimentKey: TExperimentKey;
    cohortMode: TCohortMode;
    resolutionKey: string;
    conceptId: string;
    sourceQuestionId: string;
    servedQuestionIdByArm: Record<ResolvedWorkflowInterventionArm, string>;
    unitId: string;
    sectionId: string;
    targetLayer: string;
    interventionKind: TInterventionKind;
}
export interface WorkflowInterventionServedQuestionMetadata<TExperimentKey extends string = string, TQuestionOrigin extends string = string, TInterventionKind extends string = string> {
    experimentKey: TExperimentKey;
    experimentArm: ResolvedWorkflowInterventionArm;
    exposureId: string;
    sourceQuestionId: string;
    questionOrigin: TQuestionOrigin;
    interventionKind?: TInterventionKind;
}
export interface WorkflowInterventionQuestionLike {
    id: string;
    sourceQuestionId?: string | null;
}
export interface WorkflowInterventionQuestionOverride<TQuestion, TCohortMode extends string = ActiveWorkflowInterventionCohortMode> {
    question: TQuestion;
    served: boolean;
    rejected: boolean;
    reason: string;
    cohortMode?: TCohortMode;
    resolvedArm?: ResolvedWorkflowInterventionArm;
    exposureId?: string | null;
    resolutionKey?: string | null;
}
export declare function resolveWorkflowInterventionSourceQuestionId(question: WorkflowInterventionQuestionLike): string;
export declare function buildWorkflowInterventionResolutionKey(input: WorkflowInterventionResolutionInput): string;
export declare function resolveRandomizedWorkflowInterventionArm(experimentKey: string, resolutionKey: string): ResolvedWorkflowInterventionArm;
export declare function buildWorkflowInterventionExposureRecord<TExperimentKey extends string = string, TInterventionKind extends string = string, TCohortMode extends string = ActiveWorkflowInterventionCohortMode>(input: WorkflowInterventionExposureStoreInput<TExperimentKey, TInterventionKind, TCohortMode>, options: Pick<WorkflowInterventionExposureRecord<TExperimentKey, TInterventionKind, TCohortMode>, 'exposureId' | 'createdAt'>): WorkflowInterventionExposureRecord<TExperimentKey, TInterventionKind, TCohortMode>;
export declare function applyWorkflowInterventionMetadata<TQuestion extends WorkflowInterventionQuestionLike, TExperimentKey extends string = string, TQuestionOrigin extends string = string, TInterventionKind extends string = string>(question: TQuestion, metadata: WorkflowInterventionServedQuestionMetadata<TExperimentKey, TQuestionOrigin, TInterventionKind>): TQuestion & WorkflowInterventionServedQuestionMetadata<TExperimentKey, TQuestionOrigin, TInterventionKind>;
//# sourceMappingURL=interventions.d.ts.map