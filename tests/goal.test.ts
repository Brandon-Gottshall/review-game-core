import { describe, expect, it } from 'vitest'

import {
  buildGoalPhaseStates,
  buildMasteryWeightedTrackWeights,
  evaluateGoalPlan,
  getActiveGoalPhaseState,
  getGoalTrackPriority,
  pickMasteryWeightedTrack,
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
    expect(reviewGameCore.pickMasteryWeightedTrack).toBeTypeOf('function')
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

  it('builds mastery-weighted track weights from mastered ratios with a selectable floor', () => {
    expect(buildMasteryWeightedTrackWeights([
      {
        trackId: 'exam3',
        masteredUnits: 0,
        totalUnits: 10,
      },
      {
        trackId: 'final',
        masteredUnits: 9,
        totalUnits: 10,
      },
      {
        trackId: 'exam2',
        masteredUnits: 10,
        totalUnits: 10,
      },
    ])).toEqual([
      expect.objectContaining({
        trackId: 'exam3',
        masteryRatio: 0,
        masteryGap: 1,
        weight: 1,
      }),
      expect.objectContaining({
        trackId: 'final',
        masteryRatio: 0.9,
        masteryGap: 0.1,
        weight: 0.15,
      }),
      expect.objectContaining({
        trackId: 'exam2',
        masteryRatio: 1,
        masteryGap: 0,
        weight: 0.15,
      }),
    ])
  })

  it('uses weighted random selection to favor weaker tracks without excluding strong ones', () => {
    const candidates = [
      {
        trackId: 'exam3',
        masteredUnits: 0,
        totalUnits: 10,
      },
      {
        trackId: 'final',
        masteredUnits: 9,
        totalUnits: 10,
      },
    ] as const

    expect(pickMasteryWeightedTrack(candidates, {
      random: () => 0.1,
    })?.trackId).toBe('exam3')

    expect(pickMasteryWeightedTrack(candidates, {
      random: () => 0.99,
    })?.trackId).toBe('final')
  })

  it('keeps mastery-weighted selection stable for the same seed key and mastery snapshot', () => {
    const candidates = [
      {
        trackId: 'exam3',
        masteredUnits: 2,
        totalUnits: 10,
      },
      {
        trackId: 'final',
        masteredUnits: 8,
        totalUnits: 10,
      },
      {
        trackId: 'exam2',
        masteredUnits: 4,
        totalUnits: 10,
      },
    ] as const

    const first = pickMasteryWeightedTrack(candidates, {
      seedKey: '2026-04-22',
    })
    const second = pickMasteryWeightedTrack(candidates, {
      seedKey: '2026-04-22',
    })
    const shifted = pickMasteryWeightedTrack(candidates, {
      seedKey: '2026-04-23',
    })

    expect(first).not.toBeNull()
    expect(first?.trackId).toBe(second?.trackId)
    expect(first?.totalWeight).toBe(second?.totalWeight)
    expect(['exam3', 'final', 'exam2']).toContain(shifted?.trackId)
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

  it('skips across multiple consecutive past-due advance-after-deadline phases', () => {
    const evaluation = evaluateGoalPlan({
      id: 'multi-deadline-shift',
      label: 'Multi deadline shift',
      phases: [
        {
          id: 'phase-1',
          label: 'Phase 1',
          trackId: 'exam3',
          deadlineLocalDate: '2026-04-15',
          deadlineBehavior: 'advance_after_deadline',
        },
        {
          id: 'phase-2',
          label: 'Phase 2',
          trackId: 'exam2',
          deadlineLocalDate: '2026-04-17',
          deadlineBehavior: 'advance_after_deadline',
        },
        {
          id: 'phase-3',
          label: 'Phase 3',
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
        trackId: 'exam2',
        completedUnits: 1,
        totalUnits: 10,
      },
      {
        phaseId: 'phase-3',
        trackId: 'final',
        completedUnits: 0,
        totalUnits: 10,
      },
    ], {
      localDate: '2026-04-18',
    })

    expect(evaluation.activePhase?.id).toBe('phase-3')
    expect(evaluation.phases.map((phase) => phase.recommendationRole)).toEqual([
      'catch_up',
      'catch_up',
      'primary',
    ])
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
