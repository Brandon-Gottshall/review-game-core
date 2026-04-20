'use client'

import {
  CramBanner,
  CourseHierarchyRows,
  DeadlineStrip,
  GoalPlannerCard,
  SessionProgressCard,
  StateLegend,
} from '@brandon-gottshall/review-game-core/ui'
import {
  computeReadiness,
  startCramSession,
  type CourseHierarchy,
} from '@brandon-gottshall/review-game-core'

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

const tokenGroups = [
  ['brand', 'var(--rg-brand)'],
  ['surface', 'var(--rg-surface)'],
  ['surface-raised', 'var(--rg-surface-raised)'],
  ['text', 'var(--rg-text)'],
  ['muted', 'var(--rg-muted)'],
  ['border', 'var(--rg-border)'],
  ['accent', 'var(--rg-accent)'],
  ['accent-2', 'var(--rg-accent-2)'],
  ['good', 'var(--rg-good)'],
  ['bad', 'var(--rg-bad)'],
  ['warn', 'var(--rg-warn)'],
] as const

export default function DesignSystemShowcasePage() {
  return (
    <main className="page-shell">
      <section className="strip-panel">
        <p className="eyebrow">Design system</p>
        <h1>Shared tokens and core UI fixtures</h1>
        <p>Use this page for visual regression and token inspection.</p>
      </section>

      <section className="strip-panel">
        <p className="eyebrow">Tokens</p>
        <div className="feature-grid">
          {tokenGroups.map(([label, value]) => (
            <article key={label} className="feature-card">
              <div
                style={{
                  height: 72,
                  borderRadius: 16,
                  border: '1px solid var(--rg-border)',
                  background: value,
                }}
              />
              <h3>{label}</h3>
              <p>{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="strip-panel">
        <p className="eyebrow">Components</p>
        <div style={{ display: 'grid', gap: 16 }}>
          <StateLegend />
          <DeadlineStrip units={hierarchy.units} now={new Date('2026-04-19T12:00:00.000Z')} />
          <CramBanner
            session={startCramSession('exam-1', 20 * 60 * 1000, new Date('2026-04-19T12:00:00.000Z'))}
            examLabel="Exam 1"
            coveredCount={3}
            totalCount={5}
            description="Shared urgency banner and timer shell."
          />
          <SessionProgressCard
            defaultOpen
            metrics={[
              { id: 'accuracy', label: 'Accuracy', value: '82%', detail: '9/11 resolved' },
              { id: 'turn', label: 'Turn', value: 12, detail: '18 prompts seen' },
            ]}
            goalHint="Exam 1 is still the active path today."
          />
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
          />
          <CourseHierarchyRows
            hierarchy={hierarchy}
            readinessById={readinessById}
            expandedExamId="exam-1"
            expandedSectionId="section-a"
          />
        </div>
      </section>
    </main>
  )
}
