import { PhaseState } from '../scheduler/phase-state.js';
export type ReadinessAttempt = {
    correct: boolean;
    occurredAt: string;
    cadenceDays?: number | null;
};
export type ReadinessComputationInput = {
    unitId: string;
    phase: PhaseState;
    attempts?: readonly ReadinessAttempt[];
    lastPracticedAt?: string | null;
    dueAt?: string | null;
};
export type ReadinessScore = {
    unitId: string;
    score: number;
    phase: PhaseState;
    lastPracticedAt: string | null;
    dueAt: string | null;
};
export declare const computeReadiness: (input: ReadinessComputationInput, now?: Date) => ReadinessScore;
export declare const aggregateReadiness: (children: ReadinessScore[]) => ReadinessScore;
//# sourceMappingURL=index.d.ts.map