import { z } from 'zod'

export const GRAPH_SCHEMA_VERSION = 1

export const graphStepLayerSchema = z.enum([
  'recognition',
  'setup',
  'light_application',
  'independent_proof',
  'harder_transfer',
])

export type GraphStepLayer = z.infer<typeof graphStepLayerSchema>

export const graphProjectionStatusSchema = z.enum([
  'started',
  'applied',
  'reconciled',
  'failed',
])

export type GraphProjectionStatus = z.infer<typeof graphProjectionStatusSchema>

const nonEmptyString = z.string().trim().min(1)
const isoDateTimeString = z.string().datetime({ offset: true })

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
})

export type ProjectionRunMetadata = z.infer<typeof projectionRunMetadataSchema>

export const graphGameProjectionSchema = z.object({
  gameId: nonEmptyString,
  label: nonEmptyString,
  description: z.string().trim().optional(),
})

export type GraphGameProjection = z.infer<typeof graphGameProjectionSchema>

export const graphUnitProjectionSchema = z.object({
  gameId: nonEmptyString,
  unitId: nonEmptyString,
  label: nonEmptyString,
  ordinal: z.number().int().nonnegative().optional(),
  description: z.string().trim().optional(),
})

export type GraphUnitProjection = z.infer<typeof graphUnitProjectionSchema>

export const graphSectionProjectionSchema = z.object({
  gameId: nonEmptyString,
  unitId: nonEmptyString,
  sectionId: nonEmptyString,
  label: nonEmptyString,
  ordinal: z.number().int().nonnegative().optional(),
  description: z.string().trim().optional(),
})

export type GraphSectionProjection = z.infer<typeof graphSectionProjectionSchema>

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
})

export type GraphObjectiveProjection = z.infer<typeof graphObjectiveProjectionSchema>

export const graphCanonicalConceptProjectionSchema = z.object({
  canonicalConceptId: nonEmptyString,
  label: nonEmptyString,
  description: z.string().trim().optional(),
  domain: z.string().trim().optional(),
})

export type GraphCanonicalConceptProjection = z.infer<typeof graphCanonicalConceptProjectionSchema>

export const graphGameConceptProjectionSchema = z.object({
  gameId: nonEmptyString,
  gameConceptId: nonEmptyString,
  label: nonEmptyString,
  description: z.string().trim().optional(),
  canonicalConceptId: nonEmptyString.optional(),
})

export type GraphGameConceptProjection = z.infer<typeof graphGameConceptProjectionSchema>

export const graphSubskillProjectionSchema = z.object({
  subskillId: nonEmptyString,
  label: nonEmptyString,
  description: z.string().trim().optional(),
})

export type GraphSubskillProjection = z.infer<typeof graphSubskillProjectionSchema>

export const graphLadderTemplateProjectionSchema = z.object({
  gameId: nonEmptyString,
  ladderId: nonEmptyString,
  gameConceptId: nonEmptyString,
  completionStepId: nonEmptyString,
  masteryStepId: nonEmptyString,
  retentionStepId: nonEmptyString,
  repairStepId: nonEmptyString,
})

export type GraphLadderTemplateProjection = z.infer<typeof graphLadderTemplateProjectionSchema>

export const graphLadderStepProjectionSchema = z.object({
  gameId: nonEmptyString,
  ladderId: nonEmptyString,
  stepId: nonEmptyString,
  layer: graphStepLayerSchema,
  ordinal: z.number().int().nonnegative(),
  supportPolicy: z.enum(['clean_only', 'hybrid', 'supported_ok']),
  completionCredit: z.boolean().default(false),
  masteryCredit: z.boolean().default(false),
})

export type GraphLadderStepProjection = z.infer<typeof graphLadderStepProjectionSchema>

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
})

export type GraphQuestionArtifactProjection = z.infer<typeof graphQuestionArtifactProjectionSchema>

export const graphObjectiveTeachesConceptProjectionSchema = z.object({
  gameId: nonEmptyString,
  objectiveId: nonEmptyString,
  gameConceptId: nonEmptyString,
})

export type GraphObjectiveTeachesConceptProjection = z.infer<typeof graphObjectiveTeachesConceptProjectionSchema>

export const graphGameConceptRequiresProjectionSchema = z.object({
  gameId: nonEmptyString,
  gameConceptId: nonEmptyString,
  requiredGameConceptId: nonEmptyString,
})

export type GraphGameConceptRequiresProjection = z.infer<typeof graphGameConceptRequiresProjectionSchema>

export const graphGameConceptRelatedProjectionSchema = z.object({
  gameId: nonEmptyString,
  gameConceptId: nonEmptyString,
  relatedGameConceptId: nonEmptyString,
})

export type GraphGameConceptRelatedProjection = z.infer<typeof graphGameConceptRelatedProjectionSchema>

export const graphGameConceptTransferProjectionSchema = z.object({
  gameId: nonEmptyString,
  gameConceptId: nonEmptyString,
  transferGameConceptId: nonEmptyString,
})

export type GraphGameConceptTransferProjection = z.infer<typeof graphGameConceptTransferProjectionSchema>

export const graphGameConceptUsesSubskillProjectionSchema = z.object({
  gameId: nonEmptyString,
  gameConceptId: nonEmptyString,
  subskillId: nonEmptyString,
})

export type GraphGameConceptUsesSubskillProjection = z.infer<typeof graphGameConceptUsesSubskillProjectionSchema>

export const graphConceptHasLadderProjectionSchema = z.object({
  gameId: nonEmptyString,
  gameConceptId: nonEmptyString,
  ladderId: nonEmptyString,
})

export type GraphConceptHasLadderProjection = z.infer<typeof graphConceptHasLadderProjectionSchema>

export const graphLadderHasStepProjectionSchema = z.object({
  gameId: nonEmptyString,
  ladderId: nonEmptyString,
  stepId: nonEmptyString,
})

export type GraphLadderHasStepProjection = z.infer<typeof graphLadderHasStepProjectionSchema>

export const graphLadderStepNextProjectionSchema = z.object({
  gameId: nonEmptyString,
  ladderId: nonEmptyString,
  stepId: nonEmptyString,
  nextStepId: nonEmptyString,
})

export type GraphLadderStepNextProjection = z.infer<typeof graphLadderStepNextProjectionSchema>

export const graphLadderStepRepairsToProjectionSchema = z.object({
  gameId: nonEmptyString,
  ladderId: nonEmptyString,
  stepId: nonEmptyString,
  repairStepId: nonEmptyString,
})

export type GraphLadderStepRepairsToProjection = z.infer<typeof graphLadderStepRepairsToProjectionSchema>

export const graphQuestionAssessesConceptProjectionSchema = z.object({
  gameId: nonEmptyString,
  questionId: nonEmptyString,
  gameConceptId: nonEmptyString,
})

export type GraphQuestionAssessesConceptProjection = z.infer<typeof graphQuestionAssessesConceptProjectionSchema>

export const graphQuestionTargetsStepProjectionSchema = z.object({
  gameId: nonEmptyString,
  questionId: nonEmptyString,
  stepId: nonEmptyString,
})

export type GraphQuestionTargetsStepProjection = z.infer<typeof graphQuestionTargetsStepProjectionSchema>

export const graphQuestionUsesSubskillProjectionSchema = z.object({
  gameId: nonEmptyString,
  questionId: nonEmptyString,
  subskillId: nonEmptyString,
})

export type GraphQuestionUsesSubskillProjection = z.infer<typeof graphQuestionUsesSubskillProjectionSchema>

export const graphQuestionBelongsToObjectiveProjectionSchema = z.object({
  gameId: nonEmptyString,
  questionId: nonEmptyString,
  objectiveId: nonEmptyString,
})

export type GraphQuestionBelongsToObjectiveProjection = z.infer<typeof graphQuestionBelongsToObjectiveProjectionSchema>

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
    })
  }
})

export type GraphProjectionEnvelope = z.infer<typeof graphProjectionEnvelopeSchema>

export const graphProjectionStateSchema = z.object({
  gameId: nonEmptyString,
  activeProjectionId: nonEmptyString.nullable(),
  activeContentHash: nonEmptyString.nullable(),
  activeSchemaVersion: z.number().int().positive().nullable(),
  activeStatus: graphProjectionStatusSchema.nullable(),
  startedAt: isoDateTimeString.nullable(),
  completedAt: isoDateTimeString.nullable(),
})

export type GraphProjectionState = z.infer<typeof graphProjectionStateSchema>

export const conceptPrerequisiteSchema = z.object({
  conceptId: nonEmptyString,
  prerequisiteConceptIds: z.array(nonEmptyString),
})

export type ConceptPrerequisite = z.infer<typeof conceptPrerequisiteSchema>

export const conceptLadderStepSchema = z.object({
  stepId: nonEmptyString,
  layer: graphStepLayerSchema,
  ordinal: z.number().int().nonnegative(),
  supportPolicy: z.enum(['clean_only', 'hybrid', 'supported_ok']),
  completionCredit: z.boolean(),
  masteryCredit: z.boolean(),
  nextStepId: nonEmptyString.nullable(),
  repairStepId: nonEmptyString.nullable(),
})

export const conceptLadderSchema = z.object({
  conceptId: nonEmptyString,
  ladderId: nonEmptyString,
  completionStepId: nonEmptyString,
  masteryStepId: nonEmptyString,
  retentionStepId: nonEmptyString,
  repairStepId: nonEmptyString,
  steps: z.array(conceptLadderStepSchema),
})

export type ConceptLadder = z.infer<typeof conceptLadderSchema>

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
})

export type QuestionArtifactSummary = z.infer<typeof questionArtifactSummarySchema>

export const objectiveConceptsSchema = z.object({
  objectiveId: nonEmptyString,
  conceptIds: z.array(nonEmptyString),
})

export type ObjectiveConcepts = z.infer<typeof objectiveConceptsSchema>

export const crossGameCanonicalMatchSchema = z.object({
  canonicalConceptId: nonEmptyString,
  gameConceptId: nonEmptyString,
  gameId: nonEmptyString,
  label: nonEmptyString,
})

export type CrossGameCanonicalMatch = z.infer<typeof crossGameCanonicalMatchSchema>
