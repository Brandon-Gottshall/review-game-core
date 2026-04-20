const PHASE_BASELINES = {
    not_started: 0,
    learning: 42,
    practicing: 68,
    mastered: 92,
    shaky: 34,
    tracked_in_quiz: 28,
};
const clamp = (value, minimum = 0, maximum = 100) => (Math.min(maximum, Math.max(minimum, value)));
const parseDate = (value) => {
    if (!value)
        return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const diffDays = (left, right) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((left.getTime() - right.getTime()) / msPerDay);
};
const scoreAttempts = (attempts) => {
    if (attempts.length === 0)
        return 0;
    const recentAttempts = attempts.slice(-6);
    const correctnessPoints = recentAttempts.reduce((total, attempt) => (total + (attempt.correct ? 1 : 0)), 0) / recentAttempts.length;
    const cadenceSamples = recentAttempts
        .map((attempt) => attempt.cadenceDays)
        .filter((value) => typeof value === 'number' && Number.isFinite(value));
    const cadenceBonus = cadenceSamples.length === 0
        ? 0
        : Math.min(6, cadenceSamples.reduce((total, days) => total + Math.min(days, 4), 0) / cadenceSamples.length);
    return correctnessPoints * 18 + cadenceBonus;
};
const scoreRecency = (lastPracticedAt, dueAt, now) => {
    const practiced = parseDate(lastPracticedAt);
    const due = parseDate(dueAt);
    let total = 0;
    if (practiced) {
        const days = diffDays(now, practiced);
        if (days <= 2)
            total += 6;
        else if (days <= 7)
            total += 2;
        else if (days <= 14)
            total -= 4;
        else
            total -= 8;
    }
    if (due) {
        const daysUntilDue = diffDays(due, now);
        if (daysUntilDue < 0)
            total -= 10;
        else if (daysUntilDue <= 2)
            total -= 4;
    }
    return total;
};
const deriveAggregatePhase = (children, score) => {
    if (children.length === 0)
        return 'not_started';
    if (children.every((child) => child.phase === 'mastered'))
        return 'mastered';
    if (children.some((child) => child.phase === 'shaky') && score < 70)
        return 'shaky';
    if (score >= 60)
        return 'practicing';
    if (score >= 35)
        return children.some((child) => child.phase === 'tracked_in_quiz')
            ? 'learning'
            : 'learning';
    if (children.some((child) => child.phase === 'tracked_in_quiz'))
        return 'tracked_in_quiz';
    return 'not_started';
};
const latestIso = (values) => ([...values].sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null);
const earliestIso = (values) => ([...values].sort((left, right) => new Date(left).getTime() - new Date(right).getTime())[0] ?? null);
export const computeReadiness = (input, now = new Date()) => {
    const attempts = input.attempts ?? [];
    const score = clamp(PHASE_BASELINES[input.phase]
        + scoreAttempts(attempts)
        + scoreRecency(input.lastPracticedAt ?? null, input.dueAt ?? null, now));
    return {
        unitId: input.unitId,
        score: Math.round(score),
        phase: input.phase,
        lastPracticedAt: input.lastPracticedAt ?? null,
        dueAt: input.dueAt ?? null,
    };
};
export const aggregateReadiness = (children) => {
    if (children.length === 0) {
        return {
            unitId: 'aggregate',
            score: 0,
            phase: 'not_started',
            lastPracticedAt: null,
            dueAt: null,
        };
    }
    const score = Math.round(children.reduce((total, child) => total + child.score, 0) / children.length);
    const lastPracticedValues = children
        .map((child) => child.lastPracticedAt)
        .filter((value) => Boolean(value));
    const dueValues = children
        .map((child) => child.dueAt)
        .filter((value) => Boolean(value));
    return {
        unitId: children[0].unitId,
        score,
        phase: deriveAggregatePhase(children, score),
        lastPracticedAt: latestIso(lastPracticedValues),
        dueAt: earliestIso(dueValues),
    };
};
//# sourceMappingURL=index.js.map