import {
  buildInitialConceptSchedule,
  createSchedulerPolicy,
  isRetentionDue,
  mergeConceptSchedule,
  type ConceptScheduleMap,
  type ConceptScheduleState,
  type PracticeOutcome,
  type SchedulerPolicy,
  type SubskillProgressMap,
  type SubskillProgressState,
  type SubskillUpdate,
} from './base.js'

export type RepetitionPhase = 'light' | 'hard' | 'recovery-light'
export type RecoverySupportMode = 'none' | 'same-concept-recovery' | 'support-concept-recovery'
export type ConceptSelectionReason =
  | 'new_concept'
  | 'guided_mastery'
  | 'recovery_due'
  | 'retention_due'
  | `weakest_subskill:${string}`

export interface GuidedConceptProgressState<TSubskill extends string = string> extends ConceptScheduleState<TSubskill> {
  lightPassCount: number
  hardPassCount: number
  recoveryLightRemaining: number
  recoverySupportMode: RecoverySupportMode
}

export type GuidedConceptProgressMap<TSubskill extends string = string> =
  Record<string, GuidedConceptProgressState<TSubskill>>

export interface ConceptRepetitionPlan {
  repPhase: RepetitionPhase
  repIndex: 1 | 2 | 3 | 4 | 5 | 6
  supportMode: RecoverySupportMode
  hardAttemptLimit: number | null
}

export type ConceptStateBadge =
  | 'Emerging'
  | 'Supported'
  | 'Independent'
  | 'Mastered'
  | 'Retention due'
  | 'Recovery due'

export type GuidedLearnerEvidence =
  | 'none'
  | 'supported'
  | 'independent'
  | 'mastered'
  | 'retention_due'
  | 'recovery_due'

export interface GuidedConceptProgressSummary<TSubskill extends string = string> extends ConceptRepetitionPlan {
  conceptId: string
  badge: ConceptStateBadge
  learnerEvidence: GuidedLearnerEvidence
  learnerLabel: string
  learnerReason: string
  lightPassCount: number
  hardPassCount: number
  independentPassCount: number
  supportedPassCount: number
  recoveryLightRemaining: number
  recoverySupportMode: RecoverySupportMode
  retentionDue: boolean
  mastered: boolean
  preferredSubskills: TSubskill[]
}

export const LIGHT_REP_TARGET = 4
export const HARD_REP_TARGET = 2
export const HARD_ATTEMPT_LIMIT = 3
export const HARD_FAILURE_RECOVERY_LIGHTS = 2

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
)

const isNonNegativeInteger = (value: unknown): value is number => (
  typeof value === 'number' && Number.isInteger(value) && value >= 0
)

const readNonNegativeInteger = (value: unknown, fallback = 0): number => (
  isNonNegativeInteger(value) ? value : fallback
)

const isRecoverySupportMode = (value: unknown): value is RecoverySupportMode => (
  value === 'none' || value === 'same-concept-recovery' || value === 'support-concept-recovery'
)

const resolvePolicy = <TSubskill extends string>(
  policy?: SchedulerPolicy<TSubskill>
): SchedulerPolicy<TSubskill> => (
  policy ?? createSchedulerPolicy<TSubskill>()
)

const clampRepIndex = (value: number): 1 | 2 | 3 | 4 | 5 | 6 => (
  Math.max(1, Math.min(6, value)) as 1 | 2 | 3 | 4 | 5 | 6
)

const nextEligibleTurnForGap = (currentTurn: number, gap: number): number => currentTurn + gap + 1

const getIndependentGap = <TSubskill extends string>(
  policy: SchedulerPolicy<TSubskill>,
  independentPassCount: number
): number => {
  const index = Math.min(
    Math.max(independentPassCount - 1, 0),
    policy.independentGaps.length - 1
  )

  return policy.independentGaps[index]!
}

const applySubskillUpdates = <TSubskill extends string>(
  currentStats: SubskillProgressMap<TSubskill>,
  updates: readonly SubskillUpdate<TSubskill>[]
): SubskillProgressMap<TSubskill> => {
  const next: Record<string, SubskillProgressState> = {
    ...currentStats,
  }

  for (const update of updates) {
    const previous = next[update.subskill] ?? {
      attempts: 0,
      cleanPasses: 0,
      supportedPasses: 0,
      misses: 0,
      lastMissedTurn: null,
    }

    next[update.subskill] = {
      attempts: previous.attempts + Math.max(0, update.attempts),
      cleanPasses: previous.cleanPasses + Math.max(0, update.cleanPasses),
      supportedPasses: previous.supportedPasses + Math.max(0, update.supportedPasses),
      misses: previous.misses + Math.max(0, update.misses),
      lastMissedTurn: isNonNegativeInteger(update.lastMissedTurn)
        ? update.lastMissedTurn
        : previous.lastMissedTurn,
    }
  }

  return next as SubskillProgressMap<TSubskill>
}

const withGuidedFields = <TSubskill extends string>(
  concept: ConceptScheduleState<TSubskill>,
  explicit?: Partial<GuidedConceptProgressState<TSubskill>>,
  previous?: GuidedConceptProgressState<TSubskill>
): GuidedConceptProgressState<TSubskill> => {
  const legacyExposureCount = Math.max(
    concept.supportedPassCount,
    concept.supplementalExposureCount,
    concept.attempts
  )

  return {
    ...concept,
    lightPassCount: typeof explicit?.lightPassCount === 'number'
      ? Math.max(0, Math.min(LIGHT_REP_TARGET, explicit.lightPassCount))
      : previous?.lightPassCount
        ?? (concept.independentPassCount > 0
          ? LIGHT_REP_TARGET
          : legacyExposureCount > 0
            ? Math.min(LIGHT_REP_TARGET, 2)
            : 0),
    hardPassCount: typeof explicit?.hardPassCount === 'number'
      ? Math.max(0, Math.min(HARD_REP_TARGET, explicit.hardPassCount))
      : previous?.hardPassCount ?? Math.max(0, Math.min(HARD_REP_TARGET, concept.independentPassCount)),
    recoveryLightRemaining: typeof explicit?.recoveryLightRemaining === 'number'
      ? Math.max(0, Math.min(HARD_FAILURE_RECOVERY_LIGHTS, explicit.recoveryLightRemaining))
      : previous?.recoveryLightRemaining ?? 0,
    recoverySupportMode: isRecoverySupportMode(explicit?.recoverySupportMode)
      ? explicit.recoverySupportMode
      : previous?.recoverySupportMode ?? 'none',
  }
}

const isGuidedRecoveryDue = <TSubskill extends string>(
  concept: GuidedConceptProgressState<TSubskill> | undefined
): boolean => Boolean(concept && (concept.recoveryLightRemaining > 0 || concept.recoveryDue))

const availableSubskills = <TSubskill extends string>(
  concept: Pick<GuidedConceptProgressState<TSubskill>, 'subskillStats'> | undefined
): TSubskill[] => (
  concept
    ? Object.keys(concept.subskillStats) as TSubskill[]
    : ['recognition', 'structure'] as TSubskill[]
)

const pickAvailableSubskills = <TSubskill extends string>(
  concept: Pick<GuidedConceptProgressState<TSubskill>, 'subskillStats'> | undefined,
  preferred: readonly string[],
  fallbackLimit = 2
): TSubskill[] => {
  const currentSubskills = availableSubskills(concept)
  const matched = preferred.filter((subskill) => currentSubskills.includes(subskill as TSubskill)) as TSubskill[]
  if (matched.length > 0) {
    return matched
  }

  return currentSubskills.slice(0, fallbackLimit)
}

const subskillNeedScore = (state: SubskillProgressState): number => {
  if (state.attempts === 0) return 1

  const supportPenalty = state.supportedPasses > state.cleanPasses ? 0.5 : 0
  return state.misses * 2 + supportPenalty + (state.cleanPasses === 0 ? 0.25 : 0)
}

export function buildInitialGuidedConceptProgress<TSubskill extends string = string>(
  conceptIds: readonly string[],
  policy?: SchedulerPolicy<TSubskill>
): GuidedConceptProgressMap<TSubskill> {
  const baseMap = buildInitialConceptSchedule(conceptIds, policy)

  return Object.fromEntries(
    Object.entries(baseMap).map(([conceptId, concept]) => [
      conceptId,
      withGuidedFields(concept),
    ])
  ) as GuidedConceptProgressMap<TSubskill>
}

export function mergeGuidedConceptProgress<TSubskill extends string = string>(
  conceptIds: readonly string[],
  stored: unknown,
  policy?: SchedulerPolicy<TSubskill>
): GuidedConceptProgressMap<TSubskill> {
  const mergedBase = mergeConceptSchedule(conceptIds, stored, policy)
  const storedMap = isRecord(stored) ? stored : {}

  return Object.fromEntries(
    Object.entries(mergedBase).map(([conceptId, concept]) => {
      const storedConcept = isRecord(storedMap[conceptId]) ? storedMap[conceptId] : undefined

      return [
        conceptId,
        withGuidedFields(
          concept,
          storedConcept as Partial<GuidedConceptProgressState<TSubskill>> | undefined
        ),
      ]
    })
  ) as GuidedConceptProgressMap<TSubskill>
}

export function getConceptRepetitionPlan<TSubskill extends string = string>(
  concept: GuidedConceptProgressState<TSubskill> | undefined
): ConceptRepetitionPlan {
  if (!concept) {
    return {
      repPhase: 'light',
      repIndex: 1,
      supportMode: 'none',
      hardAttemptLimit: null,
    }
  }

  if (concept.recoveryLightRemaining > 0) {
    return {
      repPhase: 'recovery-light',
      repIndex: concept.recoveryLightRemaining === HARD_FAILURE_RECOVERY_LIGHTS ? 3 : 4,
      supportMode: concept.recoverySupportMode === 'none' ? 'same-concept-recovery' : concept.recoverySupportMode,
      hardAttemptLimit: null,
    }
  }

  if (concept.lightPassCount < LIGHT_REP_TARGET) {
    return {
      repPhase: 'light',
      repIndex: clampRepIndex(concept.lightPassCount + 1),
      supportMode: 'none',
      hardAttemptLimit: null,
    }
  }

  return {
    repPhase: 'hard',
    repIndex: clampRepIndex(LIGHT_REP_TARGET + Math.min(concept.hardPassCount, HARD_REP_TARGET - 1) + 1),
    supportMode: 'none',
    hardAttemptLimit: HARD_ATTEMPT_LIMIT,
  }
}

export function applyGuidedConceptOutcome<TSubskill extends string = string>(
  progressMap: GuidedConceptProgressMap<TSubskill>,
  conceptId: string,
  outcome: PracticeOutcome,
  currentTurn: number,
  options: {
    policy?: SchedulerPolicy<TSubskill>
    subskillUpdates?: readonly SubskillUpdate<TSubskill>[]
    phase?: RepetitionPhase
    recoverySupportMode?: RecoverySupportMode
  } = {}
): GuidedConceptProgressMap<TSubskill> {
  const current = progressMap[conceptId]
  if (!current) return progressMap

  const resolvedPolicy = resolvePolicy(options.policy)
  const repetitionPlan = getConceptRepetitionPlan(current)
  const appliedPhase = options.phase ?? repetitionPlan.repPhase
  const subskillStats = applySubskillUpdates(
    current.subskillStats,
    options.subskillUpdates ?? []
  )

  let independentPassCount = current.independentPassCount
  let supportedPassCount = current.supportedPassCount
  let lightPassCount = current.lightPassCount
  let hardPassCount = current.hardPassCount
  let recoveryLightRemaining = current.recoveryLightRemaining
  let recoverySupportMode = current.recoverySupportMode
  let nextEligibleTurn = current.nextEligibleTurn
  let assistedCount = current.assistedCount
  let skippedCount = current.skippedCount
  let recentStruggleCount = current.recentStruggleCount
  let recoveryDue = current.recoveryDue
  let retentionCheckEligibleTurn = current.retentionCheckEligibleTurn
  let retentionCheckPassed = current.retentionCheckPassed

  if (outcome === 'independent_correct' && appliedPhase === 'hard') {
    const alreadyMastered = current.independentPassCount >= resolvedPolicy.masteryTarget
    independentPassCount += 1
    hardPassCount = Math.min(current.hardPassCount + 1, HARD_REP_TARGET)
    recentStruggleCount = 0
    recoveryDue = false
    recoveryLightRemaining = 0
    recoverySupportMode = 'none'
    nextEligibleTurn = nextEligibleTurnForGap(
      currentTurn,
      getIndependentGap(resolvedPolicy, independentPassCount)
    )

    if (alreadyMastered) {
      if (retentionCheckEligibleTurn === null || currentTurn >= retentionCheckEligibleTurn) {
        retentionCheckPassed = true
      }
    } else if (independentPassCount >= resolvedPolicy.masteryTarget) {
      retentionCheckPassed = false
      retentionCheckEligibleTurn = nextEligibleTurn
    }
  }

  if (appliedPhase !== 'hard' && (outcome === 'independent_correct' || outcome === 'supported_correct')) {
    lightPassCount = Math.min(
      LIGHT_REP_TARGET,
      Math.max(current.lightPassCount, Math.min(repetitionPlan.repIndex, LIGHT_REP_TARGET))
    )
    recoveryDue = appliedPhase === 'recovery-light' ? current.recoveryLightRemaining > 1 : false

    if (appliedPhase === 'recovery-light') {
      recoveryLightRemaining = Math.max(0, current.recoveryLightRemaining - 1)
      recoverySupportMode = recoveryLightRemaining === 0 ? 'none' : current.recoverySupportMode
      recoveryDue = recoveryLightRemaining > 0
    }

    if (outcome === 'supported_correct') {
      supportedPassCount += 1
      recentStruggleCount += 1
    } else {
      recentStruggleCount = 0
    }

    nextEligibleTurn = nextEligibleTurnForGap(currentTurn, resolvedPolicy.supportedGap)
  }

  if (outcome === 'supported_correct' && appliedPhase === 'hard') {
    supportedPassCount += 1
    recentStruggleCount += 1
    recoveryDue = true
    recoveryLightRemaining = HARD_FAILURE_RECOVERY_LIGHTS
    recoverySupportMode = options.recoverySupportMode ?? 'same-concept-recovery'
    nextEligibleTurn = Math.min(
      current.nextEligibleTurn,
      nextEligibleTurnForGap(currentTurn, resolvedPolicy.failureGap)
    )
  }

  if (outcome === 'assisted') {
    assistedCount += 1
    recentStruggleCount += 1
    recoveryDue = true

    if (appliedPhase === 'hard') {
      recoveryLightRemaining = HARD_FAILURE_RECOVERY_LIGHTS
      recoverySupportMode = options.recoverySupportMode ?? 'same-concept-recovery'
    }

    nextEligibleTurn = Math.min(
      current.nextEligibleTurn,
      nextEligibleTurnForGap(currentTurn, resolvedPolicy.failureGap)
    )
  }

  if (outcome === 'skipped') {
    skippedCount += 1
    recentStruggleCount += 1
    recoveryDue = true

    if (appliedPhase === 'hard') {
      recoveryLightRemaining = HARD_FAILURE_RECOVERY_LIGHTS
      recoverySupportMode = options.recoverySupportMode ?? 'same-concept-recovery'
    }

    nextEligibleTurn = Math.min(
      current.nextEligibleTurn,
      nextEligibleTurnForGap(currentTurn, resolvedPolicy.failureGap)
    )
  }

  const mastered = independentPassCount >= resolvedPolicy.masteryTarget

  return {
    ...progressMap,
    [conceptId]: {
      ...current,
      independentPassCount,
      supportedPassCount,
      lightPassCount,
      hardPassCount,
      recoveryLightRemaining,
      recoverySupportMode,
      nextEligibleTurn,
      lastSeenTurn: currentTurn,
      attempts: current.attempts + 1,
      assistedCount,
      skippedCount,
      recentStruggleCount,
      recoveryDue,
      retentionCheckEligibleTurn: mastered ? retentionCheckEligibleTurn : null,
      retentionCheckPassed: mastered ? retentionCheckPassed : false,
      mastered,
      lastOutcome: outcome,
      subskillStats,
    },
  }
}

export function applySupplementalGuidedConceptExposure<TSubskill extends string = string>(
  progressMap: GuidedConceptProgressMap<TSubskill>,
  conceptId: string,
  currentTurn: number,
  options: {
    subskillUpdates?: readonly SubskillUpdate<TSubskill>[]
    wasClean?: boolean
  } = {}
): GuidedConceptProgressMap<TSubskill> {
  const current = progressMap[conceptId]
  if (!current) return progressMap

  const subskillStats = applySubskillUpdates(
    current.subskillStats,
    options.subskillUpdates ?? []
  )

  return {
    ...progressMap,
    [conceptId]: {
      ...current,
      nextEligibleTurn: Math.min(
        current.nextEligibleTurn,
        currentTurn + (options.wasClean ? 2 : 1)
      ),
      supplementalExposureCount: current.supplementalExposureCount + 1,
      subskillStats,
    },
  }
}

export function pickNextGuidedConceptId<TSubskill extends string = string>(
  progressMap: GuidedConceptProgressMap<TSubskill>,
  nextTurn: number,
  options: {
    policy?: SchedulerPolicy<TSubskill>
    isEligible?: (conceptId: string, progressMap: GuidedConceptProgressMap<TSubskill>) => boolean
  } = {}
): string {
  const resolvedPolicy = resolvePolicy(options.policy)
  const conceptOrder = new Map(
    Object.keys(progressMap).map((conceptId, index) => [conceptId, index])
  )
  const concepts = Object.values(progressMap).filter((concept) => (
    options.isEligible ? options.isEligible(concept.conceptId, progressMap) : true
  ))

  if (concepts.length === 0) {
    return ''
  }

  const dueConcepts = concepts.filter((concept) => concept.nextEligibleTurn <= nextTurn)
  const pool = dueConcepts.length > 0 ? dueConcepts : concepts

  return [...pool].sort((left, right) => {
    const leftRecoveryDue = isGuidedRecoveryDue(left)
    const rightRecoveryDue = isGuidedRecoveryDue(right)
    if (leftRecoveryDue !== rightRecoveryDue) {
      return Number(rightRecoveryDue) - Number(leftRecoveryDue)
    }

    const leftRetentionDue = isRetentionDue(left, nextTurn, resolvedPolicy)
    const rightRetentionDue = isRetentionDue(right, nextTurn, resolvedPolicy)
    if (leftRetentionDue !== rightRetentionDue) {
      return Number(rightRetentionDue) - Number(leftRetentionDue)
    }

    if (left.mastered !== right.mastered) {
      return Number(left.mastered) - Number(right.mastered)
    }

    if (left.nextEligibleTurn !== right.nextEligibleTurn) {
      return left.nextEligibleTurn - right.nextEligibleTurn
    }

    const leftRepIndex = getConceptRepetitionPlan(left).repIndex
    const rightRepIndex = getConceptRepetitionPlan(right).repIndex
    if (leftRepIndex !== rightRepIndex) {
      return leftRepIndex - rightRepIndex
    }

    if (left.independentPassCount !== right.independentPassCount) {
      return left.independentPassCount - right.independentPassCount
    }

    const leftSeen = left.lastSeenTurn ?? -1
    const rightSeen = right.lastSeenTurn ?? -1
    if (leftSeen !== rightSeen) {
      return leftSeen - rightSeen
    }

    if (left.attempts !== right.attempts) {
      return left.attempts - right.attempts
    }

    return (conceptOrder.get(left.conceptId) ?? Number.MAX_SAFE_INTEGER)
      - (conceptOrder.get(right.conceptId) ?? Number.MAX_SAFE_INTEGER)
  })[0]!.conceptId
}

export function getWeakestSubskills<TSubskill extends string = string>(
  concept: GuidedConceptProgressState<TSubskill> | undefined,
  limit = 2
): TSubskill[] {
  if (!concept) return []

  return (Object.keys(concept.subskillStats) as TSubskill[])
    .sort((left, right) => {
      const scoreDelta = subskillNeedScore(concept.subskillStats[right]) - subskillNeedScore(concept.subskillStats[left])
      if (scoreDelta !== 0) return scoreDelta

      const leftClean = concept.subskillStats[left].cleanPasses
      const rightClean = concept.subskillStats[right].cleanPasses
      if (leftClean !== rightClean) return leftClean - rightClean

      return left.localeCompare(right)
    })
    .slice(0, limit)
}

export function getPreferredSubskillsForConceptSelection<TSubskill extends string = string>(
  concept: GuidedConceptProgressState<TSubskill> | undefined,
  currentTurn: number
): TSubskill[] {
  if (!concept || concept.attempts === 0) {
    return pickAvailableSubskills(concept, ['recognition', 'structure'])
  }

  const plan = getConceptRepetitionPlan(concept)
  if (plan.repPhase === 'recovery-light') {
    const weakest = getWeakestSubskills(concept)
    return weakest.length > 0
      ? weakest
      : pickAvailableSubskills(concept, ['recognition', 'structure'])
  }

  if (isRetentionDue(concept, currentTurn)) return []
  if (plan.repPhase === 'hard') return []
  if (plan.repIndex === 1) return pickAvailableSubskills(concept, ['recognition', 'structure'])
  if (plan.repIndex === 2) return pickAvailableSubskills(concept, ['structure', 'recognition'])
  if (plan.repIndex === 3) return pickAvailableSubskills(concept, ['computation', 'structure'])
  if (plan.repIndex === 4) {
    const weakest = getWeakestSubskills(concept)
    return weakest.length > 0
      ? weakest
      : pickAvailableSubskills(concept, ['computation', 'interpretation'])
  }

  if (
    concept.independentPassCount === 0
    && (concept.supportedPassCount > 0 || concept.supplementalExposureCount > 0)
  ) {
    return getWeakestSubskills(concept)
  }

  return []
}

export function getConceptSelectionReason<TSubskill extends string = string>(
  concept: GuidedConceptProgressState<TSubskill> | undefined,
  currentTurn: number,
  preferredSubskills: readonly TSubskill[] = []
): ConceptSelectionReason {
  if (!concept || concept.attempts === 0) return 'new_concept'
  if (isRetentionDue(concept, currentTurn)) return 'retention_due'
  if (isGuidedRecoveryDue(concept)) return 'recovery_due'
  if (preferredSubskills.length > 0) return `weakest_subskill:${preferredSubskills.join('+')}`
  return 'guided_mastery'
}

export function getConceptStateBadge<TSubskill extends string = string>(
  concept: GuidedConceptProgressState<TSubskill> | undefined,
  currentTurn: number
): ConceptStateBadge {
  if (!concept) return 'Emerging'
  if (isGuidedRecoveryDue(concept)) return 'Recovery due'
  if (isRetentionDue(concept, currentTurn)) return 'Retention due'
  if (concept.mastered) return 'Mastered'
  if (concept.independentPassCount > 0) return 'Independent'
  if (concept.supportedPassCount > 0 || concept.supplementalExposureCount > 0) return 'Supported'
  return 'Emerging'
}

export function summarizeGuidedConceptProgress<TSubskill extends string = string>(
  concept: GuidedConceptProgressState<TSubskill> | undefined,
  currentTurn: number,
  options: {
    policy?: SchedulerPolicy<TSubskill>
    preferredSubskills?: readonly TSubskill[]
  } = {}
): GuidedConceptProgressSummary<TSubskill> | null {
  if (!concept) return null

  const plan = getConceptRepetitionPlan(concept)
  const retentionDue = isRetentionDue(concept, currentTurn, options.policy)
  const recoveryDue = isGuidedRecoveryDue(concept)
  const badge = getConceptStateBadge(concept, currentTurn)
  const preferredSubskills = [
    ...(options.preferredSubskills ?? getPreferredSubskillsForConceptSelection(concept, currentTurn)),
  ]

  let learnerEvidence: GuidedLearnerEvidence = 'none'
  if (recoveryDue) {
    learnerEvidence = 'recovery_due'
  } else if (retentionDue) {
    learnerEvidence = 'retention_due'
  } else if (concept.mastered) {
    learnerEvidence = 'mastered'
  } else if (concept.independentPassCount > 0) {
    learnerEvidence = 'independent'
  } else if (concept.supportedPassCount > 0 || concept.supplementalExposureCount > 0) {
    learnerEvidence = 'supported'
  }

  const learnerLabel = (() => {
    if (recoveryDue) return 'Recovery practice'
    if (retentionDue) return 'Retention check'
    if (concept.mastered) return 'Mastered'
    if (plan.repPhase === 'hard') return 'Independent challenge'
    if (concept.supportedPassCount > 0 || concept.supplementalExposureCount > 0) return 'Supported practice'
    return 'Guided practice'
  })()

  const learnerReason = (() => {
    if (recoveryDue) {
      return `Complete ${concept.recoveryLightRemaining} lighter practice ${concept.recoveryLightRemaining === 1 ? 'step' : 'steps'} before the next hard challenge.`
    }
    if (retentionDue) return 'Revisit this concept to confirm it still holds after spacing.'
    if (concept.mastered) return 'Independent evidence has met the mastery target.'
    if (plan.repPhase === 'hard') return `Attempt independent challenge ${Math.max(1, plan.repIndex - LIGHT_REP_TARGET)} of ${HARD_REP_TARGET}.`
    return `Complete guided step ${Math.min(plan.repIndex, LIGHT_REP_TARGET)} of ${LIGHT_REP_TARGET}.`
  })()

  return {
    conceptId: concept.conceptId,
    ...plan,
    badge,
    learnerEvidence,
    learnerLabel,
    learnerReason,
    lightPassCount: concept.lightPassCount,
    hardPassCount: concept.hardPassCount,
    independentPassCount: concept.independentPassCount,
    supportedPassCount: concept.supportedPassCount,
    recoveryLightRemaining: concept.recoveryLightRemaining,
    recoverySupportMode: concept.recoverySupportMode,
    retentionDue,
    mastered: concept.mastered,
    preferredSubskills,
  }
}

export function normalizeSelectionReason(reason?: string | null): ConceptSelectionReason {
  if (!reason || reason === 'scheduled_review' || reason === 'spaced_review') {
    return 'guided_mastery'
  }

  if (reason === 'new_concept' || reason === 'guided_mastery' || reason === 'recovery_due' || reason === 'retention_due') {
    return reason
  }

  if (reason.startsWith('weakest_subskill:')) {
    return reason as ConceptSelectionReason
  }

  if (reason.startsWith('recovery_due:')) {
    return 'recovery_due'
  }

  return 'guided_mastery'
}
