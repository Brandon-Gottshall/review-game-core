import { describe, expect, it } from 'vitest'

import {
  GRAPH_SCHEMA_VERSION,
  graphProjectionEnvelopeSchema,
} from '../src/graph/contracts/index.js'

describe('graph projection contracts', () => {
  it('requires the game projection to include the envelope game id', () => {
    const result = graphProjectionEnvelopeSchema.safeParse({
      projectionId: 'proj-1',
      gameId: 'math1111',
      sourceRepo: 'repo',
      sourceCommitSha: 'sha',
      contentHash: 'hash',
      generatedAt: '2026-04-15T22:00:00.000Z',
      schemaVersion: GRAPH_SCHEMA_VERSION,
      games: [],
    })

    expect(result.success).toBe(false)
  })

  it('accepts a minimal valid envelope', () => {
    const result = graphProjectionEnvelopeSchema.parse({
      projectionId: 'proj-1',
      gameId: 'math1111',
      sourceRepo: 'repo',
      sourceCommitSha: 'sha',
      contentHash: 'hash',
      generatedAt: '2026-04-15T22:00:00.000Z',
      schemaVersion: GRAPH_SCHEMA_VERSION,
      games: [{ gameId: 'math1111', label: 'Math 1111' }],
    })

    expect(result.games[0]?.gameId).toBe('math1111')
    expect(result.units).toEqual([])
  })
})

