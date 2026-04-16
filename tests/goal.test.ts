import { describe, expect, it } from 'vitest'

import {
  buildGoalPhaseStates,
  evaluateGoalPlan,
  getActiveGoalPhaseState,
  getGoalTrackPriority,
  resolveGoalLocalDate,
  type GoalPhaseSnapshot,
  type GoalPlan,
} from '../src/goal/index.js'
import * as reviewGameCore from '../src/index.js'

type TrackId = 'exam3' | 'final' | 'exam2'

const basePlan: GoalPlan<TrackId> = {
  id: 'a-path',
  label: 'A-path sprint',
  phases: [
    {
      id: 'exam3-clean',
      label: 'Perfect Exam 3 first',
      trackId: 'exam3',
    },
    {
      id: 'final-sweep',
      label: 'Hit the cumulative final hard',
      trackId: 'final',
      targetCompletedUnits: 15,
    },
  ],
}

describe('goal planner', () => {
  it('re-exports the planning helpers from the package root', () => {
    expect(reviewGameCore.evaluateGoalPlan).toBeTypeOf('function')
    expect(reviewGameCore.buildGoalPhaseStates).toBeTypeOf('function')
  })

  it('marks the first incomplete phase as active', () => {
    const snapshots: GoalPhaseSnapshot<TrackId>[] = [
      {
        phaseId: 'exam3-clean',
        trackId: 'exam3',
        completedUnits: 8,
        totalUnits: 12,
      },
      {
        phaseId: 'final-sweep',
        trackId: 'final',
        completedUnits: 2,
        totalUnits: 20,
      },
    ]

    const states = buildGoalPhaseStates(basePlan, snapshots)
    expect(states.map((state) => [state.id, state.isActive, state.isComplete])).toEqual([
      ['exam3-clean', true, false],
      ['final-sweep', false, false],
    ])
    expect(states[1]?.targetCompletedUnits).toBe(15)
  })

  it('advances the active phase after the first phase is complete', () => {
    const phases = buildGoalPhaseStates(basePlan, [
      {
        phaseId: 'exam3-clean',
        trackId: 'exam3',
        completedUnits: 12,
        totalUnits: 12,
      },
      {
        phaseId: 'final-sweep',
        trackId: 'final',
        completedUnits: 6,
        totalUnits: 20,
      },
    ])

    expect(getActiveGoalPhaseState(phases)?.id).toBe('final-sweep')
    expect(phases[1]?.remainingUnits).toBe(9)
  })

  it('returns no active phase when all phases are complete', () => {
    const evaluation = evaluateGoalPlan(basePlan, [
      {
        phaseId: 'exam3-clean',
        trackId: 'exam3',
        completedUnits: 12,
        totalUnits: 12,
      },
      {
        phaseId: 'final-sweep',
        trackId: 'final',
        completedUnits: 15,
        totalUnits: 20,
      },
    ])

    expect(evaluation.activePhase).toBeNull()
    expect(evaluation.trackPriority).toEqual([])
    expect(evaluation.phases.map((phase) => phase.recommendationRole)).toEqual(['complete', 'complete'])
  })

  it('derives track priority from recommendation role then plan order', () => {
    const evaluation = evaluateGoalPlan({
      id: 'priority',
      label: 'Priority',
      phases: [
        {
          id: 'phase-1',
          label: 'Phase 1',
          trackId: 'exam3',
          deadlineLocalDate: '2026-04-14',
          deadlineBehavior: 'advance_after_deadline',
        },
        {
          id: 'phase-2',
          label: 'Phase 2',
          trackId: 'final',
        },
        {
          id: 'phase-3',
          label: 'Phase 3',
          trackId: 'exam2',
        },
      ],
    }, [
      {
        phaseId: 'phase-1',
        trackId: 'exam3',
        completedUnits: 0,
        totalUnits: 10,
      },
      {
        phaseId: 'phase-2',
        trackId: 'final',
        completedUnits: 1,
        totalUnits: 10,
      },
      {
        phaseId: 'phase-3',
        trackId: 'exam2',
        completedUnits: 0,
        totalUnits: 10,
      },
    ], {
      localDate: '2026-04-15',
    })

    expect(getGoalTrackPriority(evaluation.phases)).toEqual(['final', 'exam3', 'exam2'])
  })

  it('demotes a past-due phase to catch-up when a later incomplete phase exists', () => {
    const evaluation = evaluateGoalPlan({
      id: 'deadline-shift',
      label: 'Deadline shift',
      phases: [
        {
          id: 'phase-1',
          label: 'Phase 1',
          trackId: 'exam3',
          deadlineLocalDate: '2026-04-14',
          deadlineBehavior: 'advance_after_deadline',
        },
        {
          id: 'phase-2',
          label: 'Phase 2',
          trackId: 'final',
        },
      ],
    }, [
      {
        phaseId: 'phase-1',
        trackId: 'exam3',
        completedUnits: 2,
        totalUnits: 10,
      },
      {
        phaseId: 'phase-2',
        trackId: 'final',
        completedUnits: 1,
        totalUnits: 10,
      },
    ], {
      localDate: '2026-04-15',
    })

    expect(evaluation.activePhase?.id).toBe('phase-2')
    expect(evaluation.phases[0]?.recommendationRole).toBe('catch_up')
    expect(evaluation.phases[1]?.recommendationRole).toBe('primary')
  })

  it('keeps a past-due phase primary when there is no later incomplete phase', () => {
    const evaluation = evaluateGoalPlan({
      id: 'final-phase',
      label: 'Final phase',
      phases: [
        {
          id: 'phase-1',
          label: 'Phase 1',
          trackId: 'exam3',
          deadlineLocalDate: '2026-04-14',
          deadlineBehavior: 'advance_after_deadline',
        },
      ],
    }, [
      {
        phaseId: 'phase-1',
        trackId: 'exam3',
        completedUnits: 2,
        totalUnits: 10,
      },
    ], {
      localDate: '2026-04-15',
    })

    expect(evaluation.activePhase?.id).toBe('phase-1')
    expect(evaluation.phases[0]?.recommendationRole).toBe('primary')
  })

  it('treats today as still primary', () => {
    const phase = evaluateGoalPlan({
      id: 'today',
      label: 'Today',
      phases: [
        {
          id: 'phase-1',
          label: 'Phase 1',
          trackId: 'exam3',
          deadlineLocalDate: '2026-04-14',
          deadlineBehavior: 'advance_after_deadline',
        },
      ],
    }, [
      {
        phaseId: 'phase-1',
        trackId: 'exam3',
        completedUnits: 0,
        totalUnits: 10,
      },
    ], {
      localDate: '2026-04-14',
    }).phases[0]

    expect(phase?.timeStatus).toBe('today')
    expect(phase?.recommendationRole).toBe('primary')
  })

  it('uses zero progress for missing snapshots and ignores unknown snapshots', () => {
    const evaluation = evaluateGoalPlan(basePlan, [
      {
        phaseId: 'unknown-phase',
        trackId: 'exam2',
        completedUnits: 4,
        totalUnits: 10,
      },
    ] as GoalPhaseSnapshot<TrackId>[])

    expect(evaluation.phases[0]).toMatchObject({
      completedUnits: 0,
      totalUnits: 0,
      targetCompletedUnits: 0,
      isComplete: true,
    })
    expect(evaluation.phases[1]).toMatchObject({
      completedUnits: 0,
      totalUnits: 0,
      targetCompletedUnits: 15,
      isComplete: false,
    })
  })

  it('resolves local dates in the provided timezone', () => {
    expect(resolveGoalLocalDate('2026-04-16T03:00:00Z', 'America/New_York')).toBe('2026-04-15')
    expect(resolveGoalLocalDate('2026-04-16T03:00:00Z', 'UTC')).toBe('2026-04-16')
  })

  it('throws on duplicate phase ids', () => {
    expect(() => evaluateGoalPlan({
      id: 'bad-plan',
      label: 'Bad plan',
      phases: [
        {
          id: 'duplicate',
          label: 'Phase 1',
          trackId: 'exam3',
        },
        {
          id: 'duplicate',
          label: 'Phase 2',
          trackId: 'final',
        },
      ],
    }, [])).toThrow(/Duplicate goal phase id/)
  })

  it('throws on duplicate snapshot ids', () => {
    expect(() => evaluateGoalPlan(basePlan, [
      {
        phaseId: 'exam3-clean',
        trackId: 'exam3',
        completedUnits: 1,
        totalUnits: 12,
      },
      {
        phaseId: 'exam3-clean',
        trackId: 'exam3',
        completedUnits: 2,
        totalUnits: 12,
      },
    ])).toThrow(/Duplicate goal phase snapshot id/)
  })

  it('throws on negative progress values', () => {
    expect(() => evaluateGoalPlan(basePlan, [
      {
        phaseId: 'exam3-clean',
        trackId: 'exam3',
        completedUnits: -1,
        totalUnits: 12,
      },
    ])).toThrow(/non-negative integer/)
  })

  it('throws on invalid local-date inputs', () => {
    expect(() => evaluateGoalPlan(basePlan, [], { localDate: '04-16-2026' })).toThrow(/YYYY-MM-DD/)
    expect(() => evaluateGoalPlan({
      ...basePlan,
      phases: [
        {
          id: 'exam3-clean',
          label: 'Exam 3',
          trackId: 'exam3',
          deadlineLocalDate: '2026-02-30',
        },
      ],
    }, [])).toThrow(/real calendar date/)
  })

  it('throws on mismatched snapshot track ids', () => {
    expect(() => evaluateGoalPlan(basePlan, [
      {
        phaseId: 'exam3-clean',
        trackId: 'final',
        completedUnits: 1,
        totalUnits: 12,
      },
    ])).toThrow(/track mismatch/)
  })
})
