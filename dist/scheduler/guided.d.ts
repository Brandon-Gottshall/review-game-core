import { type ConceptScheduleState, type PracticeOutcome, type SchedulerPolicy, type SubskillUpdate } from './base.js';
export type RepetitionPhase = 'light' | 'hard' | 'recovery-light';
export type RecoverySupportMode = 'none' | 'same-concept-recovery' | 'support-concept-recovery';
export type ConceptSelectionReason = 'new_concept' | 'guided_mastery' | 'recovery_due' | 'retention_due' | `weakest_subskill:${string}`;
export interface GuidedConceptProgressState<TSubskill extends string = string> extends ConceptScheduleState<TSubskill> {
    lightPassCount: number;
    hardPassCount: number;
    recoveryLightRemaining: number;
    recoverySupportMode: RecoverySupportMode;
}
export type GuidedConceptProgressMap<TSubskill extends string = string> = Record<string, GuidedConceptProgressState<TSubskill>>;
export interface ConceptRepetitionPlan {
    repPhase: RepetitionPhase;
    repIndex: 1 | 2 | 3 | 4 | 5 | 6;
    supportMode: RecoverySupportMode;
    hardAttemptLimit: number | null;
}
export type ConceptStateBadge = 'Emerging' | 'Supported' | 'Independent' | 'Mastered' | 'Retention due' | 'Recovery due';
export type GuidedLearnerEvidence = 'none' | 'supported' | 'independent' | 'mastered' | 'retention_due' | 'recovery_due';
export interface GuidedConceptProgressSummary<TSubskill extends string = string> extends ConceptRepetitionPlan {
    conceptId: string;
    badge: ConceptStateBadge;
    learnerEvidence: GuidedLearnerEvidence;
    learnerLabel: string;
    learnerReason: string;
    lightPassCount: number;
    hardPassCount: number;
    independentPassCount: number;
    supportedPassCount: number;
    recoveryLightRemaining: number;
    recoverySupportMode: RecoverySupportMode;
    retentionDue: boolean;
    mastered: boolean;
    preferredSubskills: TSubskill[];
}
export declare const LIGHT_REP_TARGET = 4;
export declare const HARD_REP_TARGET = 2;
export declare const HARD_ATTEMPT_LIMIT = 3;
export declare const HARD_FAILURE_RECOVERY_LIGHTS = 2;
export declare function buildInitialGuidedConceptProgress<TSubskill extends string = string>(conceptIds: readonly string[], policy?: SchedulerPolicy<TSubskill>): GuidedConceptProgressMap<TSubskill>;
export declare function mergeGuidedConceptProgress<TSubskill extends string = string>(conceptIds: readonly string[], stored: unknown, policy?: SchedulerPolicy<TSubskill>): GuidedConceptProgressMap<TSubskill>;
export declare function getConceptRepetitionPlan<TSubskill extends string = string>(concept: GuidedConceptProgressState<TSubskill> | undefined): ConceptRepetitionPlan;
export declare function applyGuidedConceptOutcome<TSubskill extends string = string>(progressMap: GuidedConceptProgressMap<TSubskill>, conceptId: string, outcome: PracticeOutcome, currentTurn: number, options?: {
    policy?: SchedulerPolicy<TSubskill>;
    subskillUpdates?: readonly SubskillUpdate<TSubskill>[];
    phase?: RepetitionPhase;
    recoverySupportMode?: RecoverySupportMode;
}): GuidedConceptProgressMap<TSubskill>;
export declare function applySupplementalGuidedConceptExposure<TSubskill extends string = string>(progressMap: GuidedConceptProgressMap<TSubskill>, conceptId: string, currentTurn: number, options?: {
    subskillUpdates?: readonly SubskillUpdate<TSubskill>[];
    wasClean?: boolean;
}): GuidedConceptProgressMap<TSubskill>;
export declare function pickNextGuidedConceptId<TSubskill extends string = string>(progressMap: GuidedConceptProgressMap<TSubskill>, nextTurn: number, options?: {
    policy?: SchedulerPolicy<TSubskill>;
    isEligible?: (conceptId: string, progressMap: GuidedConceptProgressMap<TSubskill>) => boolean;
}): string;
export declare function getWeakestSubskills<TSubskill extends string = string>(concept: GuidedConceptProgressState<TSubskill> | undefined, limit?: number): TSubskill[];
export declare function getPreferredSubskillsForConceptSelection<TSubskill extends string = string>(concept: GuidedConceptProgressState<TSubskill> | undefined, currentTurn: number): TSubskill[];
export declare function getConceptSelectionReason<TSubskill extends string = string>(concept: GuidedConceptProgressState<TSubskill> | undefined, currentTurn: number, preferredSubskills?: readonly TSubskill[]): ConceptSelectionReason;
export declare function getConceptStateBadge<TSubskill extends string = string>(concept: GuidedConceptProgressState<TSubskill> | undefined, currentTurn: number): ConceptStateBadge;
export declare function summarizeGuidedConceptProgress<TSubskill extends string = string>(concept: GuidedConceptProgressState<TSubskill> | undefined, currentTurn: number, options?: {
    policy?: SchedulerPolicy<TSubskill>;
    preferredSubskills?: readonly TSubskill[];
}): GuidedConceptProgressSummary<TSubskill> | null;
export declare function normalizeSelectionReason(reason?: string | null): ConceptSelectionReason;
//# sourceMappingURL=guided.d.ts.map