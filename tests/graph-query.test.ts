import neo4j from 'neo4j-driver'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { createMockGraphClient } from '../src/graph/testing/mock-client.js'
import { normalizeNeo4jValue } from '../src/graph/normalize.js'
import { runGraphQuery } from '../src/graph/query.js'
import { Neo4jGraphDomainReader } from '../src/graph/repositories/domain.js'

describe('graph query layer', () => {
  it('normalizes Neo4j integers recursively', () => {
    const normalized = normalizeNeo4jValue({
      count: neo4j.int(3),
      nested: [neo4j.int(4)],
    })

    expect(normalized).toEqual({
      count: 3,
      nested: [4],
    })
  })

  it('runs typed queries and validates the result contract', async () => {
    const client = createMockGraphClient(async () => ({
      records: [
        {
          keys: ['conceptId', 'prerequisiteConceptIds'],
          get(key: string) {
            if (key === 'conceptId') return 'algebra'
            if (key === 'prerequisiteConceptIds') return ['numbers', 'fractions']
            return null
          },
        },
      ],
    }))

    const result = await runGraphQuery(client, {
      name: 'concept-prereqs',
      cypher: 'RETURN 1',
      schema: z.array(z.object({
        conceptId: z.string(),
        prerequisiteConceptIds: z.array(z.string()),
      })),
    }, {})

    expect(result).toEqual([
      {
        conceptId: 'algebra',
        prerequisiteConceptIds: ['numbers', 'fractions'],
      },
    ])
  })

  it('keeps question artifact reads deterministic by ordering on question id', async () => {
    let seenCypher = ''
    const client = createMockGraphClient(async (cypher) => {
      seenCypher = cypher
      return { records: [] }
    })

    const reader = new Neo4jGraphDomainReader(client)
    await reader.getQuestionArtifactsForStep('math1111', 'p1-absolute-value', 'recognition')

    expect(seenCypher).toContain('ORDER BY questionId ASC')
  })
})
