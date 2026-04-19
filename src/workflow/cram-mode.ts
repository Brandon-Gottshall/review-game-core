export type CramState = 'idle' | 'running' | 'urgent' | 'complete'

export type CramSession = {
  state: CramState
  durationMs: number
  startedAt: string | null
  endsAt: string | null
  examId: string
}

export const CRAM_DURATION_PRESETS_MS = [
  10 * 60 * 1000,
  20 * 60 * 1000,
  30 * 60 * 1000,
] as const

export const CRAM_URGENT_THRESHOLD_MS = 2 * 60 * 1000

export const createIdleCramSession = (examId: string): CramSession => ({
  state: 'idle',
  durationMs: 0,
  startedAt: null,
  endsAt: null,
  examId,
})

export const startCramSession = (
  examId: string,
  durationMs: number,
  now = new Date(),
): CramSession => {
  const startedAt = now.toISOString()
  const endsAt = new Date(now.getTime() + durationMs).toISOString()

  return tickCramSession({
    state: 'running',
    durationMs,
    startedAt,
    endsAt,
    examId,
  }, now)
}

export const tickCramSession = (session: CramSession, now: Date): CramSession => {
  if (!session.startedAt || !session.endsAt || session.durationMs <= 0) {
    return {
      ...session,
      state: 'idle',
      startedAt: session.startedAt,
      endsAt: session.endsAt,
    }
  }

  const endsAt = new Date(session.endsAt)
  if (Number.isNaN(endsAt.getTime())) {
    return {
      ...session,
      state: 'idle',
      endsAt: null,
    }
  }

  const remainingMs = endsAt.getTime() - now.getTime()
  if (remainingMs <= 0) {
    return {
      ...session,
      state: 'complete',
    }
  }

  return {
    ...session,
    state: remainingMs <= CRAM_URGENT_THRESHOLD_MS ? 'urgent' : 'running',
  }
}
