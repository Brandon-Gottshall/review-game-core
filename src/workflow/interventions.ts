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

export interface WorkflowInterventionExposureMetadata<
  TCohortMode extends string = ActiveWorkflowInterventionCohortMode,
> {
  exposureId: string;
  resolutionKey: string;
  cohortMode: TCohortMode;
  resolvedArm: ResolvedWorkflowInterventionArm;
}

export interface WorkflowInterventionExposureRecord<
  TExperimentKey extends string = string,
  TInterventionKind extends string = string,
  TCohortMode extends string = ActiveWorkflowInterventionCohortMode,
> extends WorkflowInterventionExposureMetadata<TCohortMode> {
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

export interface WorkflowInterventionExposureStoreInput<
  TExperimentKey extends string = string,
  TInterventionKind extends string = string,
  TCohortMode extends string = ActiveWorkflowInterventionCohortMode,
> {
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

export interface WorkflowInterventionServedQuestionMetadata<
  TExperimentKey extends string = string,
  TQuestionOrigin extends string = string,
  TInterventionKind extends string = string,
> {
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

export interface WorkflowInterventionQuestionOverride<
  TQuestion,
  TCohortMode extends string = ActiveWorkflowInterventionCohortMode,
> {
  question: TQuestion;
  served: boolean;
  rejected: boolean;
  reason: string;
  cohortMode?: TCohortMode;
  resolvedArm?: ResolvedWorkflowInterventionArm;
  exposureId?: string | null;
  resolutionKey?: string | null;
}

const isNonEmptyString = (value: unknown): value is string => (
  typeof value === 'string' && value.trim().length > 0
);

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export function resolveWorkflowInterventionSourceQuestionId(
  question: WorkflowInterventionQuestionLike
): string {
  return question.sourceQuestionId?.trim() || question.id;
}

export function buildWorkflowInterventionResolutionKey(
  input: WorkflowInterventionResolutionInput
): string {
  if (!isNonEmptyString(input.sessionId)) {
    throw new Error('input.sessionId must be a non-empty string');
  }
  if (!Number.isInteger(input.currentTurn) || input.currentTurn < 0) {
    throw new Error('input.currentTurn must be an integer >= 0');
  }
  if (!isNonEmptyString(input.sourceQuestionId)) {
    throw new Error('input.sourceQuestionId must be a non-empty string');
  }
  if (!isNonEmptyString(input.conceptId)) {
    throw new Error('input.conceptId must be a non-empty string');
  }

  return [
    input.sessionId.trim(),
    String(input.currentTurn),
    input.sourceQuestionId.trim(),
    input.conceptId.trim(),
    input.targetLayer?.trim() || '',
  ].join(':');
}

export function resolveRandomizedWorkflowInterventionArm(
  experimentKey: string,
  resolutionKey: string
): ResolvedWorkflowInterventionArm {
  if (!isNonEmptyString(experimentKey)) {
    throw new Error('experimentKey must be a non-empty string');
  }
  if (!isNonEmptyString(resolutionKey)) {
    throw new Error('resolutionKey must be a non-empty string');
  }

  return hashString(`${experimentKey}:${resolutionKey}`) % 2 === 0
    ? 'control'
    : 'treatment';
}

export function buildWorkflowInterventionExposureRecord<
  TExperimentKey extends string = string,
  TInterventionKind extends string = string,
  TCohortMode extends string = ActiveWorkflowInterventionCohortMode,
>(
  input: WorkflowInterventionExposureStoreInput<TExperimentKey, TInterventionKind, TCohortMode>,
  options: Pick<WorkflowInterventionExposureRecord<TExperimentKey, TInterventionKind, TCohortMode>, 'exposureId' | 'createdAt'>
): WorkflowInterventionExposureRecord<TExperimentKey, TInterventionKind, TCohortMode> {
  if (!isNonEmptyString(options.exposureId)) {
    throw new Error('options.exposureId must be a non-empty string');
  }
  if (!isNonEmptyString(options.createdAt)) {
    throw new Error('options.createdAt must be a non-empty string');
  }

  const resolvedArm: ResolvedWorkflowInterventionArm = input.cohortMode === 'randomized'
    ? resolveRandomizedWorkflowInterventionArm(input.experimentKey, input.resolutionKey)
    : input.cohortMode === 'control'
      ? 'control'
      : 'treatment';

  return {
    exposureId: options.exposureId,
    resolutionKey: input.resolutionKey,
    learnerId: input.learnerId,
    sessionId: input.sessionId,
    experimentKey: input.experimentKey,
    cohortMode: input.cohortMode,
    resolvedArm,
    conceptId: input.conceptId,
    sourceQuestionId: input.sourceQuestionId,
    servedQuestionId: input.servedQuestionIdByArm[resolvedArm],
    unitId: input.unitId,
    sectionId: input.sectionId,
    targetLayer: input.targetLayer,
    interventionKind: input.interventionKind,
    createdAt: options.createdAt,
  };
}

export function applyWorkflowInterventionMetadata<
  TQuestion extends WorkflowInterventionQuestionLike,
  TExperimentKey extends string = string,
  TQuestionOrigin extends string = string,
  TInterventionKind extends string = string,
>(
  question: TQuestion,
  metadata: WorkflowInterventionServedQuestionMetadata<TExperimentKey, TQuestionOrigin, TInterventionKind>
): TQuestion & WorkflowInterventionServedQuestionMetadata<TExperimentKey, TQuestionOrigin, TInterventionKind> {
  return {
    ...question,
    experimentKey: metadata.experimentKey,
    experimentArm: metadata.experimentArm,
    exposureId: metadata.exposureId,
    sourceQuestionId: metadata.sourceQuestionId,
    questionOrigin: metadata.questionOrigin,
    ...(metadata.interventionKind ? { interventionKind: metadata.interventionKind } : {}),
  };
}
