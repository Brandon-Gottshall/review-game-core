import { type ReactNode } from 'react';
export type SessionProgressMetric = {
    id: string;
    label: string;
    value: string | number;
    detail?: string;
};
type SessionProgressCardProps = {
    title?: string;
    metrics: readonly SessionProgressMetric[];
    goalHint?: string | null;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    children?: ReactNode;
};
export declare function SessionProgressCard({ title, metrics, goalHint, open, defaultOpen, onOpenChange, className, children, }: SessionProgressCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=session-progress-card.d.ts.map