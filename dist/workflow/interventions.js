const isNonEmptyString = (value) => (typeof value === 'string' && value.trim().length > 0);
const hashString = (value) => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};
export function resolveWorkflowInterventionSourceQuestionId(question) {
    return question.sourceQuestionId?.trim() || question.id;
}
export function buildWorkflowInterventionResolutionKey(input) {
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
export function resolveRandomizedWorkflowInterventionArm(experimentKey, resolutionKey) {
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
export function buildWorkflowInterventionExposureRecord(input, options) {
    if (!isNonEmptyString(options.exposureId)) {
        throw new Error('options.exposureId must be a non-empty string');
    }
    if (!isNonEmptyString(options.createdAt)) {
        throw new Error('options.createdAt must be a non-empty string');
    }
    const resolvedArm = input.cohortMode === 'randomized'
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
export function applyWorkflowInterventionMetadata(question, metadata) {
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
//# sourceMappingURL=interventions.js.map