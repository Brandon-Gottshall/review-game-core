/**
 * Generic concept scheduler for review games.
 *
 * The scheduler tracks concept-level progress, spaces independent passes,
 * keeps struggling concepts near the front of the queue, and preserves enough
 * state for consumers to serialize and rehydrate safely.
 */
export const DEFAULT_MASTERY_TARGET = 3;
export const DEFAULT_INDEPENDENT_GAPS = [2, 5, 8];
export const DEFAULT_SUPPORTED_GAP = 1;
export const DEFAULT_FAILURE_GAP = 1;
const isRecord = (value) => (typeof value === 'object' && value !== null);
const isNonNegativeInteger = (value) => (typeof value === 'number' && Number.isInteger(value) && value >= 0);
const readNonNegativeInteger = (value, fallback = 0) => (isNonNegativeInteger(value) ? value : fallback);
const readNullableInteger = (value) => (isNonNegativeInteger(value) ? value : null);
const isPracticeOutcome = (value) => (value === 'independent_correct'
    || value === 'supported_correct'
    || value === 'assisted'
    || value === 'skipped');
const createEmptySubskillProgressState = () => ({
    attempts: 0,
    cleanPasses: 0,
    supportedPasses: 0,
    misses: 0,
    lastMissedTurn: null,
});
const nextEligibleTurnForGap = (currentTurn, gap) => (currentTurn + gap + 1);
const getIndependentGap = (policy, independentPassCount) => {
    const index = Math.min(Math.max(independentPassCount - 1, 0), policy.independentGaps.length - 1);
    return policy.independentGaps[index];
};
const resolvePolicy = (policy) => (policy ?? createSchedulerPolicy());
const buildEmptySubskillStats = (policy) => {
    const stats = {};
    for (const subskill of policy.subskillIds) {
        stats[subskill] = createEmptySubskillProgressState();
    }
    return stats;
};
const mergeStoredSubskillStats = (stored, policy) => {
    const stats = {
        ...buildEmptySubskillStats(policy),
    };
    if (!isRecord(stored)) {
        return stats;
    }
    for (const [subskill, value] of Object.entries(stored)) {
        if (!isRecord(value))
            continue;
        stats[subskill] = {
            attempts: readNonNegativeInteger(value.attempts),
            cleanPasses: readNonNegativeInteger(value.cleanPasses),
            supportedPasses: readNonNegativeInteger(value.supportedPasses),
            misses: readNonNegativeInteger(value.misses),
            lastMissedTurn: readNullableInteger(value.lastMissedTurn),
        };
    }
    return stats;
};
const applySubskillUpdates = (currentStats, updates) => {
    const next = {
        ...currentStats,
    };
    for (const update of updates) {
        const previous = next[update.subskill] ?? createEmptySubskillProgressState();
        next[update.subskill] = {
            attempts: previous.attempts + readNonNegativeInteger(update.attempts),
            cleanPasses: previous.cleanPasses + readNonNegativeInteger(update.cleanPasses),
            supportedPasses: previous.supportedPasses + readNonNegativeInteger(update.supportedPasses),
            misses: previous.misses + readNonNegativeInteger(update.misses),
            lastMissedTurn: isNonNegativeInteger(update.lastMissedTurn)
                ? update.lastMissedTurn
                : previous.lastMissedTurn,
        };
    }
    return next;
};
export function createSchedulerPolicy(config = {}) {
    const masteryTarget = config.masteryTarget ?? DEFAULT_MASTERY_TARGET;
    const independentGaps = [...(config.independentGaps ?? DEFAULT_INDEPENDENT_GAPS)];
    const supportedGap = config.supportedGap ?? DEFAULT_SUPPORTED_GAP;
    const failureGap = config.failureGap ?? DEFAULT_FAILURE_GAP;
    const subskillIds = [...(config.subskillIds ?? [])];
    if (!Number.isInteger(masteryTarget) || masteryTarget < 1) {
        throw new Error('Scheduler policy masteryTarget must be an integer >= 1');
    }
    if (independentGaps.length === 0) {
        throw new Error('Scheduler policy independentGaps must contain at least one gap');
    }
    if (independentGaps.some((gap) => !Number.isInteger(gap) || gap < 0)) {
        throw new Error('Scheduler policy independentGaps must contain only integers >= 0');
    }
    if (!Number.isInteger(supportedGap) || supportedGap < 0) {
        throw new Error('Scheduler policy supportedGap must be an integer >= 0');
    }
    if (!Number.isInteger(failureGap) || failureGap < 0) {
        throw new Error('Scheduler policy failureGap must be an integer >= 0');
    }
    return {
        masteryTarget,
        independentGaps,
        supportedGap,
        failureGap,
        subskillIds,
    };
}
export function buildInitialConceptSchedule(conceptIds, policy) {
    const resolvedPolicy = resolvePolicy(policy);
    const schedule = {};
    for (const conceptId of conceptIds) {
        schedule[conceptId] = {
            conceptId,
            independentPassCount: 0,
            supportedPassCount: 0,
            nextEligibleTurn: 1,
            lastSeenTurn: null,
            attempts: 0,
            supplementalExposureCount: 0,
            assistedCount: 0,
            skippedCount: 0,
            recentStruggleCount: 0,
            recoveryDue: false,
            retentionCheckEligibleTurn: null,
            retentionCheckPassed: false,
            mastered: false,
            lastOutcome: null,
            subskillStats: buildEmptySubskillStats(resolvedPolicy),
        };
    }
    return schedule;
}
export function mergeConceptSchedule(conceptIds, stored, policy) {
    const resolvedPolicy = resolvePolicy(policy);
    const merged = buildInitialConceptSchedule(conceptIds, resolvedPolicy);
    if (!isRecord(stored)) {
        return merged;
    }
    for (const conceptId of conceptIds) {
        const value = stored[conceptId];
        if (!isRecord(value))
            continue;
        const independentPassCount = readNonNegativeInteger(value.independentPassCount);
        const supportedPassCount = readNonNegativeInteger(value.supportedPassCount);
        const nextEligibleTurn = readNonNegativeInteger(value.nextEligibleTurn, 1);
        const mastered = independentPassCount >= resolvedPolicy.masteryTarget;
        const storedRetentionCheckEligibleTurn = readNullableInteger(value.retentionCheckEligibleTurn);
        merged[conceptId] = {
            conceptId,
            independentPassCount,
            supportedPassCount,
            nextEligibleTurn,
            lastSeenTurn: readNullableInteger(value.lastSeenTurn),
            attempts: readNonNegativeInteger(value.attempts),
            supplementalExposureCount: readNonNegativeInteger(value.supplementalExposureCount),
            assistedCount: readNonNegativeInteger(value.assistedCount),
            skippedCount: readNonNegativeInteger(value.skippedCount),
            recentStruggleCount: readNonNegativeInteger(value.recentStruggleCount),
            recoveryDue: typeof value.recoveryDue === 'boolean' ? value.recoveryDue : false,
            retentionCheckEligibleTurn: mastered
                ? (storedRetentionCheckEligibleTurn ?? nextEligibleTurn)
                : null,
            retentionCheckPassed: mastered
                ? (typeof value.retentionCheckPassed === 'boolean' ? value.retentionCheckPassed : false)
                : false,
            mastered,
            lastOutcome: isPracticeOutcome(value.lastOutcome) ? value.lastOutcome : null,
            subskillStats: mergeStoredSubskillStats(value.subskillStats, resolvedPolicy),
        };
    }
    return merged;
}
export function isConceptMastered(concept, policy) {
    const resolvedPolicy = resolvePolicy(policy);
    return concept !== undefined && concept.independentPassCount >= resolvedPolicy.masteryTarget;
}
export function isRetentionDue(concept, currentTurn, policy) {
    return Boolean(concept
        && isConceptMastered(concept, policy)
        && !concept.retentionCheckPassed
        && concept.retentionCheckEligibleTurn !== null
        && concept.retentionCheckEligibleTurn <= currentTurn);
}
export function applyConceptOutcome(progressMap, conceptId, outcome, currentTurn, options = {}) {
    const current = progressMap[conceptId];
    if (!current)
        return progressMap;
    const resolvedPolicy = resolvePolicy(options.policy);
    const wasMastered = isConceptMastered(current, resolvedPolicy);
    const subskillStats = applySubskillUpdates(current.subskillStats, options.subskillUpdates ?? []);
    let independentPassCount = current.independentPassCount;
    let supportedPassCount = current.supportedPassCount;
    let nextEligibleTurn = current.nextEligibleTurn;
    let assistedCount = current.assistedCount;
    let skippedCount = current.skippedCount;
    let recentStruggleCount = current.recentStruggleCount;
    let recoveryDue = current.recoveryDue;
    let retentionCheckEligibleTurn = wasMastered
        ? (current.retentionCheckEligibleTurn ?? current.nextEligibleTurn)
        : current.retentionCheckEligibleTurn;
    let retentionCheckPassed = wasMastered ? current.retentionCheckPassed : false;
    if (outcome === 'independent_correct') {
        independentPassCount += 1;
        recentStruggleCount = 0;
        recoveryDue = false;
        nextEligibleTurn = nextEligibleTurnForGap(currentTurn, getIndependentGap(resolvedPolicy, independentPassCount));
        if (!wasMastered && independentPassCount >= resolvedPolicy.masteryTarget) {
            retentionCheckPassed = false;
            retentionCheckEligibleTurn = nextEligibleTurn;
        }
        else if (wasMastered && retentionCheckEligibleTurn !== null && currentTurn >= retentionCheckEligibleTurn) {
            retentionCheckPassed = true;
        }
    }
    if (outcome === 'supported_correct') {
        supportedPassCount += 1;
        recentStruggleCount += 1;
        recoveryDue = true;
        nextEligibleTurn = Math.min(current.nextEligibleTurn, nextEligibleTurnForGap(currentTurn, resolvedPolicy.supportedGap));
    }
    if (outcome === 'assisted') {
        assistedCount += 1;
        recentStruggleCount += 1;
        recoveryDue = true;
        nextEligibleTurn = Math.min(current.nextEligibleTurn, nextEligibleTurnForGap(currentTurn, resolvedPolicy.failureGap));
    }
    if (outcome === 'skipped') {
        skippedCount += 1;
        recentStruggleCount += 1;
        recoveryDue = true;
        nextEligibleTurn = Math.min(current.nextEligibleTurn, nextEligibleTurnForGap(currentTurn, resolvedPolicy.failureGap));
    }
    const mastered = independentPassCount >= resolvedPolicy.masteryTarget;
    return {
        ...progressMap,
        [conceptId]: {
            ...current,
            independentPassCount,
            supportedPassCount,
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
export function applySupplementalConceptExposure(progressMap, conceptId, currentTurn, options = {}) {
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
export function pickNextConceptId(progressMap, nextTurn, options = {}) {
    const resolvedPolicy = resolvePolicy(options.policy);
    const conceptOrder = new Map(Object.keys(progressMap).map((conceptId, index) => [conceptId, index]));
    const concepts = Object.values(progressMap).filter((concept) => (options.isEligible ? options.isEligible(concept.conceptId, progressMap) : true));
    if (concepts.length === 0) {
        return '';
    }
    const dueConcepts = concepts.filter((concept) => concept.nextEligibleTurn <= nextTurn);
    const pool = dueConcepts.length > 0 ? dueConcepts : concepts;
    return [...pool].sort((left, right) => {
        if (left.recoveryDue !== right.recoveryDue) {
            return Number(right.recoveryDue) - Number(left.recoveryDue);
        }
        const leftRetentionDue = isRetentionDue(left, nextTurn, resolvedPolicy);
        const rightRetentionDue = isRetentionDue(right, nextTurn, resolvedPolicy);
        if (leftRetentionDue !== rightRetentionDue) {
            return Number(rightRetentionDue) - Number(leftRetentionDue);
        }
        const leftMastered = isConceptMastered(left, resolvedPolicy);
        const rightMastered = isConceptMastered(right, resolvedPolicy);
        if (leftMastered !== rightMastered) {
            return Number(leftMastered) - Number(rightMastered);
        }
        if (left.nextEligibleTurn !== right.nextEligibleTurn) {
            return left.nextEligibleTurn - right.nextEligibleTurn;
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
//# sourceMappingURL=index.js.map