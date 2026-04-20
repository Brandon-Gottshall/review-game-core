export interface SessionIdentity {
    sessionId: string;
    learnerId?: string | null;
    anonymousId?: string | null;
}
export interface SessionStoragePolicy {
    namespace: string;
    prefix?: string;
    separator?: string;
    includeLearnerId?: boolean;
    includeAnonymousId?: boolean;
}
export interface SessionSnapshot<TState extends Record<string, unknown> = Record<string, unknown>> {
    version: number;
    sessionId: string;
    learnerId: string | null;
    anonymousId: string | null;
    createdAt: string;
    updatedAt: string;
    route: string | null;
    currentConceptId: string | null;
    currentQuestionId: string | null;
    complete: boolean;
    state: TState;
    metadata: Record<string, unknown>;
}
export type SessionContentVersion = string | number;
export interface SessionContentIdentity {
    questionId?: string | null;
    contentId?: string | null;
    contentVersion?: SessionContentVersion | null;
}
export interface ResolvedSessionContentIdentity {
    questionId: string | null;
    contentId: string | null;
    contentVersion: SessionContentVersion | null;
}
export type SessionContentIdentityField = keyof ResolvedSessionContentIdentity;
export interface SessionContentIdentityComparison {
    matches: boolean;
    mismatchFields: SessionContentIdentityField[];
    unknownFields: SessionContentIdentityField[];
    persisted: ResolvedSessionContentIdentity;
    current: ResolvedSessionContentIdentity;
}
export interface SessionSnapshotFactoryOptions {
    version?: number;
    route?: string | null;
    currentConceptId?: string | null;
    currentQuestionId?: string | null;
    complete?: boolean;
    metadata?: Record<string, unknown>;
    now?: string;
}
/**
 * Normalize a learner identifier to lowercase, trimmed form.
 * Returns an empty string for null/undefined/blank inputs.
 */
export declare function normalizeLearnerId(value?: string | null): string;
/**
 * Returns true when the given value looks like a valid email address.
 * Used to distinguish email-attached learners from anonymous browser IDs.
 */
export declare function isEmailLearnerId(value?: string | null): boolean;
export declare function createSessionIdentity(sessionId: string, options?: Pick<SessionIdentity, 'learnerId' | 'anonymousId'>): SessionIdentity;
export declare function buildSessionStorageKey(policy: SessionStoragePolicy, identity: SessionIdentity): string;
export declare function createSessionSnapshot<TState extends Record<string, unknown> = Record<string, unknown>>(identity: SessionIdentity, state: TState, options?: SessionSnapshotFactoryOptions): SessionSnapshot<TState>;
export declare function readSessionSnapshotContentIdentity<TState extends Record<string, unknown> = Record<string, unknown>>(snapshot: Pick<SessionSnapshot<TState>, 'currentQuestionId' | 'metadata'>): ResolvedSessionContentIdentity;
export declare function setSessionSnapshotContentIdentity<TState extends Record<string, unknown> = Record<string, unknown>>(snapshot: SessionSnapshot<TState>, identity: SessionContentIdentity): SessionSnapshot<TState>;
export declare function clearSessionSnapshotContentIdentity<TState extends Record<string, unknown> = Record<string, unknown>>(snapshot: SessionSnapshot<TState>): SessionSnapshot<TState>;
export declare function compareSessionSnapshotContentIdentity<TState extends Record<string, unknown> = Record<string, unknown>>(snapshot: Pick<SessionSnapshot<TState>, 'currentQuestionId' | 'metadata'>, currentIdentity: SessionContentIdentity): SessionContentIdentityComparison;
export declare function isSessionSnapshot<TState extends Record<string, unknown> = Record<string, unknown>>(value: unknown): value is SessionSnapshot<TState>;
export declare function normalizeSessionSnapshot<TState extends Record<string, unknown> = Record<string, unknown>>(value: unknown, identity: SessionIdentity, options?: Partial<SessionSnapshotFactoryOptions>): SessionSnapshot<TState>;
export declare function resetSessionSnapshot<TState extends Record<string, unknown> = Record<string, unknown>>(snapshot: SessionSnapshot<TState>, options?: {
    route?: string | null;
    currentConceptId?: string | null;
    currentQuestionId?: string | null;
    complete?: boolean;
    state?: TState;
    metadata?: Record<string, unknown>;
    now?: string;
}): SessionSnapshot<TState>;
//# sourceMappingURL=session.d.ts.map