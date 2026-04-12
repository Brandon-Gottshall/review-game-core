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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function buildPersistenceKey(policy: PersistenceKeyPolicy): string {
  if (!isNonEmptyString(policy.namespace)) {
    throw new Error('policy.namespace must be a non-empty string');
  }

  const separator = policy.separator ?? ':';
  const parts = [policy.namespace.trim(), policy.sessionId?.trim(), policy.suffix?.trim()];

  return parts.filter(isNonEmptyString).join(separator);
}

export function createPersistenceRecord<TValue>(
  key: string,
  value: TValue,
  options: Pick<PersistenceRecord<TValue>, 'source'> & { savedAt?: string } = {}
): PersistenceRecord<TValue> {
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

export function isPersistenceRecord<TValue = unknown>(value: unknown): value is PersistenceRecord<TValue> {
  return isPlainRecord(value)
    && isNonEmptyString(value.key)
    && typeof value.savedAt === 'string'
    && 'value' in value;
}

export function hydratePersistedValue<TValue>(
  value: TValue,
  hydrate?: (value: TValue) => TValue | Promise<TValue>
): TValue | Promise<TValue> {
  return hydrate ? hydrate(value) : value;
}

export function createMemoryPersistenceAdapter<TValue>(
  seed: Record<string, TValue> = {}
): PersistenceAdapter<TValue> & { dump(): Record<string, TValue> } {
  const store = new Map<string, TValue>(Object.entries(seed));

  return {
    read(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    write(record: PersistenceRecord<TValue>) {
      store.set(record.key, record.value);
      return undefined;
    },
    remove(key: string) {
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
