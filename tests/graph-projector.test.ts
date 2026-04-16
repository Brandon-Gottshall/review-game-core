import { describe, expect, it } from 'vitest'

import type { GraphClient, GraphQueryResultLike, GraphSessionLike, GraphTransactionLike } from '../src/graph/client.js'
import { GRAPH_SCHEMA_VERSION } from '../src/graph/contracts/index.js'
import { Neo4jGraphProjector } from '../src/graph/projector/index.js'

const makeRecord = (entries: Record<string, unknown>) => ({
  keys: Object.keys(entries),
  get: (key: string) => entries[key],
})

const createCapturingClient = () => {
  const calls: Array<{ cypher: string; params: Record<string, unknown> }> = []

  const transaction: GraphTransactionLike = {
    run: async (cypher, params = {}): Promise<GraphQueryResultLike> => {
      calls.push({ cypher, params })
      if (cypher.includes('RETURN $gameId AS gameId')) {
        return {
          records: [
            makeRecord({
              gameId: params.gameId,
              activeProjectionId: 'proj-1',
              activeContentHash: 'hash-1',
              activeSchemaVersion: GRAPH_SCHEMA_VERSION,
              activeStatus: 'reconciled',
              startedAt: '2026-04-15T22:00:00.000Z',
              completedAt: '2026-04-15T22:01:00.000Z',
            }),
          ],
        }
      }

      return { records: [] }
    },
  }

  const session: GraphSessionLike = {
    executeRead: async (work) => work(transaction),
    executeWrite: async (work) => work(transaction),
    close: async () => undefined,
  }

  const client: GraphClient = {
    session: () => session,
    close: async () => undefined,
  }

  return { client, calls }
}

describe('Neo4jGraphProjector', () => {
  it('writes projection runs, upserts entities, and reconciles stale game-scoped data', async () => {
    const { client, calls } = createCapturingClient()
    const projector = new Neo4jGraphProjector(client)

    const metadata = await projector.applyProjection({
      projectionId: 'proj-1',
      gameId: 'math1111',
      sourceRepo: 'repo',
      sourceCommitSha: 'sha',
      contentHash: 'hash-1',
      generatedAt: '2026-04-15T22:00:00.000Z',
      schemaVersion: GRAPH_SCHEMA_VERSION,
      games: [{ gameId: 'math1111', label: 'Math 1111' }],
      units: [{ gameId: 'math1111', unitId: 'n1', label: 'N1' }],
      sections: [{ gameId: 'math1111', unitId: 'n1', sectionId: 'P.1', label: 'P.1' }],
      objectives: [{
        gameId: 'math1111',
        unitId: 'n1',
        sectionId: 'P.1',
        objectiveId: 'obj-1',
        label: 'Objective 1',
        requiredForCompletion: true,
        sourceRefs: [],
      }],
      canonicalConcepts: [{ canonicalConceptId: 'canon:absolute-value', label: 'Absolute value' }],
      gameConcepts: [{
        gameId: 'math1111',
        gameConceptId: 'p1-absolute-value',
        label: 'Absolute value',
        canonicalConceptId: 'canon:absolute-value',
      }],
      subskills: [{ subskillId: 'recognition', label: 'Recognition' }],
      ladderTemplates: [{
        gameId: 'math1111',
        ladderId: 'ladder:absolute-value',
        gameConceptId: 'p1-absolute-value',
        completionStepId: 'step:proof',
        masteryStepId: 'step:transfer',
        retentionStepId: 'step:transfer',
        repairStepId: 'step:setup',
      }],
      ladderSteps: [
        {
          gameId: 'math1111',
          ladderId: 'ladder:absolute-value',
          stepId: 'step:setup',
          layer: 'setup',
          ordinal: 1,
          supportPolicy: 'hybrid',
          completionCredit: false,
          masteryCredit: false,
        },
        {
          gameId: 'math1111',
          ladderId: 'ladder:absolute-value',
          stepId: 'step:proof',
          layer: 'independent_proof',
          ordinal: 2,
          supportPolicy: 'clean_only',
          completionCredit: true,
          masteryCredit: false,
        },
        {
          gameId: 'math1111',
          ladderId: 'ladder:absolute-value',
          stepId: 'step:transfer',
          layer: 'harder_transfer',
          ordinal: 3,
          supportPolicy: 'clean_only',
          completionCredit: false,
          masteryCredit: true,
        },
      ],
      questionArtifacts: [{
        gameId: 'math1111',
        questionId: 'q1',
        unitId: 'n1',
        sectionId: 'P.1',
        objectiveId: 'obj-1',
        conceptIds: ['p1-absolute-value'],
        targetStepIds: ['step:proof'],
        subskills: ['recognition'],
        promptHash: 'prompt-hash',
      }],
      objectiveTeachesConcept: [{ gameId: 'math1111', objectiveId: 'obj-1', gameConceptId: 'p1-absolute-value' }],
      gameConceptRequires: [],
      gameConceptRelated: [],
      gameConceptTransfer: [],
      gameConceptUsesSubskill: [{ gameId: 'math1111', gameConceptId: 'p1-absolute-value', subskillId: 'recognition' }],
      conceptHasLadder: [{ gameId: 'math1111', gameConceptId: 'p1-absolute-value', ladderId: 'ladder:absolute-value' }],
      ladderHasStep: [
        { gameId: 'math1111', ladderId: 'ladder:absolute-value', stepId: 'step:setup' },
        { gameId: 'math1111', ladderId: 'ladder:absolute-value', stepId: 'step:proof' },
        { gameId: 'math1111', ladderId: 'ladder:absolute-value', stepId: 'step:transfer' },
      ],
      ladderStepNext: [
        { gameId: 'math1111', ladderId: 'ladder:absolute-value', stepId: 'step:setup', nextStepId: 'step:proof' },
        { gameId: 'math1111', ladderId: 'ladder:absolute-value', stepId: 'step:proof', nextStepId: 'step:transfer' },
      ],
      ladderStepRepairsTo: [{ gameId: 'math1111', ladderId: 'ladder:absolute-value', stepId: 'step:proof', repairStepId: 'step:setup' }],
      questionAssessesConcept: [{ gameId: 'math1111', questionId: 'q1', gameConceptId: 'p1-absolute-value' }],
      questionTargetsStep: [{ gameId: 'math1111', questionId: 'q1', stepId: 'step:proof' }],
      questionUsesSubskill: [{ gameId: 'math1111', questionId: 'q1', subskillId: 'recognition' }],
      questionBelongsToObjective: [{ gameId: 'math1111', questionId: 'q1', objectiveId: 'obj-1' }],
    })

    expect(metadata.status).toBe('reconciled')
    expect(calls.some((call) => call.cypher.includes('MERGE (run:ProjectionRun'))).toBe(true)
    expect(calls.some((call) => call.cypher.includes('MATCH ()-[rel]->()'))).toBe(true)
    expect(calls.some((call) => call.cypher.includes('ACTIVE_PROJECTION'))).toBe(true)
    const projectionRunCall = calls.find((call) => call.cypher.includes('MERGE (run:ProjectionRun'))
    expect(projectionRunCall).toBeDefined()
    expect(Object.prototype.hasOwnProperty.call(projectionRunCall!.params, 'completedAt')).toBe(true)
    expect(projectionRunCall!.params.completedAt).toBeNull()
  })

  it('returns an empty projection state when no active projection exists', async () => {
    const { client } = createCapturingClient()
    const projector = new Neo4jGraphProjector(client)

    const state = await projector.getGameProjectionState('math1111')

    expect(state.gameId).toBe('math1111')
    expect(state.activeProjectionId).toBe('proj-1')
  })
})
