import { describe, expect, it } from 'vitest'

import {
  CRAM_DURATION_PRESETS_MS,
  CRAM_URGENT_THRESHOLD_MS,
  createIdleCramSession,
  startCramSession,
  tickCramSession,
} from '../src/workflow/cram-mode.js'

describe('cram-mode', () => {
  it('locks the default duration presets', () => {
    expect(CRAM_DURATION_PRESETS_MS).toEqual([
      10 * 60 * 1000,
      20 * 60 * 1000,
      30 * 60 * 1000,
    ])
  })

  it('creates an idle session before a timer starts', () => {
    expect(createIdleCramSession('exam-1')).toEqual({
      state: 'idle',
      durationMs: 0,
      startedAt: null,
      endsAt: null,
      examId: 'exam-1',
    })
  })

  it('enters running, urgent, then complete as the timer advances', () => {
    const started = startCramSession('exam-1', 10 * 60 * 1000, new Date('2026-04-19T12:00:00.000Z'))
    expect(started.state).toBe('running')

    const urgent = tickCramSession(
      started,
      new Date(new Date(started.endsAt!).getTime() - CRAM_URGENT_THRESHOLD_MS + 1000),
    )
    expect(urgent.state).toBe('urgent')

    const complete = tickCramSession(started, new Date(started.endsAt!))
    expect(complete.state).toBe('complete')
  })
})
