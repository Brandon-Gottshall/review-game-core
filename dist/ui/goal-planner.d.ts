import type { ReactNode } from 'react';
export type GoalPlannerUnitOption = {
    id: string;
    label: string;
    checked: boolean;
    savedScore?: string | number;
    detail?: string;
};
type ReadinessFloorInputProps = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};
export declare function ReadinessFloorInput({ value, onChange, className }: ReadinessFloorInputProps): import("react/jsx-runtime").JSX.Element;
type DeadlinePickerProps = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};
export declare function DeadlinePicker({ value, onChange, className }: DeadlinePickerProps): import("react/jsx-runtime").JSX.Element;
type UnitCheckboxListProps = {
    units: readonly GoalPlannerUnitOption[];
    onToggle: (unitId: string) => void;
    onSavedScoreChange?: (unitId: string, value: string) => void;
    className?: string;
};
export declare function UnitCheckboxList({ units, onToggle, onSavedScoreChange, className, }: UnitCheckboxListProps): import("react/jsx-runtime").JSX.Element;
type GoalPlannerCardProps = {
    readinessTarget: string;
    deadline: string;
    units: readonly GoalPlannerUnitOption[];
    activeSummary?: string | null;
    message?: string | null;
    liveRecommendation?: ReactNode;
    className?: string;
    onReadinessTargetChange: (value: string) => void;
    onDeadlineChange: (value: string) => void;
    onToggleUnit: (unitId: string) => void;
    onSavedScoreChange?: (unitId: string, value: string) => void;
    onSave: () => void;
    onClear: () => void;
};
export declare function GoalPlannerCard({ readinessTarget, deadline, units, activeSummary, message, liveRecommendation, className, onReadinessTargetChange, onDeadlineChange, onToggleUnit, onSavedScoreChange, onSave, onClear, }: GoalPlannerCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=goal-planner.d.ts.map