import type { ReactNode } from 'react'

import type { GoalPhaseState, GoalRecommendationRole } from '../goal/index.js'
import { cx, formatLocalDateLabel } from './utils.js'

const ROLE_LABELS: Record<GoalRecommendationRole, string> = {
  primary: 'Now',
  catch_up: 'Catch up',
  queued: 'Queued',
  complete: 'Complete',
}

const formatDayCount = (value: number): string => `${value} day${value === 1 ? '' : 's'}`

const formatDeadlineSummary = <TTrackId extends string>(
  phase: GoalPhaseState<TTrackId>
): string | null => {
  if (!phase.deadlineLocalDate) return null

  const dateLabel = formatLocalDateLabel(phase.deadlineLocalDate)

  if (phase.timeStatus === 'today') {
    return `Due today · ${dateLabel}`
  }

  if (phase.timeStatus === 'upcoming' && phase.daysUntilDeadline !== null) {
    return `Due in ${formatDayCount(phase.daysUntilDeadline)} · ${dateLabel}`
  }

  if (phase.timeStatus === 'past_due' && phase.daysFromDeadline !== null) {
    return `Past due by ${formatDayCount(phase.daysFromDeadline)} · ${dateLabel}`
  }

  return `Deadline ${dateLabel}`
}

const formatProgressSummary = <TTrackId extends string>(
  phase: GoalPhaseState<TTrackId>
): string => {
  if (phase.targetCompletedUnits <= 0) {
    return 'Waiting for a progress target'
  }

  const completedLabel = `${phase.completedUnits}/${phase.targetCompletedUnits} complete`
  if (phase.isComplete) {
    return `${completedLabel} · roadmap phase done`
  }

  return `${completedLabel} · ${phase.remainingUnits} left`
}

export type GoalRoadmapTrackLabelResolver<TTrackId extends string = string> = (
  trackId: TTrackId,
  phase: GoalPhaseState<TTrackId>
) => string

export type GoalRoadmapCardProps<TTrackId extends string = string> = {
  title?: string
  phases: readonly GoalPhaseState<TTrackId>[]
  summary?: string | null
  emptyMessage?: string
  className?: string
  getTrackLabel?: GoalRoadmapTrackLabelResolver<TTrackId>
  renderPhaseSupplement?: (phase: GoalPhaseState<TTrackId>) => ReactNode
}

export function GoalRoadmapCard<TTrackId extends string = string>({
  title = 'Goal roadmap',
  phases,
  summary,
  emptyMessage = 'No roadmap phases yet.',
  className,
  getTrackLabel = (trackId) => String(trackId),
  renderPhaseSupplement,
}: GoalRoadmapCardProps<TTrackId>) {
  const activePhase = phases.find((phase) => phase.recommendationRole === 'primary') ?? null
  const heading = activePhase
    ? `Current phase: ${activePhase.label}`
    : phases.length > 0
      ? 'All roadmap phases complete'
      : 'No roadmap yet'
  const resolvedSummary = summary ?? (
    activePhase
      ? `${activePhase.label} is the current focus. Earlier catch-up work stays visible and later phases stay queued.`
      : phases.length > 0
        ? 'Every phase in this roadmap is marked complete.'
        : emptyMessage
  )

  return (
    <section className={cx('rg-card rg-goal-roadmap', className)} aria-label={title}>
      <p className="rg-kicker">{title}</p>
      <h3>{heading}</h3>
      <p className="rg-note">{resolvedSummary}</p>

      {phases.length > 0 ? (
        <ol className="rg-goal-roadmap__list">
          {phases.map((phase, index) => {
            const progressPercent = Math.round(phase.progressRatio * 100)
            const deadlineSummary = formatDeadlineSummary(phase)
            const trackLabel = getTrackLabel(phase.trackId, phase)

            return (
              <li
                key={phase.id}
                className={cx(
                  'rg-goal-roadmap__item',
                  `is-${phase.recommendationRole}`,
                  phase.isActive && 'is-active',
                  phase.isComplete && 'is-complete',
                )}
              >
                <div className="rg-goal-roadmap__rail" aria-hidden="true">
                  <span className="rg-goal-roadmap__step">{index + 1}</span>
                  {index < phases.length - 1 ? <span className="rg-goal-roadmap__line" /> : null}
                </div>

                <article className="rg-goal-roadmap__panel">
                  <div className="rg-goal-roadmap__head">
                    <div className="rg-goal-roadmap__headcopy">
                      <p className="rg-goal-roadmap__title">{phase.label}</p>
                      {phase.description ? <p className="rg-note">{phase.description}</p> : null}
                    </div>
                    <span className={cx('rg-goal-roadmap__badge', `is-${phase.recommendationRole}`)}>
                      {ROLE_LABELS[phase.recommendationRole]}
                    </span>
                  </div>

                  <div className="rg-goal-roadmap__meta">
                    <span className="rg-chip">Track: {trackLabel}</span>
                    {deadlineSummary ? <span className="rg-chip">{deadlineSummary}</span> : null}
                  </div>

                  <div className="rg-goal-roadmap__progress">
                    <div
                      className="rg-goal-roadmap__bar"
                      role="progressbar"
                      aria-label={`${phase.label} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progressPercent}
                    >
                      <span
                        className={cx('rg-goal-roadmap__barfill', `is-${phase.recommendationRole}`)}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="rg-note">{formatProgressSummary(phase)}</p>
                  </div>

                  {renderPhaseSupplement ? (
                    <div className="rg-goal-roadmap__supplement">
                      {renderPhaseSupplement(phase)}
                    </div>
                  ) : null}
                </article>
              </li>
            )
          })}
        </ol>
      ) : null}
    </section>
  )
}
