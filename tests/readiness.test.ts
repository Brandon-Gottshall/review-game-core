import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { aggregateReadiness, computeReadiness } from '../src/readiness/index.js'

type GoldenCase = {
  id: string
  input: Parameters<typeof computeReadiness>[0]
  now: string
  expected: {
    score: number
    phase: Parameters<typeof computeReadiness>[0]['phase']
  }
}

const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'readiness-golden.json')
const goldenCases = JSON.parse(readFileSync(fixturePath, 'utf8')) as GoldenCase[]

describe('readiness', () => {
  it('matches the representative golden histories', () => {
    for (const scenario of goldenCases) {
      const score = computeReadiness(scenario.input, new Date(scenario.now))
      expect(score.score, scenario.id).toBe(scenario.expected.score)
      expect(score.phase, scenario.id).toBe(scenario.expected.phase)
    }
  })

  it('aggregates child readiness into a parent rollup', () => {
    const aggregate = aggregateReadiness([
      computeReadiness({
        unitId: 'exam-1',
        phase: 'mastered',
        attempts: [{ correct: true, occurredAt: '2026-04-18T12:00:00.000Z', cadenceDays: 4 }],
        lastPracticedAt: '2026-04-18T12:00:00.000Z',
        dueAt: '2026-05-01T12:00:00.000Z',
      }, new Date('2026-04-19T12:00:00.000Z')),
      computeReadiness({
        unitId: 'exam-1',
        phase: 'practicing',
        attempts: [{ correct: true, occurredAt: '2026-04-17T12:00:00.000Z', cadenceDays: 2 }],
        lastPracticedAt: '2026-04-17T12:00:00.000Z',
        dueAt: '2026-04-22T12:00:00.000Z',
      }, new Date('2026-04-19T12:00:00.000Z')),
    ])

    expect(aggregate.unitId).toBe('exam-1')
    expect(aggregate.score).toBeGreaterThan(60)
    expect(aggregate.phase).toBe('practicing')
    expect(aggregate.lastPracticedAt).toBe('2026-04-18T12:00:00.000Z')
    expect(aggregate.dueAt).toBe('2026-04-22T12:00:00.000Z')
  })
})
