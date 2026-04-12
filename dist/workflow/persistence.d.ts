export interface PersistenceRecord<TValue = unknown> {
    key: string;
    value: TValue;
    savedAt: string;
    source?: 'local' | 'remote';
}
export interface PersistenceAdapter<TValue = unknown> {
    read(key: string): TValue | null | Promise<TValue | null>;
    write(record: PersistenceRecord<TValue>): void | Promise<void>;
    remove(key: string): void | Promise<void>;
    flush?: () => void | Promise<void>;
    syncRemote?: (record: PersistenceRecord<TValue>) => void | Promise<void>;
    hydrate?: (value: TValue) => TValue | Promise<TValue>;
}
export interface PersistenceKeyPolicy {
    namespace: string;
    sessionId?: string;
    separator?: string;
    suffix?: string;
}
export declare function buildPersistenceKey(policy: PersistenceKeyPolicy): string;
export declare function createPersistenceRecord<TValue>(key: string, value: TValue, options?: Pick<PersistenceRecord<TValue>, 'source'> & {
    savedAt?: string;
}): PersistenceRecord<TValue>;
export declare function isPersistenceRecord<TValue = unknown>(value: unknown): value is PersistenceRecord<TValue>;
export declare function hydratePersistedValue<TValue>(value: TValue, hydrate?: (value: TValue) => TValue | Promise<TValue>): TValue | Promise<TValue>;
export declare function createMemoryPersistenceAdapter<TValue>(seed?: Record<string, TValue>): PersistenceAdapter<TValue> & {
    dump(): Record<string, TValue>;
};
//# sourceMappingURL=persistence.d.ts.map