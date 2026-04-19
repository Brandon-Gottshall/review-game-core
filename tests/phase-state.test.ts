import { describe, expect, it } from 'vitest'

import {
  PHASE_STATE_LABELS,
  PHASE_STATE_ORDER,
  nextPhaseState,
  type PhaseSignal,
  type PhaseState,
} from '../src/scheduler/phase-state.js'

const signals: readonly PhaseSignal[] = [
  'start',
  'practice',
  'master',
  'struggle',
  'track',
  'reset',
]

const matrix: Record<PhaseState, Record<PhaseSignal, PhaseState>> = {
  not_started: {
    start: 'learning',
    practice: 'learning',
    master: 'mastered',
    struggle: 'shaky',
    track: 'tracked_in_quiz',
    reset: 'not_started',
  },
  learning: {
    start: 'learning',
    practice: 'practicing',
    master: 'mastered',
    struggle: 'shaky',
    track: 'tracked_in_quiz',
    reset: 'not_started',
  },
  practicing: {
    start: 'practicing',
    practice: 'practicing',
    master: 'mastered',
    struggle: 'shaky',
    track: 'tracked_in_quiz',
    reset: 'not_started',
  },
  mastered: {
    start: 'practicing',
    practice: 'practicing',
    master: 'mastered',
    struggle: 'shaky',
    track: 'tracked_in_quiz',
    reset: 'not_started',
  },
  shaky: {
    start: 'learning',
    practice: 'practicing',
    master: 'mastered',
    struggle: 'shaky',
    track: 'tracked_in_quiz',
    reset: 'not_started',
  },
  tracked_in_quiz: {
    start: 'learning',
    practice: 'practicing',
    master: 'mastered',
    struggle: 'shaky',
    track: 'tracked_in_quiz',
    reset: 'not_started',
  },
}

describe('phase-state', () => {
  it('locks the canonical phase order and labels', () => {
    expect(PHASE_STATE_ORDER).toEqual([
      'not_started',
      'learning',
      'practicing',
      'mastered',
      'shaky',
      'tracked_in_quiz',
    ])
    expect(PHASE_STATE_LABELS.tracked_in_quiz).toBe('Tracked in quiz')
  })

  it('covers the full transition matrix', () => {
    for (const [current, row] of Object.entries(matrix) as Array<[PhaseState, Record<PhaseSignal, PhaseState>]>) {
      for (const signal of signals) {
        expect(nextPhaseState(current, signal)).toBe(row[signal])
      }
    }
  })
})
