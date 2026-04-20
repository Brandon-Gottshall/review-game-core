import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { computeReadiness } from '../src/readiness/index.js'
import type { CourseHierarchy } from '../src/concept/hierarchy.js'
import { createIdleCramSession, startCramSession } from '../src/workflow/cram-mode.js'
import { evaluateGoalPlan } from '../src/goal/index.js'
import {
  CramBanner,
  CourseHierarchyRows,
  DeadlineStrip,
  GoalPlannerCard,
  GoalRoadmapCard,
  IdentityFloat,
  SessionProgressCard,
  StateLegend,
  ThemeSwitcher,
} from '../src/ui/index.js'

const hierarchy: CourseHierarchy = {
  units: [{
    id: 'exam-1',
    label: 'Exam 1',
    kind: 'exam',
    assessmentDates: [{ date: '2026-04-22T12:00:00.000Z', label: 'Exam 1' }],
    sections: [{
      id: 'section-a',
      label: 'Section A',
      kind: 'section',
      topics: [
        { id: 'topic-1', label: 'Topic 1', kind: 'topic' },
        { id: 'topic-2', label: 'Topic 2', kind: 'topic' },
      ],
    }],
  }],
}

describe('shared UI package', () => {
  it('renders the phase legend and deadline strip', () => {
    expect(renderToStaticMarkup(<StateLegend />)).toContain('Phase legend')
    expect(renderToStaticMarkup(<DeadlineStrip units={hierarchy.units} now={new Date('2026-04-19T12:00:00.000Z')} />))
      .toContain('Exam 1')
  })

  it('renders hierarchy, cram, identity, theme, and session chrome', () => {
    const readinessById = {
      'exam-1': computeReadiness({
        unitId: 'exam-1',
        phase: 'practicing',
        attempts: [{ correct: true, occurredAt: '2026-04-18T12:00:00.000Z', cadenceDays: 2 }],
      }, new Date('2026-04-19T12:00:00.000Z')),
      'section-a': computeReadiness({
        unitId: 'section-a',
        phase: 'learning',
        attempts: [{ correct: true, occurredAt: '2026-04-18T12:00:00.000Z', cadenceDays: 1 }],
      }, new Date('2026-04-19T12:00:00.000Z')),
      'topic-1': computeReadiness({ unitId: 'topic-1', phase: 'mastered' }, new Date('2026-04-19T12:00:00.000Z')),
      'topic-2': computeReadiness({ unitId: 'topic-2', phase: 'shaky' }, new Date('2026-04-19T12:00:00.000Z')),
    }

    expect(renderToStaticMarkup(
      <CourseHierarchyRows
        hierarchy={hierarchy}
        readinessById={readinessById}
        expandedExamId="exam-1"
        expandedSectionId="section-a"
      />,
    )).toContain('Topic 1')

    expect(renderToStaticMarkup(
      <CramBanner
        session={startCramSession('exam-1', 10 * 60 * 1000, new Date('2026-04-19T12:00:00.000Z'))}
        examLabel="Exam 1"
        coveredCount={3}
        totalCount={5}
      />,
    )).toContain('Cram mode')

    expect(renderToStaticMarkup(
      <IdentityFloat
        currentEmail={null}
        onSave={() => undefined}
        onGoAnonymous={() => undefined}
      />,
    )).toContain('Anonymous')

    expect(renderToStaticMarkup(
      <ThemeSwitcher
        preference={{
          themeId: 'default',
          colorScheme: 'system',
          updatedAt: '2026-04-19T12:00:00.000Z',
        }}
        anonymous
        onChange={() => undefined}
      />,
    )).toContain('Follow system')

    expect(renderToStaticMarkup(
      <SessionProgressCard
        defaultOpen
        metrics={[
          { id: 'accuracy', label: 'Accuracy', value: '82%' },
          { id: 'turn', label: 'Turn', value: 12 },
        ]}
      />,
    )).toContain('Accuracy')
  })

  it('renders the goal planner shell', () => {
    expect(renderToStaticMarkup(
      <GoalPlannerCard
        readinessTarget="80"
        deadline="2026-04-22"
        units={[{ id: 'exam-1', label: 'Exam 1', checked: true, savedScore: '72' }]}
        activeSummary="Exam 1 sprint"
        liveRecommendation={<p>Focus on Section A next.</p>}
        onReadinessTargetChange={() => undefined}
        onDeadlineChange={() => undefined}
        onToggleUnit={() => undefined}
        onSavedScoreChange={() => undefined}
        onSave={() => undefined}
        onClear={() => undefined}
      />,
    )).toContain('Live recommendation')

    expect(createIdleCramSession('exam-1').state).toBe('idle')
  })

  it('renders a goal roadmap from evaluated phase state', () => {
    const evaluation = evaluateGoalPlan({
      id: 'roadmap',
      label: 'Roadmap',
      phases: [
        {
          id: 'exam-1-foundation',
          label: 'Clean up Exam 1',
          description: 'Close the oldest gap first.',
          trackId: 'exam-1',
          deadlineLocalDate: '2026-04-18',
          deadlineBehavior: 'advance_after_deadline',
        },
        {
          id: 'exam-2-push',
          label: 'Push Exam 2 over the line',
          trackId: 'exam-2',
          deadlineLocalDate: '2026-04-22',
        },
        {
          id: 'final-sweep',
          label: 'Finish the cumulative final sweep',
          trackId: 'final',
          targetCompletedUnits: 8,
        },
      ],
    }, [
      {
        phaseId: 'exam-1-foundation',
        trackId: 'exam-1',
        completedUnits: 2,
        totalUnits: 6,
      },
      {
        phaseId: 'exam-2-push',
        trackId: 'exam-2',
        completedUnits: 3,
        totalUnits: 5,
      },
      {
        phaseId: 'final-sweep',
        trackId: 'final',
        completedUnits: 0,
        totalUnits: 8,
      },
    ], {
      localDate: '2026-04-19',
    })

    const markup = renderToStaticMarkup(
      <GoalRoadmapCard
        phases={evaluation.phases}
        getTrackLabel={(trackId) => ({
          'exam-1': 'Exam 1',
          'exam-2': 'Exam 2',
          final: 'Final',
        }[trackId])}
      />,
    )

    expect(markup).toContain('Current phase: Push Exam 2 over the line')
    expect(markup).toContain('Catch up')
    expect(markup).toContain('Track: Final')
    expect(markup).toContain('Past due by 1 day')
    expect(markup).toContain('3/5 complete')
  })
})
