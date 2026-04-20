'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  CRAM_URGENT_THRESHOLD_MS,
  tickCramSession,
  type CramSession,
} from '../workflow/cram-mode.js'
import { cx } from './utils.js'

type CramTimerProps = {
  session: CramSession
  className?: string
}

const formatRemaining = (remainingMs: number): string => {
  const clamped = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function CramTimer({ session, className }: CramTimerProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!session.endsAt || session.state === 'complete') return undefined

    const handle = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(handle)
    }
  }, [session.endsAt, session.state])

  const remainingMs = useMemo(() => {
    if (!session.endsAt) return 0
    return Math.max(0, new Date(session.endsAt).getTime() - now.getTime())
  }, [now, session.endsAt])
  const nextState = tickCramSession(session, now)

  return (
    <span
      className={cx(
        'rg-cram-timer',
        nextState.state === 'urgent' && 'is-urgent',
        nextState.state === 'complete' && 'is-complete',
        className,
      )}
      aria-label={`${formatRemaining(remainingMs)} remaining`}
    >
      {nextState.state === 'complete' ? 'Complete' : formatRemaining(remainingMs)}
    </span>
  )
}

type CramBannerProps = {
  session: CramSession
  examLabel: string
  coveredCount?: number
  totalCount?: number
  description?: string | null
  className?: string
}

export function CramBanner({
  session,
  examLabel,
  coveredCount,
  totalCount,
  description,
  className,
}: CramBannerProps) {
  const nextState = tickCramSession(session, new Date())
  const completionLabel = typeof coveredCount === 'number' && typeof totalCount === 'number'
    ? `${coveredCount}/${totalCount} concepts covered`
    : null

  return (
    <section className={cx('rg-card rg-cram-banner', `is-${nextState.state}`, className)} aria-label="Cram session">
      <div>
        <p className="rg-kicker">Cram mode</p>
        <h3>{examLabel}</h3>
        {description ? <p className="rg-note">{description}</p> : null}
        {completionLabel ? <p className="rg-note">{completionLabel}</p> : null}
      </div>
      <div className="rg-cram-banner__meta">
        <span className="rg-chip">{Math.round(session.durationMs / 60000)} min</span>
        <CramTimer session={session} />
      </div>
    </section>
  )
}

export const isUrgentCramSession = (session: CramSession, now = new Date()): boolean => {
  if (!session.endsAt) return false
  return new Date(session.endsAt).getTime() - now.getTime() <= CRAM_URGENT_THRESHOLD_MS
}
