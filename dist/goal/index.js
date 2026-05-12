import { mulberry32 } from '../generator/index.js';
export const DEFAULT_GOAL_DEADLINE_BEHAVIOR = 'stay_primary_until_complete';
export const DEFAULT_MASTERY_WEIGHT_FLOOR = 0.15;
const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ROLE_PRIORITY = {
    primary: 0,
    catch_up: 1,
    queued: 2,
    complete: 3,
};
const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;
const assertNonNegativeInteger = (value, label) => {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
        throw new Error(`${label} must be a non-negative integer`);
    }
    return value;
};
const parseGoalLocalDate = (value, label) => {
    if (!LOCAL_DATE_PATTERN.test(value)) {
        throw new Error(`${label} must use YYYY-MM-DD format`);
    }
    const [yearToken, monthToken, dayToken] = value.split('-');
    const year = Number(yearToken);
    const month = Number(monthToken);
    const day = Number(dayToken);
    const utc = Date.UTC(year, month - 1, day);
    const parsed = new Date(utc);
    if (Number.isNaN(parsed.getTime())
        || parsed.getUTCFullYear() !== year
        || parsed.getUTCMonth() !== month - 1
        || parsed.getUTCDate() !== day) {
        throw new Error(`${label} must be a real calendar date`);
    }
    return utc;
};
const compareGoalLocalDates = (left, right) => {
    const leftUtc = parseGoalLocalDate(left, 'localDate');
    const rightUtc = parseGoalLocalDate(right, 'deadlineLocalDate');
    const MS_PER_DAY = 86_400_000;
    return Math.round((leftUtc - rightUtc) / MS_PER_DAY);
};
const resolveTimeStatus = (phase, context) => {
    if (!phase.deadlineLocalDate) {
        return {
            timeStatus: 'none',
            daysUntilDeadline: null,
            daysFromDeadline: null,
        };
    }
    parseGoalLocalDate(phase.deadlineLocalDate, 'deadlineLocalDate');
    if (!context.localDate) {
        return {
            timeStatus: 'none',
            daysUntilDeadline: null,
            daysFromDeadline: null,
        };
    }
    const dayDelta = compareGoalLocalDates(context.localDate, phase.deadlineLocalDate);
    if (dayDelta < 0) {
        return {
            timeStatus: 'upcoming',
            daysUntilDeadline: Math.abs(dayDelta),
            daysFromDeadline: 0,
        };
    }
    if (dayDelta === 0) {
        return {
            timeStatus: 'today',
            daysUntilDeadline: 0,
            daysFromDeadline: 0,
        };
    }
    return {
        timeStatus: 'past_due',
        daysUntilDeadline: 0,
        daysFromDeadline: dayDelta,
    };
};
const distinctTrackPriority = (phases) => {
    const orderedPhases = phases
        .slice()
        .sort((left, right) => {
        if (left.recommendationRole !== right.recommendationRole) {
            return ROLE_PRIORITY[left.recommendationRole] - ROLE_PRIORITY[right.recommendationRole];
        }
        return 0;
    });
    const seen = new Set();
    const priority = [];
    for (const phase of orderedPhases) {
        if (phase.recommendationRole === 'complete' || seen.has(phase.trackId)) {
            continue;
        }
        seen.add(phase.trackId);
        priority.push(phase.trackId);
    }
    return priority;
};
const hashSelectionSeed = (value) => {
    let hash = FNV_OFFSET_BASIS;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, FNV_PRIME);
    }
    return (hash >>> 0) || 1;
};
const roundSelectionMetric = (value) => Number(value.toFixed(4));
const serializeTrackWeights = (candidates) => candidates
    .map((candidate) => (`${candidate.trackId}:${candidate.masteredUnits}/${candidate.totalUnits}:${candidate.weight.toFixed(4)}`))
    .join('|');
export function buildMasteryWeightedTrackWeights(candidates, options = {}) {
    const minimumWeight = Math.max(options.minimumWeight ?? DEFAULT_MASTERY_WEIGHT_FLOOR, 0);
    return candidates.map((candidate) => {
        const totalUnits = Math.max(Math.trunc(candidate.totalUnits), 0);
        const masteredUnits = Math.min(Math.max(Math.trunc(candidate.masteredUnits), 0), totalUnits);
        const masteryRatio = totalUnits <= 0 ? 0 : roundSelectionMetric(masteredUnits / totalUnits);
        const masteryGap = totalUnits <= 0 ? 0 : roundSelectionMetric(1 - masteryRatio);
        return {
            trackId: candidate.trackId,
            masteredUnits,
            totalUnits,
            masteryRatio,
            masteryGap,
            weight: totalUnits <= 0 ? 0 : roundSelectionMetric(Math.max(masteryGap, minimumWeight)),
        };
    });
}
export function pickMasteryWeightedTrack(candidates, options = {}) {
    const weightedCandidates = buildMasteryWeightedTrackWeights(candidates, options);
    const selectableCandidates = weightedCandidates.filter((candidate) => candidate.weight > 0);
    if (selectableCandidates.length === 0) {
        return null;
    }
    const totalWeight = selectableCandidates.reduce((total, candidate) => total + candidate.weight, 0);
    const rng = options.random ?? mulberry32(hashSelectionSeed(`${options.seedKey ?? ''}::${serializeTrackWeights(selectableCandidates)}`));
    const roll = rng() * totalWeight;
    let cursor = 0;
    for (const candidate of selectableCandidates) {
        cursor += candidate.weight;
        if (roll < cursor) {
            return {
                trackId: candidate.trackId,
                totalWeight,
                candidates: weightedCandidates,
            };
        }
    }
    const fallback = selectableCandidates.at(-1);
    if (!fallback)
        return null;
    return {
        trackId: fallback.trackId,
        totalWeight,
        candidates: weightedCandidates,
    };
}
export function resolveGoalLocalDate(now = new Date(), timeZone = 'UTC') {
    const date = now instanceof Date ? now : new Date(now);
    if (Number.isNaN(date.getTime())) {
        throw new Error('resolveGoalLocalDate received an invalid date input');
    }
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;
    if (!year || !month || !day) {
        throw new Error('resolveGoalLocalDate could not resolve a local date');
    }
    return `${year}-${month}-${day}`;
}
export function evaluateGoalPlan(plan, snapshots, context = {}) {
    if (context.localDate) {
        parseGoalLocalDate(context.localDate, 'localDate');
    }
    const phaseIds = new Set();
    for (const phase of plan.phases) {
        if (phaseIds.has(phase.id)) {
            throw new Error(`Duplicate goal phase id: ${phase.id}`);
        }
        phaseIds.add(phase.id);
        if (phase.deadlineLocalDate) {
            parseGoalLocalDate(phase.deadlineLocalDate, 'deadlineLocalDate');
        }
        if (phase.targetCompletedUnits !== undefined) {
            assertNonNegativeInteger(phase.targetCompletedUnits, `targetCompletedUnits for phase ${phase.id}`);
        }
    }
    const snapshotMap = new Map();
    for (const snapshot of snapshots) {
        if (snapshotMap.has(snapshot.phaseId)) {
            throw new Error(`Duplicate goal phase snapshot id: ${snapshot.phaseId}`);
        }
        assertNonNegativeInteger(snapshot.completedUnits, `completedUnits for phase ${snapshot.phaseId}`);
        assertNonNegativeInteger(snapshot.totalUnits, `totalUnits for phase ${snapshot.phaseId}`);
        snapshotMap.set(snapshot.phaseId, snapshot);
    }
    const baseStates = plan.phases.map((phase) => {
        const snapshot = snapshotMap.get(phase.id);
        if (snapshot && snapshot.trackId !== phase.trackId) {
            throw new Error(`Goal phase snapshot track mismatch for phase ${phase.id}`);
        }
        const completedUnits = snapshot?.completedUnits ?? 0;
        const totalUnits = snapshot?.totalUnits ?? 0;
        const targetCompletedUnits = phase.targetCompletedUnits ?? totalUnits;
        const remainingUnits = Math.max(targetCompletedUnits - completedUnits, 0);
        const progressRatio = targetCompletedUnits <= 0
            ? 0
            : Math.min(completedUnits / targetCompletedUnits, 1);
        const isComplete = completedUnits >= targetCompletedUnits;
        const deadlineBehavior = phase.deadlineBehavior ?? DEFAULT_GOAL_DEADLINE_BEHAVIOR;
        const timeStatus = resolveTimeStatus(phase, context);
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
        };
    });
    const firstIncompleteIndex = baseStates.findIndex((phase) => !phase.isComplete);
    let primaryIndex = -1;
    const catchUpIndexes = new Set();
    if (firstIncompleteIndex >= 0) {
        let candidateIndex = firstIncompleteIndex;
        while (candidateIndex >= 0) {
            const candidatePhase = baseStates[candidateIndex];
            if (!candidatePhase) {
                throw new Error('Goal planner could not resolve an incomplete phase');
            }
            const shouldAdvance = (candidatePhase.timeStatus === 'past_due'
                && candidatePhase.deadlineBehavior === 'advance_after_deadline');
            if (!shouldAdvance) {
                primaryIndex = candidateIndex;
                break;
            }
            const nextIncompleteIndex = baseStates.findIndex((phase, index) => (index > candidateIndex && !phase.isComplete));
            if (nextIncompleteIndex < 0) {
                primaryIndex = candidateIndex;
                break;
            }
            catchUpIndexes.add(candidateIndex);
            candidateIndex = nextIncompleteIndex;
        }
    }
    const evaluatedPhases = baseStates.map((phase, index) => {
        if (phase.isComplete) {
            return phase;
        }
        if (index === primaryIndex) {
            return {
                ...phase,
                isActive: true,
                recommendationRole: 'primary',
            };
        }
        if (catchUpIndexes.has(index)) {
            return {
                ...phase,
                recommendationRole: 'catch_up',
            };
        }
        return {
            ...phase,
            recommendationRole: 'queued',
        };
    });
    const activePhase = evaluatedPhases.find((phase) => phase.recommendationRole === 'primary') ?? null;
    return {
        plan,
        localDate: context.localDate ?? null,
        phases: evaluatedPhases,
        activePhase,
        trackPriority: distinctTrackPriority(evaluatedPhases),
    };
}
export function buildGoalPhaseStates(plan, snapshots, context = {}) {
    return evaluateGoalPlan(plan, snapshots, context).phases;
}
export function getActiveGoalPhaseState(phases) {
    return phases.find((phase) => phase.recommendationRole === 'primary') ?? null;
}
export function getGoalTrackPriority(phases) {
    return distinctTrackPriority(phases);
}
//# sourceMappingURL=index.js.map