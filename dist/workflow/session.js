const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_CONTENT_IDENTITY_METADATA_KEY = 'contentIdentity';
/**
 * Normalize a learner identifier to lowercase, trimmed form.
 * Returns an empty string for null/undefined/blank inputs.
 */
export function normalizeLearnerId(value) {
    return value?.trim().toLowerCase() ?? '';
}
/**
 * Returns true when the given value looks like a valid email address.
 * Used to distinguish email-attached learners from anonymous browser IDs.
 */
export function isEmailLearnerId(value) {
    const normalized = normalizeLearnerId(value);
    return normalized.length > 0 && EMAIL_PATTERN.test(normalized);
}
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
function isPlainRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function hasOwnField(record, field) {
    return Object.prototype.hasOwnProperty.call(record, field);
}
function normalizeNullableStringValue(value) {
    if (typeof value !== 'string')
        return null;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
}
function readNullableStringField(record, field) {
    return hasOwnField(record, field) ? normalizeNullableStringValue(record[field]) : undefined;
}
function readContentVersionField(record, field) {
    if (!hasOwnField(record, field)) {
        return undefined;
    }
    const value = record[field];
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    return normalizeNullableStringValue(value);
}
function resolveSessionContentIdentity(value, fallbackQuestionId = null) {
    const record = isPlainRecord(value) ? value : {};
    const questionId = readNullableStringField(record, 'questionId');
    const contentId = readNullableStringField(record, 'contentId');
    const contentVersion = readContentVersionField(record, 'contentVersion');
    return {
        questionId: questionId === undefined ? fallbackQuestionId ?? null : questionId,
        contentId: contentId ?? null,
        contentVersion: contentVersion ?? null,
    };
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
export function readSessionSnapshotContentIdentity(snapshot) {
    return resolveSessionContentIdentity(snapshot.metadata[SESSION_CONTENT_IDENTITY_METADATA_KEY], snapshot.currentQuestionId);
}
export function setSessionSnapshotContentIdentity(snapshot, identity) {
    const resolvedIdentity = resolveSessionContentIdentity(identity, snapshot.currentQuestionId);
    return {
        ...snapshot,
        currentQuestionId: resolvedIdentity.questionId,
        metadata: {
            ...snapshot.metadata,
            [SESSION_CONTENT_IDENTITY_METADATA_KEY]: resolvedIdentity,
        },
    };
}
export function clearSessionSnapshotContentIdentity(snapshot) {
    if (!hasOwnField(snapshot.metadata, SESSION_CONTENT_IDENTITY_METADATA_KEY)) {
        return snapshot;
    }
    const metadata = { ...snapshot.metadata };
    delete metadata[SESSION_CONTENT_IDENTITY_METADATA_KEY];
    return {
        ...snapshot,
        metadata,
    };
}
export function compareSessionSnapshotContentIdentity(snapshot, currentIdentity) {
    const persisted = readSessionSnapshotContentIdentity(snapshot);
    const current = resolveSessionContentIdentity(currentIdentity);
    const mismatchFields = [];
    const unknownFields = [];
    for (const field of ['questionId', 'contentId', 'contentVersion']) {
        const currentValue = current[field];
        if (currentValue === null) {
            continue;
        }
        const persistedValue = persisted[field];
        if (persistedValue === null) {
            unknownFields.push(field);
            continue;
        }
        if (persistedValue !== currentValue) {
            mismatchFields.push(field);
        }
    }
    return {
        matches: mismatchFields.length === 0,
        mismatchFields,
        unknownFields,
        persisted,
        current,
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