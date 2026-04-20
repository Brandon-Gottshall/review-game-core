export type CramState = 'idle' | 'running' | 'urgent' | 'complete';
export type CramSession = {
    state: CramState;
    durationMs: number;
    startedAt: string | null;
    endsAt: string | null;
    examId: string;
};
export declare const CRAM_DURATION_PRESETS_MS: readonly [number, number, number];
export declare const CRAM_URGENT_THRESHOLD_MS: number;
export declare const createIdleCramSession: (examId: string) => CramSession;
export declare const startCramSession: (examId: string, durationMs: number, now?: Date) => CramSession;
export declare const tickCramSession: (session: CramSession, now: Date) => CramSession;
//# sourceMappingURL=cram-mode.d.ts.map