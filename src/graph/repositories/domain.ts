import type { GraphClient } from '../client.js'
import {
  conceptLadderSchema,
  conceptPrerequisiteSchema,
  crossGameCanonicalMatchSchema,
  graphProjectionStateSchema,
  objectiveConceptsSchema,
  questionArtifactSummarySchema,
  type ConceptLadder,
  type ConceptPrerequisite,
  type CrossGameCanonicalMatch,
  type GraphProjectionState,
  type ObjectiveConcepts,
  type QuestionArtifactSummary,
} from '../contracts/index.js'
import type { GraphQuery } from '../query.js'
import { runGraphQuery } from '../query.js'

export interface GraphDomainReader {
  getConceptPrerequisites(gameId: string, conceptId: string): Promise<ConceptPrerequisite | null>
  getConceptLadder(gameId: string, conceptId: string): Promise<ConceptLadder | null>
  getQuestionArtifactsForStep(gameId: string, conceptId: string, stepLayer: string): Promise<QuestionArtifactSummary[]>
  getObjectiveConcepts(gameId: string, objectiveId: string): Promise<ObjectiveConcepts | null>
  getCrossGameCanonicalMatches(canonicalConceptId: string): Promise<CrossGameCanonicalMatch[]>
  getGameProjectionState(gameId: string): Promise<GraphProjectionState>
}

const conceptPrerequisitesQuery: GraphQuery<{ gameId: string; conceptId: string }, ConceptPrerequisite[]> = {
  name: 'getConceptPrerequisites',
  cypher: `
    MATCH (concept:GameConcept {gameId: $gameId, gameConceptId: $conceptId})
    OPTIONAL MATCH (concept)-[:REQUIRES]->(prereq:GameConcept {gameId: $gameId})
    WITH concept, prereq
    ORDER BY prereq.gameConceptId ASC
    RETURN concept.gameConceptId AS conceptId,
           collect(prereq.gameConceptId) AS prerequisiteConceptIds
  `,
  params: ({ gameId, conceptId }) => ({ gameId, conceptId }),
  schema: conceptPrerequisiteSchema.array(),
}

const conceptLadderQuery: GraphQuery<{ gameId: string; conceptId: string }, ConceptLadder[]> = {
  name: 'getConceptLadder',
  cypher: `
    MATCH (concept:GameConcept {gameId: $gameId, gameConceptId: $conceptId})-[:HAS_LADDER]->(ladder:LadderTemplate {gameId: $gameId})
    MATCH (ladder)-[:HAS_STEP]->(step:LadderStep {gameId: $gameId})
    OPTIONAL MATCH (step)-[:NEXT]->(next:LadderStep {gameId: $gameId})
    OPTIONAL MATCH (step)-[:REPAIRS_TO]->(repair:LadderStep {gameId: $gameId})
    WITH concept, ladder, step, next, repair
    ORDER BY step.ordinal ASC
    RETURN concept.gameConceptId AS conceptId,
           ladder.ladderId AS ladderId,
           ladder.completionStepId AS completionStepId,
           ladder.masteryStepId AS masteryStepId,
           ladder.retentionStepId AS retentionStepId,
           ladder.repairStepId AS repairStepId,
           collect({
             stepId: step.stepId,
             layer: step.layer,
             ordinal: step.ordinal,
             supportPolicy: step.supportPolicy,
             completionCredit: step.completionCredit,
             masteryCredit: step.masteryCredit,
             nextStepId: next.stepId,
             repairStepId: repair.stepId
           }) AS steps
  `,
  params: ({ gameId, conceptId }) => ({ gameId, conceptId }),
  schema: conceptLadderSchema.array(),
}

const questionArtifactsForStepQuery: GraphQuery<
  { gameId: string; conceptId: string; stepLayer: string },
  QuestionArtifactSummary[]
> = {
  name: 'getQuestionArtifactsForStep',
  cypher: `
    MATCH (question:QuestionArtifact {gameId: $gameId})-[:ASSESSES]->(concept:GameConcept {gameId: $gameId, gameConceptId: $conceptId})
    MATCH (question)-[:TARGETS_STEP]->(step:LadderStep {gameId: $gameId, layer: $stepLayer})
    RETURN DISTINCT question.questionId AS questionId,
           question.targetStepIds AS targetStepIds,
           question.conceptIds AS conceptIds,
           question.subskills AS subskills,
           question.variantFamily AS variantFamily,
           question.difficultyTag AS difficultyTag,
           question.canonicalSignature AS canonicalSignature,
           question.promptHash AS promptHash,
           question.sourceRef AS sourceRef
    ORDER BY questionId ASC
  `,
  params: ({ gameId, conceptId, stepLayer }) => ({ gameId, conceptId, stepLayer }),
  schema: questionArtifactSummarySchema.array(),
}

const objectiveConceptsQuery: GraphQuery<{ gameId: string; objectiveId: string }, ObjectiveConcepts[]> = {
  name: 'getObjectiveConcepts',
  cypher: `
    MATCH (objective:Objective {gameId: $gameId, objectiveId: $objectiveId})-[:TEACHES]->(concept:GameConcept {gameId: $gameId})
    WITH objective, concept
    ORDER BY concept.gameConceptId ASC
    RETURN objective.objectiveId AS objectiveId,
           collect(concept.gameConceptId) AS conceptIds
  `,
  params: ({ gameId, objectiveId }) => ({ gameId, objectiveId }),
  schema: objectiveConceptsSchema.array(),
}

const crossGameCanonicalMatchesQuery: GraphQuery<{ canonicalConceptId: string }, CrossGameCanonicalMatch[]> = {
  name: 'getCrossGameCanonicalMatches',
  cypher: `
    MATCH (concept:GameConcept)-[:INSTANCE_OF]->(canonical:CanonicalConcept {canonicalConceptId: $canonicalConceptId})
    RETURN canonical.canonicalConceptId AS canonicalConceptId,
           concept.gameConceptId AS gameConceptId,
           concept.gameId AS gameId,
           concept.label AS label
    ORDER BY concept.gameId ASC, concept.gameConceptId ASC
  `,
  params: ({ canonicalConceptId }) => ({ canonicalConceptId }),
  schema: crossGameCanonicalMatchSchema.array(),
}

const gameProjectionStateQuery: GraphQuery<{ gameId: string }, GraphProjectionState[]> = {
  name: 'getGameProjectionState',
  cypher: `
    MATCH (game:Game {gameId: $gameId})
    OPTIONAL MATCH (game)-[:ACTIVE_PROJECTION]->(run:ProjectionRun)
    RETURN game.gameId AS gameId,
           run.projectionId AS activeProjectionId,
           run.contentHash AS activeContentHash,
           run.schemaVersion AS activeSchemaVersion,
           run.status AS activeStatus,
           run.startedAt AS startedAt,
           run.completedAt AS completedAt
  `,
  params: ({ gameId }) => ({ gameId }),
  schema: graphProjectionStateSchema.array(),
}

export class Neo4jGraphDomainReader implements GraphDomainReader {
  constructor(private readonly client: GraphClient) {}

  async getConceptPrerequisites(gameId: string, conceptId: string): Promise<ConceptPrerequisite | null> {
    const rows = await runGraphQuery(this.client, conceptPrerequisitesQuery, { gameId, conceptId })
    return rows[0] ?? null
  }

  async getConceptLadder(gameId: string, conceptId: string): Promise<ConceptLadder | null> {
    const rows = await runGraphQuery(this.client, conceptLadderQuery, { gameId, conceptId })
    return rows[0] ?? null
  }

  async getQuestionArtifactsForStep(gameId: string, conceptId: string, stepLayer: string): Promise<QuestionArtifactSummary[]> {
    return runGraphQuery(this.client, questionArtifactsForStepQuery, { gameId, conceptId, stepLayer })
  }

  async getObjectiveConcepts(gameId: string, objectiveId: string): Promise<ObjectiveConcepts | null> {
    const rows = await runGraphQuery(this.client, objectiveConceptsQuery, { gameId, objectiveId })
    return rows[0] ?? null
  }

  async getCrossGameCanonicalMatches(canonicalConceptId: string): Promise<CrossGameCanonicalMatch[]> {
    return runGraphQuery(this.client, crossGameCanonicalMatchesQuery, { canonicalConceptId })
  }

  async getGameProjectionState(gameId: string): Promise<GraphProjectionState> {
    const rows = await runGraphQuery(this.client, gameProjectionStateQuery, { gameId })
    return rows[0] ?? graphProjectionStateSchema.parse({
      gameId,
      activeProjectionId: null,
      activeContentHash: null,
      activeSchemaVersion: null,
      activeStatus: null,
      startedAt: null,
      completedAt: null,
    })
  }
}
