export type GoalDeadlineBehavior = 'stay_primary_until_complete' | 'advance_after_deadline';
export type GoalTimeStatus = 'none' | 'upcoming' | 'today' | 'past_due';
export type GoalRecommendationRole = 'primary' | 'catch_up' | 'queued' | 'complete';
export interface GoalPhaseDefinition<TTrackId extends string = string> {
    id: string;
    label: string;
    trackId: TTrackId;
    description?: string;
    deadlineLocalDate?: string;
    deadlineBehavior?: GoalDeadlineBehavior;
    targetCompletedUnits?: number;
}
export interface GoalPlan<TTrackId extends string = string> {
    id: string;
    label: string;
    phases: readonly GoalPhaseDefinition<TTrackId>[];
}
export interface GoalPhaseSnapshot<TTrackId extends string = string> {
    phaseId: string;
    trackId: TTrackId;
    completedUnits: number;
    totalUnits: number;
}
export interface GoalEvaluationContext {
    localDate?: string;
}
export interface GoalPhaseState<TTrackId extends string = string> extends GoalPhaseDefinition<TTrackId> {
    completedUnits: number;
    totalUnits: number;
    targetCompletedUnits: number;
    remainingUnits: number;
    progressRatio: number;
    isComplete: boolean;
    isActive: boolean;
    deadlineBehavior: GoalDeadlineBehavior;
    timeStatus: GoalTimeStatus;
    daysUntilDeadline: number | null;
    daysFromDeadline: number | null;
    recommendationRole: GoalRecommendationRole;
}
export interface GoalPlanEvaluation<TTrackId extends string = string> {
    plan: GoalPlan<TTrackId>;
    localDate: string | null;
    phases: GoalPhaseState<TTrackId>[];
    activePhase: GoalPhaseState<TTrackId> | null;
    trackPriority: TTrackId[];
}
export interface MasteryWeightedTrackCandidate<TTrackId extends string = string> {
    trackId: TTrackId;
    masteredUnits: number;
    totalUnits: number;
}
export interface MasteryWeightedTrackWeight<TTrackId extends string = string> extends MasteryWeightedTrackCandidate<TTrackId> {
    masteryRatio: number;
    masteryGap: number;
    weight: number;
}
export interface MasteryWeightedTrackSelection<TTrackId extends string = string> {
    trackId: TTrackId;
    totalWeight: number;
    candidates: MasteryWeightedTrackWeight<TTrackId>[];
}
export declare const DEFAULT_GOAL_DEADLINE_BEHAVIOR: GoalDeadlineBehavior;
export declare const DEFAULT_MASTERY_WEIGHT_FLOOR = 0.15;
export declare function buildMasteryWeightedTrackWeights<TTrackId extends string>(candidates: readonly MasteryWeightedTrackCandidate<TTrackId>[], options?: {
    minimumWeight?: number;
}): MasteryWeightedTrackWeight<TTrackId>[];
export declare function pickMasteryWeightedTrack<TTrackId extends string>(candidates: readonly MasteryWeightedTrackCandidate<TTrackId>[], options?: {
    minimumWeight?: number;
    random?: () => number;
    seedKey?: string;
}): MasteryWeightedTrackSelection<TTrackId> | null;
export declare function resolveGoalLocalDate(now?: Date | number | string, timeZone?: string): string;
export declare function evaluateGoalPlan<TTrackId extends string>(plan: GoalPlan<TTrackId>, snapshots: readonly GoalPhaseSnapshot<TTrackId>[], context?: GoalEvaluationContext): GoalPlanEvaluation<TTrackId>;
export declare function buildGoalPhaseStates<TTrackId extends string>(plan: GoalPlan<TTrackId>, snapshots: readonly GoalPhaseSnapshot<TTrackId>[], context?: GoalEvaluationContext): GoalPhaseState<TTrackId>[];
export declare function getActiveGoalPhaseState<TTrackId extends string>(phases: readonly GoalPhaseState<TTrackId>[]): GoalPhaseState<TTrackId> | null;
export declare function getGoalTrackPriority<TTrackId extends string>(phases: readonly GoalPhaseState<TTrackId>[]): TTrackId[];
//# sourceMappingURL=index.d.ts.map