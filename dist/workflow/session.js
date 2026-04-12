function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
function isPlainRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function createSessionIdentity(sessionId, options = {}) {
    if (!isNonEmptyString(sessionId)) {
        throw new Error('sessionId must be a non-empty string');
    }
    return {
        sessionId,
        learnerId: options.learnerId ?? null,
        anonymousId: options.anonymousId ?? null,
    };
}
export function buildSessionStorageKey(policy, identity) {
    if (!isNonEmptyString(policy.namespace)) {
        throw new Error('policy.namespace must be a non-empty string');
    }
    if (!isNonEmptyString(identity.sessionId)) {
        throw new Error('identity.sessionId must be a non-empty string');
    }
    const separator = policy.separator ?? ':';
    const parts = [policy.prefix?.trim(), policy.namespace.trim(), identity.sessionId.trim()];
    if (policy.includeLearnerId && isNonEmptyString(identity.learnerId)) {
        parts.push(identity.learnerId.trim());
    }
    if (policy.includeAnonymousId && isNonEmptyString(identity.anonymousId)) {
        parts.push(identity.anonymousId.trim());
    }
    return parts.filter(isNonEmptyString).join(separator);
}
export function createSessionSnapshot(identity, state, options = {}) {
    if (!isNonEmptyString(identity.sessionId)) {
        throw new Error('identity.sessionId must be a non-empty string');
    }
    if (!isPlainRecord(state)) {
        throw new Error('state must be an object');
    }
    const now = options.now ?? new Date().toISOString();
    return {
        version: options.version ?? 1,
        sessionId: identity.sessionId,
        learnerId: identity.learnerId ?? null,
        anonymousId: identity.anonymousId ?? null,
        createdAt: now,
        updatedAt: now,
        route: options.route ?? null,
        currentConceptId: options.currentConceptId ?? null,
        currentQuestionId: options.currentQuestionId ?? null,
        complete: options.complete ?? false,
        state,
        metadata: options.metadata ?? {},
    };
}
export function isSessionSnapshot(value) {
    return isPlainRecord(value)
        && typeof value.version === 'number'
        && isNonEmptyString(value.sessionId)
        && (typeof value.learnerId === 'string' || value.learnerId === null)
        && (typeof value.anonymousId === 'string' || value.anonymousId === null)
        && isNonEmptyString(value.createdAt)
        && isNonEmptyString(value.updatedAt)
        && typeof value.complete === 'boolean'
        && isPlainRecord(value.state)
        && isPlainRecord(value.metadata);
}
export function normalizeSessionSnapshot(value, identity, options = {}) {
    if (isSessionSnapshot(value)) {
        return {
            ...value,
            sessionId: value.sessionId || identity.sessionId,
            learnerId: value.learnerId ?? identity.learnerId ?? null,
            anonymousId: value.anonymousId ?? identity.anonymousId ?? null,
            route: value.route ?? options.route ?? null,
            currentConceptId: value.currentConceptId ?? options.currentConceptId ?? null,
            currentQuestionId: value.currentQuestionId ?? options.currentQuestionId ?? null,
            complete: value.complete ?? options.complete ?? false,
            metadata: value.metadata ?? options.metadata ?? {},
        };
    }
    return createSessionSnapshot(identity, (isPlainRecord(value) && isPlainRecord(value.state) ? value.state : {}), {
        version: options.version,
        route: options.route,
        currentConceptId: options.currentConceptId,
        currentQuestionId: options.currentQuestionId,
        complete: options.complete,
        metadata: options.metadata,
        now: options.now,
    });
}
export function resetSessionSnapshot(snapshot, options = {}) {
    return {
        ...snapshot,
        updatedAt: options.now ?? new Date().toISOString(),
        route: options.route ?? null,
        currentConceptId: options.currentConceptId ?? null,
        currentQuestionId: options.currentQuestionId ?? null,
        complete: options.complete ?? false,
        state: options.state ?? snapshot.state,
        metadata: options.metadata ?? snapshot.metadata,
    };
}
//# sourceMappingURL=session.js.map