import type { ReactNode, KeyboardEvent } from 'react'

import type { CourseHierarchy, ExamNode, SectionNode, TopicNode } from '../concept/hierarchy.js'
import { PHASE_STATE_LABELS, type PhaseState } from '../scheduler/phase-state.js'
import type { ReadinessScore } from '../readiness/index.js'
import { StateDot } from './state.js'
import { cx, formatIsoDate, formatRelativeDay, getFocusableSibling } from './utils.js'

type ReadinessMap = Record<string, ReadinessScore | undefined>

type TopicRowProps = {
  topic: TopicNode
  readiness?: ReadinessScore
}

export function TopicRow({ topic, readiness }: TopicRowProps) {
  const state = readiness?.phase ?? 'not_started'

  return (
    <li className={cx('rg-topic-row', `is-${state}`)} data-testid={`topic-row-${topic.id}`}>
      <StateDot state={state} size="sm" />
      <span className="rg-topic-row__label">{topic.label}</span>
      <span className="rg-topic-row__meta">{PHASE_STATE_LABELS[state]}</span>
    </li>
  )
}

type SectionRowProps = {
  section: SectionNode
  readiness?: ReadinessScore
  topicReadiness?: ReadinessMap
  expanded?: boolean
  onToggle?: () => void
  renderAction?: ReactNode
}

const ROW_SELECTOR = '.rg-exam-row, .rg-section-row'
const ROW_DETAIL_SELECTOR = '.rg-exam-row__detail, .rg-section-row__detail'

/**
 * WAI-ARIA TreeView keyboard pattern for ExamRow / SectionRow toggles.
 *
 * - ArrowDown / ArrowUp: sibling navigation within the same `data-rg-rowlist`.
 * - ArrowRight: expand if collapsed; descend to first child toggle if already expanded.
 * - ArrowLeft: collapse if expanded; ascend to parent toggle if already collapsed.
 * - Home / End: jump to the first / last toggle in the nearest `data-rg-rowtree` root.
 * - Enter / Space: toggle (native button behavior — handled by the browser).
 */
const handleTreeKeyDown = (
  event: KeyboardEvent<HTMLButtonElement>,
  onToggle?: () => void,
): void => {
  const toggle = event.currentTarget
  const { key } = event

  if (key === 'ArrowDown') {
    const sibling = getFocusableSibling(toggle, '[data-rg-rowtoggle="true"]', 1)
    if (sibling) {
      event.preventDefault()
      sibling.focus()
    }
    return
  }

  if (key === 'ArrowUp') {
    const sibling = getFocusableSibling(toggle, '[data-rg-rowtoggle="true"]', -1)
    if (sibling) {
      event.preventDefault()
      sibling.focus()
    }
    return
  }

  if (key === 'ArrowRight') {
    const expanded = toggle.getAttribute('aria-expanded') === 'true'
    if (!expanded) {
      event.preventDefault()
      onToggle?.()
      return
    }
    const row = toggle.closest<HTMLElement>(ROW_SELECTOR)
    const detail = row?.querySelector<HTMLElement>(ROW_DETAIL_SELECTOR)
    const firstChild = detail?.querySelector<HTMLButtonElement>('[data-rg-rowtoggle="true"]')
    if (firstChild) {
      event.preventDefault()
      firstChild.focus()
    }
    return
  }

  if (key === 'ArrowLeft') {
    const expanded = toggle.getAttribute('aria-expanded') === 'true'
    if (expanded) {
      event.preventDefault()
      onToggle?.()
      return
    }
    const row = toggle.closest<HTMLElement>(ROW_SELECTOR)
    const parentRow = row?.parentElement?.closest<HTMLElement>(ROW_SELECTOR)
    const parentToggle = parentRow?.querySelector<HTMLButtonElement>('[data-rg-rowtoggle="true"]')
    if (parentToggle) {
      event.preventDefault()
      parentToggle.focus()
    }
    return
  }

  if (key === 'Home' || key === 'End') {
    const tree = toggle.closest<HTMLElement>('[data-rg-rowtree="true"]')
    if (!tree) return
    const toggles = Array.from(tree.querySelectorAll<HTMLButtonElement>('[data-rg-rowtoggle="true"]'))
    if (toggles.length === 0) return
    event.preventDefault()
    const target = key === 'Home' ? toggles[0] : toggles[toggles.length - 1]
    target?.focus()
  }
}

export function SectionRow({
  section,
  readiness,
  topicReadiness = {},
  expanded = false,
  onToggle,
  renderAction,
}: SectionRowProps) {
  const state = readiness?.phase ?? 'not_started'
  const masteredTopics = section.topics.filter((topic) => topicReadiness[topic.id]?.phase === 'mastered').length

  return (
    <li className={cx('rg-card rg-section-row', `is-${state}`, expanded && 'is-expanded')}>
      <div className="rg-section-row__header">
        <button
          type="button"
          className="rg-section-row__toggle"
          aria-expanded={expanded}
          data-rg-rowtoggle="true"
          onKeyDown={(event) => handleTreeKeyDown(event, onToggle)}
          onClick={onToggle}
        >
          <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
          <StateDot state={state} />
          <span className="rg-section-row__title">{section.label}</span>
          <span className="rg-section-row__meta">{masteredTopics}/{section.topics.length} topics mastered</span>
        </button>
        {renderAction ? <div className="rg-section-row__action">{renderAction}</div> : null}
      </div>

      {expanded ? (
        <div className="rg-section-row__detail">
          <ul className="rg-topic-list">
            {section.topics.map((topic) => (
              <TopicRow key={topic.id} topic={topic} readiness={topicReadiness[topic.id]} />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  )
}

type ExamRowProps = {
  exam: ExamNode
  readiness?: ReadinessScore
  sectionReadiness?: ReadinessMap
  topicReadiness?: ReadinessMap
  expanded?: boolean
  expandedSectionId?: string | null
  onToggle?: () => void
  onToggleSection?: (sectionId: string) => void
  renderExamAction?: ReactNode
  renderSectionAction?: (section: SectionNode) => ReactNode
  now?: Date
}

const getDeadlineMeta = (exam: ExamNode, now: Date): string | null => {
  const firstDate = exam.assessmentDates[0]?.date
  if (!firstDate) return null
  return `${formatIsoDate(firstDate)} · ${formatRelativeDay(firstDate, now)}`
}

export function ExamRow({
  exam,
  readiness,
  sectionReadiness = {},
  topicReadiness = {},
  expanded = false,
  expandedSectionId = null,
  onToggle,
  onToggleSection,
  renderExamAction,
  renderSectionAction,
  now = new Date(),
}: ExamRowProps) {
  const state = readiness?.phase ?? 'not_started'
  const deadline = getDeadlineMeta(exam, now)
  const masteredSections = exam.sections.filter((section) => sectionReadiness[section.id]?.phase === 'mastered').length

  return (
    <article className={cx('rg-card rg-exam-row', `is-${state}`, expanded && 'is-expanded')}>
      <button
        type="button"
        className="rg-exam-row__toggle"
        aria-expanded={expanded}
        data-rg-rowtoggle="true"
        onKeyDown={(event) => handleTreeKeyDown(event, onToggle)}
        onClick={onToggle}
      >
        <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
        <span className="rg-exam-row__title">{exam.label}</span>
        <span className="rg-exam-row__meta">
          readiness signal {readiness?.score ?? 0}/100 · {masteredSections}/{exam.sections.length} sections mastered
        </span>
        {deadline ? <span className="rg-exam-row__deadline">{deadline}</span> : null}
      </button>

      {expanded ? (
        <div className="rg-exam-row__detail">
          {renderExamAction ? <div className="rg-exam-row__actions">{renderExamAction}</div> : null}
          <ul className="rg-section-list" data-rg-rowlist="true">
            {exam.sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                readiness={sectionReadiness[section.id]}
                topicReadiness={topicReadiness}
                expanded={expandedSectionId === section.id}
                onToggle={() => onToggleSection?.(section.id)}
                renderAction={renderSectionAction?.(section)}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

type CourseHierarchyRowsProps = {
  hierarchy: CourseHierarchy
  readinessById?: ReadinessMap
  expandedExamId?: string | null
  expandedSectionId?: string | null
  onToggleExam?: (examId: string) => void
  onToggleSection?: (sectionId: string) => void
}

export function CourseHierarchyRows({
  hierarchy,
  readinessById = {},
  expandedExamId = null,
  expandedSectionId = null,
  onToggleExam,
  onToggleSection,
}: CourseHierarchyRowsProps) {
  return (
    <section className="rg-course-rows" data-rg-rowtree="true" data-rg-rowlist="true" aria-label="Course readiness hierarchy">
      {hierarchy.units.map((exam) => (
        <ExamRow
          key={exam.id}
          exam={exam}
          readiness={readinessById[exam.id]}
          sectionReadiness={readinessById}
          topicReadiness={readinessById}
          expanded={expandedExamId === exam.id}
          expandedSectionId={expandedSectionId}
          onToggle={() => onToggleExam?.(exam.id)}
          onToggleSection={onToggleSection}
        />
      ))}
    </section>
  )
}

export const readinessPhaseClassName = (phase: PhaseState): string => `is-${phase}`
