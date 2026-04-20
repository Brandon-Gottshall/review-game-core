import type { ExamNode } from '../concept/hierarchy.js'
import { cx, formatIsoDate, formatRelativeDay } from './utils.js'

type DeadlineStripProps = {
  units: readonly ExamNode[]
  now?: Date
  className?: string
}

const getNextAssessment = (unit: ExamNode, now: Date) => {
  const ordered = [...unit.assessmentDates]
    .filter((entry) => entry?.date)
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())

  const upcoming = ordered.find((entry) => new Date(entry.date).getTime() >= now.getTime())
  return upcoming ?? ordered[0] ?? null
}

const getDeadlineTone = (date: string, now: Date): 'past' | 'today' | 'upcoming' => {
  const relative = formatRelativeDay(date, now)
  if (relative === 'Today') return 'today'
  if (relative.endsWith('ago') || relative === 'Yesterday') return 'past'
  return 'upcoming'
}

export function DeadlineStrip({
  units,
  now = new Date(),
  className,
}: DeadlineStripProps) {
  return (
    <footer className={cx('rg-card rg-deadline-strip', className)} aria-label="Upcoming assessment dates">
      {units.map((unit) => {
        const assessment = getNextAssessment(unit, now)
        const tone = assessment ? getDeadlineTone(assessment.date, now) : 'upcoming'

        return (
          <div key={unit.id} className={cx('rg-deadline-strip__item', `is-${tone}`)}>
            <span className="rg-deadline-strip__label">{unit.label}</span>
            {assessment ? (
              <span className="rg-deadline-strip__meta">
                {assessment.label ?? formatIsoDate(assessment.date)}
                {' · '}
                {formatRelativeDay(assessment.date, now)}
              </span>
            ) : (
              <span className="rg-deadline-strip__meta">No assessment date</span>
            )}
          </div>
        )
      })}
    </footer>
  )
}
