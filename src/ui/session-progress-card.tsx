'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'

import { cx } from './utils.js'

export type SessionProgressMetric = {
  id: string
  label: string
  value: string | number
  detail?: string
}

type SessionProgressCardProps = {
  title?: string
  metrics: readonly SessionProgressMetric[]
  goalHint?: string | null
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children?: ReactNode
}

export function SessionProgressCard({
  title = 'Session progress',
  metrics,
  goalHint,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
}: SessionProgressCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const resolvedOpen = open ?? internalOpen
  const bodyId = `${useId()}-body`

  useEffect(() => {
    if (typeof open === 'boolean') return
    setInternalOpen(defaultOpen)
  }, [defaultOpen, open])

  const setOpen = (next: boolean) => {
    if (typeof open !== 'boolean') setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <section className={cx('rg-card rg-session-progress', className)} aria-label={title}>
      <button
        type="button"
        className="rg-session-progress__toggle"
        aria-expanded={resolvedOpen}
        aria-controls={bodyId}
        onClick={() => setOpen(!resolvedOpen)}
      >
        <span className="rg-kicker">{title}</span>
        <span>{resolvedOpen ? 'Hide' : 'Open'}</span>
      </button>

      {resolvedOpen ? (
        <div id={bodyId} className="rg-session-progress__body">
          <div className="rg-session-progress__metrics">
            {metrics.map((metric) => (
              <article key={metric.id} className="rg-session-progress__metric">
                <span className="rg-session-progress__metric-value">{metric.value}</span>
                <span className="rg-session-progress__metric-label">{metric.label}</span>
                {metric.detail ? <span className="rg-note">{metric.detail}</span> : null}
              </article>
            ))}
          </div>
          {goalHint ? <p className="rg-note">{goalHint}</p> : null}
          {children}
        </div>
      ) : null}
    </section>
  )
}
