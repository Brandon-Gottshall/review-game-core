import type { ReactNode } from 'react';
import type { GoalPhaseState } from '../goal/index.js';
export type GoalRoadmapTrackLabelResolver<TTrackId extends string = string> = (trackId: TTrackId, phase: GoalPhaseState<TTrackId>) => string;
export type GoalRoadmapCardProps<TTrackId extends string = string> = {
    title?: string;
    phases: readonly GoalPhaseState<TTrackId>[];
    summary?: string | null;
    emptyMessage?: string;
    className?: string;
    getTrackLabel?: GoalRoadmapTrackLabelResolver<TTrackId>;
    renderPhaseSupplement?: (phase: GoalPhaseState<TTrackId>) => ReactNode;
};
export declare function GoalRoadmapCard<TTrackId extends string = string>({ title, phases, summary, emptyMessage, className, getTrackLabel, renderPhaseSupplement, }: GoalRoadmapCardProps<TTrackId>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=goal-roadmap.d.ts.map