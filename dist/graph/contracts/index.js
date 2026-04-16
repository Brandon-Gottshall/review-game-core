import { z } from 'zod';
export const GRAPH_SCHEMA_VERSION = 1;
export const graphStepLayerSchema = z.enum([
    'recognition',
    'setup',
    'light_application',
    'independent_proof',
    'harder_transfer',
]);
export const graphProjectionStatusSchema = z.enum([
    'started',
    'applied',
    'reconciled',
    'failed',
]);
const nonEmptyString = z.string().trim().min(1);
const isoDateTimeString = z.string().datetime({ offset: true });
export const projectionRunMetadataSchema = z.object({
    projectionId: nonEmptyString,
    gameId: nonEmptyString,
    sourceRepo: nonEmptyString,
    sourceCommitSha: nonEmptyString,
    contentHash: nonEmptyString,
    generatedAt: isoDateTimeString,
    schemaVersion: z.number().int().positive(),
    status: graphProjectionStatusSchema,
    startedAt: isoDateTimeString.optional(),
    completedAt: isoDateTimeString.nullable().optional(),
});
export const graphGameProjectionSchema = z.object({
    gameId: nonEmptyString,
    label: nonEmptyString,
    description: z.string().trim().optional(),
});
export const graphUnitProjectionSchema = z.object({
    gameId: nonEmptyString,
    unitId: nonEmptyString,
    label: nonEmptyString,
    ordinal: z.number().int().nonnegative().optional(),
    description: z.string().trim().optional(),
});
export const graphSectionProjectionSchema = z.object({
    gameId: nonEmptyString,
    unitId: nonEmptyString,
    sectionId: nonEmptyString,
    label: nonEmptyString,
    ordinal: z.number().int().nonnegative().optional(),
    description: z.string().trim().optional(),
});
export const graphObjectiveProjectionSchema = z.object({
    gameId: nonEmptyString,
    unitId: nonEmptyString,
    sectionId: nonEmptyString,
    objectiveId: nonEmptyString,
    label: nonEmptyString,
    description: z.string().trim().optional(),
    requiredForCompletion: z.boolean().default(true),
    sourceMode: z.string().trim().optional(),
    sourceRefs: z.array(nonEmptyString).default([]),
});
export const graphCanonicalConceptProjectionSchema = z.object({
    canonicalConceptId: nonEmptyString,
    label: nonEmptyString,
    description: z.string().trim().optional(),
    domain: z.string().trim().optional(),
});
export const graphGameConceptProjectionSchema = z.object({
    gameId: nonEmptyString,
    gameConceptId: nonEmptyString,
    label: nonEmptyString,
    description: z.string().trim().optional(),
    canonicalConceptId: nonEmptyString.optional(),
});
export const graphSubskillProjectionSchema = z.object({
    subskillId: nonEmptyString,
    label: nonEmptyString,
    description: z.string().trim().optional(),
});
export const graphLadderTemplateProjectionSchema = z.object({
    gameId: nonEmptyString,
    ladderId: nonEmptyString,
    gameConceptId: nonEmptyString,
    completionStepId: nonEmptyString,
    masteryStepId: nonEmptyString,
    retentionStepId: nonEmptyString,
    repairStepId: nonEmptyString,
});
export const graphLadderStepProjectionSchema = z.object({
    gameId: nonEmptyString,
    ladderId: nonEmptyString,
    stepId: nonEmptyString,
    layer: graphStepLayerSchema,
    ordinal: z.number().int().nonnegative(),
    supportPolicy: z.enum(['clean_only', 'hybrid', 'supported_ok']),
    completionCredit: z.boolean().default(false),
    masteryCredit: z.boolean().default(false),
});
export const graphQuestionArtifactProjectionSchema = z.object({
    gameId: nonEmptyString,
    questionId: nonEmptyString,
    unitId: nonEmptyString,
    sectionId: nonEmptyString,
    objectiveId: nonEmptyString,
    conceptIds: z.array(nonEmptyString).min(1),
    targetStepIds: z.array(nonEmptyString).default([]),
    subskills: z.array(nonEmptyString).default([]),
    variantFamily: z.string().trim().optional(),
    difficultyTag: z.string().trim().optional(),
    canonicalSignature: nonEmptyString.optional(),
    promptHash: nonEmptyString,
    sourceRef: nonEmptyString.optional(),
    promptMirror: z.string().optional(),
    explanationMirror: z.string().optional(),
});
export const graphObjectiveTeachesConceptProjectionSchema = z.object({
    gameId: nonEmptyString,
    objectiveId: nonEmptyString,
    gameConceptId: nonEmptyString,
});
export const graphGameConceptRequiresProjectionSchema = z.object({
    gameId: nonEmptyString,
    gameConceptId: nonEmptyString,
    requiredGameConceptId: nonEmptyString,
});
export const graphGameConceptRelatedProjectionSchema = z.object({
    gameId: nonEmptyString,
    gameConceptId: nonEmptyString,
    relatedGameConceptId: nonEmptyString,
});
export const graphGameConceptTransferProjectionSchema = z.object({
    gameId: nonEmptyString,
    gameConceptId: nonEmptyString,
    transferGameConceptId: nonEmptyString,
});
export const graphGameConceptUsesSubskillProjectionSchema = z.object({
    gameId: nonEmptyString,
    gameConceptId: nonEmptyString,
    subskillId: nonEmptyString,
});
export const graphConceptHasLadderProjectionSchema = z.object({
    gameId: nonEmptyString,
    gameConceptId: nonEmptyString,
    ladderId: nonEmptyString,
});
export const graphLadderHasStepProjectionSchema = z.object({
    gameId: nonEmptyString,
    ladderId: nonEmptyString,
    stepId: nonEmptyString,
});
export const graphLadderStepNextProjectionSchema = z.object({
    gameId: nonEmptyString,
    ladderId: nonEmptyString,
    stepId: nonEmptyString,
    nextStepId: nonEmptyString,
});
export const graphLadderStepRepairsToProjectionSchema = z.object({
    gameId: nonEmptyString,
    ladderId: nonEmptyString,
    stepId: nonEmptyString,
    repairStepId: nonEmptyString,
});
export const graphQuestionAssessesConceptProjectionSchema = z.object({
    gameId: nonEmptyString,
    questionId: nonEmptyString,
    gameConceptId: nonEmptyString,
});
export const graphQuestionTargetsStepProjectionSchema = z.object({
    gameId: nonEmptyString,
    questionId: nonEmptyString,
    stepId: nonEmptyString,
});
export const graphQuestionUsesSubskillProjectionSchema = z.object({
    gameId: nonEmptyString,
    questionId: nonEmptyString,
    subskillId: nonEmptyString,
});
export const graphQuestionBelongsToObjectiveProjectionSchema = z.object({
    gameId: nonEmptyString,
    questionId: nonEmptyString,
    objectiveId: nonEmptyString,
});
export const graphProjectionEnvelopeSchema = z.object({
    projectionId: nonEmptyString,
    gameId: nonEmptyString,
    sourceRepo: nonEmptyString,
    sourceCommitSha: nonEmptyString,
    contentHash: nonEmptyString,
    generatedAt: isoDateTimeString,
    schemaVersion: z.number().int().positive(),
    games: z.array(graphGameProjectionSchema).min(1),
    units: z.array(graphUnitProjectionSchema).default([]),
    sections: z.array(graphSectionProjectionSchema).default([]),
    objectives: z.array(graphObjectiveProjectionSchema).default([]),
    canonicalConcepts: z.array(graphCanonicalConceptProjectionSchema).default([]),
    gameConcepts: z.array(graphGameConceptProjectionSchema).default([]),
    subskills: z.array(graphSubskillProjectionSchema).default([]),
    ladderTemplates: z.array(graphLadderTemplateProjectionSchema).default([]),
    ladderSteps: z.array(graphLadderStepProjectionSchema).default([]),
    questionArtifacts: z.array(graphQuestionArtifactProjectionSchema).default([]),
    objectiveTeachesConcept: z.array(graphObjectiveTeachesConceptProjectionSchema).default([]),
    gameConceptRequires: z.array(graphGameConceptRequiresProjectionSchema).default([]),
    gameConceptRelated: z.array(graphGameConceptRelatedProjectionSchema).default([]),
    gameConceptTransfer: z.array(graphGameConceptTransferProjectionSchema).default([]),
    gameConceptUsesSubskill: z.array(graphGameConceptUsesSubskillProjectionSchema).default([]),
    conceptHasLadder: z.array(graphConceptHasLadderProjectionSchema).default([]),
    ladderHasStep: z.array(graphLadderHasStepProjectionSchema).default([]),
    ladderStepNext: z.array(graphLadderStepNextProjectionSchema).default([]),
    ladderStepRepairsTo: z.array(graphLadderStepRepairsToProjectionSchema).default([]),
    questionAssessesConcept: z.array(graphQuestionAssessesConceptProjectionSchema).default([]),
    questionTargetsStep: z.array(graphQuestionTargetsStepProjectionSchema).default([]),
    questionUsesSubskill: z.array(graphQuestionUsesSubskillProjectionSchema).default([]),
    questionBelongsToObjective: z.array(graphQuestionBelongsToObjectiveProjectionSchema).default([]),
}).superRefine((value, ctx) => {
    if (!value.games.some((game) => game.gameId === value.gameId)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Projection envelope must include a GraphGameProjection for its gameId.',
            path: ['games'],
        });
    }
});
export const graphProjectionStateSchema = z.object({
    gameId: nonEmptyString,
    activeProjectionId: nonEmptyString.nullable(),
    activeContentHash: nonEmptyString.nullable(),
    activeSchemaVersion: z.number().int().positive().nullable(),
    activeStatus: graphProjectionStatusSchema.nullable(),
    startedAt: isoDateTimeString.nullable(),
    completedAt: isoDateTimeString.nullable(),
});
export const conceptPrerequisiteSchema = z.object({
    conceptId: nonEmptyString,
    prerequisiteConceptIds: z.array(nonEmptyString),
});
export const conceptLadderStepSchema = z.object({
    stepId: nonEmptyString,
    layer: graphStepLayerSchema,
    ordinal: z.number().int().nonnegative(),
    supportPolicy: z.enum(['clean_only', 'hybrid', 'supported_ok']),
    completionCredit: z.boolean(),
    masteryCredit: z.boolean(),
    nextStepId: nonEmptyString.nullable(),
    repairStepId: nonEmptyString.nullable(),
});
export const conceptLadderSchema = z.object({
    conceptId: nonEmptyString,
    ladderId: nonEmptyString,
    completionStepId: nonEmptyString,
    masteryStepId: nonEmptyString,
    retentionStepId: nonEmptyString,
    repairStepId: nonEmptyString,
    steps: z.array(conceptLadderStepSchema),
});
export const questionArtifactSummarySchema = z.object({
    questionId: nonEmptyString,
    targetStepIds: z.array(nonEmptyString),
    conceptIds: z.array(nonEmptyString),
    subskills: z.array(nonEmptyString),
    variantFamily: z.string().nullable(),
    difficultyTag: z.string().nullable(),
    canonicalSignature: z.string().nullable(),
    promptHash: nonEmptyString,
    sourceRef: z.string().nullable(),
});
export const objectiveConceptsSchema = z.object({
    objectiveId: nonEmptyString,
    conceptIds: z.array(nonEmptyString),
});
export const crossGameCanonicalMatchSchema = z.object({
    canonicalConceptId: nonEmptyString,
    gameConceptId: nonEmptyString,
    gameId: nonEmptyString,
    label: nonEmptyString,
});
//# sourceMappingURL=index.js.map