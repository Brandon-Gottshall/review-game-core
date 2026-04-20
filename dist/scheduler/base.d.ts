/**
 * Generic concept scheduler for review games.
 *
 * The scheduler tracks concept-level progress, spaces independent passes,
 * keeps struggling concepts near the front of the queue, and preserves enough
 * state for consumers to serialize and rehydrate safely.
 */
export type PracticeOutcome = 'independent_correct' | 'supported_correct' | 'assisted' | 'skipped';
export interface SubskillProgressState {
    attempts: number;
    cleanPasses: number;
    supportedPasses: number;
    misses: number;
    lastMissedTurn: number | null;
}
export type SubskillProgressMap<TSubskill extends string = string> = Record<string, SubskillProgressState> & Record<TSubskill, SubskillProgressState>;
export interface SubskillUpdate<TSubskill extends string = string> {
    subskill: TSubskill;
    attempts: number;
    cleanPasses: number;
    supportedPasses: number;
    misses: number;
    lastMissedTurn: number | null;
}
export interface SchedulerPolicyConfig<TSubskill extends string = string> {
    masteryTarget?: number;
    independentGaps?: readonly number[];
    supportedGap?: number;
    failureGap?: number;
    subskillIds?: readonly TSubskill[];
}
export interface SchedulerPolicy<TSubskill extends string = string> {
    masteryTarget: number;
    independentGaps: readonly number[];
    supportedGap: number;
    failureGap: number;
    subskillIds: readonly TSubskill[];
}
export interface ConceptScheduleState<TSubskill extends string = string> {
    conceptId: string;
    independentPassCount: number;
    supportedPassCount: number;
    nextEligibleTurn: number;
    lastSeenTurn: number | null;
    attempts: number;
    supplementalExposureCount: number;
    assistedCount: number;
    skippedCount: number;
    recentStruggleCount: number;
    recoveryDue: boolean;
    retentionCheckEligibleTurn: number | null;
    retentionCheckPassed: boolean;
    mastered: boolean;
    lastOutcome: PracticeOutcome | null;
    subskillStats: SubskillProgressMap<TSubskill>;
}
export type ConceptScheduleMap<TSubskill extends string = string> = Record<string, ConceptScheduleState<TSubskill>>;
export declare const DEFAULT_MASTERY_TARGET = 3;
export declare const DEFAULT_INDEPENDENT_GAPS: readonly [2, 5, 8];
export declare const DEFAULT_SUPPORTED_GAP = 1;
export declare const DEFAULT_FAILURE_GAP = 1;
export declare function createSchedulerPolicy<TSubskill extends string = string>(config?: SchedulerPolicyConfig<TSubskill>): SchedulerPolicy<TSubskill>;
export declare function buildInitialConceptSchedule<TSubskill extends string = string>(conceptIds: readonly string[], policy?: SchedulerPolicy<TSubskill>): ConceptScheduleMap<TSubskill>;
export declare function mergeConceptSchedule<TSubskill extends string = string>(conceptIds: readonly string[], stored: unknown, policy?: SchedulerPolicy<TSubskill>): ConceptScheduleMap<TSubskill>;
export declare function isConceptMastered<TSubskill extends string = string>(concept: ConceptScheduleState<TSubskill> | undefined, policy?: SchedulerPolicy<TSubskill>): boolean;
export declare function isRetentionDue<TSubskill extends string = string>(concept: ConceptScheduleState<TSubskill> | undefined, currentTurn: number, policy?: SchedulerPolicy<TSubskill>): boolean;
export declare function applyConceptOutcome<TSubskill extends string = string>(progressMap: ConceptScheduleMap<TSubskill>, conceptId: string, outcome: PracticeOutcome, currentTurn: number, options?: {
    policy?: SchedulerPolicy<TSubskill>;
    subskillUpdates?: readonly SubskillUpdate<TSubskill>[];
}): ConceptScheduleMap<TSubskill>;
export declare function applySupplementalConceptExposure<TSubskill extends string = string>(progressMap: ConceptScheduleMap<TSubskill>, conceptId: string, currentTurn: number, options?: {
    policy?: SchedulerPolicy<TSubskill>;
    subskillUpdates?: readonly SubskillUpdate<TSubskill>[];
    wasClean?: boolean;
}): ConceptScheduleMap<TSubskill>;
export declare function pickNextConceptId<TSubskill extends string = string>(progressMap: ConceptScheduleMap<TSubskill>, nextTurn: number, options?: {
    policy?: SchedulerPolicy<TSubskill>;
    isEligible?: (conceptId: string, progressMap: ConceptScheduleMap<TSubskill>) => boolean;
}): string;
//# sourceMappingURL=base.d.ts.map