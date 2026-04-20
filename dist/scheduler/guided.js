import { buildInitialConceptSchedule, createSchedulerPolicy, isRetentionDue, mergeConceptSchedule, } from './base.js';
export const LIGHT_REP_TARGET = 4;
export const HARD_REP_TARGET = 2;
export const HARD_ATTEMPT_LIMIT = 3;
export const HARD_FAILURE_RECOVERY_LIGHTS = 2;
const isRecord = (value) => (typeof value === 'object' && value !== null);
const isNonNegativeInteger = (value) => (typeof value === 'number' && Number.isInteger(value) && value >= 0);
const readNonNegativeInteger = (value, fallback = 0) => (isNonNegativeInteger(value) ? value : fallback);
const isRecoverySupportMode = (value) => (value === 'none' || value === 'same-concept-recovery' || value === 'support-concept-recovery');
const resolvePolicy = (policy) => (policy ?? createSchedulerPolicy());
const clampRepIndex = (value) => Math.max(1, Math.min(6, value));
const nextEligibleTurnForGap = (currentTurn, gap) => currentTurn + gap + 1;
const getIndependentGap = (policy, independentPassCount) => {
    const index = Math.min(Math.max(independentPassCount - 1, 0), policy.independentGaps.length - 1);
    return policy.independentGaps[index];
};
const applySubskillUpdates = (currentStats, updates) => {
    const next = {
        ...currentStats,
    };
    for (const update of updates) {
        const previous = next[update.subskill] ?? {
            attempts: 0,
            cleanPasses: 0,
            supportedPasses: 0,
            misses: 0,
            lastMissedTurn: null,
        };
        next[update.subskill] = {
            attempts: previous.attempts + Math.max(0, update.attempts),
            cleanPasses: previous.cleanPasses + Math.max(0, update.cleanPasses),
            supportedPasses: previous.supportedPasses + Math.max(0, update.supportedPasses),
            misses: previous.misses + Math.max(0, update.misses),
            lastMissedTurn: isNonNegativeInteger(update.lastMissedTurn)
                ? update.lastMissedTurn
                : previous.lastMissedTurn,
        };
    }
    return next;
};
const withGuidedFields = (concept, explicit, previous) => {
    const legacyExposureCount = Math.max(concept.supportedPassCount, concept.supplementalExposureCount, concept.attempts);
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
    };
};
const isGuidedRecoveryDue = (concept) => Boolean(concept && (concept.recoveryLightRemaining > 0 || concept.recoveryDue));
const availableSubskills = (concept) => (concept
    ? Object.keys(concept.subskillStats)
    : ['recognition', 'structure']);
const pickAvailableSubskills = (concept, preferred, fallbackLimit = 2) => {
    const currentSubskills = availableSubskills(concept);
    const matched = preferred.filter((subskill) => currentSubskills.includes(subskill));
    if (matched.length > 0) {
        return matched;
    }
    return currentSubskills.slice(0, fallbackLimit);
};
const subskillNeedScore = (state) => {
    if (state.attempts === 0)
        return 1;
    const supportPenalty = state.supportedPasses > state.cleanPasses ? 0.5 : 0;
    return state.misses * 2 + supportPenalty + (state.cleanPasses === 0 ? 0.25 : 0);
};
export function buildInitialGuidedConceptProgress(conceptIds, policy) {
    const baseMap = buildInitialConceptSchedule(conceptIds, policy);
    return Object.fromEntries(Object.entries(baseMap).map(([conceptId, concept]) => [
        conceptId,
        withGuidedFields(concept),
    ]));
}
export function mergeGuidedConceptProgress(conceptIds, stored, policy) {
    const mergedBase = mergeConceptSchedule(conceptIds, stored, policy);
    const storedMap = isRecord(stored) ? stored : {};
    return Object.fromEntries(Object.entries(mergedBase).map(([conceptId, concept]) => {
        const storedConcept = isRecord(storedMap[conceptId]) ? storedMap[conceptId] : undefined;
        return [
            conceptId,
            withGuidedFields(concept, storedConcept),
        ];
    }));
}
export function getConceptRepetitionPlan(concept) {
    if (!concept) {
        return {
            repPhase: 'light',
            repIndex: 1,
            supportMode: 'none',
            hardAttemptLimit: null,
        };
    }
    if (concept.recoveryLightRemaining > 0) {
        return {
            repPhase: 'recovery-light',
            repIndex: concept.recoveryLightRemaining === HARD_FAILURE_RECOVERY_LIGHTS ? 3 : 4,
            supportMode: concept.recoverySupportMode === 'none' ? 'same-concept-recovery' : concept.recoverySupportMode,
            hardAttemptLimit: null,
        };
    }
    if (concept.lightPassCount < LIGHT_REP_TARGET) {
        return {
            repPhase: 'light',
            repIndex: clampRepIndex(concept.lightPassCount + 1),
            supportMode: 'none',
            hardAttemptLimit: null,
        };
    }
    return {
        repPhase: 'hard',
        repIndex: clampRepIndex(LIGHT_REP_TARGET + Math.min(concept.hardPassCount, HARD_REP_TARGET - 1) + 1),
        supportMode: 'none',
        hardAttemptLimit: HARD_ATTEMPT_LIMIT,
    };
}
export function applyGuidedConceptOutcome(progressMap, conceptId, outcome, currentTurn, options = {}) {
    const current = progressMap[conceptId];
    if (!current)
        return progressMap;
    const resolvedPolicy = resolvePolicy(options.policy);
    const repetitionPlan = getConceptRepetitionPlan(current);
    const appliedPhase = options.phase ?? repetitionPlan.repPhase;
    const subskillStats = applySubskillUpdates(current.subskillStats, options.subskillUpdates ?? []);
    let independentPassCount = current.independentPassCount;
    let supportedPassCount = current.supportedPassCount;
    let lightPassCount = current.lightPassCount;
    let hardPassCount = current.hardPassCount;
    let recoveryLightRemaining = current.recoveryLightRemaining;
    let recoverySupportMode = current.recoverySupportMode;
    let nextEligibleTurn = current.nextEligibleTurn;
    let assistedCount = current.assistedCount;
    let skippedCount = current.skippedCount;
    let recentStruggleCount = current.recentStruggleCount;
    let recoveryDue = current.recoveryDue;
    let retentionCheckEligibleTurn = current.retentionCheckEligibleTurn;
    let retentionCheckPassed = current.retentionCheckPassed;
    if (outcome === 'independent_correct' && appliedPhase === 'hard') {
        const alreadyMastered = current.independentPassCount >= resolvedPolicy.masteryTarget;
        independentPassCount += 1;
        hardPassCount = Math.min(current.hardPassCount + 1, HARD_REP_TARGET);
        recentStruggleCount = 0;
        recoveryDue = false;
        recoveryLightRemaining = 0;
        recoverySupportMode = 'none';
        nextEligibleTurn = nextEligibleTurnForGap(currentTurn, getIndependentGap(resolvedPolicy, independentPassCount));
        if (alreadyMastered) {
            if (retentionCheckEligibleTurn === null || currentTurn >= retentionCheckEligibleTurn) {
                retentionCheckPassed = true;
            }
        }
        else if (independentPassCount >= resolvedPolicy.masteryTarget) {
            retentionCheckPassed = false;
            retentionCheckEligibleTurn = nextEligibleTurn;
        }
    }
    if (appliedPhase !== 'hard' && (outcome === 'independent_correct' || outcome === 'supported_correct')) {
        lightPassCount = Math.min(LIGHT_REP_TARGET, Math.max(current.lightPassCount, Math.min(repetitionPlan.repIndex, LIGHT_REP_TARGET)));
        recoveryDue = appliedPhase === 'recovery-light' ? current.recoveryLightRemaining > 1 : false;
        if (appliedPhase === 'recovery-light') {
            recoveryLightRemaining = Math.max(0, current.recoveryLightRemaining - 1);
            recoverySupportMode = recoveryLightRemaining === 0 ? 'none' : current.recoverySupportMode;
            recoveryDue = recoveryLightRemaining > 0;
        }
        if (outcome === 'supported_correct') {
            supportedPassCount += 1;
            recentStruggleCount += 1;
        }
        else {
            recentStruggleCount = 0;
        }
        nextEligibleTurn = nextEligibleTurnForGap(currentTurn, resolvedPolicy.supportedGap);
    }
    if (outcome === 'supported_correct' && appliedPhase === 'hard') {
        supportedPassCount += 1;
        recentStruggleCount += 1;
        recoveryDue = true;
        recoveryLightRemaining = HARD_FAILURE_RECOVERY_LIGHTS;
        recoverySupportMode = options.recoverySupportMode ?? 'same-concept-recovery';
        nextEligibleTurn = Math.min(current.nextEligibleTurn, nextEligibleTurnForGap(currentTurn, resolvedPolicy.failureGap));
    }
    if (outcome === 'assisted') {
        assistedCount += 1;
        recentStruggleCount += 1;
        recoveryDue = true;
        if (appliedPhase === 'hard') {
            recoveryLightRemaining = HARD_FAILURE_RECOVERY_LIGHTS;
            recoverySupportMode = options.recoverySupportMode ?? 'same-concept-recovery';
        }
        nextEligibleTurn = Math.min(current.nextEligibleTurn, nextEligibleTurnForGap(currentTurn, resolvedPolicy.failureGap));
    }
    if (outcome === 'skipped') {
        skippedCount += 1;
        recentStruggleCount += 1;
        recoveryDue = true;
        if (appliedPhase === 'hard') {
            recoveryLightRemaining = HARD_FAILURE_RECOVERY_LIGHTS;
            recoverySupportMode = options.recoverySupportMode ?? 'same-concept-recovery';
        }
        nextEligibleTurn = Math.min(current.nextEligibleTurn, nextEligibleTurnForGap(currentTurn, resolvedPolicy.failureGap));
    }
    const mastered = independentPassCount >= resolvedPolicy.masteryTarget;
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
    };
}
export function applySupplementalGuidedConceptExposure(progressMap, conceptId, currentTurn, options = {}) {
    const current = progressMap[conceptId];
    if (!current)
        return progressMap;
    const subskillStats = applySubskillUpdates(current.subskillStats, options.subskillUpdates ?? []);
    return {
        ...progressMap,
        [conceptId]: {
            ...current,
            nextEligibleTurn: Math.min(current.nextEligibleTurn, currentTurn + (options.wasClean ? 2 : 1)),
            supplementalExposureCount: current.supplementalExposureCount + 1,
            subskillStats,
        },
    };
}
export function pickNextGuidedConceptId(progressMap, nextTurn, options = {}) {
    const resolvedPolicy = resolvePolicy(options.policy);
    const conceptOrder = new Map(Object.keys(progressMap).map((conceptId, index) => [conceptId, index]));
    const concepts = Object.values(progressMap).filter((concept) => (options.isEligible ? options.isEligible(concept.conceptId, progressMap) : true));
    if (concepts.length === 0) {
        return '';
    }
    const dueConcepts = concepts.filter((concept) => concept.nextEligibleTurn <= nextTurn);
    const pool = dueConcepts.length > 0 ? dueConcepts : concepts;
    return [...pool].sort((left, right) => {
        const leftRecoveryDue = isGuidedRecoveryDue(left);
        const rightRecoveryDue = isGuidedRecoveryDue(right);
        if (leftRecoveryDue !== rightRecoveryDue) {
            return Number(rightRecoveryDue) - Number(leftRecoveryDue);
        }
        const leftRetentionDue = isRetentionDue(left, nextTurn, resolvedPolicy);
        const rightRetentionDue = isRetentionDue(right, nextTurn, resolvedPolicy);
        if (leftRetentionDue !== rightRetentionDue) {
            return Number(rightRetentionDue) - Number(leftRetentionDue);
        }
        if (left.mastered !== right.mastered) {
            return Number(left.mastered) - Number(right.mastered);
        }
        if (left.nextEligibleTurn !== right.nextEligibleTurn) {
            return left.nextEligibleTurn - right.nextEligibleTurn;
        }
        const leftRepIndex = getConceptRepetitionPlan(left).repIndex;
        const rightRepIndex = getConceptRepetitionPlan(right).repIndex;
        if (leftRepIndex !== rightRepIndex) {
            return leftRepIndex - rightRepIndex;
        }
        if (left.independentPassCount !== right.independentPassCount) {
            return left.independentPassCount - right.independentPassCount;
        }
        const leftSeen = left.lastSeenTurn ?? -1;
        const rightSeen = right.lastSeenTurn ?? -1;
        if (leftSeen !== rightSeen) {
            return leftSeen - rightSeen;
        }
        if (left.attempts !== right.attempts) {
            return left.attempts - right.attempts;
        }
        return (conceptOrder.get(left.conceptId) ?? Number.MAX_SAFE_INTEGER)
            - (conceptOrder.get(right.conceptId) ?? Number.MAX_SAFE_INTEGER);
    })[0].conceptId;
}
export function getWeakestSubskills(concept, limit = 2) {
    if (!concept)
        return [];
    return Object.keys(concept.subskillStats)
        .sort((left, right) => {
        const scoreDelta = subskillNeedScore(concept.subskillStats[right]) - subskillNeedScore(concept.subskillStats[left]);
        if (scoreDelta !== 0)
            return scoreDelta;
        const leftClean = concept.subskillStats[left].cleanPasses;
        const rightClean = concept.subskillStats[right].cleanPasses;
        if (leftClean !== rightClean)
            return leftClean - rightClean;
        return left.localeCompare(right);
    })
        .slice(0, limit);
}
export function getPreferredSubskillsForConceptSelection(concept, currentTurn) {
    if (!concept || concept.attempts === 0) {
        return pickAvailableSubskills(concept, ['recognition', 'structure']);
    }
    const plan = getConceptRepetitionPlan(concept);
    if (plan.repPhase === 'recovery-light') {
        const weakest = getWeakestSubskills(concept);
        return weakest.length > 0
            ? weakest
            : pickAvailableSubskills(concept, ['recognition', 'structure']);
    }
    if (isRetentionDue(concept, currentTurn))
        return [];
    if (plan.repPhase === 'hard')
        return [];
    if (plan.repIndex === 1)
        return pickAvailableSubskills(concept, ['recognition', 'structure']);
    if (plan.repIndex === 2)
        return pickAvailableSubskills(concept, ['structure', 'recognition']);
    if (plan.repIndex === 3)
        return pickAvailableSubskills(concept, ['computation', 'structure']);
    if (plan.repIndex === 4) {
        const weakest = getWeakestSubskills(concept);
        return weakest.length > 0
            ? weakest
            : pickAvailableSubskills(concept, ['computation', 'interpretation']);
    }
    if (concept.independentPassCount === 0
        && (concept.supportedPassCount > 0 || concept.supplementalExposureCount > 0)) {
        return getWeakestSubskills(concept);
    }
    return [];
}
export function getConceptSelectionReason(concept, currentTurn, preferredSubskills = []) {
    if (!concept || concept.attempts === 0)
        return 'new_concept';
    if (isRetentionDue(concept, currentTurn))
        return 'retention_due';
    if (isGuidedRecoveryDue(concept))
        return 'recovery_due';
    if (preferredSubskills.length > 0)
        return `weakest_subskill:${preferredSubskills.join('+')}`;
    return 'guided_mastery';
}
export function getConceptStateBadge(concept, currentTurn) {
    if (!concept)
        return 'Emerging';
    if (isGuidedRecoveryDue(concept))
        return 'Recovery due';
    if (isRetentionDue(concept, currentTurn))
        return 'Retention due';
    if (concept.mastered)
        return 'Mastered';
    if (concept.independentPassCount > 0)
        return 'Independent';
    if (concept.supportedPassCount > 0 || concept.supplementalExposureCount > 0)
        return 'Supported';
    return 'Emerging';
}
export function normalizeSelectionReason(reason) {
    if (!reason || reason === 'scheduled_review' || reason === 'spaced_review') {
        return 'guided_mastery';
    }
    if (reason === 'new_concept' || reason === 'guided_mastery' || reason === 'recovery_due' || reason === 'retention_due') {
        return reason;
    }
    if (reason.startsWith('weakest_subskill:')) {
        return reason;
    }
    if (reason.startsWith('recovery_due:')) {
        return 'recovery_due';
    }
    return 'guided_mastery';
}
//# sourceMappingURL=guided.js.map