import { describe, expect, it } from 'vitest'

import {
  courseHierarchySchema,
  courseUnitSchema,
  flattenTopics,
  parseAssessmentDate,
  serializeAssessmentDate,
  validateCourseHierarchy,
  validateCourseUnits,
} from '../src/index.js'

describe('course models', () => {
  it('validates course units with assessment dates', () => {
    const units = validateCourseUnits([
      {
        id: 'exam-1',
        label: 'Exam 1',
        assessmentDates: [
          { date: '2026-04-19', kind: 'exam' },
          { date: '2026-04-20T19:00:00-04:00', label: 'Evening window', kind: 'quiz' },
        ],
      },
    ])

    expect(units[0]).toEqual(courseUnitSchema.parse(units[0]))
  })

  it('round-trips plain and timestamped assessment dates', () => {
    expect(parseAssessmentDate('2026-04-19')?.toISOString()).toBe('2026-04-19T00:00:00.000Z')
    expect(serializeAssessmentDate({ date: '2026-04-19', kind: 'exam' })).toBe('2026-04-19')
    expect(serializeAssessmentDate({ date: '2026-04-20T19:00:00-04:00', kind: 'final' })).toBe('2026-04-20T23:00:00.000Z')
  })

  it('validates and flattens a course hierarchy', () => {
    const hierarchy = validateCourseHierarchy({
      units: [
        {
          id: 'exam-1',
          label: 'Exam 1',
          kind: 'exam',
          assessmentDates: [{ date: '2026-04-19', kind: 'exam' }],
          sections: [
            {
              id: 'section-a',
              label: 'Section A',
              kind: 'section',
              topics: [
                { id: 'topic-1', label: 'Topic 1', kind: 'topic' },
                { id: 'topic-2', label: 'Topic 2', kind: 'topic' },
              ],
            },
          ],
        },
      ],
    })

    expect(courseHierarchySchema.parse(hierarchy)).toEqual(hierarchy)
    expect(flattenTopics(hierarchy).map((topic) => topic.id)).toEqual(['topic-1', 'topic-2'])
  })
})
