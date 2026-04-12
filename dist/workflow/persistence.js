function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
function isPlainRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function buildPersistenceKey(policy) {
    if (!isNonEmptyString(policy.namespace)) {
        throw new Error('policy.namespace must be a non-empty string');
    }
    const separator = policy.separator ?? ':';
    const parts = [policy.namespace.trim(), policy.sessionId?.trim(), policy.suffix?.trim()];
    return parts.filter(isNonEmptyString).join(separator);
}
export function createPersistenceRecord(key, value, options = {}) {
    if (!isNonEmptyString(key)) {
        throw new Error('key must be a non-empty string');
    }
    return {
        key,
        value,
        savedAt: options.savedAt ?? new Date().toISOString(),
        source: options.source,
    };
}
export function isPersistenceRecord(value) {
    return isPlainRecord(value)
        && isNonEmptyString(value.key)
        && typeof value.savedAt === 'string'
        && 'value' in value;
}
export function hydratePersistedValue(value, hydrate) {
    return hydrate ? hydrate(value) : value;
}
export function createMemoryPersistenceAdapter(seed = {}) {
    const store = new Map(Object.entries(seed));
    return {
        read(key) {
            return store.has(key) ? store.get(key) : null;
        },
        write(record) {
            store.set(record.key, record.value);
            return undefined;
        },
        remove(key) {
            store.delete(key);
            return undefined;
        },
        flush() {
            return undefined;
        },
        dump() {
            return Object.fromEntries(store.entries());
        },
    };
}
//# sourceMappingURL=persistence.js.map