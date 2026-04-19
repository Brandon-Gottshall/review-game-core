export type GoalDeadlineBehavior =
  | 'stay_primary_until_complete'
  | 'advance_after_deadline'

export type GoalTimeStatus = 'none' | 'upcoming' | 'today' | 'past_due'

export type GoalRecommendationRole = 'primary' | 'catch_up' | 'queued' | 'complete'

export interface GoalPhaseDefinition<TTrackId extends string = string> {
  id: string
  label: string
  trackId: TTrackId
  description?: string
  deadlineLocalDate?: string
  deadlineBehavior?: GoalDeadlineBehavior
  targetCompletedUnits?: number
}

export interface GoalPlan<TTrackId extends string = string> {
  id: string
  label: string
  phases: readonly GoalPhaseDefinition<TTrackId>[]
}

export interface GoalPhaseSnapshot<TTrackId extends string = string> {
  phaseId: string
  trackId: TTrackId
  completedUnits: number
  totalUnits: number
}

export interface GoalEvaluationContext {
  localDate?: string
}

export interface GoalPhaseState<TTrackId extends string = string>
  extends GoalPhaseDefinition<TTrackId> {
  completedUnits: number
  totalUnits: number
  targetCompletedUnits: number
  remainingUnits: number
  progressRatio: number
  isComplete: boolean
  isActive: boolean
  deadlineBehavior: GoalDeadlineBehavior
  timeStatus: GoalTimeStatus
  daysUntilDeadline: number | null
  daysFromDeadline: number | null
  recommendationRole: GoalRecommendationRole
}

export interface GoalPlanEvaluation<TTrackId extends string = string> {
  plan: GoalPlan<TTrackId>
  localDate: string | null
  phases: GoalPhaseState<TTrackId>[]
  activePhase: GoalPhaseState<TTrackId> | null
  trackPriority: TTrackId[]
}

export const DEFAULT_GOAL_DEADLINE_BEHAVIOR: GoalDeadlineBehavior = 'stay_primary_until_complete'

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const ROLE_PRIORITY: Record<GoalRecommendationRole, number> = {
  primary: 0,
  catch_up: 1,
  queued: 2,
  complete: 3,
}

const assertNonNegativeInteger = (value: number, label: string): number => {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`)
  }

  return value
}

const parseGoalLocalDate = (value: string, label: string): number => {
  if (!LOCAL_DATE_PATTERN.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD format`)
  }

  const [yearToken, monthToken, dayToken] = value.split('-')
  const year = Number(yearToken)
  const month = Number(monthToken)
  const day = Number(dayToken)
  const utc = Date.UTC(year, month - 1, day)
  const parsed = new Date(utc)

  if (
    Number.isNaN(parsed.getTime())
    || parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    throw new Error(`${label} must be a real calendar date`)
  }

  return utc
}

const compareGoalLocalDates = (left: string, right: string): number => {
  const leftUtc = parseGoalLocalDate(left, 'localDate')
  const rightUtc = parseGoalLocalDate(right, 'deadlineLocalDate')
  const MS_PER_DAY = 86_400_000
  return Math.round((leftUtc - rightUtc) / MS_PER_DAY)
}

const resolveTimeStatus = <TTrackId extends string>(
  phase: GoalPhaseDefinition<TTrackId>,
  context: GoalEvaluationContext
): Pick<GoalPhaseState<TTrackId>, 'timeStatus' | 'daysUntilDeadline' | 'daysFromDeadline'> => {
  if (!phase.deadlineLocalDate) {
    return {
      timeStatus: 'none',
      daysUntilDeadline: null,
      daysFromDeadline: null,
    }
  }

  parseGoalLocalDate(phase.deadlineLocalDate, 'deadlineLocalDate')

  if (!context.localDate) {
    return {
      timeStatus: 'none',
      daysUntilDeadline: null,
      daysFromDeadline: null,
    }
  }

  const dayDelta = compareGoalLocalDates(context.localDate, phase.deadlineLocalDate)
  if (dayDelta < 0) {
    return {
      timeStatus: 'upcoming',
      daysUntilDeadline: Math.abs(dayDelta),
      daysFromDeadline: 0,
    }
  }

  if (dayDelta === 0) {
    return {
      timeStatus: 'today',
      daysUntilDeadline: 0,
      daysFromDeadline: 0,
    }
  }

  return {
    timeStatus: 'past_due',
    daysUntilDeadline: 0,
    daysFromDeadline: dayDelta,
  }
}

const distinctTrackPriority = <TTrackId extends string>(
  phases: readonly GoalPhaseState<TTrackId>[]
): TTrackId[] => {
  const orderedPhases = phases
    .slice()
    .sort((left, right) => {
      if (left.recommendationRole !== right.recommendationRole) {
        return ROLE_PRIORITY[left.recommendationRole] - ROLE_PRIORITY[right.recommendationRole]
      }

      return 0
    })
  const seen = new Set<TTrackId>()
  const priority: TTrackId[] = []

  for (const phase of orderedPhases) {
    if (phase.recommendationRole === 'complete' || seen.has(phase.trackId)) {
      continue
    }

    seen.add(phase.trackId)
    priority.push(phase.trackId)
  }

  return priority
}

export function resolveGoalLocalDate(
  now: Date | number | string = new Date(),
  timeZone = 'UTC'
): string {
  const date = now instanceof Date ? now : new Date(now)
  if (Number.isNaN(date.getTime())) {
    throw new Error('resolveGoalLocalDate received an invalid date input')
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('resolveGoalLocalDate could not resolve a local date')
  }

  return `${year}-${month}-${day}`
}

export function evaluateGoalPlan<TTrackId extends string>(
  plan: GoalPlan<TTrackId>,
  snapshots: readonly GoalPhaseSnapshot<TTrackId>[],
  context: GoalEvaluationContext = {}
): GoalPlanEvaluation<TTrackId> {
  if (context.localDate) {
    parseGoalLocalDate(context.localDate, 'localDate')
  }

  const phaseIds = new Set<string>()
  for (const phase of plan.phases) {
    if (phaseIds.has(phase.id)) {
      throw new Error(`Duplicate goal phase id: ${phase.id}`)
    }
    phaseIds.add(phase.id)
    if (phase.deadlineLocalDate) {
      parseGoalLocalDate(phase.deadlineLocalDate, 'deadlineLocalDate')
    }
    if (phase.targetCompletedUnits !== undefined) {
      assertNonNegativeInteger(phase.targetCompletedUnits, `targetCompletedUnits for phase ${phase.id}`)
    }
  }

  const snapshotMap = new Map<string, GoalPhaseSnapshot<TTrackId>>()
  for (const snapshot of snapshots) {
    if (snapshotMap.has(snapshot.phaseId)) {
      throw new Error(`Duplicate goal phase snapshot id: ${snapshot.phaseId}`)
    }
    assertNonNegativeInteger(snapshot.completedUnits, `completedUnits for phase ${snapshot.phaseId}`)
    assertNonNegativeInteger(snapshot.totalUnits, `totalUnits for phase ${snapshot.phaseId}`)
    snapshotMap.set(snapshot.phaseId, snapshot)
  }

  const baseStates = plan.phases.map((phase) => {
    const snapshot = snapshotMap.get(phase.id)
    if (snapshot && snapshot.trackId !== phase.trackId) {
      throw new Error(`Goal phase snapshot track mismatch for phase ${phase.id}`)
    }

    const completedUnits = snapshot?.completedUnits ?? 0
    const totalUnits = snapshot?.totalUnits ?? 0
    const targetCompletedUnits = phase.targetCompletedUnits ?? totalUnits
    const remainingUnits = Math.max(targetCompletedUnits - completedUnits, 0)
    const progressRatio = targetCompletedUnits <= 0
      ? 0
      : Math.min(completedUnits / targetCompletedUnits, 1)
    const isComplete = completedUnits >= targetCompletedUnits
    const deadlineBehavior = phase.deadlineBehavior ?? DEFAULT_GOAL_DEADLINE_BEHAVIOR
    const timeStatus = resolveTimeStatus(phase, context)

    return {
      ...phase,
      completedUnits,
      totalUnits,
      targetCompletedUnits,
      remainingUnits,
      progressRatio,
      isComplete,
      isActive: false,
      deadlineBehavior,
      timeStatus: timeStatus.timeStatus,
      daysUntilDeadline: timeStatus.daysUntilDeadline,
      daysFromDeadline: timeStatus.daysFromDeadline,
      recommendationRole: isComplete ? 'complete' : 'queued',
    } satisfies GoalPhaseState<TTrackId>
  })

  const firstIncompleteIndex = baseStates.findIndex((phase) => !phase.isComplete)
  let primaryIndex = -1
  const catchUpIndexes = new Set<number>()

  if (firstIncompleteIndex >= 0) {
    let candidateIndex = firstIncompleteIndex

    while (candidateIndex >= 0) {
      const candidatePhase = baseStates[candidateIndex]
      if (!candidatePhase) {
        throw new Error('Goal planner could not resolve an incomplete phase')
      }

      const shouldAdvance = (
        candidatePhase.timeStatus === 'past_due'
        && candidatePhase.deadlineBehavior === 'advance_after_deadline'
      )
      if (!shouldAdvance) {
        primaryIndex = candidateIndex
        break
      }

      const nextIncompleteIndex = baseStates.findIndex((phase, index) => (
        index > candidateIndex && !phase.isComplete
      ))
      if (nextIncompleteIndex < 0) {
        primaryIndex = candidateIndex
        break
      }

      catchUpIndexes.add(candidateIndex)
      candidateIndex = nextIncompleteIndex
    }
  }

  const evaluatedPhases = baseStates.map((phase, index) => {
    if (phase.isComplete) {
      return phase
    }

    if (index === primaryIndex) {
      return {
        ...phase,
        isActive: true,
        recommendationRole: 'primary' as const,
      }
    }

    if (catchUpIndexes.has(index)) {
      return {
        ...phase,
        recommendationRole: 'catch_up' as const,
      }
    }

    return {
      ...phase,
      recommendationRole: 'queued' as const,
    }
  })

  const activePhase = evaluatedPhases.find((phase) => phase.recommendationRole === 'primary') ?? null

  return {
    plan,
    localDate: context.localDate ?? null,
    phases: evaluatedPhases,
    activePhase,
    trackPriority: distinctTrackPriority(evaluatedPhases),
  }
}

export function buildGoalPhaseStates<TTrackId extends string>(
  plan: GoalPlan<TTrackId>,
  snapshots: readonly GoalPhaseSnapshot<TTrackId>[],
  context: GoalEvaluationContext = {}
): GoalPhaseState<TTrackId>[] {
  return evaluateGoalPlan(plan, snapshots, context).phases
}

export function getActiveGoalPhaseState<TTrackId extends string>(
  phases: readonly GoalPhaseState<TTrackId>[]
): GoalPhaseState<TTrackId> | null {
  return phases.find((phase) => phase.recommendationRole === 'primary') ?? null
}

export function getGoalTrackPriority<TTrackId extends string>(
  phases: readonly GoalPhaseState<TTrackId>[]
): TTrackId[] {
  return distinctTrackPriority(phases)
}
